// 阿鐵's Musou view (render-only; reads game.musou = ./musou.js, never writes sim state): 虎鶴雙形 in gold and red.
//  · activation: a dark-gold vignette and the calligraphy cut-in (無雙 + 虎鶴雙形 + the 鐵 seal)
//  · the sweeps: a gold swirl ring at each sweep's reach, fading
//  · the flurry: three red claw rakes (parallel glowing bars) in front of him on every claw, fading
//  · the crane: two wing fans of glowing feathers (gold, red tips) open from his shoulders and sweep forward with the palm
//  · the finisher: a gold shockwave ring riding the sim's wave radius, a red inner ring, gold sparks on vrng
import * as THREE from 'three';
import { on } from '../../core/events.js';
import { vrng } from '../../core/rng.js';
import { createOverlay, ramp } from '../../musou/overlay.js';
import { ground } from '../../world/map.js';
import { TIT_MUSOU as M } from './musou.js';

const GOLD = new THREE.Color(2.7, 1.9, 0.4), RED = new THREE.Color(3.0, 0.7, 0.35), PALE = new THREE.Color(2.4, 2.0, 1.0);
const FEATHERS = 11;                                                // per wing

export function createMusouView(scene, game) {
  const mu = game.musou, hero = game.hero, root = new THREE.Group();
  scene.add(root);
  const ov = createOverlay({ sub: '虎鶴雙形', seal: '鐵',
    css: { big: 'color:#fff2c0; text-shadow: 0 0 2vh rgba(255,190,40,.9), 0 0 5vh rgba(220,60,20,.5);', sub: 'color:#ffd680; text-shadow: 0 0 1vh rgba(0,0,0,.7);' } });
  ov.dim.style.background = 'radial-gradient(ellipse at 50% 55%, rgba(255,230,170,1) 25%, rgba(60,20,0,1) 100%)';
  ov.wash.style.background = 'radial-gradient(circle at 50% 60%, rgba(255,230,150,0.9), rgba(230,70,20,0.25) 70%)';

  const addMat = (c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const flat = (r0, r1, c) => { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 72, 1), addMat(c)); m.rotation.x = -Math.PI / 2; m.visible = false; root.add(m); return m; };
  const wave = flat(0.9, 1, GOLD), inner = flat(0.8, 1, RED), swirl = flat(0.86, 1, PALE);
  // claw rakes: three bars per claw, the last three claws visible at once
  const rakes = [...Array(9)].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 1.3), addMat(RED)); m.visible = false; root.add(m); return m; });
  // crane wings: opaque HDR feathers (bloom), fade by shrinking
  const wings = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1), fog: false, toneMapped: false }), FEATHERS * 2);
  for (let i = 0; i < FEATHERS * 2; i++) wings.setColorAt(i, (i % FEATHERS) > FEATHERS - 4 ? new THREE.Color(3.2, 0.8, 0.4) : new THREE.Color(3.0, 2.2, 0.6));
  wings.frustumCulled = false; wings.visible = false; root.add(wings);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new THREE.Vector3(), p3 = new THREE.Vector3(), e3 = new THREE.Euler();

  const N = 200, pos = new Float32Array(N * 3), vel = new Float32Array(N * 3), life = new Float32Array(N);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const sparks = new THREE.Points(geo, new THREE.PointsMaterial({ color: GOLD, size: 0.12, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending }));
  sparks.frustumCulled = false; root.add(sparks);
  const burst = (x, z, r) => {
    for (let i = 0; i < N; i++) {
      const a = vrng.range(0, Math.PI * 2), rr = r * vrng.range(0.2, 1), s = vrng.range(4, 10);
      pos[i * 3] = x + Math.sin(a) * rr; pos[i * 3 + 1] = ground(x, z) + vrng.range(0.2, 1.4); pos[i * 3 + 2] = z + Math.cos(a) * rr;
      vel[i * 3] = Math.sin(a) * s; vel[i * 3 + 1] = vrng.range(2, 8); vel[i * 3 + 2] = Math.cos(a) * s;
      life[i] = vrng.range(0.8, 1.8);
    }
  };
  for (let i = 0; i < N; i++) pos[i * 3 + 1] = -999;
  const subs = [on('musou:burst', (e) => { if (game.musou === mu) burst(e.x, e.z, 3); })];

  let flash = 0;
  return {
    update(dt) {
      const t = mu.active ? mu.t : 0, gy = ground(hero.x, hero.z);
      ov.show(ov.dim, mu.active ? 0.55 * ramp(t, 0, 8) * (1 - ramp(t, M.activation - 4, M.activation + 8)) : 0);
      ov.cut(t, 6, mu.active ? ramp(t, 6, 10) * (1 - ramp(t, M.activation + 4, M.activation + 14)) : 0, ramp(t, 6, 12));
      if (mu.active && t === M.finisher) flash = 1;
      flash = Math.max(0, flash - dt * 2.2);
      ov.show(ov.wash, flash * 0.5);
      // sweep swirls
      let sw = -1;
      M.sweeps.forEach((f, j) => { if (mu.active && t >= f - 6 && t < f + 18) sw = j; });
      swirl.visible = sw >= 0;
      if (sw >= 0) {
        const f = M.sweeps[sw];
        swirl.position.set(hero.x, gy + 0.1, hero.z); swirl.scale.setScalar(M.sweepR[sw] * (0.6 + 0.4 * ramp(t, f - 6, f + 2)));
        swirl.material.opacity = 0.75 * (1 - ramp(t, f + 2, f + 18));
      }
      // claw rakes: three slanted bars 1.1 m in front of him per claw, 18 f each
      const fy = Math.sin(hero.yaw), fz = Math.cos(hero.yaw);
      rakes.forEach((m, i) => {
        const k = Math.floor(i / 3), c = mu.active ? mu.claws - 1 - k : -1, f = c >= 0 ? M.flurry[c] : -1, age = t - f;
        m.visible = c >= 0 && age >= 0 && age < 18;
        if (!m.visible) return;
        const side = (c & 1 ? -1 : 1), off = (i % 3 - 1) * 0.16;
        m.position.set(hero.x + fy * (1.1 + age * 0.03) - fz * off, gy + 1.15, hero.z + fz * (1.1 + age * 0.03) + fy * off);
        m.rotation.set(0, hero.yaw, side * 0.6);
        m.material.opacity = 1.3 * (1 - age / 18);
      });
      // crane wings: open 160 → 172, sweep forward with the palm at 180, fold / shrink out by the end
      const wv = mu.active && t >= M.wings - 6 && t < M.end;
      wings.visible = wv;
      if (wv) {
        const open = ramp(t, M.wings - 6, M.wings + 8), fwd = ramp(t, M.finisher - 6, M.finisher + 2), fade = 1 - ramp(t, M.end - 22, M.end);
        for (let s = 0; s < 2; s++) for (let i = 0; i < FEATHERS; i++) {
          const u = i / (FEATHERS - 1), sx = s ? 1 : -1;
          const spread = (0.2 + u * 1.25) * open, a = hero.yaw + sx * (Math.PI / 2 - fwd * 0.9) ;
          const r = 0.35 + u * 1.9 * open;
          p3.set(hero.x + Math.sin(a) * r, gy + 1.45 + Math.sin(u * Math.PI) * 0.35 * open - fwd * u * 0.5, hero.z + Math.cos(a) * r);
          e3.set(0.3 * sx * spread, a, -sx * (0.25 + u * 0.5)); q.setFromEuler(e3);
          s3.set(0.07 * fade, (0.12 + 0.05 * u) * fade, (0.5 + 0.35 * (1 - Math.abs(u - 0.6))) * fade * open);
          wings.setMatrixAt(s * FEATHERS + i, m4.compose(p3, q, s3));
        }
        wings.instanceMatrix.needsUpdate = true;
      }
      // shockwave rings
      const ww = mu.active && t >= M.finisher && t < M.finisher + M.waveFrames + 16;
      wave.visible = inner.visible = ww;
      if (ww) {
        wave.position.set(hero.x, gy + 0.12, hero.z); wave.scale.setScalar(Math.max(0.8, mu.waveR));
        inner.position.set(hero.x, gy + 0.1, hero.z); inner.scale.setScalar(Math.max(0.6, mu.waveR * 0.72));
        const a = 1 - ramp(t, M.finisher + 4, M.finisher + M.waveFrames + 16);
        wave.material.opacity = 1.2 * a; inner.material.opacity = 0.9 * a;
      }
      let live = false;
      for (let i = 0; i < N; i++) {
        if (life[i] <= 0) continue;
        live = true; life[i] -= dt;
        vel[i * 3] *= 1 - 1.8 * dt; vel[i * 3 + 2] *= 1 - 1.8 * dt; vel[i * 3 + 1] -= 6 * dt;
        pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        if (life[i] <= 0) pos[i * 3 + 1] = -999;
      }
      sparks.visible = live;
      if (live) geo.attributes.position.needsUpdate = true;
    },
    dispose() {
      scene.remove(root); ov.dispose();
      root.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      void subs;
    },
  };
}
