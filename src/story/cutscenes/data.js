// Cutscene data (Scrolls & Cutscenes page): the three between-chapter scenes (≈ 20 s, 3 shots) and the end scene (≈ 40 s,
// 4 shots), played by ./player.js. Times in seconds of scene time.
//   scene = { id, map, title {zh, en}, mood?, shots: [{ dur, from, to, look, lookTo?, fov?, light?: [x, y, z, intensity = 60]
//             (a key light for the shot), track?: u (look at the scene's jet until u of the shot, then ease to lookTo), sub?: [{ at, dur, who, zh, en }] }],
//             cast: [{ id: 'tit'|'chui', keys: [{ t, at: [x, z], yaw, pose }] }]   (pose: a named pose of player.js POSES)
//             extras: [{ kind, k?, keys: [{ t, at: [x, z], yaw? }], wave?: [t0, t1], hold?: prop kind, y? }]
//             props: [{ kind, at: [x, y, z], yaw?, from?: t, to?: t, hand?: { who, side, from, to } }]
//             fx: { rain?, dawn?, water?: [{ x, z, y0, y1, from }], jet?: { from: [x, y, z], to: [x, y, z], t0, t1 },
//                   windows?: { walls: [...], from, to }, faces?: [...], card?: { at, zh, en } } }
//   `at` [x, z] is on the map's ground (ground(x, z)) unless `y` is given. Actors walk between keys (a walk cycle while
//   they move), stand in their key's pose otherwise.
// Content: fictional neighbours in a real place; no text on any sign.

// ---- 1 大牌檔重開 (after kc1, the alleys): rain on the market; residents help 阿鐵 rebuild his stall; he hands 阿翠 a bowl
// of noodles on a stool.
const STALL = [-6, -140];
export const BETWEEN1 = {
  id: 'between1', map: 'alleys', title: { zh: '大牌檔重開', en: 'The stall opens again' }, fx: { rain: true },
  shots: [
    { dur: 6.5, from: [7, 13, -122], to: [3, 8.5, -127], look: [-6, 1.2, -139], lookTo: [-6, 1.4, -140], fov: 42 },
    { dur: 7, from: [-0.5, 2.6, -134], to: [-1.8, 2.3, -135], look: [-6.2, 1.5, -140.2], fov: 40 },
    { dur: 7.5, from: [-2.0, 2.5, -134.8], to: [-2.5, 2.35, -135.4], look: [-5.8, 1.2, -139.5], fov: 34,
      sub: [{ at: 1.6, dur: 2.6, who: 'chui', zh: '聽朝上天台？', en: 'Up on the roof tomorrow?' }, { at: 4.4, dur: 2.6, who: 'tit', zh: '食完先。', en: 'After we eat.' }] },
  ],
  cast: [
    { id: 'tit', keys: [{ t: 0, at: [-6.4, -141.6], yaw: 0.3, pose: 'cook' }, { t: 13.5, at: [-6.4, -141.6], yaw: 0.3, pose: 'cook' }, { t: 15, at: [-6.3, -141.2], yaw: 0.3, pose: 'offer' }] },
    { id: 'chui', keys: [{ t: 0, at: [-5.3, -138.6], yaw: 0.3 + Math.PI, pose: 'sit' }] },
  ],
  extras: [
    ...[0, 1, 2, 3].map((k) => ({ kind: 'resident', k, hold: k < 3 ? 'plank' : 'tray', keys: [{ t: 0, at: [-14 + k * 1.4, -126 - k * 2], yaw: 3.6 }, { t: 7 + k * 0.6, at: [-8.5 + k * 0.8, -137.5 + (k & 1) * 0.6] }] })),
    { kind: 'resident', k: 4, keys: [{ t: 0, at: [-7.6, -140.2], yaw: 1.7 }], wave: [6.5, 13] },
    { kind: 'auntie', k: 0, keys: [{ t: 0, at: [-4.3, -141.2], yaw: -1.4 }], wave: [8, 12] },
    { kind: 'kid', k: 1, keys: [{ t: 0, at: [-3.6, -137.4], yaw: 3.4 }] },
  ],
  props: [
    { kind: 'counter', at: [...STALL], yaw: 0.3 }, { kind: 'frame', at: [...STALL], yaw: 0.3 }, { kind: 'awning', at: [...STALL], yaw: 0.3, from: 9 },
    { kind: 'stool', at: [-5.3, -138.6], yaw: 0.3 }, { kind: 'table', at: [-3.4, -140.4], yaw: 0.3 },
    { kind: 'bowl', hand: { who: 'tit', side: 'R', from: 13.5, to: 16.6 } }, { kind: 'bowl', hand: { who: 'chui', side: 'L', from: 16.6, to: 99 } },
  ],
};

// ---- 2 水落來 (after kc2, the rooftops): the unlocked tanks spill down through the floors; kids splash; an old uncle fills
// a kettle and laughs. A jet passes; the camera follows it to the dark factory windows below.
export const BETWEEN2 = {
  id: 'between2', map: 'rooftops', title: { zh: '水落來', en: 'The water comes down' },
  fx: { water: [{ x: 9.5, z: -54, y0: 6.6, y1: 2.4, from: 0 }, { x: 9.5, z: -38, y0: 6.6, y1: 2.4, from: 0.5 }, { x: -9.5, z: -54, y0: 6.6, y1: 2.4, from: 1 }, { x: -9.5, z: -38, y0: 6.6, y1: 2.4, from: 1.5 },
    { x: 14.8, z: -52, y0: 2.4, y1: -24, from: 1.2 }, { x: 14.8, z: -40, y0: 2.4, y1: -24, from: 1.8 }, { x: -14.8, z: -46, y0: 2.4, y1: -24, from: 2.4 },
    { x: 9.5, z: -54, y0: 2.45, y1: 0, from: 0.6, spread: 1 }, { x: 9.5, z: -38, y0: 2.45, y1: 0, from: 1.1, spread: 1 },
    { x: -11.4, z: -110.2, y0: 0.6, y1: 0.05, from: 7, spread: 1 }],
    jet: { from: [-190, 46, -170], to: [210, 34, -40], t0: 13.6, t1: 19.5 } },
  shots: [
    { dur: 7, from: [1, 7.5, -30], to: [3, 5.5, -35], look: [8, 4, -48], lookTo: [13, -2, -50], fov: 48, light: [10, 5, -44, 80] },
    { dur: 7, from: [-5.2, 1.9, -114.5], to: [-5.8, 1.8, -115], look: [-10.6, 0.8, -110.6], fov: 42,
      sub: [{ at: 3.2, dur: 3, who: 'uncle', zh: '哈哈！有水煲茶喇！', en: 'Ha! Water for the kettle again!' }] },
    { dur: 7, from: [-4, 2.4, -122], to: [-4, 2.2, -121], look: [-60, 30, -150], lookTo: [-26, -9, -96], fov: 50, track: 0.62 },
  ],
  cast: [],
  extras: [
    ...[0, 1, 2, 3].map((k) => ({ kind: 'kid', k, keys: [{ t: 0, at: [-9 + (k % 2) * 1.6, -112.6 + Math.floor(k / 2) * 1.8], yaw: k * 1.7 }], hop: true })),
    { kind: 'uncle', k: 0, hold: 'kettle', keys: [{ t: 0, at: [-10.3, -108.4], yaw: 2.2 }], laugh: [10, 13] },
  ],
  props: [],
};

// ---- 3 燈亮 (after kc3, the tower's light well): workers walk out into the light well; the balconies above fill with
// faces; one by one the lights come on up the whole well, up to the tower's dark top floor.
export const BETWEEN3 = {
  id: 'between3', map: 'tower', title: { zh: '燈亮', en: 'The lights come on' },
  fx: { windows: { from: 13.5, to: 20.5, x: [-12.6, 12.6], z: [-108, -56], y: [2, 32] }, faces: { from: 7, to: 13 } },
  shots: [
    { dur: 6.5, from: [6.8, 2.2, -134], to: [7.2, 2.4, -128], look: [4, 1.2, -114], lookTo: [7, 1.6, -106], fov: 44, light: [5, 3.2, -118, 24] },
    { dur: 7, from: [0, 3, -100], to: [0, 5, -98], look: [9, 8, -90], lookTo: [-9, 12, -72], fov: 48 },
    { dur: 7, from: [1, 3, -104], to: [1, 5, -102], look: [0, 6, -80], lookTo: [0, 30, -60], fov: 56 },
  ],
  cast: [],
  extras: [
    ...[0, 1, 2, 3, 4, 5].map((k) => ({ kind: 'worker', k, keys: [{ t: k * 0.7, at: [-2 + (k % 3) * 1.2, -136 + Math.floor(k / 3) * 1.6], yaw: 0.4 }, { t: 7 + k * 0.7, at: [6 + (k % 3), -110 + Math.floor(k / 3) * 1.6] }] })),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => ({ kind: k % 3 ? 'resident' : 'auntie', k, balcony: k, keys: [{ t: 0, at: [0, 0] }], appear: 7 + k * 0.6, wave: [9 + k * 0.4, 20] })),
  ],
  props: [],
};

// ---- the end scene (after the kc4 ENDING, the rooftops at dawn): (a) a dawn crane over the roofs, aerials and tanks
// glowing; (b) residents climb onto the roofs with lanterns, tea and kids; (c) 阿鐵 ladles congee to a queue, 阿翠 leads a
// dawn class twice as big; (d) a jet sweeps low overhead, everyone waves — title card 城寨拳王 + 「城寨係大家嘅。」
export const END = {
  id: 'end', map: 'rooftops', title: { zh: '天光', en: 'Dawn' },
  fx: { dawn: true, jet: { from: [-200, 40, -200], to: [200, 30, -60], t0: 31, t1: 37.5 }, card: { at: 34.5, zh: '城寨拳王', sub: '城寨係大家嘅。', en: 'The city belongs to everyone.' } },
  shots: [
    { dur: 10, from: [-34, 30, -170], to: [16, 20, -78], look: [0, 4, -110], lookTo: [0, 3, -40], fov: 50 },
    { dur: 10, from: [-3, 2.6, -120], to: [-2.2, 2.4, -122], look: [-11, 1.4, -112], lookTo: [-7, 1.3, -116], fov: 44 },
    { dur: 10, from: [-4.5, 3.6, -128.5], to: [-3, 3.6, -126], look: [0.6, 1.3, -131], lookTo: [7.5, 1.1, -136], fov: 46 },
    { dur: 10, from: [1, 1.7, -120.5], to: [1, 2.2, -119.5], look: [-40, 30, -170], lookTo: [3, 1.6, -134], fov: 56, track: 0.55 },
  ],
  cast: [
    { id: 'tit', keys: [{ t: 0, at: [0.4, -131.6], yaw: 0, pose: 'ladle' }, { t: 30, at: [0.4, -131.6], yaw: 0, pose: 'ladle' }, { t: 31.5, at: [0.4, -131.6], yaw: 0.6, pose: 'wave' }] },
    { id: 'chui', keys: [{ t: 0, at: [8, -134.2], yaw: Math.PI, pose: 'teach' }, { t: 30, at: [8, -134.2], yaw: Math.PI, pose: 'teach' }, { t: 31.5, at: [8, -134.2], yaw: 2.4, pose: 'wave' }] },
  ],
  extras: [
    // (b) out of the stairs hut with lanterns, tea and kids
    ...[0, 1, 2, 3, 4, 5].map((k) => ({ kind: k === 2 ? 'uncle' : k === 4 ? 'auntie' : 'resident', k, hold: ['lantern', 'tray', 'kettle', 'lantern', 'tray', 'lantern'][k],
      keys: [{ t: 10 + k * 1.2, at: [-11.2, -110.8], yaw: 0.4 }, { t: 16 + k * 1.2, at: [-6 + k * 1.3, -117 - (k % 2) * 1.5] }], wave: [32, 40] })),
    ...[0, 1].map((k) => ({ kind: 'kid', k: k + 5, keys: [{ t: 11 + k * 1.6, at: [-11.2, -110.8], yaw: 0.4 }, { t: 15 + k * 1.6, at: [-7 + k * 2, -115] }], wave: [32, 40] })),
    // (c) the congee queue and the dawn class (ten kids, twice the class of kc2)
    ...[0, 1, 2, 3].map((k) => ({ kind: k % 2 ? 'resident' : 'auntie', k: k + 1, hold: 'bowl', keys: [{ t: 0, at: [0.4, -129.4 + k * 1.1], yaw: Math.PI }], wave: [32.5, 40] })),
    ...[...Array(10)].map((_, k) => ({ kind: 'kid', k, keys: [{ t: 0, at: [5.4 + (k % 5) * 1.3, -137.5 - Math.floor(k / 5) * 1.5], yaw: 0 }], punch: [20, 30], wave: [32, 40] })),
  ],
  props: [{ kind: 'pot', at: [0.4, 0, -130.3] }, { kind: 'table', at: [1.6, 0, -130.4], yaw: 1.57 }, { kind: 'ladle', hand: { who: 'tit', side: 'R', from: 0, to: 31 } }],
};

export const CUTSCENES = { between1: BETWEEN1, between2: BETWEEN2, between3: BETWEEN3, end: END };
export const CUT_ORDER = ['between1', 'between2', 'between3', 'end'];
