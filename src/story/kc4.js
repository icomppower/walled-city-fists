// 第四章「蛇王樓」 The Serpent Tower — chapter data (format: ./ch1.js header; registry: ./chapters.js).
// Story (Story Bible, Scrolls & Cutscenes page): the whole city marches with them; the lobby siege; the climb up the light
// well while the neighbours drop lines and pots from the balconies; the gatehouse broken (an HP objective); 蛇王 the
// Serpent King in four phases on the roof garden (P3 in rain, the city's neon flickering round the roof). Win: 蛇王 down →
// the ENDING scroll (story/prologue.js 'ENDING', after the result screen) → the end scene (stage 8) → title.
// Script (story hook): the pots (while the hero is on the balconies, every 4 s the neighbours drop a pot — a line lowered
// with it — onto the gang member nearest him within 12 m: it lands 40 f later, a 1.3 m circle blow through the normal
// combat path; fx.pots), the gatehouse door's HP (100, as kc1's iron gate: fx.gateHp), 蛇王's phases (src/chars/officers/
// kc/bosses.js: his guandao moves, elites at 75 %, rain + neon at 50 %, enraged leap slams at 25 %).
import { KC_MAP } from './kcmap.js';
import { SPK, freeNames } from './kc1.js';
import { bossScript } from '../chars/officers/kc/bosses.js';
import { ST } from '../crowd/crowd.js';

export { SPK, freeNames };
export const OFF = {
  chain: { name: { zh: '飛仔', en: 'CHAIN' }, hp: 520, model: 'chain' },
  blade: { name: { zh: '刀手', en: 'BLADE' }, hp: 520, model: 'blade' },
  serpent: { name: { zh: '蛇王', en: 'SERPENT KING' }, hp: 2340, boss: true, model: 'serpent' },
};
const NAG = { who: 'auntie', zh: '大堂仲未攻落！', en: 'We haven\'t taken the lobby yet!' };
const NAG_G = { who: 'uncle', zh: '閘房道門未開！', en: 'The gatehouse door\'s still shut!' };
const NAG_C = { who: 'auntie', zh: '閘房仲有佢哋嘅人！', en: 'His men still hold the gatehouse!' };
export const DOOR_P = [0, -52.3];

export const BEATS = [
  // ---- 大堂: the siege
  {
    when: { wait: 30 },
    banner: { html: '整個<em>城寨</em>', en: 'The whole city marches', dur: 180, big: true },
    obj: { zh: '攻入大堂', en: 'Storm the lobby', go: ['lobby', 0, 0.2] },
    squads: [{ at: ['lobby', -0.5, 0.3], n: 18 }, { at: ['lobby', 0.5, 0.35], n: 18 }, { at: ['lobby', 0, 0.75], n: 24 }],
    limit: { z: ['lobby', 0, 0.9], nag: NAG },
    morale: 0.1,
    say: [
      { who: 'auntie', zh: '今晚，我哋一齊上！', en: 'Tonight, we all go up together!' },
      { who: 'chui', zh: '一層一層上。', en: 'Floor by floor.' },
      { who: 'tit', zh: '食完宵夜先落嚟。', en: 'We\'ll come down for supper after.' },
    ],
  },
  { when: { wait: 6 * 60 }, waves: true },
  {
    when: [{ kos: 200 }, { wait: 48 * 60 }],
    cue: 'pots', waves: false, retire: true, hush: true, heal: 0.3, morale: 0.1,
    banner: { html: '<em>大堂</em> 攻落！', en: 'The lobby falls', dur: 170 },
    obj: { zh: '沿天井上', en: 'Climb the light well', go: [-9, -72] },
    limit: { z: [0, DOOR_P[1] - 1.5], nag: NAG_G },
    squads: [{ at: [9, -98], n: 12, cols: 3, charge: true }, { at: [2, -83], n: 12, cols: 3 }, { at: [-9, -70], n: 12, cols: 3 }, { at: [-6, -56], n: 12, cols: 3 }],
    officers: { blade: { at: [0, -83], engaged: false } },
    say: [{ who: 'uncle', zh: '上面嘅街坊會幫手！小心頭頂！', en: 'The neighbours upstairs will help — mind your heads!' }],
  },
  {
    when: { at: [-9, -76] },
    obj: { zh: '上到閘房', en: 'Up to the gatehouse', go: [-2, -55] },
    say: [{ who: 'kid', zh: '阿鐵叔叔！我哋喺上面掉盆栽呀！', en: 'Uncle Tit! We\'re dropping flowerpots from up here!' }],
  },
  {
    when: { at: [-6, -57] },
    cue: 'gate',
    obj: { zh: '打爛閘房門', en: 'Break the gatehouse door', go: [DOOR_P[0], DOOR_P[1] - 2.2] },
    squads: [{ at: [-5, -58], n: 10, cols: 3, charge: true }],
  },
  {
    when: { flag: 'doorDown' },
    gate: 'gatehouse',
    banner: { html: '<em>閘房</em>門倒下', en: 'The gatehouse door falls', dur: 180, big: true },
    heal: 0.2, morale: 0.1, hush: true,
    officers: { chain: { at: ['gatehouse', 0, 0.3], engaged: true } },
    squads: [{ at: ['gatehouse', -0.5, 0.2], n: 16, charge: true }, { at: ['gatehouse', 0.5, 0.2], n: 16, charge: true }, { at: ['gatehouse', 0, 0.7], n: 18 }],
    obj: { zh: '清走閘房', en: 'Clear the gatehouse', go: 'chain' },
    limit: { z: ['gatehouse', 0, 0.8], nag: NAG_C },
    say: [{ who: 'chain', zh: '上面就係蛇王——你哋上唔到㗎！', en: 'The Serpent King\'s up there. You\'ll never make it!' }],
  },
  {
    when: { down: 'chain' },
    gate: 'crownStairs', waves: false, retire: true, hush: true, heal: 0.35, morale: 0.15, limit: { z: null },
    banner: { html: '<em>樓頂</em>', en: 'To the roof', dur: 170 },
    obj: { zh: '上樓頂花園', en: 'Up to the roof garden', go: ['crown', 0, -0.6] },
  },
  // ---- 樓頂花園: 蛇王
  {
    when: { zone: 'crown' },
    officers: { serpent: { at: ['crown', 0, 0.45], engaged: true } }, waves: true,
    squads: [{ at: ['crown', -0.6, 0.4], n: 16, charge: true }, { at: ['crown', 0.6, 0.4], n: 16, charge: true }],
    banner: { html: '<em>蛇王</em>', en: 'The Serpent King', dur: 200, big: true },
    obj: { zh: '擊破 蛇王', en: 'Defeat the Serpent King', go: 'serpent' },
    say: [{ who: 'serpent', zh: '整個城寨，都要跟我姓。', en: 'This whole city will carry my name.' }, { who: 'hero', tit: ['城寨唔姓蛇。', 'The city carries nobody\'s name.'], chui: ['城寨唔姓蛇。', 'The city carries nobody\'s name.'] }],
  },
  {
    when: { down: 'serpent' },
    win: true, waves: false, morale: 1,
    banner: { html: '<em>蛇王</em>刀斷', en: 'The Serpent King\'s blade breaks', dur: 280, big: true },
    say: [{ who: 'serpent', zh: '……原來城寨唔係我嘅。', en: '...So the city was never mine.' }, { who: 'auntie', zh: '天光喇！', en: 'The sun\'s coming up!' }],
  },
];

// ---- scrolls (Scrolls & Cutscenes page, kc4 + the ENDING)
export const MAP = KC_MAP;
export const PROLOGUE = [
  { cols: ['整個城寨', '跟住佢哋行', '一層一層上'], en: 'The whole Walled City walks behind them, floor by floor.', show: ['march', 'folk', 'tit', 'chui'], focus: [700, 560, 1.2] },
  { cols: ['蛇王在樓頂', '等成幾年', '今晚完'], en: 'The Serpent King has waited on his roof for years. Tonight it ends.', show: ['serpent', 'tower', 'gang'], focus: [840, 380, 1.5] },
];
export const STAMP = { small: '第四章', big: '蛇王樓', seal: '天光', en: 'CHAPTER IV · THE SERPENT TOWER · 1975' };
export const ENDING = [
  { cols: ['蛇王的刀斷咗', '黑蛇幫走晒', '水不再上鎖'], en: 'The Serpent King\'s blade is broken. Black Serpent is gone. The water is never locked again.', show: ['serpent', 'water', 'tanks'], focus: [760, 400, 1.3] },
  { cols: ['檔口重新開檔', '城寨係大家嘅'], en: 'The stalls open again. The city belongs to everyone.', show: ['dawn', 'dawnsky', 'folk', 'market', 'city'], focus: [740, 470, 1.0] },
];
export const ENDING_STAMP = { small: '尾聲', big: '天光', seal: '城寨', en: 'EPILOGUE · DAWN · THE CITY BELONGS TO EVERYONE' };
export const EPILOGUE = {
  zh: ['天光喇。街坊一個跟一個爬上天台，帶住燈籠、熱茶同細路。', '<i>城寨係大家嘅。</i>'],
  en: ['Dawn. One by one the neighbours climb onto the roofs with lanterns, hot tea and the kids.', '<i>The city belongs to everyone.</i>'],
};
export const DEFEAT = { zh: '{name}倒下了⋯⋯蛇王樓今晚未攻得落。', en: '{name} goes down... the tower holds tonight.' };

// ---- script: the pots, the gatehouse door, 蛇王
const boss = bossScript('serpent', { calls: [[-10, 8], [10, 8]], on: {
  2: { say: [{ who: 'serpent', zh: '兄弟，食夜粥！', en: 'Brothers — get them!' }], banner: { html: '<em>黑蛇</em>精英', en: 'Black Serpent\'s best', dur: 130 } },
  3: { say: [{ who: 'serpent', zh: '落雨都唔會救你。', en: 'The rain won\'t save you.' }], banner: { html: '<em>雷雨</em>', en: 'Thunderstorm', dur: 130 } },
  4: { say: [{ who: 'serpent', zh: '我等咗成幾年！', en: 'I\'ve waited years for this!' }], banner: { html: '<em>蛇王</em>狂怒', en: 'The Serpent King rages', dur: 130 } },
} });
export function script(game, api) {
  const b = boss(game, api), fx = b.fx, c = game.crowd;
  Object.assign(fx, { now: 0, gateHp: 1, pots: [] });
  let potsOn = false, gateOn = false, hp = 100, lastPct = 100, seq = 0;
  return {
    fx,
    cue(name) {
      if (name === 'pots') potsOn = true;
      if (name === 'gate') gateOn = true;
    },
    step() {
      const h = game.hero, t = api.t();
      fx.now = t;
      b.step();
      // pots: onto the gang member nearest the hero on the balconies, every 4 s
      if (potsOn && h.z > -112 && h.z < -50) {
        if (t % 240 === 0) {
          let best = -1, bd = 12;
          for (let i = 0; i < c.N; i++) if (c.st[i] >= ST.IDLE && c.st[i] <= ST.ATTACK) { const d = Math.hypot(c.x[i] - h.x, c.z[i] - h.z); if (d < bd && d > 1.5) { bd = d; best = i; } }
          if (best >= 0) fx.pots.push({ x: c.x[best], z: c.z[best], t: t + 40, t0: t });
        }
        for (const q of fx.pots) if (q.t === t) game.combat.strike({ shape: 'circle', range: 1.3, dmg: 40, kb: 'blow', force: 6, lift: 4, hitstop: 0 }, q.x, q.z, 0, -800000 - (seq++), false, 'pot');
        fx.pots = fx.pots.filter((q) => t - q.t < 60);
      }
      // the gatehouse door
      if (gateOn && hp > 0) {
        if (Math.hypot(h.x - DOOR_P[0], h.z - DOOR_P[1]) < 5) {
          if (t % 14 === 0) hp--;
          if (h.state === 'attack' && t % 4 === 0) hp--;
          if (h.state === 'musou' && t % 2 === 0) hp--;
        }
        hp = Math.max(0, hp); fx.gateHp = hp / 100;
        const pct = Math.ceil(hp / 10) * 10;
        if (pct !== lastPct && hp > 0) { lastPct = pct; api.objective({ zh: `打爛閘房門（${pct}%）`, en: `Break the gatehouse door (${pct} %)`, go: [DOOR_P[0], DOOR_P[1] - 2.2] }); }
        if (hp === 0) { gateOn = false; api.flag('doorDown', true); }
      }
    },
  };
}
