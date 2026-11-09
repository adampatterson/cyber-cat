// Cyber Cat seed values. Everything in dist/ is generated from this file.
//
// Neutrals: the green handheld-screen ramp from reference/. The 5 reference seeds are
// pinned. The steps between them are OKLCH interpolations of the seeds next to them.
// Accents: Catppuccin Mocha values, except where noted.

export const flavor = {
  key: 'cybercat',
  name: 'Cyber Cat',
  emoji: '🐈‍⬛',
  order: 0,
  dark: true,
};

export const ACCENTS = [
  'rosewater',
  'flamingo',
  'pink',
  'mauve',
  'red',
  'maroon',
  'peach',
  'yellow',
  'green',
  'teal',
  'sky',
  'sapphire',
  'blue',
  'lavender',
];

export const NEUTRALS = [
  'text',
  'subtext1',
  'subtext0',
  'overlay2',
  'overlay1',
  'overlay0',
  'surface2',
  'surface1',
  'surface0',
  'base',
  'mantle',
  'crust',
];

const NAMES = {
  subtext1: 'Subtext 1',
  subtext0: 'Subtext 0',
  overlay2: 'Overlay 2',
  overlay1: 'Overlay 1',
  overlay0: 'Overlay 0',
  surface2: 'Surface 2',
  surface1: 'Surface 1',
  surface0: 'Surface 0',
};

const HEX = {
  rosewater: '#f5e0dc',
  flamingo: '#f2cdcd',
  pink: '#f5c2e7',
  mauve: '#cba6f7',
  red: '#f38ba8',
  maroon: '#eba0ac',
  peach: '#fab387',
  yellow: '#f9e2af',
  // Mocha green (#a6e3a1) is too close to the UI text green. Cooler mint:
  // oklch(0.84 0.14 152).
  green: '#7ee59d',
  // Mocha teal (#94e2d5) is too close to the UI text green. Pushed toward cyan:
  // oklch(0.84 0.10 190).
  teal: '#74e0d9',
  // Moved 6 degrees toward blue to keep distance from the new teal:
  // oklch(0.83 0.09 216).
  sky: '#7fd6ed',
  sapphire: '#74c7ec',
  blue: '#89b4fa',
  lavender: '#b4befe',

  text: '#d0e4b3', // lightest_green (pinned)
  subtext1: '#aeca97', // midpoint subtext0 -> text
  subtext0: '#8bb07c', // light_mid_green (pinned)
  overlay2: '#74996e', // 2/3 overlay0 -> subtext0
  overlay1: '#5f8260', // 1/3 overlay0 -> subtext0
  overlay0: '#4b6c52', // dark_mid_green (pinned)
  surface2: '#3a5846', // 2/3 surface0 -> overlay0
  surface1: '#2b4539', // 1/3 surface0 -> overlay0
  surface0: '#1e332c', // darkest_green (pinned)
  base: '#192631', // outer_background (pinned)
  mantle: '#111e28', // base, OKLCH lightness - 0.035
  crust: '#091520', // base, OKLCH lightness - 0.07
};

const titleCase = (k) => k[0].toUpperCase() + k.slice(1);

export const colors = Object.fromEntries(
  [...ACCENTS, ...NEUTRALS].map((key, order) => [
    key,
    { name: NAMES[key] ?? titleCase(key), order, hex: HEX[key], accent: ACCENTS.includes(key) },
  ]),
);
