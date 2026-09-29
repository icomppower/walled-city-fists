// 阿翠's Musou view (render-only; reads game.musou = ./musou.js): 八斬連環 in teal and steel.
//  · activation: a teal vignette and the calligraphy cut-in (無雙 + 八斬連環 + the 翠 seal)
//  · the dash cuts: a teal streak along every dash leg, fading
//  · the chain punches: a steel ring bursting in front of her fists on every punch
//  · the finisher: the X-cut — two crossed steel blades of light and a teal ring expanding to 6 m, a flash
import * as THREE from 'three';
import { createOverlay, ramp } from '../../musou/overlay.js';
import { ground } from '../../world/map.js';
import { CHUI_MUSOU as M } from './musou.js';

const TEAL = new THREE.Color(0.6, 2.9, 2.6), STEEL = new THREE.Color(2.4, 2.7, 3.0);
export function createMusouView(scene, game) {
  const mu = game.musou, hero = game.hero, root = new THREE.Group();
  scene.add(root);
  const ov = createOverlay({ sub: '八斬連環', seal: '翠',
    css: { big: 'color:#eafffb; text-shadow: 0 0 2vh rgba(60,220,200,.9), 0 0 5vh rgba(200,220,240,.5);', sub: 'color:#d8fff6; text-shadow: 0 0 1vh rgba(0,0,0,.6);' } });
  ov.dim.style.background = 'radial-gradient(ellipse at 50% 55%, rgba(225,250,245,1) 30%, rgba(8,60,58,1) 100%)';
  ov.wash.style.background = 'radial-gradient(circle at 50% 60%, rgba(230,255,250,0.9), rgba(120,200,220,0.25) 70%)';
  const mat = (c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const streaks = [...Array(M.cuts)].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.14), mat(TEAL)); m.visible = false; root.add(m); return m; });
  const ring = (c) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64, 1), mat(c)); m.rotation.x = -Math.PI / 2; m.visible = false; root.add(m); return m; };
  const xRing = ring(TEAL);
  const pops = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.7, 1, 32, 1), mat(STEEL)); m.visible = false; root.add(m); return m; });
  const xBlades = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.08), mat(STEEL)); m.visible = false; root.add(m); return m; });
  let flash = 0;
  return {
    update(dt) {
      const t = mu.active ? mu.t : 0, gy = ground(hero.x, hero.z);
      ov.show(ov.dim, mu.active ? 0.55 * ramp(t, 0, 8) * (1 - ramp(t, M.activation, M.activation + 10)) : 0);
      ov.cut(t, 4, mu.active ? ramp(t, 4, 8) * (1 - ramp(t, M.activation + 2, M.activation + 12)) : 0, ramp(t, 4, 10));
      if (mu.active && t === M.finisher) flash = 1;
      flash = Math.max(0, flash - dt * 2.4); ov.show(ov.wash, flash * 0.5);
      // dash streaks: one per finished leg, a flat teal band along it at chest height, fading over 40 f
      streaks.forEach((m, k) => {
        const Lg = mu.active && mu.legs[k];
        m.visible = !!Lg && t - Lg[4] < 40;
        if (!m.visible) return;
        const [x0, z0, x1, z1] = Lg, len = Math.hypot(x1 - x0, z1 - z0) || 0.1;
        m.position.set((x0 + x1) / 2, ground((x0 + x1) / 2, (z0 + z1) / 2) + 1.0, (z0 + z1) / 2);
        m.rotation.set(0, Math.atan2(x1 - x0, z1 - z0) - Math.PI / 2, 0.12 * (k % 2 ? 1 : -1));
        m.scale.set(len, 1, 1);
        m.material.opacity = 1.1 * (1 - (t - Lg[4]) / 40);
      });
      // punch pops: vertical steel rings in front of the fists, the last three punches
      const fx = Math.sin(hero.yaw), fz = Math.cos(hero.yaw);
      pops.forEach((m, i) => {
        const p = mu.active ? mu.punches - 1 - i : -1, f = p >= 0 ? M.punches[p] : -1, age = t - f;
        m.visible = p >= 0 && age >= 0 && age < 10;
        if (!m.visible) return;
        const side = p % 2 ? 0.08 : -0.08;
        m.position.set(hero.x + fx * (0.85 + age * 0.04) - fz * side, gy + 1.3, hero.z + fz * (0.85 + age * 0.04) + fx * side);
        m.rotation.set(0, hero.yaw, 0); m.scale.setScalar(0.12 + age * 0.05);
        m.material.opacity = 1.2 * (1 - age / 10);
      });
      // the X-cut
      const xw = mu.active && t >= M.finisher && t < M.finisher + 24;
      xRing.visible = xw; xBlades.forEach((b) => { b.visible = xw; });
      if (xw) {
        const u = (t - M.finisher) / 24, r = 0.8 + 5.2 * (1 - (1 - u) ** 3), a = 1.2 * (1 - u);
        xRing.position.set(hero.x, gy + 0.12, hero.z); xRing.scale.setScalar(r); xRing.material.opacity = a;
        xBlades.forEach((b, j) => {
          b.position.set(hero.x, gy + 1.1, hero.z); b.scale.set(r * 2, 1.4, 1);
          b.rotation.set(0, mu.yaw0 + (j ? 0.785 : -0.785), 0); b.material.opacity = a;
        });
      }
    },
    dispose() { scene.remove(root); ov.dispose(); root.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); },
  };
}
