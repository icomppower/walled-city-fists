// Boss behaviours of 城寨拳王 (chapter-script modules for the story director's script hook). Phases from the boss's HP
// fraction (Characters & Moveset page). Deterministic: timers off the story clock, no randomness of their own.
// Phase floor: on the step a hit carries the boss across a threshold his HP is held at (threshold − 0.2 %) — one strong
// Musou can't skip a phase, and every phase starts at its threshold (the stage-3 gate: ±0.5 %). Phase banners / lines fire
// from `on` (partial beats) on the phase frame. Area attacks hurt the hero directly (hero.hurt: i-frames, dodge and the
// Musou still protect him). Everything a boss throws is telegraphed (a ring / a line on the ground) before it lands.
// fx (render-only readers — src/chars/officers/kc/bossfx.js): { kind, phase, dark, rain, neon, rings: [{x, z, r, t, kind}],
//   drops: [{x, z, t (lands), x0, z0, t0}] (knives in flight), shots: [{x0, z0, x1, z1, t (fires), t0 (aim)}],
//   swings: [{x, z, yaw, r, ang, t0, a, b, kind}] (the 蛇王's guandao arcs), leap: {x0, z0, x1, z1, t0, n} | null }.
//   ox        鐵牛 Iron Ox        P1 hammer blows · P2 < 60 % bull charges (6 m, telegraphed) · P3 < 25 % ground slams
//                                 (three, 4 m ring)
//   swallow   飛燕 Swallow        P1 single knife throws · P2 < 50 % jumps roof to roof (7–9 m leaps), a knife fan on
//                                 landing · P3 < 25 % knife rain (seven round the hero)
//   goldtooth 金牙探長 Gold-Tooth  P1 baton + revolver bursts (three shots down an aimed line) · P2 < 50 % calls khaki
//                                 squads · P3 < 25 % power cut: fights in the dark
//   serpent   蛇王 Serpent King   his guandao: N1 劈 (arc 80°, 3.1 m, slam) · N2 橫掃 (arc 280°, 3.2 m, blow) · C1 躍斬
//                                 (leap, circle 3.4 m, slam) on the frame table · P2 < 75 % gang elites · P3 < 50 % rain
//                                 and neon flicker · P4 < 25 % enraged: faster, leap slams
import { clampWalk } from '../../../world/map.js';
import { ST } from '../../../crowd/crowd.js';

export const BOSS_PHASES = { ox: [0.6, 0.25], swallow: [0.5, 0.25], goldtooth: [0.5, 0.25], serpent: [0.75, 0.5, 0.25] };
/** 蛇王 guandao moves (frame table, 60 Hz): frames, hit window, shape, reaction on the hero. */
export const SERPENT_MOVES = {
  n1: { frames: 44, win: [20, 24], shape: 'arc', r: 3.1, ang: 80, dmg: 12 },
  n2: { frames: 48, win: [20, 27], shape: 'arc', r: 3.2, ang: 280, dmg: 10 },
  c1: { frames: 64, win: [35, 38], shape: 'circle', r: 3.4, dmg: 16, leap: [12, 34] },
};

/** script(game, api) for boss `kind` spawned under officer key `key` (OFF entry). opts: calls [[x, z], …] spawn spots
 *  (Gold-Tooth's khaki squads, the 蛇王's elites), elites: OFF keys for the 蛇王's call, on: { phase: partial beat }. */
export function bossScript(kind, { key = kind, calls = [], elites = ['chain', 'blade'], on = {} } = {}) {
  return (game, api) => {
    const TH = BOSS_PHASES[kind];
    const fx = { phase: 0, dark: false, rain: false, neon: false, rings: [], drops: [], shots: [], swings: [], leap: null, kind, calls: 0 };
    const h = game.hero, c = game.crowd;
    let phase = 0, t0 = 0, lunge = null, timers = {}, slam = null, swing = null, cuts = 0, armour = null;   // armour: a phase-entry move that ignores stagger
    const due = (name, k, first, every) => { const n = timers[name] ?? first; if (k < n) return false; timers[name] = n + every; return true; };
    const dist = (i) => Math.hypot(h.x - c.x[i], h.z - c.z[i]);
    const hurtIn = (x, z, r, dmg) => { if (h.y < 0.4 && Math.hypot(h.x - x, h.z - z) < r) h.hurt(Math.round(dmg * game.diff.dmg), x, z, true); };
    const ring = (x, z, r, kind_) => fx.rings.push({ x, z, r, t: api.t(), kind: kind_ });
    const standing = (i) => c.st[i] !== ST.DEAD && c.st[i] !== ST.OFF && c.st[i] < ST.HURT;
    /** Move the boss toward (tx, tz) over n frames (a lunge / leap), then run `hit` at the end. */
    const go = (i, tx, tz, n, hit, leap = false) => {
      lunge = { i, x0: c.x[i], z0: c.z[i], tx, tz, k: 0, n, hit };
      if (leap) fx.leap = { x0: c.x[i], z0: c.z[i], x1: tx, z1: tz, t0: api.t(), n };
    };
    const segD = (px, pz, ax, az, bx, bz) => {                        // distance from P to the segment AB
      const ex = bx - ax, ez = bz - az, u = Math.max(0, Math.min(1, ((px - ax) * ex + (pz - az) * ez) / (ex * ex + ez * ez || 1)));
      return Math.hypot(px - ax - ex * u, pz - az - ez * u);
    };

    return {
      fx,
      step() {
        const i = api.officer(key);
        if (i < 0 && !api.dead(key)) return;                         // not on the field yet
        const T = api.t();
        fx.rings = fx.rings.filter((r) => T - r.t < 60);
        fx.drops = fx.drops.filter((q) => T - q.t < 30);
        fx.shots = fx.shots.filter((q) => T - q.t < 20);
        fx.swings = fx.swings.filter((q) => T - q.t0 < 70);
        if (fx.leap && T - fx.leap.t0 > fx.leap.n + 6) fx.leap = null;
        if (api.dead(key)) { if (phase < 9) { phase = 9; fx.phase = 9; lunge = null; swing = null; slam = null; fx.dark = false; } return; }
        // phase floor + phase changes
        let f = c.hp[i] / c.hpMax[i];
        const p = 1 + TH.filter((x) => f < x).length;
        if (p > phase + 1 && phase > 0) {                           // one hit skipped a threshold: hold at the first one
          c.hp[i] = Math.max(c.hp[i], (TH[phase - 1] - 0.002) * c.hpMax[i]); f = c.hp[i] / c.hpMax[i];
        }
        const np = 1 + TH.filter((x) => f < x).length;
        if (np !== phase) {
          if (phase > 0) { const thr = TH[np - 2]; if (f < thr - 0.004) { c.hp[i] = (thr - 0.002) * c.hpMax[i]; f = c.hp[i] / c.hpMax[i]; } }
          phase = np; fx.phase = np; t0 = T; fx.at = f; timers = {}; enter(np, i);
          if (on[np]) api.fire(on[np]);
        }
        const k = T - t0;
        if (lunge) {                                                  // a scripted lunge / leap in progress
          const L = lunge, u = ++L.k / L.n, e = u * (2 - u);
          [c.x[L.i], c.z[L.i]] = clampWalk(L.x0 + (L.tx - L.x0) * e, L.z0 + (L.tz - L.z0) * e, 0.3); c.vx[L.i] = c.vz[L.i] = 0;
          if (L.k >= L.n) { lunge = null; L.hit?.(); }
        }
        run(phase, k, i, T);
      },
    };

    function enter(p, i) {
      if (kind === 'goldtooth' && p === 2) calls.forEach(([x, z]) => { api.squad({ at: [x, z], n: 10 }); fx.calls++; });
      if (kind === 'goldtooth' && p === 3) fx.dark = true;
      if (kind === 'serpent' && p === 2) calls.forEach(([x, z], n) => {
        api.squad({ at: [x, z], n: 8 }); fx.calls++;
        api.fire({ officers: { ['elite' + (n + 1)]: { like: elites[n % elites.length], at: [x, z], engaged: true } } });
      });
      if (kind === 'serpent' && p >= 3) { fx.rain = true; fx.neon = true; }
      if ((kind === 'swallow' && p === 2) || (kind === 'serpent' && p === 4)) armour = kind;   // she's off the roof edge / he roars and leaps
    }

    function run(p, k, i, T) {
      // timed hazards resolve even while he is staggered (knives already in the air, a slam already coming down)
      for (const q of fx.drops) if (T === q.t) { hurtIn(q.x, q.z, 0.9, 8); ring(q.x, q.z, 0.9, 'knife'); }
      for (const q of fx.shots) if (T === q.t && h.y < 0.4 && segD(h.x, h.z, q.x0, q.z0, q.x1, q.z1) < 0.6) h.hurt(Math.round(9 * game.diff.dmg), q.x0, q.z0, true);
      if (slam && T >= slam.at) { hurtIn(c.x[i], c.z[i], 4, 16); ring(c.x[i], c.z[i], 4, 'slam'); slam = --slam.n > 0 ? { ...slam, at: slam.at + 22 } : null; }
      if (swing) {                                                   // the 蛇王's guandao move in progress (frame table)
        const s = swing, M = SERPENT_MOVES[s.move], f = T - s.t0;
        if (M.leap && f === M.leap[0]) go(i, s.tx, s.tz, M.leap[1] - M.leap[0], null, true);
        if (f >= M.win[0] && f <= M.win[1] && !s.hit && h.y < 0.6) {
          const dx = h.x - c.x[i], dz = h.z - c.z[i], d = Math.hypot(dx, dz);
          let inside = d < M.r;
          if (inside && M.shape === 'arc') { const a = Math.atan2(dx, dz) - s.yaw; inside = Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) <= M.ang / 2 * Math.PI / 180; }
          if (inside) { s.hit = true; h.hurt(Math.round(M.dmg * game.diff.dmg), c.x[i], c.z[i], true); }
        }
        if (f === M.win[0]) ring(c.x[i], c.z[i], M.r, s.move === 'c1' ? 'slam' : 'arc');
        if (f >= M.frames) swing = null;
      }
      // berserk / thrown attacks ignore stagger (super armour)
      if (kind === 'ox' && p === 3 && !slam && due('slam', k, 20, 240)) slam = { at: T + 24, n: 3 };
      if (kind === 'swallow' && p === 3 && due('rain', k, 30, 220)) {   // knife rain: seven round the hero, landing staggered
        for (let n = 0; n < 7; n++) { const a = n * 0.8976 + k * 0.01, r = n ? 1.7 : 0; fx.drops.push({ x: h.x + Math.sin(a) * r, z: h.z + Math.cos(a) * r, t: T + 26 + n * 5, x0: c.x[i], z0: c.z[i], t0: T }); }
      }
      const d = dist(i), ang = Math.atan2(h.x - c.x[i], h.z - c.z[i]);
      const toward = (m) => [c.x[i] + Math.sin(ang) * Math.min(m, Math.max(0, d - 1.2)), c.z[i] + Math.cos(ang) * Math.min(m, Math.max(0, d - 1.2))];
      if (armour && !lunge && !swing) {                              // phase-entry move: super armour (recovers him from a stagger)
        if (c.st[i] >= ST.HURT && c.st[i] <= ST.GETUP) { c.st[i] = ST.GUARD; c.stT[i] = 0; c.y[i] = 0; c.vy[i] = 0; c.rx[i] = 0; }
        if (armour === 'swallow') timers.leap = 0;
        else { const [tx, tz] = toward(8); swing = { move: 'c1', t0: T, yaw: ang, tx, tz, hit: false };
          fx.swings.push({ x: c.x[i], z: c.z[i], yaw: ang, r: SERPENT_MOVES.c1.r, ang: 360, t0: T, a: SERPENT_MOVES.c1.win[0], b: SERPENT_MOVES.c1.win[1], kind: 'c1', tx, tz }); if (phase === 4) timers.leapslam = k + 170; }
        armour = null;
      }
      if (!standing(i) || lunge || swing) return;
      if (kind === 'ox') {
        if (p === 2 && d < 14 && due('charge', k, 60, 200)) {          // bull charge: hops back to run-up distance, the landing
          const charge = () => {                                         // spot flashes, then he runs the line through the hero
            const a = Math.atan2(h.x - c.x[i], h.z - c.z[i]), D = Math.min(7, Math.hypot(h.x - c.x[i], h.z - c.z[i]) + 1.5);
            const x = c.x[i] + Math.sin(a) * D, z = c.z[i] + Math.cos(a) * D; ring(x, z, 1.8, 'aim');
            go(i, x, z, 20, () => { hurtIn(c.x[i], c.z[i], 1.8, 20); ring(c.x[i], c.z[i], 1.8, 'bash'); });
          };
          if (d < 4) go(i, c.x[i] - Math.sin(ang) * 4, c.z[i] - Math.cos(ang) * 4, 14, charge); else charge();
        }
        if (p === 3 && c.cd[i] > 30) c.cd[i] = 30;
      } else if (kind === 'swallow') {
        if (p === 1 && d < 16 && due('throw', k, 60, 150)) fx.drops.push({ x: h.x, z: h.z, t: T + 18, x0: c.x[i], z0: c.z[i], t0: T });
        if (p >= 2 && due('leap', k, 6, 240)) {                     // roof to roof: a leap to a new spot 7–9 m from the hero
          const a = ang + Math.PI + ((k / 240) & 1 ? 1.1 : -1.1), r = 7 + ((k / 240) % 3);
          go(i, h.x + Math.sin(a) * r, h.z + Math.cos(a) * r, 24, () => {
            for (let n = -1; n <= 1; n++) { const b = Math.atan2(h.x - c.x[i], h.z - c.z[i]) + n * 0.25, D = Math.min(dist(i), 9); fx.drops.push({ x: c.x[i] + Math.sin(b) * D, z: c.z[i] + Math.cos(b) * D, t: api.t() + 16, x0: c.x[i], z0: c.z[i], t0: api.t() }); }
          }, true);
        }
      } else if (kind === 'goldtooth') {
        if (d < 14 && d > 2.5 && due('shots', k, 90, 300)) {          // revolver burst: the aim line shows 24 f, three shots 8 f apart
          const ex = c.x[i] + Math.sin(ang) * 16, ez = c.z[i] + Math.cos(ang) * 16;
          for (let n = 0; n < 3; n++) fx.shots.push({ x0: c.x[i], z0: c.z[i], x1: ex, z1: ez, t: T + 24 + n * 8, t0: T });
        }
      } else if (kind === 'serpent') {
        const fast = p === 4;
        if (fast && c.cd[i] > 32) c.cd[i] = 32;
        const pick = fast && d < 12 && due('leapslam', k, 20, 170) ? 'c1'
          : d < 3.6 && due('cut', k, 50, fast ? 140 : 200) ? (cuts++ & 1 ? 'n2' : 'n1')
          : d >= 3.6 && d < 10 && due('c1', k, 120, 300) ? 'c1' : null;
        if (pick) {
          const [tx, tz] = toward(pick === 'c1' ? 8 : 0.5);
          swing = { move: pick, t0: T, yaw: ang, tx, tz, hit: false };
          fx.swings.push({ x: c.x[i], z: c.z[i], yaw: ang, r: SERPENT_MOVES[pick].r, ang: SERPENT_MOVES[pick].ang || 360, t0: T,
            a: SERPENT_MOVES[pick].win[0], b: SERPENT_MOVES[pick].win[1], kind: pick, tx, tz });
        }
      }
    }
  };
}
