// 故事 Campaign gate (stage 8b), real page: title → 故事 → 新遊戲 → 普通 → select → 出陣 → kc1's prologue (skipped) → the
// battle played by the bot (sim at 4× through the step hook) → result → 繼續 → between1 (skipped) → kc2 … kc4 → result →
// the ENDING scroll → the end scene → title; every chapter in order. Then: the clear-state persists across a reload (故事
// shows 繼續 at the first uncleared chapter), and a page whose localStorage throws still starts the campaign at kc1.
//   node bench/harness/modes-campaign.mjs
import { openGame } from './browser.mjs';
const res = [], ok = (n, v, x = '') => { res.push(v); console.log(`${v ? 'ok  ' : 'FAIL'} ${n}${x ? '  ' + x : ''}`); };
const bot = () => {
  import('/bench/bot/bot.mjs').then((m) => { const b = m.createBot(); window.__onStep = (inp) => { const G = window.__vm.game; Object.assign(inp, b(G)); if (G.timeScale === 1) G.timeScale = 4; }; });
};
const g = await openGame({ init: bot }), P = g.page, wait = (ms) => P.waitForTimeout(ms);
const state = () => P.evaluate(() => ({ s: __vm.state, ch: __vm.game.chapter, char: __vm.game.hero.char.id }));
const until = (fn, ms, arg) => P.waitForFunction(fn, arg, { timeout: ms, polling: 250 }).then(() => true, () => false);
await wait(2500);
await P.evaluate(async () => { (await import('/src/story/campaign.js')).resetCampaign(); });
await P.keyboard.press('Enter'); await wait(900);                         // wake
await P.evaluate(() => [...document.querySelectorAll('#title .t-main button')].find((b) => b.textContent.includes('故事')).click()); await wait(700);
await P.evaluate(() => [...document.querySelectorAll('#title .t-sub button')].find((b) => b.textContent.includes('新遊戲')).click()); await wait(700);
await P.keyboard.press('Enter');                                           // 普通
ok('故事 → 新遊戲 → difficulty → select', await until(() => __vm.state === 'select', 8000));
await wait(1800); await P.keyboard.press('Enter');                        // 出陣 (the chapter is fixed)
const order = [];
for (const want of ['kc1', 'kc2', 'kc3', 'kc4']) {
  const pro = await until((w) => __vm.state === 'prologue' && __vm.game.chapter === w, 30000, want);
  ok(`${want}: prologue`, pro, JSON.stringify(await state()));
  await wait(1500); await P.keyboard.press('Escape');                      // one Esc skips the scroll (down: stamp, up: go)
  ok(`${want}: battle`, await until((w) => __vm.state === 'battle' && __vm.game.chapter === w, 15000, want));
  const t0 = Date.now();
  let won = false;
  for (let k = 0; k < 36 && !won; k++) {                                   // 12 min, a progress line every 20 s
    won = await until(() => __vm.state === 'result', 20000);
    if (!won) console.log('     …', JSON.stringify(await P.evaluate(() => ({ s: __vm.state, paused: __vm.paused, f: __vm.game.frame, z: +__vm.game.hero.z.toFixed(1), ts: __vm.game.timeScale, obj: document.querySelector('#hud .h-obj')?.innerText.slice(0, 40) }))));
  }
  const r = await P.evaluate(() => ({ win: document.querySelector('#result')?.classList.contains('lose') === false, st: __vm.state }));
  ok(`${want}: won by the bot`, won && r.win, `${((Date.now() - t0) / 1000).toFixed(0)} s wall`);
  order.push(want);
  await wait(4500); await P.evaluate(() => document.querySelector('#result .rs-btns button').click());
  if (want !== 'kc4') {
    ok(`${want}: → between-scene`, await until(() => __vm.state === 'cutscene', 8000));
    await wait(1200); await P.keyboard.press('Escape');
    ok(`${want}: → next chapter's loading card`, await until(() => __vm.state === 'loading' || __vm.state === 'prologue', 10000));
  }
}
ok('kc4 → ENDING scroll', await until(() => __vm.state === 'ending', 10000));
await wait(1500); await P.keyboard.press('Escape');
ok('ENDING → end scene', await until(() => __vm.state === 'cutscene', 10000));
await wait(1500); await P.keyboard.press('Escape');
ok('end scene → title', await until(() => __vm.state === 'title', 10000));
ok('chapters in order kc1 → kc4', order.join(' ') === 'kc1 kc2 kc3 kc4', order.join(' '));
const saved = await P.evaluate(async () => (await import('/src/story/campaign.js')).cleared());
ok('clear-state saved', saved.join(' ') === 'kc1 kc2 kc3 kc4', saved.join(' '));
// persistence across a reload: two clears → 繼續 at III
await P.evaluate(async () => { const c = await import('/src/story/campaign.js'); c.resetCampaign(); c.markCleared('kc1'); c.markCleared('kc2'); });
await P.reload(); await P.waitForFunction(() => window.__vm && __vm.state === 'title', null, { timeout: 60000 }); await wait(2500);
await P.keyboard.press('Enter'); await wait(900);
await P.evaluate(() => [...document.querySelectorAll('#title .t-main button')].find((b) => b.textContent.includes('故事')).click()); await wait(700);
const rows = await P.evaluate(() => [...document.querySelectorAll('#title .t-sub button')].map((b) => b.innerText.replace(/\s+/g, ' ')));
ok('after a reload: 繼續 → Chapter III', rows[0] && rows[0].includes('繼續') && rows[0].includes('III'), rows.join(' | '));
ok('0 console errors (campaign page)', g.errors.length === 0, g.errors.slice(0, 3).join(' | '));
await g.close();
// storage blocked
const g2 = await openGame({ init: () => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); } }), P2 = g2.page;
await P2.waitForTimeout(2500); await P2.keyboard.press('Enter'); await P2.waitForTimeout(900);
await P2.evaluate(() => [...document.querySelectorAll('#title .t-main button')].find((b) => b.textContent.includes('故事')).click()); await P2.waitForTimeout(700);
const rows2 = await P2.evaluate(() => [...document.querySelectorAll('#title .t-sub button')].map((b) => b.innerText.split('\n')[0]));
await P2.evaluate(() => [...document.querySelectorAll('#title .t-sub button')].find((b) => b.textContent.includes('新遊戲')).click()); await P2.waitForTimeout(700);
await P2.keyboard.press('Enter'); await P2.waitForTimeout(2500); await P2.keyboard.press('Enter');
const pro2 = await P2.waitForFunction(() => __vm.state === 'prologue' && __vm.game.chapter === 'kc1', null, { timeout: 30000 }).then(() => true, () => false);
ok('storage blocked: 故事 starts clean at kc1', pro2 && rows2.join() === '新遊戲', rows2.join(' | '));
ok('0 console errors (storage blocked)', g2.errors.length === 0, g2.errors.slice(0, 3).join(' | '));
await g2.close();
console.log(res.every(Boolean) ? `CAMPAIGN PASS ${res.length}/${res.length}` : `CAMPAIGN FAIL ${res.filter((v) => !v).length}`);
process.exit(res.every(Boolean) ? 0 : 1);
