// Every spoken line of 城寨拳王 → bench/audio/lines.json (the AI Studio generation sheet's data): battle dialogue (the
// chapters' beats, nags and script api.say calls, hero branches resolved per playable), cutscene subtitles and the
// playables' intro / Musou lines. Each line's file is vo-<key>.wav, key = voKey(zh) (src/audio/kcassets.js).
//   node --import ./bench/harness/register.mjs bench/audio/lines.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { voKey } from '../../src/audio/kcassets.js';
import { CUTSCENES } from '../../src/story/cutscenes/data.js';
import { CHARS } from '../../src/chars/index.js';
const root = new URL('../../', import.meta.url);
const out = new Map();
const add = (who, zh, en, where) => { if (!zh || out.has(zh)) return; out.set(zh, { key: voKey(zh), who, zh, en, where }); };
function walk(o, where, seen = new Set()) {
  if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
  if (typeof o.who === 'string') {
    if (typeof o.zh === 'string') add(o.who, o.zh, o.en, where);
    for (const c of ['tit', 'chui']) if (Array.isArray(o[c])) add(c, o[c][0], o[c][1], where);
  }
  for (const v of Object.values(o)) walk(v, where, seen);
}
for (const ch of ['kc1', 'kc2', 'kc3', 'kc4']) {
  const m = await import(`../../src/story/${ch}.js`);
  for (const [k, v] of Object.entries(m)) if (!['PROLOGUE', 'EPILOGUE', 'ENDING', 'TRIBUTE', 'STAMP', 'DEFEAT', 'SPK', 'MAP'].includes(k)) walk(v, ch);
  // lines built inside script functions: api.say({ who, zh, en }) / { who: '…', zh: '…', en: '…' } literals
  const src = readFileSync(new URL(`src/story/${ch}.js`, root), 'utf8');
  for (const r of src.matchAll(/who:\s*'(\w+)',\s*zh:\s*'([^']+)',\s*en:\s*'((?:[^'\\]|\\.)*)'/g)) add(r[1], r[2], r[3].replace(/\\'/g, "'"), ch);
}
for (const S of Object.values(CUTSCENES)) for (const sh of S.shots) for (const s of sh.sub || []) add(s.who, s.zh, s.en, S.id);
for (const c of ['tit', 'chui']) for (const k of ['intro', 'musouEnd']) add(c, CHARS[c].lines[k].zh, CHARS[c].lines[k].en, k);
const list = [...out.values()];
if (new Set(list.map((l) => l.key)).size !== list.length) throw new Error('voKey collision');
writeFileSync(new URL('bench/audio/lines.json', root), JSON.stringify(list, null, 1) + '\n');
const by = {}; for (const l of list) by[l.who] = (by[l.who] || 0) + 1;
console.log(`${list.length} lines`, by);
