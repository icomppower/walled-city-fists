// Cutscene player (#cutscene, story lane; render-only — wall-clock time, vrng for any scatter, never touches the sim
// beyond clearing the idle field on entry). Plays a scene of ./data.js on its map: the shipped 阿鐵 / 阿翠 models on their
// own rigs (ui/stage.js standOfficer / poseOfficer: no redesign), box-figure extras (./figures.js), props (some held in a
// hand joint), its own effects (rain, pouring water, a jet, windows lighting up floor by floor, a dawn grade, the title
// card), the camera per shot (from → to, look → lookTo, eased), HUD-style subtitles (seal + name + 粵語 + English).
// Skippable: Esc, a tap / click on 跳過, or Enter held 0.8 s. Mobile caps: fewer rain streaks, every other extra, no extra
// shadows. Screen contract: createCutscene(el, flow, host) → { enter(ctx), exit(), view } (src/main.js header);
// ctx = { id, then: 'title' | { state, ctx } }. host = { world, setMap, clearField(), mobile }.
// Events (for the audio lane): cut:start { id } · cut:shot { id, k } · cut:end { id, skipped }.
import * as THREE from 'three';
import { emit } from '../../core/events.js';
import { vrng } from '../../core/rng.js';
import { P, sampleClip, POSE_SIZE } from '../../hero/rig.js';
import { standOfficer, poseOfficer } from '../../ui/stage.js';
import { ground, MAP } from '../../world/map.js';
import { inkWipe } from '../../ui/menu.js';
import { CHARS, paintPortrait } from '../../chars/index.js';
import { SPK } from '../kc1.js';
import { TT } from '../../chars/tit/anims.js';
import { CH_ } from '../../chars/chui/anims.js';
import { jet as jetBoxes } from '../../world/maps/kckit/props.js';
import { boxesGeometry } from '../../core/voxel.js';
import { CUTSCENES } from './data.js';
import { figure, prop } from './figures.js';

const HOLD = 0.8;
const ease = (u) => u * u * (3 - 2 * u);
const lerp3 = (a, b, u, out) => out.set(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u);

// ---- named poses (static pose arrays per character; `anim` ones are sampled from the kit's own clips)
const pose = new Float32Array(POSE_SIZE);
const STATIC = {
  tit: {
    wave: P({ rfree: 1, armR: [-160, 0, 25, 15], spear: [0.36, 0.5, 0.1, 0, 84, 0], gripL: 0.9, chest: [-4, 0, 0], head: [-8, 0, 0], hipsR: [0, 0, 0] }, TT),
  },
  chui: {
    sit: P({ hips: [0, 0.54, -0.05], hipsR: [0, 0, 0], spine: [4, 0, 0], chest: [8, 0, 0], head: [2, 0, 0], footL: [0.14, 0.08, 0.34, 0, 5], footR: [-0.14, 0.08, 0.32, 0, -5],
      spear: [-0.12, 0.92, 0.3, 180, -10, 90], spearL: [0.12, 0.92, 0.3, 180, -10, -90], dual: 1 }, CH_),
    wave: P({ rfree: 1, armR: [-160, 0, 25, 15], spear: [-0.2, 0.9, -0.08, 180, -75, 90], spearL: [0.2, 0.9, -0.08, 180, -75, -90], dual: 1, lfree: 1, armL: [-10, 0, 20, 30], hipsR: [0, 0, 0] }, CH_),
  },
};
/** Pose `name` of character `id` at scene time t into `out`. */
function namedPose(id, name, t, K, out) {
  const S = STATIC[id] && STATIC[id][name];
  if (S) { out.set(S); return out; }
  const osc = (a, b, period) => a + (b - a) * (0.5 - 0.5 * Math.cos(t * Math.PI * 2 / period));
  if (name === 'offer') sampleClip(K.clips.n6, 30 / 50, out);                       // both palms forward, the pole planted
  else if (name === 'ladle') sampleClip(K.clips.n3, osc(5, 15, 1.8) / 32, out);     // the ladle dips and comes up
  else if (name === 'teach') sampleClip(K.clips.c3, osc(9, 21, 1.1) / 64, out);    // chain punches, slow, for the class
  else sampleClip(K.clips.idle, (t * 0.45) % 1, out);
  return out;
}

export function createCutscene(el, flow, host) {
  el.innerHTML = `<div class="cs-bars"></div><div class="cs-sub"><i class="cs-seal"></i><canvas width="20" height="20"></canvas><div><b></b><p></p><small></small></div></div>
    <div class="cs-card"><b></b><p></p><small></small></div><div class="cs-title"><small></small><b></b></div>
    <button class="cs-skip"><span>跳過</span><small>Skip</small><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15"/><circle class="p" cx="18" cy="18" r="15" pathLength="1"/></svg></button>`;
  const $ = (s) => el.querySelector(s), sub = $('.cs-sub'), card = $('.cs-card'), ttl = $('.cs-title'), skipBtn = $('.cs-skip');
  let S = null, t = 0, ctx = {}, group = null, cast = [], extras = [], props = [], fxs = [], shotK = -1, done = false, subKey = '', holdT = -1;
  let mood = null, jetPos = null, key = null;
  const V = new THREE.Vector3(), L = new THREE.Vector3(), L2 = new THREE.Vector3();

  function finish(skipped) {
    if (done) return;
    done = true; emit('cut:end', { id: S.id, skipped });
    const then = ctx.then || 'title';
    inkWipe(() => (typeof then === 'string' ? flow.go(then) : flow.go(then.state, then.ctx)));
  }
  const onKey = (e) => {
    if (!S || done) return;
    if (e.code === 'Escape') { e.preventDefault(); finish(true); }
    if ((e.code === 'Enter' || e.code === 'Space') && holdT < 0) { holdT = performance.now(); skipBtn.classList.add('on'); }
  };
  const onUp = (e) => { if (e.code === 'Enter' || e.code === 'Space') { holdT = -1; skipBtn.classList.remove('on'); } };
  skipBtn.addEventListener('click', () => finish(true));

  function build(scene) {
    group = new THREE.Group(); group.name = 'cutscene'; scene.add(group);
    const mob = host.mobile;
    cast = S.cast.map((c) => ({ ...c, o: standOfficer(c.id, group), K: CHARS[c.id].kit, p: new THREE.Vector3() }));
    extras = S.extras.filter((e, i) => !mob || i % 2 === 0).map((e) => {
      const g = figure(e.kind, e.k || 0); group.add(g);
      if (mob) g.traverse((o) => { o.castShadow = false; });
      if (e.hold) { const h = prop(e.hold); h.position.set(-0.3 * (e.kind === 'kid' ? 0.7 : 1), 0.8 * (e.kind === 'kid' ? 0.7 : 1), 0.25); g.add(h); }
      return { ...e, g };
    });
    props = S.props.map((q) => {
      const m = prop(q.kind);
      if (q.hand) {
        const c = cast.find((a) => a.id === q.hand.who), j = c && c.o.rig.joints['hand' + q.hand.side];
        if (j) { j.add(m); m.position.set(0, -0.07, 0.06); }
      } else { group.add(m); m.position.set(q.at[0], q.at.length === 3 ? q.at[1] : 0, q.at[q.at.length - 1]); m.rotation.y = q.yaw || 0; }
      return { ...q, m };
    });
    fxs = [];
    key = new THREE.PointLight(0xc8dcff, 0, 30, 1.2); group.add(key);    // a shot's key light (shot.light)
    const F = S.fx || {};
    if (F.rain) {                                                     // rain round the camera
      const n = mob ? 400 : 1200, pos = new Float32Array(n * 6), seed = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { seed[i * 3] = vrng.range(-16, 16); seed[i * 3 + 1] = vrng.range(0, 14); seed[i * 3 + 2] = vrng.range(-16, 16); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const m = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xa8b8d0, transparent: true, opacity: 0.45, depthWrite: false }));
      m.frustumCulled = false; group.add(m);
      fxs.push((dt, cam) => { const a = geo.attributes.position; for (let i = 0; i < n; i++) { const y = ((seed[i * 3 + 1] - t * 14) % 14 + 14) % 14, x = cam.x + seed[i * 3], z = cam.z + seed[i * 3 + 2], gy = cam.y - 7;
        a.setXYZ(i * 2, x, gy + y, z); a.setXYZ(i * 2 + 1, x + 0.04, gy + y + 0.6, z); } a.needsUpdate = true; });
    }
    for (const w of F.water || []) {                                   // a pouring column (or a spreading puddle)
      const col = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1, 1.1), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.1, 1.5, 2.0), transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
      col.visible = false; group.add(col);
      fxs.push(() => {
        const u = Math.min(1, Math.max(0, (t - w.from) / 1.5));
        col.visible = u > 0;
        if (w.spread) { col.scale.set(0.3 + 3 * u, 0.02, 0.3 + 3 * u); col.position.set(w.x, w.y0, w.z); col.material.opacity = 0.5 * u; }
        else { const h = (w.y0 - w.y1) * u; col.scale.set(1 + 0.15 * Math.sin(t * 11 + w.z), h, 1); col.position.set(w.x, w.y0 - h / 2, w.z); col.material.opacity = 0.62; }
      });
    }
    if (F.jet) {
      const J = F.jet, m = new THREE.Mesh(boxesGeometry(jetBoxes()), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.5 }));
      m.visible = false; group.add(m); jetPos = m.position;
      const lit = new THREE.Mesh(boxesGeometry([{ s: [0.8, 0.8, 0.8], p: [-26, -0.8, 2], c: 0xff2a2a }, { s: [0.8, 0.8, 0.8], p: [26, -0.8, 2], c: 0x2aff5a }]),
        new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, color: new THREE.Color(3, 3, 3) })); m.add(lit);
      fxs.push(() => {
        const u = (t - J.t0) / (J.t1 - J.t0); m.visible = u >= 0 && u <= 1;
        if (m.visible) { lerp3(J.from, J.to, u, m.position); m.rotation.set(0.06, Math.atan2(J.to[0] - J.from[0], J.to[2] - J.from[2]), 0); }
        host.shake = m.visible ? Math.max(0, 1 - Math.abs(u - 0.5) * 3) : 0;
      });
    }
    if (F.windows) {                                                   // windows on the well walls, floor by floor from the bottom
      const W = F.windows, floors = [];
      for (let y = W.y[0], f = 0; y <= W.y[1]; y += 3, f++) {
        const b = [];
        for (let z = W.z[0]; z <= W.z[1]; z += 2.4) for (const x of W.x) b.push({ s: [0.1, 1.3, 1.1], p: [x + (x < 0 ? 0.2 : -0.2), y, z], c: [0xf0d8a0, 0xe8c888, 0xf0e0c0][(f + Math.round(z)) % 3] });
        const m = new THREE.Mesh(boxesGeometry(b), new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(0.05, 0.05, 0.06), toneMapped: false }));
        group.add(m); floors.push(m);
      }
      fxs.push(() => floors.forEach((m, f) => { const on = Math.min(1, Math.max(0, (t - W.from - f * (W.to - W.from) / floors.length) / 0.4)); m.material.color.setScalar(0.05 + 2.2 * on); }));
    }
    if (F.dawn) {                                                      // the dawn grade: a warm low sun, a brighter sky
      const sun = new THREE.DirectionalLight(0xffc890, 2.4); sun.position.set(80, 30, 40); group.add(sun, sun.target);
      const fill = new THREE.HemisphereLight(0xffd8b0, 0x5a4a50, 1.2); group.add(fill);
      mood = { bg: scene.background && scene.background.clone(), fog: scene.fog && scene.fog.color.clone() };
      if (scene.background && scene.background.isColor) scene.background.set(0x8a7a9a);
      if (scene.fog) scene.fog.color.set(0xb8a0a0);
      fxs.push(() => { sun.target.position.set(0, 0, -110); });
    }
  }

  const heroCol = (who) => (who === 'tit' || who === 'chui');
  function subtitle() {
    const shot = S.shots[shotK], T0 = S.shots.slice(0, shotK).reduce((a, s) => a + s.dur, 0), st = t - T0;
    const s = (shot.sub || []).find((q) => st >= q.at && st < q.at + q.dur);
    const key = s ? shotK + s.zh : '';
    if (key === subKey) return;
    subKey = key; sub.classList.toggle('on', !!s);
    if (!s) return;
    const cv = sub.querySelector('canvas'), seal = sub.querySelector('.cs-seal');
    if (heroCol(s.who)) { paintPortrait(cv, CHARS[s.who]); cv.style.display = ''; seal.style.display = 'none'; sub.querySelector('b').textContent = CHARS[s.who].name.zh; }
    else { const p = SPK[s.who]; cv.style.display = 'none'; seal.style.display = ''; seal.textContent = p.seal; sub.querySelector('b').textContent = p.name.zh; }
    sub.querySelector('p').textContent = s.zh; sub.querySelector('small').textContent = s.en;
  }

  return {
    enter(c) {
      ctx = c; S = CUTSCENES[c.id] || CUTSCENES.between1; t = 0; shotK = -1; done = false; subKey = ''; holdT = -1;
      host.setMap(S.map); host.world.sync(); host.clearField();
      el.classList.remove('carded'); sub.classList.remove('on'); card.classList.remove('on');
      ttl.querySelector('b').textContent = S.title.zh; ttl.querySelector('small').textContent = S.title.en; ttl.classList.remove('on'); void ttl.offsetWidth; ttl.classList.add('on');
      const C = S.fx && S.fx.card;
      if (C) { card.querySelector('b').textContent = C.zh; card.querySelector('p').textContent = C.sub; card.querySelector('small').textContent = C.en; }
      addEventListener('keydown', onKey); addEventListener('keyup', onUp);
      emit('cut:start', { id: S.id });
    },
    exit() {
      removeEventListener('keydown', onKey); removeEventListener('keyup', onUp);
      if (group) {
        group.parent && group.parent.remove(group);
        group.traverse((o) => { if (o.geometry) o.geometry.dispose(); for (const m of [].concat(o.material || [])) m.dispose(); });
      }
      if (mood && host.scene) { if (mood.bg && host.scene.background) host.scene.background.copy(mood.bg); if (mood.fog && host.scene.fog) host.scene.fog.color.copy(mood.fog); }
      group = null; mood = null; cast = []; extras = []; props = []; fxs = []; host.shake = 0;
    },
    /** Render hook: advance, pose, frame. */
    view(scene, camera, focus, dt) {
      if (!S) return;
      if (!group) build(scene);
      if (!done) t += Math.min(dt, 0.1);
      if (holdT >= 0 && performance.now() - holdT > HOLD * 1000) finish(true);
      // the shot
      let T0 = 0, k = 0;
      while (k < S.shots.length - 1 && t >= T0 + S.shots[k].dur) { T0 += S.shots[k].dur; k++; }
      if (k !== shotK) { shotK = k; emit('cut:shot', { id: S.id, k }); }
      const shot = S.shots[k], u = ease(Math.min(1, (t - T0) / shot.dur));
      lerp3(shot.from, shot.to, u, V); lerp3(shot.look, shot.lookTo || shot.look, u, L);
      if (shot.track && jetPos) {                                      // follow the jet, then ease down to lookTo
        const r = (t - T0) / shot.dur, k2 = ease(Math.min(1, Math.max(0, (r - shot.track) / (1 - shot.track))));
        L2.copy(jetPos); if (r < shot.track || k2 < 1) L.lerpVectors(L2, lerp3(shot.lookTo, shot.lookTo, 1, V.clone()), k2);
      }
      if (shot.light) { key.position.set(shot.light[0], shot.light[1], shot.light[2]); key.intensity = shot.light[3] ?? 60; } else key.intensity = 0;
      if (host.shake) V.x += Math.sin(t * 61) * 0.05 * host.shake, V.y += Math.sin(t * 47) * 0.04 * host.shake;
      camera.position.copy(V); camera.lookAt(L);
      if (camera.fov !== (shot.fov || 45)) { camera.fov = shot.fov || 45; camera.updateProjectionMatrix(); }
      camera.updateMatrixWorld();
      focus.copy(L);
      // cast
      for (const c of cast) {
        let a = c.keys[0], b = c.keys[0];
        for (const q of c.keys) { if (q.t <= t) a = q; if (q.t > t) { b = q; break; } b = q; }
        const w = b.t > a.t ? Math.min(1, (t - a.t) / (b.t - a.t)) : 0;
        const x = a.at[0] + (b.at[0] - a.at[0]) * w, z = a.at[1] + (b.at[1] - a.at[1]) * w;
        c.p.set(x, ground(x, z), z);
        namedPose(c.id, a.pose, t, c.K, pose);
        poseOfficer(c.o, pose, c.p, a.yaw ?? 0, Math.min(dt, 0.05));
      }
      // extras
      for (const e of extras) {
        let a = e.keys[0], b = e.keys[0];
        for (const q of e.keys) { if (q.t <= t) a = q; if (q.t > t) { b = q; break; } b = q; }
        const w = b.t > a.t ? Math.max(0, Math.min(1, (t - a.t) / (b.t - a.t))) : 0, moving = w > 0 && w < 1;
        let x = a.at[0] + (b.at[0] - a.at[0]) * w, z = a.at[1] + (b.at[1] - a.at[1]) * w, y = null;
        if (e.balcony != null) {                                     // a neighbour at a balcony rail (the tower map's balcony paths)
          const runs = MAP.pieces.filter((p) => p.path && p.id.startsWith('balc'));
          const r = runs[e.balcony % runs.length].path, f = ((e.balcony * 0.37) % 1), [ax, az, , ah] = r[0], [bx, bz, , bh] = r[1];
          x = ax + (bx - ax) * f; z = az + (bz - az) * f; y = ah + (bh - ah) * f;
        }
        e.g.visible = t >= (e.appear ?? -1) && t >= (e.keys[0].t > 0 ? e.keys[0].t - 0.01 : -1);
        const hop = e.hop ? Math.abs(Math.sin(t * 6 + (e.k || 0))) * 0.35 : 0, bob = moving ? Math.abs(Math.sin(t * 9 + (e.k || 0))) * 0.05 : 0;
        e.g.position.set(x, (y ?? ground(x, z)) + hop + bob + (e.laugh && t > e.laugh[0] && t < e.laugh[1] ? Math.abs(Math.sin(t * 18)) * 0.03 : 0), z);
        e.g.rotation.y = moving ? Math.atan2(b.at[0] - a.at[0], b.at[1] - a.at[1]) : (a.yaw ?? e.keys[0].yaw ?? 0);
        const arm = e.g.userData.arm;
        if (e.wave && t > e.wave[0] && t < e.wave[1]) arm.rotation.set(-2.7 + Math.sin(t * 8 + (e.k || 0)) * 0.25, 0, 0.2 * Math.sin(t * 8));
        else if (e.punch && t > e.punch[0] && t < e.punch[1]) arm.rotation.set(-1.55 + 0.25 * Math.sin(t * 7 + (e.k || 0)), 0, 0);
        else if (moving) arm.rotation.set(Math.sin(t * 9 + (e.k || 0)) * 0.5, 0, 0);
        else arm.rotation.set(e.hold ? -0.9 : 0, 0, 0);
      }
      for (const q of props) if (q.from != null || q.hand) {
        const from = q.hand ? q.hand.from : q.from, to = q.hand ? q.hand.to : (q.to ?? 1e9);
        q.m.visible = t >= from && t < to;
      }
      for (const f of fxs) f(dt, V);
      subtitle();
      const C = S.fx && S.fx.card;
      if (C) card.classList.toggle('on', t >= C.at);
      const total = S.shots.reduce((a, s) => a + s.dur, 0);
      if (t >= total && !done) finish(false);
    },
  };
}
