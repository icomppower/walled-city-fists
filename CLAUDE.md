# 城寨拳王 Walled City Fists · Voxel

An original 1970s kung fu musou set in a fictional 1975 九龍城寨 (real place, fictional people). Copied from
`icomppower/hk-freedom-voxel` main (remote `engine`: touch controls, mobile tier, harness, registries, dual-wield rig,
crowd skins, bot), which builds on `icomppower/sheep-village` and `mike007jd/voxel-musou` (MIT; remote `upstream`).
Never touch hk-freedom-voxel, sheep-village, voxel-musou or their Vercel projects. Spec lives in Notion (project page
"城寨拳王 · Walled City Fists — voxel musou" and its child pages: Story Bible, Contracts, Characters & Moveset, Scrolls &
Cutscenes, One-Shot Build Prompt); state of the build is in `PROGRESS.md` — read it first and resume from the first
unfinished stage. `git pull` / `git fetch` are denied on purpose: work in a fresh `gh repo clone`.

## Ground rules

- **Frozen engine** — do not edit: `src/core/`, `src/hero/rig.js`, `src/hero/model.js` (vox mesher, `bodyParts`,
  `buildBody`), `src/hero/secondary.js`, `src/crowd/`, `src/combat/`, `src/post/`, `vendor/`. Exceptions (inherited, each
  its own commit gated on unchanged ch1 hashes): the sheep-village stage-2 hooks (scroll player, dual-wield rig, crowd
  skin + officer hook, bot driver), hk-freedom-voxel's touch hook (`src/ui/touch.js`, one input-injection hook in
  `src/core/input.js`, one quality-tier hook in `src/post/post.js` / `main.js`, `#touch` CSS) and its director hook
  (script api `fire` / `model`).
- **Content lives in new folders only**: `src/chars/<id>/`, `src/chars/officers/kc/`, `src/world/maps/<map>/`,
  `src/world/maps/kckit/`, `src/story/kc1-4.js`, `src/story/kcmap.js`, `src/story/cutscenes/`, `bench/`. Registries /
  README / menus: one-line imports only.
- Sim stays deterministic: `rng` for sim, `vrng` for visuals, fixed 60 Hz. Cutscenes are render-only (vrng).
- Every commit message states measured before → after numbers (hashes, tris, ms, frames).
- **Content rule:** real place, fictional people. No real person depicted or named, no real triad / society names, no
  real brands or shop signs copied. Nothing from 余兒's 《九龍城寨》 novels or the 2024 film 《九龍城寨之圍城》 (characters,
  names, looks, plot). No real police badges or insignia (kc3 police: plain khaki archetype). Original designs only; no
  existing songs. Bosses are beaten, not killed: they kneel and drop the weapon. Keep upstream MIT credit in README.
- Contract ids exactly as the Contracts page: playable `tit` 阿鐵 · `chui` 阿翠; officers `chain` 飛仔 · `blade` 刀手;
  bosses `ox` 鐵牛 · `swallow` 飛燕 · `goldtooth` 金牙探長 · `serpent` 蛇王; crowd skins foe `serpent` · foe `khaki` ·
  ally `resident` · ally `kids`; chapters `kc1`–`kc4`; maps `alleys` `rooftops` `factories` `tower`; zones / gates —
  alleys: `market` `lane` `irongate` `yamen` (gates `ironGate` `yamenDoor`) · rooftops: `aerials` `plank` `tanks` `peak`
  (gates `plankBridge` `tankLocks`) · factories: `fishball` `stairs` `dentists` `boiler` (gates `chainDoor`
  `boilerDoor`) · tower: `lobby` `shaft` `gatehouse` `crown` (gates `gatehouse` `crownStairs`); SPK keys `tit` `chui`
  `chain` `blade` `ox` `swallow` `goldtooth` `serpent` `auntie` `kid` `worker` `uncle`; scroll data `{ MAP, PROLOGUE,
  STAMP, EPILOGUE, ENDING?, TRIBUTE? }`, one ink map `src/story/kcmap.js`, arrow sides `folk` (gold) / `gang` (vermilion).
- 定軍山 `ch1` and 趙雲 / 黃忠 stay registered as the hash gate but show on menus only with `?dev`.
- Ambiguous spec → simplest reading, note it in PROGRESS.md, carry on. A gate still failing after 5 honest attempts →
  BLOCKED with the numbers, move on. Stop and ask only if a gate cannot pass without breaking the frozen-engine rule.

## Harness (`bench/harness/`, Node ≥ 22, `npm install` once for playwright-core)

- `sh bench/verify.sh [--quick]` — every gate in order.
- `npm run gate` — replays every `logs/*.json` in a cold Node process each and compares state hashes (the ch1 gate).
- `node bench/harness/xcheck.mjs <log> 3600` — same log driven through the real page in headless Chrome vs the log's
  Chrome checkpoints. Node and Chrome hashes differ by design (V8 trig rounds differently in the last ulp).
- `npm run record -- --char zhaoyun` — record a scripted log; `record-browser.mjs` records a human session.
- `browser.mjs` serves the repo and patches `main.js` at serve time only: `window.__vm`, `window.__onStep(inp)`.
- Some state carries from one battle to the next inside one page load (upstream behaviour), so a log is only
  reproducible from a cold start — one log per process / page.
- Vercel: production = `main` (git-connected project `walled-city-fists`, team sharkgundams-projects); commits need the
  account email as author (`git config user.email`) or Vercel blocks the deploy.
- Screenshots / GIFs per stage go in `bench/shots/<stage>/`.
