# 城寨拳王 Walled City Fists · Voxel

An original 1970s kung fu musou on the Voxel Musou engine. 九龍城寨, 1975: 33,000 people in 6.5 acres and one gang on
top. Two neighbours who know kung fu take the city back, floor by floor, from the alleys up to the Serpent King's tower.
The Walled City is a real place; every character, gang and event is fictional.

**Status:** under construction (see `PROGRESS.md`). Live: **https://walled-city-fists.vercel.app**

Plain ES modules, Three.js r186 vendored, deterministic fixed 60 Hz simulation, no build step. Copied from
[icomppower/hk-freedom-voxel](https://github.com/icomppower/hk-freedom-voxel) (engine hooks: touch controls, mobile tier,
harness, registries, dual-wield rig, crowd skins, bot), which builds on
[icomppower/sheep-village](https://github.com/icomppower/sheep-village) and
[mike007jd/voxel-musou](https://github.com/mike007jd/voxel-musou). Upstream's 定軍山 chapter stays in the repo behind
`?dev` as the determinism gate.

## Run

```sh
python3 -m http.server 8000
```

Open http://localhost:8000 (WebGL2). `?hq` forces full quality on a phone; `?dev` shows the upstream 定軍山 chapter
and officers.

## Tests

`sh bench/verify.sh` runs every gate (`--quick` skips the Chrome half). Build log: `PROGRESS.md`; screenshots per stage:
`bench/shots/`.

## Credits & License

- Engine and original game: [mike007jd/voxel-musou](https://github.com/mike007jd/voxel-musou) by BubuAi — MIT, see
  [LICENSE](LICENSE). Engine hooks from [icomppower/sheep-village](https://github.com/icomppower/sheep-village) and
  [icomppower/hk-freedom-voxel](https://github.com/icomppower/hk-freedom-voxel) (MIT).
- [three.js](https://threejs.org/) r186 — MIT.
- Fallback brush font `src/ui/brush.woff2`: a subset of Yuji Boku by Kinuta Font Factory, SIL Open Font License 1.1.
