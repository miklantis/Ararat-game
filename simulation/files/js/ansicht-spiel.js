"use strict";
/* =========================================================
   js/ansicht-spiel.js  ·  Teil 1: Spielen / Simulieren
   Rendering, Modi (Sichtbar/Manuell/Turbo), Auswertung.
   Liest den Zustand aus dem Store und nutzt die Ararat-Engine.
   ========================================================= */
const AnsichtSpiel = (function () {
  const $ = (id) => document.getElementById(id);
  const SVGNS = "http://www.w3.org/2000/svg";
  const W = 840, H = 900; // 42 x 45 cm

  const SPIELER = [
    { name: "Spieler 1", farbe: "#2B3A45" },
    { name: "Spieler 2", farbe: "#E0A427" },
    { name: "Spieler 3", farbe: "#7C4FA0" },
    { name: "Spieler 4", farbe: "#2E8F83" }
  ];

  let config = null;          // aktive Brettdefinition
  let layout = null;          // Feldpositionen + Kurventabelle
  let zonesById = {};
  let spielerAnzahl = 4;
  let modus = "auto";         // auto | manuell | turbo
  let spiel = null;           // laufender Spielzustand (sichtbar/manuell)
  let laeuft = false, pausiert = false, generation = 0;
  let beschaeftigt = false;   // Zug/Turbo in Arbeit
  let tokenEls = [];

  /* ---------- Hilfen ---------- */
  function el(tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function f1(x) { return x.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
  function fPct(x) { return (100 * x).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " %"; }
  function hex2rgb(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return { r: 128, g: 128, b: 128 };
    const v = parseInt(m[1], 16);
    return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
  }
  function tint(hex, anteil) {
    const c = hex2rgb(hex);
    const m = (k) => Math.round(k + (255 - k) * (1 - anteil));
    return `rgb(${m(c.r)},${m(c.g)},${m(c.b)})`;
  }
  function istHell(hex) {
    const c = hex2rgb(hex);
    return (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) > 168;
  }
  function zoneInfo(id) {
    return zonesById[id] || { id, name: id, color: "#8C979E", symbol: null };
  }
  function sleep(ms) {
    return new Promise((res) => {
      const start = performance.now();
      (function tick() {
        if (!pausiert && performance.now() - start >= ms) return res();
        if (pausiert) { requestAnimationFrame(() => { const wieder = performance.now(); (function warte(){ pausiert ? requestAnimationFrame(warte) : res(); })(); }); return; }
        requestAnimationFrame(tick);
      })();
    });
  }
  function speed() {
    const v = Number($("speedSlider").value);
    return 0.25 * Math.pow(32, v / 100); // 0,25x .. 8x
  }

  /* ---------- Symbole (kleine SVG-Glyphen) ---------- */
  const SYMBOLE = {
    haus:  "M-5 1 L0 -4.6 L5 1 L5 5 L1.6 5 L1.6 1.8 L-1.6 1.8 L-1.6 5 L-5 5 Z",
    schaf: "M-4.6 0.4 A2.1 2.1 0 1 1 -2.4 -2.6 A2.4 2.4 0 1 1 1 -3 A2.2 2.2 0 1 1 4 -0.6 A2 2 0 1 1 2.6 2.6 L2.6 5 L1.2 5 L1.2 3.1 L-2.4 3.1 L-2.4 5 L-3.8 5 L-3.8 2.4 A2.2 2.2 0 0 1 -4.6 0.4 Z",
    tor:   "M-5 5 L-5 -1.4 A5 5 0 0 1 5 -1.4 L5 5 L2.2 5 L2.2 0 A2.2 2.6 0 0 0 -2.2 0 L-2.2 5 Z",
    berg:  "M-5.6 5 L-1.4 -2.8 L0.4 0.2 L2.4 -4.8 L5.6 5 Z M2.4 -4.8 L3.4 -1.7 L1.5 -2.1 L0.4 0.2 L2.4 -4.8 Z",
    stern: "M0 -5 L1.4 -1.6 L5 -1.4 L2.2 0.9 L3.1 4.6 L0 2.5 L-3.1 4.6 L-2.2 0.9 L-5 -1.4 L-1.4 -1.6 Z"
  };
  function symbolNode(name, fill, scale, parent) {
    const d = SYMBOLE[name];
    if (!d) return null;
    return el("path", { d, fill, transform: `scale(${scale})`, "stroke": "none" }, parent);
  }
  function symbolHtml(name, fill, px) {
    const d = SYMBOLE[name];
    if (!d) return "";
    return `<svg width="${px}" height="${px}" viewBox="-6 -6 12 12" aria-hidden="true"><path d="${d}" fill="${fill}"/></svg>`;
  }

  /* ---------- Brett zeichnen ---------- */
  function zeichneBrett() {
    const svg = $("brett");
    svg.innerHTML = "";
    zonesById = {};
    for (const z of (config.zones || [])) zonesById[z.id] = z;

    const size = (config.board && config.board.size) || { width: 42, height: 45 };
    const ratio = (size.height / size.width) || (45 / 42);
    svg.setAttribute("viewBox", `0 0 ${W} ${Math.round(W * ratio)}`);
    const HH = Math.round(W * ratio);

    layout = Ararat.layoutFields(config, W, HH);
    const pos = layout.positions;
    const design = (config.board.design) || {};
    const showNr = design.showFieldNumbers !== false;
    const heightEmphasis = (typeof design.heightEmphasis === "number") ? design.heightEmphasis : 0;

    /* Spielfläche: Pergament mit dezenten Höhenlinien um den Gipfel */
    el("rect", { x: 6, y: 6, width: W - 12, height: HH - 12, rx: 18, fill: "var(--pergament)", stroke: "var(--pergament-rand)", "stroke-width": 2 }, svg);
    el("rect", { x: 16, y: 16, width: W - 32, height: HH - 32, rx: 12, fill: "none", stroke: "var(--pergament-rand)", "stroke-width": 1, opacity: 0.7 }, svg);
    const gipfel = pos[pos.length - 1];
    const konturen = el("g", { fill: "none", stroke: "#22313B", "stroke-width": 1, opacity: 0.06 }, svg);
    const kRng = Ararat.makeRng("konturen");
    for (let ring = 1; ring <= 6; ring++) {
      const base = ring * Math.min(W, HH) * 0.075;
      let d = "";
      const STEPS = 26;
      for (let k = 0; k <= STEPS; k++) {
        const a = (k / STEPS) * Math.PI * 2;
        const wobble = 1 + 0.10 * Math.sin(a * 3 + ring * 1.7) + 0.05 * (kRng() - 0.5);
        const x = gipfel.x + Math.cos(a) * base * wobble;
        const y = gipfel.y + Math.sin(a) * base * wobble * 0.92;
        d += (k ? " L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
      }
      el("path", { d: d + " Z" }, konturen);
    }

    /* Weglinie unter den Kacheln */
    const ps = design.pathStroke || {};
    if (ps.show !== false) {
      let d = "";
      for (const s of layout.table.segs) {
        const A = { x: s.a.x * W, y: s.a.y * HH }, B = { x: s.b.x * W, y: s.b.y * HH },
              C = { x: s.c.x * W, y: s.c.y * HH }, D = { x: s.d.x * W, y: s.d.y * HH };
        if (!d) d = `M ${A.x.toFixed(1)} ${A.y.toFixed(1)}`;
        d += ` C ${B.x.toFixed(1)} ${B.y.toFixed(1)}, ${C.x.toFixed(1)} ${C.y.toFixed(1)}, ${D.x.toFixed(1)} ${D.y.toFixed(1)}`;
      }
      el("path", {
        d, fill: "none",
        stroke: ps.color || "#b8a98c",
        "stroke-width": Math.max(1, (ps.width || 0.012) * W),
        "stroke-linecap": "round", opacity: 0.9
      }, svg);
    }

    /* Kacheln */
    const spacing = pos.length > 1 ? layout.table.total / (pos.length - (config.board.path.closed ? 0 : 1)) : 60;
    const tilesG = el("g", {}, svg);
    const labelsG = el("g", {}, svg);

    for (let i = 0; i < pos.length; i++) {
      const p = pos[i];
      const f = p.field;
      const z = zoneInfo(f.zone);
      const dz = designFuerFeld(design, f);
      const side = (dz.tileSize || 0.05) * W * (1 + p.h * heightEmphasis);
      const along = Math.min(side, spacing * (1 - (dz.tileGap ?? 0.2)));
      const rx = (dz.cornerRadius ?? 0.3) * Math.min(side, along);
      const rot = (design.orientTiles === "fixed") ? 0 : (p.angle * 180 / Math.PI);
      const g = el("g", { transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${rot.toFixed(1)})`, "data-feld": i }, tilesG);

      /* leichte Erhebung: Schatten wächst mit h */
      el("ellipse", { cx: 0, cy: side * 0.16 + p.h * 5, rx: along * 0.52, ry: side * 0.30, fill: "#22313B", opacity: 0.10 + p.h * 0.08, transform: `rotate(${-rot.toFixed(1)})` }, g);

      let fill, stroke, strokeW;
      if (f.type === "karte") { fill = z.color; stroke = "#FFFFFF"; strokeW = 1.6; }
      else if (f.type === "start") { fill = "#FFFFFF"; stroke = "#22313B"; strokeW = 2.4; }
      else if (i === pos.length - 1) { fill = z.color; stroke = "#FFFFFF"; strokeW = 2.2; }
      else { fill = tint(z.color, 0.26); stroke = z.color; strokeW = 1.3; }
      el("rect", { x: -along / 2, y: -side / 2, width: along, height: side, rx, fill, stroke, "stroke-width": strokeW }, g);

      /* Symbol + Nummer */
      const inner = el("g", { transform: `rotate(${-rot.toFixed(1)})` }, g); // Inhalt waagerecht halten
      const symFill = istHell(fill) ? "#22313B" : "#FFFFFF";
      if (f.type === "karte" && z.symbol) {
        symbolNode(z.symbol, symFill, side * 0.052, inner);
        if (showNr) el("text", { x: 0, y: -side * 0.30, "text-anchor": "middle", "font-size": Math.max(7, side * 0.19), fill: symFill, opacity: 0.85, "font-weight": 600 }, inner).textContent = i;
      } else if (f.type === "start") {
        symbolNode("stern", "#22313B", side * 0.05, inner);
      } else if (i === pos.length - 1) {
        symbolNode(z.symbol || "berg", symFill, side * 0.055, inner);
      } else if (showNr) {
        el("text", { x: 0, y: side * 0.13, "text-anchor": "middle", "font-size": Math.max(8, side * 0.30), fill: "#22313B", opacity: 0.55, "font-weight": 600, "font-variant-numeric": "tabular-nums" }, inner).textContent = i;
      }

      if (f.type === "start" || i === pos.length - 1) {
        const t = el("text", {
          x: p.x, y: p.y - side * 0.78, "text-anchor": "middle",
          "font-size": 15, "font-weight": 700, fill: "#22313B",
          "letter-spacing": "0.14em"
        }, labelsG);
        t.textContent = (f.type === "start") ? "START" : "GIPFEL";
      }
    }

    /* Spielfiguren-Ebene */
    el("g", { id: "tokens" }, svg);
    zeichneTokens();
    zeichneLegende();
    zeichneBoardInfo();
  }

  function designFuerFeld(design, f) {
    const base = { tileSize: design.tileSize, cornerRadius: design.cornerRadius, tileGap: design.tileGap };
    const ov = design.overrides || {};
    const fuerTyp = ov[f.type] || {};
    const fuerZone = ov[f.zone] || {};
    return Object.assign({}, base, fuerZone, fuerTyp);
  }

  function tokenPosition(feldIndex, spielerIndex) {
    const p = layout.positions[Math.max(0, Math.min(layout.positions.length - 1, feldIndex))];
    const off = [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]][spielerIndex] || [0, 0];
    const r = ((config.board.design && config.board.design.tileSize) || 0.05) * W * 0.30;
    return { x: p.x + off[0] * r * 1.25, y: p.y + off[1] * r * 1.25, r };
  }

  function zeichneTokens() {
    const g = $("tokens");
    if (!g) return;
    g.innerHTML = "";
    tokenEls = [];
    const positionen = spiel ? spiel.pos : Array(spielerAnzahl).fill(0);
    for (let s = 0; s < spielerAnzahl; s++) {
      const tp = tokenPosition(positionen[s], s);
      const grp = el("g", { transform: `translate(${tp.x.toFixed(1)} ${tp.y.toFixed(1)})` }, g);
      el("circle", { r: tp.r + 1.4, fill: "rgba(34,49,59,.30)", cy: 1.6 }, grp);
      el("circle", { r: tp.r, fill: SPIELER[s].farbe, stroke: "#fff", "stroke-width": 2 }, grp);
      tokenEls.push({ grp, x: tp.x, y: tp.y });
    }
  }

  function tokenSetzen(s, feldIndex) {
    const tp = tokenPosition(feldIndex, s);
    const t = tokenEls[s];
    if (!t) return;
    t.x = tp.x; t.y = tp.y;
    t.grp.setAttribute("transform", `translate(${tp.x.toFixed(1)} ${tp.y.toFixed(1)})`);
  }

  async function tokenWandern(s, von, nach) {
    const richtung = nach > von ? 1 : -1;
    const dauerProSchritt = Math.max(34, 200 / speed());
    for (let f = von + richtung; richtung > 0 ? f <= nach : f >= nach; f += richtung) {
      await tokenGleiten(s, f, dauerProSchritt);
      if (generation !== aktuelleGeneration) return;
    }
  }
  let aktuelleGeneration = 0;
  function tokenGleiten(s, feldIndex, dauer) {
    return new Promise((res) => {
      const t = tokenEls[s];
      if (!t) return res();
      const ziel = tokenPosition(feldIndex, s);
      const sx = t.x, sy = t.y, dx = ziel.x - sx, dy = ziel.y - sy;
      const start = performance.now();
      (function step(now) {
        if (pausiert) { requestAnimationFrame(step); return; }
        const u = Math.min(1, (now - start) / dauer);
        const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        const hop = Math.sin(u * Math.PI) * 6;
        t.grp.setAttribute("transform", `translate(${(sx + dx * e).toFixed(1)} ${(sy + dy * e - hop).toFixed(1)})`);
        if (u < 1) requestAnimationFrame(step);
        else { t.x = ziel.x; t.y = ziel.y; t.grp.setAttribute("transform", `translate(${ziel.x.toFixed(1)} ${ziel.y.toFixed(1)})`); res(); }
      })(performance.now());
    });
  }

  function zeichneLegende() {
    const lg = $("legende");
    let html = "";
    for (const z of (config.zones || [])) {
      html += `<span class="eintrag">${symbolHtml(z.symbol, z.color, 14)}<span>${z.name}</span></span>`;
    }
    html += `<span class="eintrag" style="margin-left:auto"></span>`;
    for (let s = 0; s < spielerAnzahl; s++) {
      html += `<span class="eintrag"><span class="punkt" style="background:${SPIELER[s].farbe};width:11px;height:11px;border-radius:50%;display:inline-block;border:1.5px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.18)"></span>${SPIELER[s].name}</span>`;
    }
    lg.innerHTML = html;
  }

  function zeichneBoardInfo() {
    const fields = config.board.fields;
    const karten = fields.filter(f => f.type === "karte").length;
    const proZone = {};
    for (const f of fields) proZone[f.zone] = (proZone[f.zone] || 0) + 1;
    const size = (config.board && config.board.size) || {};
    const masse = (size.width && size.height) ? ` · ${size.width}×${size.height} ${size.unit || "cm"}` : "";
    const zonenText = (config.zones || []).map(z => `${z.name.split(" ")[0]} ${proZone[z.id] || 0}`).join(", ");
    $("boardInfo").innerHTML =
      `<b>${(config.meta && config.meta.name) || "Ohne Namen"}</b> · ${(config.meta && config.meta.version) || "ohne Version"}${masse}<br>` +
      `<b>${fields.length}</b> Felder, davon <b>${karten}</b> Kartenfelder<br>` +
      `${zonenText}<br>Würfel: <b>${Ararat.diceCfg(config).count} × W${Ararat.diceCfg(config).faces}</b> · Karten im JSON: <b>${(config.cards || []).length}</b>`;
  }

  function zeichneSpielstand() {
    const sEl = $("spielstand");
    if (!spiel) { sEl.innerHTML = `<span>Bereit – Runde 1</span>`; return; }
    let html = `<span>Runde ${spiel.round}</span>`;
    for (let s = 0; s < spielerAnzahl; s++) {
      const dran = (!spiel.finished && spiel.current === s) ? " dran" : "";
      const zusatz = spiel.skip[s] ? " · setzt aus" : "";
      const sieger = spiel.winner === s ? " · Gipfel!" : "";
      html += `<span class="chip${dran}"><span class="punkt" style="background:${SPIELER[s].farbe}"></span>${SPIELER[s].name}: Feld ${spiel.pos[s]}${zusatz}${sieger}</span>`;
    }
    sEl.innerHTML = html;
  }

  /* ---------- Protokoll & Karten-Overlay ---------- */
  function log(text, klasse) {
    const p = $("protokoll");
    const leer = p.querySelector(".leer");
    if (leer) leer.remove();
    const z = document.createElement("div");
    z.className = "z" + (klasse ? " " + klasse : "");
    z.textContent = text;
    p.appendChild(z);
    while (p.children.length > 500) p.removeChild(p.firstChild);
    p.scrollTop = p.scrollHeight;
  }
  function logLeeren() {
    $("protokoll").innerHTML = '<div class="leer">Noch kein Spiel gelaufen.</div>';
  }

  let overlayTimer = null;
  function zeigeKarte(card, zoneId) {
    const z = zoneInfo(zoneId);
    const ov = $("kartenOverlay");
    $("kartenKopf").style.background = z.color;
    $("kartenKopf").innerHTML = `${symbolHtml(z.symbol, istHell(z.color) ? "#22313B" : "#fff", 15)}<span style="color:${istHell(z.color) ? "#22313B" : "#fff"}">${z.name}</span>`;
    $("kartenText").textContent = card.text_de || "(ohne Text – nur Mechanik)";
    $("kartenEffekt").textContent = effektText(card) + "  ·  " + card.id;
    ov.classList.add("sichtbar");
    clearTimeout(overlayTimer);
    if (modus === "auto") overlayTimer = setTimeout(() => ov.classList.remove("sichtbar"), Math.max(900, 2600 / speed()));
  }
  function effektText(card) {
    if (card.typ === "vorwaerts") return `+${card.wert} Felder`;
    if (card.typ === "rueckwaerts") return `−${card.wert} Felder`;
    if (card.typ === "aussetzen") return "einmal aussetzen";
    if (card.typ === "erneut") return "erneut würfeln";
    return card.typ;
  }
  function versteckeKarte() { $("kartenOverlay").classList.remove("sichtbar"); }

  /* ---------- Ereignisse abspielen (sichtbar/manuell) ---------- */
  async function spieleEreignisse(events, gen) {
    for (const e of events) {
      if (gen !== generation) return;
      const name = (p) => SPIELER[p].name;
      if (e.type === "wurf") {
        const wuerfel = e.dice.length > 1 ? ` (${e.dice.join(" + ")})` : "";
        log(`R${spiel.round}  ${name(e.player)} würfelt ${e.sum}${wuerfel}`);
        await sleep(320 / speed());
      } else if (e.type === "zug") {
        const feld = spiel.fields[e.to];
        const z = zoneInfo(feld.zone);
        const grund = e.grund === "karte" ? " (Karte)" : "";
        log(`     → Feld ${e.to} · ${z.name}${feld.type === "karte" ? " · Kartenfeld" : ""}${grund}`);
        await tokenWandern(e.player, e.from, e.to);
        zeichneSpielstand();
        await sleep(140 / speed());
      } else if (e.type === "ueberwurf") {
        log(`     Überwurf (${e.sum}) – Figur bleibt stehen (exactFinish)`);
        await sleep(280 / speed());
      } else if (e.type === "karte") {
        log(`     Karte ${e.card.id}: ${e.card.text_de || effektText(e.card)}`, "karte");
        zeigeKarte(e.card, e.zone);
        await sleep(1500 / speed());
      } else if (e.type === "aussetzen-gesetzt") {
        zeichneSpielstand();
      } else if (e.type === "aussetzen-eingeloest") {
        log(`R${spiel.round}  ${name(e.player)} setzt aus`);
        zeichneSpielstand();
        await sleep(420 / speed());
      } else if (e.type === "erneut") {
        await sleep(220 / speed());
      } else if (e.type === "karte-ohne-effekt") {
        log(`     Kartentyp „${e.typ}“ hat im Prototyp noch keinen Effekt`);
      } else if (e.type === "sieg") {
        log(`★ ${name(e.player)} erreicht den Gipfel – Sieg in Runde ${e.round}!`, "sieg");
        zeichneSpielstand();
      } else if (e.type === "abbruch") {
        log(`Abbruch: Rundenlimit (${spiel.rules.maxRunden}) erreicht`, "karte");
      }
    }
  }

  function neuesSpiel() {
    const seed = $("seedInput").value.trim() || undefined;
    spiel = Ararat.newGame(config, spielerAnzahl, Ararat.makeRng(seed));
    versteckeKarte();
    zeichneTokens();
    zeichneSpielstand();
  }

  async function autoLauf() {
    if (beschaeftigt) return;
    beschaeftigt = true; laeuft = true; pausiert = false;
    generation++; aktuelleGeneration = generation;
    const gen = generation;
    $("btnAutoStart").disabled = true;
    $("btnAutoPause").disabled = false;
    logLeeren();
    neuesSpiel();
    log(`Neues Spiel: ${spielerAnzahl} Spieler, ${spiel.dice.count} × W${spiel.dice.faces}${$("seedInput").value.trim() ? ", Seed " + $("seedInput").value.trim() : ""}`);
    while (!spiel.finished && gen === generation) {
      const events = Ararat.playTurn(spiel);
      await spieleEreignisse(events, gen);
    }
    if (gen === generation && spiel.finished && spiel.winner !== null) {
      zeigeEinzelauswertung(spiel);
    }
    laeuft = false; beschaeftigt = false;
    $("btnAutoStart").disabled = false;
    $("btnAutoPause").disabled = true;
    $("btnAutoPause").textContent = "Pause";
  }

  function autoStopp() {
    generation++;
    pausiert = false; laeuft = false; beschaeftigt = false;
    $("btnAutoStart").disabled = false;
    $("btnAutoPause").disabled = true;
    $("btnAutoPause").textContent = "Pause";
    spiel = null;
    logLeeren();
    versteckeKarte();
    zeichneTokens();
    zeichneSpielstand();
  }

  async function manuellerZug() {
    if (beschaeftigt) return;
    if (!spiel || spiel.finished) { logLeeren(); neuesSpiel(); log(`Neues Spiel: ${spielerAnzahl} Spieler, ${spiel.dice.count} × W${spiel.dice.faces}`); }
    beschaeftigt = true;
    generation++; aktuelleGeneration = generation;
    const gen = generation;
    $("btnWurf").disabled = true;
    const events = Ararat.playTurn(spiel);
    await spieleEreignisse(events, gen);
    if (spiel.finished && spiel.winner !== null) zeigeEinzelauswertung(spiel);
    beschaeftigt = false;
    $("btnWurf").disabled = false;
    aktualisiereWurfButton();
  }

  function aktualisiereWurfButton() {
    const b = $("btnWurf");
    if (!spiel || spiel.finished) { b.textContent = "Würfeln (neues Spiel)"; return; }
    b.textContent = `Würfeln – ${SPIELER[spiel.current].name}`;
  }

  /* ---------- Turbo ---------- */
  function turboLaeuftAnzeigen(text) { $("turboFortschritt").textContent = text || ""; }

  function serieAsync(cfg, anzahl, seed, diceCount, fortschritt) {
    return new Promise((resolve) => {
      const cfg2 = diceCount ? Ararat.withDiceCount(cfg, diceCount) : cfg;
      const rng = Ararat.makeRng(seed);
      const agg = Ararat.emptyAggregate(Ararat.diceCfg(cfg2).count, spielerAnzahl);
      let i = 0;
      (function chunk() {
        const ende = Math.min(anzahl, i + 250);
        for (; i < ende; i++) Ararat.addGameToAggregate(agg, Ararat.runGame(cfg2, spielerAnzahl, rng));
        fortschritt(i, anzahl);
        if (i < anzahl) setTimeout(chunk, 0);
        else resolve(Ararat.finishAggregate(agg));
      })();
    });
  }

  async function turboStart(vergleich) {
    if (beschaeftigt) return;
    beschaeftigt = true;
    $("btnTurbo").disabled = true; $("btnVergleich").disabled = true;
    const anzahl = Math.max(10, Math.min(100000, Number($("turboAnzahl").value) || 500));
    const seed = $("seedInput").value.trim() || String(Date.now());
    try {
      if (!vergleich) {
        const agg = await serieAsync(config, anzahl, seed, null, (i, n) => turboLaeuftAnzeigen(`${i.toLocaleString("de-DE")} / ${n.toLocaleString("de-DE")} Partien …`));
        turboLaeuftAnzeigen(`${anzahl.toLocaleString("de-DE")} Partien gerechnet.`);
        zeigeSerienAuswertung([agg], seed, anzahl);
      } else {
        const a1 = await serieAsync(config, anzahl, seed, 1, (i, n) => turboLaeuftAnzeigen(`1 Würfel: ${i.toLocaleString("de-DE")} / ${n.toLocaleString("de-DE")} …`));
        const a2 = await serieAsync(config, anzahl, seed, 2, (i, n) => turboLaeuftAnzeigen(`2 Würfel: ${i.toLocaleString("de-DE")} / ${n.toLocaleString("de-DE")} …`));
        turboLaeuftAnzeigen(`Vergleich über ${(2 * anzahl).toLocaleString("de-DE")} Partien gerechnet.`);
        zeigeSerienAuswertung([a1, a2], seed, anzahl);
      }
      tabWaehlen("Auswertung");
    } finally {
      beschaeftigt = false;
      $("btnTurbo").disabled = false; $("btnVergleich").disabled = false;
    }
  }

  /* ---------- Auswertung ---------- */
  function zeigeEinzelauswertung(st) {
    const a = $("auswertung");
    const karteQuote = st.stats.wurfLandungen ? st.stats.karteTreffer / st.stats.wurfLandungen : 0;
    a.innerHTML =
      `<div class="stat-kacheln">` +
      kachel(SPIELER[st.winner].name, "Sieger") +
      kachel(st.round, "Runden") +
      kachel(st.turns, "Züge gesamt") +
      kachel(st.stats.kartenGezogen, "Karten gezogen") +
      kachel(fPct(karteQuote), "Kartenfeld-Treffer je Wurf") +
      `</div><p class="hinweis">Einzelspiel-Auswertung. Für belastbare Zahlen den Turbo-Modus nutzen.</p>`;
  }
  function kachel(wert, label) {
    return `<div class="stat-kachel"><div class="wert">${wert}</div><div class="label">${label}</div></div>`;
  }

  function zeigeSerienAuswertung(serien, seed, anzahl) {
    const a = $("auswertung");
    let html = `<p class="hinweis" style="margin:0 0 12px">${serien.length === 2 ? "Vergleich 1 vs. 2 Würfel" : "Turbo-Serie"} · ${anzahl.toLocaleString("de-DE")} Partien je Variante · ${spielerAnzahl} Spieler · Seed ${seed}</p>`;

    if (serien.length === 1) {
      const s = serien[0];
      html += `<div class="stat-kacheln">` +
        kachel(f1(s.avgRounds), "Ø Runden je Partie") +
        kachel(f1(s.avgTurns), "Ø Züge je Partie") +
        kachel(`${s.roundsMin} / ${s.roundsMax}`, "kürzeste / längste (Runden)") +
        kachel(fPct(s.karteQuote), "Kartenfeld-Treffer je Wurf") +
        kachel(f1(s.kartenProSpiel), "Ø Karten je Partie") +
        `</div>`;
    }

    html += tabelleHtml(serien);
    html += `<div class="histo-bereich">` + serien.map(s => histoHtml(s)).join("") + `</div>`;
    if (serien.some(s => s.unfinished)) {
      html += `<p class="hinweis">Abgebrochene Partien (Rundenlimit): ${serien.map(s => s.unfinished).join(" / ")} – sie fließen nicht in die Mittelwerte ein.</p>`;
    }
    a.innerHTML = html;
  }

  function tabelleHtml(serien) {
    const koepfe = serien.map(s => `${s.diceCount} Würfel`);
    const zeilen = [];
    const zeile = (label, werte, besserIst) => {
      let bestIdx = -1;
      if (serien.length > 1 && besserIst) {
        const nums = werte.map(w => w.num);
        bestIdx = besserIst === "min" ? nums.indexOf(Math.min(...nums)) : nums.indexOf(Math.max(...nums));
      }
      zeilen.push(`<tr><td>${label}</td>${werte.map((w, i) => `<td${i === bestIdx ? ' class="best"' : ""}>${w.txt}</td>`).join("")}</tr>`);
    };
    zeile("Ø Runden je Partie", serien.map(s => ({ num: s.avgRounds, txt: f1(s.avgRounds) })), "min");
    zeile("Ø Züge je Partie", serien.map(s => ({ num: s.avgTurns, txt: f1(s.avgTurns) })));
    zeile("Ø Würfe je Partie", serien.map(s => ({ num: s.avgRolls, txt: f1(s.avgRolls) })));
    zeile("Kürzeste Partie (Runden)", serien.map(s => ({ num: s.roundsMin, txt: s.roundsMin })));
    zeile("Längste Partie (Runden)", serien.map(s => ({ num: s.roundsMax, txt: s.roundsMax })));
    zeile("Kartenfeld-Treffer je Wurf", serien.map(s => ({ num: s.karteQuote, txt: fPct(s.karteQuote) })));
    zeile("Ø Karten je Partie", serien.map(s => ({ num: s.kartenProSpiel, txt: f1(s.kartenProSpiel) })));
    for (let p = 0; p < spielerAnzahl; p++) {
      zeile(`Siege Startplatz ${p + 1}`, serien.map(s => {
        const q = s.fertig ? s.winsByStart[p] / s.fertig : 0;
        return { num: q, txt: fPct(q) };
      }));
    }
    const zonen = new Set();
    serien.forEach(s => Object.keys(s.kartenJeZone).forEach(z => zonen.add(z)));
    for (const z of zonen) {
      zeile(`Ø Karten „${zoneInfo(z).name}“ je Partie`, serien.map(s => {
        const q = s.fertig ? (s.kartenJeZone[z] || 0) / s.fertig : 0;
        return { num: q, txt: f1(q) };
      }));
    }
    return `<table class="vergleich"><thead><tr><th></th>${koepfe.map(k => `<th>${k}</th>`).join("")}</tr></thead><tbody>${zeilen.join("")}</tbody></table>`;
  }

  function histoHtml(s) {
    const keys = Object.keys(s.hist).map(Number).sort((a, b) => a - b);
    if (!keys.length) return "";
    const min = keys[0], max = keys[keys.length - 1];
    const maxN = Math.max(...keys.map(k => s.hist[k]));
    let balken = "";
    for (let r = min; r <= max; r++) {
      const n = s.hist[r] || 0;
      const hPct = maxN ? Math.round(100 * n / maxN) : 0;
      balken += `<div class="balken${s.diceCount === 2 ? " akzent" : ""}" style="height:${hPct}%" title="${r} Runden: ${n} Partien"></div>`;
    }
    return `<div class="histo"><h3>Spieldauer-Verteilung · ${s.diceCount} Würfel</h3><div class="balken-wrap">${balken}</div><div class="achse"><span>${min} Runden</span><span>${max}</span></div></div>`;
  }

  /* ---------- JSON laden / anwenden / exportieren ---------- */
  function statusSetzen(text, klasse) {
    const s = $("status");
    s.textContent = text;
    s.className = klasse || "";
  }

  /* Auf jede Store-Änderung: laufendes Spiel stoppen und Brett neu zeichnen,
     Würfel-Segment und JSON-Tab nachziehen. */
  function beiZustandsaenderung(ev) {
    config = ev.config;
    autoStopp();
    zeichneBrett();
    syncWuerfelSegment();
    editorFuellen();
    $("auswertung").innerHTML = '<div class="leer">Noch keine Auswertung für dieses Brett.</div>';
  }

  function editorFuellen() {
    $("jsonEditor").value = JSON.stringify(config, null, 2);
    $("editorMeldung").textContent = "";
    $("editorMeldung").className = "";
  }

  function exportieren() {
    const blob = new Blob([Store.exportText()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ararat-board.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    statusSetzen("JSON exportiert (ararat-board.json)", "ok");
  }

  /* ---------- Bedienelemente verdrahten ---------- */
  function segmentVerdrahten(id, callback) {
    const seg = $(id);
    seg.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      for (const x of seg.querySelectorAll("button")) x.setAttribute("aria-pressed", x === b ? "true" : "false");
      callback(Number(b.dataset.n));
    });
  }
  function syncWuerfelSegment() {
    const n = Ararat.diceCfg(config).count;
    for (const b of $("segWuerfel").querySelectorAll("button"))
      b.setAttribute("aria-pressed", Number(b.dataset.n) === n ? "true" : "false");
  }

  function modusWaehlen(neu) {
    modus = neu;
    for (const [id, m] of [["modAuto", "auto"], ["modManuell", "manuell"], ["modTurbo", "turbo"]])
      $(id).setAttribute("aria-pressed", m === modus ? "true" : "false");
    $("panelAuto").classList.toggle("aktiv", modus === "auto");
    $("panelManuell").classList.toggle("aktiv", modus === "manuell");
    $("panelTurbo").classList.toggle("aktiv", modus === "turbo");
    autoStopp();
    aktualisiereWurfButton();
  }

  function tabWaehlen(name) {
    for (const [btn, panel, n] of [["tabProtokoll", "panelProtokoll", "Protokoll"], ["tabAuswertung", "panelAuswertung", "Auswertung"], ["tabJson", "panelJson", "JSON"]]) {
      $(btn).setAttribute("aria-pressed", n === name ? "true" : "false");
      $(panel).classList.toggle("aktiv", n === name);
    }
  }

  function init() {
    Store.subscribe(beiZustandsaenderung);

    segmentVerdrahten("segSpieler", (n) => { spielerAnzahl = n; autoStopp(); zeichneLegende(); aktualisiereWurfButton(); });
    segmentVerdrahten("segWuerfel", (n) => {
      config.dice = config.dice || {};
      config.dice.count = n;
      Store.touch("Würfel");
      statusSetzen(`Würfel: ${n} – ins JSON übernommen`, "ok");
    });

    $("btnLaden").addEventListener("click", () => $("dateiInput").click());
    $("dateiInput").addEventListener("change", async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        const text = await f.text();
        const json = JSON.parse(text);
        const res = Store.apply(json, `Datei „${f.name}“`);
        statusSetzen(res.ok ? `Datei „${f.name}“ geladen.${res.warnungen && res.warnungen.length ? " · Hinweise: " + res.warnungen.join(" ") : ""}` : res.meldung, res.ok ? (res.warnungen && res.warnungen.length ? "fehler" : "ok") : "fehler");
      } catch (err) {
        statusSetzen("Datei ist kein gültiges JSON: " + err.message, "fehler");
      }
      e.target.value = "";
    });
    $("btnExport").addEventListener("click", exportieren);

    $("modAuto").addEventListener("click", () => modusWaehlen("auto"));
    $("modManuell").addEventListener("click", () => modusWaehlen("manuell"));
    $("modTurbo").addEventListener("click", () => modusWaehlen("turbo"));

    $("btnAutoStart").addEventListener("click", autoLauf);
    $("btnAutoPause").addEventListener("click", () => {
      pausiert = !pausiert;
      $("btnAutoPause").textContent = pausiert ? "Weiter" : "Pause";
    });
    $("btnAutoReset").addEventListener("click", autoStopp);

    $("btnWurf").addEventListener("click", manuellerZug);
    $("btnManuellReset").addEventListener("click", () => { autoStopp(); aktualisiereWurfButton(); });

    $("btnTurbo").addEventListener("click", () => turboStart(false));
    $("btnVergleich").addEventListener("click", () => turboStart(true));

    $("tabProtokoll").addEventListener("click", () => tabWaehlen("Protokoll"));
    $("tabAuswertung").addEventListener("click", () => tabWaehlen("Auswertung"));
    $("tabJson").addEventListener("click", () => tabWaehlen("JSON"));

    $("btnJsonAnwenden").addEventListener("click", () => {
      const m = $("editorMeldung");
      try {
        const json = JSON.parse($("jsonEditor").value);
        const res = Store.apply(json, "JSON-Tab");
        m.textContent = res.meldung;
        m.className = res.ok ? "ok" : "fehler";
      } catch (err) {
        m.textContent = "Kein gültiges JSON: " + err.message;
        m.className = "fehler";
      }
    });
    $("btnJsonZuruecksetzen").addEventListener("click", editorFuellen);

    $("speedSlider").addEventListener("input", () => {
      $("speedAnzeige").textContent = "×" + speed().toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    });
    $("speedSlider").dispatchEvent(new Event("input"));

    aktualisiereWurfButton();
    zeichneSpielstand();
  }

  return { init };
})();
window.AnsichtSpiel = AnsichtSpiel;
