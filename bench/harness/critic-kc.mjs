// Critic capture (stage 10): fixed-seed screenshots at 1280×720 (desktop) and 844×390 (touch, mobile tier) →
// bench/shots/10/<round>/: the title (press-key, menu, 故事 / 自由 / 影院 panels, difficulty), select, the loading card, every
// zone of every map (the dev free field: gates open, the hero placed at the zone's stand point, the army round the origin),
// every Musou (both playables, three moments each: the sweeps / cuts, the flurry / punches, the finisher), a card of every
// scroll (the four prologues, the ENDING), the result (win + defeat). Cutscene shots come from cut-shots.mjs (both sizes).
//   node bench/harness/critic-kc.mjs [round] [--only ui|zones|musou|scrolls]
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { serve } from './browser.mjs';
const round = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'r1';
const oi = process.argv.indexOf('--only'), only = oi > 0 ? process.argv[oi + 1] : null;
const out = new URL(`../shots/10/${round}/`, import.meta.url).pathname; mkdirSync(out, { recursive: true });
const srv = await serve(), browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const errs = [];
const SIZES = [[1280, 720, false], [844, 390, true]];
async function page(w, h, touch, q = '', init = null) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: touch ? 2.625 : 1 });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(`${w}: ${e}`)); p.on('console', (m) => { if (m.type() === 'error') errs.push(`${w}: ${m.text()}`); });
  if (init) await p.addInitScript(init);
  await p.goto(srv.url + q); await p.waitForFunction(() => window.__vm?.state, null, { timeout: 90000 });
  return { p, ctx };
}
const tag = (w, h) => `${w}x${h}`;
const click = (p, sel, txt) => p.evaluate(([sel, txt]) => [...document.querySelectorAll(sel)].find((b) => b.textContent.includes(txt))?.click(), [sel, txt]);

if (!only || only === 'ui') for (const [w, h, touch] of SIZES) {
  const { p, ctx } = await page(w, h, touch, '?x');
  const s = (n) => p.screenshot({ path: `${out}ui-${n}-${tag(w, h)}.png` });
  await p.waitForTimeout(3000); await s('01-title-press');
  await p.keyboard.press('Enter'); await p.waitForTimeout(1200); await s('02-title-menu');
  await click(p, '#title .t-main button', '故事'); await p.waitForTimeout(900); await s('03-story-panel');
  await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  await click(p, '#title .t-main button', '自由'); await p.waitForTimeout(900); await s('04-free-panel');
  await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  await click(p, '#title .t-main button', '影院'); await p.waitForTimeout(900); await s('05-gallery-panel');
  await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  await click(p, '#title .t-main button', '故事'); await p.waitForTimeout(600); await click(p, '#title .t-sub button', '新遊戲'); await p.waitForTimeout(900); await s('06-difficulty');
  await p.keyboard.press('Enter'); await p.waitForTimeout(2600); await s('07-select-tit');
  await p.keyboard.press('ArrowDown'); await p.waitForTimeout(1500); await s('08-select-chui');
  await p.keyboard.press('Enter'); await p.waitForTimeout(2200); await s('09-loading');
  await p.waitForTimeout(6000); await s('10-prologue');
  await p.evaluate(() => __vm.flow.go('result', { mode: 'story', char: 'chui', chapter: 'kc2', win: true, stats: { kos: 1480, time: 253, hpMax: 400, maxChain: 312, dmg: 104, rank: 'A' } }));
  await p.waitForTimeout(4500); await s('11-result-win');
  await p.evaluate(() => __vm.flow.go('result', { mode: 'story', char: 'tit', chapter: 'kc3', win: false, stats: { kos: 610, time: 190, hpMax: 400, maxChain: 88, dmg: 400 } }));
  await p.waitForTimeout(3500); await s('12-result-lose');
  await ctx.close();
  console.log(`ui ${tag(w, h)}: 12 shots`);
}

const ZONES = {
  kc1: [['market', 0, -138, 0], ['market-back', 0, -104, Math.PI], ['lane', -3, -80, 0.3], ['lane-top', 1, -58, 0], ['irongate', 0, -36, 0], ['yamen', 0, -4, 0], ['yamen-hall', 0, 14, 0]],
  kc2: [['aerials', 0, -140, 0], ['aerials-hut', -6, -118, -1.2], ['plank', 0, -97, 0], ['plank2', 1, -70, 0.2], ['tanks', 0, -46, 0], ['stair', 0, -24, 0], ['peak', 0, 4, 0]],
  kc3: [['fishball', 0, -140, 0], ['fishball-back', 0, -114, Math.PI], ['stairs', 0, -100, 0], ['stairs-top', 0, -64, 0], ['dentists', 0, -44, 0], ['boiler', 0, -10, 0], ['boiler-fire', 0, 2, 0]],
  kc4: [['lobby', 0, -140, 0], ['well-foot', 9, -104, 0], ['well-bridge', 3, -83, -1.2], ['well-top', -9, -64, 0], ['gatehouse', 0, -42, 0], ['crown', 0, -6, 0], ['crown-pavilion', 0, 8, 0]],
};
if (!only || only === 'zones') for (const [w, h, touch] of SIZES) for (const [ch, list] of Object.entries(ZONES)) {
  const { p, ctx } = await page(w, h, touch, `?go=free&char=${ch === 'kc2' || ch === 'kc4' ? 'chui' : 'tit'}&ch=${ch}`);
  await p.waitForTimeout(2500);
  for (const [name, x, z, yaw] of list) {
    await p.evaluate(([x, z, yaw]) => { const G = __vm.game; G.hero.x = x; G.hero.z = z; G.hero.yaw = yaw; G.cam.yaw = yaw; G.cam.ctrl = yaw; }, [x, z, yaw]);
    await p.waitForTimeout(1600);
    await p.screenshot({ path: `${out}zone-${ch}-${name}-${tag(w, h)}.png` });
  }
  await ctx.close();
  console.log(`zones ${ch} ${tag(w, h)}: ${list.length} shots`);
}

if (!only || only === 'musou') for (const [w, h, touch] of SIZES) for (const [char, map] of [['tit', 'alleys'], ['chui', 'rooftops']]) {
  const bot = () => import('/bench/bot/bot.mjs').then((m) => { const b = m.createBot(); window.__onStep = (inp) => { if (!window.__hold) Object.assign(inp, b(window.__vm.game)); }; });
  const { p, ctx } = await page(w, h, touch, `?go=free&char=${char}&map=${map}`, bot);
  await p.waitForTimeout(9000);
  await p.evaluate(() => { const G = __vm.game; G.hero.musou = G.hero.musouMax; window.__hold = true; window.__onStep = (inp) => { if (G.hero.state !== 'musou' && !window.__fired) { inp.pressed.musou = inp.held.musou = true; } if (G.hero.state === 'musou') window.__fired = true; }; });
  for (const [k, f] of [[1, 60], [2, 135], [3, 186]]) {
    await p.waitForFunction((f) => __vm.game.hero.state === 'musou' && __vm.game.musou.t >= f, f, { timeout: 30000 }).catch(() => {});
    await p.screenshot({ path: `${out}musou-${char}-${k}-${tag(w, h)}.png` });
  }
  await ctx.close();
  console.log(`musou ${char} ${tag(w, h)}: 3 shots`);
}

if (!only || only === 'scrolls') for (const [w, h, touch] of SIZES) {
  const { p, ctx } = await page(w, h, touch, '?x');
  await p.waitForTimeout(2500);
  for (const [part, ch, char] of [['prologue', 'kc1', 'tit'], ['prologue', 'kc2', 'chui'], ['prologue', 'kc3', 'tit'], ['prologue', 'kc4', 'chui'], ['ending', 'kc4', 'chui']]) {
    await p.evaluate(([part, ch, char]) => __vm.flow.go(part, { mode: 'story', char, chapter: ch, gallery: true }), [part, ch, char]);
    await p.waitForTimeout(5200);
    await p.screenshot({ path: `${out}scroll-${part}-${ch}-${tag(w, h)}.png` });
    await p.evaluate(() => __vm.flow.go('title'));
    await p.waitForTimeout(1500);
  }
  await ctx.close();
  console.log(`scrolls ${tag(w, h)}: 5 shots`);
}
await browser.close(); srv.close();
console.log(errs.length ? 'ERRORS ' + errs.slice(0, 4).join(' | ') : 'critic shots done, 0 console errors');
process.exit(errs.length ? 1 : 0);
