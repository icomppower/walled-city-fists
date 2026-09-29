// Render every synth score track to WAV (bench/out/score/<slot>.wav) for listening.   node bench/harness/score-preview.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { openGame } from './browser.mjs';
const out = new URL('../out/score/', import.meta.url).pathname; mkdirSync(out, { recursive: true });
const g = await openGame({}), P = g.page;
const slots = await P.evaluate(async () => (await import('/src/audio/kcscore.js')).SLOTS);
for (const k of slots) {
  const b64 = await P.evaluate(async (k) => {
    const b = await (await import('/src/audio/kcscore.js')).bakeSong(k), n = b.length, L = b.getChannelData(0), R = b.getChannelData(1);
    const buf = new ArrayBuffer(44 + n * 4), v = new DataView(buf), w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
    v.setUint32(24, b.sampleRate, true); v.setUint32(28, b.sampleRate * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 4, true);
    for (let i = 0; i < n; i++) { v.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); v.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
    let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s);
  }, k);
  writeFileSync(out + k + '.wav', Buffer.from(b64, 'base64')); console.log(k);
}
await g.close();
