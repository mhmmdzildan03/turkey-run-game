// Gobble Dash — all sound is synthesized live with WebAudio.
// No audio files: every gobble, thud and banjo pluck is an oscillator.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.5;
        this.master.connect(this.ctx.destination);
      } catch (e) { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  }

  blip(freq, dur, type, vol, slideTo) {
    if (!this.ensure() || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    gain.gain.setValueAtTime(vol || 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain); gain.connect(this.master);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  gobble() {
    // A proud turkey gobble: a burst of fast descending clucks.
    if (!this.ensure() || this.muted) return;
    const notes = [420, 340, 300, 380, 260, 320];
    notes.forEach((f, i) => setTimeout(() => this.blip(f, 0.09, 'sawtooth', 0.12, f * 0.7), i * 70));
  }

  jump() { this.blip(300, 0.16, 'sine', 0.18, 620); }
  doubleJump() { this.blip(420, 0.14, 'sine', 0.16, 840); }
  slide() { this.blip(220, 0.18, 'triangle', 0.1, 120); }
  corn() { this.blip(880, 0.09, 'sine', 0.18); setTimeout(() => this.blip(1320, 0.12, 'sine', 0.16), 70); }
  nearMiss() { this.blip(1560, 0.1, 'sine', 0.14); setTimeout(() => this.blip(1960, 0.14, 'sine', 0.12), 60); }
  hit() {
    this.blip(140, 0.3, 'sawtooth', 0.25, 55);
    setTimeout(() => this.blip(90, 0.25, 'square', 0.18, 40), 60);
  }
  caught() {
    [330, 262, 208, 165].forEach((f, i) => setTimeout(() => this.blip(f, 0.35, 'triangle', 0.2), i * 180));
  }
  escaped() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => this.blip(f, 0.3, 'triangle', 0.18), i * 110));
  }
  click() { this.blip(700, 0.06, 'sine', 0.12); }

  startMusic() {
    if (!this.ensure() || this.musicTimer) return;
    // Cheerful farmyard pluck loop: C major pentatonic walk, banjo-ish square wave.
    const melody = [523, 587, 659, 784, 659, 587, 523, 392, 440, 523, 587, 659, 784, 880, 784, 659];
    this.musicTimer = setInterval(() => {
      if (this.muted) return;
      const f = melody[this.musicStep % melody.length];
      this.blip(f, 0.22, 'square', 0.05);
      if (this.musicStep % 4 === 0) this.blip(f / 2, 0.3, 'triangle', 0.07);
      this.musicStep += 1;
    }, 210);
  }

  stopMusic() {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  }
}
