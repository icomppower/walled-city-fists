// Title gate (stage 0+): boot the title, wake it, and assert the page carries only 城寨拳王 content — logo, <title>, menu
// items, name tags — and no text from the base game (香港自由戰士) or upstream's menus outside ?dev. Also boots ?dev (the
// 定軍山 pair registered) and checks 0 console errors both ways. Screenshot → bench/shots/<dir>/title.png.
//   node bench/harness/title-check.mjs [shot dir = bench/shots/0]
import { openGame } from './browser.mjs';
const dir = process.argv[2] || 'bench/shots/0';
const BAN = /香港|自由戰士|龍仔|小美|金鐘|立法會|元朗|理工|HK FREEDOM|Hong Kong, 2019/;
let fail = 0;
const ok = (name, v, info = '') => { console.log(`${v ? 'ok  ' : 'FAIL'} ${name}${info ? '  ' + info : ''}`); if (!v) fail++; };
for (const q of ['?x', '?dev']) {
  const g = await openGame({ query: q });
  await g.page.waitForTimeout(2500);
  await g.page.keyboard.press('Enter');
  await g.page.waitForTimeout(1200);
  const r = await g.page.evaluate(() => ({
    title: document.title, logo: document.querySelector('#title .t-logo')?.innerText.replace(/\s+/g, ' '),
    items: [...document.querySelectorAll('#title .t-main button b')].map((b) => b.textContent),
    tags: [...document.querySelectorAll('#title .t-tag')].filter((t) => t.style.display !== 'none').map((t) => t.innerText.replace(/\s+/g, ' ')),
    text: document.body.innerText, state: __vm.state,
  }));
  ok(`${q} title state`, r.state === 'title', r.state);
  ok(`${q} <title>`, r.title.includes('城寨拳王'), r.title);
  ok(`${q} logo`, /城寨/.test(r.logo) && /拳王/.test(r.logo) && /WALLED CITY FISTS/.test(r.logo), r.logo);
  ok(`${q} no base-game text`, !BAN.test(r.text), (r.text.match(BAN) || [''])[0]);
  ok(`${q} menu`, r.items.length > 0, r.items.join(' · '));
  ok(`${q} name tags`, r.tags.every((t) => !BAN.test(t)), r.tags.join(' | ') || '(none: stand-ins)');
  ok(`${q} console errors`, g.errors.length === 0, g.errors.join(' | '));
  if (q === '?x') await g.page.screenshot({ path: `${dir}/title.png` });
  await g.close();
}
console.log(fail ? `TITLE FAIL (${fail})` : 'TITLE PASS');
process.exit(fail ? 1 : 0);
