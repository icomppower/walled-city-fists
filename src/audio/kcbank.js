// 城寨拳王 sound bank (offline synthesis, no files; the base bank's helpers). Original music only — no existing song:
//   theme(oc, d)     the battle theme, 16 s loop at 120 BPM locked to the base's taiko loop: an erhu-like lead (two detuned
//                    saws through a bowed-string body EQ, vibrato that blooms on long notes, portamento between notes, a
//                    bow dip on each change) over plucked bass, wood block and a low drum; D major pentatonic
//   pad              the cutscene pad (16 s loop): a slow pentatonic chord bed, triangles + filtered saws, breathing
//   endChord         the end-title chord (7 s): the whole D add9 voicing, a soft gong, a high erhu note
//   ambience loops   market (clatter, chopping, chatter, mahjong tiles, a sizzle) · pipes (drips, water in the pipes) ·
//                    rain on tin roofs · steam hiss · tube-light buzz · city night hum
//   jet              a 7 s fly-over roar (the runtime ramps its rate for the Doppler and pans it across)
import { bake, bakeLoop, xfade, osc, nz, filt, gain, env, perc, curve, shaper, pan, smp, pts, clank, crowdVoice } from './bank.js';

const rnd = (a, b) => a + (b - a) * Math.random();
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const HZ = { 'F#3': 184.99, A3: 220, B3: 246.94, D4: 293.66, E4: 329.63, 'F#4': 369.99, A4: 440, B4: 493.88, D5: 587.33, E5: 659.26, 'F#5': 739.99, A5: 880, D2: 73.42, A2: 110, B2: 123.47, 'F#2': 92.5, E2: 82.41, G2: 98 };

/** Erhu-like lead: one voice through the phrase (legato), notes [[name | null, beats]], beat seconds, start t0. */
function erhu(oc, dst, t0, notes, beat, g = 0.5) {
  const body = filt(oc, 'peaking', 1100, 1.2); body.gain.value = 6;
  const nas = filt(oc, 'peaking', 2600, 2); nas.gain.value = 4;
  const lp = filt(oc, 'lowpass', 3600, 0.7), hp = filt(oc, 'highpass', 240, 0.7), out = gain(oc, g);
  body.connect(nas).connect(lp).connect(hp).connect(out).connect(dst);
  const total = notes.reduce((a, [, b]) => a + b, 0) * beat;
  const oscs = [0, 7].map((det) => { const o = osc(oc, 'sawtooth', t0, total + 0.3); o.detune.value = det; return o; });
  const amp = oc.createGain(); amp.gain.value = 0;
  for (const o of oscs) o.connect(amp);
  amp.connect(body);
  const vib = osc(oc, 'sine', t0, total + 0.3, 5.8), vd = oc.createGain(); vd.gain.value = 0;
  vib.connect(vd); for (const o of oscs) vd.connect(o.frequency);
  let t = t0, prev = null;
  for (const [n, b] of notes) {
    const d = b * beat;
    if (!n) { amp.gain.setTargetAtTime(0, t, 0.04); t += d; prev = null; continue; }
    const f = HZ[n];
    for (const o of oscs) { if (prev) { o.frequency.setValueAtTime(prev, t); o.frequency.setTargetAtTime(f, t, 0.025); } else o.frequency.setValueAtTime(f, t); }
    amp.gain.setTargetAtTime(prev ? 0.55 : 0, t, 0.01);                      // the bow change
    amp.gain.setTargetAtTime(1, t + 0.02, prev ? 0.03 : 0.05);
    amp.gain.setTargetAtTime(0.82, t + 0.12, 0.2);
    vd.gain.setValueAtTime(0, t); vd.gain.setTargetAtTime(d > 0.6 ? f * 0.008 : f * 0.003, t + Math.min(0.25, d * 0.4), 0.15);   // vibrato blooms on long notes
    t += d; prev = f;
  }
  amp.gain.setTargetAtTime(0, t, 0.06);
}
const woodblock = (oc, dst, t, g = 0.4, f = 1250) => {
  osc(oc, 'sine', t, 0.08, f).connect(perc(oc, t, 0.0005, 0.05, g)).connect(dst);
  nz(oc, t, 0.02).connect(filt(oc, 'bandpass', f * 1.6, 6)).connect(perc(oc, t, 0.0003, 0.012, g * 0.6)).connect(dst);
};
const drum = (oc, dst, t, g = 0.7) => {
  const b = osc(oc, 'sine', t, 0.6); pts(b.frequency, t, [[0, 120], [0.04, 78], [0.4, 62]], true);
  b.connect(perc(oc, t, 0.002, 0.35, g)).connect(dst);
  nz(oc, t, 0.06).connect(filt(oc, 'lowpass', 900)).connect(perc(oc, t, 0.001, 0.04, g * 0.5)).connect(dst);
};
const pluck = (oc, dst, t, f, g = 0.45) => {
  const o = osc(oc, 'triangle', t, 0.9, f), o2 = osc(oc, 'sine', t, 0.9, f * 2);
  const e = perc(oc, t, 0.004, 0.5, g); o.connect(e); o2.connect(gain(oc, 0.3)).connect(e); e.connect(filt(oc, 'lowpass', 1400)).connect(dst);
};

// ---- the theme: 8 bars (2 s each). Melody in beats (0.5 s); an answering phrase an octave-leap higher in bars 5-8
const MELODY = [
  ['A4', 1], ['B4', 0.5], ['D5', 0.5], ['E5', 2],
  ['D5', 0.5], ['E5', 0.5], ['D5', 0.5], ['B4', 0.5], ['A4', 2],
  ['F#4', 1], ['A4', 0.5], ['B4', 0.5], ['D5', 1], ['B4', 1],
  ['A4', 3], [null, 1],
  ['D5', 1], ['E5', 0.5], ['F#5', 0.5], ['A5', 2],
  ['F#5', 0.5], ['E5', 0.5], ['D5', 0.5], ['E5', 0.5], ['B4', 2],
  ['A4', 0.5], ['B4', 0.5], ['D5', 1], ['E5', 0.5], ['D5', 0.5], ['B4', 1],
  ['D5', 3], [null, 1],
];
const BASS = ['D2', 'D2', 'B2', 'A2', 'D2', 'B2', 'E2', 'D2'];
export function theme(oc, d) {
  const L = pan(oc, -0.25), R = pan(oc, 0.3); L.connect(d); R.connect(d);
  erhu(oc, R, 0.02, MELODY, 0.5, 0.55);
  for (let bar = 0; bar < 8; bar++) {
    const t = bar * 2, f = HZ[BASS[bar]];
    pluck(oc, L, t, f); pluck(oc, L, t + 1, f * 1.5, 0.3); pluck(oc, L, t + 1.5, f, 0.28);
    drum(oc, d, t, 0.7); drum(oc, d, t + 1.0, 0.45); if (bar % 2) drum(oc, d, t + 1.75, 0.35);
    for (const k of [0.5, 1.5]) woodblock(oc, L, t + k, 0.35, 1250);
    woodblock(oc, R, t + 1.25, 0.2, 1600);
  }
}
// ---- cutscene pad: D pentatonic chord bed, slowly moving (D6/9 → Bm7 → G6/9-ish without the 4th → A sus)
export function pad(oc, d) {
  const xf = xfade(16, 2), sum = gain(oc, 1), lp = filt(oc, 'lowpass', 1800, 0.6);
  sum.connect(lp).connect(xf(oc)).connect(d);
  const chords = [['D4', 'F#4', 'A4', 'B4', 'E5'], ['B3', 'D4', 'F#4', 'A4'], ['D4', 'E4', 'A4', 'B4'], ['A3', 'D4', 'E4', 'A4']];
  chords.forEach((c, k) => c.forEach((n, j) => {
    const t = k * 4, f = HZ[n];
    for (const [type, det, g] of [['triangle', 0, 0.16], ['sawtooth', 5, 0.05]]) {
      const o = osc(oc, type, t, 6.5, f); o.detune.value = det + (j - 2) * 2;
      o.connect(env(oc, t, [[0, 0], [1.4, g], [4.6, g], [6.4, 0]])).connect(pan(oc, (j - 2) * 0.3)).connect(sum);
    }
  }));
  osc(oc, 'sine', 0, 18, HZ.D2).connect(env(oc, 0, [[0, 0], [2, 0.12], [16, 0.12], [18, 0]])).connect(sum);
}
// ---- the end-title chord: D add9 across the range, a soft gong, one long high erhu note
export function endChord(oc, d) {
  for (const [n, g, p] of [['D2', 0.3, 0], ['A2', 0.22, -0.3], ['D4', 0.2, 0.2], ['F#4', 0.16, -0.2], ['A4', 0.16, 0.3], ['E5', 0.12, -0.4], ['A5', 0.08, 0.4]]) {
    const f = HZ[n];
    for (const [type, det] of [['triangle', 0], ['sawtooth', 6]]) {
      const o = osc(oc, type, 0, 7, f); o.detune.value = det;
      o.connect(env(oc, 0, [[0, 0], [0.6, g * (type === 'sawtooth' ? 0.35 : 1)], [4.5, g * 0.8], [7, 0]])).connect(filt(oc, 'lowpass', 2400)).connect(pan(oc, p)).connect(d);
    }
  }
  const gong = osc(oc, 'sine', 0, 7, 110), gm = osc(oc, 'sine', 0, 7, 163);
  const ge = env(oc, 0, [[0, 0], [0.02, 0.4], [6.5, 0]]); gong.connect(ge); gm.connect(gain(oc, 0.5)).connect(ge); ge.connect(d);
  const hi = pan(oc, 0.2); hi.connect(d);
  erhu(oc, hi, 0.8, [['A5', 8], ['F#5', 3]], 0.5, 0.25);
}
// ---- ambience loops (16 s, folded)
export function market(oc, d, B) {
  const xf = xfade(16, 2), air = filt(oc, 'lowpass', 5000); air.connect(d);
  for (let i = 0; i < 38; i++) smp(oc, air, pick(B.crowd), rnd(0, 16), rnd(0.9, 1.25), rnd(0.15, 0.45), rnd(-0.9, 0.9));    // chatter
  for (let i = 0; i < 26; i++) clank(oc, air, rnd(0, 16), rnd(1200, 3200), rnd(0.08, 0.2), rnd(0.05, 0.14));                  // pots, trays
  for (let i = 0; i < 22; i++) { const t = rnd(0, 16); nz(oc, t, 0.05).connect(filt(oc, 'lowpass', 600)).connect(perc(oc, t, 0.001, 0.05, rnd(0.2, 0.4))).connect(air); }   // chopping
  for (let burst = 0; burst < 9; burst++) {                                                                                     // mahjong tiles
    const t0 = rnd(0, 15), p = pan(oc, rnd(-0.7, 0.7)); p.connect(air);
    for (let k = 0; k < 7 + Math.floor(rnd(0, 8)); k++) { const t = t0 + k * rnd(0.04, 0.09); osc(oc, 'square', t, 0.03, rnd(2600, 3600)).connect(filt(oc, 'bandpass', 3200, 3)).connect(perc(oc, t, 0.0005, 0.018, rnd(0.08, 0.16))).connect(p); }
  }
  nz(oc, 0, 18).connect(filt(oc, 'highpass', 5200)).connect(xf(oc)).connect(gain(oc, 0.05)).connect(d);                   // a wok's sizzle
  nz(oc, 0, 18, 0.3).connect(filt(oc, 'lowpass', 160)).connect(xf(oc)).connect(gain(oc, 0.25)).connect(d);                 // the hum under it
}
export function pipes(oc, d) {
  const xf = xfade(16, 2);
  for (let t = rnd(0, 0.4); t < 16; t += rnd(0.25, 0.8)) {                                                                     // drips: a falling plink
    const o = osc(oc, 'sine', t, 0.2); pts(o.frequency, t, [[0, rnd(1400, 2600)], [0.06, rnd(700, 1100)]], true);
    o.connect(perc(oc, t, 0.001, 0.08, rnd(0.12, 0.3))).connect(pan(oc, rnd(-0.8, 0.8))).connect(d);
  }
  const w = filt(oc, 'bandpass', 420, 1.5), lfo = osc(oc, 'sine', 0, 18, 0.25), lg = gain(oc, 160); lfo.connect(lg).connect(w.frequency);
  nz(oc, 0, 18).connect(w).connect(xf(oc)).connect(gain(oc, 0.16)).connect(d);                                             // water moving in the pipes
}
export function rain(oc, d) {
  const xf = xfade(16, 2);
  for (const [f, q, g] of [[1800, 0.6, 0.3], [4200, 0.8, 0.22], [7800, 0.9, 0.12]]) nz(oc, 0, 18).connect(filt(oc, 'bandpass', f, q)).connect(xf(oc)).connect(gain(oc, g)).connect(d);
  for (let i = 0; i < 900; i++) { const t = rnd(0, 16), f = rnd(2200, 6400); osc(oc, 'sine', t, 0.05, f).connect(perc(oc, t, 0.0003, rnd(0.01, 0.04), rnd(0.02, 0.07))).connect(pan(oc, rnd(-1, 1))).connect(d); }   // tin pings
}
export function steam(oc, d) {
  const xf = xfade(16, 2), hp = filt(oc, 'highpass', 2400, 0.7), sw = curve(oc, 0, 18, (u) => 0.5 + 0.5 * Math.sin(u * 18 * 0.9) * Math.sin(u * 18 * 0.37));
  nz(oc, 0, 18).connect(hp).connect(sw).connect(xf(oc)).connect(gain(oc, 0.35)).connect(d);
}
export function tubes(oc, d) {
  const xf = xfade(16, 2), s = gain(oc, 1); s.connect(xf(oc)).connect(d);
  for (const [f, g] of [[100, 0.12], [200, 0.07], [300, 0.05], [400, 0.02]]) osc(oc, 'sawtooth', 0, 18, f).connect(filt(oc, 'lowpass', 900)).connect(gain(oc, g)).connect(s);
  for (let i = 0; i < 26; i++) { const t = rnd(0, 16); nz(oc, t, 0.08).connect(filt(oc, 'bandpass', rnd(3000, 6000), 2)).connect(perc(oc, t, 0.001, rnd(0.02, 0.07), rnd(0.1, 0.25))).connect(s); }   // flicker crackles
}
export function city(oc, d) {
  const xf = xfade(16, 2);
  nz(oc, 0, 18, 0.4).connect(filt(oc, 'lowpass', 220)).connect(xf(oc)).connect(gain(oc, 0.35)).connect(d);
  const sw = filt(oc, 'bandpass', 600, 0.7), lfo = osc(oc, 'sine', 0, 18, 1 / 9), lg = gain(oc, 300); lfo.connect(lg).connect(sw.frequency);
  nz(oc, 0, 18).connect(sw).connect(xf(oc)).connect(gain(oc, 0.12)).connect(d);                                            // distant traffic swells
}
export function jetRoar(oc, d) {
  const e = env(oc, 0, [[0, 0], [2.4, 0.9], [3.4, 1], [4.6, 0.7], [7, 0]]); e.connect(d);
  const lp = filt(oc, 'lowpass', 900, 0.7); pts(lp.frequency, 0, [[0, 600], [3.2, 4200], [7, 500]], true);
  nz(oc, 0, 7).connect(lp).connect(e);
  nz(oc, 0, 7, 0.2).connect(filt(oc, 'lowpass', 120)).connect(gain(oc, 1.2)).connect(shaper(oc, 2)).connect(e);   // rumble
  const w = osc(oc, 'sine', 0, 7); pts(w.frequency, 0, [[0, 3600], [3.4, 3200], [7, 2600]], true);
  w.connect(env(oc, 0, [[0, 0], [2.6, 0.06], [3.6, 0.1], [7, 0]])).connect(d);                                     // turbine whine
}
/** Bake the 城寨 layer into K (progressively; ambience and music first). B = the base bank (crowd voices). */
export async function buildKcBank(K, B) {
  const loop = (fn) => bakeLoop(16, 2, (oc, d) => fn(oc, d, B));
  [K.pad, K.market, K.pipes, K.rain, K.steam, K.tubes, K.city] = await Promise.all([loop(pad), loop(market), loop(pipes), loop(rain), loop(steam), loop(tubes), loop(city)]);
  [K.jet, K.endChord] = await Promise.all([bake(7.2, jetRoar, 2, 0.9, false), bake(7.4, endChord, 2, 0.9, false)]);
  return K;
}
