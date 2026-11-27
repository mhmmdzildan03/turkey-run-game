// Gobble Dash — screenshot staging via the URL query (?shot=start|play|drama|end).
// One clear job: put the game into a photogenic state for the maker's screenshots.
// The game itself is identical in every mode; this only chooses the opening state.
export function readShot() {
  const params = new URLSearchParams(window.location.search);
  return {
    shot: params.get('shot') || '',
    seed: Number(params.get('seed') || '1'),
    autoplay: params.get('autoplay') === '1',
  };
}

// Fixed scenes for the four screenshots, in metres and obstacle layouts.
export const SHOT_SCENES = {
  play: {
    distance: 1250, score: 1840, gap: 62, lives: 3,
    items: [
      { kind: 'fence', x: 760 },
      { kind: 'corn', x: 860, y: 470 },
      { kind: 'hay', x: 1020 },
      { kind: 'knifeSwing', x: 1180 },
    ],
    turkeyY: 470, turkeyVy: -260,
  },
  drama: {
    distance: 2140, score: 3120, gap: 18, lives: 1,
    items: [
      { kind: 'oven', x: 520 },
      { kind: 'knifeDrop', x: 760 },
      { kind: 'corn', x: 1000, y: 460 },
      { kind: 'fence', x: 1150 },
    ],
    turkeyY: 430, turkeyVy: -420,
  },
};
