/* =========================================================================
   Ararat – Karten-App
   Phase 0: Grundgerüst & Datenanbindung.

   Lädt karten-app/ararat-board.json per fetch, baut intern ein Datenmodell
   (Bereiche indexiert, Karten je Bereich gruppiert) und zeigt eine klare
   Rückmeldung – Erfolg mit Kurzdiagnose oder verständliche Fehlermeldung.
   Kein Framework, alles aus der JSON, nichts fest verdrahtet.
   ========================================================================= */

(() => {
  "use strict";

  const DATEN_URL = "ararat-board.json";

  /* Bereichssymbole als SVG-Pfade, identisch zur Simulation
     (Koordinatensystem etwa -6 … 6, Mittelpunkt im Ursprung). */
  const SYMBOLE = {
    haus:  "M-5 1 L0 -4.6 L5 1 L5 5 L1.6 5 L1.6 1.8 L-1.6 1.8 L-1.6 5 L-5 5 Z",
    schaf: "M-4.6 0.4 A2.1 2.1 0 1 1 -2.4 -2.6 A2.4 2.4 0 1 1 1 -3 A2.2 2.2 0 1 1 4 -0.6 A2 2 0 1 1 2.6 2.6 L2.6 5 L1.2 5 L1.2 3.1 L-2.4 3.1 L-2.4 5 L-3.8 5 L-3.8 2.4 A2.2 2.2 0 0 1 -4.6 0.4 Z",
    tor:   "M-5 5 L-5 -1.4 A5 5 0 0 1 5 -1.4 L5 5 L2.2 5 L2.2 0 A2.2 2.6 0 0 0 -2.2 0 L-2.2 5 Z",
    berg:  "M-5.6 5 L-1.4 -2.8 L0.4 0.2 L2.4 -4.8 L5.6 5 Z M2.4 -4.8 L3.4 -1.7 L1.5 -2.1 L0.4 0.2 L2.4 -4.8 Z"
  };

  const SVG_NS = "http://www.w3.org/2000/svg";

  /* Internes Datenmodell – einzige Quelle ist die JSON. */
  const Modell = {
    roh: null,
    meta: null,
    dice: null,
    bereiche: [],            // Reihenfolge wie in der JSON
    bereichNachId: {},       // id -> Bereich
    kartenNachBereich: {}    // bereich-id -> [Karten]
  };

  /* ---------- Laden ---------- */

  async function ladeBrett() {
    const res = await fetch(DATEN_URL, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} beim Laden von ${DATEN_URL}`);
    }
    let daten;
    try {
      daten = await res.json();
    } catch (e) {
      throw new Error("Die Datei ararat-board.json ist kein gültiges JSON.");
    }
    baueModell(daten);
    return Modell;
  }

  /* ---------- Modell aufbauen ---------- */

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
      if (Modell.kartenNachBereich[k.bereich]) {
        Modell.kartenNachBereich[k.bereich].push(k);
      }
    }
  }

  /* ---------- Helfer ---------- */

  // Heuristik: ist eine Farbe hell? (dann dunkle Schrift verwenden)
  function istHell(hex) {
    if (typeof hex !== "string") return false;
    const m = hex.replace("#", "");
    if (m.length !== 6) return false;
    const r = parseInt(m.slice(0, 2), 16);
    const g = parseInt(m.slice(2, 4), 16);
    const b = parseInt(m.slice(4, 6), 16);
    // wahrgenommene Helligkeit
    const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return l > 0.7;
  }

  function symbolSvg(name) {
    const pfad = SYMBOLE[name] || SYMBOLE.berg;
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "-6 -6 12 12");
    svg.setAttribute("class", "bereich-symbol");
    svg.setAttribute("aria-hidden", "true");
    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", pfad);
    svg.appendChild(p);
    return svg;
  }

  /* ---------- Anzeige ---------- */

  function zeigeStatus(klasse, text) {
    const el = document.getElementById("status");
    el.className = `status ${klasse}`;
    el.innerHTML = "";
    const p = document.createElement("p");
    p.className = "status-text";
    p.textContent = text;
    el.appendChild(p);
    return el;
  }

  function zeigeFehler(text, detailHtml) {
    const el = zeigeStatus("status--fehler", text);
    if (detailHtml) {
      const d = document.createElement("p");
      d.className = "status-detail";
      d.innerHTML = detailHtml;
      el.appendChild(d);
    }
  }

  function zeigeDiagnose() {
    // Bereichsfarben aus der JSON als CSS-Variablen verfügbar machen
    const wurzel = document.documentElement;
    for (const z of Modell.bereiche) {
      if (z.color) wurzel.style.setProperty(`--${z.id}`, z.color);
    }

    // Statusbox unsichtbar schalten
    document.getElementById("status").className = "status status--ok";

    const ziel = document.getElementById("diagnose");
    ziel.hidden = false;
    ziel.innerHTML = "";

    // Kopf mit Meta
    const kopf = document.createElement("div");
    kopf.className = "diagnose-kopf";
    const h2 = document.createElement("h2");
    h2.textContent = "Brett geladen";
    const meta = document.createElement("p");
    meta.className = "diagnose-meta";
    const gesamt = Object.values(Modell.kartenNachBereich)
      .reduce((s, arr) => s + arr.length, 0);
    const wuerfel = Modell.dice
      ? `${Modell.dice.count}× W${Modell.dice.faces}`
      : "–";
    const ver = Modell.meta.version ? ` · ${Modell.meta.version}` : "";
    meta.textContent = `${Modell.bereiche.length} Bereiche · ${gesamt} Karten · Würfel ${wuerfel}${ver}`;
    kopf.appendChild(h2);
    kopf.appendChild(meta);
    ziel.appendChild(kopf);

    // Bereiche als farbige Zeilen mit Symbol und Kartenzahl
    const liste = document.createElement("div");
    liste.className = "bereiche";
    for (const z of Modell.bereiche) {
      const zeile = document.createElement("div");
      zeile.className = "bereich-zeile" + (istHell(z.color) ? " ist-hell" : "");
      zeile.style.setProperty("--bf", z.color || "#ccc");

      zeile.appendChild(symbolSvg(z.symbol));

      const txt = document.createElement("div");
      txt.className = "bereich-text";
      const name = document.createElement("div");
      name.className = "bereich-name";
      name.textContent = z.name || z.id;
      const zahl = document.createElement("div");
      zahl.className = "bereich-zahl";
      const n = (Modell.kartenNachBereich[z.id] || []).length;
      zahl.textContent = n === 1 ? "1 Karte" : `${n} Karten`;
      txt.appendChild(name);
      txt.appendChild(zahl);
      zeile.appendChild(txt);

      liste.appendChild(zeile);
    }
    ziel.appendChild(liste);

    const fuss = document.createElement("p");
    fuss.className = "diagnose-fuss";
    fuss.textContent = "Datenanbindung steht. Die nächste Phase legt die Stapel-Ansicht zum Antippen darüber.";
    ziel.appendChild(fuss);
  }

  /* ---------- Start ---------- */

  async function start() {
    try {
      await ladeBrett();
      zeigeDiagnose();
    } catch (e) {
      zeigeFehler(
        "Brettdaten konnten nicht geladen werden.",
        `Erwartet wird die Datei <code>ararat-board.json</code> neben dieser Seite. ` +
        `Prüfe, ob sie im Repo liegt und GitHub Pages neu gebaut hat.<br>` +
        `Grund: ${e.message}`
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
