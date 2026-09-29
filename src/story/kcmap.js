// 城寨 ink map (Scrolls & Cutscenes page): one SVG for every 城寨拳王 scroll (kc1–kc4 prologues + the ENDING), in the
// scroll player's format (story/prologue.js: viewBox 1600×900, [data-id] marks light per card, .pl-arw arrows draw in).
// Sepia paper; the Walled City block seen from above as a dense grid of roofs (the 衙門 courtyard the one open square in
// it), the streets of 九龍城 round it, 啟德's runway reaching into the harbour to the east, jets drawn as arrows on their
// approach. Sides: folk = gold ink, gang = vermilion, jet = grey (index.html .pl-arw.folk / .gang / .jet). Places, people
// and arrows only: no emblems, no gang marks.
import { arrows } from './scrollkit.js';
import { hash01 } from '../core/rng.js';

const ARROWS = [
  ['collect', 'gang', 'M760 330 C720 380 690 430 650 470 M760 330 C800 390 840 430 880 460 M760 330 C760 400 770 470 760 540'],
  ['locks', 'gang', 'M700 560 C740 540 780 540 820 560'],
  ['rise', 'folk', 'M560 690 C600 620 640 560 690 500 C730 450 760 400 780 350'],
  ['march', 'folk', 'M480 700 C560 660 640 620 700 560 C760 500 800 430 820 330'],
  ['kids', 'folk dot', 'M820 300 C800 360 780 420 760 470'],
  ['water', 'folk dot', 'M700 300 C690 380 680 460 670 540'],
  ['jet1', 'jet', 'M120 120 C420 180 760 260 1180 470'],
  ['jet2', 'jet', 'M200 60 C520 130 860 230 1240 440'],
  ['workers', 'folk', 'M880 620 C840 580 800 540 770 500'],
  ['cops', 'gang', 'M1080 700 C1000 680 940 650 900 620'],
  ['dawn', 'folk', 'M400 760 C560 700 700 640 820 560 C900 500 960 420 1000 340'],
];
// the block: a jostling grid of roofs (sepia shades, a few tank dots), the 衙門 courtyard open in the middle
function roofs() {
  let out = '';
  for (let j = 0; j < 22; j++) for (let i = 0; i < 26; i++) {
    const x = 470 + i * 20 + (hash01(j, 3) - 0.5) * 6, y = 250 + j * 20 + (hash01(i, 5) - 0.5) * 6;
    if (Math.hypot(x - 740, y - 470) < 42) continue;                     // the courtyard
    if (Math.hypot((x - 740) / 300, (y - 470) / 240) > 1) continue;       // the block's rough outline
    const s = 14 + hash01(i, j, 7) * 8, c = ['#8a6e4c', '#7a5e40', '#9a7c56', '#6e5438'][Math.floor(hash01(i, j, 9) * 4)];
    out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${s.toFixed(1)}" height="${(s * (0.8 + hash01(j, i, 2) * 0.4)).toFixed(1)}" fill="${c}"/>`;
    if (hash01(i, j, 11) < 0.12) out += `<circle cx="${(x + s / 2).toFixed(1)}" cy="${(y + s / 2).toFixed(1)}" r="3" fill="#3a2a1a"/>`;
  }
  return out;
}
const mark = (id, x, y, name, { sq = 0, sm = false, side = '' } = {}) =>
  `<g class="pl-mark${side ? ' ' + side : ''}" data-id="${id}">${sq ? `<rect x="${x - sq / 2}" y="${y - sq / 2}" width="${sq}" height="${sq}" rx="3"/>` : ''}<text${sm ? ' class="sm"' : ''} x="${x + (sq ? sq / 2 + 10 : 0)}" y="${y + (sq ? 10 : 0)}">${name}</text></g>`;
const HARBOUR = 'M1080 900 C1120 820 1200 760 1300 720 C1400 680 1500 660 1600 650 L1600 900Z';
const RUNWAY = 'M1150 520 L1560 800 L1540 830 L1130 548Z';

export const KC_MAP = `
<svg class="pl-map" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <filter id="pl-grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4"/>
      <feColorMatrix values="0 0 0 0 .32  0 0 0 0 .22  0 0 0 0 .12  0 0 0 .55 -.18"/></filter>
    <filter id="pl-ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="9"/>
      <feDisplacementMap in="SourceGraphic" scale="6"/></filter>
    <filter id="pl-blot"><feGaussianBlur stdDeviation="30"/></filter>
    <filter id="pl-glow"><feGaussianBlur stdDeviation="18"/></filter>
    <radialGradient id="pl-vig" cx="50%" cy="50%" r="72%"><stop offset="55%" stop-color="#3a2410" stop-opacity="0"/>
      <stop offset="100%" stop-color="#2a170a" stop-opacity=".62"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="#d6c49e"/>
  <g filter="url(#pl-blot)" fill="#5e6a64" opacity=".26"><path d="${HARBOUR}"/></g>
  <g filter="url(#pl-ink)">
    <path d="${HARBOUR}" fill="#b8b8a0" stroke="#3a2a1a" stroke-width="4" opacity=".75"/>
    <g stroke="#56615c" stroke-width="3" fill="none" opacity=".35">${[700, 740, 780].map((y, k) => `<path d="M${1220 + k * 60} ${y + 60} q40 -12 80 0 t80 0 t80 0"/>`).join('')}</g>
    <path d="${RUNWAY}" fill="#c9b690" stroke="#3a2a1a" stroke-width="4"/>
    <path d="M1170 530 L1540 800" stroke="#3a2a1a" stroke-width="2" stroke-dasharray="14 12" opacity=".6"/>
    <g stroke="#6a5438" stroke-width="10" fill="none" opacity=".55"><path d="M380 200 L1100 200 M380 760 L1100 760 M400 180 L400 780 M1080 180 L1080 780"/></g>
    <ellipse cx="740" cy="470" rx="306" ry="246" fill="#b89a6c" stroke="#3a2a1a" stroke-width="5" opacity=".95"/>
    <g opacity=".95">${roofs()}</g>
    <circle cx="740" cy="470" r="40" fill="#cdb183" stroke="#3a2a1a" stroke-width="3"/>
  </g>
  <g class="pl-mark" data-id="city" filter="url(#pl-glow)" fill="#e8b84a" opacity=".28"><ellipse cx="740" cy="470" rx="200" ry="150"/></g>
  <g class="pl-mark" data-id="dawnsky" filter="url(#pl-glow)" fill="#f0c860" opacity=".45"><ellipse cx="1000" cy="200" rx="380" ry="90"/></g>
  <g class="pl-mark" data-id="harbour"><text class="river" x="1300" y="820">九 龍 灣</text></g>
  <rect width="1600" height="900" filter="url(#pl-grain)"/>
  <g class="pl-arrows" filter="url(#pl-ink)">${arrows(ARROWS)}</g>
  <g class="pl-labels">
    ${mark('walled', 560, 250, '九龍城寨', { sq: 22 })}${mark('kaitak', 1300, 590, '啟德', { sq: 18 })}
    ${mark('market', 500, 700, '街市', { sq: 16, sm: true })}${mark('lane', 640, 560, '窄巷', { sm: true })}
    ${mark('irongate', 690, 520, '鐵閘', { sq: 12, sm: true })}${mark('yamen', 740, 474, '衙門', { sq: 16, sm: true })}
    ${mark('rooftops', 760, 300, '天台', { sq: 14, sm: true })}${mark('factories', 880, 620, '工場', { sq: 14, sm: true })}
    ${mark('tower', 830, 360, '蛇王樓', { sq: 18, sm: true })}${mark('tanks', 660, 330, '水缸', { sq: 12, sm: true })}
    ${mark('tit', 470, 740, '阿鐵', { sm: true, side: 'folk' })}${mark('chui', 860, 270, '阿翠', { sm: true, side: 'folk' })}
    ${mark('folk', 420, 800, '街坊', { sm: true, side: 'folk' })}${mark('kids', 900, 240, '細路', { sm: true, side: 'folk' })}
    ${mark('workers', 940, 660, '工人', { sm: true, side: 'folk' })}
    ${mark('gang', 780, 300, '黑蛇幫', { sm: true, side: 'gang' })}${mark('ox', 770, 520, '鐵牛', { sm: true, side: 'gang' })}
    ${mark('swallow', 800, 260, '飛燕', { sm: true, side: 'gang' })}${mark('goldtooth', 1100, 720, '金牙探長', { sm: true, side: 'gang' })}
    ${mark('serpent', 860, 390, '蛇王', { sm: true, side: 'gang' })}
  </g>
  <rect width="1600" height="900" fill="url(#pl-vig)"/>
</svg>`;
