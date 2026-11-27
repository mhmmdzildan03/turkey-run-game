// Gobble Dash — tuning, stages and shared constants.
// One clear job: every number the game balances on lives here.
export const VIEW_W = 1280;
export const VIEW_H = 720;
export const GROUND_Y = 612;

export const TURKEY_X = 300;
export const GRAVITY = 2600;
export const JUMP_V = -980;
export const DOUBLE_JUMP_V = -880;
export const SLIDE_TIME = 0.55;

export const BASE_SPEED = 420;
export const MAX_SPEED = 760;
export const SPRINT_MULT = 1.35;
export const ESCAPE_DISTANCE = 3000; // metres to the Freedom Forest gate

export const STAGES = [
  {
    name: 'FARMYARD',
    from: 0,
    skyTop: 0xffb347, skyMid: 0xffd98a, skyBot: 0xffe9b8,
    sun: 0xfff3c4, hillFar: 0xc98a4b, hillNear: 0xa86f35,
    grass: 0x7da23c, dirt: 0xb98a4e, accent: 'dawn gold',
  },
  {
    name: 'CORNFIELD',
    from: 800,
    skyTop: 0xf08a2e, skyMid: 0xf7b733, skyBot: 0xfddb7a,
    sun: 0xffe98a, hillFar: 0xb5762f, hillNear: 0x96591f,
    grass: 0x8a8a2a, dirt: 0xa87c3a, accent: 'harvest gold',
  },
  {
    name: 'KITCHEN DASH',
    from: 1800,
    skyTop: 0x7a2e1d, skyMid: 0xc65a2e, skyBot: 0xf08a3c,
    sun: 0xffd27a, hillFar: 0x6e2f1c, hillNear: 0x572412,
    grass: 0x6d5a24, dirt: 0x8a5a30, accent: 'oven dusk',
  },
];

export const OBSTACLES = {
  fence: { w: 46, h: 84, score: 10 },
  hay: { w: 92, h: 96, score: 10 },
  oven: { w: 130, h: 118, score: 25 },
  knifeSwing: { w: 40, h: 150, score: 25 },
  knifeDrop: { w: 36, h: 120, score: 25 },
};

export const PICKUPS = {
  corn: { score: 50, gap: 6 },
  feather: { score: 25, gap: 3 },
};

export function stageFor(distance) {
  let stage = STAGES[0];
  for (const s of STAGES) if (distance >= s.from) stage = s;
  return stage;
}

export function difficultyAt(distance) {
  // 0..1 as the run gets longer; drives speed, spawn rate and knife odds.
  return Math.min(1, distance / ESCAPE_DISTANCE);
}

export function speedAt(distance, sprinting) {
  const d = difficultyAt(distance);
  let speed = BASE_SPEED + d * (MAX_SPEED - BASE_SPEED);
  if (sprinting) speed *= SPRINT_MULT;
  return speed;
}
