"use strict";
/* =========================================================
   js/ansicht-editor.js  ·  Teil 2: Spieleditor

   Platzhalter (Schritt 1). Hängt bereits am Store und zeigt die
   aktuellen Brett-Parameter live an. In Schritt 2 kommen hinzu:
   - Abstand der Felder (tileGap), Eckenrundung (cornerRadius),
     Kachelgröße (tileSize)
   - Anzahl der Felder
   - Master-Pfad direkt durch Ziehen der Kurvenpunkte bearbeiten
   Alle Änderungen schreiben über Store.touch() zurück und sind
   damit sofort im JSON und in den anderen Ansichten sichtbar.
   ========================================================= */
const AnsichtEditor = (function () {
  const $ = (id) => document.getElementById(id);

  function init() {
    Store.subscribe((ev) => render(ev.config));
  }

  function render(cfg) {
    const ziel = $("editorInhalt");
    if (!ziel || !cfg) return;
    const b = cfg.board || {};
    const path = b.path || {};
    const design = b.design || {};
    const felder = (b.fields || []).length;
    const karten = (b.fields || []).filter((f) => f.type === "karte").length;
    const punkte = (path.points || []).length;

    const zeile = (label, wert) =>
      `<div class="ed-zeile"><span class="ed-label">${label}</span><span class="ed-wert">${wert}</span></div>`;

    ziel.innerHTML =
      `<div class="block">
         <h2>Aktuelle Brett-Parameter</h2>
         ${zeile("Felder", felder + " (davon " + karten + " Kartenfelder)")}
         ${zeile("Kurvenpunkte (Master-Pfad)", punkte)}
         ${zeile("tension (Rundheit des Wegs)", path.tension ?? "–")}
         ${zeile("tileSize (Kachelgröße)", design.tileSize ?? "–")}
         ${zeile("cornerRadius (Eckenrundung)", design.cornerRadius ?? "–")}
         ${zeile("tileGap (Abstand)", design.tileGap ?? "–")}
         ${zeile("orientTiles (Ausrichtung)", design.orientTiles ?? "–")}
       </div>
       <p class="hinweis">Der Editor ist vorbereitet und liest live aus dem JSON. Die Bearbeitung
       (Regler für Abstand/Rundung/Felderzahl und das Ziehen der Master-Punkte) kommt in Schritt 2;
       Änderungen werden dann automatisch ins JSON übernommen.</p>`;
  }

  return { init };
})();
window.AnsichtEditor = AnsichtEditor;
