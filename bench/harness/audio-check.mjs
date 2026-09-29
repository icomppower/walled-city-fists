// Sound gate (stage 9), real page: an AnalyserNode on the master output (after the soft-clip ceiling) tracks the sample
// peak through free battles on all four maps (bot at 4× + a Musou each), between2 (the jet's Doppler) and the end scene
// (the end-title chord) — peak < −1 dBFS; the 城寨 bank bakes; no audio errors; a skipped cutscene's sound fades out in
// 0.5 s (its bus at ≈ half after 0.25 s, silent after 0.55 s). Generated files (media/audio/index.json, AI Studio): every
// listed file decodes; voiced lines play in battle. The synth score: every track bakes, sounds and loops at its bar
// length; each map / cutscene plays its own track.
//   node bench/harness/audio-check.mjs
import { openGame } from './browser.mjs';
const res = [], ok = (n, v, x = '') => { res.push(v); console.log(`${v ? 'ok  ' : 'FAIL'} ${n}${x ? '  ' + x : ''}`); };
const hook = () => {
  window.__peak = 0; window.__rms = [];
  const arm = () => {
    const A = window.__wcfAudio; if (!A) return setTimeout(arm, 200);
    const an = A.ctx.createAnalyser(); an.fftSize = 2048; A.tap.connect(an);
    const buf = new Float32Array(an.fftSize);
    setInterval(() => { an.getFloatTimeDomainData(buf); let m = 0, s = 0; for (const v of buf) { m = Math.max(m, Math.abs(v)); s += v * v; } window.__peak = Math.max(window.__peak, m); window.__rms.push(Math.sqrt(s / buf.length)); }, 40);
  };
  arm();
  import('/bench/bot/bot.mjs').then((m) => { const b = m.createBot(); window.__onStep = (inp) => { const G = window.__vm.game; if (window.__botOn) { Object.assign(inp, b(G)); if (G.timeScale === 1) G.timeScale = 4; if (G.frame % 900 === 450) G.hero.musou = G.hero.musouMax; } }; });
};
const g = await openGame({ init: hook }), P = g.page, wait = (ms) => P.waitForTimeout(ms);
await wait(2000); await P.keyboard.press('Enter'); await wait(500);          // a gesture: the context resumes
const baked = await P.waitForFunction(() => window.__wcfAudio && window.__wcfAudio.kc.K.pad && window.__wcfAudio.kc.K.jet && window.__wcfAudio.kc.K.endChord, null, { timeout: 30000 }).then(() => true, () => false);
ok('城寨 bank baked (theme, pad, ambiences, jet, end chord)', baked, await P.evaluate(() => Object.keys(window.__wcfAudio.kc.K).join(' ')));
ok('audio context running', (await P.evaluate(() => window.__wcfAudio.ctx.state)) === 'running');
const peaks = {}, tracks = {};
for (const map of ['alleys', 'rooftops', 'factories', 'tower']) {
  const { freeChapter } = { freeChapter: null };
  await P.evaluate(async (map) => { const f = await import('/src/story/free.js'); window.__botOn = true; __vm.flow.go('battle', { mode: 'story', char: 'tit', chapter: f.freeChapter(map, null).id, free: true }); }, map);
  await P.evaluate(() => { window.__peak = 0; window.__rms = []; });
  await wait(12000);
  tracks[map] = await P.evaluate(() => window.__wcfAudio.kc.track());
  peaks[map] = await P.evaluate(() => ({ peak: window.__peak, rms: window.__rms.reduce((a, v) => a + v, 0) / Math.max(1, window.__rms.length) }));
}
await P.evaluate(() => { window.__botOn = false; });
for (const [m, r] of Object.entries(peaks)) ok(`${m}: peak < −1 dBFS, sound present`, r.peak < 0.891 && r.rms > 0.005, `peak ${(20 * Math.log10(r.peak)).toFixed(1)} dBFS, mean rms ${(20 * Math.log10(r.rms)).toFixed(1)} dBFS`);
for (const id of ['between2', 'end']) {
  await P.evaluate(() => { window.__peak = 0; window.__rms = []; });
  await P.evaluate((id) => __vm.flow.go('cutscene', { id, then: 'title' }), id);
  await wait(3000); tracks[id] = await P.evaluate(() => window.__wcfAudio.kc.track());
  await P.waitForFunction(() => __vm.state === 'title', null, { timeout: 60000 });
  const r = await P.evaluate(() => ({ peak: window.__peak, rms: window.__rms.reduce((a, v) => a + v, 0) / Math.max(1, window.__rms.length) }));
  ok(`${id} (${id === 'end' ? 'the end chord' : 'the jet Doppler'}): peak < −1 dBFS`, r.peak < 0.891 && r.rms > 0.003, `peak ${(20 * Math.log10(r.peak)).toFixed(1)} dBFS, mean rms ${(20 * Math.log10(r.rms)).toFixed(1)} dBFS`);
}
// the synth score: every slot bakes, is not silent, loops at its bar length (once-tracks: at least it)
const sc = await P.evaluate(async () => { const m = await import('/src/audio/kcscore.js'), r = {};
  for (const k of m.SLOTS) { const t0 = performance.now(), b = await m.bakeSong(k), S = m.SONGS[k], len = S.bars * 8 * 30 / S.bpm; let pk = 0, ss = 0; const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) { pk = Math.max(pk, Math.abs(d[i])); ss += d[i] * d[i]; }
    r[k] = { ms: Math.round(performance.now() - t0), dur: +b.duration.toFixed(2), len: +len.toFixed(2), once: !!S.once, rms: Math.sqrt(ss / d.length) }; }
  return r; });
const scBad = Object.entries(sc).filter(([, r]) => r.rms < 0.02 || (r.once ? r.dur < r.len : Math.abs(r.dur - r.len) > 0.01));
ok('score: every track bakes, sounds, loops at its bar length', scBad.length === 0, Object.entries(sc).map(([k, r]) => `${k} ${r.dur}s ${r.ms}ms`).join(' · ') + (scBad.length ? ' BAD ' + scBad.map(([k]) => k).join(' ') : ''));
ok('each map / scene plays its own track', Object.entries(tracks).every(([k, v]) => v === k || v === 'boss'), Object.entries(tracks).map(([k, v]) => `${k}→${v}`).join(' '));
// generated files
const idx = await P.evaluate(() => window.__wcfAudio.kc.files.index);
const nFiles = Object.keys(idx.music).length + Object.keys(idx.vo).length + Object.values(idx.shout).reduce((a, s) => a + s.light.length + s.heavy.length, 0);
if (nFiles) {
  const dec = await P.evaluate(async () => { const F = window.__wcfAudio.kc.files, I = F.index, all = [...Object.values(I.music), ...Object.values(I.vo), ...Object.values(I.shout).flatMap((s) => [...s.light, ...s.heavy])];
    const b = await Promise.all(all.map((f) => F.load(f))); return { n: all.length, bad: all.filter((f, i) => !b[i]) }; });
  ok('generated files decode', dec.bad.length === 0, `${dec.n - dec.bad.length}/${dec.n}${dec.bad.length ? ' bad: ' + dec.bad.slice(0, 4).join(' ') : ''}`);
  const vo = await P.evaluate(() => window.__wcfAudio.kc.stats.vo);
  if (Object.keys(idx.vo).length) ok('voiced lines play', vo > 0, `${vo} lines voiced`);
} else console.log('     (no generated audio files yet: synth only)');
// the skip fade
await P.evaluate(() => __vm.flow.go('cutscene', { id: 'end', then: 'title' }));
await wait(5000);
const before = await P.evaluate(() => window.__wcfAudio.kc.cut.gain.value);
await P.evaluate(() => { window.__esc = 0; addEventListener('keydown', (e) => { if (e.code === 'Escape' && !window.__esc) window.__esc = performance.now(); }, true);
  window.__fade = new Promise((ok) => { const g = window.__wcfAudio.kc.cut.gain; let half = 0; const tick = () => { if (window.__esc) { const dt = (performance.now() - window.__esc) / 1000;
    if (!half && g.value < 0.5) half = dt; if (g.value < 0.01) return ok({ half, zero: dt }); } requestAnimationFrame(tick); }; tick(); }); });
await P.keyboard.press('Escape');
const f = await P.evaluate(() => window.__fade);
ok('skip fades the scene out in 0.5 s', before > 0.9 && f.half > 0.15 && f.half < 0.35 && f.zero <= 0.56, `bus ${before.toFixed(2)} → half at ${f.half.toFixed(2)} s → silent at ${f.zero.toFixed(2)} s after the key`);
const aerr = g.errors.filter((e) => /audio|Audio/.test(e));
ok('no audio errors', aerr.length === 0 && g.errors.length === 0, g.errors.slice(0, 3).join(' | '));
await g.close();
console.log(res.every(Boolean) ? `AUDIO PASS ${res.length}/${res.length}` : `AUDIO FAIL ${res.filter((v) => !v).length}`);
process.exit(res.every(Boolean) ? 0 : 1);
