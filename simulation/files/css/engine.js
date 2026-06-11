/* =========================================================
   js/engine.js  ·  Ararat-Engine: Geometrie + Spiellogik
   DOM-frei, eigenständig testbar. Aus index.html ausgelagert.
   ========================================================= */
"use strict";
/* =========================================================
   Ararat-Engine: Geometrie + Spiellogik, ohne DOM-Zugriff.
   Wird unten von der UI genutzt und ist separat testbar.
   ========================================================= */
const Ararat = (function () {

  /* ---------- Zufall (mulberry32, seedbar) ---------- */
  function hashSeed(s) {
    if (s === null || s === undefined || s === "") return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
    if (typeof s === "number") return s >>> 0;
    let h = 2166136261 >>> 0;
    const str = String(s);
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function makeRng(seed) {
    let a = hashSeed(seed);
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- Catmull-Rom -> Bézier ----------
     tension wie im Konzept: höher = runder, 0.5 = klassisches Catmull-Rom,
     gegen 0 = annähernd Polygonzug. Tangente: m_i = tension * (P_{i+1} - P_{i-1}). */
  function toBezierSegments(points, tension, closed) {
    const n = points.length;
    if (n < 2) return [];
    const P = points.map(p => ({ x: p.x, y: p.y, h: (typeof p.h === "number" ? p.h : null) }));
    const get = (i) => {
      if (closed) return P[((i % n) + n) % n];
      if (i < 0)  return { x: 2 * P[0].x - P[1].x, y: 2 * P[0].y - P[1].y, h: P[0].h };
      if (i >= n) return { x: 2 * P[n - 1].x - P[n - 2].x, y: 2 * P[n - 1].y - P[n - 2].y, h: P[n - 1].h };
      return P[i];
    };
    const segCount = closed ? n : n - 1;
    const segs = [];
    for (let i = 0; i < segCount; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      const m1 = { x: tension * (p2.x - p0.x), y: tension * (p2.y - p0.y) };
      const m2 = { x: tension * (p3.x - p1.x), y: tension * (p3.y - p1.y) };
      segs.push({
        a: p1,
        b: { x: p1.x + m1.x / 3, y: p1.y + m1.y / 3 },
        c: { x: p2.x - m2.x / 3, y: p2.y - m2.y / 3 },
        d: p2,
        h1: (p1.h === null ? 0 : p1.h),
        h2: (p2.h === null ? 0 : p2.h)
      });
    }
    return segs;
  }
  function bezPoint(s, t) {
    const u = 1 - t;
    const x = u*u*u*s.a.x + 3*u*u*t*s.b.x + 3*u*t*t*s.c.x + t*t*t*s.d.x;
    const y = u*u*u*s.a.y + 3*u*u*t*s.b.y + 3*u*t*t*s.c.y + t*t*t*s.d.y;
    return { x, y };
  }

  /* ---------- Bogenlängen-Tabelle ----------
     scaleX/scaleY rechnen normierte Koordinaten in Zeichenfläche um,
     damit Längen und Winkel im Zielmaßstab stimmen. */
  function buildPathTable(pathDef, scaleX, scaleY, samplesPerSeg) {
    const segs = toBezierSegments(pathDef.points || [], pathDef.tension ?? 0.5, !!pathDef.closed);
    const S = samplesPerSeg || 48;
    const samples = [];
    let total = 0;
    let prev = null;
    for (let si = 0; si < segs.length; si++) {
      const seg = segs[si];
      const start = (si === 0) ? 0 : 1; // Doppelpunkt am Segmentübergang vermeiden
      for (let k = start; k <= S; k++) {
        const t = k / S;
        const p = bezPoint(seg, t);
        const x = p.x * scaleX, y = p.y * scaleY;
        const h = seg.h1 + (seg.h2 - seg.h1) * t;
        if (prev) total += Math.hypot(x - prev.x, y - prev.y);
        samples.push({ x, y, h, len: total });
        prev = { x, y };
      }
    }
    function posAt(s) {
      if (!samples.length) return { x: 0, y: 0, h: 0, angle: 0 };
      const sClamped = Math.max(0, Math.min(total, s));
      let lo = 0, hi = samples.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (samples[mid].len < sClamped) lo = mid + 1; else hi = mid;
      }
      const i1 = Math.max(1, lo), i0 = i1 - 1;
      const a = samples[i0], b = samples[i1];
      const span = (b.len - a.len) || 1;
      const t = (sClamped - a.len) / span;
      const j0 = Math.max(0, i0 - 1), j1 = Math.min(samples.length - 1, i1 + 1);
      const angle = Math.atan2(samples[j1].y - samples[j0].y, samples[j1].x - samples[j0].x);
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        h: a.h + (b.h - a.h) * t,
        angle
      };
    }
    return { segs, samples, total, posAt };
  }

  /* Felder gleichabständig auf der Kurve verteilen (Arc-Length). */
  function layoutFields(config, scaleX, scaleY) {
    const fields = (config.board && config.board.fields) || [];
    const table = buildPathTable(config.board.path, scaleX, scaleY, 48);
    const n = fields.length;
    const closed = !!config.board.path.closed;
    const out = [];
    for (let i = 0; i < n; i++) {
      const f = (n === 1) ? 0 : (closed ? i / n : i / (n - 1));
      const p = table.posAt(f * table.total);
      out.push({ field: fields[i], x: p.x, y: p.y, h: p.h, angle: p.angle });
    }
    return { positions: out, table };
  }

  /* ---------- Konfiguration prüfen ---------- */
  function validateConfig(cfg) {
    const fehler = [], warnungen = [];
    if (!cfg || typeof cfg !== "object") { fehler.push("Kein JSON-Objekt."); return { fehler, warnungen }; }
    const b = cfg.board;
    if (!b) fehler.push("Block „board“ fehlt.");
    else {
      if (!b.path || !Array.isArray(b.path.points) || b.path.points.length < 2)
        fehler.push("„board.path.points“ braucht mindestens 2 Punkte.");
      else if (b.path.points.some(p => typeof p.x !== "number" || typeof p.y !== "number"))
        fehler.push("Jeder Kurvenpunkt braucht numerisches x und y.");
      if (!Array.isArray(b.fields) || b.fields.length < 2)
        fehler.push("„board.fields“ braucht mindestens 2 Felder.");
      else {
        if (b.fields[0].type !== "start") warnungen.push("Erstes Feld ist nicht vom Typ „start“.");
        const last = b.fields[b.fields.length - 1];
        if (last.type !== "ziel") warnungen.push("Letztes Feld ist nicht vom Typ „ziel“ – das letzte Feld gilt trotzdem als Gipfel.");
      }
    }
    if (!cfg.dice || ![1, 2].includes(cfg.dice.count)) warnungen.push("„dice.count“ fehlt oder ist nicht 1/2 – es wird 1 verwendet.");
    if (!Array.isArray(cfg.zones) || !cfg.zones.length) warnungen.push("Block „zones“ fehlt – Felder werden grau dargestellt.");
    const zonesUsed = new Set(((b && b.fields) || []).map(f => f.zone));
    const zonesDef = new Set((cfg.zones || []).map(z => z.id));
    for (const z of zonesUsed) if (!zonesDef.has(z)) warnungen.push(`Zone „${z}“ wird verwendet, ist aber in „zones“ nicht definiert.`);
    const cardZones = new Set((cfg.cards || []).map(c => c.bereich));
    for (const f of ((b && b.fields) || []))
      if (f.type === "karte" && !cardZones.has(f.zone)) { warnungen.push(`Kartenfelder der Zone „${f.zone}“ haben keinen Kartenstapel – sie bleiben ohne Effekt.`); break; }
    return { fehler, warnungen };
  }

  /* ---------- Spiellogik ---------- */
  function diceCfg(cfg) {
    const d = cfg.dice || {};
    return { count: (d.count === 2 ? 2 : 1), faces: (Number.isInteger(d.faces) && d.faces >= 2 ? d.faces : 6) };
  }
  function rulesCfg(cfg) {
    const r = cfg.rules || {};
    return {
      exactFinish: !!r.exactFinish,
      cardsChain: !!r.cardsChain,
      maxRunden: (Number.isInteger(r.maxRunden) && r.maxRunden > 0 ? r.maxRunden : 1000)
    };
  }
  function buildDecks(cfg, rng) {
    const decks = {};
    for (const c of (cfg.cards || [])) {
      (decks[c.bereich] = decks[c.bereich] || { draw: [], discard: [], all: [] }).all.push(c);
    }
    for (const z of Object.keys(decks)) {
      decks[z].draw = shuffle(decks[z].all.slice(), rng);
    }
    return decks;
  }
  function shuffle(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function newGame(cfg, playerCount, rng) {
    const fields = cfg.board.fields;
    return {
      cfg, rng,
      fields,
      last: fields.length - 1,
      dice: diceCfg(cfg),
      rules: rulesCfg(cfg),
      playerCount,
      pos: Array(playerCount).fill(0),
      skip: Array(playerCount).fill(false),
      current: 0,
      round: 1,
      turns: 0,
      rolls: 0,
      finished: false,
      winner: null,
      abgebrochen: false,
      decks: buildDecks(cfg, rng),
      stats: { wurfLandungen: 0, karteTreffer: 0, kartenGezogen: 0, zuegeJeZone: {}, kartenJeZone: {} }
    };
  }

  function drawCard(st, zone) {
    const d = st.decks[zone];
    if (!d || !d.all.length) return null;
    if (!d.draw.length) { d.draw = shuffle(d.discard, st.rng); d.discard = []; }
    if (!d.draw.length) return null;
    const card = d.draw.pop();
    d.discard.push(card);
    return card;
  }

  /* Spielt genau einen Zug des aktuellen Spielers und liefert die Ereignisliste.
     Mutiert den Zustand. */
  function playTurn(st) {
    const ev = [];
    if (st.finished) return ev;
    const p = st.current;
    st.turns++;

    if (st.skip[p]) {
      st.skip[p] = false;
      ev.push({ type: "aussetzen-eingeloest", player: p });
      advance(st, ev);
      return ev;
    }

    let nochmal = true;
    let extraSchutz = 0;
    while (nochmal && !st.finished) {
      nochmal = false;
      const dice = [];
      for (let i = 0; i < st.dice.count; i++) dice.push(1 + Math.floor(st.rng() * st.dice.faces));
      const sum = dice.reduce((a, b) => a + b, 0);
      st.rolls++;
      ev.push({ type: "wurf", player: p, dice, sum });

      const from = st.pos[p];
      let to;
      if (st.rules.exactFinish && from + sum > st.last) {
        to = from; // Überwurf: Figur bleibt stehen
        ev.push({ type: "ueberwurf", player: p, sum });
      } else {
        to = Math.min(st.last, from + sum);
      }
      if (to !== from) ev.push({ type: "zug", player: p, from, to, grund: "wurf" });
      st.pos[p] = to;
      st.stats.wurfLandungen++;
      const zone = st.fields[to].zone;
      st.stats.zuegeJeZone[zone] = (st.stats.zuegeJeZone[zone] || 0) + 1;

      if (checkWin(st, p, ev)) return ev;

      if (st.fields[to].type === "karte" && to !== from) {
        st.stats.karteTreffer++;
        const card = drawCard(st, zone);
        if (card) {
          st.stats.kartenGezogen++;
          st.stats.kartenJeZone[zone] = (st.stats.kartenJeZone[zone] || 0) + 1;
          ev.push({ type: "karte", player: p, card, zone });
          const folge = applyCard(st, p, card, ev);
          if (st.finished) return ev;
          if (folge === "erneut" && extraSchutz < 6) { nochmal = true; extraSchutz++; }
        }
      }
    }
    advance(st, ev);
    return ev;
  }

  function applyCard(st, p, card, ev) {
    const wert = Number(card.wert) || 0;
    if (card.typ === "vorwaerts" && wert > 0) {
      const from = st.pos[p];
      let to;
      if (st.rules.exactFinish && from + wert > st.last) { to = from; ev.push({ type: "ueberwurf", player: p, sum: wert }); }
      else to = Math.min(st.last, from + wert);
      if (to !== from) ev.push({ type: "zug", player: p, from, to, grund: "karte" });
      st.pos[p] = to;
      if (checkWin(st, p, ev)) return null;
      if (st.rules.cardsChain && st.fields[to].type === "karte" && to !== from) {
        const card2 = drawCard(st, st.fields[to].zone);
        if (card2) {
          st.stats.kartenGezogen++;
          st.stats.kartenJeZone[st.fields[to].zone] = (st.stats.kartenJeZone[st.fields[to].zone] || 0) + 1;
          ev.push({ type: "karte", player: p, card: card2, zone: st.fields[to].zone });
          return applyCard(st, p, card2, ev);
        }
      }
      return null;
    }
    if (card.typ === "rueckwaerts" && wert > 0) {
      const from = st.pos[p];
      const to = Math.max(0, from - wert);
      if (to !== from) ev.push({ type: "zug", player: p, from, to, grund: "karte" });
      st.pos[p] = to;
      return null;
    }
    if (card.typ === "aussetzen") { st.skip[p] = true; ev.push({ type: "aussetzen-gesetzt", player: p }); return null; }
    if (card.typ === "erneut") { ev.push({ type: "erneut", player: p }); return "erneut"; }
    ev.push({ type: "karte-ohne-effekt", player: p, typ: card.typ });
    return null;
  }

  function checkWin(st, p, ev) {
    const amZiel = st.rules.exactFinish ? st.pos[p] === st.last : st.pos[p] >= st.last;
    if (amZiel) {
      st.finished = true;
      st.winner = p;
      ev.push({ type: "sieg", player: p, round: st.round });
      return true;
    }
    return false;
  }

  function advance(st, ev) {
    st.current = (st.current + 1) % st.playerCount;
    if (st.current === 0) {
      st.round++;
      if (st.round > st.rules.maxRunden && !st.finished) {
        st.finished = true; st.abgebrochen = true;
        ev.push({ type: "abbruch", round: st.round });
      }
    }
  }

  /* ---------- Serien / Turbo ---------- */
  function runGame(cfg, playerCount, rng) {
    const st = newGame(cfg, playerCount, rng);
    while (!st.finished) playTurn(st);
    return st;
  }

  function emptyAggregate(diceCount, playerCount) {
    return {
      diceCount, playerCount, games: 0, unfinished: 0,
      roundsSum: 0, roundsMin: Infinity, roundsMax: 0,
      turnsSum: 0, rollsSum: 0,
      wurfLandungen: 0, karteTreffer: 0, kartenGezogen: 0,
      winsByStart: Array(playerCount).fill(0),
      kartenJeZone: {},
      hist: {} // Runden -> Anzahl
    };
  }
  function addGameToAggregate(agg, st) {
    agg.games++;
    if (st.abgebrochen || st.winner === null) { agg.unfinished++; return; }
    const r = st.round;
    agg.roundsSum += r;
    agg.roundsMin = Math.min(agg.roundsMin, r);
    agg.roundsMax = Math.max(agg.roundsMax, r);
    agg.turnsSum += st.turns;
    agg.rollsSum += st.rolls;
    agg.wurfLandungen += st.stats.wurfLandungen;
    agg.karteTreffer += st.stats.karteTreffer;
    agg.kartenGezogen += st.stats.kartenGezogen;
    agg.winsByStart[st.winner]++;
    for (const z of Object.keys(st.stats.kartenJeZone))
      agg.kartenJeZone[z] = (agg.kartenJeZone[z] || 0) + st.stats.kartenJeZone[z];
    agg.hist[r] = (agg.hist[r] || 0) + 1;
  }
  function finishAggregate(agg) {
    const done = agg.games - agg.unfinished;
    agg.fertig = done;
    agg.avgRounds = done ? agg.roundsSum / done : 0;
    agg.avgTurns = done ? agg.turnsSum / done : 0;
    agg.avgRolls = done ? agg.rollsSum / done : 0;
    agg.karteQuote = agg.wurfLandungen ? agg.karteTreffer / agg.wurfLandungen : 0;
    agg.kartenProSpiel = done ? agg.kartenGezogen / done : 0;
    if (!isFinite(agg.roundsMin)) agg.roundsMin = 0;
    return agg;
  }

  /* Eine Serie synchron rechnen (für Tests) – die UI rechnet in Häppchen. */
  function runSeries(cfg, playerCount, games, seed, diceCountOverride) {
    const cfg2 = (diceCountOverride ? withDiceCount(cfg, diceCountOverride) : cfg);
    const rng = makeRng(seed);
    const agg = emptyAggregate(diceCfg(cfg2).count, playerCount);
    for (let i = 0; i < games; i++) addGameToAggregate(agg, runGame(cfg2, playerCount, rng));
    return finishAggregate(agg);
  }
  function withDiceCount(cfg, count) {
    const kopie = JSON.parse(JSON.stringify(cfg));
    kopie.dice = kopie.dice || {};
    kopie.dice.count = count;
    return kopie;
  }

  return {
    makeRng, toBezierSegments, bezPoint, buildPathTable, layoutFields,
    validateConfig, diceCfg, rulesCfg,
    newGame, playTurn, runGame,
    emptyAggregate, addGameToAggregate, finishAggregate, runSeries, withDiceCount
  };
})();
if (typeof module !== "undefined" && module.exports) module.exports = Ararat;

if (typeof window !== "undefined") window.Ararat = Ararat;
