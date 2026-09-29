// 阿鐵's kit (contract: src/chars/index.js): the 扁擔 + 洪拳 moveset (moves.js, anims.js), the voxel cook on the shared rig
// (model.js), 虎鶴雙形 Tiger & Crane (musou.js) and its view (view.js). Locomotion physics, dodge ghosts and roll are
// shared (hero.js); the locomotion clips are Zhao Yun's (a carrying pole carries like a spear).
import { MOVES, AIR_CHAIN_MAX } from './moves.js';
import { TIT_CLIPS, runPose, rollPose } from './anims.js';
import { createTitModel, createTitSecondary, POLE } from './model.js';
import { createMusou } from './musou.js';
import { createMusouView } from './view.js';

export const TIT_KIT = {
  moves: MOVES, airChainMax: AIR_CHAIN_MAX,
  clips: TIT_CLIPS, feet: {},
  runPose, rollPose,
  dashPlant: MOVES.dash.lunge[1][0] + 4,
  model: createTitModel, secondary: createTitSecondary,
  trail: { base: 0.9, baseHeavy: 0.6, tip: POLE.tip },              // pole ribbon: distances along the shaft (vfx.js spearWorld)
  // vfx.js heavy / charge palette: tiger gold and crane red (linear HDR)
  fx: {
    needle: [[2.9, 2.1, 0.6], [2.8, 1.2, 0.4], [3.0, 2.5, 1.0]],
    hot: [[0.6, 0.36, 0.08], [0.62, 0.3, 0.1], [0.66, 0.44, 0.14], [2.5, 1.7, 0.6]],
    burst: [0.6, 0.34, 0.08], flash: [2.7, 2.0, 0.8], slash: [3.0, 2.1, 0.7], pulse: [1.9, 1.0, 0.3],
    light: [1, 0.72, 0.36], crack: [2.7, 1.4, 0.4], wall: [1.4, 0.8, 0.2], ring: [2.4, 1.5, 0.5], shard: [2.6, 1.9, 0.7],
    glint: [2.8, 2.2, 0.9], glitter: [2.8, 2.0, 1.0],
    glow: [0x8a4a00, 0xe0b040, 0.3],
    trail: { white: [1.15, 1.05, 0.8], fringe: [1.0, 0.45, 0.08], hot: [1.7, 1.3, 0.7], glow: [1.4, 0.8, 0.2] },
  },
  createMusou, createMusouView,
};
