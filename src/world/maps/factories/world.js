// 工場 The Factories' world builder (render-only; registered in the world registry, src/world/world.js). Inside the block:
// the fishball workshop (steam vats hissing, long benches of trays, sacks, hanging bulbs), the chained door at the stair
// foot (gate 'chainDoor'), the stairwell climbing six floors in three flights (step stripes on the ramp, rails, a light
// well), the dentists' corridor (doors both sides with plain boards, benches, tube lights), the steel door of the boiler
// room (gate 'boilerDoor'), the boiler with its fire glowing. Ceilings at 7.6 m (the Musou cameras rise to ≈ 4.5 m). Story fx (kc3.js script + bosses.js):
// fx.workers (chained / freed and walking out), fx.dark (power cut: the lights go, the boiler glow and two residents'
// torches stay), fx.flicker (the corridor's tubes), boss fx (bossfx.js). Never writes sim state.
import * as THREE from 'three';
import { GATES, ground, TERRAIN as G, PIECE_IDS, node, smooth, MAP } from '../../map.js';
import { buildGround } from '../kckit/terrain.js';
import { place, merge, propMaterial, bx, crate, IRON, RUST } from '../kckit/props.js';
import { createBossFx } from '../../../chars/officers/kc/bossfx.js';
import { lensClear } from '../../../camera/occlusion.js';
import { hash01 } from '../../../core/rng.js';
import { shade } from '../../../core/voxel.js';

const DARK = new THREE.Color(0x0e0c0c), FOG = new THREE.Color(0x1e1a18);
const WALL = 0x6e6a60, WALL2 = 0x5a5a52, CEIL = 0x3a3834, TILE_W = 0xc8ccc4;

/** A worker (render-only figure): singlet, apron, rolled trousers; `chained` adds the chain to the bench leg. */
function workerFigure(k) {
  const S = 0xd8a67e, top = [0xe8e4d8, 0xd8d0b8, 0xc8d0d8][k % 3];
  return [bx([0.13, 0.8, 0.14], [-0.1, 0.4, 0], 0x3a3a40), bx([0.13, 0.8, 0.14], [0.1, 0.4, 0], 0x3a3a40), bx([0.4, 0.55, 0.24], [0, 1.08, 0], top),
    bx([0.36, 0.5, 0.05], [0, 0.95, 0.13], 0x5a6a7a), bx([0.1, 0.55, 0.1], [-0.26, 1.05, 0], S), bx([0.1, 0.55, 0.1], [0.26, 1.05, 0], S),
    bx([0.24, 0.26, 0.24], [0, 1.52, 0], S), bx([0.25, 0.1, 0.25], [0, 1.66, -0.01], 0x1a1612)];
}

export function buildFactories(scene, root) {
  scene.background = DARK.clone();
  scene.fog = new THREE.Fog(FOG.clone(), 18, 80);
  const hemi = new THREE.HemisphereLight(0x8a7a68, 0x2a2420, 0.9); root.add(hemi);

  // ---- floors: wet concrete in the workshop (white tiles by the vats), step stripes on the flights, lino in the corridor
  buildGround(root, {
    colorAt(x, z, y, inside, out) {
      if (inside < -0.6) return WALL2;
      const id = PIECE_IDS[G.own[node(x, z)]], h = hash01(Math.round(x), Math.round(z), 3);
      if (id === 'workshop') return Math.abs(x) > 6 && Math.abs(x) < 12 ? ((Math.round(x) + Math.round(z)) & 1 ? TILE_W : shade(TILE_W, 0.9)) : h < 0.2 ? 0x44443e : 0x4e4e46;
      if (id.startsWith('flight')) return (Math.floor(z * 3) & 1) ? 0x7a766c : 0x5a564e;
      if (id.startsWith('landing')) return 0x6a665c;
      if (id === 'corridor') return (Math.round(z) & 1) ? 0x5a6a5a : 0x506050;
      return h < 0.15 ? 0x3a3630 : 0x4a4640;                          // the boiler room: coal-dusted concrete
    },
    rise: (x, z, out) => Math.min(6, out * 3),
  });

  const boxes = [], glows = [], tubes = [], lampAt = [];
  const wallRun = (x0, z0, x1, z1, y0, h, c = WALL) => boxes.push(bx([Math.max(0.3, Math.abs(x1 - x0)), h, Math.max(0.3, Math.abs(z1 - z0))], [(x0 + x1) / 2, y0 + h / 2, (z0 + z1) / 2], c));
  const ceil = (x0, z0, x1, z1, y) => boxes.push(bx([x1 - x0, 0.3, z1 - z0], [(x0 + x1) / 2, y + 7.6, (z0 + z1) / 2], CEIL));   // above the Musou cameras
  // workshop: walls, ceiling beams (open between: the camera sees up), vats, benches, sacks
  wallRun(-15, -153, -15, -106, 0, 8); wallRun(15, -153, 15, -106, 0, 8); wallRun(-15, -153.2, 15, -153.2, 0, 8);
  wallRun(-15, -105.6, -4.6, -105.6, 0, 8); wallRun(4.6, -105.6, 15, -105.6, 0, 8);
  for (let z = -150; z < -106; z += 4) boxes.push(bx([30, 0.4, 0.4], [0, 7.4, z], shade(CEIL, 1.2)));
  for (const [x, z] of [[-9, -139], [9, -139], [-9, -123], [9, -123]]) {
    for (let k = 0; k < 5; k++) boxes.push(bx([3.2 - (k === 0 || k === 4 ? 0.3 : 0), 0.5, 3.2 - (k === 0 || k === 4 ? 0.3 : 0)], [x, 0.25 + k * 0.5, z], k & 1 ? 0xb8bcc0 : 0xa8acb0));
    boxes.push(bx([0.3, 1.8, 0.3], [x, 3.4, z], 0x8a8e92), bx([2.4, 0.2, 0.2], [x, 4.2, z], 0x8a8e92));
  }
  for (const z of [-146, -132, -118]) for (const sx of [-1, 1]) {
    boxes.push(bx([1.2, 0.9, 6], [sx * 4, 0.45, z], 0x8a8a84), bx([1.3, 0.06, 6.1], [sx * 4, 0.93, z], 0xc8c8c0));
    for (let k = 0; k < 5; k++) boxes.push(bx([0.8, 0.08, 0.8], [sx * 4, 1.0, z - 2.4 + k * 1.2], 0xa8a8a0), bx([0.5, 0.1, 0.5], [sx * 4, 1.08, z - 2.4 + k * 1.2], 0xe8dcb8));   // trays of fishballs
    lampAt.push([sx * 4, 3.4, z]); glows.push(bx([0.25, 0.25, 0.25], [sx * 4, 3.4, z], 0xffd890), bx([0.02, 1.2, 0.02], [sx * 4, 4.1, z], 0x1a1a1a));
  }
  for (let k = 0; k < 10; k++) { const x = (hash01(k, 3) < 0.5 ? -1 : 1) * (12.5 + hash01(k, 4)), z = -150 + hash01(k, 5) * 42; boxes.push(bx([1.0, 0.7, 0.6], [x, 0.35, z], 0xc8b890), bx([0.9, 0.6, 0.55], [x, 0.95, z + 0.1], 0xb8a880)); }
  // the stairwell: side walls over all six floors, landing walls, rails, a light well opening above
  for (const sx of [-1, 1]) {
    wallRun(sx * 4.6, -106, sx * 4.6, -57, -1, 24, WALL2);
    for (const [a, b, h0, h1] of [[-107, -93, 0, 6], [-89, -75, 6, 12], [-71, -57, 12, 18]]) {
      const L = b - a, e = Math.atan2(h1 - h0, L);
      boxes.push(bx([0.08, 0.08, Math.hypot(L, h1 - h0)], [sx * 3.2, (h0 + h1) / 2 + 0.95, (a + b) / 2], 0x8a6a42, [-e, 0, 0]));
      for (let z = a + 1; z < b; z += 2.5) boxes.push(bx([0.06, 1.0, 0.06], [sx * 3.2, h0 + (h1 - h0) * (z - a) / L + 0.5, z], IRON));
    }
  }
  for (const [z, h] of [[-91, 6], [-73, 12]]) { boxes.push(bx([9.2, 0.4, 0.6], [0, h - 0.2, z + 3.3], 0x6a665c)); lampAt.push([2.6, h + 3, z]); glows.push(bx([0.2, 0.2, 0.2], [3.9, h + 3, z], 0xffc070)); }
  // the corridor: walls with doors (plain boards, no text), benches, the tube lights; its ceiling
  for (const sx of [-1, 1]) {
    wallRun(sx * 4.6, -58, sx * 4.6, -24, 18, 8);
    for (let z = -55; z < -26; z += 6) {
      boxes.push(bx([0.2, 2.4, 1.4], [sx * 4.4, 19.2, z], 0x6a4a2c), bx([0.22, 0.5, 0.9], [sx * 4.38, 19.9, z], 0x2a3440), bx([0.1, 0.5, 1.4], [sx * 4.3, 21.2, z], 0xe8e4d8));
      boxes.push(bx([0.5, 0.45, 1.6], [sx * 3.6, 18.22, z + 3], 0x5a4a3a));
    }
  }
  ceil(-4.6, -58, 4.6, -24, 18);
  for (let z = -54; z < -26; z += 5) tubes.push(bx([0.12, 0.08, 1.4], [0, 22.4, z], 0xe8f4ff));
  // the boiler room: walls, the boiler, pipes, a coal pile, gauges
  wallRun(-15, -24.4, -5.4, -24.4, 18, 8); wallRun(5.4, -24.4, 15, -24.4, 18, 8);
  wallRun(-15, -24, -15, 15, 18, 8); wallRun(15, -24, 15, 15, 18, 8); wallRun(-15, 15.2, 15, 15.2, 18, 8);
  ceil(-15, -24, 15, 15, 18);
  boxes.push(bx([9, 4.2, 5], [0, 20.1, 11], 0x3a3a3e), bx([10, 0.4, 5.6], [0, 22.3, 11], 0x2a2a2e), bx([1.6, 4, 1.6], [3.5, 24, 12.5], 0x2a2a2e));
  for (let k = 0; k < 4; k++) boxes.push(bx([0.4, 0.4, 36], [-13 + k * 0.6, 21.8 + (k & 1) * 0.5, -5], k & 1 ? RUST : 0x6a6e72));
  boxes.push(bx([3, 1.2, 3], [-10, 18.6, 8], 0x141414), bx([2, 0.8, 2], [-10, 19.6, 8], 0x1a1a1a));
  const fire = [bx([3.2, 1.4, 0.2], [0, 19.5, 8.45], 0xff7a2a)];
  for (const [x, z] of [[-8, -14], [8, -14], [-8, 0], [8, 0], [0, -60]]) { const y = z === -60 ? 21.5 : 21.8; lampAt.push([x, y, z]); glows.push(bx([0.25, 0.25, 0.25], [x, y, z], 0xffd890), bx([0.02, 0.8, 0.02], [x, y + 0.5, z], 0x1a1a1a)); }
  const propMat = lensClear(propMaterial({ roughness: 0.9 }), 2.4);
  const props = new THREE.Mesh(merge(boxes), propMat); props.castShadow = props.receiveShadow = true; root.add(props);
  const glowMat = new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(2.4, 2.4, 2.4), toneMapped: false });
  const glowMesh = new THREE.Mesh(merge(glows), glowMat); root.add(glowMesh);
  const tubeMat = new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(2.6, 2.6, 2.6), toneMapped: false });
  root.add(new THREE.Mesh(merge(tubes), tubeMat));
  const fireMat = new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(3, 2, 1.4), toneMapped: false });
  root.add(new THREE.Mesh(merge(fire), fireMat));

  // ---- gates: the chained door (two leaves + a chain across) and the boiler room's steel door
  const leaf = merge([bx([4.2, 3.6, 0.14], [2.1, 1.8, 0], 0x4a3a2a), bx([4.2, 0.14, 0.2], [2.1, 2.9, 0], 0x2a2018)]);
  const doors = [-1, 1].map((sx) => { const m = new THREE.Mesh(leaf, propMat); m.position.set(sx * 4.3, 0, -106.2); m.scale.x = -sx; root.add(m); return m; });
  const chain = new THREE.Mesh(merge([...[...Array(12)].map((_, k) => bx(k & 1 ? [0.06, 0.12, 0.04] : [0.12, 0.06, 0.04], [-1.6 + k * 0.28, 1.6 + Math.sin(k * 0.5) * 0.1, -106.0], 0x9a9ea2)),
    bx([0.3, 0.36, 0.16], [0, 1.4, -105.9], 0x8a8a92)]), propMat); root.add(chain);
  const steel = new THREE.Mesh(merge([bx([10, 4, 0.2], [0, 2, 0], 0x5a5e62), ...[...Array(8)].map((_, k) => bx([0.1, 4, 0.26], [-4.4 + k * 1.25, 2, 0], 0x3a3e42))]), propMat);
  steel.position.set(0, 18, -24.2); root.add(steel);

  // ---- workers (fx.workers): chained at their benches, freed ones walk out
  const workers = MAP.workers.map((_, k) => { const m = new THREE.Mesh(merge(workerFigure(k)), propMat); m.castShadow = true; root.add(m); return m; });
  const chains = MAP.workers.map(([x, z]) => { const m = new THREE.Mesh(merge([...[...Array(6)].map((_, k) => bx([0.08, 0.05, 0.04], [0.2 + k * 0.1, 0.2, 0], 0x9a9ea2))]), propMat); m.position.set(x, ground(x, z), z); root.add(m); return m; });

  // ---- lights: nearest bulbs, the corridor tubes' wash, the boiler glow, torchlight (power cut)
  const lights = [0, 1, 2, 3].map(() => { const l = new THREE.PointLight(0xffc080, 0, 16, 1.6); root.add(l); return l; });
  const tubeL = [0, 1].map(() => { const l = new THREE.PointLight(0xd8f0ff, 0, 14, 1.6); root.add(l); return l; });
  const boilerL = new THREE.PointLight(0xff8a3a, 90, 34, 1.4); boilerL.position.set(0, 20, 6); root.add(boilerL);
  const torches = [0, 1].map(() => { const l = new THREE.PointLight(0xffa050, 0, 12, 1.5); root.add(l); return l; });
  const stageKey = new THREE.PointLight(0xffc080, 22, 14, 2); stageKey.position.set(-4, 3, -142); stageKey.name = 'stage-key'; root.add(stageKey);
  // steam from the vats
  const puffTex = new THREE.CanvasTexture((() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return cv; })());
  const puffs = [...Array(20)].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, color: 0xe0e4e8, transparent: true, opacity: 0, depthWrite: false })); root.add(s); return s; });
  const VATS = [[-9, -139], [9, -139], [-9, -123], [9, -123]];
  const bossFx = createBossFx(root);

  let t = 0, doorOpen = 0, steelOpen = 0;
  return {
    fires: [],
    update(dt, focus, game) {
      t += dt;
      const fx = (game && game.story && game.story.fx) || {}, T = fx.now ?? 0, dark = !!fx.dark;
      // bulbs nearest the focus (off in the power cut), the corridor tubes flickering
      const near = lampAt.slice().sort((a, b) => (a[0] - focus.x) ** 2 + (a[2] - focus.z) ** 2 - (b[0] - focus.x) ** 2 - (b[2] - focus.z) ** 2);
      lights.forEach((l, n) => { const p = near[n]; l.position.set(p[0], p[1], p[2]); l.intensity = dark ? 0 : 40 * (1 - smooth(18, 30, Math.hypot(p[0] - focus.x, p[2] - focus.z))); });
      const fl = (fx.flicker ? (Math.sin(t * 31) * Math.sin(t * 7.3) > 0.2 ? 0.15 : 1) : 1) * (dark ? 0 : 1);
      tubeMat.color.setScalar(2.6 * Math.max(0.05, fl)); glowMat.color.setScalar(dark ? 0.1 : 2.4);
      tubeL.forEach((l, n) => { l.position.set(0, 21.8, Math.max(-54, Math.min(-28, focus.z + (n ? 4 : -4)))); l.intensity = 30 * fl * (focus.z > -60 && focus.z < -22 ? 1 : 0); });
      hemi.intensity = dark ? 0.25 : 0.9;
      stageKey.intensity = dark ? 0 : 20 + Math.sin(t * 11) * 1.5;
      fireMat.color.setRGB(3 + Math.sin(t * 13) * 0.3, 2 + Math.sin(t * 17) * 0.2, 1.4);
      boilerL.intensity = 90 + Math.sin(t * 9) * 12;
      torches.forEach((l, n) => { const a = t * 0.7 + n * 3.1; l.position.set(focus.x + Math.sin(a) * 3, ground(focus.x, focus.z) + 2.1, focus.z - 2 + Math.cos(a) * 1.5); l.intensity = dark ? 26 + Math.sin(t * 23 + n) * 4 : 0; });
      // gates
      doorOpen += ((GATES.chainDoor && GATES.chainDoor.open ? 1 : 0) - doorOpen) * Math.min(1, dt * 1.4);
      doors.forEach((m, k) => { m.rotation.y = (k ? 1 : -1) * doorOpen * 1.6; }); chain.visible = doorOpen < 0.05;
      steelOpen += ((GATES.boilerDoor && GATES.boilerDoor.open ? 1 : 0) - steelOpen) * Math.min(1, dt * 1.2);
      steel.position.y = 18 + steelOpen * 4.2;
      // workers: chained (a shiver as the chain is worked), freed ones walk to the workshop door and out
      (fx.workers || MAP.workers.map(() => ({ free: false, x: 0, z: 0 }))).forEach((q, k) => {
        const m = workers[k], [x, z] = MAP.workers[k];
        m.visible = !q.out;
        if (!q.free) { m.position.set(x + (q.hp < 1 ? Math.sin(t * 40) * 0.02 : 0), ground(x, z), z); m.rotation.y = x > 0 ? -1.2 : 1.2; }
        else { m.position.set(q.x, ground(q.x, q.z) + Math.abs(Math.sin(t * 9 + k)) * 0.05, q.z); m.rotation.y = q.yaw; }
        chains[k].visible = !q.free;
      });
      // steam from the vats
      puffs.forEach((s, k) => {
        const [x, z] = VATS[k % 4], u = ((t * 0.3 + k * 0.23) % 1);
        s.position.set(x + Math.sin(k * 2.1 + t * 0.3) * 0.8, 2.8 + u * 2.2, z + Math.cos(k * 1.3) * 0.6); s.scale.setScalar(1 + u * 2.2);
        s.material.opacity = 0.26 * Math.sin(u * Math.PI) * (focus.z < -100 ? 1 : 0);
      });
      bossFx.update(dt, fx, T);
    },
  };
}
