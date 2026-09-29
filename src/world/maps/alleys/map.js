// 巷戰 The Alleys (kc1) — map definition for the map registry (src/world/map.js: format and API). Linear along +Z (open →
// chokepoint → gate → high ground), ≈ 190 m from the market gate to the 衙門:
//   market    the wet market at the city gate      z -152 … -96   h 0     a 32 m square of stalls; story start (阿鐵's stall)
//   lane      the alley under the dripping pipes   z  -98 … -44   h 0     a 6 m alley jogging between tenements (the
//                                                                         Walled City's 1 m side alleys open off it as
//                                                                         dressing only: a crowd can't fight in 1 m)
//   irongate  the gang's iron gate + the square    z  -48 … -17   h 0.2   gate 'ironGate' across the lane mouth (z ≈ -46.5)
//   yamen     the old 衙門 courtyard               z  -17 …  30   h 0.4   gate 'yamenDoor' in the courtyard gateway
//                                                                         (z ≈ -13); the hall stands at the north end
// Units / conventions as 定軍山 (map.js header). Real place; the buildings are generic tenement blocks (no signage).
// Free mode fights in the 衙門 courtyard: the free army spawns round the map origin (crowd.spawnArmy).
export default {
  id: 'alleys',
  name: { zh: '巷戰', en: 'The Alleys' },
  zones: [
    { id: 'market', name: { zh: '街市', en: 'The Wet Market' }, x: 0, z: -124, w: 32, d: 56 },
    { id: 'lane', name: { zh: '窄巷', en: 'The Lane' }, x: -1, z: -71, w: 18, d: 54 },
    { id: 'irongate', name: { zh: '鐵閘', en: 'The Iron Gate' }, x: 0, z: -32, w: 22, d: 30 },
    { id: 'yamen', name: { zh: '衙門', en: 'The Old Yamen' }, x: 0, z: 8, w: 40, d: 44 },
  ],
  grid: [-70, -180, 70, 60],
  pieces: [
    { id: 'market', rect: [-16, -152, 16, -96], h: 0 },
    { id: 'lane', path: [[0, -98, 3.1, 0], [0, -88, 3.0, 0], [-5, -78, 3.0, 0], [-5, -66, 2.9, 0], [2, -56, 3.0, 0], [0, -46, 3.2, 0.1]] },
    { id: 'square', rect: [-11, -46, 11, -18], h: 0.2 },
    { id: 'gateway', path: [[0, -19, 3.2, 0.2], [0, -8, 3.2, 0.4]] },
    { id: 'yamen', rect: [-20, -10, 20, 30], h: 0.4 },
  ],
  carve: [[-6, 14, -4, 16], [4, 14, 6, 16]],                          // the courtyard's two old stone lantern posts
  propCarve: [[-6, 14, -4, 16], [4, 14, 6, 16]],
  route: [[0, -148], [0, -120], [0, -98], [0, -88], [-5, -78], [-5, -66], [2, -56], [0, -44], [0, -30], [0, -13], [0, 0], [0, 20]],
  gates: {
    ironGate: { rect: [-6.5, -47.6, 6.5, -45.4], open: true, name: { zh: '鐵閘', en: 'Iron Gate' } },
    yamenDoor: { rect: [-5, -14.2, 5, -12], open: true, name: { zh: '衙門口', en: 'Yamen Gateway' } },
  },
  spawn: { story: { x: 0, z: -146, yaw: 0, tilt: -0.04 }, free: { x: 0, z: -2, yaw: 0, tilt: 0 } },
  freeAllies: { x: 0, z: -6, n: 18, cols: 6 },
  stage: 'market',
  hq: [0, 26], hqName: '衙',
  night: true,
  /** Minimap: the stalls in the market, the iron gate, the hall. */
  minimap(g, X, Y, PPM) {
    g.fillStyle = 'rgba(200,190,160,0.35)';
    for (const x of [-12, 12]) for (let z = -148; z < -100; z += 6) g.fillRect(X(x + 1.3), Y(z + 1), 2.6 * PPM, 2 * PPM);
    g.fillStyle = 'rgba(90,90,100,0.9)'; g.fillRect(X(6.5), Y(-45.4), 13 * PPM, 2 * PPM);
    g.fillStyle = 'rgba(180,70,50,0.8)'; g.fillRect(X(8), Y(40), 16 * PPM, 8 * PPM);
  },
};
