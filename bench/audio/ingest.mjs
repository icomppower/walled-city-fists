// AI Studio downloads → the game's audio files. Drop the files into audio-in/ (gitignored) named as the sheet says:
//   music-<slot>.<ext>                 slot: title scroll alleys rooftops factories tower boss between1 between2 between3 end win lose
//   vo-<key>.<ext>                     key: bench/audio/lines.json (one Gemini TTS take per line)
//   shout-<tit|chui>-<light|heavy>-<n>.<ext>
// Each is trimmed (leading / trailing silence; not music), loudness-normalised (music −16 LUFS, voice −16 LUFS, shouts to
// a −3 dBFS peak), encoded to MP3 in media/audio/{music,vo,shout}/, then media/audio/index.json is rebuilt from what is
// there. Prints what is still missing. Needs ffmpeg.   node bench/audio/ingest.mjs [--force]
import { readdirSync, mkdirSync, existsSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
const root = new URL('../../', import.meta.url).pathname, IN = root + 'audio-in/', OUT = root + 'media/audio/';
const SLOTS = ['title', 'scroll', 'alleys', 'rooftops', 'factories', 'tower', 'boss', 'between1', 'between2', 'between3', 'end', 'win', 'lose'];
const LINES = JSON.parse(readFileSync(root + 'bench/audio/lines.json', 'utf8'));
const force = process.argv.includes('--force');
for (const d of ['music', 'vo', 'shout']) mkdirSync(OUT + d, { recursive: true });
const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-nostats', '-y', ...args], { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const maxDb = (f) => {                                          // volumedetect reports on stderr
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', f, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  return +(/max_volume: (-?[\d.]+) dB/.exec(r) || [0, 0])[1];
};
const TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse';
let made = 0, bad = [];
const files = existsSync(IN) ? readdirSync(IN).filter((f) => !f.startsWith('.')) : [];
for (const f of files) {
  const m = /^(music|vo|shout)-(.+)\.(wav|mp3|m4a|aac|ogg|flac|opus|webm)$/i.exec(f);
  if (!m) { bad.push(f + ' (name)'); continue; }
  const [, kind, name] = m, src = IN + f, dst = `${OUT}${kind}/${name}.mp3`;
  if (kind === 'music' && !SLOTS.includes(name)) { bad.push(f + ' (unknown slot)'); continue; }
  if (kind === 'vo' && !LINES.some((l) => l.key === name)) { bad.push(f + ' (unknown line key)'); continue; }
  if (kind === 'shout' && !/^(tit|chui)-(light|heavy)-\d+$/.test(name)) { bad.push(f + ' (shout name)'); continue; }
  if (!force && existsSync(dst) && statSync(dst).mtimeMs > statSync(src).mtimeMs) continue;
  if (kind === 'music') ff(['-i', src, '-af', 'loudnorm=I=-16:TP=-2:LRA=11', '-ar', '44100', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '160k', dst]);
  else if (kind === 'vo') ff(['-i', src, '-af', `${TRIM},loudnorm=I=-16:TP=-2:LRA=7`, '-ar', '44100', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '96k', dst]);
  else {
    const tmp = OUT + 'shout/.tmp.wav'; ff(['-i', src, '-af', TRIM, '-ac', '1', '-ar', '44100', tmp]);
    ff(['-i', tmp, '-af', `volume=${(-3 - maxDb(tmp)).toFixed(2)}dB`, '-c:a', 'libmp3lame', '-b:a', '96k', dst]);
    execFileSync('rm', [tmp]);
  }
  made++;
}
// index from what is in media/audio
const idx = { music: {}, vo: {}, shout: {} };
for (const f of readdirSync(OUT + 'music')) if (f.endsWith('.mp3')) idx.music[f.slice(0, -4)] = 'music/' + f;
for (const f of readdirSync(OUT + 'vo')) if (f.endsWith('.mp3')) idx.vo[f.slice(0, -4)] = 'vo/' + f;
for (const f of readdirSync(OUT + 'shout').sort()) {
  const m = /^(tit|chui)-(light|heavy)-\d+\.mp3$/.exec(f); if (!m) continue;
  ((idx.shout[m[1]] ||= { light: [], heavy: [] })[m[2]]).push('shout/' + f);
}
writeFileSync(OUT + 'index.json', JSON.stringify(idx, null, 1) + '\n');
const miss = { music: SLOTS.filter((s) => !idx.music[s]), vo: LINES.filter((l) => !idx.vo[l.key]).length };
console.log(`ingested ${made} file(s); index: ${Object.keys(idx.music).length}/${SLOTS.length} music, ${Object.keys(idx.vo).length}/${LINES.length} lines, shouts ${Object.entries(idx.shout).map(([c, s]) => `${c} ${s.light.length}+${s.heavy.length}`).join(' ') || 'none'}`);
if (miss.music.length) console.log('music still synth:', miss.music.join(' '));
if (bad.length) { console.log('skipped:', bad.join(', ')); process.exitCode = 1; }
