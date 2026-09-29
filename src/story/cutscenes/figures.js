// Cutscene extras and props (render-only box figures; the playable actors are the shipped 阿鐵 / 阿翠 models, stage.js).
// figure(kind, k) → THREE.Group { body mesh, arm (a pivot at the right shoulder: .rotation.x raises it) } in its own frame
// (feet at 0, facing +Z). kinds: resident (唐裝 / vest / apron, a towel headband sometimes) · uncle (white vest, bald,
// grey) · auntie (floral blouse, permed hair) · worker (singlet + apron) · kid (0.7×, the `kids` skin palette).
// prop(kind) → a Mesh: bowl, ladle, kettle, lantern (glow), tray (tea), plank, pot (congee), stool, table.
import * as THREE from 'three';
import { boxesGeometry, shade } from '../../core/voxel.js';
import { KIDS } from '../../chars/officers/kc/skins.js';

const bx = (s, p, c, r) => ({ s, p, c, r });
const mat = () => new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.8, metalness: 0.03 });
const SKINS = [0xd8a67e, 0xe0b28a, 0xc8966e, 0xe8bc94];
const TOPS = { resident: [0x5a6a78, 0x6a5a48, 0xe8e4d8, 0x3a5a4a, 0x7a4a3a], uncle: [0xf0ede4], auntie: [0xc86a7a, 0x6a8ac8, 0xd8a84a], worker: [0xe8e4d8, 0xd8d0b8] };

export function figure(kind, k = 0) {
  const g = new THREE.Group(), s = kind === 'kid' ? 0.7 : 1, S = kind === 'kid' ? KIDS.palette.skin : SKINS[k % SKINS.length];
  const top = kind === 'kid' ? [0xe8c848, 0xe06a4a, 0x4aa0d8, 0x6ac06a, 0xe8e4d8][k % 5] : TOPS[kind][k % TOPS[kind].length];
  const legs = kind === 'kid' ? KIDS.palette.pants : [0x2e2e34, 0x3a3630, 0x2a3440][k % 3];
  const hair = kind === 'uncle' ? null : kind === 'auntie' ? 0x1a1414 : 0x141210;
  const B = (w, h, d, x, y, z, c) => bx([w * s, h * s, d * s], [x * s, y * s, z * s], c);
  const body = [
    B(0.14, 0.82, 0.15, -0.1, 0.41, 0, kind === 'kid' ? S : legs), B(0.14, 0.82, 0.15, 0.1, 0.41, 0, kind === 'kid' ? S : legs),
    ...(kind === 'kid' ? [B(0.34, 0.22, 0.2, 0, 0.52, 0, legs)] : []),
    B(0.14, 0.08, 0.22, -0.1, 0.04, 0.03, 0x1a1614), B(0.14, 0.08, 0.22, 0.1, 0.04, 0.03, 0x1a1614),
    B(0.42, 0.56, 0.25, 0, 1.1, 0, top),
    B(0.1, 0.55, 0.1, 0.27, 1.06, 0, kind === 'uncle' || kind === 'worker' ? S : top),               // left arm (static)
    B(0.26, 0.28, 0.26, 0, 1.56, 0, S),
    B(0.045, 0.045, 0.02, -0.055, 1.58, 0.13, 0x151515), B(0.045, 0.045, 0.02, 0.055, 1.58, 0.13, 0x151515),
  ];
  if (hair != null) body.push(B(0.28, 0.1, 0.28, 0, 1.72, -0.01, hair), B(0.28, 0.2, 0.06, 0, 1.62, -0.12, hair));
  if (kind === 'uncle') body.push(B(0.27, 0.05, 0.27, 0, 1.7, 0, shade(S, 1.1)), B(0.16, 0.05, 0.02, 0, 1.46, 0.135, 0xd8d8d0));   // bald, a white moustache
  if (kind === 'auntie') body.push(B(0.32, 0.14, 0.32, 0, 1.74, -0.01, hair));
  if (kind === 'worker') body.push(B(0.38, 0.5, 0.04, 0, 0.98, 0.14, 0x5a6a7a));
  if (kind === 'resident' && k % 3 === 0) body.push(B(0.29, 0.05, 0.29, 0, 1.66, 0, 0xeeeae0));      // towel headband
  const m = new THREE.Mesh(boxesGeometry(body), mat()); m.castShadow = true; g.add(m);
  const arm = new THREE.Group(); arm.position.set(-0.27 * s, 1.34 * s, 0); g.add(arm);   // right shoulder pivot
  const am = new THREE.Mesh(boxesGeometry([B(0.1, 0.55, 0.1, 0, -0.28, 0, kind === 'uncle' || kind === 'worker' ? S : top), B(0.09, 0.1, 0.09, 0, -0.58, 0, S)]), mat());
  arm.add(am); g.userData.arm = arm;
  return g;
}

const P = {
  bowl: [bx([0.16, 0.06, 0.16], [0, 0, 0], 0xf0ece0), bx([0.13, 0.02, 0.13], [0, 0.03, 0], 0xe8c888), bx([0.2, 0.012, 0.012], [0.03, 0.06, 0], 0x8a6a3a, [0, 0, 0.4])],
  ladle: [bx([0.03, 0.03, 0.5], [0, 0, 0.2], 0x8a6a3a), bx([0.12, 0.06, 0.12], [0, -0.03, 0.46], 0xb8bcc0)],
  kettle: [bx([0.22, 0.2, 0.22], [0, 0, 0], 0xb8bcc0), bx([0.04, 0.04, 0.14], [0, 0.04, 0.16], 0xb8bcc0), bx([0.14, 0.03, 0.03], [0, 0.14, 0], 0x2a2a2a)],
  tray: [bx([0.4, 0.03, 0.3], [0, 0, 0], 0x8a5a2a), bx([0.08, 0.08, 0.08], [-0.1, 0.05, 0], 0xf0ece0), bx([0.08, 0.08, 0.08], [0.1, 0.05, 0], 0xf0ece0)],
  plank: [bx([0.2, 0.05, 2.2], [0, 0, 0.4], 0x8a6a42)],
  pot: [bx([0.7, 0.5, 0.7], [0, 0.25, 0], 0x6a6e72), bx([0.74, 0.06, 0.74], [0, 0.5, 0], 0x4a4e52), bx([0.6, 0.04, 0.6], [0, 0.46, 0], 0xf0e8d0)],
  stool: [bx([0.34, 0.45, 0.34], [0, 0.22, 0], 0xc83a2a)],
  table: [bx([1.0, 0.05, 0.8], [0, 0.72, 0], 0xb8a878), bx([0.05, 0.7, 0.05], [-0.4, 0.36, -0.3], 0x3a3c40), bx([0.05, 0.7, 0.05], [0.4, 0.36, 0.3], 0x3a3c40)],
  frame: [bx([2.6, 0.08, 0.08], [0, 2.4, -0.6], 0x3a3c40), bx([0.08, 2.4, 0.08], [-1.3, 1.2, -0.6], 0x3a3c40), bx([0.08, 2.4, 0.08], [1.3, 1.2, -0.6], 0x3a3c40)],
  awning: [...[0, 1, 2, 3, 4, 5].map((k) => bx([0.44, 0.05, 1.8], [-1.1 + k * 0.44, 2.3, 0.1], k & 1 ? 0x3a7a5a : 0xe8e4d8, [0.16, 0, 0]))],
  counter: [bx([2.4, 0.95, 1.1], [0, 0.48, 0], 0x4a6a5a), bx([2.5, 0.08, 1.2], [0, 0.98, 0], 0x9a9ea2), bx([0.6, 0.12, 0.6], [-0.6, 1.1, 0], 0x1a1a1c)],
};
export function prop(kind) {
  if (kind === 'lantern') {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(boxesGeometry([bx([0.02, 0.4, 0.02], [0, 0.3, 0], 0x1a1a1a), bx([0.2, 0.04, 0.2], [0, 0.1, 0], 0x2a1a12), bx([0.2, 0.04, 0.2], [0, -0.22, 0], 0x2a1a12)]), mat()));
    g.add(new THREE.Mesh(boxesGeometry([bx([0.3, 0.28, 0.3], [0, -0.06, 0], 0xd8402a)]), new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(3, 1.2, 0.6), toneMapped: false })));
    return g;
  }
  const m = new THREE.Mesh(boxesGeometry(P[kind]), mat()); m.castShadow = true;
  return m;
}
