// 阿鐵's Musou 虎鶴雙形 Tiger & Crane (sim; interface of src/musou/musou.js createMusou).
// Timeline (musou frames t, 210 = control returns; hitstop pauses it):
//   0   activation: the world holds still, he raises the pole (cut-in, 24 f)
//   30 / 60 / 90  three widening pole sweeps (circle 2.6 → 3.0 → 3.4 m, spin reaction)
//   108 the pole planted behind him; 120–150 the tiger-claw flurry: seven alternating claws every 5 f (line 2 m, flinch),
//       stepping 1.6 m forward over the flurry (clamped to walkable ground)
//   164 crane wings spread on one leg · 180 FINISHER: the crane-wing palm driven down-forward — the gold-red shockwave
//       ring blasts out to 7 m (launch)
// Frame data: Notion "Characters & Moveset" (無雙 210 f · 30 · 60 · 90 · flurry 120–150 · 180; circles 2.6 → 3.4 m ·
// line 2 m · circle 7 m; spin / flinch / launch).
import { emit } from '../../core/events.js';
import { setState, stickDir } from '../../hero/locomotion.js';
import { clampWalk } from '../../world/map.js';
import { offSun, smooth, endMusou, gauge } from '../../musou/musou.js';
import { MUSOU_FRAMES } from './anims.js';

export const TIT_MUSOU = {
  activation: 24, sweeps: [30, 60, 90], sweepR: [2.6, 3.0, 3.4], flurry: [120, 125, 130, 135, 140, 145, 150], step: 1.6,
  wings: 164, finisher: 180, end: MUSOU_FRAMES, cost: 1 / 3,
  sweepHit: { shape: 'circle', dmg: 18, kb: 'spin', force: 6, lift: 3, hitstop: 2 },
  clawHit: { shape: 'line', len: 2, width: 2.2, dmg: 9, kb: 'flinch', force: 2, hitstop: 1 },
  waveR: 7, waveFrames: 14,
  waveHit: { shape: 'circle', range: 0, dmg: 42, kb: 'launch', force: 6, lift: 9, hitstop: 0, heavy: true, yMax: 5 },
};

export function createMusou(game) {
  const M = TIT_MUSOU;
  const mu = { active: false, t: 0, wasReady: false, seq: 0, ax: 0, az: 0, yaw0: 0, waveR: 0, fx0: 0, fz0: 0, claws: 0 };
  const shot = { id: 0, yaw: 0, dist: 0, pitch: 0, fov: 50, height: 1.2, side: 0, shake: 1 };
  let startMusou = 0;

  mu.reset = () => { mu.active = false; mu.t = 0; mu.wasReady = false; mu.waveR = 0; mu.claws = 0; };

  mu.start = (inp) => {
    const h = game.hero;
    const [sx, sz, smag] = stickDir(inp, game.cam.yaw);
    if (smag) h.yaw = Math.atan2(sx, sz);
    Object.assign(mu, { active: true, t: 0, waveR: 0, claws: 0, yaw0: h.yaw, ax: h.x, az: h.z }); mu.seq++;
    startMusou = h.musou;
    h.move = null; h.vx = h.vz = 0;
    setState(h, 'musou');
    h.musouClip = 'mu_tit'; h.musouT = 0;
    h.iframes = M.end + 30;
    game.freeze = 2;
    emit('musou:start', { x: h.x, z: h.z, activation: M.activation, burstAt: M.finisher, contact: M.sweeps[0] });
  };

  const hitAt = (hit, x, z, yaw, key, rehit) => game.combat.strike(hit, x, z, yaw, key - (mu.seq % 1000) * 100000, rehit, 'musou');

  mu.stepHero = () => {
    const h = game.hero, t = ++mu.t;
    h.iframes = Math.max(h.iframes, 2);
    h.vx = h.vz = 0;
    h.musouClip = 'mu_tit'; h.musouT = t / M.end;
    h.musou = Math.max(0, startMusou - h.musouMax * M.cost * Math.min(1, t / M.sweeps[0]));
    if (t < M.activation) { game.freeze = Math.max(game.freeze, 2); return; }
    M.sweeps.forEach((f, j) => {                                     // three pole sweeps, each wider
      if (t !== f) return;
      hitAt({ ...M.sweepHit, range: M.sweepR[j] }, h.x, h.z, h.yaw, -2100 - j, false);
      emit('musou:hit', { x: h.x, y: 1.0, z: h.z, stage: 'rush', yaw: h.yaw, n: j });
    });
    const f0 = M.flurry[0], f1 = M.flurry[M.flurry.length - 1];
    if (t === f0 - 4) { mu.fx0 = h.x; mu.fz0 = h.z; }
    if (t >= f0 - 4 && t <= f1) {                                    // the flurry steps him forward
      const u = smooth((t - f0 + 4) / (f1 - f0 + 4));
      [h.x, h.z] = clampWalk(mu.fx0 + Math.sin(h.yaw) * M.step * u, mu.fz0 + Math.cos(h.yaw) * M.step * u, 0.3);
    }
    const k = M.flurry.indexOf(t);
    if (k >= 0) {                                                    // one tiger claw
      const n = hitAt(M.clawHit, h.x, h.z, h.yaw, -2500 - k, false);
      mu.claws = k + 1;
      emit('musou:hit', { x: h.x + Math.sin(h.yaw) * 1.1, y: 1.2, z: h.z + Math.cos(h.yaw) * 1.1, stage: 'contact', yaw: h.yaw, n });
    }
    const w = t - M.finisher;
    if (w >= 0 && w <= M.waveFrames) {                               // the crane-wing shockwave from the palm
      const u = w / M.waveFrames;
      mu.waveR = M.waveR * (1 - (1 - u) * (1 - u) * (1 - u)) + 0.8;
      const n = hitAt({ ...M.waveHit, range: mu.waveR, lift: M.waveHit.lift - 3 * u, hitstop: w === 0 ? 5 : 0, heavy: w < 2 }, h.x, h.z, h.yaw, -3000, false);
      if (w === 0) emit('musou:burst', { count: n, x: h.x, z: h.z });
      else if (n) { const a = w * 2.4, R = mu.waveR * 0.9; emit('musou:hit', { x: h.x + Math.sin(a) * R, y: 0.4, z: h.z + Math.cos(a) * R, stage: 'wave', yaw: a, n: w }); }
    }
    if (t >= M.end) endMusou(mu, h, startMusou, M.cost);
  };

  mu.shot = () => {
    if (!mu.active) return null;
    const t = mu.t, o = shot;
    o.shake = 0.4; o.side = 0;
    if (t < M.activation) {                                          // front three-quarter, above head height, slow push-in
      const u = t / M.activation;
      Object.assign(o, { id: 1, yaw: offSun(mu.yaw0 + Math.PI * 0.8), dist: 4.4 - 0.7 * u, pitch: 0.3, fov: 44, height: 1.1, side: 0.1 });
    } else if (t < M.flurry[0] - 12) {                               // wide, high over his shoulder: the sweeps
      const u = smooth(Math.min(1, (t - M.activation) / 20));
      Object.assign(o, { id: 2, yaw: offSun(mu.yaw0 + 0.35), dist: 5 + 3 * u, pitch: 0.22 + 0.1 * u, fov: 56, height: 1.5 + 0.6 * u, shake: 0.5 });
    } else if (t < M.wings - 2) {                                    // the flurry: low side-on close-up
      Object.assign(o, { id: 3, yaw: offSun(mu.yaw0 + Math.PI * 0.45), dist: 4.6, pitch: 0.1, fov: 52, height: 1.2, shake: 0.6 });
    } else {                                                          // the crane and the finisher: low wide shot
      const u = smooth((t - M.wings + 2) / (M.end - M.wings + 2));
      Object.assign(o, { id: 4, yaw: offSun(mu.yaw0 - 0.5), dist: 8 + 1.8 * u, pitch: 0.08 + 0.05 * u, fov: 58, height: 1.6 + 0.3 * u, shake: 0.7 });
    }
    return o;
  };

  gauge(mu, game, M.cost);
  return mu;
}
