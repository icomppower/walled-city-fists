// 第一章「巷戰」 The Alleys — chapter data (format: ./ch1.js header; registry: ./chapters.js).
// Story (Story Bible, Scrolls & Cutscenes page): the collectors smash 阿鐵's stall at the market gate; the market holds;
// the push up the lane under the dripping pipes (the first low jet over the alley, the pipes burst); the gang's iron gate
// broken (an HP objective); the square; the 衙門 freed from the gambling hall; 鐵牛 Iron Ox. Win: 鐵牛 down and the 衙門
// lanterns relit. Dialogue in written Cantonese + English. Speakers: SPK keys, or a playable id ('tit' / 'chui': the story
// resolves that to the hero or the ally).
// Script (story hook): the iron gate's HP (100: −1 every 14 f while the hero stands within 5 m of it — a resident works it
// with a crowbar — and −1 every 4 f while he fights there, −1 every 2 f in his Musou; fx.gateHp 1 → 0; at 0 the gate
// 'ironGate' opens), the jet (fx.jet), the burst pipes (fx.steam), the lanterns (fx.lanterns 0 → 1 once the hero reaches
// the hall after 鐵牛's KO), 鐵牛's phases (src/chars/officers/kc/bosses.js). fx.now = the story clock for the views.
// Content rule: fictional people and gang in a real place; nothing from existing Walled City fiction.
import { KC_MAP } from './kcmap.js';
import { bossScript } from '../chars/officers/kc/bosses.js';

export const SPK = {
  tit: { name: { zh: '阿鐵', en: 'Ah Tit' }, seal: '鐵', side: 'shu' },
  chui: { name: { zh: '阿翠', en: 'Ah Chui' }, seal: '翠', side: 'shu' },
  auntie: { name: { zh: '師奶', en: 'Auntie' }, seal: '坊', side: 'shu' },
  kid: { name: { zh: '細路', en: 'Kid' }, seal: '細', side: 'shu' },
  worker: { name: { zh: '工人', en: 'Worker' }, seal: '工', side: 'shu' },
  uncle: { name: { zh: '伯父', en: 'Uncle' }, seal: '伯', side: 'shu' },
  chain: { name: { zh: '飛仔', en: 'Chain' }, seal: '飛', side: 'wei' },
  blade: { name: { zh: '刀手', en: 'Blade' }, seal: '刀', side: 'wei' },
  ox: { name: { zh: '鐵牛', en: 'Iron Ox' }, seal: '牛', side: 'wei' },
  swallow: { name: { zh: '飛燕', en: 'Swallow' }, seal: '燕', side: 'wei' },
  goldtooth: { name: { zh: '金牙探長', en: 'Gold-Tooth' }, seal: '牙', side: 'wei' },
  serpent: { name: { zh: '蛇王', en: 'Serpent King' }, seal: '蛇', side: 'wei' },
};
export const freeNames = [{ zh: '飛仔', en: 'CHAIN' }, { zh: '刀手', en: 'BLADE' }, { zh: '收數佬', en: 'COLLECTOR' }, { zh: '睇場', en: 'ENFORCER' }];
export const OFF = {
  chain: { name: { zh: '飛仔', en: 'CHAIN' }, hp: 520, model: 'chain' },
  blade: { name: { zh: '刀手', en: 'BLADE' }, hp: 520, model: 'blade' },
  ox: { name: { zh: '鐵牛', en: 'IRON OX' }, hp: 1300, boss: true, model: 'ox' },
};

const NAG = { who: 'auntie', zh: '阿鐵！街市仲有人未走呀！', en: 'Ah Tit! There are still people in the market!' };
const NAG_GATE = { who: 'uncle', zh: '條閘未開，衝過去都冇用！', en: 'The gate\'s still shut. No use charging it!' };
const NAG_SQ = { who: 'auntie', zh: '先清咗呢度先！', en: 'Clear this square first!' };
export const GATE_P = [0, -46.5], HALL_P = [0, 22];

export const BEATS = [
  // ---- 街市: the collectors
  {
    when: { wait: 30 },
    obj: { zh: '守住街市', en: 'Hold the market (45 s)', go: ['market', 0, 0.1] },
    squads: [{ at: ['market', -0.4, 0.45], n: 16 }, { at: ['market', 0.4, 0.5], n: 16 }, { at: ['market', 0, 0.85], n: 22 }],
    limit: { z: ['market', 0, 0.9], nag: NAG },
    morale: 0,
    say: [
      { who: 'chain', zh: '呢個月嘅數，交嚟！', en: 'This month\'s money. Hand it over!' },
      { who: 'auntie', zh: '阿鐵！佢哋摜爛你個檔呀！', en: 'Ah Tit! They\'ve smashed your stall!' },
      { who: 'tit', zh: '食飽飯先有力打。', en: 'Eat first. Then we fight.' },
    ],
  },
  { when: { wait: 6 * 60 }, waves: true, banner: { html: '<em>收數</em>', en: 'The collectors', dur: 150 } },
  {
    when: [{ wait: 39 * 60 }, { kos: 400 }],
    banner: { html: '<em>街市</em> 守住！', en: 'The market holds', dur: 170 },
    heal: 0.3, morale: 0.12, waves: false, retire: true, hush: true,
    obj: { zh: '入窄巷', en: 'Push into the lane', go: ['lane', 0, -0.8] },
    limit: { z: ['lane', 0, -0.2], nag: NAG },
    say: [{ who: 'chui', zh: '條巷入面仲有好多人。', en: 'There are more of them up the lane.' }],
  },
  // ---- 窄巷: the jet, 飛仔, the pipes burst
  {
    when: { zone: 'lane' },
    cue: 'jet', waves: false,                                      // no waves in a 6 m alley: fixed squads only
    officers: { chain: { at: ['lane', 0.2, 0.1], engaged: true } },
    squads: [{ at: ['lane', 0, -0.5], n: 12, cols: 3, charge: true }, { at: ['lane', 0.1, 0.1], n: 12, cols: 3 }, { at: ['lane', 0.1, 0.55], n: 12, cols: 3 }],
    obj: { zh: '擊破 飛仔', en: 'Defeat Chain', go: 'chain' },
    limit: { z: ['lane', 0, 0.85], nag: NAG_GATE },
    say: [
      { who: 'uncle', zh: '飛機嚟喇——耳仔掩住！', en: 'Here comes a plane — cover your ears!' },
      { who: 'chain', zh: '條巷咁窄，睇你點走！', en: 'Alley\'s this narrow. Where are you gonna run?' },
    ],
  },
  { when: { at: ['lane', 0, 0.1] }, cue: 'steam', banner: { html: '<em>水喉</em>爆裂', en: 'The pipes burst', dur: 140 } },
  {
    when: { down: 'chain' },
    cue: 'gate', hush: true, heal: 0.2, morale: 0.1, retire: true,
    obj: { zh: '打爛鐵閘', en: 'Break the iron gate', go: [GATE_P[0], GATE_P[1] - 2.5] },
    squads: [{ at: ['lane', 0, 0.7], n: 12, cols: 3, charge: true }],
    say: [{ who: 'uncle', zh: '我撬住條閘，你擋住佢哋！', en: 'I\'ll work the gate with the crowbar — you keep them off me!' }],
  },
  {
    when: { flag: 'gateDown' },
    gate: 'ironGate',
    banner: { html: '<em>鐵閘</em>倒下', en: 'The iron gate falls', dur: 180, big: true },
    heal: 0.3, morale: 0.12, waves: false, retire: true, hush: true,
    obj: { zh: '入空地', en: 'Into the square', go: ['irongate', 0, -0.2] },
    limit: { z: ['irongate', 0, 0.8], nag: NAG_SQ },
  },
  // ---- 空地: 刀手
  {
    when: { zone: 'irongate' },
    officers: { blade: { at: ['irongate', 0, 0.5], engaged: true } },
    squads: [{ at: ['irongate', -0.5, 0.3], n: 14, charge: true }, { at: ['irongate', 0.5, 0.4], n: 14, charge: true }],
    waves: true,
    obj: { zh: '擊破 刀手', en: 'Defeat Blade', go: 'blade' },
    say: [{ who: 'blade', zh: '過得呢度，先講。', en: 'Get past me first. Then we\'ll talk.' }],
  },
  {
    when: { down: 'blade' },
    gate: 'yamenDoor', waves: false, retire: true, hush: true, heal: 0.2, morale: 0.1, limit: { z: null },
    banner: { html: '<em>衙門</em>口 打開', en: 'The yamen gateway opens', dur: 170 },
    obj: { zh: '解放衙門', en: 'Free the old yamen', go: ['yamen', 0, -0.3] },
  },
  // ---- 衙門: the gambling hall, 鐵牛
  {
    when: { zone: 'yamen' },
    squads: [{ at: ['yamen', -0.5, 0.2], n: 18, charge: true }, { at: ['yamen', 0.5, 0.3], n: 18, charge: true }, { at: ['yamen', 0, 0.6], n: 20 }],
    waves: true,
    obj: { zh: '趕走賭檔嘅人', en: 'Clear the gambling hall', go: ['yamen', 0, 0.2] },
    say: [{ who: 'auntie', zh: '個衙門本來係大家嘅！', en: 'That yamen belonged to all of us!' }],
  },
  {
    when: [{ kos: 70 }, { wait: 40 * 60 }],
    officers: { ox: { at: ['yamen', 0, 0.55], engaged: true } },
    banner: { html: '<em>鐵牛</em>', en: 'Iron Ox', dur: 160, big: true },
    obj: { zh: '擊破 鐵牛', en: 'Defeat Iron Ox', go: 'ox' },
    say: [{ who: 'ox', zh: '呢條巷係我嘅！', en: 'This alley is mine!' }],
  },
  {
    when: { down: 'ox' },
    waves: false, hush: true, heal: 0.2,
    say: [{ who: 'ox', zh: '……我收工。', en: '...I\'m clocking off.' }],
    obj: { zh: '點返衙門嘅燈籠', en: 'Relight the yamen lanterns', go: HALL_P },
  },
  {
    when: { flag: 'lanternsLit' },
    win: true, waves: false, morale: 1,
    banner: { html: '<em>燈籠</em>重光', en: 'The lanterns burn again', dur: 260, big: true },
    say: [{ who: 'chui', zh: '聽朝上天台？', en: 'Up on the roof tomorrow?' }, { who: 'tit', zh: '食完先。', en: 'After we eat.' }],
  },
];

// ---- scroll (Scrolls & Cutscenes page, kc1)
export const MAP = KC_MAP;
export const PROLOGUE = [
  { cols: ['城寨無王法', '三萬人擠一間屋', '大家靠自己'], en: 'No law in the Walled City. Thirty-three thousand people in one building. Everyone on their own.', show: ['city', 'walled'], focus: [740, 470, 1.1] },
  { cols: ['黑蛇幫收數', '一檔接一檔', '連水都上鎖'], en: 'Black Serpent collects: stall after stall. Even the water is under lock.', show: ['gang', 'collect', 'locks', 'tanks'], focus: [740, 440, 1.3] },
  { cols: ['阿鐵嘅大牌檔', '今朝被人摜咗', '佢放低鍋鏟'], en: 'This morning they smashed Ah Tit\'s street stall. He put down his ladle.', show: ['tit', 'market'], focus: [520, 690, 1.5] },
];
export const STAMP = { small: '第一章', big: '巷戰', seal: '起身', en: 'CHAPTER I · THE ALLEYS · 1975' };
export const EPILOGUE = {
  zh: ['街市嘅燈重新著返。街坊執返啲枱櫈，幫阿鐵搭返個檔。', '<i>衙門嘅燈籠，好多年冇咁光過。</i>'],
  en: ['The market lights come back on. Neighbours set the tables straight and help Ah Tit rebuild his stall.',
    '<i>The yamen lanterns haven\'t burned this bright in years.</i>'],
};
export const DEFEAT = { zh: '{name}倒下了⋯⋯條巷又落返黑蛇幫手。', en: '{name} goes down... the alleys fall back to Black Serpent.' };

// ---- script: the iron gate, the jet, the pipes, the lanterns, 鐵牛
const boss = bossScript('ox', { on: {
  2: { say: [{ who: 'ox', zh: '撞死你！', en: 'I\'ll run you down!' }], banner: { html: '<em>鐵牛</em>衝鋒', en: 'Iron Ox charges', dur: 120 } },
  3: { say: [{ who: 'ox', zh: '成條巷都震！', en: 'I\'ll shake this whole alley!' }], banner: { html: '<em>鐵牛</em>發狂', en: 'Iron Ox goes wild', dur: 120 } },
} });
export function script(game, api) {
  const b = boss(game, api), fx = b.fx;
  Object.assign(fx, { now: 0, gateHp: 1, jet: null, steam: null, lanterns: 0 });
  let gateOn = false, hp = 100, lit = -1, lastPct = 100;
  return {
    fx,
    cue(name) {
      const h = game.hero;
      if (name === 'jet') fx.jet = { t: api.t(), x: h.x, z: h.z + 10, yaw: -0.55 };
      if (name === 'steam') fx.steam = api.t();
      if (name === 'gate') gateOn = true;
    },
    step() {
      const h = game.hero, t = api.t();
      fx.now = t;
      b.step();
      if (gateOn && hp > 0) {
        const d = Math.hypot(h.x - GATE_P[0], h.z - GATE_P[1]);
        if (d < 5) {
          if (t % 14 === 0) hp--;
          if (h.state === 'attack' && t % 4 === 0) hp--;
          if (h.state === 'musou' && t % 2 === 0) hp--;
        }
        hp = Math.max(0, hp); fx.gateHp = hp / 100;
        const pct = Math.ceil(hp / 10) * 10;
        if (pct !== lastPct && hp > 0) { lastPct = pct; api.objective({ zh: `打爛鐵閘（${pct}%）`, en: `Break the iron gate (${pct} %)`, go: [GATE_P[0], GATE_P[1] - 2.5] }); }
        if (hp === 0) { gateOn = false; api.flag('gateDown', true); }
      }
      if (api.dead('ox') && lit < 0 && Math.hypot(h.x - HALL_P[0], h.z - HALL_P[1]) < 7) lit = t;
      if (lit >= 0) { fx.lanterns = Math.min(1, (t - lit) / 90); if (t - lit === 90) api.flag('lanternsLit', true); }
    },
  };
}
