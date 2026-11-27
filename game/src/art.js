// Gobble Dash — every sprite is drawn in code with Pixi Graphics.
// No image files: the turkey, the farmer, the farm and the kitchen are
// all original vector art built from shapes, so the game is fully offline.
import { GROUND_Y } from './config.js';

function g() { return new PIXI.Graphics(); }

// --- The hero: a plump brown turkey with a fanning tail --------------------
export function makeTurkey() {
  const turkey = new PIXI.Container();
  const body = g();
  // Tail fan: five bronze feathers that sway as he runs.
  turkey.tail = new PIXI.Container();
  const featherCols = [0x8a5a2b, 0xa06a30, 0x6e4420, 0xb57a35, 0x7d4f24];
  for (let i = 0; i < 5; i++) {
    const f = g();
    const ang = (-52 + i * 26) * (Math.PI / 180);
    f.beginFill(featherCols[i]);
    f.drawEllipse(0, -52, 15, 46);
    f.endFill();
    f.beginFill(0x2e4a7a);
    f.drawEllipse(0, -82, 8, 12);
    f.endFill();
    f.position.set(Math.sin(ang) * 34, -Math.cos(ang) * 10);
    f.rotation = ang;
    turkey.tail.addChild(f);
  }
  turkey.tail.position.set(-26, -46);
  turkey.addChild(turkey.tail);
  // Body: a big warm-brown egg, with a lighter belly.
  body.beginFill(0x7a4a22);
  body.drawEllipse(0, -34, 46, 40);
  body.endFill();
  body.beginFill(0xa97a45);
  body.drawEllipse(6, -26, 32, 26);
  body.endFill();
  // Wing, tucked but flapping.
  turkey.wing = g();
  turkey.wing.beginFill(0x5d3a1a);
  turkey.wing.drawEllipse(0, 0, 26, 15);
  turkey.wing.endFill();
  turkey.wing.beginFill(0x8a5a2b);
  turkey.wing.drawEllipse(4, 2, 18, 9);
  turkey.wing.endFill();
  turkey.wing.position.set(-8, -34);
  turkey.addChild(body, turkey.wing);
  // Neck and head.
  const head = g();
  head.beginFill(0x8a5a2b);
  head.drawEllipse(0, 0, 9, 22);
  head.endFill();
  head.beginFill(0xd98a7a);
  head.drawCircle(2, -24, 15);
  head.endFill();
  head.beginFill(0xffc93c);
  head.moveTo(14, -26); head.lineTo(30, -21); head.lineTo(14, -17);
  head.endFill();
  head.beginFill(0xc0392b);
  head.drawEllipse(6, -12, 5, 9);
  head.endFill();
  head.beginFill(0x1a1a1a);
  head.drawCircle(7, -28, 3.4);
  head.endFill();
  head.beginFill(0xffffff);
  head.drawCircle(8, -29, 1.2);
  head.endFill();
  head.position.set(28, -58);
  turkey.addChild(head);
  // Legs: two orange sticks the run cycle swings.
  turkey.legL = g();
  turkey.legL.lineStyle(5, 0xe67e22);
  turkey.legL.moveTo(0, 0); turkey.legL.lineTo(0, 22);
  turkey.legL.moveTo(-4, 22); turkey.legL.lineTo(4, 22);
  turkey.legL.position.set(-10, 2);
  turkey.legR = g();
  turkey.legR.lineStyle(5, 0xe67e22);
  turkey.legR.moveTo(0, 0); turkey.legR.lineTo(0, 22);
  turkey.legR.moveTo(-4, 22); turkey.legR.lineTo(4, 22);
  turkey.legR.position.set(10, 2);
  turkey.addChild(turkey.legL, turkey.legR);
  turkey.pivot.set(0, 0);
  return turkey;
}

// --- The villain: Farmer Bram, red-faced, pitchfork in hand ----------------
export function makeFarmer() {
  const farmer = new PIXI.Container();
  const body = g();
  // Overalls and shirt.
  body.beginFill(0x2e5aa8);
  body.drawRoundedRect(-26, -78, 52, 78, 8);
  body.endFill();
  body.beginFill(0xc0392b);
  body.drawRoundedRect(-30, -118, 60, 46, 10);
  body.endFill();
  body.beginFill(0x2e5aa8);
  body.drawRect(-26, -118, 10, 40);
  body.drawRect(16, -118, 10, 40);
  body.endFill();
  // Head: round, red, moustached, furious.
  body.beginFill(0xf0c08a);
  body.drawCircle(0, -140, 24);
  body.endFill();
  body.beginFill(0x6e4420);
  body.drawEllipse(0, -128, 16, 6);
  body.endFill();
  body.beginFill(0x1a1a1a);
  body.drawCircle(-9, -144, 3);
  body.drawCircle(9, -144, 3);
  body.endFill();
  body.lineStyle(3, 0x1a1a1a);
  body.moveTo(-14, -156); body.lineTo(-4, -152);
  body.moveTo(14, -156); body.lineTo(4, -152);
  // Straw hat.
  body.beginFill(0xd9a441);
  body.drawEllipse(0, -158, 34, 8);
  body.endFill();
  body.beginFill(0xc08a2e);
  body.drawEllipse(0, -164, 20, 12);
  body.endFill();
  farmer.addChild(body);
  // Arms pump as he runs; the right one holds a pitchfork.
  farmer.armL = g();
  farmer.armL.lineStyle(7, 0xc0392b);
  farmer.armL.moveTo(0, 0); farmer.armL.lineTo(-16, 22);
  farmer.armL.position.set(-26, -112);
  farmer.armR = g();
  farmer.armR.lineStyle(7, 0xc0392b);
  farmer.armR.moveTo(0, 0); farmer.armR.lineTo(18, 16);
  farmer.armR.position.set(26, -112);
  const fork = g();
  fork.lineStyle(4, 0x8a6a3a);
  fork.moveTo(0, 0); fork.lineTo(0, -84);
  fork.lineStyle(4, 0xb8b8c0);
  fork.moveTo(-8, -84); fork.lineTo(-8, -104);
  fork.moveTo(0, -84); fork.lineTo(0, -106);
  fork.moveTo(8, -84); fork.lineTo(8, -104);
  fork.position.set(18, 16);
  farmer.armR.addChild(fork);
  farmer.addChild(farmer.armL, farmer.armR);
  // Legs.
  farmer.legL = g();
  farmer.legL.lineStyle(7, 0x2e3a5a);
  farmer.legL.moveTo(0, 0); farmer.legL.lineTo(0, 26);
  farmer.legL.position.set(-12, -2);
  farmer.legR = g();
  farmer.legR.lineStyle(7, 0x2e3a5a);
  farmer.legR.moveTo(0, 0); farmer.legR.lineTo(0, 26);
  farmer.legR.position.set(12, -2);
  farmer.addChild(farmer.legL, farmer.legR);
  return farmer;
}

// --- Obstacles --------------------------------------------------------------
export function makeFence() {
  const c = new PIXI.Container();
  const g1 = g();
  g1.beginFill(0x8a5a2b);
  g1.drawRect(-23, -84, 10, 84); g1.drawRect(13, -84, 10, 84);
  g1.drawRect(-30, -78, 60, 9); g1.drawRect(-30, -48, 60, 9);
  g1.endFill();
  g1.beginFill(0xa06a30);
  g1.drawRect(-30, -78, 60, 3); g1.drawRect(-30, -48, 60, 3);
  g1.endFill();
  c.addChild(g1);
  return c;
}

export function makeHay() {
  const c = new PIXI.Container();
  const g1 = g();
  g1.beginFill(0xd9a441);
  g1.drawEllipse(0, -44, 48, 44);
  g1.endFill();
  g1.beginFill(0xc08a2e);
  g1.drawEllipse(0, -44, 38, 34);
  g1.endFill();
  g1.lineStyle(2, 0x8a5a2b);
  for (let i = -2; i <= 2; i++) {
    g1.moveTo(i * 16, -84); g1.quadraticCurveTo(i * 16 + 8, -44, i * 16, -6);
  }
  g1.beginFill(0xc0392b);
  g1.drawRect(-50, -52, 100, 8);
  g1.endFill();
  c.addChild(g1);
  return c;
}

export function makeOven() {
  const c = new PIXI.Container();
  const g1 = g();
  // Glowing hot oven with a turkey-shaped warning on the door.
  g1.beginFill(0x3a3a44);
  g1.drawRoundedRect(-65, -118, 130, 118, 10);
  g1.endFill();
  g1.beginFill(0x55555f);
  g1.drawRoundedRect(-65, -118, 130, 18, 8);
  g1.endFill();
  g1.beginFill(0xff7a1a);
  g1.drawRoundedRect(-48, -92, 96, 62, 6);
  g1.endFill();
  g1.beginFill(0xffd27a);
  g1.drawRoundedRect(-40, -84, 80, 46, 4);
  g1.endFill();
  g1.beginFill(0x1a1a1a);
  g1.drawEllipse(0, -62, 16, 12);
  g1.drawCircle(16, -70, 5);
  g1.endFill();
  g1.beginFill(0xffc93c);
  g1.drawCircle(-52, -104, 5); g1.drawCircle(-34, -104, 5); g1.drawCircle(-16, -104, 5);
  g1.endFill();
  // Heat shimmer: wavy orange lines above.
  g1.lineStyle(3, 0xff9a3c, 0.8);
  g1.moveTo(-40, -130); g1.quadraticCurveTo(-32, -146, -40, -160);
  g1.moveTo(0, -130); g1.quadraticCurveTo(8, -148, 0, -164);
  g1.moveTo(40, -130); g1.quadraticCurveTo(32, -146, 40, -160);
  c.addChild(g1);
  c.glow = g();
  c.glow.beginFill(0xff7a1a, 0.16);
  c.glow.drawEllipse(0, -55, 95, 70);
  c.glow.endFill();
  c.addChildAt(c.glow, 0);
  return c;
}

export function makeKnifeSwing() {
  // A carving knife hanging from a branch, swinging like a pendulum.
  const c = new PIXI.Container();
  const pivot = g();
  pivot.lineStyle(3, 0x5d3a1a);
  pivot.moveTo(0, 0); pivot.lineTo(0, 58);
  c.addChild(pivot);
  c.blade = g();
  c.blade.beginFill(0xd8dce2);
  c.blade.moveTo(-7, 0); c.blade.lineTo(7, 0); c.blade.lineTo(0, 74);
  c.blade.endFill();
  c.blade.beginFill(0x4a2e14);
  c.blade.drawRoundedRect(-8, -22, 16, 24, 4);
  c.blade.endFill();
  c.blade.position.set(0, 58);
  c.addChild(c.blade);
  return c;
}

export function makeKnifeDrop() {
  const c = new PIXI.Container();
  const g1 = g();
  g1.beginFill(0xd8dce2);
  g1.moveTo(-9, 0); g1.lineTo(9, 0); g1.lineTo(0, 86);
  g1.endFill();
  g1.beginFill(0x4a2e14);
  g1.drawRoundedRect(-10, -26, 20, 28, 4);
  g1.endFill();
  c.addChild(g1);
  // Telegraph shadow on the ground where it will land.
  c.shadow = g();
  c.shadow.beginFill(0x000000, 0.25);
  c.shadow.drawEllipse(0, 0, 22, 6);
  c.shadow.endFill();
  c.addChild(c.shadow);
  return c;
}

// --- Pickups ------------------------------------------------------------------
export function makeCorn() {
  const c = new PIXI.Container();
  const g1 = g();
  g1.beginFill(0x2e7a2e);
  g1.moveTo(-14, -30); g1.quadraticCurveTo(-26, 6, -8, 18);
  g1.moveTo(14, -30); g1.quadraticCurveTo(26, 6, 8, 18);
  g1.endFill();
  g1.beginFill(0xffc93c);
  g1.drawEllipse(0, -6, 12, 26);
  g1.endFill();
  g1.lineStyle(2, 0xe6a817);
  for (let i = -1; i <= 1; i++) {
    g1.moveTo(i * 6, -28); g1.lineTo(i * 6, 16);
  }
  c.addChild(g1);
  return c;
}

export function makeFeatherPickup() {
  const c = new PIXI.Container();
  const g1 = g();
  g1.beginFill(0x8a5a2b);
  g1.drawEllipse(0, 0, 9, 20);
  g1.endFill();
  g1.beginFill(0x2e4a7a);
  g1.drawEllipse(0, -14, 5, 8);
  g1.endFill();
  c.addChild(g1);
  return c;
}

// --- Scenery: barn, trees, pumpkins, corn stalks ------------------------------
export function makeBarn() {
  const c = new PIXI.Container();
  const g1 = g();
  g1.beginFill(0xa83226);
  g1.drawRect(-90, -110, 180, 110);
  g1.moveTo(-100, -108); g1.lineTo(0, -180); g1.lineTo(100, -108);
  g1.endFill();
  g1.beginFill(0x7a2318);
  g1.moveTo(-100, -108); g1.lineTo(0, -180); g1.lineTo(100, -108);
  g1.endFill();
  g1.beginFill(0xffffff);
  g1.drawRect(-12, -64, 24, 64);
  g1.drawRect(-52, -84, 30, 26);
  g1.drawRect(22, -84, 30, 26);
  g1.endFill();
  g1.lineStyle(4, 0x7a2318);
  g1.moveTo(-12, -64); g1.lineTo(12, 0); g1.moveTo(12, -64); g1.lineTo(-12, 0);
  c.addChild(g1);
  return c;
}

export function makeTree(leafCol) {
  const c = new PIXI.Container();
  const g1 = g();
  g1.beginFill(0x6e4420);
  g1.drawRect(-7, -70, 14, 70);
  g1.endFill();
  g1.beginFill(leafCol || 0xd97a1e);
  g1.drawCircle(0, -92, 34);
  g1.drawCircle(-24, -72, 22);
  g1.drawCircle(24, -72, 22);
  g1.endFill();
  g1.beginFill(0xc0392b);
  g1.drawCircle(-14, -100, 7); g1.drawCircle(12, -86, 6); g1.drawCircle(4, -108, 5);
  g1.endFill();
  c.addChild(g1);
  return c;
}

export function makePumpkin() {
  const c = new PIXI.Container();
  const g1 = g();
  g1.beginFill(0xe67e22);
  g1.drawEllipse(0, -16, 24, 18);
  g1.endFill();
  g1.lineStyle(2, 0xb85c14);
  g1.moveTo(-8, -32); g1.quadraticCurveTo(-10, -16, -8, 0);
  g1.moveTo(8, -32); g1.quadraticCurveTo(10, -16, 8, 0);
  g1.beginFill(0x2e7a2e);
  g1.drawRect(-2, -38, 5, 10);
  g1.endFill();
  c.addChild(g1);
  return c;
}

export function makeCornStalk() {
  const c = new PIXI.Container();
  const g1 = g();
  g1.lineStyle(5, 0x4a7a2e);
  g1.moveTo(0, 0); g1.lineTo(0, -120);
  g1.beginFill(0x5a8a2e);
  g1.moveTo(0, -60); g1.quadraticCurveTo(-30, -80, -34, -104); g1.quadraticCurveTo(-8, -92, 0, -72);
  g1.moveTo(0, -80); g1.quadraticCurveTo(30, -100, 34, -124); g1.quadraticCurveTo(8, -112, 0, -92);
  g1.endFill();
  g1.beginFill(0xffc93c);
  g1.drawEllipse(6, -96, 7, 16);
  g1.endFill();
  c.addChild(g1);
  return c;
}

// --- Sky: a vertical gradient texture drawn once per stage --------------------
export function makeSkyTexture(top, mid, bot) {
  const canvas = document.createElement('canvas');
  canvas.width = 4; canvas.height = 720;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 720);
  grad.addColorStop(0, '#' + top.toString(16).padStart(6, '0'));
  grad.addColorStop(0.55, '#' + mid.toString(16).padStart(6, '0'));
  grad.addColorStop(1, '#' + bot.toString(16).padStart(6, '0'));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 4, 720);
  return PIXI.Texture.from(canvas);
}

export function makeCloud() {
  const c = new PIXI.Container();
  const g1 = g();
  g1.beginFill(0xffffff, 0.92);
  g1.drawEllipse(0, 0, 46, 18);
  g1.drawEllipse(-28, 6, 28, 13);
  g1.drawEllipse(28, 6, 30, 14);
  g1.drawEllipse(0, -12, 28, 14);
  g1.endFill();
  c.addChild(g1);
  return c;
}

export function makeSun() {
  const c = new PIXI.Container();
  const g1 = g();
  g1.beginFill(0xfff3c4, 0.35);
  g1.drawCircle(0, 0, 86);
  g1.endFill();
  g1.beginFill(0xffe98a);
  g1.drawCircle(0, 0, 56);
  g1.endFill();
  g1.beginFill(0xfff3c4);
  g1.drawCircle(0, 0, 40);
  g1.endFill();
  c.addChild(g1);
  return c;
}

export { GROUND_Y };
