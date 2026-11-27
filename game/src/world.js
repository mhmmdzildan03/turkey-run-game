// Gobble Dash — the scrolling farm: spawns, stages, collisions.
// One clear job: what appears ahead of the turkey, and what happens on contact.
import { GROUND_Y, OBSTACLES, PICKUPS, difficultyAt, stageFor, VIEW_W } from './config.js';
import { makeFence, makeHay, makeOven, makeKnifeSwing, makeKnifeDrop, makeCorn, makeFeatherPickup } from './art.js';

function rand(a, b) { return a + Math.random() * (b - a); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export class World {
  constructor(layer) {
    this.layer = layer;
    this.obstacles = [];
    this.pickups = [];
    this.nextSpawnX = VIEW_W + 200;
    this.spawnGap = 420;
    this.knifeTimers = [];
  }

  reset() {
    for (const o of this.obstacles) this.layer.removeChild(o.sprite);
    for (const p of this.pickups) this.layer.removeChild(p.sprite);
    this.obstacles = [];
    this.pickups = [];
    this.knifeTimers = [];
    this.nextSpawnX = VIEW_W + 300;
    this.spawnGap = 420;
  }

  // Place a fixed set of obstacles/pickups for screenshot staging.
  stageScene(items) {
    this.reset();
    for (const it of items) {
      if (it.kind === 'corn' || it.kind === 'feather') this.addPickup(it.kind, it.x, it.y);
      else this.addObstacle(it.kind, it.x, it.y);
    }
    this.nextSpawnX = VIEW_W + 1400;
  }

  addObstacle(kind, x, y) {
    let sprite;
    if (kind === 'fence') sprite = makeFence();
    else if (kind === 'hay') sprite = makeHay();
    else if (kind === 'oven') sprite = makeOven();
    else if (kind === 'knifeSwing') sprite = makeKnifeSwing();
    else sprite = makeKnifeDrop();
    const def = OBSTACLES[kind];
    sprite.position.set(x, y === undefined ? GROUND_Y : y);
    if (kind === 'knifeSwing') {
      // Hang the swinging knife from a branch above the path.
      sprite.position.set(x, 300);
      sprite.anchorY = 300;
    }
    this.layer.addChild(sprite);
    const ob = { kind, sprite, w: def.w, h: def.h, scored: false, nearMissed: false,
      swingPhase: Math.random() * Math.PI * 2, dropState: 'hang', dropVy: 0, dropDelay: rand(0.4, 1.2) };
    if (kind === 'knifeDrop') {
      sprite.position.set(x, 180);
      sprite.shadow.position.set(0, GROUND_Y - 180);
      ob.dropState = 'wait';
    }
    this.obstacles.push(ob);
    return ob;
  }

  addPickup(kind, x, y) {
    const sprite = kind === 'corn' ? makeCorn() : makeFeatherPickup();
    sprite.position.set(x, y === undefined ? GROUND_Y - 70 : y);
    this.layer.addChild(sprite);
    const p = { kind, sprite, taken: false, bob: Math.random() * Math.PI * 2 };
    this.pickups.push(p);
    return p;
  }

  chooseObstacle(distance) {
    const d = difficultyAt(distance);
    const stage = stageFor(distance);
    const pool = ['fence', 'fence', 'hay', 'hay'];
    if (d > 0.25) pool.push('knifeSwing');
    if (d > 0.4) pool.push('knifeDrop');
    if (stage.name === 'KITCHEN DASH' || d > 0.55) pool.push('oven', 'oven', 'knifeSwing', 'knifeDrop');
    return pick(pool);
  }

  spawnAhead(distance, speed) {
    // Keep a runway of spawns ahead of the right edge.
    while (this.nextSpawnX < VIEW_W + 900) {
      const kind = this.chooseObstacle(distance);
      const x = this.nextSpawnX;
      this.addObstacle(kind, x);
      // Corn trails reward a clean jump arc; feathers float higher.
      if (Math.random() < 0.55) {
        const arcY = kind === 'oven' ? GROUND_Y - 190 : GROUND_Y - 150;
        this.addPickup('corn', x + 90, arcY);
        if (Math.random() < 0.5) this.addPickup('corn', x + 150, arcY + 20);
      } else if (Math.random() < 0.4) {
        this.addPickup('feather', x + rand(120, 260), GROUND_Y - rand(120, 220));
      }
      const d = difficultyAt(distance);
      this.spawnGap = rand(380, 560) * (1 - d * 0.35);
      this.nextSpawnX += this.spawnGap + OBSTACLES[kind].w;
    }
  }

  update(dt, speed, distance, turkey, events) {
    const dx = speed * dt;
    this.nextSpawnX -= dx;
    for (const ob of this.obstacles) {
      ob.sprite.position.x -= dx;
      if (ob.kind === 'knifeSwing') {
        ob.swingPhase += dt * 2.2;
        ob.sprite.rotation = Math.sin(ob.swingPhase) * 0.55;
      }
      if (ob.kind === 'knifeDrop') {
        if (ob.dropState === 'wait') {
          ob.dropDelay -= dt;
          // Drop when the turkey is close enough to make it a real dodge.
          const distToTurkey = ob.sprite.position.x - turkey.x;
          if (ob.dropDelay <= 0 && distToTurkey < 260 && distToTurkey > -40) ob.dropState = 'fall';
        } else if (ob.dropState === 'fall') {
          ob.dropVy += 2600 * dt;
          ob.sprite.position.y += ob.dropVy * dt;
          if (ob.sprite.position.y >= GROUND_Y - 86) {
            ob.sprite.position.y = GROUND_Y - 86;
            ob.dropState = 'stuck';
            events.shake(4);
          }
        }
      }
    }
    for (const p of this.pickups) {
      p.sprite.position.x -= dx;
      p.bob += dt * 4;
      p.sprite.position.y += Math.sin(p.bob) * 0.4;
    }
    // Prune anything far behind the left edge.
    this.obstacles = this.obstacles.filter((o) => {
      if (o.sprite.position.x < -220) { this.layer.removeChild(o.sprite); return false; }
      return true;
    });
    this.pickups = this.pickups.filter((p) => {
      if (p.sprite.position.x < -80 || p.taken) { this.layer.removeChild(p.sprite); return false; }
      return true;
    });
    this.spawnAhead(distance, speed);
    this.checkCollisions(turkey, events);
  }

  turkeyBox(turkey) {
    // Forgiving hitbox: smaller than the art, so near misses feel fair.
    const sliding = turkey.sliding;
    return {
      x: turkey.x - 26, y: turkey.y - (sliding ? 44 : 86),
      w: 58, h: sliding ? 44 : 86,
    };
  }

  checkCollisions(turkey, events) {
    const tb = this.turkeyBox(turkey);
    for (const ob of this.obstacles) {
      const s = ob.sprite;
      let ox = s.position.x, oy, ow = ob.w, oh = ob.h;
      if (ob.kind === 'knifeSwing') {
        // Blade tip sweeps an arc below its pivot.
        const tipX = s.position.x + Math.sin(s.rotation) * 130;
        const tipY = 300 + Math.cos(s.rotation) * 130;
        ox = tipX - 12; oy = tipY - 60; ow = 24; oh = 74;
      } else if (ob.kind === 'knifeDrop') {
        ox = s.position.x - 14; oy = s.position.y - 20; ow = 28; oh = 106;
      } else {
        oy = GROUND_Y - ob.h;
      }
      const overlap = tb.x < ox + ow && tb.x + tb.w > ox && tb.y < oy + oh && tb.y + tb.h > oy;
      if (overlap && !ob.hit) {
        ob.hit = true;
        events.hit(ob);
        continue;
      }
      // Near miss: the obstacle just passed the turkey's nose, unhit.
      if (!ob.scored && !ob.hit && s.position.x + ob.w < tb.x - 4) {
        ob.scored = true;
        if (s.position.x + ob.w > tb.x - 90) events.nearMiss(ob);
        else events.cleared(ob);
      }
    }
    for (const p of this.pickups) {
      if (p.taken) continue;
      const dxp = p.sprite.position.x - (turkey.x + 4);
      const dyp = p.sprite.position.y - (turkey.y - 46);
      if (Math.abs(dxp) < 52 && Math.abs(dyp) < 58) {
        p.taken = true;
        events.pickup(p);
      }
    }
  }
}
