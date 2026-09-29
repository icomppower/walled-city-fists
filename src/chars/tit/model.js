// Voxel 阿鐵 Ah Tit on the shared rig (Characters & Moveset page): the shared body cut as a cook's work clothes — a white
// sleeveless vest (torso ≈ 1.08× wide, scooped neck), bare arms, a slate-blue half apron tied at the waist (front panel =
// the apron chain), dark trousers rolled to mid-calf, black cloth shoes. Head (HV voxels, chin y 0, crown y 13): broad
// jaw, shaved short hair (a stubble cap), thick brows with a small pale scar through the left one, a cream towel round
// the neck whose two ends hang on the chest (secondary). Weapon: 扁擔 carrying pole on the spear joint — a 2.0 m flat
// wooden pole, 3 × 1 voxels, rope wraps at both ends and a rope loop hanging from each end (secondary).
// Palette: vest #F2EEE4 · apron #2F4A5A · trousers #2A2A2E · shoes #1C1C1C · skin #D9A066 · towel #E7D9B0 · pole
// #8A6A3A / rope #C9A66B. Original design: no logo, text or emblem anywhere.
import * as THREE from 'three';
import { vox, HV, C, bodyParts, buildBody, heroLook } from '../../hero/model.js';
import { bodyChains } from '../../hero/secondary.js';
import { outfit } from '../shared/outfit.js';
import { hash01 } from '../../core/rng.js';
import { shade } from '../../core/voxel.js';

const hex = (s) => parseInt(s.slice(1), 16);
export const TC = {
  vest: hex('#F2EEE4'), vestD: hex('#D8D2C4'), apron: hex('#2F4A5A'), trou: hex('#2A2A2E'), shoe: hex('#1C1C1C'),
  skin: hex('#D9A066'), towel: hex('#E7D9B0'), pole: hex('#8A6A3A'), rope: hex('#C9A66B'),
  stubble: 0x3a322c, brow: 0x1c1612, eye: 0x1a1210, scar: 0xeec4a0, lip: 0x6e3a2a, sole: 0x3a3632,
};
const PAL = {
  ...C,
  W: TC.vest, W2: TC.vestD, Wh: TC.vest, S: TC.skin, Sd: shade(TC.skin, 0.85),
  G: TC.trou, Gd: shade(TC.trou, 0.8), Gm: shade(TC.trou, 1.25), Gl: shade(TC.trou, 1.6),
  T: TC.apron, Td: shade(TC.apron, 0.8), Tl: shade(TC.apron, 1.2),
  gold: TC.rope, leather: TC.apron, glove: TC.skin, sole: TC.sole, skin: TC.skin, skinD: shade(TC.skin, 0.85),
};
const B = (a, b, c, paint) => ({ a, b, c, paint });
const Pt = (a, b, c) => ({ a, b, c, paint: true });
const mirror = (q) => ({ ...q, a: [1 - q.b[0], q.a[1], q.a[2]], b: [1 - q.a[0], q.b[1], q.b[2]] });
const both = (...qs) => qs.flatMap((q) => [q, mirror(q)]);
const stub = (x, y, z) => (hash01(x, y * 3, z) < 0.3 ? shade(TC.stubble, 1.25) : TC.stubble);

export function head() {
  const SK = TC.skin, SD = shade(TC.skin, 0.84);
  return [
    B([-4, 1, -4], [5, 11, 3], SK),                                  // skull (broad)
    B([-4, 0, 2], [5, 10, 4], SK),                                   // face (flush to the hairline: the brows' top row)
    B([-4, -1, -1], [5, 3, 4], SK),                                  // broad jaw
    Pt([-4, -1, 3], [5, 0, 4], SD), Pt([-4, 0, -1], [-3, 3, 4], SD), Pt([4, 0, -1], [5, 3, 4], SD),   // jaw shadow
    ...both(B([-5, 4, -1], [-4, 7, 1], SD)),                         // ears
    B([-4, 10, -5], [5, 12, 4], stub), B([-4, 4, -5], [5, 10, -3], stub),   // stubble cap (top, back)
    ...both(B([-5, 8, -4], [-4, 11, 2], stub)),                     // stubble at the temples
    ...both(Pt([-3, 7, 3], [0, 9, 4], TC.brow)),                    // thick brows (2 voxels tall)
    Pt([2, 6, 3], [3, 10, 4], TC.scar),                             // scar through the left brow (his left = +X)
    ...both(Pt([-3, 5, 3], [-1, 6, 4], TC.eye)),                    // eyes
    B([0, 3, 4], [1, 6, 5], SD),                                     // nose
    Pt([-1, 1, 3], [2, 2, 4], TC.lip), Pt([-2, 1, 3], [-1, 2, 4], SD), Pt([2, 1, 3], [3, 2, 4], SD),   // mouth, set in a frown line
  ];
}

/** 扁擔: 2.0 m flat pole (3 × 1 voxels at 2 cm, a gentle grain), rope wraps near both ends. */
function poleGeo() {
  const grain = (x, y, z) => ((z + 40) % 16 < 1 ? shade(TC.pole, 0.82) : hash01(x, y, z) < 0.12 ? shade(TC.pole, 0.9) : (z & 8) ? shade(TC.pole, 1.06) : TC.pole);
  const wrap = (z0) => B([-2, -1, z0], [2, 1, z0 + 4], (x, y, z) => ((z + x) & 1 ? TC.rope : shade(TC.rope, 0.82)));
  return vox([
    B([-1, 0, -25], [2, 1, 75], grain),
    wrap(-22), wrap(68),
    B([-1, 0, 75], [2, 1, 76], shade(TC.pole, 0.75)), B([-1, 0, -26], [2, 1, -25], shade(TC.pole, 0.75)),   // end grain
  ], 0.02, { off: [-0.5, -0.5, 0], jitter: 0.04, ao: 0.3 });
}
/** Tip in weapon space (m): trail + VFX anchor. */
export const POLE = { tip: 1.5, butt: -0.5 };

export function createTitModel(rig) {
  const mat = heroLook(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.93, 0.93, 0.93), vertexColors: true, roughness: 0.72, metalness: 0.03, flatShading: true }));
  const body = bodyParts(PAL);                                        // (pauldron boxes only: they stay hidden)
  const P_ = body.parts = outfit({ jacket: TC.vest, jacketD: TC.vestD, fold: shade(TC.vest, 0.93), sleeve: TC.skin, trou: TC.trou,
    trouD: shade(TC.trou, 0.78), shoe: TC.shoe, sole: TC.sole, skin: TC.skin, glove: TC.skin, hem: 1, slim: 1.08 });
  // the vest: scooped neck (skin on the front layer), the towel ring over the collar
  P_.chest = P_.chest.filter((q) => !(q.a[1] === 8 && q.c !== -1));   // drop the jacket collar
  P_.chest.push(Pt([-3, 5, 4], [4, 9, 6], TC.skin), B([-3, 8, -3], [4, 10, 3], TC.skin),
    B([-5, 8, -5], [6, 11, 5], (x, y, z) => ((z > 3 && Math.abs(x) < 2) || (Math.abs(x + 0.5) < 3 && Math.abs(z + 0.5) < 3) ? null : (x + y + z) & 1 ? TC.towel : shade(TC.towel, 0.9))));
  for (const s of ['R', 'L']) {                                       // bare arms (a shade on the elbow crease)
    P_['upperArm' + s] = [B([-2, -12, -2], [3, 1, 3], (x, y) => (y > -1 ? shade(TC.skin, 0.92) : TC.skin))];
    P_['foreArm' + s] = [B([-2, -11, -2], [3, 0, 3], (x, y) => (y > -2 ? shade(TC.skin, 0.9) : TC.skin))];
    // trousers rolled to mid-calf: a lighter roll band, bare shin below it
    P_['shin' + s] = [B([-2, -8, -2], [3, 0, 3], TC.trou), B([-3, -10, -3], [4, -8, 4], shade(TC.trou, 1.35)),
      B([-2, -17, -2], [3, -10, 3], TC.skin)];
  }
  // the half apron: a band round the waist (knot at the back), the front panel down to mid-thigh (+ the apron chain)
  P_.hips.push(B([-7, 1, -6], [8, 3, 6], TC.apron), B([-2, 0, -7], [3, 3, -6], shade(TC.apron, 0.8)),
    B([-6, -5, 5], [7, 3, 6], (x, y) => (y === -5 ? shade(TC.apron, 0.8) : TC.apron)));
  const { meshes, add } = buildBody(rig, mat, body, head());
  meshes.pauldronR.visible = meshes.pauldronL.visible = false;       // a vest: no pauldrons
  add(rig.joints.weapon, poleGeo(), 'pole');
  return { meshes, material: mat };
}

// ---------------------------------------------------------------- secondary: apron panel, towel ends, rope loops
const EMPTY = () => new THREE.BufferGeometry();                     // no back panel on a vest (the cape chain stays empty)
/** Apron front panel: slate blue, a darker hem on the last segment. */
const apronSeg = (i, n) => vox([B([-5, -5, 0], [6, 0, 1], (x, y) => (i === n - 1 && y === -5 ? shade(TC.apron, 0.78) : x === -5 || x === 5 ? shade(TC.apron, 0.88) : TC.apron))],
  0.025, { off: [-0.5, 0, -0.5], jitter: 0.04, ao: 0.18 });
const towelSeg = (i, n) => vox([B([-1, -5, 0], [2, 0, 1], (x, y) => (i === n - 1 && y === -5 ? shade(TC.towel, 0.85) : (y & 1) ? TC.towel : shade(TC.towel, 0.94)))],
  0.02, { off: [-0.5, 0, -0.5], jitter: 0.04, ao: 0.15 });
const ropeSeg = () => vox([B([0, -4, 0], [1, 0, 1], TC.rope)], 0.02, { off: [-0.5, 0, -0.5], jitter: 0.03, ao: 0.1 });

export function createTitSecondary(scene, rig, mat) {
  const j = rig.joints, body = bodyChains(scene, rig, mat, EMPTY, apronSeg), { add } = body;
  for (const sx of [-1, 1]) add(j.chest, { anchor: [sx * 0.07, 0.24, 0.12], rest: [sx * 0.1, -1, 0.15], n: 3, len: 0.07, stiff: 0.14, drag: 0.16,
    wind: 0.7, face: [0, 0, 1], cone: 60, sway: 0.1, seg: towelSeg, hit: [['chest', 0.03]] });
  for (const z of [-0.44, 1.46]) add(j.weapon, { anchor: [0, 0, z], rest: [0, -1, 0], n: 3, len: 0.06, stiff: 0.03, drag: 0.1, wind: 0.5,
    face: [1, 0, 0], cone: 150, sway: 0.1, seg: ropeSeg });
  return body;
}
