// Gobble Dash — The Great Turkey Escape.
// The orchestrator: states, the run loop, the farmer chase, the HUD and the
// title / end screens. The turkey runs right; the world scrolls left.
import { VIEW_W, VIEW_H, GROUND_Y, TURKEY_X, GRAVITY, JUMP_V, DOUBLE_JUMP_V,
  SLIDE_TIME, ESCAPE_DISTANCE, stageFor, speedAt, difficultyAt } from './config.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import { Particles } from './particles.js';
import { World } from './world.js';
import { readShot, SHOT_SCENES } from './shots.js';
import { makeTurkey, makeFarmer, makeSkyTexture, makeCloud, makeSun,
  makeBarn, makeTree, makePumpkin, makeCornStalk } from './art.js';

const FONT = '"Trebuchet MS", Verdana, sans-serif';
const FONT_HEAVY = '"Trebuchet MS", Verdana, sans-serif';

const app = new PIXI.Application({
  width: VIEW_W, height: VIEW_H, background: 0xffb347, antialias: true,
});
document.getElementById('game').appendChild(app.view);
app.view.style.width = '100%';
app.view.style.height = '100%';

const sounds = new SoundBank();
const shot = readShot();

// --- Layers (back to front) -------------------------------------------------
const skyLayer = new PIXI.Container();
const farLayer = new PIXI.Container();
const midLayer = new PIXI.Container();
const groundLayer = new PIXI.Container();
const worldLayer = new PIXI.Container();
const fxLayer = new PIXI.Container();
const hudLayer = new PIXI.Container();
const screenLayer = new PIXI.Container();
app.stage.addChild(skyLayer, farLayer, midLayer, groundLayer, worldLayer, fxLayer, hudLayer, screenLayer);

const skySprite = new PIXI.Sprite();
skySprite.width = VIEW_W; skySprite.height = VIEW_H;
skyLayer.addChild(skySprite);
const sun = makeSun();
sun.position.set(1050, 120);
skyLayer.addChild(sun);
const clouds = [];
for (let i = 0; i < 5; i++) {
  const c = makeCloud();
  c.position.set(120 + i * 260, 60 + (i % 3) * 55);
  c.scale.set(0.8 + (i % 3) * 0.25);
  skyLayer.addChild(c);
  clouds.push(c);
}

// --- Ground: grass band, dirt path and scrolling tufts ----------------------
const groundG = new PIXI.Graphics();
groundLayer.addChild(groundG);
function drawGround(grassCol, dirtCol) {
  groundG.clear();
  groundG.beginFill(grassCol);
  groundG.drawRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  groundG.endFill();
  groundG.beginFill(dirtCol);
  groundG.drawRect(0, GROUND_Y + 26, VIEW_W, VIEW_H - GROUND_Y - 26);
  groundG.endFill();
  groundG.beginFill(0x000000, 0.08);
  groundG.drawRect(0, GROUND_Y + 26, VIEW_W, 4);
  groundG.endFill();
}

// --- Parallax scenery that recycles -----------------------------------------
const scenery = [];
function addScenery(kind, x) {
  let sprite;
  if (kind === 'barn') sprite = makeBarn();
  else if (kind === 'tree') sprite = makeTree([0xd97a1e, 0xc0392b, 0xe6a817][Math.floor(Math.random() * 3)]);
  else if (kind === 'pumpkin') sprite = makePumpkin();
  else sprite = makeCornStalk();
  sprite.position.set(x, GROUND_Y);
  const layer = kind === 'barn' || kind === 'tree' ? farLayer : midLayer;
  layer.addChild(sprite);
  scenery.push({ kind, sprite, layer, speed: kind === 'barn' || kind === 'tree' ? 0.3 : 0.6 });
}
for (let i = 0; i < 8; i++) {
  addScenery(i === 1 ? 'barn' : 'tree', 200 + i * 340);
  addScenery(Math.random() < 0.5 ? 'pumpkin' : 'cornStalk', 120 + i * 210);
}

// --- Actors -------------------------------------------------------------------
const turkey = makeTurkey();
turkey.position.set(TURKEY_X, GROUND_Y);
worldLayer.addChild(turkey);
const farmer = makeFarmer();
farmer.position.set(TURKEY_X - 220, GROUND_Y);
worldLayer.addChild(farmer);

const particles = new Particles(fxLayer);
const world = new World(worldLayer);

// --- Game state ---------------------------------------------------------------
const state = {
  mode: 'title', // title | play | caught | escaped | paused
  distance: 0, score: 0, lives: 3, gap: 70, best: 0,
  speed: 0, sprinting: false, sliding: false, slideTimer: 0,
  vy: 0, jumps: 0, runTime: 0, runCycle: 0, shake: 0, slowmo: 0,
  nearMissFlash: 0, invuln: 0, dustTimer: 0, leafTimer: 0, lineTimer: 0,
  stageName: 'FARMYARD', muted: false, pausedFrom: null,
};

function applyStage() {
  const stage = stageFor(state.distance);
  if (stage.name === state.stageName) return;
  state.stageName = stage.name;
  skySprite.texture = makeSkyTexture(stage.skyTop, stage.skyMid, stage.skyBot);
  drawGround(stage.grass, stage.dirt);
  stageFlash(stage.name);
}

function stageFlash(name) {
  if (shot.shot) return; // staged screenshots stay clean of the banner
  const t = new PIXI.Text(name, new PIXI.TextStyle({
    fontFamily: FONT_HEAVY, fontSize: 44, fontWeight: 'bold', fill: 0xffffff,
    stroke: 0x5d3a1a, strokeThickness: 8, dropShadow: true, dropShadowDistance: 3,
  }));
  t.anchor.set(0.5);
  t.position.set(VIEW_W / 2, 240);
  t.alpha = 0;
  screenLayer.addChild(t);
  const sub = new PIXI.Text('the chase gets hotter…', new PIXI.TextStyle({
    fontFamily: FONT, fontSize: 22, fill: 0xffffff, stroke: 0x5d3a1a, strokeThickness: 5,
  }));
  sub.anchor.set(0.5);
  sub.position.set(VIEW_W / 2, 288);
  sub.alpha = 0;
  screenLayer.addChild(sub);
  let life = 0;
  const tick = (delta) => {
    life += delta / 60;
    const a = life < 0.3 ? life / 0.3 : life > 1.6 ? Math.max(0, 1 - (life - 1.6) / 0.5) : 1;
    t.alpha = a; sub.alpha = a;
    if (life > 2.1) { screenLayer.removeChild(t, sub); app.ticker.remove(tick); }
  };
  app.ticker.add(tick);
}

// --- HUD ----------------------------------------------------------------------
const hud = {};
function hudText(size, fill, stroke) {
  return new PIXI.Text('', new PIXI.TextStyle({
    fontFamily: FONT_HEAVY, fontSize: size, fontWeight: 'bold', fill,
    stroke: stroke || 0x3a2410, strokeThickness: 6, dropShadow: true, dropShadowDistance: 2,
  }));
}
function buildHud() {
  const bar = new PIXI.Graphics();
  bar.beginFill(0x000000, 0.28);
  bar.drawRoundedRect(0, 0, VIEW_W, 64, 0);
  bar.endFill();
  hudLayer.addChild(bar);
  hud.score = hudText(30, 0xffffff);
  hud.score.position.set(18, 14);
  hud.dist = hudText(30, 0xffe98a);
  hud.dist.position.set(330, 14);
  hud.stage = hudText(22, 0xffffff);
  hud.stage.position.set(640, 20);
  hud.hearts = hudText(28, 0xff6b81);
  hud.hearts.position.set(1010, 14);
  hud.mute = hudText(18, 0xffffff);
  hud.mute.position.set(1140, 22);
  hudLayer.addChild(hud.score, hud.dist, hud.stage, hud.hearts, hud.mute);
  // Farmer-gap bar and escape progress live at the bottom, clear of the sky.
  hud.gapBg = new PIXI.Graphics();
  hud.gapBg.position.set(18, 688);
  hudLayer.addChild(hud.gapBg);
  hud.gapLabel = hudText(15, 0xffffff);
  hud.gapLabel.position.set(18, 664);
  hudLayer.addChild(hud.gapLabel);
  // Progress bar to the Freedom Forest.
  hud.progBg = new PIXI.Graphics();
  hud.progBg.position.set(VIEW_W - 330, 688);
  hudLayer.addChild(hud.progBg);
  hud.progLabel = hudText(15, 0xffffff);
  hud.progLabel.position.set(VIEW_W - 330, 664);
  hudLayer.addChild(hud.progLabel);
  hud.flash = new PIXI.Text('', new PIXI.TextStyle({
    fontFamily: FONT_HEAVY, fontSize: 34, fontWeight: 'bold', fill: 0xffe98a,
    stroke: 0x5d3a1a, strokeThickness: 8,
  }));
  hud.flash.anchor.set(0.5);
  hud.flash.position.set(VIEW_W / 2, 170);
  hudLayer.addChild(hud.flash);
}
buildHud();

function refreshHud() {
  hud.score.text = `SCORE ${Math.floor(state.score)}`;
  hud.dist.text = `${Math.floor(state.distance)} m`;
  hud.stage.text = state.stageName;
  hud.hearts.text = '♥'.repeat(Math.max(0, state.lives)) + '♡'.repeat(Math.max(0, 3 - state.lives));
  hud.mute.text = state.muted ? 'SOUND OFF (M)' : 'SOUND ON (M)';
  // Gap bar: green = safe, red = Bram is breathing down his neck.
  const gw = 300;
  hud.gapBg.clear();
  hud.gapBg.beginFill(0x000000, 0.45);
  hud.gapBg.drawRoundedRect(0, 0, gw, 14, 7);
  hud.gapBg.endFill();
  const gapCol = state.gap > 50 ? 0x7ddc4a : state.gap > 25 ? 0xffc93c : 0xe74c3c;
  hud.gapBg.beginFill(gapCol);
  hud.gapBg.drawRoundedRect(0, 0, gw * (state.gap / 100), 14, 7);
  hud.gapBg.endFill();
  hud.gapLabel.text = state.gap > 50 ? 'FARMER FAR BEHIND' : state.gap > 25 ? 'FARMER CLOSING IN!' : 'HE IS RIGHT BEHIND YOU!';
  // Progress to freedom.
  const pw = 300;
  const prog = Math.min(1, state.distance / ESCAPE_DISTANCE);
  hud.progBg.clear();
  hud.progBg.beginFill(0x000000, 0.45);
  hud.progBg.drawRoundedRect(0, 0, pw, 14, 7);
  hud.progBg.endFill();
  hud.progBg.beginFill(0x7ddc4a);
  hud.progBg.drawRoundedRect(0, 0, pw * prog, 14, 7);
  hud.progBg.endFill();
  hud.progBg.beginFill(0x2e7a2e);
  hud.progBg.drawCircle(pw, 7, 9);
  hud.progBg.endFill();
  hud.progLabel.text = `FREEDOM FOREST ${Math.max(0, Math.ceil(ESCAPE_DISTANCE - state.distance))} m`;
}

// --- Screens --------------------------------------------------------------------
let titleBox = null;
function bigButton(label, y, onTap) {
  const c = new PIXI.Container();
  const bg = new PIXI.Graphics();
  bg.beginFill(0xe67e22);
  bg.drawRoundedRect(-150, -30, 300, 60, 30);
  bg.endFill();
  bg.lineStyle(4, 0xffffff);
  bg.drawRoundedRect(-150, -30, 300, 60, 30);
  const t = new PIXI.Text(label, new PIXI.TextStyle({
    fontFamily: FONT_HEAVY, fontSize: 28, fontWeight: 'bold', fill: 0xffffff,
  }));
  t.anchor.set(0.5);
  c.addChild(bg, t);
  c.position.set(VIEW_W / 2, y);
  c.interactive = true;
  c.buttonMode = true;
  c.on('pointerdown', (e) => { e.stopPropagation(); sounds.ensure(); sounds.click(); onTap(); });
  return c;
}

function showTitle() {
  state.mode = 'title';
  hudLayer.visible = false;
  screenLayer.removeChildren();
  const box = new PIXI.Container();
  const panel = new PIXI.Graphics();
  panel.beginFill(0x3a2410, 0.45);
  panel.drawRoundedRect(190, 60, 900, 600, 24);
  panel.endFill();
  box.addChild(panel);
  const logo = new PIXI.Text('GOBBLE DASH', new PIXI.TextStyle({
    fontFamily: FONT_HEAVY, fontSize: 84, fontWeight: 'bold', fill: 0xffc93c,
    stroke: 0x5d3a1a, strokeThickness: 10, dropShadow: true, dropShadowDistance: 6,
  }));
  logo.anchor.set(0.5);
  logo.position.set(VIEW_W / 2, 150);
  const sub = new PIXI.Text('THE GREAT TURKEY ESCAPE', new PIXI.TextStyle({
    fontFamily: FONT_HEAVY, fontSize: 30, fontWeight: 'bold', fill: 0xffffff,
    stroke: 0x5d3a1a, strokeThickness: 6,
  }));
  sub.anchor.set(0.5);
  sub.position.set(VIEW_W / 2, 215);
  const story = new PIXI.Text(
    'Thanksgiving is coming — and you are the main course.\nOutrun Farmer Bram, leap the fences, dodge the ovens\nand the carving knives, and reach the Freedom Forest!',
    new PIXI.TextStyle({ fontFamily: FONT, fontSize: 23, fill: 0xffffff, align: 'center', lineHeight: 32 }),
  );
  story.anchor.set(0.5);
  story.position.set(VIEW_W / 2, 300);
  const controls = new PIXI.Text(
    'SPACE / ↑ / CLICK — jump (twice = double jump)      ↓ / S — slide\nSHIFT / → — sprint      M — sound      R — restart',
    new PIXI.TextStyle({ fontFamily: FONT, fontSize: 21, fill: 0xffe98a, align: 'center', lineHeight: 30 }),
  );
  controls.anchor.set(0.5);
  controls.position.set(VIEW_W / 2, 420);
  const hint = new PIXI.Text('Corn = points + head start   •   Near misses = bonus   •   3 hits and Bram catches you',
    new PIXI.TextStyle({ fontFamily: FONT, fontSize: 19, fill: 0xffffff, align: 'center' }));
  hint.anchor.set(0.5);
  hint.position.set(VIEW_W / 2, 485);
  box.addChild(logo, sub, story, controls, hint);
  box.addChild(bigButton('▶  RUN FOR IT!', 570, () => startRun()));
  if (state.best > 0) {
    const best = new PIXI.Text(`BEST SCORE ${Math.floor(state.best)}`, new PIXI.TextStyle({
      fontFamily: FONT_HEAVY, fontSize: 20, fontWeight: 'bold', fill: 0xffe98a,
    }));
    best.anchor.set(0.5);
    best.position.set(VIEW_W / 2, 625);
    box.addChild(best);
  }
  screenLayer.addChild(box);
  titleBox = box;
  // Idle turkey on the title screen, gobbling proudly.
  turkey.position.set(250, GROUND_Y);
  turkey.visible = true;
  farmer.position.set(120, GROUND_Y);
  farmer.visible = true;
  refreshHud();
}

function showEnd(escaped) {
  state.mode = escaped ? 'escaped' : 'caught';
  hudLayer.visible = false;
  state.best = Math.max(state.best, state.score);
  screenLayer.removeChildren();
  const box = new PIXI.Container();
  const panel = new PIXI.Graphics();
  panel.beginFill(escaped ? 0x1e4d2a : 0x4d1e1e, 0.72);
  panel.drawRoundedRect(240, 90, 800, 540, 24);
  panel.endFill();
  box.addChild(panel);
  const title = new PIXI.Text(escaped ? 'ESCAPED!' : 'CAUGHT!', new PIXI.TextStyle({
    fontFamily: FONT_HEAVY, fontSize: 76, fontWeight: 'bold',
    fill: escaped ? 0x7ddc4a : 0xff6b6b, stroke: 0x1a1a1a, strokeThickness: 9,
    dropShadow: true, dropShadowDistance: 5,
  }));
  title.anchor.set(0.5);
  title.position.set(VIEW_W / 2, 180);
  const story = new PIXI.Text(escaped
    ? 'You burst through the trees of the Freedom Forest —\nno oven, no carving knife, no Thanksgiving dinner.\nThis turkey lives to gobble another day!'
    : 'Farmer Bram grabs you by the tail feathers…\nThe oven is already hot. Thanksgiving dinner\nis served — and it is you.',
    new PIXI.TextStyle({ fontFamily: FONT, fontSize: 24, fill: 0xffffff, align: 'center', lineHeight: 33 }));
  story.anchor.set(0.5);
  story.position.set(VIEW_W / 2, 300);
  const stats = new PIXI.Text(
    `SCORE ${Math.floor(state.score)}    •    DISTANCE ${Math.floor(state.distance)} m    •    BEST ${Math.floor(state.best)}`,
    new PIXI.TextStyle({ fontFamily: FONT_HEAVY, fontSize: 24, fontWeight: 'bold', fill: 0xffe98a }));
  stats.anchor.set(0.5);
  stats.position.set(VIEW_W / 2, 420);
  box.addChild(title, story, stats);
  box.addChild(bigButton('↻  RUN AGAIN  (R)', 510, () => startRun()));
  const tip = new PIXI.Text(escaped
    ? 'Tip: sprint with SHIFT to stretch your lead — but watch the knives.'
    : 'Tip: slide under the swinging knives, double-jump the ovens.',
    new PIXI.TextStyle({ fontFamily: FONT, fontSize: 19, fill: 0xffffff, align: 'center' }));
  tip.anchor.set(0.5);
  tip.position.set(VIEW_W / 2, 580);
  box.addChild(tip);
  screenLayer.addChild(box);
  if (escaped) { sounds.escaped(); } else { sounds.caught(); }
  refreshHud();
}

// --- Run control ------------------------------------------------------------------
function startRun() {
  sounds.ensure();
  sounds.gobble();
  sounds.startMusic();
  world.reset();
  particles.clear();
  state.mode = 'play';
  hudLayer.visible = true;
  state.distance = 0;
  state.score = 0;
  state.lives = 3;
  state.gap = 70;
  state.speed = 0;
  state.vy = 0;
  state.jumps = 0;
  state.sliding = false;
  state.invuln = 0;
  state.runTime = 0;
  state.stageName = '';
  screenLayer.removeChildren();
  turkey.position.set(TURKEY_X, GROUND_Y);
  turkey.rotation = 0;
  turkey.visible = true;
  farmer.position.set(TURKEY_X - 220, GROUND_Y);
  farmer.visible = true;
  applyStage();
  refreshHud();
}

function doJump() {
  if (state.mode === 'title') { startRun(); return; }
  if (state.mode === 'caught' || state.mode === 'escaped') { startRun(); return; }
  if (state.mode !== 'play') return;
  sounds.ensure();
  if (state.jumps === 0) { state.vy = JUMP_V; state.jumps = 1; sounds.jump(); }
  else if (state.jumps === 1) { state.vy = DOUBLE_JUMP_V; state.jumps = 2; sounds.doubleJump(); particles.spawnFeathers(turkey.position.x, turkey.position.y - 40, 5); }
}

function doSlide() {
  if (state.mode !== 'play') return;
  if (turkey.position.y >= GROUND_Y - 1) {
    state.sliding = true;
    state.slideTimer = SLIDE_TIME;
    sounds.slide();
    particles.spawnDust(turkey.position.x, GROUND_Y, 4);
  }
}

function onAction(kind) {
  if (kind === 'mute') {
    state.muted = sounds.toggleMute();
    refreshHud();
  } else if (kind === 'restart') {
    if (state.mode !== 'title') startRun();
  } else if (kind === 'pause') {
    if (state.mode === 'play') { state.pausedFrom = 'play'; state.mode = 'paused'; sounds.stopMusic(); }
    else if (state.mode === 'paused') { state.mode = 'play'; sounds.startMusic(); }
  } else if (kind === 'confirm') {
    if (state.mode !== 'play') startRun();
  }
}

const input = new Input(doJump, doSlide, (v) => { state.sprinting = v; }, onAction);

// --- World events -------------------------------------------------------------------
const events = {
  shake(amount) { state.shake = Math.max(state.shake, amount); },
  hit(ob) {
    if (state.invuln > 0 || state.mode !== 'play') return;
    state.lives -= 1;
    state.gap = Math.max(4, state.gap - 26);
    state.invuln = 1.4;
    state.shake = 12;
    sounds.hit();
    particles.spawnFeathers(turkey.position.x, turkey.position.y - 40, 14);
    hud.flash.text = 'OUCH!';
    state.nearMissFlash = 0.7;
    if (state.lives <= 0) {
      state.mode = 'caught';
      sounds.stopMusic();
      setTimeout(() => showEnd(false), 650);
    }
    refreshHud();
  },
  nearMiss(ob) {
    state.score += 100;
    state.gap = Math.min(100, state.gap + 5);
    sounds.nearMiss();
    hud.flash.text = 'NEAR MISS! +100';
    state.nearMissFlash = 0.9;
    state.slowmo = 0.18;
    refreshHud();
  },
  cleared(ob) {
    state.score += 10;
    state.gap = Math.min(100, state.gap + 1.5);
    refreshHud();
  },
  pickup(p) {
    if (p.kind === 'corn') {
      state.score += 50;
      state.gap = Math.min(100, state.gap + 6);
      sounds.corn();
      hud.flash.text = 'CORN! +50';
      state.nearMissFlash = 0.6;
    } else {
      state.score += 25;
      state.gap = Math.min(100, state.gap + 3);
      sounds.corn();
    }
    particles.spawnLeafBurst(p.sprite.position.x, p.sprite.position.y);
    refreshHud();
  },
};

// --- Animation helpers ---------------------------------------------------------------
function animateTurkey(dt) {
  const running = state.mode === 'play' && turkey.position.y >= GROUND_Y - 1;
  state.runCycle += dt * (running ? 16 : 5);
  const c = state.runCycle;
  if (running) {
    turkey.legL.rotation = Math.sin(c) * 0.9;
    turkey.legR.rotation = Math.sin(c + Math.PI) * 0.9;
    turkey.position.y = GROUND_Y + Math.abs(Math.sin(c)) * -4;
    turkey.wing.rotation = Math.sin(c * 0.5) * 0.25;
    turkey.tail.rotation = Math.sin(c * 0.5) * 0.08;
    state.dustTimer -= dt;
    if (state.dustTimer <= 0) { particles.spawnDust(turkey.position.x - 20, GROUND_Y, 2); state.dustTimer = 0.12; }
  } else if (state.mode === 'title') {
    turkey.legL.rotation = 0; turkey.legR.rotation = 0;
    turkey.position.y = GROUND_Y + Math.sin(c * 0.5) * 2;
    turkey.tail.rotation = Math.sin(c * 0.4) * 0.12;
    turkey.wing.rotation = Math.sin(c * 0.6) * 0.15;
  } else {
    turkey.legL.rotation = Math.sin(c) * 0.4;
    turkey.legR.rotation = Math.sin(c + Math.PI) * 0.4;
  }
  if (state.sliding) {
    turkey.rotation = 0.5;
    turkey.scale.y = 0.62;
  } else {
    turkey.rotation = state.mode === 'play' ? Math.max(-0.18, Math.min(0.22, -state.vy * 0.00012)) : 0;
    turkey.scale.y = 1;
  }
  // Invulnerability blink.
  turkey.alpha = state.invuln > 0 && Math.floor(state.invuln * 12) % 2 === 0 ? 0.45 : 1;
}

function animateFarmer(dt) {
  const c = state.runCycle * 1.15;
  farmer.legL.rotation = Math.sin(c) * 0.8;
  farmer.legR.rotation = Math.sin(c + Math.PI) * 0.8;
  farmer.armL.rotation = Math.sin(c + Math.PI) * 0.5;
  farmer.armR.rotation = Math.sin(c) * 0.4 - 0.3;
  farmer.position.y = GROUND_Y + Math.abs(Math.sin(c)) * -3;
  // The gap decides how close Bram looms: under 20 and he is on your tail.
  const targetX = TURKEY_X - 90 - state.gap * 1.6;
  farmer.position.x += (targetX - farmer.position.x) * Math.min(1, dt * 3);
  farmer.visible = state.mode !== 'escaped';
}

function updateScenery(dt, speed) {
  for (const s of scenery) {
    s.sprite.position.x -= speed * s.speed * dt;
    if (s.sprite.position.x < -220) {
      s.sprite.position.x = VIEW_W + 60 + Math.random() * 200;
      if (s.kind === 'tree') s.sprite.position.y = GROUND_Y;
    }
  }
  for (const c of clouds) {
    c.position.x -= (12 + speed * 0.02) * dt;
    if (c.position.x < -120) { c.position.x = VIEW_W + 80; c.position.y = 40 + Math.random() * 130; }
  }
}

// --- Screenshot staging ---------------------------------------------------------------
function applyShotScene() {
  if (shot.shot === 'start' || shot.shot === '') {
    if (shot.autoplay) { startRun(); return; }
    showTitle();
    return;
  }
  if (shot.shot === 'end') {
    state.distance = 2310; state.score = 2980; state.lives = 0; state.gap = 6;
    state.stageName = 'KITCHEN DASH';
    skySprite.texture = makeSkyTexture(0x7a2e1d, 0xc65a2e, 0xf08a3c);
    drawGround(0x6d5a24, 0x8a5a30);
    showEnd(false);
    return;
  }
  const scene = SHOT_SCENES[shot.shot] || SHOT_SCENES.play;
  state.mode = 'play';
  hudLayer.visible = true;
  state.distance = scene.distance;
  state.score = scene.score;
  state.gap = scene.gap;
  state.lives = scene.lives;
  state.stageName = '';
  applyStage();
  world.stageScene(scene.items);
  turkey.position.set(TURKEY_X, scene.turkeyY);
  state.vy = scene.turkeyVy;
  state.jumps = 1;
  if (shot.shot === 'drama') {
    hud.flash.text = 'NEAR MISS! +100';
    state.nearMissFlash = 999; // hold the flash for the screenshot
    farmer.position.x = TURKEY_X - 130;
  }
  refreshHud();
  // Freeze the staged frame: screenshots want a still, readable moment.
  state.mode = 'frozen';
}

// --- Main loop --------------------------------------------------------------------------
let lastStageCheck = 0;
app.ticker.add((delta) => {
  let dt = Math.min(0.05, delta / 60);
  if (state.slowmo > 0) { state.slowmo -= dt; dt *= 0.35; }
  if (state.mode === 'frozen') {
    animateTurkey(0.016);
    animateFarmer(0.016);
    particles.update(0.016);
    return;
  }
  if (state.mode === 'title' || state.mode === 'caught' || state.mode === 'escaped') {
    animateTurkey(dt);
    animateFarmer(dt);
    particles.update(dt);
    updateScenery(dt, 60);
    return;
  }
  if (state.mode !== 'play') return;
  // Demo autopilot (?autoplay=1): jump when an obstacle looms, so the real
  // loop can be watched and screenshotted without a player at the keys.
  if (shot.autoplay && turkey.position.y >= GROUND_Y - 1 && state.jumps === 0) {
    const looming = world.obstacles.find((o) => {
      const d = o.sprite.position.x - turkey.position.x;
      return d > 0 && d < 250;
    });
    if (looming) doJump();
  }
  state.runTime += dt;
  const speed = speedAt(state.distance, state.sprinting);
  state.speed = speed;
  state.distance += (speed * dt) / 28; // ~28 px per metre
  state.score += speed * dt * 0.06;
  // The farmer gains when you dawdle, loses ground when you sprint or score.
  state.gap += (state.sprinting ? 6 : -1.5) * dt;
  state.gap = Math.max(4, Math.min(100, state.gap));
  if (state.gap <= 4.5 && state.invuln <= 0) {
    // Bram catches up: a grab costs a life and shoves you back.
    state.lives -= 1;
    state.gap = 34;
    state.invuln = 1.4;
    state.shake = 12;
    sounds.hit();
    particles.spawnFeathers(turkey.position.x, turkey.position.y - 40, 14);
    hud.flash.text = 'BRAM GRABBED YOU!';
    state.nearMissFlash = 0.8;
    if (state.lives <= 0) { state.mode = 'caught'; sounds.stopMusic(); setTimeout(() => showEnd(false), 650); }
    refreshHud();
  }
  // Turkey physics.
  state.vy += GRAVITY * dt;
  turkey.position.y += state.vy * dt;
  if (turkey.position.y >= GROUND_Y) {
    turkey.position.y = GROUND_Y;
    state.vy = 0;
    state.jumps = 0;
  }
  if (state.sliding) {
    state.slideTimer -= dt;
    if (state.slideTimer <= 0) state.sliding = false;
  }
  state.invuln = Math.max(0, state.invuln - dt);
  if (state.nearMissFlash > 0 && state.nearMissFlash < 900) {
    state.nearMissFlash -= dt;
    hud.flash.alpha = Math.min(1, state.nearMissFlash);
    if (state.nearMissFlash <= 0) hud.flash.text = '';
  }
  if (state.distance >= ESCAPE_DISTANCE) {
    state.mode = 'escaped';
    sounds.stopMusic();
    particles.spawnFeathers(turkey.position.x, turkey.position.y - 40, 24);
    setTimeout(() => showEnd(true), 700);
  }
  applyStage();
  world.update(dt, speed, state.distance, { x: turkey.position.x, y: turkey.position.y, sliding: state.sliding }, events);
  updateScenery(dt, speed);
  animateTurkey(dt);
  animateFarmer(dt);
  particles.update(dt);
  // Ambient autumn leaves.
  state.leafTimer -= dt;
  if (state.leafTimer <= 0) {
    particles.spawnLeafBurst(VIEW_W + 20, 120 + Math.random() * 300);
    state.leafTimer = 0.9 + Math.random();
  }
  // Speed lines while sprinting.
  if (state.sprinting) {
    state.lineTimer -= dt;
    if (state.lineTimer <= 0) {
      particles.spawnSpeedLine(VIEW_W + 40, 120 + Math.random() * 420);
      state.lineTimer = 0.08;
    }
  }
  // Screen shake.
  if (state.shake > 0) {
    state.shake = Math.max(0, state.shake - dt * 30);
    const s = state.shake;
    app.stage.position.set((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  } else {
    app.stage.position.set(0, 0);
  }
  refreshHud();
});

// --- Boot -----------------------------------------------------------------------------------
drawGround(0x7da23c, 0xb98a4e);
skySprite.texture = makeSkyTexture(0xffb347, 0xffd98a, 0xffe9b8);
applyShotScene();
refreshHud();
document.getElementById('status').textContent =
  'Gobble Dash: a turkey escapes Thanksgiving dinner. Space to jump, down to slide, Shift to sprint.';
