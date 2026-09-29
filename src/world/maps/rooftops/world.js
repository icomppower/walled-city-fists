// 天台 The Rooftops' world builder (render-only; registered in the world registry, src/world/world.js). Before dawn over
// the Walled City: the roofs of the block as islands at different heights, each the top of a tenement that drops away to
// the lanes far below (the terrain's rise is negative outside the walk field), low parapets at the edges, a forest of TV
// aerials, rooftop shacks and laundry, plank bridges over the drop between blocks (gate 'plankBridge': a padlocked
// board across the first plank, thrown aside when it opens), four padlocked water tanks on stands (they pour down to the
// floors below as their locks are cut), the stair up to the highest roof (gate 'tankLocks': a chained grille), the
// airport lights of 啟德 to the east. Story fx (kc2.js script + bosses.js): fx.kids (the dawn class: 0.7× kids from the
// `kids` skin palette, walking to the stairs hut), fx.tanks (lock HP / open), fx.jet (every pass: body, lights, a shadow
// sweeping the roofs, the roofs shake), boss fx (bossfx.js). Never writes sim state.
import * as THREE from 'three';
import { GATES, ground, walkIn, TERRAIN as G, PIECE_IDS, node, smooth, MAP } from '../../map.js';
import { buildGround } from '../kckit/terrain.js';
import { place, merge, propMaterial, bx, block, neon, waterTank, aerial, crate, jet, WALLS, IRON } from '../kckit/props.js';
import { kidFigure } from '../../../chars/officers/kc/skins.js';
import { createBossFx } from '../../../chars/officers/kc/bossfx.js';
import { lensClear } from '../../../camera/occlusion.js';
import { hash01 } from '../../../core/rng.js';
import { shade } from '../../../core/voxel.js';

const SHADOW_BOX = 30, SUN = new THREE.Vector3(0.7, 0.35, 0.6).normalize();
const DAWN = new THREE.Color(0x2a3450), FOG = new THREE.Color(0x4a5470);
const ROOFS = [['roofA', [-16, -152, 16, -104], 0], ['roofB', [-9, -92, 9, -77], 1.2], ['roofC', [-14, -62, 14, -28], 2.4], ['peak', [-15, -15, 15, 20], 6]];

function dawnSky() {
  const geo = new THREE.SphereGeometry(900, 32, 16), col = [], p = geo.attributes.position, c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const h = Math.max(0, p.getY(i) / 900), east = Math.max(0, p.getX(i) / 900) * (1 - h);    // the glow low in the east (+X)
    c.setRGB(0.16 + 0.55 * east ** 2 + 0.1 * (1 - h) ** 4, 0.2 + 0.28 * east ** 2 + 0.06 * (1 - h) ** 4, 0.34 + 0.1 * (1 - h) - 0.1 * east);
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -1; sky.frustumCulled = false;
  return sky;
}

export function buildRooftops(scene, root) {
  scene.background = DAWN.clone();
  scene.fog = new THREE.Fog(FOG.clone(), 40, 260);
  root.add(dawnSky());
  root.add(new THREE.HemisphereLight(0x8a9ac8, 0x3a3440, 1.5));
  const sun = new THREE.DirectionalLight(0xffc8a0, 1.6);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -SHADOW_BOX, right: SHADOW_BOX, top: SHADOW_BOX, bottom: -SHADOW_BOX, near: 1, far: 180 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
  root.add(sun, sun.target);

  // ---- roofs: concrete with tar patches, planks of wood; outside the walk field the ground drops to the lanes below
  const ROOF = 0x7a766e, TAR = 0x3a3a3e, PLANK = 0x8a6a42, DROP = 0x2a2a32;
  buildGround(root, {
    colorAt(x, z, y, inside, out) {
      if (inside < -0.6) return out > 3 ? DROP : shade(DROP, 1.3);
      const id = PIECE_IDS[G.own[node(x, z)]], h = hash01(Math.round(x), Math.round(z), 3);
      if (id.startsWith('plank')) return (Math.round(x * 2.5) & 1) ? PLANK : shade(PLANK, 0.85);
      if (id === 'stair') return (Math.round(z * 2) & 1) ? 0x8a8478 : 0x6a665e;
      return h < 0.14 ? TAR : h < 0.3 ? shade(ROOF, 0.9) : ROOF;
    },
    rise: (x, z, out) => -Math.min(28, out * 5),
  });

  const boxes = [], lit = [], glows = [];
  // the tenements under the walkable roofs (their tops = the roof, parapets just past the edge, gaps at planks / stair)
  const openings = [[0, -104, 3.4], [0, -92, 3.4], [0, -77, 3.4], [3, -62, 3.4], [0, -28, 5.4], [0, -15, 5.4]];
  const gap = (x, z) => openings.some(([ox, oz, w]) => Math.abs(x - ox) < w / 2 + 0.3 && Math.abs(z - oz) < 1.4);
  ROOFS.forEach(([id, [x0, z0, x1, z1], h], k) => {
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0 + 0.6, d = z1 - z0 + 0.6;
    const bl = block(w, d, 30, 100 + k, { faces: [0, 1, 2, 3], litP: 0.3, laundry: 0.35 });
    boxes.push(...place(bl.body.filter((q) => q.p[1] < 30), cx, h - 30.2, cz)); lit.push(...place(bl.lit, cx, h - 30.2, cz));
    for (let x = x0; x < x1; x += 1) for (const z of [z0 - 0.45, z1 + 0.45]) if (!gap(x + 0.5, z)) boxes.push(bx([1.02, 0.8, 0.3], [x + 0.5, h + 0.4, z], shade(WALLS[k % WALLS.length], 0.9)));
    for (let z = z0; z < z1; z += 1) for (const x of [x0 - 0.45, x1 + 0.45]) if (!gap(x, z + 0.5)) boxes.push(bx([0.3, 0.8, 1.02], [x, h + 0.4, z + 0.5], shade(WALLS[k % WALLS.length], 0.9)));
  });
  // the city's other roofs all round: blocks topped a little below / above ours, aerials, tanks, laundry
  for (let k = 0; k < 90; k++) {
    const x = (hash01(k, 1) - 0.5) * 150, z = -175 + hash01(k, 2) * 230, w = 8 + hash01(k, 3) * 10, d = 8 + hash01(k, 4) * 10;
    let clear = true;
    for (const fu of [-0.6, 0, 0.6]) for (const fv of [-0.6, 0, 0.6]) if (walkIn(x + fu * w, z + fv * d) > -2.5) clear = false;
    if (!clear) continue;
    const top = -8 + hash01(k, 5) * 14, bl = block(w, d, 30, 200 + k, { faces: [0, 1, 2, 3], litP: 0.25 });
    boxes.push(...place(bl.body, x, top - 30, z)); lit.push(...place(bl.lit, x, top - 30, z));
  }
  // aerials on 阿翠's roof (the forest), a shack, the stairs hut, laundry lines, the class's stools
  for (let k = 0; k < 26; k++) {
    const x = (hash01(k, 11) - 0.5) * 28, z = -150 + hash01(k, 12) * 44;
    if (Math.abs(x) < 4 && z > -148) continue;
    if (walkIn(x, z) < 1.2) continue;
    boxes.push(...place(aerial(3 + hash01(k, 13) * 3), x, 0, z, hash01(k, 14) * 3));
  }
  boxes.push(bx([5, 3.2, 6], [-13.5, 1.6, -111], 0x8a8274), bx([5.4, 0.2, 6.4], [-13.5, 3.3, -111], 0x5a5e62), bx([1.4, 2.2, 0.1], [-11, 1.1, -111], 0x3a2418));   // stairs hut
  for (let k = 0; k < 4; k++) boxes.push(bx([0.03, 0.03, 10], [8 + k * 1.2, 2.2, -128], 0x2a2a2a), ...[...Array(5)].map((_, q) => bx([0.5, 0.7, 0.04], [8 + k * 1.2, 1.8, -132 + q * 2 + (k & 1)], [0xe8e4d8, 0x3a5a8a, 0xc85a4a, 0xe8c848, 0x5a8a5a][(k + q) % 5])));
  for (let k = 0; k < 8; k++) boxes.push(bx([0.34, 0.42, 0.34], [-4 + (k % 4) * 2.4, 0.21, -138 + Math.floor(k / 4) * 2.2], 0xc83a2a));
  // shacks and crates on the other roofs
  boxes.push(bx([4, 2.6, 5], [9, 3.7, -34], 0x7a7064), bx([4.4, 0.2, 5.4], [9, 5.1, -34], 0x5a5e62), ...place(crate(), -6, 2.4, -58), ...place(crate(), 11, 6, 8), ...place(crate(), -12, 6, 16));
  for (let k = 0; k < 10; k++) { const x = (hash01(k, 51) - 0.5) * 26, z = -12 + hash01(k, 52) * 30; if (Math.abs(x) > 4) boxes.push(...place(aerial(3 + hash01(k, 53) * 2), x, 6, z, k)); }
  // the plank bridges' boards and ropes (the walkable plank is the terrain; these are the edges and rails)
  for (const [a, b, h0, h1] of [[[0, -105], [0, -91], 0, 0.6], [[0, -78], [3, -61], 1.2, 2.4]]) {
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), yaw = Math.atan2(dx, dz), cx = (a[0] + b[0]) / 2, cz = (a[1] + b[1]) / 2, cy = (h0 + h1) / 2;
    for (const sx of [-1, 1]) boxes.push(...place([bx([0.12, 0.25, L], [sx * 1.65, -0.05, 0], 0x5a4228), bx([0.04, 0.04, L], [sx * 1.7, 0.95, 0], 0xc9a66b)], cx, cy, cz, yaw));
    for (let s = -L / 2; s < L / 2; s += 2.5) for (const sx of [-1, 1]) boxes.push(...place([bx([0.06, 1.0, 0.06], [sx * 1.7, 0.45, s], 0x5a4228)], cx, cy + (s / L) * (h1 - h0), cz, yaw));
  }
  // neon on the neighbours' walls facing the roofs (dawn: still lit), 啟德's runway lights to the east
  for (let k = 0; k < 10; k++) {
    const n = neon(1.2, 3.2, [0xff3a5a, 0x3affd8, 0xffd23a, 0xff6ad8][k % 4], 300 + k), x = (k & 1 ? 1 : -1) * (24 + hash01(k, 61) * 6), z = -140 + k * 16, y = -2 + hash01(k, 62) * 6;
    boxes.push(...place(n.body.map((q) => ({ ...q, p: [q.p[0], q.p[1] + y, q.p[2]] })), x, 0, z, x > 0 ? -Math.PI / 2 : Math.PI / 2));
    glows.push(...place(n.glow.map((q) => ({ ...q, p: [q.p[0], q.p[1] + y, q.p[2]] })), x, 0, z, x > 0 ? -Math.PI / 2 : Math.PI / 2));
  }
  for (let k = 0; k < 40; k++) glows.push(bx([0.8, 0.3, 0.8], [180 + k * 9, -24, -60 + k * 6.5], k % 5 ? 0xffe0a0 : 0xff4a3a));
  const propMat = lensClear(propMaterial(), 2.6);
  const props = new THREE.Mesh(merge(boxes), propMat); props.castShadow = props.receiveShadow = true; root.add(props);
  const litMat = new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(0.9, 0.85, 0.8) });
  root.add(new THREE.Mesh(merge(lit), litMat));
  const glowMat = new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(2.4, 2.4, 2.4), toneMapped: false });
  root.add(new THREE.Mesh(merge(glows), glowMat));

  // ---- the water tanks (padlocked) and their pouring water; the gates
  const tankGeo = merge([...waterTank(0x4a6a7a), bx([0.3, 0.35, 0.16], [0, 1.6, 0.76], 0x8a8a92), bx([0.9, 0.05, 0.05], [0, 1.9, 0.72], 0x9a9aa2, [0, 0, 0.6])]);
  const tanks = MAP.tanks.map(([x, z]) => { const m = new THREE.Mesh(tankGeo, propMat); m.position.set(x, ground(x, z), z); m.scale.setScalar(1.5); m.castShadow = true; root.add(m); return m; });
  const waterMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 0.85, 1.2), transparent: true, opacity: 0.55, depthWrite: false });
  const streams = MAP.tanks.map(([x, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5), waterMat); m.visible = false; m.position.set(x + (x > 0 ? 1.4 : -1.4), 0, z); root.add(m); return m; });
  const plankBoard = new THREE.Mesh(merge([bx([4.6, 1.2, 0.12], [0, 0.6, 0], 0x6a4a2c), bx([0.3, 0.35, 0.16], [0.4, 0.8, 0.12], 0x8a8a92), bx([4.6, 0.06, 0.06], [0, 0.9, 0.1], 0x9a9aa2)]), propMat);
  plankBoard.position.set(0, ground(0, -104.2), -104.2); root.add(plankBoard);
  const grille = new THREE.Mesh(merge([...[...Array(14)].map((_, k) => bx([0.06, 2.8, 0.06], [-3.6 + k * 0.55, 1.4, 0], IRON)), bx([7.6, 0.1, 0.1], [0, 2.7, 0], IRON), bx([7.6, 0.1, 0.1], [0, 0.3, 0], IRON)]), propMat);
  grille.position.set(0, ground(0, -27.8), -27.8); root.add(grille);

  // ---- the dawn class (fx.kids): 0.7× kids from the kids skin
  const kidMeshes = [0, 1, 2, 3, 4].map((k) => { const m = new THREE.Mesh(merge(kidFigure(k)), propMat); m.castShadow = true; m.visible = false; root.add(m); return m; });
  // ---- jets (fx.jet)
  const jetMesh = new THREE.Mesh(merge(jet()), propMaterial({ roughness: 0.5 })); jetMesh.visible = false; root.add(jetMesh);
  const jetShadow = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false }));
  jetShadow.rotation.x = -Math.PI / 2; jetShadow.scale.set(26, 14, 1); root.add(jetShadow);
  const stageKey = new THREE.PointLight(0xffc8a0, 18, 16, 2); stageKey.position.set(-4, 3, -140); stageKey.name = 'stage-key'; root.add(stageKey);
  const bossFx = createBossFx(root);

  const tmp = new THREE.Vector3();
  let t = 0, plankOpen = 0, grilleOpen = 0;
  return {
    fires: [],
    update(dt, focus, game) {
      t += dt;
      const fx = (game && game.story && game.story.fx) || {}, T = fx.now ?? 0;
      const step = 2 * SHADOW_BOX / 2048;
      tmp.set(Math.round(focus.x / step) * step, ground(focus.x, focus.z), Math.round(focus.z / step) * step);
      sun.target.position.copy(tmp); sun.position.copy(SUN).multiplyScalar(80).add(tmp);
      // jets: 6 s across, low over the roofs; everything shakes under it
      const jt = fx.jet ? (T - fx.jet.t) / 60 : -1, jOn = jt >= 0 && jt < 6;
      jetMesh.visible = jOn; let shake = 0;
      if (jOn) {
        const u = jt / 6, ang = fx.jet.yaw, R = 240, px = fx.jet.x + Math.sin(ang) * R * (u - 0.5) * 2, pz = fx.jet.z + Math.cos(ang) * R * (u - 0.5) * 2, py = 42 - 8 * u;
        jetMesh.position.set(px, py, pz); jetMesh.rotation.set(0.1, ang, 0);
        const near = 1 - smooth(15, 120, Math.hypot(px - focus.x, pz - focus.z));
        jetShadow.position.set(px + 10, ground(px + 10, pz) + 0.1, pz); jetShadow.rotation.z = -ang; jetShadow.material.opacity = 0.5 * near;
        shake = near;
      } else jetShadow.material.opacity = 0;
      props.position.set(Math.sin(t * 71) * 0.05 * shake, Math.sin(t * 53) * 0.04 * shake, 0);
      // gates
      plankOpen += ((GATES.plankBridge && GATES.plankBridge.open ? 1 : 0) - plankOpen) * Math.min(1, dt * 2);
      plankBoard.rotation.z = plankOpen * 1.4; plankBoard.position.x = plankOpen * 2.8; plankBoard.visible = plankOpen < 0.97;
      grilleOpen += ((GATES.tankLocks && GATES.tankLocks.open ? 1 : 0) - grilleOpen) * Math.min(1, dt * 1.5);
      grille.position.x = grilleOpen * 7.5;
      // tanks: a shiver while their locks are worked, water pouring once open (a column down past the roof edge)
      (fx.tanks || []).forEach((q, k) => {
        const m = tanks[k], s = streams[k], [x, z] = MAP.tanks[k];
        m.position.x = x + (q.hp < 1 && !q.open ? Math.sin(t * 40) * 0.03 : 0);
        s.visible = !!q.open;
        if (s.visible) { const gy = ground(x, z); s.scale.set(1 + 0.2 * Math.sin(t * 9 + k), 30, 1); s.position.y = gy - 13 + 1.8; }
      });
      // the dawn class
      (fx.kids || []).forEach((q, k) => {
        const m = kidMeshes[k]; m.visible = !!q.on;
        if (m.visible) { m.position.set(q.x, ground(q.x, q.z) + Math.abs(Math.sin(t * 9 + k)) * 0.04 * (q.moving ? 1 : 0), q.z); m.rotation.y = q.yaw; }
      });
      stageKey.intensity = 16 + Math.sin(t * 9.1) * 1.5;
      bossFx.update(dt, fx, T);
    },
  };
}
