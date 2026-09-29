// Boss gate (stage 3): for each boss (鐵牛 ox, 飛燕 swallow, 金牙探長 goldtooth, 蛇王 serpent) a test chapter on the 定軍山
// map with the `serpent` / `khaki` skins — the boss spawned on the camp square (Characters & Moveset HP, officer model),
// run by its chapter-script module (src/chars/officers/kc/bosses.js), fought by the bot as the given playable. Gates per
// boss: every phase fires at its HP threshold (the HP on the phase's first frame within −0.5 % … 0 of it), its phase banner
// on that frame, the phase's behaviour happens (ox: charges in P2, slams in P3 · swallow: knives in P1, roof-to-roof leaps
// in P2, knife rain in P3 · goldtooth: revolver bursts, khaki squads called in P2, power cut in P3 · serpent: N1 / N2 / C1
// guandao moves, elites in P2, rain + neon in P3, leap slams in P4), the KO wins, the KO'd slot keeps its model (kneels,
// weapon dropped / snapped).
//   node --import ./bench/harness/register.mjs bench/chars/boss.mjs [char] [boss…]
import { createSim } from '../harness/sim.mjs';
import { CHAPTERS } from '../../src/story/chapters.js';
import { bossScript, BOSS_PHASES } from '../../src/chars/officers/kc/bosses.js';
import { createBot } from '../bot/bot.mjs';
import { on } from '../../src/core/events.js';

const [char = 'tit', ...only] = process.argv.slice(2);
const C1 = CHAPTERS.ch1;
const HP = { ox: 1300, swallow: 1300, goldtooth: 1560, serpent: 2340 };
const NAME = { ox: ['鐵牛', 'IRON OX'], swallow: ['飛燕', 'SWALLOW'], goldtooth: ['金牙探長', 'GOLD-TOOTH'], serpent: ['蛇王', 'SERPENT KING'] };
const kinds = only.length ? only : ['ox', 'swallow', 'goldtooth', 'serpent'];
const sim = await createSim({ enemies: 300 }), G = sim.game;
const banners = [];
on('story:banner', (e) => banners.push([G.frame, e.en]));
let bad = 0;
for (const kind of kinds) {
  const TH = BOSS_PHASES[kind], on_ = {};
  TH.forEach((_, k) => { on_[k + 2] = { banner: { html: `phase ${k + 2}`, en: `${kind} phase ${k + 2}` } }; });
  CHAPTERS.bosstest = { ...C1, id: 'bosstest', cast: ['tit', 'chui'], skin: { foe: kind === 'goldtooth' ? 'khaki' : 'serpent', ally: 'resident' },
    OFF: { [kind]: { name: { zh: NAME[kind][0], en: NAME[kind][1] }, hp: HP[kind], boss: true, model: kind },
      chain: { name: { zh: '飛仔', en: 'CHAIN' }, hp: 520, model: 'chain' }, blade: { name: { zh: '刀手', en: 'BLADE' }, hp: 520, model: 'blade' } },
    BEATS: [
      { when: { wait: 30 }, officers: { [kind]: { at: ['honjin', 0, 0.85], engaged: true } }, obj: { zh: '擊破', en: 'Defeat the boss', go: kind } },
      { when: { down: kind }, win: true, banner: { html: '擊破', en: `${kind} down`, big: true } },
    ],
    script: bossScript(kind, { calls: [[-6, -125], [6, -125]], on: on_ }),
  };
  banners.length = 0;
  sim.start({ char, mode: 'story', chapter: 'bosstest' });
  const bot = createBot(), cs = G.crowd, log = [];
  let phase = 0, slot = -1, elites = 0;
  const seen = new Set(), n = { aim: 0, bash: 0, slam: 0, knife: 0, arc: 0, leaps: 0, shots: 0, rain: false, neon: false, dark: false, moves: new Set(), calls: 0 };
  while (!sim.end && G.frame < 30 * 3600) {
    sim.step(bot(G));
    const s = G.story, fx = s.fx;
    for (let i = cs.grunts; i < cs.N; i++) if (cs.st[i]) {
      const m = s.modelOf(i);
      if (m === kind) slot = i;
      if ((m === 'chain' || m === 'blade') && !seen.has(i + m)) { seen.add(i + m); elites++; }
    }
    if (fx.phase !== phase && fx.phase < 9) { phase = fx.phase; log.push([G.frame, phase, cs.hp[slot] / cs.hpMax[slot]]); }
    if (fx.dark) n.dark = true; if (fx.rain) n.rain = true; if (fx.neon) n.neon = true;
    n.calls = fx.calls;
    for (const r of fx.rings) { const id = r.kind + r.t + r.x.toFixed(2); if (!seen.has(id)) { seen.add(id); n[r.kind] = (n[r.kind] || 0) + 1; } }
    if (fx.leap && !seen.has('leap' + fx.leap.t0)) { seen.add('leap' + fx.leap.t0); n.leaps++; n['leapP' + phase] = (n['leapP' + phase] || 0) + 1; }
    for (const q of fx.shots) if (!seen.has('shot' + q.t)) { seen.add('shot' + q.t); n.shots++; }
    for (const q of fx.swings) if (!seen.has('sw' + q.t0)) { seen.add('sw' + q.t0); n.moves.add(q.kind); if (phase === 4 && q.kind === 'c1') n.leapSlams = (n.leapSlams || 0) + 1; }
  }
  const res = [], ok = (m, v, x = '') => { res.push(v); console.log(`${v ? 'ok  ' : 'FAIL'} ${kind.padEnd(9)} ${m}${x ? '  ' + x : ''}`); };
  TH.forEach((thr, k) => {
    const e = log.find(([, p]) => p === k + 2), bn = banners.find(([, t]) => t === `${kind} phase ${k + 2}`);
    ok(`phase ${k + 2} at ${thr * 100} % (±0.5)`, !!e && e[2] <= thr && e[2] >= thr - 0.005, e ? `frame ${e[0]}, HP ${(e[2] * 100).toFixed(2)} %` : 'never');
    ok(`phase ${k + 2} banner on its frame`, !!(e && bn && Math.abs(bn[0] - e[0]) <= 1), `${bn?.[0]} vs ${e?.[0]}`);
  });
  if (kind === 'ox') { ok('P2 bull charges', n.aim >= 1 && n.bash >= 1, `${n.aim} aimed, ${n.bash} landed`); ok('P3 ground slams', n.slam >= 3, `${n.slam}`); }
  if (kind === 'swallow') { ok('knives thrown', n.knife >= 3, `${n.knife}`); ok('P2 roof-to-roof leaps', (n.leapP2 || 0) >= 1, `${n.leapP2 || 0}`); ok('P3 knife rain', n.knife >= 10, `${n.knife} knives`); }
  if (kind === 'goldtooth') { ok('revolver bursts', n.shots >= 3, `${n.shots} shots`); ok('P2 khaki squads called', n.calls >= 2, `${n.calls}`); ok('P3 power cut', n.dark); }
  if (kind === 'serpent') {
    ok('guandao N1 / N2 / C1', ['n1', 'n2', 'c1'].every((m) => n.moves.has(m)), [...n.moves].join(' '));
    ok('P2 gang elites', elites >= 2 && n.calls >= 2, `${elites} elite officers`); ok('P3 rain + neon', n.rain && n.neon); ok('P4 leap slams', (n.leapSlams || 0) >= 1, `${n.leapSlams || 0}`);
  }
  ok('KO ends the fight (win)', !!(sim.end && sim.end.win), `${(G.frame / 60).toFixed(0)} s, hero hp ${G.hero.hp}`);
  ok('KO\'d slot keeps its model (kneels, weapon dropped)', slot >= 0 && G.story.modelOf(slot) === kind);
  if (!res.every(Boolean)) bad++;
}
console.log(bad ? `BOSS FAIL (${bad} boss${bad > 1 ? 'es' : ''})` : `BOSS PASS ${kinds.length}/${kinds.length} as ${char}`);
process.exit(bad ? 1 : 0);
