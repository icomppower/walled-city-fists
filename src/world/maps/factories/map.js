// 工場 The Factories (kc3) — map definition for the map registry (src/world/map.js: format and API). Linear along +Z and
// up six floors, indoors (open → chokepoint → gate → high ground), ≈ 170 m:
//   fishball  the fishball workshop, steam vats       z -152 … -106   h 0      the workers chained at their benches; gate
//                                                                              'chainDoor' (a chained door) at the stair foot
//   stairs    the dark stairwell up six floors        z -106 …  -58   h 0→18   three flights (6 m each) with landings
//   dentists  the dentists' corridor                  z  -58 …  -24   h 18     8 m wide, doors both sides; gate 'boilerDoor'
//                                                                              at its end
//   boiler    the boiler room on the top floor        z  -24 …   14   h 18     the boiler at the north wall
// Walls all round (the world builder); ceilings at 7.6 m (the camera stays under them, Musou shots included). Units / conventions as 定軍山
// (map.js header). Free mode fights in the boiler room (the army spawns round the origin).
export default {
  id: 'factories',
  name: { zh: '工場', en: 'The Factories' },
  zones: [
    { id: 'fishball', name: { zh: '魚蛋工場', en: 'The Fishball Workshop' }, x: 0, z: -129, w: 28, d: 46 },
    { id: 'stairs', name: { zh: '樓梯', en: 'The Stairwell' }, x: 0, z: -82, w: 12, d: 48 },
    { id: 'dentists', name: { zh: '牙醫走廊', en: 'The Dentists\' Corridor' }, x: 0, z: -41, w: 10, d: 34 },
    { id: 'boiler', name: { zh: '鍋爐房', en: 'The Boiler Room' }, x: 0, z: -5, w: 28, d: 38 },
  ],
  grid: [-60, -176, 60, 40],
  pieces: [
    { id: 'workshop', rect: [-14, -152, 14, -106], h: 0 },
    { id: 'flight1', path: [[0, -107, 3.4, 0], [0, -93, 3.4, 6]] },
    { id: 'landing1', rect: [-4, -94, 4, -88], h: 6 },
    { id: 'flight2', path: [[0, -89, 3.4, 6], [0, -75, 3.4, 12]] },
    { id: 'landing2', rect: [-4, -76, 4, -70], h: 12 },
    { id: 'flight3', path: [[0, -71, 3.4, 12], [0, -57, 3.4, 18]] },
    { id: 'corridor', rect: [-4, -58, 4, -24], h: 18 },
    { id: 'boilerroom', rect: [-14, -24, 14, 14], h: 18 },
  ],
  // steam vats in the workshop, the boiler at the boiler room's north wall: solid set pieces
  carve: [[-10.5, -140.5, -7.5, -137.5], [7.5, -140.5, 10.5, -137.5], [-10.5, -124.5, -7.5, -121.5], [7.5, -124.5, 10.5, -121.5], [-5, 8, 5, 14]],
  propCarve: [[-10.5, -140.5, -7.5, -137.5], [7.5, -140.5, 10.5, -137.5], [-10.5, -124.5, -7.5, -121.5], [7.5, -124.5, 10.5, -121.5], [-5, 8, 5, 14]],
  route: [[0, -148], [0, -128], [0, -107], [0, -93], [0, -89], [0, -75], [0, -71], [0, -57], [0, -40], [0, -24], [0, -8], [0, 4]],
  gates: {
    chainDoor: { rect: [-4.4, -107.6, 4.4, -105.4], open: true, name: { zh: '鐵鏈門', en: 'Chained Door' } },
    boilerDoor: { rect: [-5, -25.2, 5, -23.2], open: true, name: { zh: '鍋爐房門', en: 'Boiler Room Door' } },
  },
  spawn: { story: { x: 0, z: -147, yaw: 0, tilt: -0.04 }, free: { x: 0, z: -12, yaw: 0, tilt: 0 } },
  freeAllies: { x: 0, z: -16, n: 16, cols: 4 },
  stage: 'fishball',
  hq: [0, 6], hqName: '爐',
  night: true,
  // the chained workers (kc3): four at the fishball benches, two in the dentists' corridor
  workers: [[-5, -144], [5, -132], [-5, -118], [5, -112], [-2.6, -46], [2.6, -34]],
  /** Minimap: the vats, the flights, the boiler. */
  minimap(g, X, Y, PPM) {
    g.fillStyle = 'rgba(200,200,190,0.5)'; for (const [x, z] of [[-9, -139], [9, -139], [-9, -123], [9, -123]]) g.fillRect(X(x + 1.5), Y(z + 1.5), 3 * PPM, 3 * PPM);
    g.fillStyle = 'rgba(160,150,130,0.6)'; for (const z0 of [-107, -89, -71]) g.fillRect(X(3.4), Y(z0 + 14), 6.8 * PPM, 14 * PPM);
    g.fillStyle = 'rgba(230,120,50,0.8)'; g.fillRect(X(5), Y(14), 10 * PPM, 6 * PPM);
  },
};
