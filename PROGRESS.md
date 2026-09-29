# PROGRESS

One-shot build of 城寨拳王 Walled City Fists (Notion: "One-Shot Build Prompt — 城寨拳王"). Resume from the first stage
not `done`.

| Stage | Status | Gate numbers |
|---|---|---|
| 0 Fork + strip | done | copy of hk-freedom-voxel `3797d28`; HK chars / chapters / maps / skins / story deleted (−54 files); Node 6/6 logs identical (finals 90a1a382 64989ea8 6c41979e 2c32ffdc 6a95e25b b7fe682c = base); rig 54/54, dual PASS; bot WIN ch1 zhaoyun 普通 (4:41, S); Chrome: title 城寨 拳王 / WALLED CITY FISTS, menu 操作說明 only (故事 / 自由 with ?dev), no base-game text, 0 errors; ch1 scroll 6/6, crowd 94/94, checkpoints 6/6 × 2; touch twin 7/7, touch UI 13/13 |
| 0 Vercel | done | project `walled-city-fists` (sharkgundams-projects), git-connected to icomppower/walled-city-fists: production = main, previews per branch; first git deploy (`23754d4`) READY in 5 s; https://walled-city-fists.vercel.app 200, title screen, 0 console errors (remote smoke) |
| 1 阿鐵 tit | done | gates 6/6 (moves 15/15, onsets = frame table: n1 11 · n2 13 · n3 12 · c1 20; N-string live gaps 25 25 26 25 27 sf; pole ≥ 0.23 m above ground; feet slide ≤ 0.95 cm; Musou 39/40 of a packed ring); Musou at 600 enemies p95 16.8 ms (= Zhao Yun 16.8, 60 fps); model critic 2 rounds → P1 0 (r1: brows 1 voxel tall — the face box stopped under the top brow row; mouth too red → P2 fixed); bot WIN ch1 (?dev) × steady 5:55 / rush 6:56 / back 7:13, rank S; title tag 阿鐵, 0 errors |
| 2 阿翠 chui | done | gates 6/6 (moves 15/15, onsets = frame table: n1 7 · n2 7 · n3 11 · c1 12/22/32/41; N-string live gaps 17 18 18 18 18 sf; dash cancels on N3 (f15) / N5 (f11); blades ≥ 0.41 m above ground; feet ≤ 0.69 cm; Musou 39/40); C3 chain punches 10 hits; Musou at 600 enemies p95 16.7 ms (= Zhao Yun); model critic 2 rounds → P1 0 (r1: the mandarin collar read as a gold box frame; the jacket back read as stripes → subtle folds; P2 thimble hidden → bigger, silver); bot WIN ch1 (?dev) × steady 7:48 / rush 7:51 / back 6:48, rank S; title tags 阿鐵 · 阿翠 |
| 3 Enemy side | done | skins serpent / khaki / resident / kids, officers chain / blade, bosses ox / swallow / goldtooth / serpent (src/chars/officers/kc/); boss gate 4/4 as tit and 4/4 as chui — phase HP on its first frame (tit / chui): ox 59.77 / 59.77 · 24.80 / 24.85 %, swallow 49.80 / 49.80 · 24.72 / 24.80 %, goldtooth 49.80 / 49.80 · 24.80 / 24.86 %, serpent 74.80 / 74.91 · 49.80 / 49.80 · 24.67 / 24.97 %; banners on the phase frame; behaviours: ox charges + ≥ 3 slams, swallow knives + roof-to-roof leaps + knife rain, goldtooth revolver bursts + 2 khaki squads + power cut, serpent N1 / N2 / C1 + 2 elites + rain / neon + P4 leap slams; KO → win, kneels, weapon on the ground (guandao snapped); lineup critic 3 rounds → P1 0 (r1: 蛇王 / 飛燕 had no eyes — face paint missed the 0.026 m voxel centres; r2: the KO'd raised hand held the revolver / knife fan → holster + bandolier); content: no badges, insignia, real gang names or text |
| 4 kc1 alleys | pending | |
| 5 kc2 rooftops | pending | |
| 6 kc3 factories | pending | |
| 7 kc4 tower + ENDING | pending | |
| 8 Cutscenes | pending | |
| 8b Modes (故事 / 自由 / 影院) | pending | |
| 9 Sound | pending | |
| 10 Critic rounds | pending | |
| 11 Ship | pending | |

**Next action:** stage 4 kc1 alleys.

**Live:** https://walled-city-fists.vercel.app

## Contract ids (Contracts page)

- playable `tit` 阿鐵 · `chui` 阿翠 · officers `chain` 飛仔 · `blade` 刀手 · bosses `ox` 鐵牛 · `swallow` 飛燕 ·
  `goldtooth` 金牙探長 · `serpent` 蛇王
- crowd skins: foe `serpent` `khaki` · ally `resident` `kids`
- chapters `kc1`–`kc4` · maps `alleys` `rooftops` `factories` `tower`
- zones — alleys: `market` `lane` `irongate` `yamen` (gates `ironGate` `yamenDoor`) · rooftops: `aerials` `plank`
  `tanks` `peak` (gates `plankBridge` `tankLocks`) · factories: `fishball` `stairs` `dentists` `boiler` (gates
  `chainDoor` `boilerDoor`) · tower: `lobby` `shaft` `gatehouse` `crown` (gates `gatehouse` `crownStairs`)
- SPK keys `tit` `chui` `chain` `blade` `ox` `swallow` `goldtooth` `serpent` `auntie` `kid` `worker` `uncle`

## Decisions / notes

- Remotes: `origin` = icomppower/walled-city-fists, `engine` = icomppower/hk-freedom-voxel, `upstream` =
  mike007jd/voxel-musou. Git history of the base kept (the copy is a fork); local user.email = the account email
  (Vercel matches commit authors to the team).
- Until 阿鐵 / 阿翠 exist the title key art uses the 定軍山 pair as unnamed stand-ins (tags hidden, banners 城 / 寨);
  故事模式 / 自由演武 show only once a non-dev officer is registered (base behaviour). Default boot map is `dingjun` until
  `alleys` exists. ui-flow / result-fit / phone-flow / scroll-flow gates left verify.sh with the content they tested;
  they come back with kc1.
- Scroll gate: the pixel-hash refs in scroll-refs.json flake on one card per run without the local reference PNGs
  (bench/harness/ref/, gitignored); with them the per-pixel diff (> 6 / channel) is stable 6/6 (5 runs). The ch1 refs were
  copied from the hk-freedom-voxel clone.
- Generic helpers from the deleted HK content (officer head / body builder, boss phase floor, followers, props kit) come
  back as new kc files where the stages need them (git history keeps the originals).
- 阿鐵 C3 grab + throw: the engine has no 'pull' reaction; the grab is a `push` with negative force (drags the ring in
  toward him), then the throw is a heavy `blow` — content only. N6 (not in the frame table) = 伏虎 double palm with the
  pole planted; C1 is the table's 300° 扁擔轉 (C2 vault kick, C4 crane leap, C5 pole spin, C6 ground slam per the feel
  notes).
- The turntable bench doesn't advance the root by the move's lunge, so baked feet look stretched in lunging poses there
  (bench artifact; the in-game gate measures feet with the lunge).
- Crowd skins apply on battle start only (frozen crowd view), so a chapter fields one foe skin: kc3 uses `khaki`
  throughout, the gang present as `chain` / `blade` officers. The view has no per-skin scale: the `kids` skin is
  registered (full-size unarmed look) and the kc2 escort draws its kids at 0.7× as story fx figures (skins.js kidFigure).
- The frozen grunt body is the lamellar cut; skins flatten plate / lace / hi to the cloth colour, but its fixed 0.86 checker
  still shows faintly on light cloth (serpent white vests, khaki) — P2.
- 蛇王's guandao moves (frame table N1 / N2 / C1) are scripted swings in bosses.js (the crowd AI is frozen); damage tuned
  down (12 / 10 / 16) after the bot as 阿鐵 died before P4 with the table's feel at 18 / 16 / 24. Phase-entry moves (飛燕's
  first leap, 蛇王's enraged leap slam) have super armour: 阿翠's chain punches otherwise kept them staggered through the
  whole short phase.
- Swing / Knife / shot damage all go through hero.hurt (dodge, i-frames and the Musou protect).
