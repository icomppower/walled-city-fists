// Generated audio (made by hand in Google AI Studio: Lyria music, Gemini TTS voices), dropped into audio-in/ and
// normalised into media/audio/ by bench/audio/ingest.mjs, which also writes media/audio/index.json:
//   { music: { slot: file }, vo: { key: file }, shout: { tit|chui: { light: [file], heavy: [file] } } }
// Music slots: title, scroll, alleys, rooftops, factories, tower, boss, between1-3, end, win, lose. Voice keys: voKey(zh)
// of each line (bench/audio/lines.json). A slot without a file keeps the procedural sound (kcbank.js / bank.js).
// Buffers decode lazily, once; a failed load warns and falls back.
export const voKey = (zh) => {                                   // FNV-1a of the line's Cantonese text → 6 hex digits
  let h = 0x811c9dc5;
  for (const ch of zh) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return (h >>> 8).toString(16).padStart(6, '0');
};

export function createAssets(ctx, base = 'media/audio/') {
  let idx = { music: {}, vo: {}, shout: {} };
  const cache = new Map();
  const ready = fetch(base + 'index.json').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j) idx = { ...idx, ...j }; }, () => {});
  const load = (file) => {
    if (!cache.has(file)) cache.set(file, fetch(base + file).then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then((b) => ctx.decodeAudioData(b)).catch((e) => { console.warn('audio file', file, e.message || e); return null; }));
    return cache.get(file);
  };
  return {
    ready,
    get index() { return idx; },
    music: (slot) => (idx.music[slot] ? load(idx.music[slot]) : null),
    hasMusic: (slot) => !!idx.music[slot],
    vo: (zh) => { const f = zh && idx.vo[voKey(zh)]; return f ? load(f) : null; },
    shouts: (char) => { const s = idx.shout[char]; return s ? Promise.all(['light', 'heavy'].map((k) => Promise.all((s[k] || []).map(load)).then((a) => a.filter(Boolean)))) : null; },
    load,
  };
}
