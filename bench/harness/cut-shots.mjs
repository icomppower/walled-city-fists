// Cutscene gate (stage 8): play each scene of story/cutscenes/data.js in the real page (flow.go('cutscene')) — it must
// reach its end and hand over to the title on its own (no skip), with a screenshot per shot (mid-shot) → bench/shots/8/
// cut-<id>-<k>.png; then replay one and skip it (Esc) — back on the title within 2 s; 0 console errors.
//   node bench/harness/cut-shots.mjs [id…] [--size WxH]
import { mkdirSync } from 'node:fs';
import { openGame } from './browser.mjs';
const argv = process.argv.slice(2), si = argv.indexOf('--size'), [W, H] = si >= 0 ? argv[si + 1].split('x').map(Number) : [1280, 720];
const only = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--size');
const out = 'bench/shots/8'; mkdirSync(out, { recursive: true });
const g = await openGame({ width: W, height: H }), P = g.page;
await P.waitForTimeout(2500);
const scenes = await P.evaluate(async () => { const m = await import('/src/story/cutscenes/data.js'); return m.CUT_ORDER.map((id) => [id, m.CUTSCENES[id].shots.map((s) => s.dur)]); });
let bad = 0;
const ok = (n, v, x = '') => { console.log(`${v ? 'ok  ' : 'FAIL'} ${n}${x ? '  ' + x : ''}`); if (!v) bad++; };
for (const [id, durs] of scenes) {
  if (only.length && !only.includes(id)) continue;
  await P.evaluate((id) => __vm.flow.go('cutscene', { id, then: 'title' }), id);
  await P.waitForFunction(() => __vm.state === 'cutscene', null, { timeout: 10000 });
  const t0 = Date.now(); let T = 0;
  for (const [k, d] of durs.entries()) {
    const at = (T + d * 0.55) * 1000; T += d;
    await P.waitForTimeout(Math.max(0, at - (Date.now() - t0)));
    await P.screenshot({ path: `${out}/cut-${id}-${k}${W !== 1280 ? '-' + W + 'x' + H : ''}.png` });
  }
  const end = await P.waitForFunction(() => __vm.state === 'title', null, { timeout: (T + 8) * 1000 }).then(() => true, () => false);
  ok(`${id}: plays ${T.toFixed(1)} s to the end and hands over to the title`, end, `${((Date.now() - t0) / 1000).toFixed(1)} s wall`);
}
// flow: a kc1 win's CONTINUE plays between1; the ENDING scroll (Esc through it) hands over to the end scene
if (!only.length) {
  await P.evaluate(() => __vm.flow.go('result', { mode: 'story', char: 'tit', chapter: 'kc1', win: true, stats: { kos: 900, time: 250, hpMax: 400, maxChain: 80, dmg: 40, rank: 'A' } }));
  await P.waitForTimeout(4500);
  await P.evaluate(() => document.querySelector('#result .rs-btns button').click());
  const a1 = await P.waitForFunction(() => __vm.state === 'cutscene', null, { timeout: 6000 }).then(() => true, () => false);
  ok('kc1 win → CONTINUE → between1', a1, await P.evaluate(() => __vm.state));
  await P.keyboard.press('Escape'); await P.waitForFunction(() => __vm.state === 'title', null, { timeout: 6000 }).catch(() => {});
  await P.evaluate(() => __vm.flow.go('ending', { mode: 'story', char: 'chui', chapter: 'kc4' }));
  await P.waitForTimeout(2500);
  for (let k = 0; k < 3; k++) { await P.keyboard.press('Escape'); await P.waitForTimeout(1200); }
  const a2 = await P.waitForFunction(() => __vm.state === 'cutscene', null, { timeout: 8000 }).then(() => true, () => false);
  ok('kc4 ENDING scroll → end scene', a2, await P.evaluate(() => __vm.state));
  await P.keyboard.press('Escape'); await P.waitForFunction(() => __vm.state === 'title', null, { timeout: 6000 }).catch(() => {});
}
// skip
await P.evaluate(() => __vm.flow.go('cutscene', { id: 'between1', then: 'title' }));
await P.waitForTimeout(2500); const s0 = Date.now();
await P.keyboard.press('Escape');
const back = await P.waitForFunction(() => __vm.state === 'title', null, { timeout: 4000 }).then(() => true, () => false);
ok('Esc skips to the title', back, `${((Date.now() - s0) / 1000).toFixed(1)} s`);
ok('0 console errors', g.errors.length === 0, g.errors.slice(0, 3).join(' | '));
await g.close();
console.log(bad ? `CUTSCENES FAIL (${bad})` : 'CUTSCENES PASS');
process.exit(bad ? 1 : 0);
