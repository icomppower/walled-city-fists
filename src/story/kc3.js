// 第三章「工場」 The Factories — chapter data (format: ./ch1.js header; registry: ./chapters.js).
// Story (Story Bible, Scrolls & Cutscenes page): the gang has chained the workers inside the fishball workshop; they are
// freed floor by floor; the power is cut and the stairwell climbed by the boiler's glow and the residents' torches; 金牙探長
// Gold-Tooth arrives with his crooked cops to take his cut; the corridor fight under flickering tube lights; the boiler
// room duel. Win: 金牙探長 down with every worker out. The crowd is the `khaki` skin throughout (the view picks a chapter's
// foe skin at battle start); the gang itself fields 飛仔 / 刀手.
// Script (story hook): the chained workers (map workers: four in the workshop, two in the corridor; a chain gives way after
// 45 steps with the hero within 4.5 m — his attacks there count double — then the worker walks out toward the workshop door:
// fx.workers), the power cut (fx.dark from the stairwell until the corridor; the boss's own at his P3), the corridor tubes
// (fx.flicker), 金牙探長's phases (src/chars/officers/kc/bosses.js). fx.now = the story clock for the views.
import { KC_MAP } from './kcmap.js';
import { SPK, freeNames } from './kc1.js';
import { bossScript } from '../chars/officers/kc/bosses.js';
import { MAPS } from '../world/map.js';

export { SPK, freeNames };
export const OFF = {
  chain: { name: { zh: '飛仔', en: 'CHAIN' }, hp: 520, model: 'chain' },
  blade: { name: { zh: '刀手', en: 'BLADE' }, hp: 520, model: 'blade' },
  goldtooth: { name: { zh: '金牙探長', en: 'GOLD-TOOTH' }, hp: 1560, boss: true, model: 'goldtooth' },
};
const NAG = { who: 'worker', zh: '仲有人鎖住喺度呀！', en: 'There are still people chained in here!' };
const NAG_C = { who: 'worker', zh: '走廊仲有兩個兄弟！', en: 'Two more of us are in the corridor!' };
const W = MAPS.factories.workers, EXIT = [0, -150];

export const BEATS = [
  // ---- 魚蛋工場: the chained workers
  {
    when: { wait: 30 },
    obj: { zh: '解救工人（0/4）', en: 'Free the workers (0/4)', go: W[0] },
    squads: [{ at: ['fishball', -0.4, 0.3], n: 16 }, { at: ['fishball', 0.4, 0.4], n: 16 }, { at: ['fishball', 0, 0.8], n: 20 }],
    limit: { z: ['fishball', 0, 0.9], nag: NAG },
    morale: 0,
    say: [
      { who: 'worker', zh: '佢哋用鐵鏈鎖住我哋！', en: 'They\'ve chained us to the benches!' },
      { who: 'hero', tit: ['一條條解開佢。', 'We\'ll undo them one by one.'], chui: ['一針一線，一條條解開。', 'Stitch by stitch — we\'ll undo every one.'] },
    ],
  },
  { when: { wait: 6 * 60 }, banner: { html: '<em>魚蛋工場</em>', en: 'The fishball workshop', dur: 150 },
    squads: [{ at: ['fishball', -0.5, 0.6], n: 16, charge: true }, { at: ['fishball', 0.5, 0.7], n: 16, charge: true }] },
  { when: { wait: 30 * 60 }, squads: [{ at: ['fishball', 0, 0.85], n: 20, charge: true }, { at: ['fishball', -0.6, -0.2], n: 14, charge: true }] },
  {
    when: { flag: 'floor1' },
    gate: 'chainDoor', cue: 'dark', waves: false, retire: true, hush: true, heal: 0.3, morale: 0.12,
    banner: { html: '<em>停電</em>', en: 'Power cut', dur: 180, big: true },
    obj: { zh: '摸黑上樓梯', en: 'Up the dark stairwell', go: ['stairs', 0, -0.9] },
    limit: { z: ['stairs', 0, 0.95], nag: NAG_C },
    say: [{ who: 'uncle', zh: '拎住火水燈，跟住我哋！', en: 'Grab a lamp and stay with us!' }],
  },
  // ---- 樓梯: the flights in the dark, 飛仔 on the second landing
  {
    when: { zone: 'stairs' },
    officers: { chain: { at: [0, -73], engaged: true } },
    squads: [{ at: [0, -99], n: 10, cols: 3, charge: true }, { at: [0, -91], n: 12, cols: 3 }, { at: [0, -80], n: 10, cols: 3 }, { at: [0, -65], n: 12, cols: 3 }],
    obj: { zh: '擊破 飛仔', en: 'Defeat Chain', go: 'chain' },
    say: [{ who: 'chain', zh: '黑媽媽，睇你點上嚟！', en: 'Pitch dark. Good luck getting up here!' }],
  },
  {
    when: { down: 'chain' },
    hush: true, heal: 0.2, morale: 0.1, retire: true, limit: { z: ['dentists', 0, 0.9], nag: NAG_C },
    obj: { zh: '上到牙醫走廊', en: 'Up to the dentists\' corridor', go: ['dentists', 0, -0.7] },
  },
  // ---- 牙醫走廊: 金牙探長 arrives, the corridor workers, 刀手
  {
    when: { zone: 'dentists' },
    cue: 'lights',
    officers: { blade: { at: ['dentists', 0, 0.3], engaged: true } },
    squads: [{ at: ['dentists', 0, -0.2], n: 14, cols: 4, charge: true }, { at: ['dentists', 0, 0.5], n: 16, cols: 4, charge: true }],
    obj: { zh: '解救走廊工人（0/2）', en: 'Free the corridor workers (0/2)', go: W[4] },
    limit: { z: ['dentists', 0, 0.9], nag: NAG_C },
    say: [
      { who: 'goldtooth', zh: '收工之前，茶錢要交齊。', en: 'Before anyone clocks off, the tea money gets paid.' },
      { who: 'worker', zh: '金牙探長……佢帶埋差人上嚟！', en: 'Gold-Tooth... and he\'s brought his cops!' },
    ],
  },
  {
    when: { flag: 'floor2', down: 'blade' },
    gate: 'boilerDoor', waves: false, retire: true, hush: true, heal: 0.3, morale: 0.12, limit: { z: null },
    banner: { html: '<em>鍋爐房</em>', en: 'The boiler room', dur: 170 },
    obj: { zh: '入鍋爐房', en: 'Into the boiler room', go: ['boiler', 0, -0.6] },
  },
  // ---- 鍋爐房: 金牙探長
  {
    when: { zone: 'boiler' },
    officers: { goldtooth: { at: ['boiler', 0, 0.35], engaged: true } }, waves: true,
    squads: [{ at: ['boiler', -0.5, 0.3], n: 16, charge: true }, { at: ['boiler', 0.5, 0.3], n: 16, charge: true }],
    banner: { html: '<em>金牙探長</em>', en: 'Gold-Tooth', dur: 160, big: true },
    obj: { zh: '擊破 金牙探長', en: 'Defeat Gold-Tooth', go: 'goldtooth' },
    say: [{ who: 'goldtooth', zh: '茶錢係規矩嚟。', en: 'Tea money is the rule round here.' }],
  },
  {
    when: { down: 'goldtooth' },
    win: true, waves: false, morale: 1,
    banner: { html: '<em>金牙</em>跪低', en: 'Gold-Tooth goes down', dur: 260, big: true },
    say: [{ who: 'goldtooth', zh: '……今次算我輸。', en: '...This time, I lose.' }, { who: 'worker', zh: '開工啦！我哋自己話事！', en: 'Back to work — on our own terms!' }],
  },
];

// ---- scroll (Scrolls & Cutscenes page, kc3)
export const MAP = KC_MAP;
export const PROLOGUE = [
  { cols: ['魚蛋工場', '工人被鎖在入面'], en: 'In the fishball workshop, the workers are chained inside.', show: ['factories', 'workers'], focus: [900, 640, 1.5] },
  { cols: ['金牙探長', '來收茶錢'], en: 'And Gold-Tooth is coming for his tea money.', show: ['goldtooth', 'cops'], focus: [1000, 680, 1.3] },
];
export const STAMP = { small: '第三章', big: '工場', seal: '開門', en: 'CHAPTER III · THE FACTORIES · 1975' };
export const EPILOGUE = {
  zh: ['工人一個接一個行出天井，樓上嘅露台擠滿咗人。', '<i>燈，一層一層咁亮返。</i>'],
  en: ['The workers walk out into the light well one by one; the balconies above fill with faces.', '<i>And floor by floor, the lights come back on.</i>'],
};
export const DEFEAT = { zh: '{name}倒下了⋯⋯工場又鎖返上。', en: '{name} goes down... the workshop doors are chained again.' };

// ---- script: the chained workers, the power cut, the tubes, 金牙探長
const boss = bossScript('goldtooth', { calls: [[-9, 6], [9, 6]], on: {
  2: { say: [{ who: 'goldtooth', zh: '兄弟，上！', en: 'Boys — get in here!' }], banner: { html: '<em>差人</em>增援', en: 'His cops pile in', dur: 120 } },
  3: { say: [{ who: 'goldtooth', zh: '熄燈！', en: 'Kill the lights!' }], banner: { html: '<em>熄燈</em>', en: 'Lights out', dur: 120 } },
} });
export function script(game, api) {
  const b = boss(game, api), fx = b.fx;
  const ws = W.map(([x, z]) => ({ hp: 45, free: false, out: false, x, z, yaw: 0, t: -1 }));
  Object.assign(fx, { now: 0, dark: false, flicker: false, workers: ws.map((w) => ({ free: false, out: false, x: w.x, z: w.z, yaw: 0, hp: 1 })) });
  let freed1 = 0, freed2 = 0;
  return {
    fx,
    cue(name) {
      if (name === 'dark') fx.dark = true;
      if (name === 'lights') { fx.dark = false; fx.flicker = true; }
    },
    step() {
      const h = game.hero, t = api.t();
      fx.now = t;
      b.step();
      ws.forEach((w, k) => {
        const f = fx.workers[k], floor = k < 4 ? 1 : 2;
        if (!w.free) {
          const active = floor === 1 || api.flag('corridor');
          if (active && Math.hypot(h.x - w.x, h.z - w.z) < 4.5) w.hp -= h.state === 'attack' || h.state === 'musou' ? 2 : 1;
          f.hp = Math.max(0, w.hp) / 45;
          if (w.hp <= 0) {
            w.free = true; w.t = t; f.free = true;
            if (floor === 1) { freed1++; api.objective(freed1 < 4 ? { zh: `解救工人（${freed1}/4）`, en: `Free the workers (${freed1}/4)`, go: W[freed1] } : { zh: '工人全部解開', en: 'The workers are free', go: ['fishball', 0, 0.9] }); }
            else { freed2++; api.objective(freed2 < 2 ? { zh: `解救走廊工人（${freed2}/2）`, en: `Free the corridor workers (${freed2}/2)`, go: W[5] } : { zh: '擊破 刀手', en: 'Defeat Blade', go: 'blade' }); }
            api.say({ who: 'worker', zh: '多謝！我落去先！', en: 'Thank you! I\'m getting out!' });
          }
        } else if (!w.out) {                                             // walks out toward the workshop door (the corridor ones down the stairs)
          const u = Math.min(1, (t - w.t) / 360), tx = floor === 1 ? EXIT[0] : 0, tz = floor === 1 ? EXIT[1] : -104;
          f.x = w.x + (tx - w.x) * u; f.z = w.z + (tz - w.z) * u; f.yaw = Math.atan2(tx - w.x, tz - w.z);
          if (u >= 1) { w.out = true; f.out = true; }
        }
      });
      if (freed1 === 4 && !api.flag('floor1')) api.flag('floor1', true);
      if (!api.flag('corridor') && h.z > -60 && h.y >= 0) api.flag('corridor', true);
      if (freed2 === 2 && !api.flag('floor2')) api.flag('floor2', true);
    },
  };
}
