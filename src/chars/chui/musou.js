// 阿翠's Musou 八斬連環 Eight Cuts (sim; interface of src/musou/musou.js createMusou). Timeline (musou frames, 200 = control):
//   0   activation: the world holds, she crouches (cut-in, 18 f)
//   20–108  eight dash legs through the crowd (PATH, in her facing frame at the start), one cut at the end of each leg
//       (27 + 11k): a circle of 1.5 m round her, spin
//   112–162 she stops, blades tucked back: twelve chain punches (118 + 4n), circle 2 m, flinch
//   180 FINISHER: blades crossed high, then the X-cut out — the teal-steel ring to 6 m, launch
// Frame data: Notion "Characters & Moveset" (無雙 200 f · 8 dash cuts · 12 punches · 180 X-cut; circle 1.5 → 2 → 6 m;
// spin / flinch / launch).
import { emit } from '../../core/events.js';
import { setState, stickDir } from '../../hero/locomotion.js';
import { clampWalk } from '../../world/map.js';
import { offSun, easeOut, smooth, endMusou, gauge } from '../../musou/musou.js';
import { MUSOU_FRAMES } from './anims.js';

const K = 1.25;
export const PATH = [[0, 0], [1.9, 2.6], [-1.9, 2.2], [1.9, 0.8], [-1.9, 0.2], [1.6, 2.9], [-1.6, 2.6], [1.2, 0.6], [0, 1.4]].map(([x, z]) => [x * K, z * K]);
export const CHUI_MUSOU = {
  activation: 18, dash0: 20, leg: 11, legMove: 8, cuts: 8, punches: [118, 122, 126, 130, 134, 138, 142, 146, 150, 154, 158, 162],
  finisher: 180, end: MUSOU_FRAMES, cost: 1 / 3,
  cutHit: { shape: 'circle', range: 1.5, dmg: 12, kb: 'spin', force: 5, lift: 3, hitstop: 2 },
  punchHit: { shape: 'circle', range: 2.0, dmg: 6, kb: 'flinch', force: 1.5, hitstop: 1 },
  xHit: { shape: 'circle', range: 6, dmg: 40, kb: 'launch', force: 6, lift: 9.5, hitstop: 6, heavy: true, yMax: 5 },
};

export function createMusou(game) {
  const M = CHUI_MUSOU;
  const mu = { active: false, t: 0, wasReady: false, seq: 0, ax: 0, az: 0, yaw0: 0, legs: [], punches: 0 };
  const shot = { id: 0, yaw: 0, dist: 0, pitch: 0, fov: 50, height: 1.2, side: 0, shake: 1 };
  let startMusou = 0;
  mu.reset = () => { mu.active = false; mu.t = 0; mu.wasReady = false; mu.legs.length = 0; mu.punches = 0; };
  /** PATH point k in the world (start frame): +x = her left at the start, +z = ahead. */
  const world = (k) => { const [x, z] = PATH[k], c = Math.cos(mu.yaw0), s = Math.sin(mu.yaw0); return [mu.ax + x * c + z * s, mu.az - x * s + z * c]; };
  mu.world = world;

  mu.start = (inp) => {
    const h = game.hero;
    const [sx, sz, smag] = stickDir(inp, game.cam.yaw);
    if (smag) h.yaw = Math.atan2(sx, sz);
    Object.assign(mu, { active: true, t: 0, yaw0: h.yaw, ax: h.x, az: h.z, punches: 0 }); mu.seq++; mu.legs.length = 0;
    startMusou = h.musou;
    h.move = null; h.vx = h.vz = 0;
    setState(h, 'musou'); h.musouClip = 'mu_chui'; h.musouT = 0;
    h.iframes = M.end + 30;
    game.freeze = 2;
    emit('musou:start', { x: h.x, z: h.z, activation: M.activation, burstAt: M.finisher, contact: M.dash0 + M.legMove });
  };
  const hitAt = (hit, x, z, yaw, key, rehit) => game.combat.strike(hit, x, z, yaw, key - (mu.seq % 1000) * 100000, rehit, 'musou');

  mu.stepHero = () => {
    const h = game.hero, t = ++mu.t;
    h.iframes = Math.max(h.iframes, 2); h.vx = h.vz = 0;
    h.musouClip = 'mu_chui'; h.musouT = t / M.end;
    h.musou = Math.max(0, startMusou - h.musouMax * M.cost * Math.min(1, t / (M.dash0 + M.legMove)));
    if (t < M.activation) { game.freeze = Math.max(game.freeze, 2); return; }
    // the eight dash legs: leg k runs PATH[k] → PATH[k + 1] over legMove frames from dash0 + 11k, eased out
    const k = Math.floor((t - M.dash0) / M.leg), u = (t - M.dash0 - k * M.leg) / M.legMove;
    if (t >= M.dash0 && k < M.cuts) {
      const [x0, z0] = world(k), [x1, z1] = world(k + 1), e = easeOut(Math.min(1, u));
      [h.x, h.z] = clampWalk(x0 + (x1 - x0) * e, z0 + (z1 - z0) * e);
      h.yaw = Math.atan2(x1 - x0, z1 - z0);
      if (t === M.dash0 + k * M.leg + M.legMove - 1) {                    // the cut at the end of the leg
        mu.legs.push([x0, z0, h.x, h.z, t]);
        hitAt(M.cutHit, h.x, h.z, h.yaw, -2000 - k, false);
        emit('musou:hit', { x: h.x, y: 1.0, z: h.z, stage: 'rush', yaw: h.yaw, n: k });
      }
    }
    if (t === M.dash0 + M.cuts * M.leg) h.yaw = mu.yaw0;                  // squares up for the punches
    const p = M.punches.indexOf(t);
    if (p >= 0) {
      const n = hitAt(M.punchHit, h.x, h.z, h.yaw, -2100 - p, false);
      mu.punches = p + 1;
      emit('musou:hit', { x: h.x + Math.sin(h.yaw) * 0.8, y: 1.3, z: h.z + Math.cos(h.yaw) * 0.8, stage: 'contact', yaw: h.yaw, n });
    }
    if (t === M.finisher) {
      const n = hitAt(M.xHit, h.x, h.z, h.yaw, -3000, false);
      emit('musou:burst', { count: n, x: h.x, z: h.z });
    }
    if (t >= M.end) endMusou(mu, h, startMusou, M.cost);
  };

  mu.shot = () => {
    if (!mu.active) return null;
    const t = mu.t, o = shot;
    o.shake = 0.4; o.side = 0;
    if (t < M.activation + 4) Object.assign(o, { id: 1, yaw: offSun(mu.yaw0 + Math.PI * 0.8), dist: 3.6, pitch: 0.28, fov: 44, height: 1.0, side: 0.1 });
    else if (t < M.punches[0] - 8) {                                      // high over the dash cuts: the whole path in frame
      const u = smooth(Math.min(1, (t - M.activation) / 14));
      Object.assign(o, { id: 2, yaw: offSun(mu.yaw0 + 0.4), dist: 5 + 4 * u, pitch: 0.28 + 0.16 * u, fov: 56, height: 1.4 + 1.2 * u, shake: 0.5 });
    } else if (t < M.finisher - 12) {                                     // the punches: close, side-on
      Object.assign(o, { id: 3, yaw: offSun(mu.yaw0 + Math.PI * 0.5), dist: 3.8, pitch: 0.1, fov: 50, height: 1.25, shake: 0.6 });
    } else {
      const u = smooth((t - M.finisher + 12) / (M.end - M.finisher + 12));
      Object.assign(o, { id: 4, yaw: offSun(mu.yaw0 - 0.6), dist: 8 + 1.5 * u, pitch: 0.1, fov: 58, height: 1.6, shake: 0.7 });
    }
    return o;
  };
  gauge(mu, game, M.cost);
  return mu;
}
