// 阿鐵 Ah Tit — character entry (contract: src/chars/index.js): the cook who runs the 大牌檔 at the market gate. Big, slow
// to anger, 洪拳 trained; fights with his 扁擔 carrying pole and tiger-crane fists. Text: Story Bible (粵語 + English).
import { TIT_KIT } from './kit.js';

// 20×20 portrait: shaved stubble head, thick brows (a scar through the left one), broad jaw, cream towel round the neck,
// white vest over broad shoulders
const FACE = [
  '....................',
  '......hhhhhhhh......',
  '....hhhhhhhhhhhh....',
  '...hhhhhhhhhhhhhh...',
  '...hhhhhhhhhhhhhh...',
  '...SSSSSSSSSSSSSS...',
  '..SBBBBSSSSxBBBBS...',
  '..SSSSSSSSSSxSSSS...',
  '..SSEESSSSSSEESSS...',
  '..SSSSSSSSSSSSSSS...',
  '..sSSSSSSsSSSSSSs...',
  '..sSSSSSSsSSSSSSs...',
  '..ssSSSSSSSSSSSss...',
  '...ssSSMMMMMSSss....',
  '...ssssSSSSSSsss....',
  '....TTTTTTTTTTTT....',
  '..TTtTTTTTTTTTtTT...',
  '.SSSWWWWWWWWWWWSSS..',
  'SSSSWWWWWWWWWWWSSSS.',
  'SSSSWWWWwWWWWWWSSSS.',
];
const PAL = { h: '#2a2622', S: '#d9a066', s: '#b98552', B: '#1c1612', x: '#e8c2a0', E: '#1a1210', M: '#7a3e2c',
  T: '#e7d9b0', t: '#bfae84', W: '#f2eee4', w: '#d6d0c2' };

export const TIT = {
  id: 'tit',
  name: { zh: '阿鐵', en: 'Ah Tit' }, courtesy: { zh: '大牌檔', en: 'the cook', label: '開檔' }, seal: '鐵',
  title: { zh: '大牌檔拳師', en: 'The Cook' }, motto: '食飽飯 · 先有力打 · 洪拳扁擔',
  weapon: { zh: '扁擔', en: 'Carrying Pole' },
  bio: {
    zh: ['喺城寨街市口開大牌檔，粗身大隻，好難激嬲。', '練過洪拳，一條扁擔擔得起兩桶湯，都打得開一條巷。'],
    en: ['He runs the street stall at the market gate. Big, and slow to anger.',
      'Hung Gar trained: the carrying pole that hauls two pots of soup can clear an alley too.'],
  },
  stats: { atk: 5, def: 4, speed: 2, range: 4 }, musou: { zh: '虎鶴雙形', en: 'Tiger & Crane' }, accent: '#e0b040',
  faction: { zh: '街坊', en: 'Kowloon Walled City, 1975' },
  lines: {
    intro: { zh: '食飽飯先有力打。', en: 'Eat first. Then we fight.' },
    musouEnd: { zh: '虎鶴雙形！收檔！', en: 'Tiger and crane! We\'re closed!' },
    copy: ['虎爪鶴翼', '一擔千斤'],
  },
  portrait: { face: FACE, pal: PAL },
  kit: TIT_KIT,
};
