// 自由 Free mode gate (stage 8b): every map × playable × boss off / on (the map's own boss) starts from the deep link
// (?go=free&char&map[&boss]) into a live battle — the right chapter, the playable, the crowd moving, the boss on the field
// when asked (sim at 4× until he spawns) — with 0 console errors; then every boss by ?boss= on another map; then the
// in-page 自由 panel deploys (Enter cycles, 出陣).
//   node bench/harness/modes-free.mjs
import { openGame } from './browser.mjs';
const res = [], ok = (n, v, x = '') => { res.push(v); console.log(`${v ? 'ok  ' : 'FAIL'} ${n}${x ? '  ' + x : ''}`); };
const MAPS = ['alleys', 'rooftops', 'factories', 'tower'], OWN = { alleys: 'ox', rooftops: 'swallow', factories: 'goldtooth', tower: 'serpent' };
const fast = () => { window.__onStep = () => { const G = window.__vm && window.__vm.game; if (G && G.timeScale === 1) G.timeScale = 4; }; };
async function run(q, boss) {
  const g = await openGame({ query: q, init: fast }), P = g.page;
  await P.waitForFunction(() => __vm.state === 'battle', null, { timeout: 30000 }).catch(() => {});
  await P.waitForTimeout(boss ? 4500 : 2500);
  const r = await P.evaluate((boss) => { const G = __vm.game, c = G.crowd; let alive = 0; for (let i = 0; i < c.N; i++) if (c.st[i] && c.st[i] < 10) alive++;
    let bossOn = false; for (let i = c.grunts; i < c.N; i++) if (c.st[i] && G.story.modelOf(i) === boss) bossOn = true;
    return { s: __vm.state, ch: G.chapter, char: G.hero.char.id, frame: G.frame, alive, bossOn }; }, boss);
  await g.close();
  return { ...r, errors: g.errors };
}
for (const map of MAPS) for (const char of ['tit', 'chui']) for (const b of [null, OWN[map]]) {
  const r = await run(`?go=free&char=${char}&map=${map}${b ? '&boss=' + b : ''}`, b);
  ok(`${map} × ${char} × ${b || 'no boss'}`, r.s === 'battle' && r.ch === `free:${map}:${b || 'none'}` && r.char === char && r.alive > 30 && (!b || r.bossOn) && !r.errors.length,
    `frame ${r.frame}, ${r.alive} on the field${b ? ', boss ' + r.bossOn : ''}${r.errors.length ? ' ERR ' + r.errors[0] : ''}`);
}
for (const [b, map] of [['ox', 'tower'], ['swallow', 'alleys'], ['goldtooth', 'rooftops'], ['serpent', 'factories']]) {
  const r = await run(`?go=free&char=chui&map=${map}&boss=${b}`, b);
  ok(`?boss=${b} on ${map}`, r.s === 'battle' && r.bossOn && !r.errors.length, `${r.alive} on the field${r.errors.length ? ' ERR ' + r.errors[0] : ''}`);
}
// the panel: 自由 → cycle the map to 天台, 出陣 (the running count: in-page)
{
  const g = await openGame({}), P = g.page; await P.waitForTimeout(2500); await P.keyboard.press('Enter'); await P.waitForTimeout(900);
  await P.evaluate(() => [...document.querySelectorAll('#title .t-main button')].find((b) => b.textContent.includes('自由')).click()); await P.waitForTimeout(700);
  await P.evaluate(() => document.querySelectorAll('#title .t-sub button')[1].click()); await P.waitForTimeout(400);
  await P.evaluate(() => document.querySelectorAll('#title .t-sub button')[5].click());
  const b = await P.waitForFunction(() => __vm.state === 'battle', null, { timeout: 30000 }).then(() => true, () => false);
  const ch = await P.evaluate(() => __vm.game.chapter);
  ok('自由 panel: map cycled to 天台, 出陣 → the arena', b && ch === 'free:rooftops:none', ch);
  ok('0 console errors (panel)', !g.errors.length, g.errors.slice(0, 2).join(' | '));
  await g.close();
}
console.log(res.every(Boolean) ? `FREE PASS ${res.length}/${res.length}` : `FREE FAIL ${res.filter((v) => !v).length}`);
process.exit(res.every(Boolean) ? 0 : 1);
