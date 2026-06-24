/* =========================================================================
   Ararat – Karten-App
   Datenanbindung (Phase 0) + Stapel-Ansicht (Phase 1).

   Lädt karten-app/ararat-board.json per fetch, baut intern ein Datenmodell
   und zeigt vier Bereichskarten von oben (Bereichsfarbe + Symbol-Wasserzeichen,
   keine Texte). Einstellungs-Icon vorhanden; sein Menü kommt in Phase 5.
   Das Antippen einer Karte zum Ziehen folgt in Phase 2.
   Kein Framework, alles aus der JSON, nichts fest verdrahtet.
   ========================================================================= */

(() => {
  "use strict";

  const DATEN_URL = "ararat-board.json";
  const SVG_NS = "http://www.w3.org/2000/svg";
  const AUDIO_LANG = "kmr"; // Audiosprache (Kurmancî); umschaltbar in Phase 5

  /* Bereichssymbole als SVG-Pfade, identisch zur Simulation
     (Koordinatensystem etwa -6 … 6, Mittelpunkt im Ursprung). */
  const SYMBOLE = {
    haus:  "M-5 1 L0 -4.6 L5 1 L5 5 L1.6 5 L1.6 1.8 L-1.6 1.8 L-1.6 5 L-5 5 Z",
    schaf: "M-4.6 0.4 A2.1 2.1 0 1 1 -2.4 -2.6 A2.4 2.4 0 1 1 1 -3 A2.2 2.2 0 1 1 4 -0.6 A2 2 0 1 1 2.6 2.6 L2.6 5 L1.2 5 L1.2 3.1 L-2.4 3.1 L-2.4 5 L-3.8 5 L-3.8 2.4 A2.2 2.2 0 0 1 -4.6 0.4 Z",
    tor:   "M-5 5 L-5 -1.4 A5 5 0 0 1 5 -1.4 L5 5 L2.2 5 L2.2 0 A2.2 2.6 0 0 0 -2.2 0 L-2.2 5 Z",
    berg:  "M-5.6 5 L-1.4 -2.8 L0.4 0.2 L2.4 -4.8 L5.6 5 Z M2.4 -4.8 L3.4 -1.7 L1.5 -2.1 L0.4 0.2 L2.4 -4.8 Z"
  };

  const Modell = {
    roh: null,
    meta: null,
    dice: null,
    bereiche: [],
    bereichNachId: {},
    kartenNachBereich: {}
  };

  /* ---------- Laden ---------- */

  async function ladeBrett() {
    const res = await fetch(DATEN_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} beim Laden von ${DATEN_URL}`);
    let daten;
    try {
      daten = await res.json();
    } catch (e) {
      throw new Error("Die Datei ararat-board.json ist kein gültiges JSON.");
    }
    baueModell(daten);
    return Modell;
  }

  function baueModell(daten) {
    if (!daten || typeof daten !== "object") {
      throw new Error("Brettdaten haben ein unerwartetes Format.");
    }
    const zones = Array.isArray(daten.zones) ? daten.zones : [];
    const cards = Array.isArray(daten.cards) ? daten.cards : [];
    if (zones.length === 0) {
      throw new Error("In den Brettdaten sind keine Bereiche (zones) angelegt.");
    }
    Modell.roh = daten;
    Modell.meta = daten.meta || {};
    Modell.dice = daten.dice || null;
    Modell.bereiche = zones.slice();
    Modell.bereichNachId = {};
    Modell.kartenNachBereich = {};
    for (const z of zones) {
      Modell.bereichNachId[z.id] = z;
      Modell.kartenNachBereich[z.id] = [];
    }
    for (const k of cards) {
      if (Modell.kartenNachBereich[k.bereich]) Modell.kartenNachBereich[k.bereich].push(k);
    }
  }

  /* ---------- Helfer ---------- */

  function istHell(hex) {
    if (typeof hex !== "string") return false;
    const m = hex.replace("#", "");
    if (m.length !== 6) return false;
    const r = parseInt(m.slice(0, 2), 16);
    const g = parseInt(m.slice(2, 4), 16);
    const b = parseInt(m.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.7;
  }

  function symbolSvg(name, klasse, viewBox) {
    const pfad = SYMBOLE[name] || SYMBOLE.berg;
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", viewBox || "-6 -6 12 12");
    svg.setAttribute("class", klasse);
    svg.setAttribute("aria-hidden", "true");
    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", pfad);
    svg.appendChild(p);
    return svg;
  }

  /* ---------- Anzeige ---------- */

  function zeigeFehler(message) {
    const el = document.getElementById("status");
    el.className = "status ist-fehler";
    el.innerHTML = "";
    const box = document.createElement("div");
    box.className = "status-box";
    const h = document.createElement("h2");
    h.textContent = "Brettdaten nicht ladbar";
    const p = document.createElement("p");
    p.innerHTML =
      `Erwartet wird die Datei <code>ararat-board.json</code> neben dieser Seite. ` +
      `Prüfe, ob sie im Repo liegt und GitHub Pages neu gebaut hat.<br>Grund: ${message}`;
    box.appendChild(h);
    box.appendChild(p);
    el.appendChild(box);
  }

  function zeigeStapel() {
    // Bereichsfarben aus der JSON als CSS-Variablen verfügbar machen
    const wurzel = document.documentElement;
    for (const z of Modell.bereiche) {
      if (z.color) wurzel.style.setProperty(`--${z.id}`, z.color);
    }

    // Status ausblenden, Stapel einblenden
    document.getElementById("status").hidden = true;
    const stapel = document.getElementById("stapel");
    stapel.hidden = false;
    stapel.innerHTML = "";

    for (const z of Modell.bereiche) {
      const karte = document.createElement("button");
      karte.type = "button";
      karte.className = "karte" + (istHell(z.color) ? " ist-hell" : "");
      karte.style.setProperty("--bf", z.color || "#ccc");
      karte.setAttribute("aria-label", z.name || z.id);
      karte.dataset.bereich = z.id;
      karte.appendChild(symbolSvg(z.symbol, "karte-symbol"));
      karte.addEventListener("click", () => zieheUndOeffne(z.id));
      stapel.appendChild(karte);
    }
  }

  /* ---------- Effekt-Anzeige (Phase 4) ---------- */

  /* Eck-Symbole als SVG-Pfade im selben Koordinatensystem wie die
     Bereichssymbole (viewBox -6 … 6). Bewusst schlicht und gut lesbar. */
  const EFFEKT_SYMBOLE = {
    pfeil_vor:   "M-4.5 0 L2.5 0 M-0.5 -3.5 L3 0 L-0.5 3.5",      // nach rechts
    pfeil_zur:   "M4.5 0 L-2.5 0 M0.5 -3.5 L-3 0 L0.5 3.5",       // nach links
    pause:       "M-2.4 -3.6 L-2.4 3.6 M2.4 -3.6 L2.4 3.6",       // zwei Balken
    erneut:      "M3 -1.6 A4 4 0 1 0 4 1.6 M3 -1.6 L4.3 -2 M3 -1.6 L3.4 -3", // Kreispfeil
    pfeil_naechst: "M-4 0 L2 0 M-0.8 -3 L2.2 0 L-0.8 3 M3.4 -3.4 L3.4 3.4",  // Pfeil + Wand
    tausch:      "M-4 -1.6 L3 -1.6 M0 -4.1 L3.4 -1.6 L0 0.9 M4 1.6 L-3 1.6 M0 -0.9 L-3.4 1.6 L0 4.1" // Doppelpfeil
  };

  /* Ableitung aus typ + wert: liefert Symbolname und kurzes Label.
     Unbekannte typ-Werte ergeben keine Anzeige (null). */
  function effektInfo(karte) {
    const typ = (karte && karte.typ) || "";
    const wertRoh = karte && karte.wert;
    const n = (wertRoh === 0 || wertRoh) ? String(wertRoh).trim() : "";
    switch (typ) {
      case "vorwaerts":
        return { symbol: "pfeil_vor", label: n ? `+${n} vor` : "vor" };
      case "rueckwaerts":
        return { symbol: "pfeil_zur", label: n ? `−${n} zurück` : "zurück" };
      case "aussetzen":
        return { symbol: "pause", label: "aussetzen" };
      case "erneut":
        return { symbol: "erneut", label: "nochmal würfeln" };
      case "vor_zu_naechstem":
        return { symbol: "pfeil_naechst", label: "vor zum nächsten Feld" };
      case "tausch_fuehrender":
        return { symbol: "tausch", label: "Tausch mit Führendem" };
      case "tausch_hinterster":
        return { symbol: "tausch", label: "Tausch mit Letztem" };
      default:
        return null;
    }
  }

  function effektSymbolSvg(name, klasse) {
    const pfad = EFFEKT_SYMBOLE[name];
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "-6 -6 12 12");
    svg.setAttribute("class", klasse);
    svg.setAttribute("aria-hidden", "true");
    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", pfad || "");
    svg.appendChild(p);
    return svg;
  }

  // Effekt-Anzeige aufbauen; ohne erkennbaren Effekt bleibt die Ecke leer.
  function zeigeEffekt(karte) {
    const box = document.getElementById("effekt");
    if (!box) return;
    box.innerHTML = "";
    const info = effektInfo(karte);
    if (!info) { box.hidden = true; return; }
    box.appendChild(effektSymbolSvg(info.symbol, "effekt-symbol"));
    const span = document.createElement("span");
    span.className = "effekt-label";
    span.textContent = info.label;
    box.appendChild(span);
    box.hidden = false;
  }

  function verbergeEffekt() {
    const box = document.getElementById("effekt");
    if (box) { box.hidden = true; box.innerHTML = ""; }
  }

  /* ---------- Audio (Phase 3) ---------- */

  let audioEl = null;

  function holeAudio() {
    if (!audioEl) {
      audioEl = new Audio();
      audioEl.preload = "auto";
    }
    return audioEl;
  }

  // Pfad nach Konvention; ein gesetztes audio-Feld hat Vorrang.
  function audioUrl(karte) {
    if (karte.audio && String(karte.audio).trim()) return String(karte.audio).trim();
    return `audio/${karte.id}_${AUDIO_LANG}.mp3`;
  }

  function setzeWiederhol(sichtbar) {
    const b = document.getElementById("btnWiederhol");
    if (b) b.hidden = !sichtbar;
  }

  // Spielt das Karten-Audio ab, falls vorhanden. Existiert keine Datei,
  // bleibt es still und der Wiederhol-Button erscheint nicht.
  function spieleKartenAudio(karte) {
    const a = holeAudio();
    setzeWiederhol(false);
    try { a.pause(); } catch (e) { /* egal */ }
    a.oncanplay = () => setzeWiederhol(true);
    a.onerror = () => setzeWiederhol(false);
    a.src = audioUrl(karte);
    try { a.currentTime = 0; } catch (e) { /* egal */ }
    const p = a.play();
    // Autoplay kann blockiert sein; der Button (via oncanplay) erlaubt dann
    // das manuelle Abspielen.
    if (p && typeof p.catch === "function") p.catch(() => {});
  }

  function wiederholeAudio() {
    const a = holeAudio();
    try {
      a.currentTime = 0;
      const p = a.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch (e) { /* egal */ }
  }

  function stoppeAudio() {
    if (!audioEl) return;
    try { audioEl.pause(); } catch (e) { /* egal */ }
    setzeWiederhol(false);
  }

  /* ---------- Karte ziehen & öffnen (Phase 2) ---------- */

  let detailOffen = false;

  function kartenText(karte) {
    // Phase 2: zunächst Deutsch als Vorgabe, mit Fallback.
    return (karte.text_de || karte.text_kmr || karte.text_tr || "").trim() || "—";
  }

  function zieheUndOeffne(bereichId) {
    if (detailOffen) return;
    const liste = Modell.kartenNachBereich[bereichId] || [];
    if (liste.length === 0) return;
    const karte = liste[Math.floor(Math.random() * liste.length)];
    const zone = Modell.bereichNachId[bereichId];
    oeffneDetail(karte, zone);
  }

  function oeffneDetail(karte, zone) {
    const detail = document.getElementById("detail");
    const inhalt = document.getElementById("detailInhalt");
    detail.classList.remove("schliesst");
    detail.classList.toggle("ist-hell", istHell(zone && zone.color));
    detail.style.setProperty("--bf", (zone && zone.color) || "#345");

    inhalt.innerHTML = "";
    const sym = symbolSvg(zone ? zone.symbol : "berg", "detail-symbol", "-7.5 -7.5 15 15");
    detail.insertBefore(sym, inhalt);
    // altes Symbol (falls vorhanden) entfernen
    const syms = detail.querySelectorAll(".detail-symbol");
    for (let i = 0; i < syms.length - 1; i++) syms[i].remove();

    const text = document.createElement("p");
    text.style.margin = "0";
    text.textContent = kartenText(karte);
    inhalt.appendChild(text);

    detail.hidden = false;
    detailOffen = true;
    zeigeEffekt(karte);
    spieleKartenAudio(karte);
  }

  function schliesseDetail() {
    const detail = document.getElementById("detail");
    if (detail.hidden) return;
    const fertig = () => {
      detail.hidden = true;
      detail.classList.remove("schliesst");
      detailOffen = false;
      detail.removeEventListener("animationend", fertig);
    };
    stoppeAudio();
    verbergeEffekt();
    // reduced-motion: keine Animation -> sofort schließen
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { fertig(); return; }
    detail.addEventListener("animationend", fertig);
    detail.classList.add("schliesst");
  }

  /* ---------- Einstellungen (Menü kommt in Phase 5) ---------- */

  function verdrahteEinstellungen() {
    const btn = document.getElementById("btnEinstellungen");
    if (btn) {
      btn.addEventListener("click", () => {
        // Platzhalter: das Einstellungsmenü wird in Phase 5 ergänzt.
      });
    }
  }

  /* ---------- Start ---------- */

  async function start() {
    verdrahteEinstellungen();
    const btnZu = document.getElementById("btnSchliessen");
    if (btnZu) btnZu.addEventListener("click", schliesseDetail);
    const btnWdh = document.getElementById("btnWiederhol");
    if (btnWdh) btnWdh.addEventListener("click", wiederholeAudio);
    try {
      await ladeBrett();
      zeigeStapel();
    } catch (e) {
      zeigeFehler(e.message);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
