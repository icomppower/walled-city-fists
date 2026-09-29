// 城寨拳王 score (offline synthesis, original music only — no existing song): one track per scene, the slots of
// ./kcassets.js (an AI Studio file in a slot replaces the synth track). A small pentatonic sequencer: a song = tempo,
// root, scale, bars, a chord root per bar, parts written as strings, drum lanes as 16-step bars.
//   melody strings: one token per eighth — pentatonic index 1-5 (+ ' an octave up, , an octave down), - holds, . rests
//   pattern strings (plucks / bass): one token per eighth — chord tone 0-4 (the pentatonic steps up from the bar's
//   root, ' / , octaves), . rests
//   drum lanes: 16 steps a bar — X accent, x hit, o ghost, . rest; a string, an array cycling by bar, or fn(bar)
// The leitmotif (the battle theme's melody, kcbank.js MELODY) returns in the title, the stall scene and the end.
// Loops render len + 3 s and fold the tail onto the start (seamless); once-tracks (end, win, lose) render straight.
import { bake, osc, nz, filt, gain, env, perc, pan, pts, shaper, clank } from './bank.js';

const SR = 32000, TAIL = 3, RMS = 0.14;                        // RMS: every track's loudness (≈ −17 dBFS), before its lvl
const rnd = (a, b) => a + (b - a) * Math.random();
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const SC = { maj: [0, 2, 4, 7, 9], min: [0, 3, 5, 7, 10] };
/** Pentatonic index i (0-based, may run past 4 / below 0) above root → midi. */
const step = (root, sc, i) => root + SC[sc][((i % 5) + 5) % 5] + 12 * Math.floor(i / 5);
const oct = (tok) => (tok.match(/'/g) || []).length - (tok.match(/,/g) || []).length;
const toks = (s) => s.match(/[0-9][',]*|-|\./g) || [];
/** Melody string → [[freq | null, seconds]] (holds merged). */
function melody(s, root, sc, e, shift = 0) {
  const out = [];
  for (const k of toks(s)) {
    if (k === '-') { if (out.length) out[out.length - 1][1] += e; continue; }
    if (k === '.') { if (out.length && out[out.length - 1][0] === null) out[out.length - 1][1] += e; else out.push([null, e]); continue; }
    out.push([mtof(step(root, sc, +k[0] - 1) + 12 * (oct(k) + shift)), e]);
  }
  return out;
}

// ---- instruments
const LEADS = {
  erhu: { waves: [['sawtooth', 0], ['sawtooth', 7]], peaks: [[1100, 1.2, 6], [2600, 2, 4]], lp: 3600, hp: 240, vib: 5.8, depth: 0.008, legato: true },
  dizi: { waves: [['triangle', 0], ['sine', 1200]], peaks: [[2800, 1.5, 5]], lp: 6500, hp: 380, vib: 6.4, depth: 0.006, breath: 0.1, legato: false },
  suona: { waves: [['square', 0], ['sawtooth', 9]], peaks: [[1500, 1.1, 8], [3200, 2, 5]], lp: 5200, hp: 420, vib: 5.2, depth: 0.01, legato: true, drive: 2.2 },
  xiao: { waves: [['sine', 0], ['triangle', 3]], peaks: [[900, 1, 3]], lp: 2000, hp: 200, vib: 4.6, depth: 0.005, breath: 0.22, legato: true },
};
/** A lead line: one voice through the phrase, bow / breath dips on each note, portamento when legato. */
function lead(oc, dst, t0, notes, kind = 'erhu', g = 0.5) {
  const L = LEADS[kind];
  let chain = null, first = null;
  for (const [f, q, db] of L.peaks) { const b = filt(oc, 'peaking', f, q); b.gain.value = db; if (chain) chain.connect(b); else first = b; chain = b; }
  const out = gain(oc, g);
  let tail = chain.connect(filt(oc, 'lowpass', L.lp, 0.7)).connect(filt(oc, 'highpass', L.hp, 0.7));
  if (L.drive) tail = tail.connect(shaper(oc, L.drive));
  tail.connect(out).connect(dst);
  const total = notes.reduce((a, [, d]) => a + d, 0);
  const amp = oc.createGain(); amp.gain.value = 0; amp.connect(first);
  const oscs = L.waves.map(([type, det]) => { const o = osc(oc, type, t0, total + 0.4); o.detune.value = det; o.connect(amp); return o; });
  if (L.breath) nz(oc, t0, total + 0.4).connect(filt(oc, 'bandpass', 2400, 0.8)).connect(gain(oc, L.breath)).connect(amp);
  const vib = osc(oc, 'sine', t0, total + 0.4, L.vib), vd = oc.createGain(); vd.gain.value = 0;
  vib.connect(vd); for (const o of oscs) vd.connect(o.frequency);
  let t = t0, prev = null;
  for (const [f, d] of notes) {
    if (!f) { amp.gain.setTargetAtTime(0, t, 0.04); t += d; prev = null; continue; }
    for (const o of oscs) {
      if (prev && L.legato) { o.frequency.setValueAtTime(prev, t); o.frequency.setTargetAtTime(f, t, 0.022); } else o.frequency.setValueAtTime(f, t);
    }
    amp.gain.setTargetAtTime(prev ? (L.legato ? 0.55 : 0.15) : 0, t, 0.01);
    amp.gain.setTargetAtTime(1, t + 0.02, prev ? 0.03 : 0.045);
    amp.gain.setTargetAtTime(0.8, t + 0.12, 0.25);
    vd.gain.setValueAtTime(0, t); vd.gain.setTargetAtTime(f * (d > 0.5 ? L.depth : L.depth * 0.35), t + Math.min(0.25, d * 0.4), 0.15);
    t += d; prev = f;
  }
  amp.gain.setTargetAtTime(0, t, 0.07);
}
/** Plucked string (pipa / guzheng / guqin): bright attack closing down, decay by register. */
function pluck(oc, dst, t, f, g = 0.4, bright = 1, dec = 0.9) {
  const lp = filt(oc, 'lowpass', 1, 0.9); pts(lp.frequency, t, [[0, Math.min(9000, f * 8 * bright)], [dec * 0.6, f * 1.6]], true);
  const e = perc(oc, t, 0.003, dec, g);
  osc(oc, 'triangle', t, dec * 1.4, f).connect(e); osc(oc, 'sawtooth', t, dec * 1.4, f).connect(gain(oc, 0.35 * bright)).connect(e);
  e.connect(lp).connect(dst);
}
function bass(oc, dst, t, f, d, g, style) {
  const e = env(oc, t, [[0, 0], [0.006, g], [Math.max(0.03, d * 0.9), g * 0.7], [d + 0.06, 0]]);
  if (style === 'funk') {
    const lp = filt(oc, 'lowpass', 1, 4); pts(lp.frequency, t, [[0, 1500], [0.18, 260]], true);
    osc(oc, 'sawtooth', t, d + 0.1, f).connect(lp).connect(e);
  } else {
    osc(oc, 'sine', t, d + 0.1, f).connect(e);
    osc(oc, 'triangle', t, d + 0.1, f * 2).connect(filt(oc, 'lowpass', 600)).connect(gain(oc, style === 'drive' ? 0.6 : 0.25)).connect(e);
  }
  e.connect(dst);
}
function strings(oc, dst, t, fs, d, g) {
  const lp = filt(oc, 'lowpass', 1700, 0.6), e = env(oc, t, [[0, 0], [Math.min(0.8, d * 0.4), g], [d, g * 0.85], [d + 0.9, 0]]);
  e.connect(lp).connect(dst);
  fs.forEach((f, j) => { for (const det of [-7, 6]) { const o = osc(oc, 'sawtooth', t, d + 1, f); o.detune.value = det + j; o.connect(gain(oc, 0.12)).connect(e); } });
}
function powerChord(oc, dst, t, root, len, g) {
  const pre = gain(oc, 0.3);
  for (const [r, c] of [[1, 0], [1.4983, 4], [2, -5]]) { const o = osc(oc, 'sawtooth', t, len + 0.3, root * r); o.detune.value = c; o.connect(pre); }
  const mid = filt(oc, 'peaking', 1500, 0.8); mid.gain.value = 4;
  pre.connect(shaper(oc, 9)).connect(filt(oc, 'highpass', 110, 0.7)).connect(mid).connect(filt(oc, 'lowpass', 3800, 0.8)).connect(perc(oc, t, 0.003, len * 1.5, g)).connect(dst);
}
const DRUM = {
  k(oc, d, t, g) { const b = osc(oc, 'sine', t, 0.5); pts(b.frequency, t, [[0, 150], [0.05, 55], [0.3, 45]], true); b.connect(perc(oc, t, 0.002, 0.32, g)).connect(d);
    nz(oc, t, 0.01).connect(filt(oc, 'lowpass', 3000)).connect(perc(oc, t, 0.0005, 0.008, g * 0.4)).connect(d); },
  s(oc, d, t, g) { nz(oc, t, 0.25).connect(filt(oc, 'bandpass', 2100, 0.8)).connect(perc(oc, t, 0.001, 0.16, g * 0.8)).connect(d);
    const o = osc(oc, 'triangle', t, 0.12); pts(o.frequency, t, [[0, 260], [0.05, 190]], true); o.connect(perc(oc, t, 0.001, 0.07, g * 0.5)).connect(d); },
  h(oc, d, t, g) { nz(oc, t, 0.05).connect(filt(oc, 'highpass', 7500)).connect(perc(oc, t, 0.0005, 0.03, g * 0.35)).connect(d); },
  t(oc, d, t, g, low = 1) { const b = osc(oc, 'sine', t, 1.2); pts(b.frequency, t, [[0, 98 * low], [0.05, 62 * low], [0.6, 52 * low]], true);
    b.connect(perc(oc, t, 0.002, 0.55, g)).connect(shaper(oc, 1.8)).connect(d);
    nz(oc, t, 0.1).connect(filt(oc, 'lowpass', 520)).connect(perc(oc, t, 0.001, 0.05, g * 0.8)).connect(d); },
  T(oc, d, t, g) { DRUM.t(oc, d, t, g * 1.2, 0.75); },
  w(oc, d, t, g) { osc(oc, 'sine', t, 0.08, 1250).connect(perc(oc, t, 0.0005, 0.05, g * 0.5)).connect(d);
    nz(oc, t, 0.02).connect(filt(oc, 'bandpass', 2000, 6)).connect(perc(oc, t, 0.0003, 0.012, g * 0.3)).connect(d); },
  c(oc, d, t, g) { clank(oc, d, t, rnd(600, 1100), g * 0.35, 0.25); },
  g(oc, d, t, g) { const e = env(oc, t, [[0, 0], [0.02, g * 0.5], [5, 0]]); e.connect(d);
    for (const [r, a] of [[1, 1], [1.48, 0.5], [2.1, 0.35], [2.9, 0.2]]) { const o = osc(oc, 'sine', t, 5.2); pts(o.frequency, t, [[0, 104 * r * 1.03], [1.5, 104 * r]], true); o.connect(gain(oc, a)).connect(e); }
    nz(oc, t, 3).connect(filt(oc, 'bandpass', 3200, 0.7)).connect(env(oc, t, [[0, 0], [0.02, g * 0.08], [2.8, 0]])).connect(d); },
  x(oc, d, t, g) { nz(oc, t, 2.5).connect(filt(oc, 'highpass', 5200)).connect(perc(oc, t, 0.001, 1.8, g * 0.35)).connect(d); },
};

/** Render a song into d. S: { bpm, root (midi), sc, bars, prog (pentatonic index per bar, 1-based, cycles), parts } */
function song(oc, d, S) {
  const e = 30 / S.bpm, bar = e * 8, sx = e / 2, prog = (b) => S.prog[b % S.prog.length] - 1;
  const master = gain(oc, 1); master.connect(d);
  if (S.swell) master.gain.setValueAtTime(S.swell, 0), master.gain.linearRampToValueAtTime(1, S.bars * bar * 0.85);
  const bus = (p = 0, g = 1) => { const n = gain(oc, g); n.connect(pan(oc, p)).connect(master); return n; };
  for (const L of S.leads || []) {
    const from = (L.from || 0) * bar;
    lead(oc, bus(L.pan ?? 0.15), from, melody(L.notes, S.root, S.sc, e * (L.slow || 1), L.oct || 0), L.kind, L.g ?? 0.5);
  }
  const each = (P, fn) => { for (let b = P.from || 0; b < Math.min(S.bars, P.to ?? S.bars); b++) fn(b); };
  for (const P of S.plucks || []) {
    const dst = bus(P.pan ?? -0.3);
    each(P, (b) => {
      const pat = typeof P.pat === 'function' ? P.pat(b) : P.pat;
      toks(pat).forEach((k, i) => { if (/\d/.test(k)) pluck(oc, dst, b * bar + i * e * (P.div || 1), mtof(step(S.root, S.sc, prog(b) + +k[0]) + 12 * (oct(k) + (P.oct || 0))), P.g ?? 0.35, P.bright ?? 1, P.dec ?? 0.9); });
    });
  }
  if (S.bass) { const B = S.bass, dst = bus(0); each(B, (b) => {
    const pat = typeof B.pat === 'function' ? B.pat(b) : B.pat, tk = toks(pat);
    tk.forEach((k, i) => {
      if (!/\d/.test(k)) return;
      let n = 1; while (tk[i + n] === '-') n++;
      bass(oc, dst, b * bar + i * e, mtof(step(S.root, S.sc, prog(b) + +k[0]) + 12 * (oct(k) - 2)), n * e * 0.92, B.g ?? 0.5, B.style);
    });
  }); }
  if (S.pad) { const P = S.pad, dst = bus(0); each(P, (b) => {
    strings(oc, dst, b * bar, (P.tones || [0, 1, 2, 4]).map((k) => mtof(step(S.root, S.sc, prog(b) + k) + 12 * (P.oct ?? -1))), bar, P.g ?? 0.3);
  }); }
  if (S.chords) { const C = S.chords, L = bus(-0.7), R = bus(0.7); each(C, (b) => {
    const pat = typeof C.pat === 'function' ? C.pat(b) : C.pat;
    toks(pat).forEach((k, i) => { if (!/\d/.test(k)) return; const f = mtof(step(S.root, S.sc, prog(b)) - 12), t = b * bar + i * e;
      powerChord(oc, L, t, f, e * 1.6, C.g ?? 0.35); powerChord(oc, R, t + 0.009, f * 1.002, e * 1.6, C.g ?? 0.35); });
  }); }
  for (const [lane, spec] of Object.entries(S.drums || {})) {
    const kind = lane[0], dst = bus(lane.includes('R') ? 0.35 : lane.includes('L') ? -0.35 : 0, 1);
    for (let b = 0; b < S.bars; b++) {
      const pat = typeof spec === 'function' ? spec(b) : Array.isArray(spec) ? spec[b % spec.length] : spec;
      if (!pat) continue;
      [...pat].forEach((c, i) => { if (c === '.' || c === ' ') return; DRUM[kind](oc, dst, b * bar + i * sx + (i % 2 ? (S.swing || 0) * sx : 0), c === 'X' ? 1 : c === 'x' ? 0.72 : 0.35); });
    }
  }
  return S.bars * bar;
}

// ---- the leitmotif: the battle theme's melody (kcbank.js MELODY) in pentatonic indices, D major, 8 bars
const MOTIF = "4-51'2'--- 1'2'1'54--- 3-451'-5- 4-----.. 1'-2'3'4'--- 3'2'1'2'5--- 451'-2'1'5- 1'-----..";
const D4 = 62, G4 = 67, B3 = 59, A3 = 57, E4 = 64;
const rest = (bars) => '........'.repeat(bars);
const ROOF = "3451'2'-1'5 4---3-2- 3451'2'-3'4' 3'------. 5'-4'3'2'-1'5 1'-543--- 2351'2'3'2'1' 1'-----..", BOSS = "1'1'51'1'54- 54212--- 1'1'51'1'52'- 3'2'1'54--- 5'-4'-3'-2'- 1'-5-4-5- 1'2'3'4'5'-4'3' 1'-----..";

export const SONGS = {
  // title: guzheng + pad intro, then the leitmotif on erhu over taiko and wood block, answered by the dizi
  title: { bpm: 96, root: D4, sc: 'maj', bars: 16, prog: [1, 1, 5, 4, 1, 5, 2, 1],
    leads: [{ kind: 'erhu', notes: rest(4) + MOTIF + rest(4), g: 0.5 }, { kind: 'dizi', notes: rest(12) + "5'-4'3' 2'-1'5 1'-2'3'5'--- 4'3'2'1' 2'-1'5 1'------.", g: 0.3, pan: -0.2 }],
    plucks: [{ pat: '0 2 4 2 1\' 4 2 1', oct: 0, g: 0.24, bright: 1.3, dec: 1.2 }],
    pad: { g: 0.22 }, bass: { pat: '0-..0-3.', g: 0.45, from: 4 },
    drums: { t: (b) => (b < 4 ? (b === 0 ? 'X...............' : null) : 'X.......x...x...'), w: (b) => (b < 4 ? null : '....x.......x.x.'), g: (b) => (b === 0 || b === 12 ? 'x' : null), x: (b) => (b === 4 ? 'x' : null) } },
  // story scrolls: guqin and xiao, no drums
  scroll: { lvl: -4, bpm: 66, root: D4, sc: 'maj', bars: 8, prog: [1, 4, 5, 1, 2, 4, 5, 1],
    leads: [{ kind: 'xiao', notes: "1---2-3- 4------- 5-4-3-2- 1------- 3---4-5- 1'------- 5-4-2-3- 1-----..", g: 0.42 }],
    plucks: [{ pat: "0,...2...", g: 0.3, bright: 0.6, dec: 2.2, pan: -0.25 }, { pat: "....4..1'", g: 0.16, bright: 0.7, dec: 1.8, pan: 0.3 }],
    pad: { g: 0.12, tones: [0, 2] } },
  // I 巷戰: 1970s street-fight funk — breakbeat, wah bass, erhu riff, wood block, a stab section
  alleys: { bpm: 120, root: B3, sc: 'min', bars: 16, prog: [1, 1, 3, 4, 1, 1, 5, 4], swing: 0.12,
    leads: [{ kind: 'erhu', notes: "1'-5451'.4 3-2-1--- 1'-5451'.2' 3'-2'-1'--- 4'-3'2'1'-5- 4-3-1--- 51'2'3'-2'1'- 1'------. " + rest(4) + "1'-5451'.4 3-2-1--- 51'2'3'-2'1'- 1'------.", g: 0.48 }],
    plucks: [{ from: 8, to: 12, pat: '0.0.0...', g: 0.3, bright: 1.6, dec: 0.25, oct: 1 }],
    bass: { pat: "0.0'.0.43", style: 'funk', g: 0.5 },
    drums: { k: 'X.....x...x..x..', s: (b) => (b % 4 === 3 ? '....X..o.oX.XoXX' : '....X..o.o..X...'), h: 'x.x.xox.x.x.xox.', w: '..x.......x.....', x: (b) => (b % 8 === 0 ? 'x' : null) } },
  // II 天台: bright rooftop run — dizi over driving drums and a plucked ostinato
  rooftops: { bpm: 132, root: G4, sc: 'maj', bars: 16, prog: [1, 5, 4, 1, 1, 5, 2, 1],
    leads: [{ kind: 'dizi', notes: ROOF + ROOF, g: 0.42 },
      { kind: 'dizi', from: 8, notes: ROOF, oct: 1, g: 0.2, pan: -0.25 }],
    plucks: [{ pat: '0 1 2 1 0 1 2 4', g: 0.26, bright: 1.2, dec: 0.35 }],
    bass: { pat: '0000000 3', style: 'drive', g: 0.42 }, pad: { g: 0.14, from: 8 },
    drums: { k: 'X...x...X...x...', s: '....X.......X...', h: (b) => (b < 8 ? 'x.x.x.x.x.x.x.x.' : 'xxxxxxxxxxxxxxxx'), t: (b) => (b % 4 === 3 ? '........X.x.X.XX' : null), x: (b) => (b % 8 === 0 ? 'x' : null) } },
  // III 工場: industrial — clanks, a low drone, sparse erhu in the dark
  factories: { bpm: 112, root: A3, sc: 'min', bars: 16, prog: [1, 1, 2, 1, 1, 1, 5, 4],
    leads: [{ kind: 'erhu', notes: "1---.... 2-1-5,--- 1---.... 3-2-1--- 4---3-2- 1-2-3--- 5-4-3-2- 1------. " + rest(8), g: 0.5 },
      { kind: 'erhu', from: 8, notes: "1---.... 2-1-5,--- 1---.... 3-2-1--- 4---3-2- 1-2-3--- 5-4-3-2- 1------.", oct: 1, g: 0.36 }],
    bass: { pat: '0-..0.0,.', style: 'drive', g: 0.5 }, pad: { g: 0.18, tones: [0, 3] },
    drums: { k: 'X.......x.x.....', s: '....x.......x...', cL: '..x...x...x..x..', cR: (b) => (b >= 8 ? 'x...x...x...x.x.' : null), h: (b) => (b >= 4 ? '..x...x...x...x.' : null), t: (b) => (b % 4 === 3 ? '............X.X.' : null) } },
  // IV 蛇王樓: the final assault — big taiko, suona, a string ostinato, power chords in the second half
  tower: { bpm: 126, root: D4, sc: 'min', bars: 16, prog: [1, 1, 4, 5, 1, 3, 4, 1],
    leads: [{ kind: 'suona', notes: "4-5-1'--- 5-4-3-4- 1---5,-1- 2------. 4-5-1'-2'- 3'-2'-1'-5- 4-3-2-1- 1------. 4-5-1'--- 5-4-3-4- 1---5,-1- 2------. 4-5-1'-2'- 3'-2'-1'-5- 4-3-2-1- 1------.", g: 0.34 }],
    plucks: [{ pat: '0 0 2 0 3 0 2 0', g: 0.26, bright: 1.1, dec: 0.3, oct: -1 }],
    chords: { from: 8, pat: '0..0..0.' , g: 0.3 }, bass: { pat: '0-0-0-3-', style: 'drive', g: 0.5 }, pad: { g: 0.16 },
    drums: { T: 'X.....x...X.....', t: '....x.......x.x.', s: (b) => (b >= 8 ? '....X.......X...' : null), h: (b) => (b >= 8 ? 'x.x.x.x.x.x.x.x.' : null), x: (b) => (b % 8 === 0 ? 'X' : null), g: (b) => (b === 0 ? 'x' : null) } },
  // bosses: fast double taiko, a chugging riff, the erhu screaming high
  boss: { bpm: 144, root: E4, sc: 'min', bars: 16, prog: [1, 1, 4, 3, 1, 1, 5, 4],
    leads: [{ kind: 'erhu', notes: BOSS + BOSS, g: 0.46, pan: 0.2 },
      { kind: 'suona', from: 8, notes: BOSS, g: 0.26, pan: -0.25 }],
    chords: { pat: '0.00.0.0', g: 0.3 }, bass: { pat: '00000000', style: 'drive', g: 0.46 },
    drums: { T: 'X..x..X.X..x..X.', t: 'x.xxx.xxx.xxx.xx', s: '....X.......X...', h: 'x.x.x.x.x.x.x.x.', x: (b) => (b % 4 === 0 ? 'X' : null) } },
  // 大牌檔重開: the leitmotif, slow and warm, on erhu over pipa and a soft pad
  between1: { lvl: -2, bpm: 72, root: D4, sc: 'maj', bars: 8, prog: [1, 1, 5, 4, 1, 5, 2, 1],
    leads: [{ kind: 'erhu', notes: MOTIF, g: 0.42 }],
    plucks: [{ pat: "0 2 4 2 1' 4 2 4", g: 0.2, bright: 0.9, dec: 1.1, pan: -0.35 }],
    pad: { g: 0.18 }, bass: { pat: '0---....', g: 0.32 }, drums: { w: '........x.......' } },
  // 水落來: playful — tongued dizi, plucks, wood block
  between2: { bpm: 104, root: G4, sc: 'maj', bars: 8, prog: [1, 4, 5, 1, 1, 4, 2, 1],
    leads: [{ kind: 'dizi', notes: "1.3.5.3. 4.5.1'--- 5.4.3.2. 3---.... 1'.5.1'.2'. 3'.2'.1'--- 5.3.5.1'. 1'---....", g: 0.4 }],
    plucks: [{ pat: '0.2.0.2.', g: 0.28, bright: 1.3, dec: 0.3 }], bass: { pat: '0...0.3.', g: 0.4 },
    drums: { w: '..x...x...x.x.x.', k: 'x.......x.......', h: '....x.......x...' } },
  // the lights come on: a swell — strings building, taiko entering, the leitmotif's first phrase
  between3: { bpm: 80, root: D4, sc: 'maj', bars: 8, prog: [1, 5, 4, 1, 2, 5, 4, 5], swell: 0.35,
    leads: [{ kind: 'erhu', from: 4, notes: "4-51'2'--- 1'2'1'54--- 3-451'-5- 4-------", g: 0.46 }],
    plucks: [{ pat: '0 1 2 4 0 1 2 4', g: 0.2, bright: 1, dec: 0.4 }], pad: { g: 0.3 }, bass: { pat: '0-------', g: 0.4, from: 2 },
    drums: { t: (b) => (b >= 4 ? 'X.......x.......' : null), T: (b) => (b === 7 ? 'X...X...X.X.XXXX' : null), g: (b) => (b === 4 ? 'x' : null) } },
  // the end (plays once, ≈ 40 s): dawn, the full leitmotif, the dizi answering, the last chord under the title card
  end: { bpm: 84, root: D4, sc: 'maj', bars: 14, prog: [1, 5, 4, 1, 1, 5, 4, 1, 1, 5, 2, 1, 1, 1], once: 6,
    leads: [{ kind: 'erhu', from: 4, notes: MOTIF + "1'--------------", g: 0.48 },
      { kind: 'dizi', from: 8, notes: "1'-2'3'4'--- 3'2'1'2'5--- 451'-2'1'5- 1'-------------- 5'--------------", oct: 1, g: 0.2, pan: -0.25 }],
    plucks: [{ pat: "0 2 4 1' 2' 1' 4 2", g: 0.2, bright: 1.1, dec: 1.2, to: 12 }],
    pad: { g: 0.24 }, bass: { pat: '0-..0-3.', g: 0.42, from: 4, to: 12 },
    drums: { t: (b) => (b >= 4 && b < 12 ? 'X.......x...x...' : null), T: (b) => (b === 11 ? 'X...X...X.X.XXXX' : b === 12 ? 'X' : null), g: (b) => (b === 0 || b === 12 ? 'X' : null), x: (b) => (b === 4 || b === 12 ? 'X' : null) } },
  // result stings (once)
  win: { bpm: 120, root: D4, sc: 'maj', bars: 3, prog: [5, 1, 1], once: 3,
    leads: [{ kind: 'erhu', notes: "451'2'3'-2'3' 4'-------------", g: 0.5 }],
    pad: { g: 0.28, from: 1 }, drums: { T: ['X.x.X.x.XxXxXXXX', 'X', null], g: [null, 'X'], x: [null, 'X'] } },
  lose: { lvl: -2, bpm: 60, root: A3, sc: 'min', bars: 2, prog: [1, 5], once: 3,
    leads: [{ kind: 'erhu', notes: "4-3-2-1- 1,-------", g: 0.44 }], pad: { g: 0.16, tones: [0, 2] }, drums: { g: ['X', null] } },
};
export const SLOTS = Object.keys(SONGS);

/** Bake one slot → AudioBuffer (stereo, 32 kHz): loops fold their tail onto the start; once-tracks keep theirs. */
export async function bakeSong(slot) {
  const S = SONGS[slot], len = S.bars * 8 * (30 / S.bpm);
  let out;
  if (S.once) out = await bake(len + S.once, (oc, d) => song(oc, d, S), 2, 0.9, true, SR);
  else {
    const b = await bake(len + TAIL, (oc, d) => song(oc, d, S), 2, 0.9, false, SR), n = Math.floor(len * SR);
    out = new AudioBuffer({ length: n, sampleRate: SR, numberOfChannels: 2 });
    for (let c = 0; c < 2; c++) { const s = b.getChannelData(c), o = out.getChannelData(c); o.set(s.subarray(0, n)); for (let i = n; i < s.length; i++) o[i - n] += s[i]; }
  }
  return level(out, S.lvl || 0);
}
/** Loudness match: scale to a common RMS (+ the song's lvl dB), peaks held ≤ 0.9. */
function level(b, db) {
  let ss = 0, pk = 0, n = 0;
  for (let c = 0; c < 2; c++) for (const v of b.getChannelData(c)) { ss += v * v; pk = Math.max(pk, Math.abs(v)); n++; }
  const k = Math.min(RMS * 10 ** (db / 20) / Math.sqrt(ss / n), 0.9 / pk);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] *= k; }
  return b;
}
