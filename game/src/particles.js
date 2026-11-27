// Gobble Dash — dust, leaves, feathers and speed lines.
// One clear job: everything that bursts, drifts or streaks.
export class Particles {
  constructor(stage) {
    this.stage = stage;
    this.list = [];
  }

  spawnDust(x, y, n) {
    for (let i = 0; i < (n || 3); i++) {
      const p = new PIXI.Graphics();
      p.beginFill(0xc9a06a, 0.55);
      p.drawCircle(0, 0, 3 + Math.random() * 5);
      p.endFill();
      p.position.set(x + (Math.random() - 0.5) * 20, y - Math.random() * 6);
      p.vx = -60 - Math.random() * 80;
      p.vy = -30 - Math.random() * 50;
      p.life = 0.5 + Math.random() * 0.3;
      p.maxLife = p.life;
      p.grow = 14;
      this.stage.addChild(p);
      this.list.push(p);
    }
  }

  spawnFeathers(x, y, n) {
    const cols = [0x8a5a2b, 0xa06a30, 0x6e4420, 0x2e4a7a, 0xb57a35];
    for (let i = 0; i < (n || 10); i++) {
      const p = new PIXI.Graphics();
      p.beginFill(cols[i % cols.length]);
      p.drawEllipse(0, 0, 4, 9);
      p.endFill();
      p.position.set(x, y - 30);
      p.vx = -120 + Math.random() * 260;
      p.vy = -160 - Math.random() * 160;
      p.life = 0.9 + Math.random() * 0.6;
      p.maxLife = p.life;
      p.spin = (Math.random() - 0.5) * 12;
      p.grow = 0;
      this.stage.addChild(p);
      this.list.push(p);
    }
  }

  spawnLeafBurst(x, y) {
    for (let i = 0; i < 6; i++) {
      const p = new PIXI.Graphics();
      p.beginFill([0xd97a1e, 0xc0392b, 0xe6a817][i % 3]);
      p.drawEllipse(0, 0, 6, 3);
      p.endFill();
      p.position.set(x + (Math.random() - 0.5) * 40, y - Math.random() * 20);
      p.vx = -140 - Math.random() * 120;
      p.vy = -40 - Math.random() * 90;
      p.life = 0.8 + Math.random() * 0.5;
      p.maxLife = p.life;
      p.spin = (Math.random() - 0.5) * 10;
      p.grow = 0;
      this.stage.addChild(p);
      this.list.push(p);
    }
  }

  spawnSpeedLine(x, y) {
    const p = new PIXI.Graphics();
    p.lineStyle(2, 0xffffff, 0.5);
    p.moveTo(0, 0); p.lineTo(60 + Math.random() * 70, 0);
    p.position.set(x, y);
    p.vx = -1400;
    p.vy = 0;
    p.life = 0.28;
    p.maxLife = p.life;
    p.spin = 0;
    p.grow = 0;
    this.stage.addChild(p);
    this.list.push(p);
  }

  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.stage.removeChild(p);
        p.destroy();
        this.list.splice(i, 1);
        continue;
      }
      p.position.x += p.vx * dt;
      p.position.y += p.vy * dt;
      p.vy += 320 * dt;
      p.rotation += (p.spin || 0) * dt;
      const k = p.life / p.maxLife;
      p.alpha = Math.min(1, k * 1.4);
      if (p.grow) p.scale.set(1 + (1 - k) * 0.8);
    }
  }

  clear() {
    for (const p of this.list) { this.stage.removeChild(p); p.destroy(); }
    this.list = [];
  }
}
