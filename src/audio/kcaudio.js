// 城寨拳王 audio layer (render-only; plays ./kcbank.js on top of the base battle audio, audio.js): per-map ambience that
// follows the hero through the zones and the chapter scripts' fx (the market's clatter and mahjong tiles, the lane's
// dripping pipes and burst-pipe steam, the rooftops' city hum, the factory's steam and tube-light buzz, the tower's rain
// in the 蛇王's P3), the jets' fly-over roar with its Doppler (rate 1.12 → 0.9 as it passes, panned across), and the
// cutscenes: the base loops duck out, the pad and the scene's bed come in, the jet on its cue, the end-title chord under
// the card. A skipped (or left) cutscene / scroll fades its sound in 0.5 s. Audio randomness: Math.random (never the sim
// or visual RNG). A = { ctx, out (→ the master mix), revIn, bedScale (the base loops' level), B (base bank), game }.
import { on } from '../core/events.js';
import { MAP } from '../world/map.js';
import { buildKcBank } from './kcbank.js';
import { CUTSCENES } from '../story/cutscenes/data.js';

const FADE = 0.5;                                               // s: a skip fades the scene's sound out over this
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const band = (v, a, b, e = 6) => clamp(Math.min(v - a, b - v) / e + 0.5, 0, 1);   // 1 inside [a, b], easing out over e m

export function createKcLayer(A) {
  const { ctx, game } = A, K = {}, loops = {};
  const amb = ctx.createGain(); amb.connect(A.out);              // ambience bus (a little of it to the reverb)
  const ambSend = ctx.createGain(); ambSend.gain.value = 0.2; amb.connect(ambSend).connect(A.revIn);
  const cut = ctx.createGain(); cut.connect(A.out);               // the cutscene / scroll bus: pad, scene jets, the end chord
  const cutSend = ctx.createGain(); cutSend.gain.value = 0.25; cut.connect(cutSend).connect(A.revIn);
  let state = 'title', scene = null, timers = [], lastJet = null;
  const ready = () => !!K.pad;

  function startLoops() {
    for (const k of ['market', 'pipes', 'rain', 'steam', 'tubes', 'city']) {
      const s = ctx.createBufferSource(); s.buffer = K[k]; s.loop = true;
      const g = ctx.createGain(); g.gain.value = 0; s.connect(g).connect(amb); s.start(ctx.currentTime + 0.05 + Math.random() * 0.3);
      loops[k] = g;
    }
    const s = ctx.createBufferSource(); s.buffer = K.pad; s.loop = true;
    const g = ctx.createGain(); g.gain.value = 0; s.connect(g).connect(cut); s.start(ctx.currentTime + 0.05);
    loops.pad = g;
  }
  A.bankReady.then(() => buildKcBank(K, A.B)).then(startLoops, (e) => console.warn('kc audio bank', e));

  /** The fly-over: rate ramps through the pass (Doppler), pan sweeps across, level from how near it comes. */
  function jet(delay, near = 1, dir = 1, bus = amb) {
    if (!K.jet) return;
    const t = ctx.currentTime + delay, s = ctx.createBufferSource(); s.buffer = K.jet;
    s.playbackRate.setValueAtTime(1.12, t); s.playbackRate.linearRampToValueAtTime(1.04, t + 2.8); s.playbackRate.linearRampToValueAtTime(0.9, t + 4.2);
    const g = ctx.createGain(); g.gain.value = 0.55 * near;
    const p = ctx.createStereoPanner(); p.pan.setValueAtTime(-0.8 * dir, t); p.pan.linearRampToValueAtTime(0.8 * dir, t + 6.4);
    s.connect(g).connect(p).connect(bus); s.start(t);
    const r = ctx.createGain(); r.gain.value = 0.3; p.connect(r).connect(A.revIn);
  }
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  let fadeEnd = 0;
  const fadeCut = () => {                                         // 0.5 s linear fade of the scene's sound, then reset
    const t = ctx.currentTime; if (t < fadeEnd) return;           // one fade per exit (cut:end and the flow change both ask)
    fadeEnd = t + FADE + 0.6;
    cut.gain.cancelScheduledValues(t); cut.gain.setValueAtTime(cut.gain.value, t); cut.gain.linearRampToValueAtTime(0, t + FADE);
    timers.push(setTimeout(() => { cut.gain.cancelScheduledValues(ctx.currentTime); cut.gain.setValueAtTime(1, ctx.currentTime); }, FADE * 1000 + 700));
  };
  A.fadeCut = fadeCut;

  on('flow', (e) => {
    const was = state; state = e.state;
    if ((was === 'cutscene' || was === 'prologue' || was === 'ending') && state !== was) { clear(); fadeCut(); scene = null; }
  });
  on('cut:start', (e) => {
    scene = e.id; clear(); fadeEnd = 0; cut.gain.cancelScheduledValues(ctx.currentTime); cut.gain.setValueAtTime(1, ctx.currentTime);
    const S = CUTSCENES[e.id], F = (S && S.fx) || {};
    if (F.jet) timers.push(setTimeout(() => jet(0, 1, 1, cut), Math.max(0, ((F.jet.t0 + F.jet.t1) / 2 - 3.4) * 1000)));
    if (F.card && K.endChord) timers.push(setTimeout(() => {
      const s = ctx.createBufferSource(); s.buffer = K.endChord; const g = ctx.createGain(); g.gain.value = 0.8; s.connect(g).connect(cut); s.start();
    }, Math.max(0, F.card.at - 0.4) * 1000));
  });
  on('cut:end', () => { clear(); fadeCut(); });

  // ---- levels every frame
  function frame() {
    requestAnimationFrame(frame);
    if (!ready() || ctx.state !== 'running' || !loops.city) return;
    const t = ctx.currentTime, fx = (game.story && game.story.fx) || {}, h = game.hero, z = h.z, map = MAP.id;
    const L = { market: 0, pipes: 0, rain: 0, steam: 0, tubes: 0, city: 0, pad: 0 };
    let bed = 1;
    if (state === 'cutscene') {
      bed = 0; L.pad = 0.42;
      if (scene === 'between1') { L.rain = 0.7; L.market = 0.25; }
      else if (scene === 'between2') { L.pipes = 0.45; L.steam = 0.2; L.city = 0.35; }
      else if (scene === 'between3') { L.city = 0.4; L.tubes = 0.12; }
      else if (scene === 'end') { L.city = 0.3; L.pad = 0.5; }
    } else if (state === 'prologue' || state === 'ending') { bed = 0.2; L.pad = 0.35; L.city = 0.2; }
    else if (map === 'alleys') {
      L.market = 0.5 * band(z, -160, -96); L.pipes = 0.5 * band(z, -98, -44); L.city = 0.25;
      if (fx.steam != null && fx.now - fx.steam < 50 * 60) L.steam = 0.35 * band(z, -98, -44);
    } else if (map === 'rooftops') L.city = 0.5;
    else if (map === 'factories') { L.steam = 0.3 * band(z, -160, -106); L.tubes = 0.45 * band(z, -58, -24) * (fx.dark ? 0.2 : 1); L.city = 0.18; }
    else if (map === 'tower') { L.city = 0.4; L.rain = fx.rain ? 0.65 : 0; }
    for (const k in L) if (loops[k]) loops[k].gain.setTargetAtTime(L[k], t, 0.6);
    A.bedScale.gain.setTargetAtTime(bed, t, 0.4);
    // a story jet (kc1's fly-over, kc2's passes every 40 s): the roar peaks as it crosses
    if (state === 'battle' && fx.jet && fx.jet !== lastJet) { lastJet = fx.jet; jet(0, 0.9, Math.sign(Math.sin(fx.jet.yaw || 1)) || 1); }
  }
  requestAnimationFrame(frame);
  return { K, cut, amb };
}
