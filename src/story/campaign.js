// 故事 Campaign state (story lane): kc1 → kc2 → kc3 → kc4 in order, each clear unlocks the next. The clear-state is saved
// in localStorage ('wcf.campaign': the ids cleared) behind try/catch — blocked or throwing storage only means the
// campaign isn't remembered across reloads (it still runs, from memory, for this page load).
export const CAMPAIGN = ['kc1', 'kc2', 'kc3', 'kc4'];
const KEY = 'wcf.campaign';
let mem = [];
function load() {
  try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(v)) mem = v.filter((id) => CAMPAIGN.includes(id)); } catch { /* storage blocked */ }
  return mem;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch { /* storage blocked: keep it in memory */ } }

/** Chapter ids cleared so far (campaign order). */
export const cleared = () => load().slice();
/** Record a campaign clear (story:end win of a campaign chapter). */
export function markCleared(id) { load(); if (CAMPAIGN.includes(id) && !mem.includes(id)) { mem.push(id); save(); } }
/** New Game: forget every clear. */
export function resetCampaign() { mem = []; save(); }
/** Is chapter `id` open (the first one, or its predecessor cleared)? */
export const unlockedCh = (id) => { const k = CAMPAIGN.indexOf(id); return k === 0 || (k > 0 && load().includes(CAMPAIGN[k - 1])); };
/** Continue: the first chapter not yet cleared (null once all four are). */
export const firstUncleared = () => CAMPAIGN.find((id) => !load().includes(id)) || null;
/** The chapter after `id` in the campaign, or null after kc4. */
export const nextChapter = (id) => CAMPAIGN[CAMPAIGN.indexOf(id) + 1] || null;
