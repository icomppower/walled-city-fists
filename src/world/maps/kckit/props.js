// 城寨拳王 map render kit — props as box lists (render-only). A prop builder returns boxes in its own frame (metres,
// origin on the ground at its centre, +Z = its front); place() moves them into the world, merge() bakes a list into one
// geometry (src/core/voxel.js boxesGeometry: { s: [w, h, d], p: [cx, cy, cz], c, r? }). The 1975 Walled City: stained
// tenement blocks grown into each other, window cages, laundry poles, rooftop water tanks and TV aerials, neon, the wet
// market's stalls, pipe bundles over the alleys, the gang's iron gate, the old 衙門 hall, a street stall, an airliner on
// its approach. Generic designs: neon is abstract tube shapes, no signage text, no real shop, brand, logo or livery.
import * as THREE from 'three';
import { boxesGeometry, shade } from '../../../core/voxel.js';
import { hash01 } from '../../../core/rng.js';

export const bx = (s, p, c, r) => ({ s, p, c, r });
const _qy = new THREE.Quaternion(), _ql = new THREE.Quaternion(), _e = new THREE.Euler(), _Y = new THREE.Vector3(0, 1, 0);
/** Boxes of a prop frame → world: rotate by yaw about Y (composed with each box's own rotation), scale k, lift y, move. */
export function place(boxes, x, y, z, yaw = 0, k = 1) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  _qy.setFromAxisAngle(_Y, yaw);
  return boxes.map((q) => {
    const [px, py, pz] = q.p;
    let r = [0, yaw, 0];
    if (q.r) { _ql.setFromEuler(_e.set(q.r[0], q.r[1], q.r[2], 'XYZ')); _ql.premultiply(_qy); _e.setFromQuaternion(_ql, 'XYZ'); r = [_e.x, _e.y, _e.z]; }
    return { s: q.s.map((v) => v * k), p: [x + (px * c + pz * s) * k, y + py * k, z + (-px * s + pz * c) * k], c: q.c, r };
  });
}
export const merge = (boxes) => boxesGeometry(boxes);
export const propMaterial = (o = {}) => new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85, metalness: 0.04, ...o });

// faded 1970s concrete and paint
export const WALLS = [0x8a8274, 0x746e64, 0x7a8276, 0x8a7a6c, 0x6a7270, 0x908872, 0x707882, 0x7e7062];   // stained, weathered
export const IRON = 0x3a3c40, RUST = 0x7a4a2a, WOOD = 0x6a4a2c, TILE = 0x6a3a2a;
const LIT = [0xf0d8a0, 0xe8c888, 0xa8c8e8, 0xf0e0c0, 0x9ab8f0];            // tungsten, warm, TV blue, pale, TV
const CLOTHES = [0xe8e4d8, 0x3a5a8a, 0xc85a4a, 0xe8c848, 0x5a8a5a, 0x8a5a8a, 0xf0f0f0, 0x4a4a4a];

/** Tenement block: stained slab (w × d footprint, h tall), a window grid on the faces listed in `faces` (0 front +Z,
 *  1 back, 2 left −X, 3 right +X) with iron window cages, lit windows (→ `lit`), laundry poles with clothes, a rooftop
 *  shack, water tanks and TV aerials. → { body, lit } box lists. */
export function block(w, d, h, seed = 0, { faces = [0, 2, 3], litP = 0.4, cages = 0.35, laundry = 0.25 } = {}) {
  const col = WALLS[Math.floor(hash01(seed, 1) * WALLS.length)], body = [bx([w, h, d], [0, h / 2, 0], col)], lit = [];
  body.push(bx([w + 0.2, 0.3, d + 0.2], [0, h + 0.15, 0], shade(col, 0.7)));                        // roof parapet
  for (let y = 3; y < h - 1; y += 2.8) body.push(bx([w + 0.04, 0.12, d + 0.04], [0, y, 0], shade(col, 0.8 + hash01(seed, y) * 0.1)));   // floor lines / stains
  const fl = 2.8, nF = Math.floor((h - 2) / fl);
  for (const f of faces) {
    const len = f < 2 ? w : d, n = Math.max(1, Math.floor(len / 2.4)), sgn = f === 0 || f === 3 ? 1 : -1;
    for (let k = 0; k < n; k++) {
      const u = -len / 2 + (k + 0.5) * len / n;
      for (let j = 0; j < nF; j++) {
        const y = 1.6 + j * fl + 0.9, hs = hash01(seed * 13 + f, k * 7 + j, 3), on = hs < litP;
        const at = (dx, dy, dz, sw, sh, sd, c) => (f < 2 ? bx([sw, sh, sd], [u + dx, y + dy, sgn * (d / 2 + dz)], c) : bx([sd, sh, sw], [sgn * (w / 2 + dz), y + dy, u + dx], c));
        (on ? lit : body).push(at(0, 0, 0.03, 1.2, 1.3, 0.08, on ? LIT[Math.floor(hash01(seed, k, j) * LIT.length)] : 0x1c2026));
        if (hash01(seed + 5, k, j) < cages) {                        // iron window cage (the Walled City's grilles)
          body.push(at(0, -0.7, 0.3, 1.5, 0.1, 0.6, IRON), at(0, 0.72, 0.3, 1.5, 0.08, 0.6, IRON), at(-0.72, 0, 0.3, 0.06, 1.5, 0.6, IRON), at(0.72, 0, 0.3, 0.06, 1.5, 0.6, IRON),
            at(0, 0, 0.6, 1.5, 1.5, 0.04, shade(IRON, 1.3)));
        } else if (hash01(seed + 9, k, j) < laundry) {               // laundry pole with clothes hung out
          body.push(at(0, 0.8, 0.9, 0.04, 0.04, 1.8, 0x8a7a5a));
          for (let q = 0; q < 3; q++) body.push(at(-0.35 + q * 0.35, 0.45, 0.7 + q * 0.35, 0.3, 0.6, 0.04, CLOTHES[Math.floor(hash01(seed, k * 3 + q, j) * CLOTHES.length)]));
        }
      }
    }
  }
  // roof clutter: a shack, water tanks, TV aerials
  if (hash01(seed, 21) < 0.6) body.push(bx([w * 0.35, 2.2, d * 0.4], [(hash01(seed, 22) - 0.5) * w * 0.4, h + 1.1, (hash01(seed, 23) - 0.5) * d * 0.3], shade(col, 0.85)),
    bx([w * 0.4, 0.12, d * 0.46], [(hash01(seed, 22) - 0.5) * w * 0.4, h + 2.26, (hash01(seed, 23) - 0.5) * d * 0.3], 0x5a5e62));
  for (let t = 0; t < 1 + Math.floor(hash01(seed, 24) * 2); t++) body.push(...place(waterTank(), (hash01(seed, 25 + t) - 0.5) * w * 0.6, h, (hash01(seed, 27 + t) - 0.5) * d * 0.6));
  for (let a = 0; a < 2 + Math.floor(hash01(seed, 30) * 3); a++) body.push(...place(aerial(2 + hash01(seed, 31 + a) * 2), (hash01(seed, 34 + a) - 0.5) * w * 0.8, h, (hash01(seed, 38 + a) - 0.5) * d * 0.8, hash01(seed, 40 + a) * 3));
  return { body, lit };
}
/** Rooftop water tank on legs (cylinder as stacked boxes). */
export function waterTank(c = 0x5a7a8a) {
  const out = [bx([0.1, 1, 0.1], [-0.5, 0.5, -0.5], IRON), bx([0.1, 1, 0.1], [0.5, 0.5, -0.5], IRON), bx([0.1, 1, 0.1], [-0.5, 0.5, 0.5], IRON), bx([0.1, 1, 0.1], [0.5, 0.5, 0.5], IRON)];
  for (let k = 0; k < 4; k++) out.push(bx([1.4 - (k === 0 || k === 3 ? 0.2 : 0), 0.4, 1.4 - (k === 0 || k === 3 ? 0.2 : 0)], [0, 1.2 + k * 0.4, 0], k & 1 ? c : shade(c, 0.85)));
  out.push(bx([0.5, 0.1, 0.5], [0, 2.85, 0], shade(c, 0.7)));
  return out;
}
/** TV aerial: a mast with three crossbars of rods (the Walled City roof forest). */
export function aerial(h = 3) {
  const out = [bx([0.05, h, 0.05], [0, h / 2, 0], 0x8a8e92)];
  for (let k = 0; k < 3; k++) { const y = h - 0.2 - k * 0.45, L = 1.2 - k * 0.25; out.push(bx([L, 0.03, 0.03], [0, y, 0], 0x9a9ea2)); for (let q = -2; q <= 2; q++) out.push(bx([0.02, 0.02, 0.4], [q * L / 5, y, 0.18], 0x9a9ea2)); }
  return out;
}
/** Abstract neon sign: a dark backing board with glowing tube strokes (no text) → { body, glow }. w × h, colour c. */
export function neon(w, h, c, seed = 0) {
  const body = [bx([w, h, 0.12], [0, 0, 0], 0x1a1a1e), bx([0.08, 0.08, 0.6], [-w / 2 + 0.2, h / 2 - 0.1, -0.35], IRON), bx([0.08, 0.08, 0.6], [w / 2 - 0.2, h / 2 - 0.1, -0.35], IRON)];
  const glow = [bx([w - 0.1, 0.07, 0.06], [0, h / 2 - 0.1, 0.08], c), bx([w - 0.1, 0.07, 0.06], [0, -h / 2 + 0.1, 0.08], c),
    bx([0.07, h - 0.2, 0.06], [-w / 2 + 0.1, 0, 0.08], c), bx([0.07, h - 0.2, 0.06], [w / 2 - 0.1, 0, 0.08], c)];
  const n = 2 + Math.floor(hash01(seed, 3) * 3);                       // inner strokes: bars, ticks and boxes, not letters
  for (let k = 0; k < n; k++) {
    const vy = h > w, t = (k + 0.5) / n - 0.5, sz = 0.3 + hash01(seed, k) * 0.3;
    glow.push(vy ? bx([w * sz, 0.07, 0.06], [(hash01(seed, k, 2) - 0.5) * w * 0.3, t * (h - 0.5), 0.08], c) : bx([0.07, h * sz, 0.06], [t * (w - 0.5), (hash01(seed, k, 2) - 0.5) * h * 0.3, 0.08], c));
    if (hash01(seed, k, 4) < 0.5) glow.push(vy ? bx([0.07, 0.3, 0.06], [w * sz / 2, t * (h - 0.5), 0.08], c) : bx([0.3, 0.07, 0.06], [t * (w - 0.5), h * sz / 2, 0.08], c));
  }
  return { body, glow };
}
/** Wet-market stall: counter, striped canvas awning, crates of goods, a hanging bulb (→ glow). w wide, faces +Z. */
export function stall(w = 2.6, seed = 0) {
  const aw = [0xc84a3a, 0x3a7a5a, 0x3a5a9a, 0xd8a83a][Math.floor(hash01(seed, 1) * 4)];
  const goods = [0x8ac05a, 0xe0a040, 0xd85a4a, 0xa8c8d8, 0xe8d8a0];
  const body = [bx([w, 0.9, 1.2], [0, 0.45, 0], 0x8a8478), bx([w + 0.1, 0.06, 1.3], [0, 0.93, 0], 0xb8b8b0),
    bx([0.08, 2.4, 0.08], [-w / 2, 1.2, -0.6], IRON), bx([0.08, 2.4, 0.08], [w / 2, 1.2, -0.6], IRON)];
  for (let k = 0; k < 6; k++) body.push(bx([w / 6, 0.05, 1.8], [-w / 2 + (k + 0.5) * w / 6, 2.35 - 0.15, 0.2], k & 1 ? aw : 0xe8e4d8, [0.16, 0, 0]));   // awning stripes
  for (let k = 0; k < 4; k++) body.push(bx([0.5, 0.18, 0.4], [-w / 2 + 0.4 + k * (w - 0.8) / 3, 1.05, 0.1], goods[Math.floor(hash01(seed, k) * goods.length)]));
  body.push(bx([0.6, 0.4, 0.5], [w / 2 - 0.3, 0.2, 1.0], 0x8a6a3a), bx([0.5, 0.35, 0.45], [-w / 2 + 0.4, 0.18, 1.0], 0x2a5a8a));   // crate, basin
  return { body, glow: [bx([0.18, 0.18, 0.18], [0, 2.0, 0], 0xffd890)] };
}
/** 大牌檔 street stall (阿鐵's): a steel cart with a stove and a big wok, folding tables and stools. */
export function daiPaiDong(seed = 0) {
  const body = [bx([2.4, 1.0, 1.1], [0, 0.5, 0], 0x4a6a5a), bx([2.5, 0.08, 1.2], [0, 1.04, 0], 0x9a9ea2),
    bx([0.7, 0.2, 0.7], [-0.6, 1.18, 0], 0x2a2a2e), bx([0.62, 0.12, 0.62], [-0.6, 1.3, 0], 0x1a1a1c),       // stove, wok
    bx([0.08, 1.6, 0.08], [-1.2, 1.8, -0.5], IRON), bx([0.08, 1.6, 0.08], [1.2, 1.8, -0.5], IRON), bx([2.6, 0.06, 1.6], [0, 2.6, 0.2], 0x3a6a4a, [0.12, 0, 0])];
  for (const [x, z] of [[-1.4, 2.2], [1.2, 2.4]]) {
    body.push(bx([1.0, 0.05, 0.8], [x, 0.72, z], 0xb8a878), bx([0.05, 0.7, 0.05], [x - 0.4, 0.36, z - 0.3], IRON), bx([0.05, 0.7, 0.05], [x + 0.4, 0.36, z + 0.3], IRON));
    for (const [dx, dz] of [[-0.7, 0], [0.7, 0], [0, 0.7]]) body.push(bx([0.32, 0.42, 0.32], [x + dx, 0.21, z + dz], hash01(seed, x, dx + dz) < 0.5 ? 0xc83a2a : 0x2a5a9a));
  }
  return body;
}
/** Overhead pipe bundle along +Z (length L) at height y: water pipes, a thick drain, wires; returns drip spots [x, z]. */
export function pipes(L, y = 3.2, seed = 0) {
  const out = [], drips = [];
  const runs = [[-0.4, 0.1, 0x6a6e72], [-0.15, 0.08, RUST], [0.1, 0.12, 0x7a7e82], [0.35, 0.07, RUST], [0.0, 0.18, 0x4a4e52]];
  runs.forEach(([x, r, c], k) => { out.push(bx([r, r, L], [x, y + k * 0.12, 0], c)); for (let z = -L / 2 + 1.5; z < L / 2; z += 2.5 + hash01(seed, k) * 2) out.push(bx([r + 0.04, r + 0.04, 0.08], [x, y + k * 0.12, z], shade(c, 0.7))); });
  for (let z = -L / 2 + 1; z < L / 2; z += 3.1) drips.push([(hash01(seed, z) - 0.5) * 0.8, z]);
  for (let k = 0; k < 3; k++) out.push(bx([0.02, 0.02, L], [-0.6 + k * 0.6, y + 0.9 + k * 0.1, 0], 0x1a1a1a));   // wires
  return { boxes: out, drips };
}
/** The gang's iron gate across an opening (w wide, h tall) along X: bars, crossbars, a chained padlock. */
export function ironGate(w = 7, h = 3.2) {
  const out = [];
  for (let x = -w / 2 + 0.15; x <= w / 2; x += 0.3) out.push(bx([0.06, h, 0.06], [x, h / 2, 0], IRON));
  for (const y of [0.3, h / 2, h - 0.2]) out.push(bx([w, 0.1, 0.1], [0, y, 0], shade(IRON, 1.2)));
  out.push(bx([0.2, 0.26, 0.14], [0.25, h / 2 - 0.3, 0.12], 0x8a8a92), bx([0.9, 0.05, 0.05], [0.1, h / 2 - 0.1, 0.1], 0x9a9aa2, [0, 0, 0.5]));
  return out;
}
/** The old 衙門 hall (a late-Qing yamen building, the city's oldest): stone platform, red columns, a tiled hip roof with
 *  upturned eaves, a plain board over the door. w wide, faces +Z (toward the courtyard: place with yaw π). */
export function yamenHall(w = 16, d = 8) {
  const out = [bx([w + 1, 0.6, d + 1], [0, 0.3, 0], 0x8a8478), bx([w, 3.6, d], [0, 2.4, 0], 0xb8b0a0)];
  for (let x = -w / 2 + 1; x <= w / 2 - 1; x += (w - 2) / 5) out.push(bx([0.35, 3.6, 0.35], [x, 2.4, d / 2 + 0.3], 0x8a2a1e));
  for (let k = 0; k < 5; k++) out.push(bx([w + 2.4 - k * 1.1, 0.35, d + 2.4 - k * 1.1], [0, 4.4 + k * 0.35, 0.2], k ? TILE : shade(TILE, 0.8)));
  out.push(bx([w - 4, 0.3, 0.4], [0, 6.2, 0.2], shade(TILE, 0.7)), bx([0.6, 0.6, 0.6], [-(w - 4) / 2, 6.4, 0.2], shade(TILE, 0.7)), bx([0.6, 0.6, 0.6], [(w - 4) / 2, 6.4, 0.2], shade(TILE, 0.7)));
  out.push(bx([2.6, 3, 0.1], [0, 2.1, d / 2 + 0.02], 0x3a2418), bx([2.2, 0.6, 0.12], [0, 4.0, d / 2 + 0.2], 0x2a1a12));   // doorway, a plain board
  return out;
}
/** Red paper lantern (hung from a wire): shell + caps → { body, glow } (glow: its lit shell). */
export const lantern = () => ({ body: [bx([0.03, 0.4, 0.03], [0, 0.55, 0], 0x1a1a1a), bx([0.24, 0.05, 0.24], [0, 0.34, 0], 0x2a1a12), bx([0.24, 0.05, 0.24], [0, -0.04, 0], 0x2a1a12)],
  glow: [bx([0.38, 0.34, 0.38], [0, 0.15, 0], 0xd8402a)] });
/** Mahjong table with four stools. */
export const mahjong = () => [bx([0.9, 0.05, 0.9], [0, 0.75, 0], 0x2a6a4a), bx([0.8, 0.72, 0.8], [0, 0.36, 0], 0x5a3a24),
  ...[[0, 0.75], [0, -0.75], [0.75, 0], [-0.75, 0]].map(([x, z]) => bx([0.34, 0.45, 0.34], [x, 0.22, z], 0x8a5a2a)),
  ...[...Array(8)].map((_, k) => bx([0.05, 0.035, 0.035], [-0.3 + (k % 4) * 0.2, 0.795, k < 4 ? -0.3 : 0.3], 0xf0ece0))];
export const crate = (c = 0x8a6a3a) => [bx([0.6, 0.45, 0.45], [0, 0.22, 0], c), bx([0.62, 0.04, 0.47], [0, 0.3, 0], shade(c, 0.8))];
/** Airliner on approach, generic silhouette (no livery): fuselage along +Z, swept wings, tail fin, four engines. */
export function jet() {
  const W = 0xd8dce0, G = 0x9aa0a6;
  const out = [bx([4, 4, 46], [0, 0, 0], W), bx([3, 3, 4], [0, -0.2, 24], G), bx([2.4, 2.4, 6], [0, 0.4, -25], W),
    bx([52, 0.6, 7], [0, -0.8, 2], G, [0, 0, 0]), bx([16, 0.4, 4], [0, 0.6, -22], G), bx([0.5, 8, 5], [0, 5, -22], W)];
  for (const x of [-16, -8, 8, 16]) out.push(bx([1.6, 1.6, 4], [x, -2.1, 5], 0x6a6e74));
  return out;
}
