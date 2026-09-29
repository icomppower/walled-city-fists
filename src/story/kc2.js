// 第二章「天台」 The Rooftops — chapter data (format: ./ch1.js header; registry: ./chapters.js).
// Story (Story Bible, Scrolls & Cutscenes page): before dawn, 阿翠's rooftop class is ambushed; the kids are taken down
// the stairs (escort); the plank bridges crossed while jets pass low; the water tanks' padlocks cut (the water pours down
// to the floors below); 飛燕 Swallow on the highest roof. Win: 飛燕 down with all four tanks open.
// Script (story hook): the dawn class (five kids at the class spot walk to the hero once he is within 40 m, join his trail within 6 m and go in at the
// stairs hut when he brings them within 9 m of its door; a kid stops and hides while a gang member is within 2 m of it:
// fx.kids), the jets (from the plank crossing on, one every 40 s: its roar stuns every standing gang member within 30 m
// of the hero for a beat — ST.HURT — the hero keeps control; fx.jet), the tank padlocks (4 × HP 30: −1 every 4 f while
// the hero is within 7 m of a tank, −1 every 3 f while he fights there, −1 every 2 f in his Musou; fx.tanks), 飛燕's
// phases (src/chars/officers/kc/bosses.js). fx.now = the story clock for the views.
import { KC_MAP } from './kcmap.js';
import { SPK, freeNames } from './kc1.js';
import { bossScript } from '../chars/officers/kc/bosses.js';
import { followers } from './kcfx.js';
import { ST } from '../crowd/crowd.js';
import { MAPS } from '../world/map.js';

export { SPK, freeNames };
export const OFF = {
  chain: { name: { zh: '飛仔', en: 'CHAIN' }, hp: 520, model: 'chain' },
  blade: { name: { zh: '刀手', en: 'BLADE' }, hp: 520, model: 'blade' },
  swallow: { name: { zh: '飛燕', en: 'SWALLOW' }, hp: 1300, boss: true, model: 'swallow' },
};
const NAG = { who: 'kid', zh: '阿翠姐姐，我哋仲喺度呀！', en: 'Miss Chui, we\'re still up here!' };
const NAG_PL = { who: 'uncle', zh: '塊板仲鎖住，過唔到！', en: 'The plank\'s still locked. You can\'t cross!' };
const NAG_TK = { who: 'auntie', zh: '啲水缸未開，唔好走！', en: 'The tanks aren\'t open yet. Don\'t go!' };
const R = MAPS.rooftops, STAIRS = R.stairs, TANKS = R.tanks;
const CLASS = [[-4, -136], [-1.6, -136], [0.8, -136], [-2.8, -133.8], [-0.4, -133.8]];

export const BEATS = [
  // ---- 天線林: the dawn class
  {
    when: { wait: 30 },
    obj: { zh: '保護晨早班', en: 'Protect the dawn class', go: ['aerials', 0, -0.2] },
    squads: [{ at: ['aerials', 0.5, 0.6], n: 14, charge: true }, { at: ['aerials', -0.5, 0.7], n: 14 }, { at: ['aerials', 0, 0.9], n: 18 }],
    limit: { z: ['aerials', 0, 0.9], nag: NAG },
    morale: 0,
    say: [
      { who: 'kid', zh: '阿翠姐姐！有人上嚟呀！', en: 'Miss Chui! Someone\'s coming up!' },
      { who: 'chui', zh: '一針一線，一拳一腳。企喺我後面。', en: 'Stitch by stitch, punch by punch. Stay behind me.' },
      { who: 'chain', zh: '天台都係我哋嘅地頭。', en: 'The roofs are our turf too.' },
    ],
  },
  { when: { wait: 8 * 60 }, waves: true, banner: { html: '<em>伏擊</em>', en: 'Ambush', dur: 150 } },
  {
    when: [{ kos: 220 }, { wait: 38 * 60 }],
    cue: 'kids', retire: true, waves: false,
    squads: [{ at: ['aerials', 0.5, 0.2], n: 14, charge: true }, { at: ['aerials', -0.2, 0.8], n: 14, charge: true }, { at: ['aerials', 0.6, -0.5], n: 12, charge: true }],
    obj: { zh: '集合細路', en: 'Gather the kids', go: [-1.6, -135] },
    say: [{ who: 'chui', zh: '跟住我，一個拉住一個。', en: 'Follow me. Hold each other\'s hands.' }],
  },
  {
    when: { flag: 'kidsSafe' },
    gate: 'plankBridge', cue: 'jets', waves: false, retire: true, hush: true, heal: 0.3, morale: 0.12,
    banner: { html: '<em>細路</em> 安全', en: 'The kids are safe', dur: 170 },
    obj: { zh: '過木板橋', en: 'Cross the plank bridges', go: ['plank', 0, -0.2] },
    limit: { z: ['plank', 0, 0.9], nag: NAG_PL },
    say: [{ who: 'uncle', zh: '飛機過嘅時候，佢哋會企唔穩——趁機！', en: 'When a plane goes over they can\'t keep their feet — use it!' }],
  },
  // ---- 木板橋: 飛仔 on the middle roof
  {
    when: { zone: 'plank' },
    officers: { chain: { at: ['plank', 0, 0.1], engaged: true } },
    squads: [{ at: ['plank', 0, 0.05], n: 16, cols: 4, charge: true }, { at: ['plank', 0.1, 0.5], n: 12, cols: 2 }, { at: ['plank', 0.2, 0.85], n: 14, cols: 4 }],
    obj: { zh: '擊破 飛仔', en: 'Defeat Chain', go: 'chain' },
    say: [{ who: 'chain', zh: '塊板咁窄，跌落去就冇得返轉頭！', en: 'Narrow plank. Fall off and you don\'t come back!' }],
  },
  {
    when: { down: 'chain' },
    hush: true, heal: 0.2, morale: 0.1, retire: true, limit: { z: ['tanks', 0, 0.8], nag: NAG_TK },
    obj: { zh: '去水缸天台', en: 'On to the tank roof', go: ['tanks', 0, -0.6] },
  },
  // ---- 水缸: the padlocks, 刀手
  {
    when: { zone: 'tanks' },
    cue: 'locks', waves: false,                                     // waves pulled the fight away from the locks
    officers: { blade: { at: ['tanks', 0, 0.4], engaged: true } },
    squads: [{ at: ['tanks', -0.5, 0.2], n: 18, charge: true }, { at: ['tanks', 0.5, 0.3], n: 18, charge: true }, { at: ['tanks', 0, 0.7], n: 20, charge: true },
      { at: ['tanks', -0.4, 0.9], n: 16 }, { at: ['tanks', 0.4, 0.9], n: 16 }],
    obj: { zh: '剪開水缸鎖（0/4）', en: 'Cut the tank padlocks (0/4)', go: [TANKS[0][0] + 2.5, TANKS[0][1]] },
    say: [{ who: 'auntie', zh: '成個城寨等緊水呀！', en: 'The whole city is waiting for water!' }],
  },
  {
    when: { flag: 'tanksOpen' },
    gate: 'tankLocks', waves: false, retire: true, hush: true, heal: 0.3, morale: 0.15, limit: { z: null },
    banner: { html: '<em>水來</em>', en: 'The water runs', dur: 190, big: true },
    obj: { zh: '上最高天台', en: 'Up to the highest roof', go: ['peak', 0, -0.4] },
    say: [{ who: 'kid', zh: '有水喇！樓下有水喇！', en: 'Water! There\'s water downstairs!' }],
  },
  // ---- 最高天台: 飛燕
  {
    when: { zone: 'peak' },
    officers: { swallow: { at: ['peak', 0, 0.4], engaged: true } }, waves: true,
    squads: [{ at: ['peak', -0.5, 0.5], n: 16, charge: true }, { at: ['peak', 0.5, 0.5], n: 16, charge: true }, { at: ['peak', 0, 0.9], n: 20 }],
    banner: { html: '<em>飛燕</em>', en: 'Swallow', dur: 160, big: true },
    obj: { zh: '擊破 飛燕', en: 'Defeat Swallow', go: 'swallow' },
    say: [{ who: 'swallow', zh: '天台上面，冇人贏得我。', en: 'Up on the roofs, nobody beats me.' }],
  },
  {
    when: { down: 'swallow' },
    win: true, waves: false, morale: 1,
    banner: { html: '<em>飛燕</em>落地', en: 'Swallow comes down', dur: 260, big: true },
    say: [{ who: 'swallow', zh: '……好快嘅刀。', en: '...Fast blades.' }, { who: 'tit', zh: '落嚟食粥啦。', en: 'Come down and have some congee.' }],
  },
];

// ---- scroll (Scrolls & Cutscenes page, kc2)
export const MAP = KC_MAP;
export const PROLOGUE = [
  { cols: ['天未光', '阿翠喺天台', '教細路詠春'], en: 'Before dawn, Ah Chui is up on the roof, teaching the kids Wing Chun.', show: ['chui', 'kids', 'rooftops'], focus: [800, 290, 1.5] },
  { cols: ['飛機在頭頂', '擦過天線', '黑蛇幫已經在'], en: 'A plane skims the aerials overhead. Black Serpent is already there.', show: ['jet1', 'gang', 'tanks', 'swallow'], focus: [760, 300, 1.2] },
];
export const STAMP = { small: '第二章', big: '天台', seal: '水來', en: 'CHAPTER II · THE ROOFTOPS · 1975' };
export const EPILOGUE = {
  zh: ['水喉嘅鎖剪斷咗，水沿住每一層流落去。', '<i>細路喺走廊踩水，笑聲一路傳到街市。</i>'],
  en: ['The locks on the tanks are cut, and water runs down through every floor.',
    '<i>Kids splash in the corridors; you can hear them laughing all the way down at the market.</i>'],
};
export const DEFEAT = { zh: '{name}倒下了⋯⋯天台又落返黑蛇幫手。', en: '{name} goes down... the rooftops fall back to Black Serpent.' };

// ---- script: the dawn class, the jets, the padlocks, 飛燕
const boss = bossScript('swallow', { on: {
  2: { say: [{ who: 'swallow', zh: '追得上我先講！', en: 'Catch me first!' }], banner: { html: '<em>飛燕</em>跳樓', en: 'Swallow takes to the roofs', dur: 120 } },
  3: { say: [{ who: 'swallow', zh: '落刀雨喇！', en: 'Here comes the knife rain!' }], banner: { html: '<em>刀雨</em>', en: 'Knife rain', dur: 120 } },
} });
export function script(game, api) {
  const b = boss(game, api), fx = b.fx, c = game.crowd;
  const kids = followers(CLASS, { join: 6, seek: 2.6, seekR: 40 });   // they come to him (hiding from the gang on the way)
  const tanks = TANKS.map(() => ({ hp: 30, open: false }));
  Object.assign(fx, { now: 0, jet: null, kids: CLASS.map(([x, z]) => ({ x, z, yaw: Math.PI, on: true, moving: false })), tanks: tanks.map(() => ({ hp: 1, open: false })) });
  let escort = false, jets = -1, locks = false, safe = 0, opened = 0, gathered = false;
  return {
    fx,
    cue(name) {
      if (name === 'kids') escort = true;
      if (name === 'jets' && jets < 0) jets = api.t() + 240;                // the first pass 4 s after the planks open
      if (name === 'locks') locks = true;
    },
    step() {
      const h = game.hero, t = api.t();
      fx.now = t;
      b.step();
      // the dawn class: follow once the hero comes for them, hide from a gang member within 2 m, go in at the stairs
      if (escort) {
        const near = (x, z) => { for (let i = 0; i < c.N; i++) if (c.st[i] && c.st[i] < ST.HURT && Math.abs(c.x[i] - x) < 2 && Math.abs(c.z[i] - z) < 2) return true; return false; };
        kids.list.forEach((e, k) => { if (!e.home && e.joined && near(e.x, e.z)) e.hold = (e.hold || 0) + 1; else e.hold = 0; });
        const before = kids.list.map((e) => [e.x, e.z]);
        kids.step(h);
        kids.list.forEach((e, k) => {
          if (e.hold > 0 || e.home) { [e.x, e.z] = before[k]; }             // hiding / gone in: stays put this step
          if (!e.home && e.joined && Math.hypot(h.x - STAIRS[0], h.z - STAIRS[1]) < 9) { e.home = true; e.goT = t + k * 20; }
          const f = fx.kids[k];
          if (e.home) {                                                    // walks in through the hut door, one after another
            const u = Math.min(1, Math.max(0, (t - e.goT) / 50));
            f.x = e.x + (STAIRS[0] - e.x) * u; f.z = e.z + (STAIRS[1] - e.z) * u; f.yaw = Math.atan2(STAIRS[0] - e.x, STAIRS[1] - e.z);
            f.moving = u < 1; if (u >= 1 && f.on) { f.on = false; safe++; }
          } else { f.moving = Math.hypot(f.x - e.x, f.z - e.z) > 0.001; f.x = e.x; f.z = e.z; f.yaw = e.yaw; }
        });
        if (!gathered && kids.list.every((e) => e.joined)) { gathered = true; api.objective({ zh: '帶細路落樓梯', en: 'Take the kids down the stairs', go: [STAIRS[0] + 2, STAIRS[1]] }); }
        if (safe === 5 && !api.flag('kidsSafe')) api.flag('kidsSafe', true);
      }
      // the jets: every 40 s, low over the roofs; the roar stuns the gang near the hero for a beat
      if (jets >= 0 && t >= jets) {
        jets = t + 40 * 60;
        fx.jet = { t, x: h.x - 20, z: h.z, yaw: 2.3 };
        api.banner({ html: '<em>飛機</em>！', en: 'Jet overhead!', dur: 90 });
        for (let i = 0; i < c.N; i++) if (c.st[i] >= ST.IDLE && c.st[i] <= ST.ATTACK && Math.hypot(c.x[i] - h.x, c.z[i] - h.z) < 30) { c.st[i] = ST.HURT; c.stT[i] = 0; }
      }
      // the padlocks
      if (locks && opened < tanks.length) {
        tanks.forEach((q, k) => {
          if (q.open) return;
          const [x, z] = TANKS[k];
          if (Math.hypot(h.x - x, h.z - z) < 7) {
            if (t % 4 === 0) q.hp--;
            if (h.state === 'attack' && t % 3 === 0) q.hp--;
            if (h.state === 'musou' && t % 2 === 0) q.hp--;
          }
          if (q.hp <= 0) {
            q.open = true; opened++;
            const next = tanks.findIndex((p) => !p.open);
            if (next >= 0) api.objective({ zh: `剪開水缸鎖（${opened}/4）`, en: `Cut the tank padlocks (${opened}/4)`, go: [TANKS[next][0] + (TANKS[next][0] > 0 ? -2.5 : 2.5), TANKS[next][1]] });
          }
          fx.tanks[k].hp = Math.max(0, q.hp) / 30; fx.tanks[k].open = q.open;
        });
        if (opened === tanks.length) api.flag('tanksOpen', true);
      }
    },
  };
}
