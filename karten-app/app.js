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

  function symbolSvg(name, klasse) {
    const pfad = SYMBOLE[name] || SYMBOLE.berg;
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "-6 -6 12 12");
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
    const sym = symbolSvg(zone ? zone.symbol : "berg", "detail-symbol");
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
