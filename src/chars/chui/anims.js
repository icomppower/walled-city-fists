// 阿翠's clips: attack clips per move id (./moves.js) through the shared clip kit (baked planted feet), the Musou clip, and
// Zhao Yun's locomotion clips (the blades ride the dual-wield channels through them: held low). Dual wield (rig stage-2b
// hook): the right sword is the spear channel, the left the spearL channel with dual = 1 (the left fist on its grip).
// A channel = [x, y, z (grip, root space), yaw (0 fwd, + left), elev (+ up), roll]. Blade poses adapted from the
// dual-wield template (hk-freedom-voxel 小美); the chain punches tuck the blades back along the forearms (yaw 180: the
// blade runs back from the fist) while the fists drive out on the centre line (詠春 日字衝拳).
import { P, clip, STANCE } from '../../hero/rig.js';
import { LOCO_CLIPS, runPose, rollPose } from '../../hero/anims/locomotion.js';
import { createClipKit } from '../shared/clipkit.js';
import { lungeAt } from '../../hero/moveset.js';
import { MOVES } from './moves.js';

// ready stance: 詠春 guard — both blades forward and low, tips angled in
export const CH_ = { ...STANCE, spear: [-0.26, 0.98, 0.26, 8, -25, 90], spearL: [0.26, 0.98, 0.26, -8, -25, -90], dual: 1,
  gripR: 0, lfree: 1, armL: [-20, 0, 25, 60], hipsR: [0, -12, 0], chest: [6, 4, 0] };
const ENTRY = { n2: 'n1', n3: 'n2', n4: 'n3', n5: 'n4', n6: 'n5', c2: 'n1', c3: 'n2', c4: 'n3', c5: 'n4', c6: 'n5' };
const { clipF } = createClipKit(MOVES, ENTRY, CH_);
const L = (id, f) => lungeAt(MOVES[id], f);
const lead = (id, f, z = 0.2, x = 0.2, yaw = 12) => [x, 0.08, 0.3 + z + L(id, f), 0, yaw];

// ---- blade poses, both blades explicit
const lWind = (e) => ({ spearL: [0.38, 1.3, 0.0, 110, 20, -90], chest: [0, 30, 0], hipsR: [0, 10, 0], ...e });
const lCut = (e) => ({ spearL: [-0.05, 1.1, 0.45, -50, -8, -90], chest: [8, -25, 0], hipsR: [0, -20, 0], ...e });
const rWind = (e) => ({ spear: [-0.5, 1.3, 0.0, -110, 25, 90], chest: [0, -35, 0], ...e });
const rCut = (e) => ({ spear: [0.05, 1.1, 0.45, 70, -5, 90], chest: [8, 30, 0], ...e });
const cross = (e) => ({ spear: [-0.15, 1.55, 0.25, 30, 70, 90], spearL: [0.15, 1.55, 0.25, -30, 70, -90], chest: [-6, 0, 0],
  hips: [0, 0.92, 0], hipsR: [0, 0, 0], ...e });
const open = (e) => ({ spear: [-0.45, 0.95, 0.35, -80, -25, 90], spearL: [0.45, 0.95, 0.35, 80, -25, -90], chest: [16, 0, 0],
  hips: [0, 0.8, 0.08], hipsR: [0, 0, 0], ...e });
const wings = (e) => ({ spear: [-0.55, 1.3, 0, -90, 0, 0], spearL: [0.55, 1.3, 0, 90, 0, 0], chest: [0, 0, 0], hipsR: [0, 0, 0], ...e });
/** 日字衝拳: blades tucked back along the forearms; `r` = the right fist out (else the left), fists on the centre line. */
const punch = (r, e) => ({ spear: [-0.04, 1.28, r ? 0.58 : 0.22, 180, -8, 90], spearL: [0.04, 1.2, r ? 0.22 : 0.58, 180, -8, -90],
  chest: [8, r ? -10 : 10, 0], hipsR: [0, 0, 0], hips: [0, 0.84, 0.06], ...e });
const B = {};

function attacks() {
  const C = {};
  C.n1 = clipF('n1', [[0, B], [4, lWind()], [7, lCut({ fL: lead('n1', 7, 0.2) }), 'snap'], [12, lCut()], [22, B]]);
  C.n2 = clipF('n2', [[0, B], [4, rWind()], [7, rCut({ fR: [-0.18, 0.08, 0.05 + L('n2', 7), 0, -20] }), 'snap'], [12, rCut()], [22, B]]);
  C.n3 = clipF('n3', [[0, B], [7, cross()], [11, open({ fL: lead('n3', 11, 0.3) }), 'snap'], [17, open()], [28, B]]);
  C.n4 = clipF('n4', [[0, B], [4, { spearL: [-0.2, 1.15, 0.2, -100, 5, -90], chest: [4, -30, 0], hipsR: [0, -25, 0] }],
    [7, { spearL: [0.45, 1.1, 0.25, 110, -5, -90], chest: [6, 35, 0], hipsR: [0, 25, 0], fL: lead('n4', 7, 0.2) }, 'snap'], [13, { spearL: [0.48, 1.1, 0.2, 115, -5, -90], chest: [6, 38, 0], hipsR: [0, 26, 0] }], [24, B]]);
  C.n5 = clipF('n5', [[0, B], [4, { spear: [-0.25, 1.15, -0.2, 0, 5, 90], chest: [0, -20, 0], hipsR: [0, -30, 0] }],
    [7, { spear: [-0.1, 1.15, 0.62, 0, 0, 90], chest: [12, 5, 0], hips: [0, 0.84, 0.1], hipsR: [0, -5, 0], fL: lead('n5', 7, 0.3) }, 'snap'],
    [13, { spear: [-0.1, 1.15, 0.58, 0, 0, 90], chest: [10, 5, 0], hips: [0, 0.85, 0.08] }], [26, B]]);
  C.n6 = clipF('n6', [[0, B], [5, wings({ hips: [0, 0.86, 0] })], [16, wings({ spin: -360, hips: [0, 0.84, 0.04] }), 'lin'],
    [22, open({ spin: -360 }), 'snap'], [34, open({ spin: -360, hips: [0, 0.8, 0.08] })], [44, { spin: -360 }]]);
  // C1 蝴蝶旋: three turns forward, blades out
  C.c1 = clipF('c1', [[0, B], [8, wings()], [42, wings({ spin: -1080 }), 'lin'], [48, { spin: -1080 }]]);
  // C2 cross cut
  C.c2 = clipF('c2', [[0, B], [10, cross({ hips: [0, 0.94, 0] })], [14, open({ fL: lead('c2', 14, 0.3) }), 'snap'], [28, open()], [40, B]]);
  // C3 日字衝拳 chain punches: tuck (6), nine alternating punches 10–42, the last double punch at 48
  const cp = [[0, B], [6, punch(false, { hips: [0, 0.86, 0.02] })]];
  [10, 14, 18, 22, 26, 30, 34, 38, 42].forEach((f, k) => { cp.push([f, punch(k % 2 === 0), 'snap']); if (f + 2 < 46) cp.push([f + 2, punch(k % 2 === 0)]); });
  cp.push([46, punch(false, { spear: [-0.1, 1.26, 0.18, 180, -8, 90], spearL: [0.1, 1.26, 0.18, 180, -8, -90], chest: [0, 0, 0] })],
    [48, punch(true, { spear: [-0.1, 1.24, 0.62, 180, -6, 90], spearL: [0.1, 1.24, 0.62, 180, -6, -90], chest: [14, 0, 0], hips: [0, 0.8, 0.12], fL: lead('c3', 48, 0.3) }), 'snap'],
    [56, punch(true, { spear: [-0.1, 1.24, 0.58, 180, -6, 90], spearL: [0.1, 1.24, 0.58, 180, -6, -90], chest: [12, 0, 0], hips: [0, 0.82, 0.1] })], [64, B]);
  C.c3 = clipF('c3', cp);
  // C4 low sweep (10) + rising cut launcher (24)
  const low = { spear: [-0.4, 0.55, 0.35, -60, -20, 90], spearL: [0.4, 0.55, 0.35, 60, -20, -90], hips: [0, 0.62, 0.06], chest: [26, 0, 0], hipsR: [0, 0, 0] };
  const up = { spear: [-0.15, 1.6, 0.3, -5, 70, 90], spearL: [0.15, 1.6, 0.3, 5, 70, -90], hips: [0, 0.96, 0.04], chest: [-12, 0, 0], head: [-10, 0, 0], hipsR: [0, 0, 0] };
  C.c4 = clipF('c4', [[0, B], [6, { ...low, spear: [-0.5, 0.6, 0.1, -130, -20, 90], spearL: [0.5, 0.6, 0.1, 130, -20, -90] }],
    [10, { ...low, fL: lead('c4', 10, 0.25, 0.3, 20) }, 'snap'], [14, { ...low, spear: [-0.5, 0.58, 0.2, 110, -20, 90], spin: -40 }, 'lin'],
    [20, { ...low, spin: -40 }], [24, { ...up, spin: -40 }, 'snap'], [36, { ...up, spin: -40 }], [50, { spin: -40 }]]);
  // C5 dash-through: three dashing cuts, alternating
  C.c5 = clipF('c5', [[0, B], [6, lWind()], [10, lCut(), 'snap'], [18, rWind()], [22, rCut(), 'snap'], [30, cross()], [34, open(), 'snap'], [46, open()], [56, B]]);
  // C6 spinning finisher: four turns, then the blades snap out wide
  C.c6 = clipF('c6', [[0, B], [8, wings()], [54, wings({ spin: -1440 }), 'lin'], [58, cross({ spin: -1440 }), 'snap'],
    [62, open({ spin: -1440 }), 'snap'], [72, open({ spin: -1440 })], [84, { spin: -1440 }]]);
  C.dash = clipF('dash', [[0, { spear: [-0.35, 1.0, -0.2, -150, -20, 90], spearL: [0.35, 1.0, -0.2, 150, -20, -90], chest: [14, 0, 0], hips: [0, 0.84, 0.06] }],
    [10, rCut(), 'snap'], [16, lCut(), 'snap'], [26, lCut()], [40, B]]);
  const AIR = { footL: [0.16, 0.36, 0.2, -20, 10], footR: [-0.18, 0.3, -0.12, 20, -20], hips: [0, 0.95, 0] };
  C.jatk = clip([[0, P({ ...AIR }, CH_)], [4 / 18, P({ ...AIR, ...lCut() }, CH_), 'snap'], [9 / 18, P({ ...AIR, ...rCut() }, CH_), 'snap'], [1, P({ ...AIR, ...rCut() }, CH_)]]);
  const Lj = MOVES.jc.landFrame, Fj = MOVES.jc.frames, Dj = MOVES.jc.plunge[0];
  const hang = { ...cross(), hips: [0, 1.0, 0.04], footL: [0.16, 0.5, 0.14, -30, 10], footR: [-0.18, 0.42, -0.12, 20, -20] };
  const land = { ...wings({ hips: [0, 0.66, 0.1], chest: [16, 0, 0] }), footL: [0.3, 0.08, 0.4, 0, 25], footR: [-0.3, 0.08, -0.3, 0, -50] };
  C.jc = clip([[0, P(AIR, CH_)], [5 / Fj, P(hang, CH_), 'out'], [(Dj - 1) / Fj, P(hang, CH_)], [(Lj - 1) / Fj, P({ ...hang, spin: -360 }, CH_), 'in'],
    [Lj / Fj, P({ ...land, spin: -360 }, CH_), 'snap'], [(Lj + 8) / Fj, P({ ...land, spin: -360 }, CH_)], [1, P({ spin: -360 }, CH_)]], false, true);
  return C;
}

// ---------------------------------------------------------------- Musou 八斬連環 Eight Cuts (200 musou frames)
// 1 eight dash cuts, one per dash leg (musou.js PATH) · 2 stops in the centre, blades tucked: twelve chain punches ·
// 3 blades crossed high, then the X-cut out: the teal-steel ring
const MF = 200, mk = (f, spec, e) => [f / MF, P(spec, CH_), e];
export const MUSOU_FRAMES = MF;
function musouClip() {
  const k = [mk(0, {}), mk(16, { hips: [0, 0.8, 0], chest: [16, 0, 0], spear: [-0.45, 1, 0.1, -100, 10, 90], spearL: [0.45, 1, 0.1, 100, 10, -90] })];
  for (let t = 0; t < 8; t++) {
    const e = 20 + t * 11;
    k.push(mk(e + 2, t % 2 ? rWind({ hips: [0, 0.84, 0] }) : lWind({ hips: [0, 0.84, 0] })));
    k.push(mk(e + 8, t % 2 ? rCut({ hips: [0, 0.82, 0.05] }) : lCut({ hips: [0, 0.82, 0.05] }), 'snap'));
  }
  k.push(mk(112, punch(false)));
  for (let n = 0; n < 12; n++) { const f = 118 + n * 4; k.push(mk(f, punch(n % 2 === 0), 'snap')); k.push(mk(f + 2, punch(n % 2 === 0))); }
  k.push(mk(170, cross({ hips: [0, 0.98, 0] })), mk(180, open({ hips: [0, 0.76, 0.1] }), 'snap'), mk(192, open()), mk(200, {}));
  return clip(k, false, true);
}
export const MUSOU_CLIPS = { mu_chui: musouClip() };

// locomotion: Zhao Yun's clips carry the spear channel only; with dual 0 the left blade would hang at STANCE.spearL off her
// hand — the locomotion clips get the stance blades (spearL / dual) patched in per key
function lowBlades(c) {
  return { ...c, keys: c.keys.map((key) => {
    const p = key.p.slice(), s = P({ spearL: CH_.spearL, dual: 1 }, STANCE);
    for (let i = 45; i < 52; i++) p[i] = s[i];
    return { ...key, p };
  }) };
}
const LOCO = Object.fromEntries(Object.entries(LOCO_CLIPS).map(([id, c]) => [id, lowBlades(c)]));

export const CHUI_CLIPS = { ...LOCO, ...attacks(), ...MUSOU_CLIPS };
export { runPose, rollPose };
