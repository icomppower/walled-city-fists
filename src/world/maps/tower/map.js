// 蛇王樓 The Serpent Tower (kc4) — map definition for the map registry (src/world/map.js: format and API). Along +Z and up
// the gang's tower (open → chokepoint → gate → high ground), ≈ 170 m of walking, 20 m of climbing:
//   lobby      the tower's ground-floor lobby          z -150 … -110   h 0      the siege: the whole city marches in
//   shaft      the open light well, its balconies      z -110 …  -52   h 0→16   four balcony runs zig-zagging up round
//                                                                              the well (4.8 m wide), the well itself a
//                                                                              drop in the middle
//   gatehouse  the gatehouse room                      z  -52 …  -26   h 16     gate 'gatehouse' at the top of the last
//                                                                              balcony (its door, broken by an HP objective)
//   crown      the roof garden on top of the city      z  -26 …   22   h 16→20  the stair up (gate 'crownStairs' at its
//                                                                              foot), then the garden
// Units / conventions as 定軍山 (map.js header). Free mode fights on the crown (the army spawns round the origin).
export default {
  id: 'tower',
  name: { zh: '蛇王樓', en: 'The Serpent Tower' },
  zones: [
    { id: 'lobby', name: { zh: '大堂', en: 'The Lobby' }, x: 0, z: -130, w: 32, d: 40 },
    { id: 'shaft', name: { zh: '天井', en: 'The Light Well' }, x: 0, z: -81, w: 26, d: 58 },
    { id: 'gatehouse', name: { zh: '閘房', en: 'The Gatehouse' }, x: 0, z: -39, w: 20, d: 26 },
    { id: 'crown', name: { zh: '樓頂花園', en: 'The Crown' }, x: 0, z: 2, w: 36, d: 48 },
  ],
  grid: [-60, -176, 60, 48],
  pieces: [
    { id: 'lobby', rect: [-16, -150, 16, -110], h: 0 },
    { id: 'balc1', path: [[9, -111, 2.4, 0], [9, -86, 2.4, 6]] },
    { id: 'balc2', path: [[9, -86, 2.4, 6], [-9, -80, 2.4, 9]] },
    { id: 'balc3', path: [[-9, -80, 2.4, 9], [-9, -58, 2.4, 14]] },
    { id: 'balc4', path: [[-9, -58, 2.4, 14], [0, -52, 2.8, 16]] },
    { id: 'gatehouse', rect: [-10, -52, 10, -27], h: 16 },
    { id: 'stair', path: [[0, -28, 3, 16], [0, -15, 3, 20]] },
    { id: 'crown', rect: [-18, -16, 18, 22], h: 20 },
  ],
  // the pavilion's four posts on the crown: solid set pieces
  carve: [[-7.5, 12.5, -6.5, 13.5], [6.5, 12.5, 7.5, 13.5], [-7.5, 18.5, -6.5, 19.5], [6.5, 18.5, 7.5, 19.5]],
  propCarve: [[-7.5, 12.5, -6.5, 13.5], [6.5, 12.5, 7.5, 13.5], [-7.5, 18.5, -6.5, 19.5], [6.5, 18.5, 7.5, 19.5]],
  route: [[0, -146], [0, -128], [9, -111], [9, -86], [-9, -80], [-9, -58], [0, -52], [0, -40], [0, -28], [0, -15], [0, 0], [0, 12]],
  gates: {
    gatehouse: { rect: [-4.2, -53.4, 4.2, -51.2], open: true, name: { zh: '閘房門', en: 'Gatehouse Door' } },
    crownStairs: { rect: [-4.4, -29, 4.4, -26.8], open: true, name: { zh: '樓頂樓梯', en: 'Crown Stairs' } },
  },
  spawn: { story: { x: 0, z: -146, yaw: 0, tilt: -0.04 }, free: { x: 0, z: -4, yaw: 0, tilt: 0 } },
  freeAllies: { x: 0, z: -9, n: 18, cols: 6 },
  stage: 'lobby',
  hq: [0, 16], hqName: '蛇',
  night: true,
  well: [0, -82, 5.6],                                              // the light well's open middle (render + pots)
  /** Minimap: the well, the gatehouse door, the pavilion. */
  minimap(g, X, Y, PPM) {
    g.fillStyle = 'rgba(20,20,30,0.9)'; g.fillRect(X(5.6), Y(-76), 11.2 * PPM, 12 * PPM);
    g.fillStyle = 'rgba(90,90,100,0.9)'; g.fillRect(X(4.2), Y(-51.2), 8.4 * PPM, 2 * PPM);
    g.fillStyle = 'rgba(180,60,40,0.8)'; g.fillRect(X(8), Y(20), 16 * PPM, 8 * PPM);
  },
};
