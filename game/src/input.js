// Gobble Dash — keyboard and mouse input, one clear job.
// Space / Up / click = jump (twice for a double jump), Down / S = slide,
// Shift / Right = sprint, M = mute, R = restart, P = pause.
export class Input {
  constructor(onJump, onSlide, onSprint, onAction) {
    this.onJump = onJump;
    this.onSlide = onSlide;
    this.onSprint = onSprint;
    this.onAction = onAction; // clicks and keys that advance menus / restart
    this.sprinting = false;
    this.sliding = false;
    this._keydown = (e) => {
      if (e.repeat) {
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'ArrowRight') this.setSprint(true);
        return;
      }
      switch (e.code) {
        case 'Space': case 'ArrowUp': case 'KeyW':
          e.preventDefault(); this.onJump(); break;
        case 'ArrowDown': case 'KeyS':
          e.preventDefault(); this.onSlide(); this.sliding = true; break;
        case 'ShiftLeft': case 'ShiftRight': case 'ArrowRight':
          this.setSprint(true); break;
        case 'KeyM': this.onAction('mute'); break;
        case 'KeyR': this.onAction('restart'); break;
        case 'KeyP': this.onAction('pause'); break;
        case 'Enter': this.onAction('confirm'); break;
        default: break;
      }
    };
    this._keyup = (e) => {
      switch (e.code) {
        case 'ArrowDown': case 'KeyS': this.sliding = false; break;
        case 'ShiftLeft': case 'ShiftRight': case 'ArrowRight': this.setSprint(false); break;
        default: break;
      }
    };
    this._pointer = (e) => {
      // Clicks on the canvas jump during play; menus handle their own buttons.
      if (e.target && e.target.tagName === 'CANVAS') this.onJump();
    };
    window.addEventListener('keydown', this._keydown);
    window.addEventListener('keyup', this._keyup);
    window.addEventListener('pointerdown', this._pointer);
  }

  setSprint(v) {
    if (this.sprinting !== v) { this.sprinting = v; this.onSprint(v); }
  }

  destroy() {
    window.removeEventListener('keydown', this._keydown);
    window.removeEventListener('keyup', this._keyup);
    window.removeEventListener('pointerdown', this._pointer);
  }
}
