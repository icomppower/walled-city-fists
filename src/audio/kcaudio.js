// 城寨拳王 audio layer (render-only; plays ./kcbank.js on top of the base battle audio, audio.js): per-map ambience that
// follows the hero through the zones and the chapter scripts' fx (the market's clatter and mahjong tiles, the lane's
// dripping pipes and burst-pipe steam, the rooftops' city hum, the factory's steam and tube-light buzz, the tower's rain
// in the 蛇王's P3), the jets' fly-over roar with its Doppler (rate 1.12 → 0.9 as it passes, panned across), and the
// cutscenes: the base loops duck out, the pad and the scene's bed come in, the jet on its cue, the end-title chord under
// the card. A skipped (or left) cutscene / scroll fades its sound in 0.5 s. Audio randomness: Math.random (never the sim
// or visual RNG). Music: a track per scene (title, scroll, each map, boss, each cutscene, win / lose) — the synth score
// (./kcscore.js, baked on first need, looping natively) or, where one exists, a generated file (./kcassets.js, made in
// AI Studio; looping with a crossfade). It replaces the base theme + drums and the cutscene pad; a voice file per dialogue line plays with the line (battle story:say, cutscene subtitles,
// the Musou line) and dips the music; the playables' shouts replace the synth kiai. A = { ctx, out (→ the master mix),
// revIn, bedScale (the base loops' level), procMus (the synth theme + drums), vox (voice bus), B (base bank), game }.
import { on } from '../core/events.js';
import { MAP } from '../world/map.js';
import { buildKcBank } from './kcbank.js';
import { CUTSCENES } from '../story/cutscenes/data.js';
import { createAssets } from './kcassets.js';
import { SONGS, bakeSong } from './kcscore.js';

const FADE = 0.5;
const XF = 2.5, SWAP = 1.2;                                     // s: a looping track's restart crossfade; a track change
const ONCE = new Set(['win', 'lose', 'end']);                   // tracks that play through once
const HEAVY = new Set(['seiya', 'haa', 'uora']);                // base kiai keys voiced by the heavy shouts
const MUS = { battle: [0.36, 0.3], other: 0.6 }, DUCK = 0.45;  // music level (battle: + × combat intensity); × DUCK under a voice                                               // s: a skip fades the scene's sound out over this
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

  // ---- generated files: music tracks, voice lines, shouts
  const files = createAssets(ctx);
  let filesOk = false; files.ready.then(() => { filesOk = true; });
  const musDuck = ctx.createGain(), mus = ctx.createGain(); mus.gain.value = 0; mus.connect(musDuck).connect(A.out);
  let slot = null, track = null, win = false;
  function stopTrack(tr, f) {
    tr.dead = true; clearTimeout(tr.timer);
    const t = ctx.currentTime; tr.g.gain.cancelScheduledValues(t); tr.g.gain.setValueAtTime(tr.g.gain.value, t); tr.g.gain.linearRampToValueAtTime(0, t + f);
    for (const s of tr.srcs) try { s.stop(t + f + 0.05); } catch (e) { /* not started */ }
  }
  /** Switch to a slot's track (null / no file: silence here, the synth carries on); the old one fades over SWAP. */
  function playTrack(name) {
    if (name === slot) return;
    slot = name;
    if (track) stopTrack(track, SWAP);
    track = null;
    const file = files.hasMusic(name), p = file ? files.music(name) : synth(name);
    if (!p) return;
    const tr = track = { g: ctx.createGain(), srcs: new Set(), dead: false, timer: 0 };
    tr.g.gain.value = 0; tr.g.connect(mus);
    p.then((buf) => {
      if (!buf || tr.dead) { if (tr === track) track = null; return; }
      const t0 = ctx.currentTime + 0.05, once = ONCE.has(name), x = Math.min(XF, buf.duration / 4);
      tr.g.gain.setValueAtTime(0, t0); tr.g.gain.linearRampToValueAtTime(1, t0 + SWAP);
      const take = (at) => {
        const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = buf; s.connect(g).connect(tr.g);
        if (!file && !once) { s.loop = true; tr.srcs.add(s); s.start(at); return; }   // synth loops are baked seamless
        if (at > t0) { g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(1, at + x); }
        if (!once) { g.gain.setValueAtTime(1, at + buf.duration - x); g.gain.linearRampToValueAtTime(0, at + buf.duration); }
        s.onended = () => tr.srcs.delete(s); tr.srcs.add(s); s.start(at);
        const next = at + buf.duration - x;                     // the next take starts under this one's tail
        if (!once) tr.timer = setTimeout(() => { if (!tr.dead) take(next); }, Math.max(0, next - ctx.currentTime - 1) * 1000);
      };
      take(t0);
    });
  }
  const live = () => !!track;
  const baked = new Map();                                      // slot → Promise<AudioBuffer | null> (the synth score)
  function synth(slot) {
    if (!slot || !SONGS[slot]) return null;
    if (!baked.has(slot)) baked.set(slot, bakeSong(slot).catch((e) => { console.warn('score', slot, e); return null; }));
    return baked.get(slot);
  }
  const prebake = (...slots) => { for (const s of slots) if (!files.hasMusic(s)) synth(s); };
  files.ready.then(() => prebake('title', 'scroll'));
  on('scenario', () => setTimeout(() => prebake(MAP.id, 'boss', 'win', 'lose'), 0));                                   // a generated track is (about to be) playing

  const voBus = ctx.createGain(); voBus.connect(A.vox || A.out);
  let voSrc = null; const stats = { vo: 0 };                   // stats: bench/harness/audio-check.mjs
  /** A line's voice file, if there is one: one line at a time, the music dips under it. */
  function speak(zh, bus = voBus) {
    const p = files.vo(zh);
    if (!p) return;
    p.then((buf) => {
      if (!buf) return;
      if (voSrc) try { voSrc.stop(); } catch (e) { /* ended */ }
      const s = voSrc = ctx.createBufferSource(); s.buffer = buf; s.connect(bus);
      const r = ctx.createGain(); r.gain.value = 0.12; s.connect(r).connect(A.revIn);
      const t = ctx.currentTime; s.start(t); stats.vo++;
      musDuck.gain.cancelScheduledValues(t); musDuck.gain.setTargetAtTime(DUCK, t, 0.08); musDuck.gain.setTargetAtTime(1, t + buf.duration, 0.4);
    });
  }
  let shoutFor = null, origKiai = null;
  /** The playable's generated shouts replace the synth kiai (light keys / heavy keys); none: the synth ones. */
  async function applyShouts(char) {
    shoutFor = char; await A.bankReady; await files.ready;
    const B = A.B; if (!B.kiai || shoutFor !== char) return;
    origKiai = origKiai || { ...B.kiai };
    const p = files.shouts(char), [light, heavy] = p ? await p : [[], []];
    if (shoutFor !== char) return;
    for (const k in origKiai) { const a = HEAVY.has(k) ? heavy : light; B.kiai[k] = a.length ? a : origKiai[k]; }
  }
  on('scenario', (e) => applyShouts(e.char));
  on('story:say', (e) => { if (state === 'battle') speak(e.zh); });
  on('musou:end', () => { const l = game.hero.char.lines && game.hero.char.lines.musouEnd; if (state === 'battle' && l) speak(l.zh); });
  const bossOn = () => { const c = game.crowd; if (!c || !c.boss) return false; for (let i = 0; i < c.boss.length; i++) if (c.boss[i] && c.hp[i] > 0) return true; return false; };

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
    if (state === 'result') win = !!(e.ctx && e.ctx.win);
    if ((was === 'cutscene' || was === 'prologue' || was === 'ending') && state !== was) { clear(); fadeCut(); scene = null; }
  });
  on('cut:start', (e) => {
    scene = e.id; clear(); fadeEnd = 0; cut.gain.cancelScheduledValues(ctx.currentTime); cut.gain.setValueAtTime(1, ctx.currentTime);
    const S = CUTSCENES[e.id], F = (S && S.fx) || {};
    if (F.jet) timers.push(setTimeout(() => jet(0, 1, 1, cut), Math.max(0, ((F.jet.t0 + F.jet.t1) / 2 - 3.4) * 1000)));
    let at = 0;                                                  // voiced subtitles, on the scene clock
    for (const sh of (S && S.shots) || []) { for (const q of sh.sub || []) timers.push(setTimeout(() => speak(q.zh, cut), (at + q.at) * 1000)); at += sh.dur; }
    if (F.card && K.endChord && !SONGS[e.id] && !files.hasMusic(e.id)) timers.push(setTimeout(() => {
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
    // generated music: the scene's slot (a boss on the field: 'boss' if there is one); the synth theme / pad stand down
    if (filesOk) {
      const want = state === 'battle' ? (bossOn() ? 'boss' : map)
        : state === 'cutscene' ? scene : state === 'prologue' || state === 'ending' ? 'scroll'
        : state === 'result' ? (win ? 'win' : 'lose') : state === 'title' || state === 'select' || state === 'loading' ? 'title' : slot;
      playTrack(want);
      if (live()) L.pad = 0;
      mus.gain.setTargetAtTime(state === 'battle' ? MUS.battle[0] + MUS.battle[1] * (layer.intensity || 0) : MUS.other, t, 0.3);
    }
    A.procMus.gain.setTargetAtTime(live() && state === 'battle' ? 0 : 1, t, 0.5);
    for (const k in L) if (loops[k]) loops[k].gain.setTargetAtTime(L[k], t, 0.6);
    A.bedScale.gain.setTargetAtTime(bed, t, 0.4);
    // a story jet (kc1's fly-over, kc2's passes every 40 s): the roar peaks as it crosses
    if (state === 'battle' && fx.jet && fx.jet !== lastJet) { lastJet = fx.jet; jet(0, 0.9, Math.sign(Math.sin(fx.jet.yaw || 1)) || 1); }
  }
  requestAnimationFrame(frame);
  const layer = { K, cut, amb, files, stats, intensity: 0, track: () => slot, live };
  return layer;
}
