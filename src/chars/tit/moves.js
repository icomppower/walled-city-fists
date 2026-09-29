// 阿鐵 Ah Tit — 扁擔 carrying-pole + 洪拳 moveset (data only; format: src/hero/moves.js header). Heavy: long reach, wide
// sweeps, slow beats. All timings in 60 Hz sim frames.
//
// Frame data (Notion "Characters & Moveset"): N1 扁擔直戳 30 f hit 11–14 line 2.4 push · N2 橫掃 36 f 13–18 arc 220° 2.4
// blow · N3 虎爪 32 f 12–15 arc 110° 1.8 push · C1 扁擔轉 54 f 20–26 arc 300° 2.8 blow. N-string onsets 24–28 f apart;
// onset spacing = cancel_k + tell_k+1 − tell_k: n1 11 → n2 36 → n3 61 → n4 86 → n5 112 → n6 138 (25–26 apart).
// Feel notes: C2 pole-vault kick · C3 tiger-claw grab + throw (pull: a push with negative force drags the ring in, then
// the throw) · C4 crane-stance leap · C5 pole spin · C6 ground slam.
import { prepMoves } from '../../hero/moveset.js';

const ONCE = 99;
export const MOVES = {
  // N1 扁擔直戳 pole thrust: step in, both hands drive the flat pole straight out
  n1: { frames: 30, next: 'n2', charge: 'c2', cancel: 23, branch: 16, dodgeCancel: 15, steer: 5, lunge: [[4, 12, 0.5]],
    hits: [{ f: [11, 14], every: ONCE, shape: 'line', len: 2.4, width: 1.1, dmg: 15, kb: 'push', force: 5, hitstop: 3 }] },
  // N2 橫掃 wide sweep: the pole swings right → left at waist height, the whole body turning into it
  n2: { frames: 36, next: 'n3', charge: 'c3', cancel: 26, branch: 20, dodgeCancel: 19, steer: 4, lunge: [[6, 14, 0.35]],
    hits: [{ f: [13, 18], sweep: 1, shape: 'arc', range: 2.4, ang: 220, dmg: 17, kb: 'blow', force: 7, lift: 2, hitstop: 3 }] },
  // N3 虎爪 tiger claw: the pole tucked under the left arm, the right hand rakes forward
  n3: { frames: 32, next: 'n4', charge: 'c4', cancel: 25, branch: 17, dodgeCancel: 16, steer: 5, lunge: [[5, 13, 0.45]],
    hits: [{ f: [12, 15], every: ONCE, shape: 'arc', range: 1.8, ang: 110, dmg: 16, kb: 'push', force: 5, hitstop: 4 }] },
  // N4 overhead chop: pole up over the head, down two-handed in front
  n4: { frames: 36, next: 'n5', charge: 'c5', cancel: 25, branch: 18, dodgeCancel: 18, steer: 6, lunge: [[4, 12, 0.45]],
    hits: [{ f: [13, 16], every: ONCE, shape: 'arc', range: 2.5, ang: 100, dmg: 19, kb: 'push', force: 6, hitstop: 4 }] },
  // N5 backhand sweep: pole chambered at the right hip, ripped left → right
  n5: { frames: 38, next: 'n6', charge: 'c6', cancel: 26, branch: 20, dodgeCancel: 20, steer: 4, lunge: [[4, 12, 0.4]],
    hits: [{ f: [13, 18], sweep: -1, shape: 'arc', range: 2.5, ang: 220, dir: -20, dmg: 18, kb: 'blow', force: 8, lift: 3, hitstop: 3 }] },
  // N6 horse-stance double palm: the pole planted, both palms driven out (洪拳 伏虎)
  n6: { frames: 50, next: 'n1', charge: 'c1', cancel: 40, dodgeCancel: 22, steer: 6, lunge: [[2, 12, 0.7]], armor: true,
    hits: [{ f: [14, 19], every: ONCE, shape: 'arc', range: 2.4, ang: 140, dmg: 28, kb: 'blow', force: 12, lift: 5, hitstop: 7, heavy: true }] },

  // C1 扁擔轉 pole turn: a 300° sweep at arm's length, the pole carried round the front and both flanks
  c1: { frames: 54, cancel: 48, dodgeCancel: 34, steer: 12, lunge: [[8, 26, 0.8]], armor: true,
    hits: [{ f: [20, 26], sweep: 1, sweepN: 6, shape: 'arc', range: 2.8, ang: 300, dmg: 22, kb: 'blow', force: 10, lift: 4, hitstop: 5, heavy: true }] },
  // C2 (N1 → C) pole-vault kick: plants the pole ahead, vaults up the shaft and kicks through the front rank
  c2: { frames: 56, cancel: 50, dodgeCancel: 34, steer: 12, lunge: [[10, 30, 2.0]], armor: true, leap: [12, 7], landFrame: 34,
    hits: [{ f: [22, 27], every: 3, shape: 'line', len: 3, width: 1.6, dmg: 15, kb: 'blow', force: 9, lift: 3, hitstop: 4, yMax: 3, heavy: true }] },
  // C3 (N2 → C) tiger-claw grab + throw: the claw hooks the front rank in (pull), then the hip throw flings them out
  c3: { frames: 62, cancel: 54, dodgeCancel: 44, steer: 12, lunge: [[4, 14, 0.6]], armor: true,
    hits: [{ f: [14, 17], every: ONCE, shape: 'arc', range: 2.6, ang: 120, dmg: 8, kb: 'push', force: -4, hitstop: 5 },
      { f: [32, 36], every: ONCE, shape: 'arc', range: 2.2, ang: 200, dmg: 24, kb: 'blow', force: 12, lift: 6, hitstop: 6, heavy: true }] },
  // C4 (N3 → C) crane-stance leap: up on one leg, arms spread as wings, a leaping kick down into the ring
  c4: { frames: 66, cancel: 58, dodgeCancel: 48, steer: 12, lunge: [[16, 34, 2.4]], armor: true, leap: [16, 6], landFrame: 36,
    hits: [{ f: [36, 40], every: ONCE, shape: 'circle', range: 3.2, dmg: 24, kb: 'launch', force: 4, lift: 9, hitstop: 6, heavy: true, yMax: 2.5 }] },
  // C5 (N4 → C) pole spin: the pole whirled overhead then round the body, the ring staggered, the last turn knocks it out
  c5: { frames: 76, cancel: 68, dodgeCancel: 56, steer: 10, lunge: [[6, 50, 1.0]], armor: true,
    hits: [{ f: [12, 48], shape: 'circle', range: 3.0, dmg: 6, kb: 'flinch', force: 1, hitstop: 1, every: 9 },
      { f: [54, 58], every: ONCE, shape: 'circle', range: 3.6, dmg: 26, kb: 'blow', force: 13, lift: 5, hitstop: 7, heavy: true }] },
  // C6 (N5 → C) ground slam: pole raised high, brought down two-handed; a shockwave ring bursts out of the impact
  c6: { frames: 80, cancel: 72, dodgeCancel: 56, steer: 14, lunge: [[4, 14, 0.5]], armor: true,
    hits: [{ f: [24, 27], every: ONCE, shape: 'arc', range: 2.8, ang: 90, dmg: 18, kb: 'push', force: 6, hitstop: 4 },
      { f: [36, 39], every: ONCE, shape: 'circle', range: 4.8, dmg: 30, kb: 'launch', force: 5, lift: 9, hitstop: 8, heavy: true }] },

  // Dash attack (run + attack): running low sweep, a step of drift after it
  dash: { frames: 56, cancel: 48, dodgeCancel: 28, steer: 3, lunge: [[0, 22, 4.4, 'lin'], [22, 32, 1.2]],
    hits: [{ f: [18, 24], sweep: 1, shape: 'arc', range: 2.9, ang: 200, dmg: 18, kb: 'blow', force: 10, lift: 3, hitstop: 4, heavy: true }] },
  // Jump attack: a pole swipe every 12 sf while hovering
  jatk: { frames: 24, air: true, hover: 2.4, next: 'jatk', charge: 'jc', cancel: 12, dodgeCancel: 99, steer: 3,
    hits: [{ f: [6, 10], every: ONCE, shape: 'arc', range: 3.0, ang: 200, dmg: 12, kb: 'flinch', force: 3, hitstop: 2, yMax: 4.5 }] },
  // Jump charge: pole raised at the apex, plunge, the pole slams the ground, shockwave
  jc: { frames: 56, air: true, hover: 3, landFrame: 36, hang: [6, 30], plunge: [30, -60], cancel: 50, dodgeCancel: 40, steer: 12, armor: true,
    hits: [{ f: [36, 39], every: ONCE, shape: 'circle', range: 4.2, dmg: 22, kb: 'launch', force: 5, lift: 8, hitstop: 7, heavy: true }] },
};

export const AIR_CHAIN_MAX = 8;
prepMoves(MOVES);
