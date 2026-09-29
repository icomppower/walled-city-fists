// 阿翠 Ah Chui — 八斬刀 butterfly swords + 詠春 chain punches (data only; format: src/hero/moves.js header; `hand` = the
// striking blade, src/hero/moveset.js handAt — the trail follows it). Fast: short-gap N-string alternating hands, dash
// cancels on N3 and N5 (dodgeCancel = last active frame + 1).
// Frame data (Notion "Characters & Moveset"): N1 / N2 左右斬 22 f hit 7–10 arc 120° 1.6 m push · N3 交叉斬 28 f 11–14
// arc 150° 1.9 m blow · C1 蝴蝶旋 48 f, hits 12 · 22 · 32 · 41, circle 1.8 m, travels 1.5 m, spin. N-string onsets 16–20
// f apart: n1 7 → n2 24 → n3 42 → n4 60 → n5 78 → n6 96 (onset spacing = cancel_k + tell_k+1 − tell_k).
// Feel notes: C2 cross cut · C3 chain-punch flurry (10 hits, blades tucked back along the forearms) · C4 low sweep +
// rising cut · C5 dash-through · C6 spinning finisher.
import { prepMoves } from '../../hero/moveset.js';

const ONCE = 99;
export const MOVES = {
  // N1 左斬 left cut · N2 右斬 right cut · N3 交叉斬 cross cut (both) · N4 left backhand · N5 右刺 right thrust · N6 double spin
  n1: { frames: 22, next: 'n2', charge: 'c2', cancel: 17, branch: 11, dodgeCancel: 11, steer: 5, lunge: [[3, 9, 0.3]], hand: 'L',
    hits: [{ f: [7, 10], every: ONCE, shape: 'arc', range: 1.6, ang: 120, dir: 10, dmg: 8, kb: 'push', force: 3, hitstop: 2 }] },
  n2: { frames: 22, next: 'n3', charge: 'c3', cancel: 14, branch: 11, dodgeCancel: 11, steer: 5, lunge: [[3, 9, 0.3]], hand: 'R',
    hits: [{ f: [7, 10], every: ONCE, shape: 'arc', range: 1.6, ang: 120, dir: -10, dmg: 8, kb: 'push', force: 3, hitstop: 2 }] },
  n3: { frames: 28, next: 'n4', charge: 'c4', cancel: 22, branch: 15, dodgeCancel: 15, steer: 5, lunge: [[5, 13, 0.4]], hand: [[0, 'L'], [12, 'R']],
    hits: [{ f: [11, 14], every: ONCE, shape: 'arc', range: 1.9, ang: 150, dmg: 14, kb: 'blow', force: 6, lift: 2, hitstop: 3 }] },
  n4: { frames: 24, next: 'n5', charge: 'c5', cancel: 18, branch: 12, dodgeCancel: 12, steer: 5, lunge: [[3, 9, 0.35]], hand: 'L',
    hits: [{ f: [7, 10], sweep: -1, shape: 'arc', range: 1.8, ang: 160, dmg: 9, kb: 'flinch', force: 3, hitstop: 2 }] },
  n5: { frames: 26, next: 'n6', charge: 'c6', cancel: 18, branch: 12, dodgeCancel: 11, steer: 5, lunge: [[4, 10, 0.5]], hand: 'R',
    hits: [{ f: [7, 10], every: ONCE, shape: 'line', len: 2.1, width: 1.0, dmg: 10, kb: 'push', force: 5, hitstop: 2 }] },
  n6: { frames: 44, next: 'n1', charge: 'c1', cancel: 34, dodgeCancel: 24, steer: 6, lunge: [[2, 12, 0.8]], armor: true, hand: [[0, 'R'], [16, 'L']],
    hits: [{ f: [7, 13], every: ONCE, shape: 'circle', range: 2.0, dmg: 10, kb: 'flinch', force: 3, hitstop: 2 },
      { f: [16, 22], every: ONCE, shape: 'circle', range: 2.2, dmg: 18, kb: 'blow', force: 10, lift: 5, hitstop: 5, heavy: true }] },

  // C1 蝴蝶旋 butterfly spin: spins forward with both blades out, four hits
  c1: { frames: 48, cancel: 42, dodgeCancel: 42, steer: 12, lunge: [[8, 42, 1.5]], armor: true, hand: [[0, 'R'], [18, 'L'], [28, 'R'], [38, 'L']],
    hits: [12, 22, 32, 41].map((f) => ({ f: [f, f + 1], every: ONCE, shape: 'circle', range: 1.8, dmg: 7, kb: 'spin', force: 4, lift: 2, hitstop: 1 })) },
  // C2 (N1 → C) cross cut: both blades cross high and cut out along the diagonals
  c2: { frames: 40, cancel: 34, dodgeCancel: 26, steer: 10, lunge: [[6, 14, 0.6]], armor: true, hand: [[0, 'L'], [16, 'R']],
    hits: [{ f: [14, 18], every: ONCE, shape: 'arc', range: 2.1, ang: 130, dmg: 18, kb: 'blow', force: 9, lift: 4, hitstop: 5, heavy: true }] },
  // C3 (N2 → C) 日字衝拳 chain-punch flurry: blades tucked back along the forearms, ten straight punches, the last one heavy
  c3: { frames: 64, cancel: 58, dodgeCancel: 48, steer: 10, lunge: [[6, 50, 1.4, 'lin']], armor: true, hand: [[0, 'R']],
    hits: [...[10, 14, 18, 22, 26, 30, 34, 38, 42].map((f) => ({ f: [f, f + 1], every: ONCE, shape: 'line', len: 1.6, width: 1.3, dmg: 4, kb: 'flinch', force: 1.5, hitstop: 1 })),
      { f: [48, 50], every: ONCE, shape: 'line', len: 1.9, width: 1.5, dmg: 16, kb: 'blow', force: 10, lift: 3, hitstop: 5, heavy: true }] },
  // C4 (N3 → C) low sweep + rising cut: drops under the ring sweeping the ankles, then both blades rip up (launcher)
  c4: { frames: 50, cancel: 44, dodgeCancel: 36, steer: 10, lunge: [[4, 14, 0.5]], armor: true, hand: [[0, 'L'], [22, 'R']],
    hits: [{ f: [10, 14], sweep: 1, shape: 'arc', range: 2.0, ang: 200, dmg: 8, kb: 'flinch', force: 2, hitstop: 2 },
      { f: [24, 27], every: ONCE, shape: 'arc', range: 2.0, ang: 140, dmg: 16, kb: 'launch', force: 2, lift: 10, hitstop: 5, heavy: true }] },
  // C5 (N4 → C) dash-through: a chain of three dashing cuts through the front rank
  c5: { frames: 56, cancel: 50, dodgeCancel: 42, steer: 10, lunge: [[6, 12, 1.4, 'lin'], [18, 24, 1.4, 'lin'], [30, 36, 1.4, 'lin']], armor: true,
    hand: [[0, 'L'], [18, 'R'], [30, 'L']],
    hits: [10, 22, 34].map((f, k) => ({ f: [f, f + 2], every: ONCE, shape: 'line', len: 2.2, width: 1.4, dmg: k === 2 ? 14 : 10, kb: k === 2 ? 'blow' : 'flinch',
      force: k === 2 ? 9 : 3, lift: k === 2 ? 4 : 0, hitstop: k === 2 ? 4 : 2, heavy: k === 2 })) },
  // C6 (N5 → C) spinning finisher: a long bladed spin that drags the ring in, then both blades snap out wide
  c6: { frames: 84, cancel: 76, dodgeCancel: 66, steer: 8, lunge: [[8, 56, 1.4]], armor: true, hand: [[0, 'R'], [56, 'L']],
    hits: [{ f: [10, 54], shape: 'circle', range: 2.3, dmg: 5, kb: 'flinch', force: 0.8, hitstop: 1, every: 8 },
      { f: [58, 62], every: ONCE, shape: 'circle', range: 3.6, dmg: 26, kb: 'launch', force: 5, lift: 9, hitstop: 7, heavy: true }] },

  // Dash attack: a running double cut
  dash: { frames: 40, cancel: 34, dodgeCancel: 20, steer: 3, lunge: [[0, 16, 3.6, 'lin'], [16, 22, 0.8]], hand: [[0, 'R'], [14, 'L']],
    hits: [{ f: [10, 13], every: ONCE, shape: 'arc', range: 2.1, ang: 160, dmg: 10, kb: 'flinch', force: 4, hitstop: 2 },
      { f: [16, 19], every: ONCE, shape: 'arc', range: 2.1, ang: 160, dmg: 14, kb: 'blow', force: 8, lift: 3, hitstop: 3 }] },
  // Jump attack: quick alternating cuts in the air
  jatk: { frames: 18, air: true, hover: 2.3, next: 'jatk', charge: 'jc', cancel: 10, dodgeCancel: 99, steer: 3, hand: [[0, 'L'], [9, 'R']],
    hits: [{ f: [4, 7], every: ONCE, shape: 'arc', range: 2.3, ang: 200, dmg: 8, kb: 'flinch', force: 3, hitstop: 1, yMax: 4.5 }] },
  // Jump charge: tucked spin down onto the ground, blades out
  jc: { frames: 50, air: true, hover: 3, landFrame: 32, hang: [6, 26], plunge: [26, -60], cancel: 44, dodgeCancel: 36, steer: 12, armor: true,
    hits: [{ f: [32, 35], every: ONCE, shape: 'circle', range: 3.5, dmg: 18, kb: 'launch', force: 5, lift: 8, hitstop: 6, heavy: true }] },
};

export const AIR_CHAIN_MAX = 12;
prepMoves(MOVES);
