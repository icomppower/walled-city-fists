// Crowd skins of 城寨拳王 (src/crowd/view.js skin hook; Contracts ids): foe `serpent` 黑蛇幫 thugs · foe `khaki` crooked
// cops (kc3) · ally `resident` 街坊 · ally `kids` (kc2 escort). Head frame: soldier head space (neck at y 0, crown ≈ 0.32,
// face toward +Z), metres. The frozen crowd body is the lamellar cut: plate / lace / hi are set to the cloth colour so it
// reads as plain fabric. No badges, insignia, numbers, gang marks or text anywhere; bearers carry a lamp, never cloth.
// `kids`: the crowd view has no per-skin scale, so the kc2 escort draws its 0.7× kids as story fx figures from this
// palette and head (kidFigure below); as a crowd skin they are the same unarmed look at full size.
import { shade } from '../../../core/voxel.js';

const box = (s, p, c) => ({ s, p, c });
const flatCloth = (c, pants, extra) => ({ armor: c, hi: shade(c, 1.04), lace: shade(c, 0.94), plate: c, rivet: shade(c, 0.97), cloth: c, pants,
  wrap: pants, wrapD: shade(pants, 0.9), ...extra });

// ---------------------------------------------------------------- 黑蛇幫 serpent: white vests, flared dark trousers, slicked
// hair; choppers, bike chains, lead pipes
const SERPENT_PAL = flatCloth(0xeeebe2, 0x2a2a34, { boot: 0x1a1614, skin: 0xd6a67e, skinD: 0xb48460, eye: 0x151515, brow: 0x1c1612,
  helm: 0x141210, helmHi: 0x2a2622, band: 0x1a1a22, tassel: 0x141210, belt: 0x141414, buckle: 0x8a8a8a, bracer: 0xd6a67e });
const SERPENT_OFF = { ...SERPENT_PAL, armor: 0x222228, hi: 0x2c2c34, lace: 0x1c1c22, plate: 0x222228, rivet: 0x26262c, cloth: 0x222228, pants: 0x1a1a22,
  wrap: 0x1a1a22, wrapD: 0x141418, capeA: 0x222228, capeB: 0x2a2a30 };
function serpentHead(C, officer, b) {
  return [
    b([-0.1, 0.02, -0.09], [0.1, 0.25, 0.1], C.skin),
    b([-0.07, 0.12, 0.095], [-0.03, 0.15, 0.106], C.eye, true), b([0.03, 0.12, 0.095], [0.07, 0.15, 0.106], C.eye, true),
    b([-0.08, 0.16, 0.095], [-0.02, 0.18, 0.11], C.brow, true), b([0.02, 0.16, 0.095], [0.08, 0.18, 0.11], C.brow, true),
    b([-0.015, 0.08, 0.1], [0.02, 0.13, 0.125], C.skinD),
    b([-0.105, 0.19, -0.105], [0.105, 0.28, 0.1], C.helm), b([-0.105, 0.07, -0.105], [0.105, 0.2, -0.05], C.helm),   // slicked-back hair
    b([-0.09, 0.26, 0.0], [0.09, 0.31, 0.11], C.helmHi),                                 // the quiff
    ...(officer ? [b([-0.1, 0.12, 0.1], [0.1, 0.16, 0.115], 0x0a0a0c)] : []),         // officers: dark glasses
  ];
}
const PIPE = 0x6a6e74, CHOP = 0xb8bec6;
const SERPENT_W = {
  spear: [box([0.035, 0.035, 0.08], [0, 0, 0], 0x2a2a2e), ...[...Array(16)].map((_, k) => box(k & 1 ? [0.02, 0.035, 0.05] : [0.035, 0.02, 0.05], [0, -0.004 * k * k / 4, 0.05 + k * 0.05], k & 1 ? 0x6a6e76 : 0x8a8e96))],   // bike chain
  sword: [box([0.03, 0.035, 0.12], [0, 0, -0.02], 0x5a3a22), box([0.012, 0.1, 0.32], [0, -0.03, 0.2], CHOP), box([0.013, 0.014, 0.32], [0, -0.08, 0.2], 0xe8eef4)],   // chopper
  glaive: [box([0.045, 0.045, 1.1], [0, 0, 0.3], PIPE), box([0.06, 0.06, 0.06], [0, 0, 0.85], shade(PIPE, 0.8))],   // lead pipe
  pole: [box([0.04, 0.04, 2.3], [0, 0, 0.6], 0x3a3026), box([0.18, 0.24, 0.18], [0, -0.1, 1.8], 0xd8402a), box([0.12, 0.05, 0.12], [0, 0.04, 1.8], 0x2a2420)],   // a red paper lantern on a pole
  shield: { rim: 0x5a5e64, a: 0x8a8e94, b: 0x7a7e84, boss: 0x4a4e54, ring: 0x5a5e64, far: 0x7a7e84 },            // a bin lid
};
export const SERPENT = { palette: SERPENT_PAL, officerPalette: SERPENT_OFF, head: serpentHead, weapons: SERPENT_W, flag: null };

// ---------------------------------------------------------------- khaki: plain khaki short-sleeved uniform and shorts, long
// socks, a plain peaked cap (no badge, no number, no insignia); batons and rattan shields
const KHAKI_PAL = flatCloth(0xb8a47a, 0xb09c72, { wrap: 0x3a3226, wrapD: 0x2e281e, boot: 0x2a2018, skin: 0xd2a07a, skinD: 0xae7e5c, eye: 0x151515, brow: 0x1a1512,
  helm: 0xa89468, helmHi: 0x8a784e, band: 0x2a2018, tassel: 0x1a1816, belt: 0x3a2a1c, buckle: 0x9a9a8a, bracer: 0xd2a07a });
const KHAKI_OFF = { ...KHAKI_PAL, armor: 0xa8946a, hi: 0xb09c70, plate: 0xa8946a, cloth: 0xa8946a, capeA: 0xa8946a, capeB: 0xb8a47a };
function khakiHead(C, officer, b) {
  return [
    b([-0.1, 0.02, -0.09], [0.1, 0.25, 0.1], C.skin),
    b([-0.07, 0.12, 0.095], [-0.03, 0.15, 0.106], C.eye, true), b([0.03, 0.12, 0.095], [0.07, 0.15, 0.106], C.eye, true),
    b([-0.015, 0.08, 0.1], [0.02, 0.13, 0.125], C.skinD),
    b([-0.105, 0.08, -0.105], [0.105, 0.2, -0.05], 0x1a1612),                           // short hair under the cap
    b([-0.115, 0.19, -0.115], [0.115, 0.29, 0.105], C.helm),                             // plain peaked cap (no badge)
    b([-0.1, 0.19, 0.09], [0.1, 0.215, 0.2], C.helmHi),                                  // peak
  ];
}
const RATTAN = 0xa8844a;
const KHAKI_W = {
  spear: [box([0.035, 0.035, 0.9], [0, 0, 0.3], 0x2a2420), box([0.045, 0.045, 0.06], [0, 0, -0.12], 0x1a1614)],   // long baton
  sword: [box([0.035, 0.035, 0.55], [0, 0, 0.2], 0x2a2420)],                            // baton
  glaive: [box([0.035, 0.035, 1.5], [0, 0, 0.5], RATTAN), box([0.045, 0.045, 0.04], [0, 0, 1.1], shade(RATTAN, 0.7))],   // rattan staff
  pole: [box([0.04, 0.04, 2.2], [0, 0, 0.6], 0x2a2420), box([0.14, 0.2, 0.14], [0, 0.0, 1.75], 0xf0e8c8)],   // a hand lamp on a pole
  shield: { rim: 0x7a5a2a, a: RATTAN, b: shade(RATTAN, 0.9), boss: 0x5a4020, ring: 0x7a5a2a, far: shade(RATTAN, 0.9) },   // woven rattan shield
};
export const KHAKI = { palette: KHAKI_PAL, officerPalette: KHAKI_OFF, head: khakiHead, weapons: KHAKI_W, flag: null };

// ---------------------------------------------------------------- 街坊 resident (ally): 唐裝 in faded blue-grey, vests,
// aprons, rolled sleeves; household tools — a broom, a kitchen cleaver and a wok lid, a bamboo pole, a lantern
const RES_PAL = flatCloth(0x5a6a78, 0x2e2e34, { boot: 0x2a2624, skin: 0xe0b28a, skinD: 0xbc8e68, eye: 0x151515, brow: 0x1e1814,
  helm: 0x1c1814, helmHi: 0x3a322a, band: 0xeeeae0, tassel: 0x1c1814, belt: 0x2a2624, buckle: 0x8a8a8a, bracer: 0xe0b28a });
function residentHead(C, officer, b) {
  return [
    b([-0.1, 0.02, -0.09], [0.1, 0.25, 0.1], C.skin),
    b([-0.07, 0.12, 0.095], [-0.03, 0.15, 0.106], C.eye, true), b([0.03, 0.12, 0.095], [0.07, 0.15, 0.106], C.eye, true),
    b([-0.015, 0.08, 0.1], [0.02, 0.13, 0.125], C.skinD),
    b([-0.105, 0.19, -0.105], [0.105, 0.28, 0.09], C.helm), b([-0.105, 0.06, -0.105], [0.105, 0.2, -0.04], C.helm),   // hair
    b([-0.11, 0.2, -0.02], [0.11, 0.235, 0.105], C.band),                                // a sweat towel tied as a headband
  ];
}
const RES_W = {
  spear: [box([0.035, 0.035, 1.3], [0, 0, 0.4], 0x9a7a4a), ...[-0.06, 0, 0.06].map((x) => box([0.04, 0.05, 0.3], [x, 0, 1.15], 0xc8a860))],   // broom
  sword: [box([0.03, 0.035, 0.12], [0, 0, -0.02], 0x3a2a1c), box([0.012, 0.12, 0.2], [0, -0.035, 0.14], 0xb8bec6)],   // kitchen cleaver
  glaive: [box([0.045, 0.045, 2.0], [0, 0, 0.45], 0xc9b36a), box([0.055, 0.055, 0.02], [0, 0, 0.8], 0x8d7a3e)],   // bamboo pole
  pole: [box([0.04, 0.04, 2.3], [0, 0, 0.6], 0x3a3026), box([0.2, 0.26, 0.2], [0, -0.1, 1.8], 0xe8b040), box([0.12, 0.05, 0.12], [0, 0.05, 1.8], 0x2a2420)],   // a paper lantern
  shield: { rim: 0x2a2a2e, a: 0x3a3a40, b: 0x34343a, boss: 0x6a4a2a, ring: 0x2a2a2e, far: 0x34343a },          // a wok lid
};
export const RESIDENT = { palette: RES_PAL, head: residentHead, weapons: RES_W, flag: null };

// ---------------------------------------------------------------- kids (ally, kc2 escort): bright tees, shorts, bowl cuts;
// unarmed — a paper windmill / a ball / a satchel where the crowd rig puts a weapon
const KIDS_PAL = flatCloth(0xe8c848, 0x2a4a7a, { boot: 0xeae6dc, skin: 0xf0c49a, skinD: 0xd0a078, eye: 0x151515, brow: 0x2a1c14,
  helm: 0x141210, helmHi: 0x2a2622, band: 0xe8c848, tassel: 0x141210, belt: 0x2a4a7a, buckle: 0x2a4a7a, bracer: 0xf0c49a });
function kidsHead(C, officer, b) {
  return [
    b([-0.1, 0.0, -0.09], [0.1, 0.24, 0.1], C.skin),
    b([-0.065, 0.11, 0.095], [-0.03, 0.145, 0.106], C.eye, true), b([0.03, 0.11, 0.095], [0.065, 0.145, 0.106], C.eye, true),
    b([-0.03, 0.05, 0.1], [0.03, 0.065, 0.106], 0xc07060, true),                        // a grin
    b([-0.108, 0.16, -0.108], [0.108, 0.28, 0.108], C.helm, false), b([-0.108, 0.05, -0.108], [0.108, 0.17, -0.02], C.helm),   // bowl cut
    b([-0.108, 0.16, 0.098], [0.108, 0.17, 0.11], 0xf0c49a, true),                       // forehead under the fringe line
  ];
}
const KIDS_W = {
  spear: [box([0.02, 0.02, 0.4], [0, 0, 0.15], 0x8a6a3a), box([0.16, 0.16, 0.01], [0, 0.0, 0.36], 0xe04040), box([0.01, 0.16, 0.16], [0, 0, 0.36], 0x40a0e0)],   // paper windmill
  sword: [box([0.14, 0.14, 0.14], [0, -0.02, 0.08], 0xd84a2a)],                         // a ball
  glaive: [box([0.22, 0.18, 0.06], [0, -0.1, 0.04], 0x6a4a2a)],                          // a satchel
  pole: [box([0.02, 0.02, 0.4], [0, 0, 0.15], 0x8a6a3a), box([0.16, 0.16, 0.01], [0, 0.0, 0.36], 0xe8c848)],
  shield: { rim: 0x6a4a2a, a: 0x8a6a3a, b: 0x7a5a2a, boss: 0x6a4a2a, ring: 0x6a4a2a, far: 0x7a5a2a },           // a school bag
};
export const KIDS = { palette: KIDS_PAL, head: kidsHead, weapons: KIDS_W, flag: null };

/** A kid for the kc2 escort (render-only story fx): box list in its own frame (feet at 0, facing +Z), 0.7× a grown-up
 *  (≈ 1.2 m), tee colour from a small set by index. */
export function kidFigure(k = 0) {
  const tee = [0xe8c848, 0xe06a4a, 0x4aa0d8, 0x6ac06a, 0xe8e4d8][k % 5], P = KIDS_PAL, s = 0.7;
  const B = (w, h, d, x, y, z, c) => box([w * s, h * s, d * s], [x * s, y * s, z * s], c);
  return [
    B(0.1, 0.42, 0.12, -0.08, 0.21, 0, P.skin), B(0.1, 0.42, 0.12, 0.08, 0.21, 0, P.skin),        // legs
    B(0.12, 0.08, 0.2, -0.08, 0.04, 0.03, P.boot), B(0.12, 0.08, 0.2, 0.08, 0.04, 0.03, P.boot),   // sneakers
    B(0.34, 0.22, 0.2, 0, 0.52, 0, P.pants),                                                   // shorts
    B(0.36, 0.42, 0.22, 0, 0.84, 0, tee),                                                      // tee
    B(0.09, 0.4, 0.1, -0.23, 0.8, 0, P.skin), B(0.09, 0.4, 0.1, 0.23, 0.8, 0, P.skin),        // arms
    B(0.24, 0.26, 0.24, 0, 1.2, 0, P.skin),                                                    // head
    B(0.26, 0.12, 0.26, 0, 1.3, -0.01, P.helm), B(0.26, 0.2, 0.06, 0, 1.22, -0.11, P.helm),   // bowl cut
    B(0.04, 0.04, 0.02, -0.05, 1.21, 0.125, P.eye), B(0.04, 0.04, 0.02, 0.05, 1.21, 0.125, P.eye),
  ];
}
