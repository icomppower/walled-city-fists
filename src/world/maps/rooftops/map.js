// 天台 The Rooftops (kc2) — map definition for the map registry (src/world/map.js: format and API). Linear along +Z and up
// (open → chokepoint → gate → high ground), roof to roof across the top of the city, ≈ 170 m:
//   aerials   阿翠's roof, a forest of TV aerials     z -152 … -104   h 0     story start (the dawn class); the stairs
//                                                                           hut on the west side (the kids' way down)
//   plank     plank bridges between blocks          z -104 …  -62   h 0→2.4 two planks (3.2 m wide) and a small roof
//                                                                           between; gate 'plankBridge' across the first
//   tanks     the roof of padlocked water tanks     z  -62 …  -28   h 2.4   four tanks on stands (carved); gate
//                                                                           'tankLocks' at the stair to the peak
//   peak      the highest roof                      z  -28 …   20   h 2.4→6 the stair up (z -28 … -14), then the top
// Outside the walk field the ground drops away to the streets (the world builder's rise is negative): roof edges are
// the walk edge. Units / conventions as 定軍山 (map.js header). Free mode fights on the peak (the army spawns round the
// origin).
export default {
  id: 'rooftops',
  name: { zh: '天台', en: 'The Rooftops' },
  zones: [
    { id: 'aerials', name: { zh: '天線林', en: 'The Aerial Forest' }, x: 0, z: -128, w: 32, d: 48 },
    { id: 'plank', name: { zh: '木板橋', en: 'The Plank Bridges' }, x: 1, z: -83, w: 20, d: 42 },
    { id: 'tanks', name: { zh: '水缸', en: 'The Water Tanks' }, x: 0, z: -45, w: 28, d: 34 },
    { id: 'peak', name: { zh: '最高天台', en: 'The Highest Roof' }, x: 0, z: -4, w: 30, d: 48 },
  ],
  grid: [-70, -180, 70, 60],
  pieces: [
    { id: 'roofA', rect: [-16, -152, 16, -104], h: 0 },
    { id: 'plank1', path: [[0, -105, 1.6, 0], [0, -91, 1.6, 0.6]] },
    { id: 'roofB', rect: [-9, -92, 9, -77], h: 1.2 },
    { id: 'plank2', path: [[0, -78, 1.6, 1.2], [3, -61, 1.6, 2.4]] },
    { id: 'roofC', rect: [-14, -62, 14, -28], h: 2.4 },
    { id: 'stair', path: [[0, -29, 2.6, 2.4], [0, -14, 2.6, 6]] },
    { id: 'peak', rect: [-15, -15, 15, 20], h: 6 },
  ],
  // the water tanks' stands and the stairs hut on 阿翠's roof: solid set pieces
  carve: [[-9.5, -55.5, -6.5, -52.5], [6.5, -55.5, 9.5, -52.5], [-9.5, -39.5, -6.5, -36.5], [6.5, -39.5, 9.5, -36.5], [-16, -114, -11, -108]],
  propCarve: [[-9.5, -55.5, -6.5, -52.5], [6.5, -55.5, 9.5, -52.5], [-9.5, -39.5, -6.5, -36.5], [6.5, -39.5, 9.5, -36.5], [-16, -114, -11, -108]],
  route: [[0, -148], [0, -125], [0, -105], [0, -91], [0, -80], [3, -61], [0, -45], [0, -29], [0, -14], [0, 0], [0, 14]],
  gates: {
    plankBridge: { rect: [-2.8, -105.2, 2.8, -103.2], open: true, name: { zh: '木板橋', en: 'Plank Bridge' } },
    tankLocks: { rect: [-3.8, -28.8, 3.8, -26.8], open: true, name: { zh: '水缸鎖', en: 'Tank Locks' } },
  },
  spawn: { story: { x: 0, z: -144, yaw: 0, tilt: -0.02 }, free: { x: 0, z: -2, yaw: 0, tilt: 0 } },
  freeAllies: { x: 0, z: -8, n: 16, cols: 4 },
  stage: 'aerials',
  hq: [0, 14], hqName: '頂',
  night: true,
  stairs: [-12, -111],                                               // the stairs hut door (kc2 escort)
  tanks: [[-8, -54], [8, -54], [-8, -38], [8, -38]],                  // the padlocked tanks (kc2)
  /** Minimap: the planks, the tanks, the stairs hut. */
  minimap(g, X, Y, PPM) {
    g.fillStyle = 'rgba(160,120,70,0.8)'; g.fillRect(X(1.6), Y(-91), 3.2 * PPM, 14 * PPM);
    g.fillStyle = 'rgba(90,130,160,0.9)'; for (const [x, z] of [[-8, -54], [8, -54], [-8, -38], [8, -38]]) g.fillRect(X(x + 1.5), Y(z + 1.5), 3 * PPM, 3 * PPM);
    g.fillStyle = 'rgba(200,190,160,0.7)'; g.fillRect(X(-11), Y(-108), 5 * PPM, 6 * PPM);
  },
};
