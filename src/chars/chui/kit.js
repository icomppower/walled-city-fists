// 阿翠's kit (contract: src/chars/index.js): the 八斬刀 + 詠春 moveset (moves.js, anims.js) on the dual-wield rig, the
// voxel seamstress (model.js), 八斬連環 Eight Cuts (musou.js) and its view (view.js). The trail follows the striking blade
// (moves `hand`).
import { MOVES, AIR_CHAIN_MAX } from './moves.js';
import { CHUI_CLIPS, runPose, rollPose } from './anims.js';
import { createChuiModel, createChuiSecondary, BLADE } from './model.js';
import { createMusou } from './musou.js';
import { createMusouView } from './view.js';

export const CHUI_KIT = {
  moves: MOVES, airChainMax: AIR_CHAIN_MAX,
  clips: CHUI_CLIPS, feet: {},
  runPose, rollPose,
  dashPlant: MOVES.dash.lunge[1][0] + 3,
  model: createChuiModel, secondary: createChuiSecondary,
  trail: { base: 0.05, baseHeavy: 0.02, tip: BLADE.tip },
  // vfx.js heavy / charge palette: teal and steel (linear HDR)
  fx: {
    needle: [[0.8, 2.6, 2.4], [2.4, 2.6, 2.8], [1.2, 2.9, 2.7]],
    hot: [[0.1, 0.44, 0.42], [0.2, 0.5, 0.5], [0.34, 0.56, 0.58], [1.8, 2.5, 2.5]],
    burst: [0.12, 0.44, 0.42], flash: [2.0, 2.7, 2.7], slash: [2.2, 2.9, 3.0], pulse: [0.5, 1.8, 1.7],
    light: [0.6, 1, 0.95], crack: [0.9, 2.6, 2.4], wall: [0.4, 1.3, 1.2], ring: [1.3, 2.4, 2.3], shard: [2.3, 2.6, 2.8],
    glint: [2.6, 2.8, 3.0], glitter: [2.2, 2.8, 2.9],
    glow: [0x0e4a46, 0x3fb8a8, 0.3],
    trail: { white: [1.05, 1.12, 1.15], fringe: [0.1, 0.8, 0.75], hot: [1.3, 1.6, 1.65], glow: [0.3, 1.3, 1.2] },
  },
  createMusou, createMusouView,
};
