// 巷戰 The Alleys' world builder (render-only; registered in the world registry, src/world/world.js). 1975, night: the
// wet market at the city gate under stall bulbs (阿鐵's 大牌檔 by the entrance), tenement blocks grown into one mass on
// every side — window cages, laundry, neon (abstract tubes), rooftop tanks and aerials — the 6 m lane between them under
// pipe bundles that drip, the gang's iron gate (gate 'ironGate': it buckles and falls when broken), the square beyond, the
// 衙門 gateway doors (gate 'yamenDoor') and the courtyard with the old hall, mahjong tables and unlit lanterns.
// Story fx (kc1.js script + src/chars/officers/kc/bosses.js): fx.gateHp (dents / sparks as the gate's HP falls),
// fx.steam (burst pipes over the lane), fx.jet (the first low jet: its body and shadow cross, lights flicker, the alley
// shakes), fx.lanterns (0 → 1: the 衙門 lanterns relit), boss fx (bossfx.js). Never writes sim state.
import * as THREE from 'three';
import { GATES, ground, walkIn, TERRAIN as G, PIECE_IDS, node, smooth } from '../../map.js';
import { buildGround } from '../kckit/terrain.js';
import { place, merge, propMaterial, bx, block, neon, stall, daiPaiDong, pipes, ironGate, yamenHall, lantern, mahjong, crate, jet } from '../kckit/props.js';
import { createBossFx } from '../../../chars/officers/kc/bossfx.js';
import { lensClear } from '../../../camera/occlusion.js';
import { hash01 } from '../../../core/rng.js';
import { shade } from '../../../core/voxel.js';

const SHADOW_BOX = 30, MOON = new THREE.Vector3(0.35, 0.85, 0.4).normalize();
const NIGHT = new THREE.Color(0x10141e), FOG = new THREE.Color(0x1e2230);
const NEON = [0xff3a5a, 0x3affd8, 0xffd23a, 0xff6ad8, 0x6aa8ff, 0x7aff5a];

function nightSky() {
  const geo = new THREE.SphereGeometry(900, 32, 16), col = [], p = geo.attributes.position, c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const h = Math.max(0, p.getY(i) / 900); c.setRGB(0.14 + 0.16 * (1 - h) ** 3, 0.08 + 0.07 * (1 - h) ** 3, 0.16 + 0.06 * (1 - h)); col.push(c.r, c.g, c.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -1; sky.frustumCulled = false;
  return sky;                                                         // city glow low on the cloud base: neon pink-orange
}

/** Blocks along one side of a straight run a → b (x, z), `side` ±1 (left / right of the direction), clear of the walk edge
 *  by `gap` m; returns their boxes. */
function wall(out, lit, a, b, side, gap, seed, { hMin = 16, hMax = 34, deep = 9 } = {}) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, nx = uz * side, nz = -ux * side;
  const yaw = Math.atan2(-nx, -nz);                                   // the block's front (+Z) faces back toward the path
  for (let s = 0, k = 0; s < L; k++) {
    const w = 5 + hash01(seed, k) * 5, d = deep + hash01(seed, k, 2) * 4, h = hMin + hash01(seed, k, 3) * (hMax - hMin);
    const cx = a[0] + ux * (s + w / 2) + nx * (gap + d / 2), cz = a[1] + uz * (s + w / 2) + nz * (gap + d / 2);
    // a block whose footprint reaches within 1 m of the walk field (a jog's inside corner) is left out
    let clear = true;
    for (const fu of [-0.5, 0, 0.5]) for (const fv of [-0.5, 0, 0.5]) if (walkIn(cx + ux * fu * w + nx * fv * d, cz + uz * fu * w + nz * fv * d) > -1) clear = false;
    if (!clear) { s += w; continue; }
    const bl = block(w + 0.4, d, h, seed * 31 + k, { faces: [0, 2, 3] });
    out.push(...place(bl.body, cx, ground(cx, cz) - 0.2, cz, yaw)); lit.push(...place(bl.lit, cx, ground(cx, cz) - 0.2, cz, yaw));
    s += w;
  }
}

export function buildAlleys(scene, root) {
  scene.background = NIGHT.clone();
  scene.fog = new THREE.Fog(FOG.clone(), 24, 150);
  root.add(nightSky());
  const hemi = new THREE.HemisphereLight(0x7a6a98, 0x2a2420, 1.15); root.add(hemi);
  const moon = new THREE.DirectionalLight(0xb0bce8, 1.2);
  moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, { left: -SHADOW_BOX, right: SHADOW_BOX, top: SHADOW_BOX, bottom: -SHADOW_BOX, near: 1, far: 160 });
  moon.shadow.bias = -0.0006; moon.shadow.normalBias = 0.03;
  root.add(moon, moon.target);

  // ---- ground: wet market tiles, wet concrete in the lane with puddles, courtyard flagstones
  const WET = 0x33343a, WET2 = 0x3e4048, TILE_A = 0x4a5450, TILE_B = 0x3e4844, FLAG = 0x6a645a, PUD = 0x2a3440;
  buildGround(root, {
    colorAt(x, z, y, inside, out) {
      if (inside < -0.6) return out > 4 ? 0x24242a : 0x2e2e34;
      const id = PIECE_IDS[G.own[node(x, z)]], h = hash01(Math.round(x), Math.round(z), 3);
      if (id === 'market') return (Math.round(x) + Math.round(z)) & 1 ? TILE_A : TILE_B;
      if (id === 'yamen') return (Math.round(x * 0.5) + Math.round(z * 0.5)) & 1 ? FLAG : shade(FLAG, 0.9);
      return h < 0.18 ? PUD : h < 0.45 ? WET2 : WET;
    },
    rise: (x, z, out) => Math.min(1.5, out * 0.3),
  });

  const boxes = [], lit = [], glows = [], lampAt = [], dripAt = [];
  // ---- tenement walls: the market square, the lane's jogs, the square, the courtyard (a closed city block all round)
  const LANE = [[0, -98], [0, -88], [-5, -78], [-5, -66], [2, -56], [0, -46]];
  // (side +1 = the walker's left: +X when heading +Z; every wall below stands outside the walk field)
  wall(boxes, lit, [-16, -154], [-16, -97], -1, 1.2, 3); wall(boxes, lit, [16, -97], [16, -154], -1, 1.2, 5);
  wall(boxes, lit, [-18, -153.5], [18, -153.5], 1, 0.4, 7, { hMin: 10, hMax: 16 });                  // behind the start: the city gate side
  for (let k = 0; k < LANE.length - 1; k++) {
    const a = LANE[k], b = LANE[k + 1];
    wall(boxes, lit, a, b, 1, 4.6, 11 + k, { hMin: 20, hMax: 38 }); wall(boxes, lit, a, b, -1, 4.6, 21 + k, { hMin: 20, hMax: 38 });
  }
  wall(boxes, lit, [-18, -95.5], [-4.8, -95.5], -1, 0.3, 31, { hMin: 18, hMax: 30 }); wall(boxes, lit, [4.8, -95.5], [18, -95.5], -1, 0.3, 32, { hMin: 18, hMax: 30 });
  wall(boxes, lit, [-12, -45], [-12, -18], -1, 1.2, 41); wall(boxes, lit, [12, -18], [12, -45], -1, 1.2, 42);
  wall(boxes, lit, [-22, -16.8], [-4.8, -16.8], -1, 0.2, 43, { hMin: 12, hMax: 20, deep: 5.2 }); wall(boxes, lit, [4.8, -16.8], [22, -16.8], -1, 0.2, 44, { hMin: 12, hMax: 20, deep: 5.2 });
  wall(boxes, lit, [-21, -10], [-21, 32], -1, 1.2, 51); wall(boxes, lit, [21, 32], [21, -10], -1, 1.2, 52);
  wall(boxes, lit, [-22, 40], [22, 40], -1, 0.5, 55, { hMin: 26, hMax: 42 });                        // behind the hall: the tallest blocks
  // 1 m side alleys: dark slots cut into the lane's walls (dressing only)
  for (const [x, z, yaw] of [[-3.5, -93, Math.PI / 2], [3.4, -84, -Math.PI / 2], [-8.4, -72, Math.PI / 2], [5.6, -60, -Math.PI / 2]])
    boxes.push(...place([bx([1.1, 9, 3], [0, 4.5, -1.2], 0x0c0c10), bx([1.4, 0.2, 3.2], [0, 9, -1.2], 0x2a2a2e)], x, 0, z, yaw));

  // ---- the market: stalls in two rows facing the aisle, 阿鐵's 大牌檔 by the entrance, crates, bulbs
  for (let z = -146; z < -100; z += 5.2) for (const sx of [-1, 1]) {
    const k = Math.round(z) * 3 + sx, st = stall(3.4, k), x = sx * 11.5, yaw = sx > 0 ? -Math.PI / 2 : Math.PI / 2;
    boxes.push(...place(st.body, x, 0, z, yaw)); glows.push(...place(st.glow, x, 0, z, yaw)); lampAt.push([x - sx * 0.2, 2.0, z]);
  }
  boxes.push(...place(daiPaiDong(1), -6, 0, -140, 0.3));
  for (let k = 0; k < 16; k++) { const x = (hash01(k, 61) - 0.5) * 20, z = -150 + hash01(k, 62) * 48; if (Math.abs(x) < 3) continue; boxes.push(...place(crate(k & 1 ? 0x8a6a3a : 0x5a7a8a), x, 0, z, hash01(k, 63) * 3)); }
  // neon: signs on the walls facing the market and hanging over the lane
  const neonAt = [];
  for (let k = 0; k < 14; k++) {
    const sx = k & 1 ? 1 : -1, z = -150 + k * 3.8, y = 5 + hash01(k, 71) * 7, c = NEON[k % NEON.length], vert = hash01(k, 72) < 0.5, n = neon(vert ? 1.2 : 3.2, vert ? 3.4 : 1.2, c, k);
    const x = sx * 15.3, yaw = sx > 0 ? -Math.PI / 2 : Math.PI / 2;
    boxes.push(...place(n.body.map((q) => ({ ...q, p: [q.p[0], q.p[1] + y, q.p[2]] })), x, 0, z, yaw)); glows.push(...place(n.glow.map((q) => ({ ...q, p: [q.p[0], q.p[1] + y, q.p[2]] })), x, 0, z, yaw));
    neonAt.push([x - sx, y, z, c]);
  }
  for (let k = 0; k < LANE.length - 1; k++) {
    const [ax, az] = LANE[k], [bx_, bz] = LANE[k + 1], mx = (ax + bx_) / 2, mz = (az + bz) / 2, yaw = Math.atan2(bx_ - ax, bz - az), L = Math.hypot(bx_ - ax, bz - az);
    const p = pipes(L + 1, 5.6 + (k & 1) * 0.6, k); boxes.push(...place(p.boxes, mx, ground(mx, mz), mz, yaw));   // above the camera's boom
    for (const [px, pz] of p.drips) { const c = Math.cos(yaw), s = Math.sin(yaw); dripAt.push([mx + px * c + pz * s, 5.5, mz - px * s + pz * c]); }
    for (const side of [-1, 1]) {                                     // a vertical neon hung off the wall every jog
      const c = NEON[(k * 2 + (side > 0 ? 1 : 0)) % NEON.length], n = neon(0.9, 2.8, c, 40 + k * 2 + side), nx = Math.cos(yaw) * side * 3.6, nz = -Math.sin(yaw) * side * 3.6;
      const y = 5.5 + (k & 1) * 1.5;
      boxes.push(...place(n.body.map((q) => ({ ...q, p: [q.p[0], q.p[1] + y, q.p[2]] })), mx + nx, 0, mz + nz, yaw + side * Math.PI / 2));
      glows.push(...place(n.glow.map((q) => ({ ...q, p: [q.p[0], q.p[1] + y, q.p[2]] })), mx + nx, 0, mz + nz, yaw + side * Math.PI / 2));
      neonAt.push([mx + nx * 0.7, y, mz + nz * 0.7, c]);
    }
    const wx = mx + Math.cos(yaw) * 2.9, wz = mz - Math.sin(yaw) * 2.9;       // a bulb on a bracket off the wall, 4.4 m up
    lampAt.push([wx, 4.4, wz]); glows.push(bx([0.22, 0.22, 0.22], [wx, ground(wx, wz) + 4.4, wz], 0xffd890), bx([0.05, 0.05, 1.6], [wx, ground(wx, wz) + 4.6, wz], 0x2a2a2e));
  }
  // the square: crates, a burnt-out oil drum; the courtyard: the hall, mahjong tables, stone lantern posts, lantern wires
  for (const [x, z] of [[-8, -40], [7, -36], [-6, -24], [8, -22]]) boxes.push(...place(crate(0x6a5a3a), x, 0.2, z, x * 0.3));
  boxes.push(...place(yamenHall(18, 8), 0, ground(0, 36), 36, Math.PI));
  for (const [x, z] of [[-9, 4], [9, 4], [-9, 18], [9, 18], [0, 10], [-14, 12], [14, 12]]) boxes.push(...place(mahjong(), x, ground(x, z), z, x * 0.1));
  for (const sx of [-1, 1]) boxes.push(bx([1.8, 1.6, 1.8], [sx * 5, 1.2, 15], 0x8a8478), bx([1.2, 0.8, 1.2], [sx * 5, 2.4, 15], 0x6a645a), bx([2.2, 0.3, 2.2], [sx * 5, 2.95, 15], 0x5a544a));
  const lanternAt = [];
  for (let k = 0; k < 12; k++) { const x = -15 + k * 2.7, z = 24 + Math.sin(k * 0.9) * 0.6, L = lantern(); boxes.push(...place(L.body, x, ground(x, z) + 4.2, z)); lanternAt.push([x, ground(x, z) + 4.35, z]); }
  boxes.push(bx([32, 0.03, 0.03], [0, 4.8, 24], 0x1a1a1a));
  const propMat = lensClear(propMaterial(), 2.6);                     // walls within 2.6 m of the lens are cut away (the camera may sit 3 m past the walk edge)
  const props = new THREE.Mesh(merge(boxes), propMat); props.castShadow = props.receiveShadow = true; root.add(props);
  const litMat = new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(1.0, 0.92, 0.8) });
  const litMesh = new THREE.Mesh(merge(lit), litMat); root.add(litMesh);
  const glowMat = new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(2.6, 2.6, 2.6), toneMapped: false });
  const glowMesh = new THREE.Mesh(merge(glows), glowMat); root.add(glowMesh);
  // the lanterns: one mesh, dark until relit (fx.lanterns)
  const lanMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.25, 0.05, 0.03), toneMapped: false });
  const lanMesh = new THREE.Mesh(merge(lanternAt.flatMap(([x, y, z]) => place(lantern().glow, x, y - 0.15, z))), lanMat); root.add(lanMesh);

  // ---- the iron gate (bars across the lane mouth) and the 衙門 gateway doors
  const gateMesh = new THREE.Mesh(merge(ironGate(12.4, 3.6)), propMat); gateMesh.position.set(0, ground(0, -46.5), -46.5); gateMesh.castShadow = true; root.add(gateMesh);
  const leafGeo = merge([bx([2.2, 3.6, 0.16], [1.1, 1.8, 0], 0x5a2a1a), ...[0.6, 1.8, 3.0].map((y) => bx([2.2, 0.12, 0.2], [1.1, y, 0], 0x3a1a10))]);
  const leaves = [-1, 1].map((sx) => { const m = new THREE.Mesh(leafGeo, propMat); m.position.set(sx * 3.3, ground(0, -13), -13); m.scale.x = -sx; m.castShadow = true; root.add(m); return m; });
  boxes.length = 0;
  const posts = merge([...place([bx([1.2, 5, 1.2], [0, 2.5, 0], 0x6a645a), bx([1.6, 0.6, 1.6], [0, 5.3, 0], TILE_SHADE)], -4, ground(-4, -13), -13), ...place([bx([1.2, 5, 1.2], [0, 2.5, 0], 0x6a645a), bx([1.6, 0.6, 1.6], [0, 5.3, 0], TILE_SHADE)], 4, ground(4, -13), -13),
    bx([9.6, 0.8, 1.4], [0, ground(0, -13) + 5.4, -13], 0x5a3a2a)]);
  root.add(new THREE.Mesh(posts, propMat));

  // ---- lights: the nearest bulbs, neon washes near the focus, a key on the stage
  const bulbs = lampAt;
  const lights = [0, 1, 2, 3].map(() => { const l = new THREE.PointLight(0xffc880, 0, 18, 1.6); root.add(l); return l; });
  const neonL = [0, 1].map(() => { const l = new THREE.PointLight(0xff3a5a, 0, 14, 1.8); root.add(l); return l; });
  const stageKey = new THREE.PointLight(0xffc080, 22, 14, 2); stageKey.position.set(-5, 3, -136); stageKey.name = 'stage-key'; root.add(stageKey);
  const hallLight = new THREE.PointLight(0xffb070, 0, 30, 1.4); hallLight.position.set(0, 5, 22); root.add(hallLight);

  // ---- drips under the pipes (a fixed hash scatter, falling and wrapping), steam puffs where the pipes burst
  const DN = dripAt.length * 3, dp = new Float32Array(DN * 6);
  const dgeo = new THREE.BufferGeometry(); dgeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const drips = new THREE.LineSegments(dgeo, new THREE.LineBasicMaterial({ color: 0x9ab0c8, transparent: true, opacity: 0.55, depthWrite: false }));
  drips.frustumCulled = false; root.add(drips);
  const puffTex = new THREE.CanvasTexture((() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return cv; })());
  const puffs = [...Array(24)].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, color: 0xd8dce0, transparent: true, opacity: 0, depthWrite: false })); s.visible = false; root.add(s); return s; });
  // ---- the jet (fx.jet: its pass crosses the sky low over the lane; a soft shadow sweeps the ground)
  const jetMesh = new THREE.Mesh(merge(jet()), propMaterial({ roughness: 0.5 })); jetMesh.visible = false; root.add(jetMesh);
  const jetLights = new THREE.Mesh(merge([bx([0.6, 0.6, 0.6], [-26, -0.8, 2], 0xff2a2a), bx([0.6, 0.6, 0.6], [26, -0.8, 2], 0x2aff5a), bx([0.8, 0.8, 0.8], [0, -2.4, 10], 0xffffff)]),
    new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, color: new THREE.Color(3, 3, 3) })); jetMesh.add(jetLights);
  const jetShadow = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false }));
  jetShadow.rotation.x = -Math.PI / 2; jetShadow.scale.set(26, 14, 1); root.add(jetShadow);
  const bossFx = createBossFx(root);

  const tmp = new THREE.Vector3();
  let t = 0, gateOpen = 0, doorOpen = 0, lanK = 0;
  return {
    fires: [],
    update(dt, focus, game) {
      t += dt;
      const fx = (game && game.story && game.story.fx) || {}, T = fx.now ?? 0;   // story clock (the chapter script publishes it)
      const step = 2 * SHADOW_BOX / 2048;
      tmp.set(Math.round(focus.x / step) * step, ground(focus.x, focus.z), Math.round(focus.z / step) * step);
      moon.target.position.copy(tmp); moon.position.copy(MOON).multiplyScalar(70).add(tmp);
      // the jet's pass: 7 s across; lights flicker, the props shake while it's overhead
      const jt = fx.jet ? (T - fx.jet.t) / 60 : -1, jOn = jt >= 0 && jt < 7;
      jetMesh.visible = jOn;
      let flick = 1, shake = 0;
      if (jOn) {
        const u = jt / 7, ang = fx.jet.yaw ?? -0.6, cx = fx.jet.x, cz = fx.jet.z, R = 260;
        const px = cx + Math.sin(ang) * R * (u - 0.5) * 2, pz = cz + Math.cos(ang) * R * (u - 0.5) * 2, py = ground(cx, cz) + 55 - 10 * u;
        jetMesh.position.set(px, py, pz); jetMesh.rotation.set(0.08, ang, 0);
        jetShadow.position.set(px + 8, ground(px, pz) + 0.08, pz + 4); jetShadow.rotation.z = -ang;
        const near = 1 - smooth(20, 140, Math.hypot(px - focus.x, pz - focus.z));
        jetShadow.material.opacity = 0.45 * near;
        shake = near; flick = 1 - near * (0.5 + 0.5 * Math.sin(t * 43) * Math.sin(t * 17));
      } else jetShadow.material.opacity = 0;
      props.position.set(Math.sin(t * 71) * 0.04 * shake, Math.sin(t * 53) * 0.03 * shake, 0);
      litMat.color.setScalar(Math.max(0.25, flick)); glowMat.color.setScalar(2.6 * Math.max(0.2, flick) * (fx.dark ? 0.2 : 1));
      // bulbs and neon washes nearest the focus
      const near = bulbs.slice().sort((a, b) => (a[0] - focus.x) ** 2 + (a[2] - focus.z) ** 2 - (b[0] - focus.x) ** 2 - (b[2] - focus.z) ** 2);
      lights.forEach((l, n) => { const p = near[n]; l.position.set(p[0], ground(p[0], p[2]) + p[1], p[2]); l.intensity = 46 * flick * (1 - smooth(20, 34, Math.hypot(p[0] - focus.x, p[2] - focus.z))); });
      const nn = neonAt.slice().sort((a, b) => (a[0] - focus.x) ** 2 + (a[2] - focus.z) ** 2 - (b[0] - focus.x) ** 2 - (b[2] - focus.z) ** 2);
      neonL.forEach((l, n) => { const p = nn[n]; l.position.set(p[0], ground(p[0], p[2]) + p[1], p[2]); l.color.setHex(p[3]); l.intensity = 30 * flick * (0.85 + 0.15 * Math.sin(t * 9 + n * 3)); });
      stageKey.intensity = 20 + Math.sin(t * 13.1) * 2;
      // gates: the iron gate buckles as its HP falls, falls flat when open; the gateway doors swing in
      const hp = fx.gateHp ?? 1;
      gateOpen += ((GATES.ironGate && GATES.ironGate.open ? 1 : 0) - gateOpen) * Math.min(1, dt * 2.5);
      gateMesh.rotation.x = gateOpen * 1.45 + (1 - hp) * 0.08 * (gateOpen < 0.01 ? Math.sin(t * 30) * (hp < 1 && hp > 0 ? 1 : 0) : 0);
      gateMesh.position.z = -46.5 + gateOpen * 1.6; gateMesh.scale.y = 1 - (1 - hp) * 0.06;
      doorOpen += ((GATES.yamenDoor && GATES.yamenDoor.open ? 1 : 0) - doorOpen) * Math.min(1, dt * 1.2);
      leaves.forEach((m, k) => { m.rotation.y = (k ? 1 : -1) * doorOpen * 1.7; });
      // the lanterns relight one after another (fx.lanterns 0 → 1), the hall's warm light with them
      lanK += ((fx.lanterns ?? 0) - lanK) * Math.min(1, dt * 1.5);
      lanMat.color.setRGB(0.25 + 2.8 * lanK, 0.05 + 0.9 * lanK, 0.03 + 0.4 * lanK); hallLight.intensity = 60 * lanK;
      // drips: short streaks falling from the pipes
      const a = dgeo.attributes.position;
      for (let i = 0; i < DN; i++) {
        const d = dripAt[i % dripAt.length], ph = hash01(i, 7), y = 5.4 - (((t * 1.4 + ph) % 1) * 5.4), gx = d[0] + (hash01(i, 8) - 0.5) * 0.3, gz = d[2] + (hash01(i, 9) - 0.5) * 0.3, gy = ground(gx, gz);
        a.setXYZ(i * 2, gx, gy + y, gz); a.setXYZ(i * 2 + 1, gx, gy + y + 0.18, gz);
      }
      a.needsUpdate = true;
      // steam from the burst pipes (fx.steam: frame it started)
      const sOn = fx.steam != null && T - fx.steam < 60 * 50;
      puffs.forEach((s, k) => {
        if (!sOn) { s.visible = false; return; }
        const d = dripAt[(k * 5) % dripAt.length], u = ((t * 0.25 + k * 0.37) % 1);
        s.visible = true; s.position.set(d[0] + Math.sin(k * 3.1 + t * 0.4) * 0.6, ground(d[0], d[2]) + 5.2 - u * 2.4, d[2] + Math.cos(k * 2.3) * 0.5);
        s.scale.setScalar(1.2 + u * 2.4); s.material.opacity = 0.34 * Math.sin(u * Math.PI) * (1 - smooth(40, 50, (T - fx.steam) / 60));
      });
      bossFx.update(dt, fx, T);
    },
  };
}
const TILE_SHADE = 0x5a3024;
