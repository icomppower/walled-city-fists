// 城寨拳王 officer builder (content for the crowd view's officer-model hook, src/crowd/view.js header): part box lists in
// the crowd's soldier space (metres, feet at 0, facing +Z; pelvis 0.86 · neck +0.5 over the waist · shoulders ±0.235 @
// +0.43 · hand −0.5 below the shoulder · knee −0.42) and weapon / off-hand box lists (weapon space: grip at the origin, +Z
// along the weapon; off-hand: the left hand frame). 1970s Walled City clothes: vests, flares, shorts uniforms, long coats.
// Content rule: original designs — no badge, insignia, emblem, number, text or real gang mark on anything; tattoo-looking
// bands are plain geometric rings.
import { shade } from '../../../core/voxel.js';
import { hash01 } from '../../../core/rng.js';

export const b = (a, bb, c, paint) => ({ a, b: bb, c, paint });
export const box = (s, p, c, r) => ({ s, p, c, r });

/** Human head (neck at y 0, crown ≈ 0.3, face toward +Z). opts: hair (colour | null = bald), bald (a shaved dome, skin
 *  sheen), braid (colour: a long braid down the back), tied (colour: hair tied back in a short tail), shades (sunglasses),
 *  gold (a gold tooth), brows (heavy), grin (teeth showing), stubble (colour: a shaved jaw). */
export function humanHead(C, o = {}) {
  // face paint reaches 2.5 cm into the skull: at 0.026 m voxels the front layer's centres sit at z ≈ 0.09 (paint recolours only)
  const h = [
    b([-0.095, 0.02, -0.09], [0.095, 0.25, 0.1], C.skin),                               // skull
    b([-0.095, 0.02, 0.06], [0.095, 0.06, 0.1], C.skinD, true),                          // jaw shadow
    b([-0.065, 0.125, 0.075], [-0.03, 0.15, 0.106], C.eye ?? 0x151515, true), b([0.03, 0.125, 0.075], [0.065, 0.15, 0.106], C.eye ?? 0x151515, true),
    b([-0.075, 0.16, 0.075], [-0.02, 0.18 + (o.brows ? 0.015 : 0), 0.11], C.brow ?? 0x241c18, true),
    b([0.02, 0.16, 0.075], [0.075, 0.18 + (o.brows ? 0.015 : 0), 0.11], C.brow ?? 0x241c18, true),
    b([-0.015, 0.08, 0.1], [0.02, 0.13, 0.125], C.skinD),                                // nose
    b([-0.03, 0.045, 0.075], [0.03, 0.065, 0.105], shade(C.skinD, 0.8), true),              // mouth
  ];
  if (o.grin) h.push(b([-0.035, 0.045, 0.075], [0.035, 0.065, 0.108], 0xf0ece0, true));
  if (o.gold) h.push(b([0.005, 0.045, 0.1], [0.02, 0.065, 0.112], 0xf2c030));           // one gold tooth
  if (o.stubble != null) h.push(b([-0.096, 0.02, -0.02], [0.096, 0.09, 0.101], o.stubble, true));
  const hair = o.hair;
  if (hair != null) h.push(b([-0.105, 0.18, -0.105], [0.105, 0.29, 0.085], hair), b([-0.105, 0.06, -0.105], [0.105, 0.2, -0.05], hair),
    b([-0.108, 0.12, -0.05], [-0.09, 0.22, 0.05], hair), b([0.09, 0.12, -0.05], [0.108, 0.22, 0.05], hair));
  if (o.pomp != null) h.push(b([-0.1, 0.24, -0.04], [0.1, 0.32, 0.12], o.pomp));        // a slicked-up quiff
  if (o.bald) h.push(b([-0.1, 0.22, -0.1], [0.1, 0.27, 0.09], shade(C.skin, 1.08)));   // the shaved dome catches the light
  if (o.braid != null) {
    h.push(b([-0.03, 0.12, -0.13], [0.03, 0.2, -0.1], o.braid));
    for (let k = 0; k < 9; k++) h.push(b([-0.028 + (k & 1) * 0.006, 0.12 - k * 0.07, -0.135], [0.028 + (k & 1) * 0.006, 0.19 - k * 0.07, -0.1], k === 8 ? 0xc0282a : o.braid));
  }
  if (o.tied != null) h.push(b([-0.035, 0.14, -0.15], [0.035, 0.22, -0.1], o.tied), b([-0.025, 0.02, -0.15], [0.025, 0.15, -0.12], o.tied));
  if (o.shades) h.push(b([-0.1, 0.12, 0.1], [0.1, 0.165, 0.118], 0x0a0a0c), b([-0.07, 0.13, 0.117], [-0.02, 0.155, 0.12], 0x2a3440, true),
    b([0.02, 0.13, 0.117], [0.07, 0.155, 0.12], 0x2a3440, true));
  return h;
}

/** Body parts. C keys: shirt, pants, boot, skin, belt, buckle; opts: bulk (width ×), bare (bare chest and arms), bands
 *  (colour: plain geometric bands round both upper arms), vest (colour: a sleeveless singlet over bare arms), jacket
 *  (colour: open short jacket over the shirt), cheong (colour: a cheongsam-cut jacket — high collar, diagonal opening,
 *  trim colour o.trim), coat (colour: a long coat to the knees, sleeves to the wrist), scales (colour: rows of scale
 *  voxels on the coat), flare (flared trousers), shorts (uniform shorts: bare shins over long socks o.socks), belt2
 *  (colour: a cross strap), sleeves (colour, else shirt), rolled (short sleeves: skin forearms). */
export function humanBody(C, o = {}) {
  const w = (v) => v * (o.bulk ?? 1), S = o.sleeves ?? C.shirt;
  const p = {};
  p.hips = [
    b([-w(0.16), -0.1, -0.1], [w(0.16), 0.06, 0.1], C.pants),
    b([-w(0.17), -0.01, -0.11], [w(0.17), 0.05, 0.11], C.belt ?? 0x1c1c1c),
    b([-0.03, 0.0, 0.105], [0.03, 0.05, 0.125], C.buckle ?? 0x6a6c70),
  ];
  const top = o.bare ? C.skin : C.shirt;
  p.torso = [
    b([-w(0.15), -0.04, -0.1], [w(0.15), 0.22, 0.1], top),
    b([-w(0.18), 0.18, -0.115], [w(0.18), 0.46, 0.115], top),
    b([-0.07, 0.44, -0.07], [0.07, 0.5, 0.07], C.skin),                                  // neck
  ];
  if (o.bare) p.torso.push(b([-w(0.12), 0.3, 0.114], [-0.01, 0.34, 0.118], C.skinD, true), b([0.01, 0.3, 0.114], [w(0.12), 0.34, 0.118], C.skinD, true),   // pecs
    b([-0.005, 0.02, 0.1], [0.005, 0.28, 0.104], C.skinD, true));
  if (o.vest != null) p.torso.push(b([-w(0.155), -0.04, -0.106], [w(0.155), 0.22, 0.106], o.vest),
    b([-w(0.17), 0.18, -0.12], [w(0.17), 0.4, 0.12], (x, y, z) => (Math.abs(x) > w(0.1) && y > 0.3 ? null : o.vest)),
    b([-0.06, 0.34, 0.11], [0.06, 0.46, 0.125], C.skin));                              // scooped neck
  if (o.jacket != null) p.torso.push(b([-w(0.19), -0.06, -0.125], [w(0.19), 0.46, 0.12], (x, y, z) => (z > 0.1 && Math.abs(x) < 0.07 ? null : o.jacket)),
    b([-0.06, 0.34, 0.11], [-0.02, 0.46, 0.13], shade(o.jacket, 1.2)), b([0.02, 0.34, 0.11], [0.06, 0.46, 0.13], shade(o.jacket, 1.2)));   // lapels
  if (o.cheong != null) {
    const T = o.trim ?? shade(o.cheong, 1.5);
    p.torso.push(b([-w(0.185), -0.06, -0.125], [w(0.185), 0.47, 0.125], o.cheong), b([-0.08, 0.44, -0.08], [0.08, 0.53, 0.09], o.cheong),   // high collar
      b([-0.08, 0.51, -0.08], [0.08, 0.53, 0.092], T, true));
    for (let k = 0; k < 5; k++) p.torso.push(b([-0.02 - k * 0.03, 0.42 - k * 0.04, 0.124], [0.01 - k * 0.03, 0.46 - k * 0.04, 0.13], T));   // the diagonal opening
  }
  if (o.coat != null) {
    const sc = (x, y, z, i, j) => (o.scales != null && (i + (j & 1)) % 2 === 0 && j % 2 === 0 ? o.scales : o.coat);
    p.torso.push(b([-w(0.2), -0.06, -0.13], [w(0.2), 0.47, 0.13], (x, y, z, i, j, k) => (z > 0.11 && Math.abs(x) < 0.05 && y < 0.4 ? C.shirt : sc(x, y, z, i, j, k))),
      b([-0.09, 0.42, -0.09], [0.09, 0.52, 0.1], o.coat));                              // stand collar
    p.hips.push(b([-w(0.22), -0.72, -0.15], [w(0.22), 0.04, 0.15], (x, y, z, i, j, k) => (z > 0.13 && Math.abs(x) < 0.04 ? null : sc(x, y, z, i, j, k))));   // skirts to the knee
  }
  if (o.belt2 != null) p.torso.push(b([-w(0.19), 0.1, -0.13], [w(0.19), 0.14, 0.13], o.belt2));
  const armC = o.bare ? C.skin : o.vest != null ? C.skin : o.coat ?? o.cheong ?? o.jacket ?? S;
  p.arm = [
    b([-0.055, -0.24, -0.06], [0.055, 0.03, 0.06], armC),
    b([-0.055, -0.46, -0.058], [0.055, -0.22, 0.058], o.rolled || o.bare || o.vest != null ? C.skin : armC),
    b([-0.045, -0.56, -0.05], [0.045, -0.46, 0.05], C.glove ?? C.skin),
  ];
  if (o.rolled && !o.bare && o.vest == null) p.arm.push(b([-0.06, -0.26, -0.064], [0.06, -0.22, 0.064], shade(armC, 1.15)));   // rolled cuff
  if (o.bands != null) p.arm.push(b([-0.058, -0.1, -0.063], [0.058, -0.075, 0.063], o.bands), b([-0.058, -0.16, -0.063], [0.058, -0.135, 0.063], o.bands),
    b([-0.058, -0.2, -0.063], [0.058, -0.185, 0.063], o.bands));                        // plain geometric bands
  p.thigh = [b([-0.068, -0.43, -0.072], [0.068, 0.02, 0.072], C.pants)];
  if (o.shorts) {
    p.thigh = [b([-0.072, -0.2, -0.076], [0.072, 0.02, 0.076], C.pants), b([-0.06, -0.43, -0.064], [0.06, -0.2, 0.064], C.skin)];
    p.shin = [b([-0.058, -0.3, -0.062], [0.058, 0.02, 0.062], (x, y) => (y > -0.12 ? C.skin : o.socks ?? C.pants)), b([-0.07, -0.42, -0.078], [0.07, -0.29, 0.13], C.boot)];
  } else if (o.flare) {
    p.shin = [b([-0.062, -0.3, -0.066], [0.062, 0.02, 0.066], C.pants), b([-0.085, -0.36, -0.09], [0.085, -0.2, 0.09], C.pants),
      b([-0.07, -0.42, -0.078], [0.07, -0.34, 0.13], C.boot)];
  } else p.shin = [b([-0.062, -0.3, -0.066], [0.062, 0.02, 0.066], C.pants), b([-0.07, -0.42, -0.078], [0.07, -0.29, 0.13], C.boot)];
  return p;
}

/** A straight pole / baton along +Z (grip at 0): from `butt` to `tip`, width w, colour c, darker bands every `node` m. */
export function stick(c, { butt = -0.2, tip = 0.6, w = 0.04, node = 0, nodeC = shade(c, 0.7) } = {}) {
  const out = [box([w, w, tip - butt], [0, 0, (tip + butt) / 2], c)];
  if (node) for (let z = butt + node; z < tip - 0.05; z += node) out.push(box([w + 0.012, w + 0.012, 0.03], [0, 0, z], nodeC));
  return out;
}
/** Chopper (meat cleaver-style broad knife): wooden handle, a wide rectangular steel blade, bright edge down. */
export const chopper = (L = 0.34) => [box([0.03, 0.035, 0.13], [0, 0, -0.02], 0x5a3a22), box([0.012, 0.11, L], [0, -0.03, 0.05 + L / 2], 0xb8bec6),
  box([0.013, 0.015, L], [0, -0.085, 0.05 + L / 2], 0xe8eef4)];
/** Bike chain swung out along +Z: dark links alternating, a padlock-free end (a steel ring). */
export function bikeChain(L = 0.9) {
  const out = [box([0.04, 0.04, 0.08], [0, 0, 0], 0x2a2a2e)];
  for (let k = 0, n = Math.round(L / 0.05); k < n; k++) out.push(box(k & 1 ? [0.02, 0.035, 0.05] : [0.035, 0.02, 0.05], [0, -0.01 * k * k / n, 0.05 + k * 0.05], k & 1 ? 0x6a6e76 : 0x8a8e96));
  return out;
}
/** Round wooden shield (left hand frame): planks, an iron rim ring, a boss. */
export function woodShield(r = 0.3, zo = 0.12) {
  const out = [];
  for (let k = -3; k <= 3; k++) { const h = Math.sqrt(Math.max(0, 1 - (k / 3.5) ** 2)) * r * 2; out.push(box([r * 2 / 7 + 0.004, h, 0.035], [k * r * 2 / 7, 0.05, zo], k % 2 ? 0x7a5230 : 0x6a4626)); }
  out.push(box([r * 2 + 0.02, 0.025, 0.045], [0, 0.05 + r, zo], 0x3a3a3e), box([r * 2 + 0.02, 0.025, 0.045], [0, 0.05 - r, zo], 0x3a3a3e),
    box([0.1, 0.1, 0.04], [0, 0.05, zo + 0.025], 0x4a4a4e));
  return out;
}
/** Lay a weapon (+Z along it) flat for the crowd view's KO `broken.head` slot (its frame stands +Y up after a −90° X
 *  turn): swap the Y / Z axes of every box. */
export const flat = (boxes) => boxes.map((q) => ({ ...q, s: [q.s[0], q.s[2], q.s[1]], p: [q.p[0], q.p[2], q.p[1]] }));
/** An empty hand (KO `broken.haft`): a fist-sized nothing so the hand frame keeps a mesh. */
export const EMPTY_HAND = [box([0.02, 0.02, 0.02], [0, 0, 0], 0x2a2a2a)];
export { hash01 };
