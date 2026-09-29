// Boss fx view of 城寨拳王 (render-only; reads story.fx of ./bosses.js, never writes sim state). Every kc world builder
// creates one: createBossFx(root) → { update(dt, fx, t) }.
//   rings   slam / bash: a dust ring expanding on the ground · aim: a red target ring pulsing until the charge lands ·
//           knife: a small steel glint ring where a knife lands · arc: the guandao's sweep (a pale ring)
//   drops   knives in flight: a spinning steel sliver on an arc from the thrower to the landing spot, its landing spot
//           marked red on the ground while it flies
//   shots   the revolver burst: a thin red aim line on the ground from the aim frame, a muzzle flash + tracer on each shot
//   swings  the 蛇王's guandao: a sector telegraph on the ground (fills toward the hit window), bright during the window
import * as THREE from 'three';
import { ground } from '../../../world/map.js';

const RED = new THREE.Color(2.4, 0.35, 0.2), DUST = new THREE.Color(0.75, 0.68, 0.58), STEEL = new THREE.Color(2.2, 2.3, 2.5), PALE = new THREE.Color(1.6, 1.5, 1.3);
const add = (c, o = 0) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });

export function createBossFx(root) {
  const g = new THREE.Group(); root.add(g);
  const pool = (n, make) => [...Array(n)].map(() => { const m = make(); m.visible = false; g.add(m); return m; });
  const flatRing = (c) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 48, 1), add(c)); m.rotation.x = -Math.PI / 2; return m; };
  const rings = pool(24, () => flatRing(DUST)), marks = pool(12, () => flatRing(RED));
  const knives = pool(12, () => new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.34), new THREE.MeshBasicMaterial({ color: STEEL, fog: false })));
  const lines = pool(6, () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.08), add(RED)); m.rotation.x = -Math.PI / 2; return m; });
  const tracers = pool(6, () => new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1), add(new THREE.Color(3, 2.4, 1.2))));
  const sectors = pool(4, () => new THREE.Mesh(new THREE.CircleGeometry(1, 40, 0, Math.PI * 2), add(RED)));
  sectors.forEach((m) => { m.rotation.x = -Math.PI / 2; });
  const sectorGeo = {};
  const sector = (ang) => sectorGeo[ang] || (sectorGeo[ang] = new THREE.CircleGeometry(1, 40, -ang / 2 * Math.PI / 180, ang * Math.PI / 180));
  let time = 0;
  return {
    update(dt, fx, t) {
      time += dt;
      const on = !!fx && fx.phase !== undefined;
      // rings
      let r = 0, mk = 0;
      for (const q of on ? fx.rings : []) {
        const age = t - q.t;
        if (q.kind === 'aim') { if (mk < marks.length) { const m = marks[mk++]; m.visible = true; m.position.set(q.x, ground(q.x, q.z) + 0.06, q.z); m.scale.setScalar(q.r * (0.9 + 0.1 * Math.sin(time * 20))); m.material.opacity = 0.9 * (1 - age / 30); } continue; }
        if (r >= rings.length) break;
        const m = rings[r++], u = Math.min(1, age / (q.kind === 'knife' ? 14 : 28));
        m.visible = true; m.position.set(q.x, ground(q.x, q.z) + 0.05, q.z);
        m.material.color.copy(q.kind === 'knife' ? STEEL : q.kind === 'arc' ? PALE : DUST);
        m.scale.setScalar(q.r * (0.3 + 0.9 * (1 - (1 - u) ** 2)));
        m.material.opacity = (q.kind === 'slam' ? 1.1 : 0.8) * (1 - u);
      }
      // knives in flight + their landing marks
      let kn = 0;
      for (const q of on ? fx.drops : []) {
        const n = q.t - q.t0, u = (t - q.t0) / Math.max(1, n);
        if (u < 0 || u > 1 || kn >= knives.length) continue;
        const m = knives[kn], mm = marks[mk]; kn++;
        const x = q.x0 + (q.x - q.x0) * u, z = q.z0 + (q.z - q.z0) * u, y = ground(x, z) + 1.4 * (1 - u) + 2.2 * u * (1 - u) + 0.1;
        m.visible = true; m.position.set(x, y, z); m.rotation.set(time * 30, Math.atan2(q.x - q.x0, q.z - q.z0), 0);
        if (mm) { mk++; mm.visible = true; mm.position.set(q.x, ground(q.x, q.z) + 0.05, q.z); mm.scale.setScalar(0.9); mm.material.opacity = 0.35 + 0.5 * u; }
      }
      // revolver: aim lines and tracers
      let ln = 0, tr = 0;
      for (const q of on ? fx.shots : []) {
        const len = Math.hypot(q.x1 - q.x0, q.z1 - q.z0), yaw = Math.atan2(q.x1 - q.x0, q.z1 - q.z0), cx = (q.x0 + q.x1) / 2, cz = (q.z0 + q.z1) / 2;
        if (t < q.t && ln < lines.length) {
          const m = lines[ln++]; m.visible = true; m.position.set(cx, ground(cx, cz) + 0.07, cz); m.rotation.set(-Math.PI / 2, 0, yaw - Math.PI / 2); m.scale.set(len, 1, 1);
          m.material.opacity = 0.35 + 0.5 * Math.max(0, 1 - (q.t - t) / 24);
        } else if (t - q.t < 6 && tr < tracers.length) {
          const m = tracers[tr++]; m.visible = true; m.position.set(cx, ground(cx, cz) + 1.25, cz); m.rotation.set(0, yaw, 0); m.scale.set(1, 1, len); m.material.opacity = 1.2 * (1 - (t - q.t) / 6);
        }
      }
      // guandao sectors
      let sc = 0;
      for (const q of on ? fx.swings : []) {
        const f = t - q.t0;
        if (f > q.b + 4 || sc >= sectors.length) continue;
        const m = sectors[sc++], x = q.kind === 'c1' ? q.tx : q.x, z = q.kind === 'c1' ? q.tz : q.z;
        m.geometry = sector(q.ang >= 360 ? 360 : q.ang); m.visible = true;
        m.position.set(x, ground(x, z) + 0.04, z); m.rotation.set(-Math.PI / 2, 0, q.yaw - Math.PI / 2 + (q.ang >= 360 ? 0 : 0));
        m.scale.setScalar(q.r * (f < q.a ? 0.4 + 0.6 * f / q.a : 1));
        m.material.opacity = f >= q.a ? 0.8 : 0.12 + 0.3 * f / q.a;
      }
      for (let k = r; k < rings.length; k++) rings[k].visible = false;
      for (let k = mk; k < marks.length; k++) marks[k].visible = false;
      for (let k = kn; k < knives.length; k++) knives[k].visible = false;
      for (let k = ln; k < lines.length; k++) lines[k].visible = false;
      for (let k = tr; k < tracers.length; k++) tracers[k].visible = false;
      for (let k = sc; k < sectors.length; k++) sectors[k].visible = false;
    },
  };
}
