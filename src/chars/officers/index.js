// Crowd skins + officer models registry (content for the crowd view's stage-2c hook, src/crowd/view.js header). Chapters
// pick skins with `skin: { foe, ally }` (story/chapters.js); officers with `model: key` in their OFF entry. New skins /
// models register here with one import + one entry. 城寨拳王 content: ./kc/ (Contracts ids).
import { SERPENT, KHAKI, RESIDENT, KIDS } from './kc/skins.js';
import { CHAIN, BLADE, OX, SWALLOW, GOLDTOOTH, SERPENT_KING } from './kc/models.js';

export const SKINS = { serpent: SERPENT, khaki: KHAKI, resident: RESIDENT, kids: KIDS };
export const OFFICER_MODELS = { chain: CHAIN, blade: BLADE, ox: OX, swallow: SWALLOW, goldtooth: GOLDTOOTH, serpent: SERPENT_KING };
