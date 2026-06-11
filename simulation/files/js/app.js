"use strict";
/* =========================================================
   js/app.js  ·  Navigation + Start

   Verbindet die drei Ansichten (Spielen / Editor / Karten),
   initialisiert sie, schaltet zwischen ihnen um und lädt zum
   Start das eingebettete Standard-Brett in den Store.
   ========================================================= */
const App = (function () {
  const $ = (id) => document.getElementById(id);

  const ANSICHTEN = [
    ["navSpiel", "ansicht-spiel"],
    ["navEditor", "ansicht-editor"],
    ["navKarten", "ansicht-karten"]
  ];

  function setStatus(text, klasse) {
    const s = $("status");
    if (!s) return;
    s.textContent = text;
    s.className = klasse || "";
  }

  function ansichtWaehlen(viewId) {
    for (const [btn, view] of ANSICHTEN) {
      $(btn).setAttribute("aria-pressed", view === viewId ? "true" : "false");
      $(view).classList.toggle("aktiv", view === viewId);
    }
  }

  function init() {
    // Ansichten initialisieren (jede abonniert dabei den Store) …
    AnsichtSpiel.init();
    AnsichtEditor.init();
    AnsichtKarten.init();

    // … Navigation verdrahten …
    for (const [btn, view] of ANSICHTEN) {
      $(btn).addEventListener("click", () => ansichtWaehlen(view));
    }

    // … und erst danach das Standard-Brett laden, damit alle es erhalten.
    Store.loadDefault();
    ansichtWaehlen("ansicht-spiel");
    setStatus("Standard-Brett geladen – eigenes JSON über „JSON laden …“");
  }

  document.addEventListener("DOMContentLoaded", init);
  return { setStatus, ansichtWaehlen };
})();
window.App = App;
