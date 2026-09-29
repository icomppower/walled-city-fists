// 自由 Free mode (story lane): an endless arena on any of the four maps — no story beats, reinforcement waves from the
// start, a few gang officers, and optionally a boss (the map's own, or any of the four through ?boss=) run by his chapter
// module (src/chars/officers/kc/bosses.js). Built as a story-mode chapter on the fly and registered in CHAPTERS under
// `free:<map>:<boss|none>` (the director runs its script; it never wins — the hero falls, the result offers 再戰, or the
// pause menu leaves). No prologue, no epilogue text beyond a line, no AFTER scene.
import { CHAPTERS } from './chapters.js';
import { SPK } from './kc1.js';
import { bossScript } from '../chars/officers/kc/bosses.js';
import { MAPS } from '../world/map.js';

export const FREE_MAPS = ['alleys', 'rooftops', 'factories', 'tower'];
export const MAP_BOSS = { alleys: 'ox', rooftops: 'swallow', factories: 'goldtooth', tower: 'serpent' };
export const BOSSES = {
  ox: { name: { zh: '鐵牛', en: 'IRON OX' }, hp: 1300 }, swallow: { name: { zh: '飛燕', en: 'SWALLOW' }, hp: 1300 },
  goldtooth: { name: { zh: '金牙探長', en: 'GOLD-TOOTH' }, hp: 1560 }, serpent: { name: { zh: '蛇王', en: 'SERPENT KING' }, hp: 2340 },
};
const MAP_NAME = { alleys: { zh: '巷戰', en: 'THE ALLEYS' }, rooftops: { zh: '天台', en: 'THE ROOFTOPS' }, factories: { zh: '工場', en: 'THE FACTORIES' }, tower: { zh: '蛇王樓', en: 'THE SERPENT TOWER' } };

/** The free chapter for (map, boss | null): registered once, returned by id. */
export function freeChapter(map = 'alleys', boss = null) {
  if (!FREE_MAPS.includes(map)) map = 'alleys';
  if (boss && !BOSSES[boss]) boss = null;
  const id = `free:${map}:${boss || 'none'}`;
  if (CHAPTERS[id]) return CHAPTERS[id];
  const M = MAPS[map], [sx, sz] = [M.spawn.free.x, M.spawn.free.z], at = (dx, dz) => [sx + dx, sz + dz];
  const OFF = { chain: { name: { zh: '飛仔', en: 'CHAIN' }, hp: 520, model: 'chain' }, blade: { name: { zh: '刀手', en: 'BLADE' }, hp: 520, model: 'blade' } };
  if (boss) OFF[boss] = { ...BOSSES[boss], boss: true, model: boss };
  const BEATS = [
    { when: { wait: 20 }, waves: true, morale: 0.1, obj: { zh: '自由演武', en: 'Free battle · endless waves' },
      squads: [{ at: at(-8, 10), n: 20 }, { at: at(8, 12), n: 20 }, { at: at(0, 16), n: 24 }, { at: at(-10, -6), n: 16 }, { at: at(10, -4), n: 16 }],
      officers: { chain: { at: at(-6, 12), engaged: false }, blade: { at: at(6, 14), engaged: false } } },
  ];
  if (boss) BEATS.push(
    { when: { wait: 8 * 60 }, officers: { [boss]: { at: at(0, 10), engaged: true } }, banner: { html: `<em>${BOSSES[boss].name.zh}</em>`, en: BOSSES[boss].name.en, dur: 160, big: true }, obj: { zh: `擊破 ${BOSSES[boss].name.zh}`, en: `Defeat ${BOSSES[boss].name.en}`, go: boss } },
    { when: { down: boss }, banner: { html: `<em>${BOSSES[boss].name.zh}</em>擊破`, en: `${BOSSES[boss].name.en} down`, dur: 180 }, obj: { zh: '自由演武', en: 'Free battle · endless waves' } },
  );
  const script = boss ? (() => {
    const make = bossScript(boss, { calls: [at(-8, 6), at(8, 6)] });
    return (game, api) => { const b = make(game, api); return { fx: b.fx, step() { b.fx.now = api.t(); b.step(); } }; };
  })() : (game, api) => { const fx = { now: 0 }; return { fx, step() { fx.now = api.t(); } }; };
  const skin = map === 'factories' ? { foe: 'khaki', ally: 'resident' } : { foe: 'serpent', ally: 'resident' };
  const C = CHAPTERS[id] = {
    id, free: true, map, cast: ['tit', 'chui'], SPK, OFF, BEATS, script, skin,
    title: { small: '自由', zh: MAP_NAME[map].zh, en: `FREE BATTLE · ${MAP_NAME[map].en}` },
    sides: { us: '坊', them: map === 'factories' ? '差' : '蛇', names: { us: { zh: '街坊', en: 'Residents' }, them: { zh: '黑蛇幫', en: 'Black Serpent' } } },
    allies: [{ ...M.freeAllies, hold: true }],
    EPILOGUE: { zh: ['自由演武，無窮無盡。'], en: ['Free battle: the waves never stop.'] },
    DEFEAT: { zh: '{name}倒下了⋯⋯再嚟過。', en: '{name} goes down... go again.' },
  };
  return C;
}
