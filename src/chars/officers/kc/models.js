// Officer + boss models of 城寨拳王 (crowd view officer-model hook; Contracts ids): officers `chain` 飛仔 · `blade` 刀手,
// bosses `ox` 鐵牛 · `swallow` 飛燕 · `goldtooth` 金牙探長 · `serpent` 蛇王 (Characters & Moveset page). Scale: the crowd
// officer is 1.22 ≈ 1.06 × the hero, so hero × k ≈ 1.15 k. Original archetypes: no real person, no real gang mark, no
// badge (Gold-Tooth's khaki carries none), no text. Beaten, not killed: every one kneels on the KO and drops the weapon
// (broken.head lies by him; the 蛇王's guandao snaps: its haft stays in his hand).
import { shade } from '../../../core/voxel.js';
import { humanHead, humanBody, stick, box, b, chopper, bikeChain, woodShield, flat, EMPTY_HAND } from './kckit.js';

const hex = (s) => parseInt(s.slice(1), 16);
const SKIN = { skin: 0xd6a67e, skinD: 0xb48460, eye: 0x151515, brow: 0x241c18 };

// ---------------------------------------------------------------- 飛仔 chain: a lean young tough — short denim jacket over a
// white tee, flared jeans, a slicked quiff; a bike chain
const CHN = { ...SKIN, shirt: 0xeeebe2, pants: hex('#2E3E5C'), boot: 0x1a1614, belt: 0x141414, buckle: 0xb8b8b8 };
const CHAIN_W = bikeChain(1.0);
export const CHAIN = {
  parts: { ...humanBody(CHN, { bulk: 0.95, jacket: hex('#3A5680'), flare: true }), head: humanHead(CHN, { hair: 0x141210, pomp: 0x1c1a18 }) },
  weapon: CHAIN_W, broken: { haft: EMPTY_HAND, head: flat(CHAIN_W) },
  scale: 1.2, tip: 1.0, voxel: 0.03, kneel: true,
};

// ---------------------------------------------------------------- 刀手 blade: stocky, dark vest, cropped head; a chopper and
// a round wooden shield
const BLD = { ...SKIN, shirt: 0x2a2a30, pants: 0x3a3630, boot: 0x1a1614, belt: 0x1a1a1a };
const BLADE_W = chopper(0.36);
export const BLADE = {
  parts: { ...humanBody(BLD, { bulk: 1.12, vest: 0x2a2a30 }), head: humanHead(BLD, { hair: 0x1c1a18, brows: true, stubble: 0x8a6a50 }) },
  weapon: BLADE_W, offhand: woodShield(0.3), broken: { haft: EMPTY_HAND, head: flat(BLADE_W) },
  scale: 1.24, tip: 0.45, voxel: 0.03, kneel: true,
};

// ---------------------------------------------------------------- 鐵牛 Iron Ox (kc1): 1.2×, bare-chested, plain geometric
// bands round both arms, bald, black work trousers; a sledgehammer (1.2 m haft, iron head)
const OXC = { ...SKIN, skin: 0xc89468, skinD: 0xa87450, pants: 0x1e1e22, boot: 0x141414, belt: 0x5a3a22, buckle: 0x9a9a9a };
const HAMMER = [...stick(0x6a4a2c, { butt: -0.3, tip: 1.0, w: 0.05 }), box([0.2, 0.2, 0.34], [0, 0, 1.05], 0x3a3c40), box([0.21, 0.04, 0.35], [0, 0.09, 1.05], 0x5a5c62)];
export const OX = {
  parts: { ...humanBody(OXC, { bulk: 1.3, bare: true, bands: 0x1a1a22 }), head: humanHead(OXC, { bald: true, brows: true, stubble: 0x6a4a34 }) },
  weapon: HAMMER, broken: { haft: EMPTY_HAND, head: flat(HAMMER) },
  scale: 1.38, tip: 1.2, voxel: 0.028, kneel: true,
};

// ---------------------------------------------------------------- 飛燕 Swallow (kc2): slim, black cheongsam-cut jacket (dark
// red trim), black trousers, a long braid; throwing knives — one in the hand, spares in a bandolier
const SWC = { ...SKIN, skin: 0xe8b890, skinD: 0xc89870, shirt: 0x141418, pants: 0x141418, boot: 0x0e0e10, belt: 0x141418, buckle: 0x3a3a3e };
const KNIFE = [box([0.02, 0.025, 0.1], [0, 0, -0.03], 0x2a2420), box([0.008, 0.035, 0.2], [0, 0, 0.12], 0xd8dee6), box([0.04, 0.02, 0.01], [0, 0, 0.02], 0x8a6a2a)];
const FAN = [-0.35, 0, 0.35].flatMap((a) => KNIFE.map((q) => box(q.s, [q.p[0] + Math.sin(a) * q.p[2], q.p[1], q.p[2] * Math.cos(a)], q.c, [0, a, 0])));
const SW_BODY = humanBody(SWC, { bulk: 0.9, cheong: 0x16161a, trim: 0x8a1e1e });
for (let k = 0; k < 6; k++) SW_BODY.torso.push(b([0.12 - k * 0.05, 0.4 - k * 0.06, 0.124], [0.16 - k * 0.05, 0.44 - k * 0.06, 0.134], 0x5a1a1a));   // bandolier strap
for (const k of [1, 3, 5]) SW_BODY.torso.push(b([0.125 - k * 0.05, 0.36 - k * 0.06, 0.13], [0.145 - k * 0.05, 0.46 - k * 0.06, 0.142], 0xd8dee6));   // spare knives
export const SWALLOW = {
  parts: { ...SW_BODY, head: humanHead(SWC, { hair: 0x0e0c0c, braid: 0x0e0c0c }) },
  weapon: KNIFE, broken: { haft: EMPTY_HAND, head: flat([...KNIFE, ...FAN.map((q) => ({ ...q, p: [q.p[0] + 0.1, q.p[1], q.p[2]] }))]) },
  scale: 1.2, tip: 0.25, voxel: 0.026, kneel: true,
};

// ---------------------------------------------------------------- 金牙探長 Gold-Tooth (kc3): 1.1×, a plain khaki uniform
// (short sleeves, long trousers, a cross strap — no badge, no number), sunglasses, one gold tooth; a baton, a revolver in a belt holster (the bursts are the script's)
const GTC = { ...SKIN, shirt: 0xb8a47a, pants: 0xa8946a, boot: 0x1a1410, belt: 0x3a2a1c, buckle: 0x9a9a8a };
const BATON = stick(0x1e1a16, { butt: -0.15, tip: 0.6, w: 0.04 });
export const REVOLVER = [box([0.03, 0.09, 0.05], [0, -0.04, 0.0], 0x3a2a1c), box([0.035, 0.05, 0.08], [0, 0.02, 0.05], 0x2a2c30), box([0.018, 0.018, 0.12], [0, 0.03, 0.14], 0x1e2024)];
const GT_BODY = humanBody(GTC, { bulk: 1.18, rolled: true, belt2: 0x3a2a1c });
GT_BODY.hips.push(b([0.17, -0.12, -0.03], [0.22, 0.02, 0.06], 0x3a2a1c), b([0.18, 0.02, -0.01], [0.215, 0.08, 0.04], 0x2a2c30));   // holstered revolver
export const GOLDTOOTH = {
  parts: { ...GT_BODY, head: humanHead(GTC, { hair: 0x1a1612, shades: true, gold: true, grin: true, brows: true }) },
  weapon: BATON, broken: { haft: EMPTY_HAND, head: flat([...BATON, ...REVOLVER.map((q) => ({ ...q, p: [q.p[0] + 0.14, q.p[1], q.p[2] + 0.2] }))]) },
  scale: 1.28, tip: 0.6, voxel: 0.028, kneel: true,
};

// ---------------------------------------------------------------- 蛇王 Serpent King (kc4): 1.25×, a black silk long coat with
// rows of plain scale voxels (dark green-black), silver hair tied back; a 2.4 m 大刀 guandao — it snaps on the KO
const SKC = { ...SKIN, skin: 0xd8ac86, skinD: 0xb88c66, shirt: 0x2a2a2e, pants: 0x121214, boot: 0x0c0c0e, belt: 0x1a1a1c, buckle: 0x9a9aa2 };
const HAFT = (a, z) => [box([0.05, 0.05, z - a], [0, 0, (a + z) / 2], 0x2a1a14), ...[a + 0.25, z - 0.3].map((q) => box([0.06, 0.06, 0.04], [0, 0, q], 0x8a8a92))];
const GUANDAO_BLADE = (z) => [box([0.07, 0.08, 0.1], [0, 0, z], 0x8a8a92),                                // collar
  ...[...Array(6)].map((_, k) => box([0.014, 0.16 - k * 0.01, 0.1], [0, 0.03 + k * 0.012, z + 0.1 + k * 0.1], 0xc8ced6)),   // the crescent blade
  ...[...Array(6)].map((_, k) => box([0.016, 0.02, 0.1], [0, -0.05 + k * 0.012, z + 0.1 + k * 0.1], 0xeef3f8)),             // its edge
  box([0.02, 0.06, 0.08], [0, 0.12, z + 0.2], 0x8a8a92)];                                                                     // the back spur
const GUANDAO = [...HAFT(-0.6, 1.2), ...GUANDAO_BLADE(1.25)];
export const SERPENT_KING = {
  parts: { ...humanBody(SKC, { bulk: 1.15, coat: 0x141416, scales: 0x1e2a22 }), head: humanHead({ ...SKC, brow: 0xb8bcc2 }, { hair: 0xc8ccd2, tied: 0xc8ccd2, brows: true }) },
  weapon: GUANDAO, broken: { haft: HAFT(-0.6, 0.3), head: flat([...HAFT(0.3, 1.2).map((q) => ({ ...q, p: [q.p[0], q.p[1], q.p[2] - 0.9] })), ...GUANDAO_BLADE(0.35)]) },
  scale: 1.44, tip: 1.85, voxel: 0.026, kneel: true,
};
export { shade };
