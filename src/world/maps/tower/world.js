// 蛇王樓 The Serpent Tower's world builder (render-only; registered in the world registry, src/world/world.js). Night: the
// tower's lobby (columns, red lanterns, a grand stair to nowhere), the light well — tenement walls rising all round an
// open shaft, the four balcony runs with railings on the well side, a bridge across it, laundry lines strung over the
// drop, neighbours at the rails above (they drop pots and lower lines: fx.pots) — the gatehouse's steel door (gate
// 'gatehouse', dented as its HP falls, then thrown down), the grille at the crown stair (gate 'crownStairs'), and the
// crown: a roof garden on top of the city (potted trees, a pavilion, water tanks) ringed by big neon boards on poles, the
// city's lights below, 啟德 beyond. 蛇王's P3 brings rain and the neon flickers (fx.rain / fx.neon); boss fx (bossfx.js).
// Never writes sim state.
import * as THREE from 'three';
import { GATES, ground, walkIn, TERRAIN as G, PIECE_IDS, node, smooth, MAP } from '../../map.js';
import { buildGround } from '../kckit/terrain.js';
import { place, merge, propMaterial, bx, block, neon, waterTank, aerial, lantern, crate, IRON, WALLS } from '../kckit/props.js';
import { createBossFx } from '../../../chars/officers/kc/bossfx.js';
import { lensClear } from '../../../camera/occlusion.js';
import { hash01 } from '../../../core/rng.js';
import { shade } from '../../../core/voxel.js';

const NIGHT = new THREE.Color(0x0e1018), FOG = new THREE.Color(0x1a1a26), MOON = new THREE.Vector3(-0.4, 0.8, 0.45).normalize();
const NEON = [0xff3a5a, 0x3affd8, 0xffd23a, 0xff6ad8, 0x6aa8ff, 0x7aff5a];
const BALC = [[[9, -111], [9, -86], 0, 6], [[9, -86], [-9, -80], 6, 9], [[-9, -80], [-9, -58], 9, 14], [[-9, -58], [0, -52], 14, 16]];

function nightSky() {
  const geo = new THREE.SphereGeometry(900, 32, 16), col = [], p = geo.attributes.position, c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const h = Math.max(0, p.getY(i) / 900); c.setRGB(0.1 + 0.2 * (1 - h) ** 3, 0.07 + 0.08 * (1 - h) ** 3, 0.14 + 0.08 * (1 - h)); col.push(c.r, c.g, c.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -1; sky.frustumCulled = false;
  return sky;
}

export function buildTower(scene, root) {
  scene.background = NIGHT.clone();
  scene.fog = new THREE.Fog(FOG.clone(), 30, 200);
  root.add(nightSky());
  const hemi = new THREE.HemisphereLight(0x7a6a98, 0x2a2420, 1.1); root.add(hemi);
  const moon = new THREE.DirectionalLight(0xb0bce8, 1.1);
  moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 180 });
  moon.shadow.bias = -0.0006; moon.shadow.normalBias = 0.03;
  root.add(moon, moon.target);

  buildGround(root, {
    colorAt(x, z, y, inside, out) {
      if (inside < -0.6) return out > 3 ? 0x1c1c22 : 0x2a2a30;
      const id = PIECE_IDS[G.own[node(x, z)]];
      if (id === 'lobby') return (Math.round(x * 0.5) + Math.round(z * 0.5)) & 1 ? 0x6a5a4a : 0x5a4a3c;       // worn terrazzo
      if (id.startsWith('balc')) return (Math.round(z) & 1) ? 0x5a5a56 : 0x524e4a;
      if (id === 'gatehouse') return 0x4a4a4e;
      if (id === 'stair') return (Math.floor(z * 3) & 1) ? 0x6a665e : 0x54504a;
      return hash01(Math.round(x), Math.round(z), 5) < 0.3 ? 0x3a5a36 : 0x6a665a;                           // the garden: grass + paving
    },
    rise: (x, z, out) => (z < -54 && z > -110 && Math.abs(x) < 14 ? -Math.min(16, out * 5) : Math.min(8, out * 3)),   // the well drops; walls rise elsewhere
  });

  const boxes = [], lit = [], glows = [], lampAt = [], neonAt = [];
  const wallRun = (x0, z0, x1, z1, y0, h, c = 0x6a6660) => boxes.push(bx([Math.max(0.4, Math.abs(x1 - x0)), h, Math.max(0.4, Math.abs(z1 - z0))], [(x0 + x1) / 2, y0 + h / 2, (z0 + z1) / 2], c));
  // lobby: outer walls, columns, lanterns, the grand stair, crates of the gang's goods
  wallRun(-17, -151, -17, -110, 0, 8); wallRun(17, -151, 17, -110, 0, 8); wallRun(-17, -151.2, 17, -151.2, 0, 8, 0x5a564e);
  for (const x of [-10, -3.5, 3.5, 10]) for (const z of [-140, -124]) boxes.push(bx([1.2, 7, 1.2], [x, 3.5, z], 0x8a2a1e), bx([1.6, 0.4, 1.6], [x, 7.2, z], 0xb8903a));
  for (let k = 0; k < 8; k++) { const x = -12 + k * 3.4, z = -132; const L = lantern(); boxes.push(...place(L.body, x, 5.6, z)); glows.push(...place(L.glow, x, 5.6, z)); lampAt.push([x, 5.4, z]); }
  boxes.push(bx([30, 0.3, 40], [0, 8.2, -130], 0x2a2426));
  // the light well: walls round the shaft (tenement faces with lit windows), balcony railings on the well side, the bridge
  // (the south wall leaves the first balcony run's way in from the lobby open: x 6 … 12)
  for (const [x0, z0, x1, z1, yaw] of [[-14, -110, -14, -52, Math.PI / 2], [14, -52, 14, -110, -Math.PI / 2], [-14, -110.5, 6, -110.5, 0], [12, -110.5, 14, -110.5, 0], [-14, -51.5, -4, -51.5, Math.PI], [4, -51.5, 14, -51.5, Math.PI]]) {
    const L = Math.hypot(x1 - x0, z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const bl = block(L, 3, 34, Math.round(cx * 7 + cz), { faces: [0], litP: 0.45, cages: 0.4, laundry: 0.4 });
    const off = 1.5, nx = Math.sin(yaw + Math.PI), nz = Math.cos(yaw + Math.PI);
    boxes.push(...place(bl.body.filter((q) => q.p[1] < 34), cx + nx * off, -2, cz + nz * off, yaw)); lit.push(...place(bl.lit, cx + nx * off, -2, cz + nz * off, yaw));
  }
  for (const [[ax, az], [bx_, bz], h0, h1] of BALC) {
    const L = Math.hypot(bx_ - ax, bz - az), yaw = Math.atan2(bx_ - ax, bz - az), ux = (bx_ - ax) / L, uz = (bz - az) / L, cx = (ax + bx_) / 2, cz = (az + bz) / 2;
    for (const side of [-1, 1]) {
      const px = cx + uz * side * 2.55, pz = cz - ux * side * 2.55;
      if (walkIn(px, pz) > -0.1) continue;
      boxes.push(...place([bx([0.08, 0.08, L], [0, 1.0, 0], IRON, [-Math.atan2(h1 - h0, L), 0, 0])], px, (h0 + h1) / 2, pz, yaw));
      for (let s = -L / 2; s <= L / 2; s += 1.6) boxes.push(bx([0.06, 1.0, 0.06], [px + ux * s, h0 + (h1 - h0) * (s / L + 0.5) + 0.5, pz + uz * s], IRON));
    }
    boxes.push(...place([bx([4.8, 0.4, L], [0, -0.25, 0], 0x4a4640, [-Math.atan2(h1 - h0, L), 0, 0])], cx, (h0 + h1) / 2, cz, yaw));   // the balcony slab's edge
    const lx = cx + uz * 2.3, lz = cz - ux * 2.3; lampAt.push([lx, (h0 + h1) / 2 + 3, lz]); glows.push(bx([0.22, 0.22, 0.22], [lx, (h0 + h1) / 2 + 3, lz], 0xffd890));
  }
  for (let k = 0; k < 9; k++) {                                        // laundry lines strung across the well, higher and higher
    const z = -104 + k * 5.5, y = 6 + k * 2.4;
    boxes.push(bx([26, 0.03, 0.03], [0, y, z], 0x2a2a2a));
    for (let q = 0; q < 7; q++) boxes.push(bx([0.5, 0.8, 0.04], [-9 + q * 3 + hash01(k, q) * 1.2, y - 0.4, z], [0xe8e4d8, 0x3a5a8a, 0xc85a4a, 0xe8c848, 0x5a8a5a, 0x8a5a8a][(k + q) % 6]));
  }
  // the gatehouse: walls, ceiling; the crown stair's side walls
  wallRun(-11, -52, -11, -26, 16, 6); wallRun(11, -52, 11, -26, 16, 6);
  wallRun(-11, -26.4, -4.8, -26.4, 16, 6); wallRun(4.8, -26.4, 11, -26.4, 16, 6);
  boxes.push(bx([22, 0.3, 26], [0, 22.2, -39], 0x2a2426));
  for (const sx of [-1, 1]) wallRun(sx * 3.6, -28, sx * 3.6, -15, 16, 5, 0x5a564e);
  for (const [x, z] of [[-7, -46], [7, -46], [-7, -32], [7, -32]]) { lampAt.push([x, 20.5, z]); glows.push(bx([0.25, 0.25, 0.25], [x, 20.5, z], 0xffd890)); }
  // the crown: parapet, potted trees, the pavilion, water tanks, aerials, the neon ring
  for (let x = -18; x < 18; x += 1) for (const z of [-16.4, 22.4]) if (!(z < 0 && Math.abs(x + 0.5) < 3.4)) boxes.push(bx([1.02, 1.0, 0.3], [x + 0.5, 20.5, z], 0x6a665e));
  for (let z = -16; z < 22; z += 1) for (const x of [-18.4, 18.4]) boxes.push(bx([0.3, 1.0, 1.02], [x, 20.5, z + 0.5], 0x6a665e));
  for (let k = 0; k < 14; k++) {
    const x = (hash01(k, 91) < 0.5 ? -1 : 1) * (11 + hash01(k, 92) * 6), z = -12 + hash01(k, 93) * 32;
    boxes.push(bx([1.0, 0.7, 1.0], [x, 20.35, z], 0x8a4a2a), bx([0.2, 1.2, 0.2], [x, 21.3, z], 0x5a3a24), bx([1.6, 1.0, 1.6], [x, 22.2, z], [0x3a6a3a, 0x2e5a30, 0x4a7a3a][k % 3]));
  }
  for (const [x, z] of [[-7, 13], [7, 13], [-7, 19], [7, 19]]) boxes.push(bx([0.9, 3.6, 0.9], [x, 21.8, z], 0x8a2a1e));
  for (const z of [-8, 0, 8]) {                                         // lantern strings across the garden
    boxes.push(bx([34, 0.03, 0.03], [0, 25.2, z], 0x1a1a1a));
    for (let k = 0; k < 8; k++) { const x = -14 + k * 4, L = lantern(); boxes.push(...place(L.body, x, 24.6, z)); glows.push(...place(L.glow, x, 24.6, z)); if (k % 3 === 1) lampAt.push([x, 24.4, z]); }
  }
  for (let k = 0; k < 4; k++) boxes.push(bx([17 - k * 1.6, 0.35, 9 - k * 1.2], [0, 23.8 + k * 0.35, 16], k ? 0x2a4a3a : 0x1e3a2e));
  boxes.push(...place(waterTank(), -15, 20, 18), ...place(waterTank(), 15, 20, 18), ...place(aerial(4), -16, 20, -10), ...place(aerial(3.5), 16, 20, 4));
  for (let k = 0; k < 12; k++) {                                       // big neon boards on poles round the roof, facing in
    const a = k / 12 * Math.PI * 2, x = Math.sin(a) * 21, z = 3 + Math.cos(a) * 22.5, c = NEON[k % NEON.length], vert = k & 1, n = neon(vert ? 1.6 : 4.2, vert ? 4.2 : 1.6, c, 500 + k);
    const y = 23 + (k % 3) * 0.8, yaw = Math.atan2(-x, 3 - z);                // on poles just past the parapet: in frame
    boxes.push(bx([0.2, 5, 0.2], [x, 20 + 1.5, z], IRON));
    boxes.push(...place(n.body.map((q) => ({ ...q, p: [q.p[0], q.p[1] + y - 20, q.p[2]] })), x, 20, z, yaw));
    for (const q of place(n.glow.map((q) => ({ ...q, p: [q.p[0], q.p[1] + y - 20, q.p[2]] })), x, 20, z, yaw)) glows.push(q);
    neonAt.push([x, y, z, c]);
  }
  // the city below and around: roofs at every height, their windows
  for (let k = 0; k < 80; k++) {
    const x = (hash01(k, 1) - 0.5) * 170, z = -170 + hash01(k, 2) * 230, w = 8 + hash01(k, 3) * 10, d = 8 + hash01(k, 4) * 10;
    let clear = true;
    for (const fu of [-0.6, 0, 0.6]) for (const fv of [-0.6, 0, 0.6]) if (Math.abs(x + fu * w) < 20 && (z + fv * d) > -156 && (z + fv * d) < 26) clear = false;
    if (!clear) continue;
    const top = hash01(k, 5) * 18, bl = block(w, d, 40, 700 + k, { faces: [0, 1, 2, 3], litP: 0.35 });
    boxes.push(...place(bl.body, x, top - 40, z)); lit.push(...place(bl.lit, x, top - 40, z));
  }
  for (let k = 0; k < 40; k++) glows.push(bx([0.8, 0.3, 0.8], [140 + k * 8, -10, -80 + k * 6], k % 5 ? 0xffe0a0 : 0xff4a3a));
  const propMat = lensClear(propMaterial(), 2.6);
  const props = new THREE.Mesh(merge(boxes), propMat); props.castShadow = props.receiveShadow = true; root.add(props);
  const litMat = new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(0.95, 0.9, 0.8) });
  root.add(new THREE.Mesh(merge(lit), litMat));
  const glowMat = new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(2.6, 2.6, 2.6), toneMapped: false });
  const glowMesh = new THREE.Mesh(merge(glows), glowMat); root.add(glowMesh);

  // ---- gates
  const door = new THREE.Mesh(merge([bx([8.4, 3.8, 0.24], [0, 1.9, 0], 0x5a5e62), ...[...Array(7)].map((_, k) => bx([0.1, 3.8, 0.3], [-3.6 + k * 1.2, 1.9, 0], 0x3a3e42)), bx([8.4, 0.2, 0.3], [0, 3.0, 0], 0x3a3e42)]), propMat);
  door.position.set(0, 16, -52.3); door.castShadow = true; root.add(door);
  const grille = new THREE.Mesh(merge([...[...Array(15)].map((_, k) => bx([0.06, 3.2, 0.06], [-3.9 + k * 0.56, 1.6, 0], IRON)), bx([8.2, 0.1, 0.1], [0, 3.1, 0], IRON)]), propMat);
  grille.position.set(0, 16, -27.9); root.add(grille);
  // ---- pots from the balconies (fx.pots)
  const potGeo = merge([bx([0.4, 0.34, 0.4], [0, 0, 0], 0x9a5a3a), bx([0.46, 0.08, 0.46], [0, 0.18, 0], 0x7a4a2a), bx([0.3, 0.3, 0.3], [0, 0.34, 0], 0x3a6a3a)]);
  const pots = [...Array(8)].map(() => { const m = new THREE.Mesh(potGeo, propMat); m.visible = false; root.add(m); return m; });
  const ropes = [...Array(4)].map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1, 0.04), new THREE.MeshStandardMaterial({ color: 0xc9a66b })); m.visible = false; root.add(m); return m; });

  // ---- lights, rain
  const lights = [0, 1, 2, 3].map(() => { const l = new THREE.PointLight(0xffc080, 0, 18, 1.6); root.add(l); return l; });
  const neonL = [0, 1, 2].map(() => { const l = new THREE.PointLight(0xff3a5a, 0, 30, 1.4); root.add(l); return l; });
  const stageKey = new THREE.PointLight(0xffc080, 22, 14, 2); stageKey.position.set(-5, 3, -140); stageKey.name = 'stage-key'; root.add(stageKey);
  const RN = 1600, rp = new Float32Array(RN * 6), rs = new Float32Array(RN * 3);
  for (let i = 0; i < RN; i++) { rs[i * 3] = hash01(i, 1) * 40 - 20; rs[i * 3 + 1] = hash01(i, 2) * 16; rs[i * 3 + 2] = hash01(i, 3) * 40 - 20; }
  const rgeo = new THREE.BufferGeometry(); rgeo.setAttribute('position', new THREE.BufferAttribute(rp, 3));
  const rain = new THREE.LineSegments(rgeo, new THREE.LineBasicMaterial({ color: 0x9aaac0, transparent: true, opacity: 0.4, depthWrite: false }));
  rain.frustumCulled = false; rain.visible = false; root.add(rain);
  const bossFx = createBossFx(root);

  const tmp = new THREE.Vector3();
  let t = 0, doorOpen = 0, grilleOpen = 0, rainK = 0;
  return {
    fires: [],
    update(dt, focus, game) {
      t += dt;
      const fx = (game && game.story && game.story.fx) || {}, T = fx.now ?? 0;
      tmp.set(Math.round(focus.x / 0.03) * 0.03, ground(focus.x, focus.z), Math.round(focus.z / 0.03) * 0.03);
      moon.target.position.copy(tmp); moon.position.copy(MOON).multiplyScalar(70).add(tmp);
      // lamps and neon nearest the focus; the neon ring flickers in the rain phase
      const flick = fx.neon ? (Math.sin(t * 29) * Math.sin(t * 7.7) > 0.3 ? 0.2 : 1) : 1;
      glowMat.color.setScalar(2.6 * (fx.neon ? 0.6 + 0.4 * flick : 1));
      const near = lampAt.slice().sort((a, b) => (a[0] - focus.x) ** 2 + (a[2] - focus.z) ** 2 - (b[0] - focus.x) ** 2 - (b[2] - focus.z) ** 2);
      lights.forEach((l, n) => { const p = near[n]; l.position.set(p[0], p[1], p[2]); l.intensity = 40 * (1 - smooth(18, 30, Math.hypot(p[0] - focus.x, p[2] - focus.z))); });
      const nn = neonAt.slice().sort((a, b) => (a[0] - focus.x) ** 2 + (a[2] - focus.z) ** 2 - (b[0] - focus.x) ** 2 - (b[2] - focus.z) ** 2);
      neonL.forEach((l, n) => { const p = nn[n]; l.position.set(p[0], p[1], p[2]); l.color.setHex(p[3]); l.intensity = (focus.z > -20 ? 90 : 0) * flick; });
      stageKey.intensity = 20 + Math.sin(t * 11.3) * 1.5;
      // gates: the gatehouse door dents as its HP falls, falls in when open; the grille slides
      const hp = fx.gateHp ?? 1;
      doorOpen += ((GATES.gatehouse && GATES.gatehouse.open ? 1 : 0) - doorOpen) * Math.min(1, dt * 2.5);
      door.rotation.x = doorOpen * 1.5; door.position.z = -52.3 + doorOpen * 2; door.scale.y = 1 - (1 - hp) * 0.06;
      if (doorOpen < 0.01 && hp < 1 && hp > 0) door.position.x = Math.sin(t * 40) * 0.02;
      grilleOpen += ((GATES.crownStairs && GATES.crownStairs.open ? 1 : 0) - grilleOpen) * Math.min(1, dt * 1.5);
      grille.position.y = 16 + grilleOpen * 3.4;
      // pots falling from the balconies above onto the gang (fx.pots: {x, z, t lands, t0})
      let pk = 0;
      for (const q of fx.pots || []) {
        const u = (T - q.t0) / Math.max(1, q.t - q.t0);
        if (u < 0 || u > 1.3 || pk >= pots.length) continue;
        const m = pots[pk], r = ropes[pk % ropes.length]; pk++;
        const gy = ground(q.x, q.z), y = u >= 1 ? gy + 0.1 : gy + 14 * (1 - u * u);
        m.visible = true; m.position.set(q.x, y, q.z); m.rotation.set(u * 6, u * 3, 0); m.scale.setScalar(u >= 1 ? 1.3 - (u - 1) : 1);
        r.visible = u < 1; r.position.set(q.x + 0.6, gy + 14 - (1 - u) * 3, q.z); r.scale.y = 6;
      }
      for (let k = pk; k < pots.length; k++) pots[k].visible = false;
      for (let k = pk; k < ropes.length; k++) ropes[k].visible = false;
      // rain (蛇王's P3 on): streaks round the focus
      rainK += ((fx.rain ? 1 : 0) - rainK) * Math.min(1, dt * 0.8);
      rain.visible = rainK > 0.02; rain.material.opacity = 0.4 * rainK;
      if (rain.visible) {
        const a = rgeo.attributes.position, gy = ground(focus.x, focus.z);
        for (let i = 0; i < RN; i++) {
          const y = (rs[i * 3 + 1] - t * 16) % 16, yy = y < 0 ? y + 16 : y, x = focus.x + rs[i * 3], z = focus.z + rs[i * 3 + 2];
          a.setXYZ(i * 2, x, gy + yy, z); a.setXYZ(i * 2 + 1, x + 0.06, gy + yy + 0.7, z + 0.03);
        }
        a.needsUpdate = true;
      }
      scene.fog.far = 200 - 90 * rainK;
      bossFx.update(dt, fx, T);
    },
  };
}
