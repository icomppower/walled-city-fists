// 影院 Cinema gate (stage 8b): from the title's 影院 panel, every one of the nine scenes (four prologue scrolls,
// between1-3, the ENDING scroll, the end scene) plays to its end on its own and comes back to the gallery; then one is
// skipped (Esc) back to the gallery; the ?go=cut&id= deep link opens a scene; 0 console errors.
//   node bench/harness/modes-gallery.mjs
import { openGame } from './browser.mjs';
const res = [], ok = (n, v, x = '') => { res.push(v); console.log(`${v ? 'ok  ' : 'FAIL'} ${n}${x ? '  ' + x : ''}`); };
const g = await openGame({}), P = g.page, wait = (ms) => P.waitForTimeout(ms);
await wait(2500); await P.keyboard.press('Enter'); await wait(900);
await P.evaluate(() => [...document.querySelectorAll('#title .t-main button')].find((b) => b.textContent.includes('影院')).click()); await wait(800);
const names = await P.evaluate(() => [...document.querySelectorAll('#title .t-sub button')].map((b) => b.querySelector('b').textContent));
ok('影院 lists nine scenes', names.length === 9, names.join(' · '));
for (let k = 0; k < names.length; k++) {
  await P.waitForFunction(() => __vm.state === 'title' && document.querySelector('#title').classList.contains('sub'), null, { timeout: 20000 });
  await wait(1200);
  await P.evaluate((k) => document.querySelectorAll('#title .t-sub button')[k].click(), k);
  const t0 = Date.now();
  const went = await P.waitForFunction(() => __vm.state !== 'title', null, { timeout: 10000 }).then(() => true, () => false);
  const which = await P.evaluate(() => __vm.state);
  const back = await P.waitForFunction(() => __vm.state === 'title' && document.querySelector('#title').classList.contains('sub'), null, { timeout: 90000, polling: 500 }).then(() => true, () => false);
  ok(`${names[k]}: plays to the end, back to 影院`, went && back, `${which}, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
await wait(1200);
await P.evaluate(() => document.querySelectorAll('#title .t-sub button')[5].click());
await P.waitForFunction(() => __vm.state === 'cutscene', null, { timeout: 10000 }); await wait(2000);
const s0 = Date.now(); await P.keyboard.press('Escape');
const sk = await P.waitForFunction(() => __vm.state === 'title' && document.querySelector('#title').classList.contains('sub'), null, { timeout: 6000 }).then(() => true, () => false);
ok('Esc skips a scene back to 影院', sk, `${((Date.now() - s0) / 1000).toFixed(1)} s`);
ok('0 console errors', !g.errors.length, g.errors.slice(0, 3).join(' | '));
await g.close();
const g2 = await openGame({ query: '?go=cut&id=between3' });
await g2.page.waitForTimeout(3000);
ok('?go=cut&id=between3 deep link', (await g2.page.evaluate(() => __vm.state)) === 'cutscene');
await g2.close();
console.log(res.every(Boolean) ? `GALLERY PASS ${res.length}/${res.length}` : `GALLERY FAIL ${res.filter((v) => !v).length}`);
process.exit(res.every(Boolean) ? 0 : 1);
