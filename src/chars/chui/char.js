// 阿翠 Ah Chui — character entry (contract: src/chars/index.js): the seamstress of the third-floor workshop who teaches
// 詠春 to the kids on the roof at dawn; fights with 八斬刀 butterfly swords and chain punches. Text: Story Bible.
import { CHUI_KIT } from './kit.js';

// 20×20 portrait: black bob with a straight fringe, a red thread tie at one side, teal mandarin-collar jacket with gold
// trim, a thimble on a cord
const FACE = [
  '....................',
  '......HHHHHHHH......',
  '....HHHHHHHHHHHH....',
  '...HHHHHHHHHHHHHH...',
  '...HHHHHHHHHHHHHHrr.',
  '...HHHHHHHHHHHHHHr..',
  '...HHSSSSSSSSSSHHr..',
  '...HHSkkSSSSkkSHH...',
  '...HHSEESSSSEESHH...',
  '...HHSSSSSSSSSSHH...',
  '...HHSSSSSsSSSSHH...',
  '...HHSSSSSSSSSSHH...',
  '...HHHSSSSMMSSSHH...',
  '....HH.SSSSSSSS.HH..',
  '.......TTSSSSTT.....',
  '...JJJJTgTTTTgTJJJ..',
  '..JJJJJJJJoJJJJJJJ..',
  '.JJJJJJgJJJJgJJJJJJ.',
  'JJJJJJJJJgJJJJJJJJJJ',
  'JJJJJJJJJJgJJJJJJJJJ',
];
const PAL = { H: '#141414', r: '#c0282a', S: '#f1c27d', s: '#d8a468', k: '#2a1a14', E: '#1a1214', M: '#b8645a',
  T: '#1f6e6b', J: '#1f6e6b', g: '#e8c35a', o: '#d0d4da' };

export const CHUI = {
  id: 'chui',
  name: { zh: '阿翠', en: 'Ah Chui' }, courtesy: { zh: '裁縫', en: 'the seamstress', label: '手作' }, seal: '翠',
  title: { zh: '天台詠春', en: 'The Seamstress' }, motto: '一針一線 · 一拳一腳 · 八斬雙刀',
  weapon: { zh: '八斬刀', en: 'Butterfly Swords' },
  bio: {
    zh: ['喺三樓車衣工場做嘢，朝早喺天台教細路詠春。', '一對八斬刀收埋喺布料底，出手快過車衣針。'],
    en: ['She sews in a third-floor workshop and teaches Wing Chun to the kids on the roof at dawn.',
      'A pair of butterfly swords hides under the cloth, faster than her sewing needle.'],
  },
  stats: { atk: 3, def: 3, speed: 5, range: 2 }, musou: { zh: '八斬連環', en: 'Eight Cuts' }, accent: '#3fb8a8',
  faction: { zh: '街坊', en: 'Kowloon Walled City, 1975' },
  lines: {
    intro: { zh: '一針一線，一拳一腳。', en: 'Stitch by stitch, punch by punch.' },
    musouEnd: { zh: '八斬連環！收線！', en: 'Eight cuts! Tie off the thread!' },
    copy: ['八斬雙刀', '連環日字'],
  },
  portrait: { face: FACE, pal: PAL },
  kit: CHUI_KIT,
};
