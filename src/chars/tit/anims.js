// 阿鐵's clips: attack clips per move id (./moves.js) through the shared clip kit (planted, baked feet), the Musou clip,
// and Zhao Yun's locomotion clips / run / roll (a carrying pole carries like a spear). Authoring: P() over TT (his ready
// stance: pole across the body, tip up and forward); the pole is the rig's spear joint (origin = rear grip, +Z along the
// shaft, tip at 1.5 m). pole(centre, yaw, elev, roll) = the shaft through `centre` 0.35 m from the rear grip.
// Contact poses sit on each move's first active frame (Characters & Moveset frame data). The 洪拳 hand moves free one arm
// (rfree / armR: rx + = back, rz + = out, elbow bend; lfree / armL the same) while the other hand keeps the pole.
import { P, clip, spearAbout, STANCE } from '../../hero/rig.js';
import { LOCO_CLIPS, runPose, rollPose } from '../../hero/anims/locomotion.js';
import { createClipKit } from '../shared/clipkit.js';
import { lungeAt } from '../../hero/moveset.js';
import { MOVES } from './moves.js';

const pole = (c, yaw, elev, roll = 0, at = 0.35) => spearAbout(c, yaw, elev, roll, at);
export const TT = { ...STANCE, spear: pole([-0.02, 1.02, 0.28], 14, 26), gripL: 0.6, hipsR: [0, -18, 0], chest: [4, 6, 0],
  hips: [0, 0.88, 0], footL: [0.2, 0.08, 0.3, 0, 18], footR: [-0.22, 0.08, -0.28, 0, -32] };
const ENTRY = { n2: 'n1', n3: 'n2', n4: 'n3', n5: 'n4', n6: 'n5', c2: 'n1', c3: 'n2', c4: 'n3', c5: 'n4', c6: 'n5' };
const { clipF } = createClipKit(MOVES, ENTRY, TT);
const L = (id, f) => lungeAt(MOVES[id], f);
/** Lead-foot step landing `z` m ahead of the stance spot at move frame f (move-start coords include the lunge so far). */
const lead = (id, f, z = 0.2, x = 0.22, yaw = 14) => [x, 0.08, 0.3 + z + L(id, f), 0, yaw];
/** Pole held out level at heading `yaw` (° off his facing, + = left), body twisted `tw`° with it. */
const out = (yaw, elev = -5, tw = yaw * 0.4, extra) => ({
  spear: pole([Math.sin(yaw * Math.PI / 180) * 0.3, 1.08, 0.1 + Math.cos(yaw * Math.PI / 180) * 0.3], yaw, elev),
  chest: [6, tw, 0], hipsR: [0, tw * 0.8, 0], spine: [6, tw * 0.3, 0], ...extra });
const OVER = { spear: pole([0, 1.6, 0.05], 0, 95), chest: [-10, 0, 0], head: [-8, 0, 0], hipsR: [0, 0, 0] };
const DOWN = (z = 0.55, elev = -30) => ({ spear: pole([0, 0.95, z], 0, elev), chest: [22, 0, 0], hips: [0, 0.78, 0.1], hipsR: [0, 0, 0] });
const THRUST = (z, extra) => ({ spear: pole([0, 1.12, z], 0, 0, 90, 0.5), chest: [10, 5, 0], hipsR: [0, -5, 0], hips: [0, 0.84, 0.1], ...extra });
/** Pole tucked under the left arm (left hand on it, tip back-down), the right hand free: 洪拳 hand strikes. */
const TUCK = { spear: pole([0.2, 1.0, -0.05], 170, -20, 0, 0.55), gripL: 0.55, gripR: 0.25, rfree: 1 };
/** Pole planted upright beside him (both hands free: palms, wings). */
const PLANT = (x = 0.5, z = 0.15) => ({ spear: [x, 0.53, z, 0, 88, 0], lfree: 1, rfree: 1 });   // butt (−0.5 m) on the ground
const CLAW = (rx, rz = 10, bend = 20) => ({ armR: [rx, 0, rz, bend] });
const B = {};                                     // = TT (a key with no overrides)

function attacks() {
  const C = {};
  // ---- N1 扁擔直戳: chamber back at the hip, drive it straight out (contact 11)
  C.n1 = clipF('n1', [
    [0, B],
    [7, { spear: pole([-0.05, 1.1, -0.2], 0, 4, 90, 0.5), chest: [0, -15, 0], hipsR: [0, -35, 0], hips: [0, 0.86, -0.05] }],
    [11, THRUST(0.8, { fL: lead('n1', 11, 0.3, 0.2, 10) }), 'snap'],
    [18, THRUST(0.75)],
    [30, B],
  ]);
  // ---- N2 橫掃: chamber right, sweep right → left (contact 13)
  C.n2 = clipF('n2', [
    [0, B],
    [9, { spear: pole([0.3, 1.15, 0.05], 110, 8), chest: [0, 45, 0], hipsR: [0, 30, 0], spine: [4, 15, 0] }],
    [15, { spear: pole([-0.2, 1.08, 0.25], -110, 2), chest: [6, -40, 0], hipsR: [0, -40, 0], spin: -30, fR: [-0.24, 0.08, -0.2 + L('n2', 15), 0, -40] }, 'snap'],
    [24, { spear: pole([-0.25, 1.05, 0], -150, 0), chest: [4, -50, 0], hipsR: [0, -45, 0], spin: -45 }],
    [36, B],
  ]);
  // ---- N3 虎爪 tiger claw: pole tucked under the left arm, the right claw rakes forward (contact 12)
  C.n3 = clipF('n3', [
    [0, B],
    [6, { ...TUCK, ...CLAW(30, 30, 110), chest: [2, 30, 0], hipsR: [0, 20, 0], hips: [0, 0.86, 0] }],
    [12, { ...TUCK, ...CLAW(-82, 8, 15), chest: [10, -25, 0], hipsR: [0, -25, 0], hips: [0, 0.82, 0.08], fL: lead('n3', 12, 0.3) }, 'snap'],
    [18, { ...TUCK, ...CLAW(-70, 10, 40), chest: [10, -22, 0], hipsR: [0, -22, 0], hips: [0, 0.82, 0.08] }],
    [32, B],
  ]);
  // ---- N4 overhead chop (contact 13)
  C.n4 = clipF('n4', [
    [0, B],
    [8, { ...OVER, hips: [0, 0.92, 0] }],
    [13, { ...DOWN(0.6, -22), chest: [20, 0, 0], fL: lead('n4', 13, 0.3) }, 'snap'],
    [22, { ...DOWN(0.6, -24), chest: [18, 0, 0] }],
    [36, B],
  ]);
  // ---- N5 backhand sweep left → right (contact 13)
  C.n5 = clipF('n5', [
    [0, B],
    [7, { ...out(120, 0, 45), hips: [0, 0.86, 0] }],
    [11, { ...out(40, -6, 15), hips: [0, 0.84, 0.05], fL: lead('n5', 11, 0.25) }, 'lin'],
    [17, { ...out(-100, -4, -40) }, 'snap'],
    [25, { ...out(-110, -2, -42) }],
    [38, B],
  ]);
  // ---- N6 伏虎 double palm: the pole planted beside him, horse stance, both palms driven out (contact 14)
  C.n6 = clipF('n6', [
    [0, B],
    [8, { ...PLANT(), armL: [40, 0, 20, 110], armR: [40, 0, 20, 110], chest: [-4, 0, 0], hipsR: [0, 0, 0], hips: [0, 0.84, 0] }],
    [14, { ...PLANT(), armL: [-84, 0, 12, 8], armR: [-84, 0, 12, 8], chest: [12, 0, 0], hipsR: [0, 0, 0], hips: [0, 0.74, 0.12],
      fL: [0.34, 0.08, 0.42 + L('n6', 14), 0, 30], fR: [-0.34, 0.08, -0.1 + L('n6', 14), 0, -30] }, 'snap'],
    [30, { ...PLANT(), armL: [-80, 0, 14, 12], armR: [-80, 0, 14, 12], chest: [10, 0, 0], hipsR: [0, 0, 0], hips: [0, 0.74, 0.12] }],
    [50, B],
  ]);
  // ---- C1 扁擔轉: wound far right, the pole carried 300° round the front and both flanks (window 20–26)
  C.c1 = clipF('c1', [
    [0, B],
    [10, { ...out(-150, 2, -55), hips: [0, 0.84, 0] }],
    [18, { ...out(-155, 0, -58), hips: [0, 0.82, 0.02], fL: lead('c1', 18, 0.35, 0.28, 20) }],
    [26, { ...out(60, -4, 35), spin: 90, hips: [0, 0.8, 0.06] }, 'lin'],
    [32, { ...out(70, -6, 36), spin: 110, hips: [0, 0.8, 0.06] }, 'out'],
    [44, { ...out(70, -8, 30), spin: 110, hips: [0, 0.82, 0.05] }],
    [54, B],
  ]);
  // ---- C2 撐竿飛踢 pole-vault kick: plant ahead (8), vault up the shaft (12 leap), kick through (22–27), land (34)
  C.c2 = clipF('c2', [
    [0, B],
    [8, { spear: pole([0, 0.95, 0.6], 0, -62, 0, 0.5), chest: [22, 0, 0], hips: [0, 0.78, 0.08], hipsR: [0, 0, 0], fL: lead('c2', 8, 0.2) }],
    [14, { spear: pole([0, 0.7, 0.3], 0, -80, 0, 0.9), chest: [10, 0, 0], hips: [0, 0.92, 0], hipsR: [0, 0, 0],
      fL: [0.18, 0.3, 0.4 + L('c2', 14), -20, 10], fR: [-0.18, 0.25, 0.1 + L('c2', 14), -20, -10] }],
    [22, { spear: pole([0, 0.5, -0.2], 0, -84, 0, 1.1), chest: [-18, 0, 0], head: [10, 0, 0], hips: [0, 0.96, 0], hipsR: [0, 0, 0],
      fL: [0.16, 0.9, 0.9 + L('c2', 22), -60, 10], fR: [-0.16, 0.7, 0.8 + L('c2', 22), -50, -10] }, 'snap'],
    [27, { spear: pole([0, 0.6, -0.1], 0, -80, 0, 1.0), chest: [-12, 0, 0], hips: [0, 0.96, 0], hipsR: [0, 0, 0],
      fL: [0.16, 0.7, 0.7 + L('c2', 27), -40, 10], fR: [-0.16, 0.6, 0.6 + L('c2', 27), -30, -10] }],
    [33, { spear: pole([0.1, 1.1, 0.3], 20, 20), chest: [10, 0, 0], hips: [0, 0.9, 0], hipsR: [0, 0, 0],
      fL: [0.2, 0.3, 0.4 + L('c2', 33), -10, 10], fR: [-0.2, 0.3, 0.0 + L('c2', 33), -10, -20] }],
    [35, { spear: pole([0.05, 1.05, 0.35], 10, 10), chest: [12, 0, 0], hips: [0, 0.8, 0.06], hipsR: [0, 0, 0],
      fL: [0.22, 0.08, 0.45 + L('c2', 35), 0, 15], fR: [-0.22, 0.08, -0.25 + L('c2', 35), 0, -35] }, 'snap'],
    [56, B],
  ]);
  // ---- C3 虎爪擒拿 grab + throw: claw out (14), drag the ring in (14–26), hip throw with the pole (32)
  C.c3 = clipF('c3', [
    [0, B],
    [8, { ...TUCK, ...CLAW(20, 30, 100), chest: [0, 35, 0], hipsR: [0, 25, 0], hips: [0, 0.86, 0] }],
    [14, { ...TUCK, ...CLAW(-88, 10, 10), chest: [14, -20, 0], hipsR: [0, -20, 0], hips: [0, 0.8, 0.1], fL: lead('c3', 14, 0.35) }, 'snap'],
    [24, { ...TUCK, ...CLAW(-30, 20, 100), chest: [-6, 10, 0], hipsR: [0, 10, 0], hips: [0, 0.84, -0.04] }, 'io'],
    [28, { ...out(120, 0, 50), hips: [0, 0.82, 0] }],
    [32, { ...out(-60, -8, -40), spin: -40, hips: [0, 0.8, 0.08], fL: lead('c3', 32, 0.35, 0.26, 25) }, 'snap'],
    [44, { ...out(-80, -6, -45), spin: -50, hips: [0, 0.8, 0.08] }],
    [62, { spin: -50 }],
  ]);
  // ---- C4 鶴立 crane leap: one-legged crane stance, wings spread (10), leap (16), kick down (30), land (36)
  const WING = { spear: pole([-0.55, 1.35, 0.0], -90, 10, 0, 0.35), gripR: 0, lfree: 1, armL: [0, 0, 85, 10] };
  C.c4 = clipF('c4', [
    [0, B],
    [10, { ...WING, chest: [-4, 0, 0], hipsR: [0, 0, 0], hips: [0, 0.92, 0], fL: [0.16, 0.08, 0.32, 0, 10], fR: [-0.12, 0.42, 0.18, -40, -10] }],
    [15, { ...WING, chest: [10, 0, 0], hipsR: [0, 0, 0], hips: [0, 0.8, 0.04], fL: [0.16, 0.08, 0.32 + L('c4', 15), 0, 10], fR: [-0.12, 0.42, 0.18 + L('c4', 15), -40, -10] }],
    [24, { ...WING, armL: [-30, 0, 70, 20], chest: [-10, 0, 0], hipsR: [0, 0, 0], hips: [0, 1.0, 0],
      fL: [0.18, 0.55, 0.5 + L('c4', 24), -50, 10], fR: [-0.16, 0.35, 0.05 + L('c4', 24), -20, -10] }],
    [34, { ...WING, armL: [-40, 0, 60, 20], chest: [14, 0, 0], hipsR: [0, 0, 0], hips: [0, 0.96, 0.06],
      fL: [0.18, 0.25, 0.6 + L('c4', 34), -30, 10], fR: [-0.16, 0.3, 0.1 + L('c4', 34), -10, -10] }],
    [36, { ...DOWN(0.55, -34), chest: [24, 0, 0], hips: [0, 0.72, 0.12], fL: [0.26, 0.08, 0.5 + L('c4', 36), 0, 20], fR: [-0.26, 0.08, -0.2 + L('c4', 36), 0, -40] }, 'snap'],
    [50, { ...DOWN(0.55, -32), chest: [20, 0, 0], hips: [0, 0.76, 0.1] }],
    [66, B],
  ]);
  // ---- C5 扁擔風車 pole spin: overhead (8), the pole whirled round the body (12–48), the last wide turn (54)
  C.c5 = clipF('c5', [
    [0, B],
    [8, { ...out(-100, 0, -40), hips: [0, 0.84, 0] }],
    [12, { ...out(90, -4, 0), spin: 0, hips: [0, 0.8, 0.04] }, 'lin'],
    [48, { ...out(90, -4, 0), spin: -1080, hips: [0, 0.8, 0.04] }, 'lin'],
    [52, { ...out(150, 4, 50), spin: -1080, hips: [0, 0.84, 0] }, 'out'],
    [55, { ...out(-80, -6, -40), spin: -1080, hips: [0, 0.8, 0.06] }, 'snap'],
    [66, { ...out(-90, -6, -42), spin: -1080 }],
    [76, { spin: -1080 }],
  ]);
  // ---- C6 砸地 ground slam: raise (14), smash (24), hold, shockwave at 36
  C.c6 = clipF('c6', [
    [0, B],
    [14, { ...OVER, spear: pole([0.02, 1.72, 0.2], 0, 92), hips: [0, 0.95, 0] }],
    [20, { ...OVER, spear: pole([0.02, 1.76, 0.22], 0, 94), hips: [0, 0.96, 0] }],
    [24, { ...DOWN(0.6, -34), chest: [24, 0, 0], hips: [0, 0.74, 0.1], fL: lead('c6', 24, 0.3, 0.26, 18) }, 'snap'],
    [40, { ...DOWN(0.6, -36), chest: [26, 0, 0], hips: [0, 0.72, 0.1] }],
    [62, { ...DOWN(0.6, -34), chest: [20, 0, 0], hips: [0, 0.76, 0.08] }],
    [80, B],
  ]);
  // ---- dash: running carry, low sweep (contact 18)
  C.dash = clipF('dash', [
    [0, { spear: pole([-0.15, 1.0, 0.3], -20, -20), chest: [12, -10, 0], hips: [0, 0.86, 0.06] }],
    [12, { ...out(-120, -4, -45), hips: [0, 0.84, 0.05] }],
    [18, { ...out(90, -10, 40), hips: [0, 0.8, 0.08], fL: lead('dash', 18, 0.35) }, 'snap'],
    [32, { ...out(100, -8, 40), hips: [0, 0.82, 0.08] }],
    [56, B],
  ]);
  // ---- jump attack: tucked, pole swipe
  const AIR = { fL: [0.16, 0.36, 0.2, -20, 10], fR: [-0.18, 0.3, -0.12, 20, -20] };
  C.jatk = clip([
    [0, P({ hips: [0, 0.95, 0], footL: AIR.fL, footR: AIR.fR, spear: pole([-0.2, 1.3, 0], -60, 30) }, TT)],
    [6 / 24, P({ ...out(-110, 10, -40), hips: [0, 0.98, 0], footL: AIR.fL, footR: AIR.fR }, TT), 'out'],
    [10 / 24, P({ ...out(80, -20, 35), hips: [0, 0.95, 0.04], footL: AIR.fL, footR: AIR.fR }, TT), 'snap'],
    [1, P({ ...out(60, -15, 25), hips: [0, 0.95, 0.04], footL: AIR.fL, footR: AIR.fR }, TT)],
  ]);
  // ---- jump charge: pole raised at the apex, plunge, slam the ground
  const Lj = MOVES.jc.landFrame, Fj = MOVES.jc.frames, Dj = MOVES.jc.plunge[0];
  const hang = { ...OVER, hips: [0, 1.0, 0.04], footL: [0.16, 0.5, 0.14, -30, 10], footR: [-0.18, 0.42, -0.12, 20, -20] };
  const slam = { spear: pole([0, 0.95, 0.6], 0, -40, 0, 0.5), chest: [22, 0, 0], hips: [0, 0.62, 0.16], hipsR: [0, 0, 0],
    footL: [0.3, 0.08, 0.5, 0, 25], footR: [-0.3, 0.08, -0.3, 0, -50] };
  C.jc = clip([
    [0, P({ hips: [0, 0.95, 0], footL: AIR.fL, footR: AIR.fR }, TT)],
    [5 / Fj, P(hang, TT), 'out'],
    [(Dj - 1) / Fj, P(hang, TT)],
    [(Lj - 1) / Fj, P({ ...hang, spear: pole([0, 1.3, 0.4], 0, -20), chest: [10, 0, 0] }, TT), 'in'],
    [Lj / Fj, P(slam, TT), 'snap'],
    [(Lj + 8) / Fj, P(slam, TT)],
    [MOVES.jc.cancel / Fj, P({ ...slam, hips: [0, 0.72, 0.1] }, TT), 'io'],
    [1, P({}, TT)],
  ], false, true);
  return C;
}

// ---------------------------------------------------------------- Musou 虎鶴雙形 Tiger & Crane (210 musou frames)
// 0 raise the pole (cut-in) · 30 / 60 / 90 three widening pole sweeps · 108 the pole planted, claws chambered ·
// 120–150 tiger-claw flurry (alternating hands, stepping in) · 164 crane wings spread on one leg · 180 FINISHER: the
// crane-wing palm driven down-forward, the gold-red shockwave ring
const MF = 210;
const mk = (f, spec, e) => [f / MF, P(spec, TT), e];
const PL = PLANT(-0.5, -0.35);                                        // the pole stands behind-right of him
const claw = (hand, spin) => (hand ? { ...PL, armR: [-86, 0, 8, 10], armL: [20, 0, 25, 110], chest: [12, -24, 0], hipsR: [0, -20, 0] }
  : { ...PL, armL: [-86, 0, 8, 10], armR: [20, 0, 25, 110], chest: [12, 24, 0], hipsR: [0, 20, 0] });
export const MUSOU_FRAMES = MF;
function musouClip() {
  const k = [
    mk(0, {}),
    mk(24, { spear: pole([0, 1.55, 0.1], 0, 80), chest: [-10, 0, 0], head: [-10, 0, 0], hipsR: [0, 0, 0] }),
    mk(28, { spear: pole([0.45, 1.15, 0.1], 90, 0, 0, 0.3), chest: [4, 0, 0], hipsR: [0, 0, 0] }, 'snap'),
    mk(96, { spear: pole([0.45, 1.15, 0.1], 90, 0, 0, 0.3), chest: [4, 0, 0], hipsR: [0, 0, 0], spin: -1080 }, 'lin'),
    mk(108, { ...PL, armL: [30, 0, 30, 110], armR: [30, 0, 30, 110], chest: [4, 0, 0], hips: [0, 0.82, 0], hipsR: [0, 0, 0], spin: -1080 }),
  ];
  for (let f = 120; f <= 150; f += 5) {
    const hnd = ((f - 120) / 5) & 1;
    k.push(mk(f - 2, { ...claw(1 - hnd), armR: hnd ? [20, 0, 25, 110] : [-40, 0, 12, 60], armL: hnd ? [-40, 0, 12, 60] : [20, 0, 25, 110], hips: [0, 0.8, 0.08], spin: -1080 }));
    k.push(mk(f, { ...claw(hnd), hips: [0, 0.78, 0.1], spin: -1080 }, 'snap'));
  }
  k.push(
    mk(164, { ...PL, armL: [0, 0, 88, 10], armR: [0, 0, 88, 10], chest: [-8, 0, 0], head: [-6, 0, 0], hips: [0, 0.94, 0], hipsR: [0, 0, 0], spin: -1080,
      footR: [-0.12, 0.44, 0.1, -40, -10] }),
    mk(172, { ...PL, armL: [-10, 0, 80, 20], armR: [-10, 0, 80, 20], chest: [-10, 0, 0], hips: [0, 0.96, 0], hipsR: [0, 0, 0], spin: -1080,
      footR: [-0.12, 0.46, 0.12, -40, -10] }),
    mk(180, { ...PL, armL: [-70, 0, 20, 10], armR: [-70, 0, 20, 10], chest: [26, 0, 0], hips: [0, 0.72, 0.14], hipsR: [0, 0, 0], spin: -1080,
      footL: [0.3, 0.08, 0.5, 0, 25], footR: [-0.3, 0.08, -0.3, 0, -40] }, 'snap'),
    mk(196, { ...PL, armL: [-66, 0, 22, 14], armR: [-66, 0, 22, 14], chest: [22, 0, 0], hips: [0, 0.74, 0.12], hipsR: [0, 0, 0], spin: -1080,
      footL: [0.3, 0.08, 0.5, 0, 25], footR: [-0.3, 0.08, -0.3, 0, -40] }),
    mk(210, { spin: -1080 }),
  );
  return clip(k, false, true);
}
export const MUSOU_CLIPS = { mu_tit: musouClip() };

export const TIT_CLIPS = { ...LOCO_CLIPS, ...attacks(), ...MUSOU_CLIPS };
export { runPose, rollPose };
