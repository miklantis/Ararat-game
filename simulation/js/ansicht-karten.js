"use strict";
/* =========================================================
   js/ansicht-karten.js  ·  Teil 3: Kartenliste (dreisprachig)

   Platzhalter (Schritt 1). Hängt bereits am Store und zeigt je
   Bereich die Kartenanzahl. In Schritt 3 kommen hinzu:
   - Filter je Bereich (Bereichskarte antippen)
   - Karten in Kartenform mit Bereichsfarbe
   - Anklicken = bearbeiten (id, typ, wert, Kurmancî/Deutsch/Türkisch, audio)
   Alle Änderungen schreiben über Store.touch() zurück und sind
   damit sofort im JSON und in den anderen Ansichten sichtbar.
   ========================================================= */
const AnsichtKarten = (function () {
  const $ = (id) => document.getElementById(id);

  function init() {
    Store.subscribe((ev) => render(ev.config));
  }

  function istHell(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return false;
    const v = parseInt(m[1], 16);
    const r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 168;
  }

  function render(cfg) {
    const ziel = $("kartenInhalt");
    if (!ziel || !cfg) return;
    const zones = cfg.zones || [];
    const cards = cfg.cards || [];
    const proBereich = {};
    for (const c of cards) proBereich[c.bereich] = (proBereich[c.bereich] || 0) + 1;

    let chips = "";
    for (const z of zones) {
      const n = proBereich[z.id] || 0;
      const farbe = z.color || "#8C979E";
      const tinte = istHell(farbe) ? "#22313B" : "#fff";
      chips += `<span class="bereich-chip" style="background:${farbe};color:${tinte}">${z.name} · ${n}</span>`;
    }

    ziel.innerHTML =
      `<div class="block">
         <h2>Karten je Bereich</h2>
         <div class="bereich-chips">${chips || "<span class='leer'>Keine Bereiche definiert.</span>"}</div>
         <p class="hinweis">Insgesamt ${cards.length} Karten im JSON.</p>
       </div>
       <p class="hinweis">Die dreisprachige Kartenliste mit Filter, farbigen Karten und Bearbeitung
       kommt in Schritt 3; Änderungen werden dann automatisch ins JSON übernommen.</p>`;
  }

  return { init };
})();
window.AnsichtKarten = AnsichtKarten;
