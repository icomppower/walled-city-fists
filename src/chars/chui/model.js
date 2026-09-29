// Voxel 阿翠 Ah Chui on the shared rig (Characters & Moveset page): the shared body cut slimmed to ≈ 0.92 on X, a teal
// qipao-cut work jacket (mandarin collar with gold trim, the diagonal side opening edged in gold, three gold frog
// buttons), loose black trousers, black kung fu shoes with white soles. Head (HV voxels, chin y 0, crown y 13): a black
// bob to the jaw with a straight fringe, a red thread tie at one side (secondary tail), a small thimble on a cord round
// the neck. Weapons — 八斬刀 butterfly swords (dual-wield rig: right = weapon joint, left = weaponL): 0.5 m broad
// single-edged blades (a dark spine, a bright edge, the tip clipped), brass crossguard and a D-guard loop from guard to
// pommel over the knuckles. Secondary (render-only): the jacket's front flap, the thread tie.
// Palette: jacket #1F6E6B · trim #E8C35A · trousers #1A1A1A · shoes #2B2B2B / white soles · skin #F1C27D · hair #141414 ·
// blades #C8CED6 / guards #B8862E. Original design: no logo, text or emblem.
import * as THREE from 'three';
import { vox, HV, C, bodyParts, buildBody, heroLook } from '../../hero/model.js';
import { bodyChains } from '../../hero/secondary.js';
import { outfit } from '../shared/outfit.js';
import { shade } from '../../core/voxel.js';

const hex = (s) => parseInt(s.slice(1), 16);
export const CC = {
  jacket: hex('#1F6E6B'), trim: hex('#E8C35A'), trou: hex('#1A1A1A'), shoe: hex('#2B2B2B'), soleW: 0xeeeae2, skin: hex('#F1C27D'),
  hair: hex('#141414'), blade: hex('#C8CED6'), guard: hex('#B8862E'), thread: 0xc0282a, thimble: 0xd8dce2, cord: 0x6a4a2a,
  eye: 0x1a1214, lip: 0xb8645a, brow: 0x2a1a14,
};
const PAL = {
  ...C,
  W: CC.jacket, W2: shade(CC.jacket, 0.9), Wh: shade(CC.jacket, 1.08), S: CC.trim, Sd: shade(CC.trim, 0.75),
  G: CC.trou, Gd: shade(CC.trou, 0.8), Gm: shade(CC.trou, 1.3), Gl: shade(CC.trou, 1.8),
  T: CC.trim, Td: shade(CC.trim, 0.75), Tl: shade(CC.trim, 1.15),
  gold: CC.trim, leather: CC.trim, glove: CC.skin, sole: CC.soleW, skin: CC.skin, skinD: shade(CC.skin, 0.85),
};
const B = (a, b, c, paint) => ({ a, b, c, paint });
const Pt = (a, b, c) => ({ a, b, c, paint: true });
const mirror = (q) => ({ ...q, a: [1 - q.b[0], q.a[1], q.a[2]], b: [1 - q.a[0], q.b[1], q.b[2]] });
const both = (...qs) => qs.flatMap((q) => [q, mirror(q)]);

export function head() {
  return [
    B([-3, 1, -3], [4, 10, 3], CC.skin),                              // skull
    B([-3, 0, 2], [4, 9, 4], CC.skin),                                // face
    ...both(Pt([-2, 5, 3], [-1, 7, 4], CC.eye)),                      // eyes (the face's front layer is z 3)
    ...both(Pt([-3, 7, 3], [-1, 8, 4], CC.brow)),                     // brows (under the fringe)
    Pt([0, 2, 3], [1, 3, 4], CC.lip),                                 // mouth
    // the bob: back and sides down to the jaw, the crown, a straight fringe across the brow
    B([-4, 2, -4], [5, 12, 1], CC.hair),
    B([-4, 10, -4], [5, 12, 4], CC.hair),
    B([-3, 8, 3], [4, 10, 5], CC.hair),                               // fringe, straight across
    ...both(B([-4, 2, 0], [-3, 10, 4], CC.hair)),                     // side panels to the jaw
    Pt([-4, 2, -4], [5, 3, 1], shade(CC.hair, 1.6)),                  // cut line at the bob's hem
    B([-5, 7, 1], [-4, 9, 3], CC.thread),                             // red thread tie at her right temple (the tail: a chain)
  ];
}

// ---------------------------------------------------------------- 八斬刀 (weapon space: +Z along the blade from the grip)
const U = 0.01;                                                      // blade voxel (m)
/** Butterfly sword: grip wrapped dark, brass crossguard, the D-guard loop over the knuckles (down to the pommel), a broad
 *  single-edged blade 0.5 m (spine up +Y, edge down −Y, bright bevel), the tip clipped from the edge up to the spine. */
function swordGeo() {
  const e = [
    B([-1, -1, -11], [1, 1, 0], 0x2a2420),                            // wrapped grip
    B([-1, -2, -13], [1, 2, -11], CC.guard),                          // pommel
    B([-2, -4, 0], [2, 4, 2], CC.guard),                              // crossguard
    B([-1, -7, -12], [1, -6, 1], CC.guard),                           // D-guard bar under the knuckles
    B([-1, -6, 0], [1, -3, 1], CC.guard), B([-1, -6, -13], [1, -2, -12], CC.guard),   // its two ends
  ];
  for (let z = 2; z < 52; z++) {
    const clip = z > 44 ? z - 44 : 0;                                 // the clipped tip: the edge rises to the spine
    const lo = -3 + clip, hi = 3;
    if (lo >= hi) break;
    e.push(B([0, lo, z], [1, hi, z + 1], (x, y) => (y === hi - 1 ? shade(CC.blade, 0.72) : y === lo ? shade(CC.blade, 1.18) : CC.blade)));
  }
  return vox(e, U, { off: [-0.5, 0, 0], jitter: 0.02, ao: 0.2 });
}
export const BLADE = { tip: 0.5 };

export function createChuiModel(rig) {
  const mat = heroLook(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.9, 0.9, 0.9), vertexColors: true, roughness: 0.6, metalness: 0.05, flatShading: true }));
  const body = bodyParts(PAL);                                        // (pauldron boxes only: they stay hidden)
  const P_ = body.parts = outfit({ jacket: CC.jacket, jacketD: shade(CC.jacket, 0.8), sleeve: CC.jacket, trou: CC.trou, trouD: shade(CC.trou, 1.3),
    shoe: CC.shoe, sole: CC.soleW, skin: CC.skin, glove: CC.skin, hem: 5, cuff: CC.trim, fold: shade(CC.jacket, 0.97), slim: 0.92 });
  // mandarin collar (trimmed), the diagonal side opening edged in gold, three frog buttons, the thimble on its cord
  P_.chest = P_.chest.filter((q) => !(q.a[1] === 8 && q.c !== -1));
  P_.chest.push(B([-3, 8, -3], [4, 11, 3], (x, y, z) => (y === 10 && z === 2 && Math.abs(x) < 3 ? CC.trim : shade(CC.jacket, 0.94))), B([-2, 8, -2], [3, 12, 2], -1));   // low stand collar, a thin gold edge at the front
  for (let k = 0; k < 5; k++) P_.chest.push(Pt([-k, 7 - k * 2, 4], [1 - k, 9 - k * 2, 5], CC.trim));      // the opening: collar → her right side
  for (const y of [6, 3, 0]) P_.chest.push(Pt([1, y, 4], [3, y + 1, 5], CC.trim));                   // frog buttons
  P_.chest.push(B([-1, 2, 5], [2, 5, 6], CC.thimble), B([0, 3, 6], [1, 4, 7], 0xeef0f4), Pt([-2, 5, 4], [0, 8, 5], CC.cord), Pt([1, 5, 4], [3, 8, 5], CC.cord));   // thimble on its cord
  P_.hips.push(Pt([-1, -6, 4], [1, 3, 5], CC.trim));                  // the opening continues down the hem
  for (const s of ['R', 'L']) {                                       // loose trousers: wider legs
    P_['thigh' + s] = [B([-4, -18, -4], [5, 1, 5], (x, y) => (y % 6 === 0 ? shade(CC.trou, 1.3) : CC.trou))];
    P_['shin' + s] = [B([-3, -17, -3], [4, 0, 4], CC.trou), B([-3, -4, -3], [4, -2, 4], shade(CC.trou, 1.3))];
  }
  const { meshes, add } = buildBody(rig, mat, body, head());
  meshes.pauldronR.visible = meshes.pauldronL.visible = false;
  const sm = heroLook(new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.3, metalness: 0.55 }), 0.3, 0.9);
  add(rig.joints.weapon, swordGeo(), 'swordR', sm); add(rig.joints.weaponL, swordGeo(), 'swordL', sm);
  return { meshes, material: mat };
}

// ---------------------------------------------------------------- secondary: the front flap, the red thread tie
const EMPTY = () => new THREE.BufferGeometry();                     // the jacket's back is in the body boxes: no cape panel
const frontSeg = () => vox([B([-4, -4, 0], [4, 0, 1], (x) => (x === 0 ? CC.trim : CC.jacket))], 0.025, { off: [0, 0, -0.5], jitter: 0.05, ao: 0.2 });
const threadSeg = () => vox([B([0, -5, 0], [1, 0, 1], CC.thread)], 0.012, { off: [-0.5, 0, -0.5], jitter: 0.02, ao: 0.1 });

export function createChuiSecondary(scene, rig, mat) {
  const j = rig.joints, body = bodyChains(scene, rig, mat, EMPTY, (i) => (i === 0 ? frontSeg() : EMPTY())), { add } = body;
  add(j.head, { anchor: [-4.5 * HV, 7.5 * HV, 2 * HV], rest: [-0.3, -1, 0], n: 4, len: 0.05, stiff: 0.03, drag: 0.06,
    wind: 2.0, cone: 120, sway: 0.5, face: [1, 0, 0], seg: threadSeg, hit: ['head', ['chest', 0.02]] });
  return body;
}
