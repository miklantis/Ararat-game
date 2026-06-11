"use strict";
/* =========================================================
   js/store.js  ·  Zentraler Zustand (eine Datenquelle)

   Hält genau eine Brettdefinition (config). Alle drei Ansichten
   – Spielen, Editor, Karten – lesen und schreiben über diesen
   Store. Jede Änderung benachrichtigt alle Ansichten, sodass die
   Darstellung und der JSON-Text stets synchron bleiben.

   - apply(neu, quelle)  prüft und übernimmt eine ganze Definition
   - touch(quelle)       meldet eine direkte Änderung am Objekt
   - importText(text)    JSON-Text parsen und übernehmen
   - exportText()        aktuellen Stand als hübsches JSON
   - subscribe(fn)       fn({config, quelle, warnungen}) bei Änderung
   ========================================================= */
const Store = (function () {
  let config = null;
  let letzteWarnungen = [];
  const abonnenten = [];

  function get() { return config; }

  function subscribe(fn) {
    abonnenten.push(fn);
    return function abbestellen() {
      const i = abonnenten.indexOf(fn);
      if (i >= 0) abonnenten.splice(i, 1);
    };
  }

  function benachrichtigen(quelle) {
    const ereignis = { config, quelle: quelle || "", warnungen: letzteWarnungen };
    for (const fn of abonnenten.slice()) {
      try { fn(ereignis); } catch (e) { console.error("Store-Abonnent fehlgeschlagen:", e); }
    }
  }

  /* Ganze Definition prüfen und übernehmen. */
  function apply(neu, quelle) {
    const { fehler, warnungen } = Ararat.validateConfig(neu);
    if (fehler.length) {
      return { ok: false, meldung: "Nicht übernommen: " + fehler.join(" "), fehler, warnungen };
    }
    config = neu;
    letzteWarnungen = warnungen;
    benachrichtigen(quelle || "apply");
    const hinweis = warnungen.length ? " · Hinweise: " + warnungen.join(" ") : "";
    return { ok: true, meldung: "Übernommen." + hinweis, warnungen };
  }

  /* Nach einer direkten Änderung am bestehenden config-Objekt aufrufen
     (z. B. Editor zieht einen Kurvenpunkt, Kartenliste ändert einen Text). */
  function touch(quelle) {
    if (!config) return { ok: false, meldung: "Kein Brett geladen." };
    const { warnungen } = Ararat.validateConfig(config);
    letzteWarnungen = warnungen;
    benachrichtigen(quelle || "touch");
    return { ok: true, warnungen };
  }

  function exportText() {
    return JSON.stringify(config, null, 2);
  }

  /* Kann werfen (ungültiges JSON) – aufrufende Stelle fängt ab. */
  function importText(text, quelle) {
    const json = JSON.parse(text);
    return apply(json, quelle || "import");
  }

  /* Eingebettetes Standard-Brett aus dem JSON-Block im HTML laden. */
  function loadDefault() {
    const block = document.getElementById("default-board");
    if (!block) return { ok: false, meldung: "Kein Standard-Brett eingebettet." };
    return apply(JSON.parse(block.textContent), "Standard-Brett");
  }

  return { get, subscribe, apply, touch, exportText, importText, loadDefault };
})();
window.Store = Store;
