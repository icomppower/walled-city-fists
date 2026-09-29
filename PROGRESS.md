# PROGRESS

One-shot build of 城寨拳王 Walled City Fists (Notion: "One-Shot Build Prompt — 城寨拳王"). Resume from the first stage
not `done`.

| Stage | Status | Gate numbers |
|---|---|---|
| 0 Fork + strip | done | copy of hk-freedom-voxel `3797d28`; HK chars / chapters / maps / skins / story deleted (−54 files); Node 6/6 logs identical (finals 90a1a382 64989ea8 6c41979e 2c32ffdc 6a95e25b b7fe682c = base); rig 54/54, dual PASS; bot WIN ch1 zhaoyun 普通 (4:41, S); Chrome: title 城寨 拳王 / WALLED CITY FISTS, menu 操作說明 only (故事 / 自由 with ?dev), no base-game text, 0 errors; ch1 scroll 6/6, crowd 94/94, checkpoints 6/6 × 2; touch twin 7/7, touch UI 13/13 |
| 0 Vercel | done | project `walled-city-fists` (sharkgundams-projects), git-connected to icomppower/walled-city-fists: production = main, previews per branch; first git deploy (`23754d4`) READY in 5 s; https://walled-city-fists.vercel.app 200, title screen, 0 console errors (remote smoke) |
| 1 阿鐵 tit | pending | |
| 2 阿翠 chui | pending | |
| 3 Enemy side | pending | |
| 4 kc1 alleys | pending | |
| 5 kc2 rooftops | pending | |
| 6 kc3 factories | pending | |
| 7 kc4 tower + ENDING | pending | |
| 8 Cutscenes | pending | |
| 8b Modes (故事 / 自由 / 影院) | pending | |
| 9 Sound | pending | |
| 10 Critic rounds | pending | |
| 11 Ship | pending | |

**Next action:** stage 1 阿鐵 tit.

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
