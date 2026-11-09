import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPalette, buildCss, buildScss, buildPreview, buildSwatches, injectSwatches } from '../src/build.mjs';

// Field order copied from catppuccin/palette v1.8.0 palette.json.
const FLAVOR_KEYS = ['name', 'emoji', 'order', 'dark', 'colors', 'ansiColors'];
const COLOR_KEYS = ['name', 'order', 'hex', 'rgb', 'hsl', 'oklch', 'accent'];
const ANSI_KEYS = ['name', 'order', 'normal', 'bright'];
const ANSI_ENTRY_KEYS = ['name', 'hex', 'rgb', 'hsl', 'oklch', 'code'];
const ANSI_NAMES = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];

const palette = buildPalette();
const flavor = palette.cybercat;

test('top level is version then the cybercat flavor', () => {
  assert.deepEqual(Object.keys(palette), ['version', 'cybercat']);
  assert.match(palette.version, /^\d+\.\d+\.\d+$/);
});

test('flavor and color entries match the Catppuccin schema', () => {
  assert.deepEqual(Object.keys(flavor), FLAVOR_KEYS);
  assert.equal(flavor.name, 'Cyber Cat');
  assert.equal(flavor.dark, true);
  const entries = Object.values(flavor.colors);
  assert.equal(entries.length, 26);
  entries.forEach((c, i) => {
    assert.deepEqual(Object.keys(c), COLOR_KEYS);
    assert.equal(c.order, i);
    assert.deepEqual(Object.keys(c.rgb), ['r', 'g', 'b']);
    assert.deepEqual(Object.keys(c.hsl), ['h', 's', 'l']);
    assert.deepEqual(Object.keys(c.oklch), ['l', 'c', 'h']);
  });
});

test('ansiColors use the dark-flavor mapping', () => {
  assert.deepEqual(Object.keys(flavor.ansiColors), ANSI_NAMES);
  ANSI_NAMES.forEach((name, i) => {
    const a = flavor.ansiColors[name];
    assert.deepEqual(Object.keys(a), ANSI_KEYS);
    assert.equal(a.order, i);
    assert.deepEqual(Object.keys(a.normal), ANSI_ENTRY_KEYS);
    assert.deepEqual(Object.keys(a.bright), ANSI_ENTRY_KEYS);
    assert.equal(a.normal.code, i);
    assert.equal(a.bright.code, i + 8);
    assert.equal(a.bright.name, `Bright ${a.normal.name}`);
  });
  const c = flavor.colors;
  assert.equal(flavor.ansiColors.black.normal.hex, c.surface1.hex);
  assert.equal(flavor.ansiColors.black.bright.hex, c.surface2.hex);
  assert.equal(flavor.ansiColors.white.normal.hex, c.subtext0.hex);
  assert.equal(flavor.ansiColors.white.bright.hex, c.subtext1.hex);
  assert.equal(flavor.ansiColors.magenta.normal.hex, c.pink.hex);
  assert.equal(flavor.ansiColors.cyan.normal.hex, c.teal.hex);
  assert.notEqual(flavor.ansiColors.red.bright.hex, c.red.hex);
});

test('CSS defines a hex and rgb custom property for each color', () => {
  const css = buildCss(palette);
  for (const [key, c] of Object.entries(flavor.colors)) {
    assert.ok(css.includes(`--ctp-${key}: ${c.hex};`), key);
    assert.ok(css.includes(`--ctp-${key}-rgb: ${c.rgb.r} ${c.rgb.g} ${c.rgb.b};`), key);
  }
});

test('SCSS defines a variable per color and a $colors map, without @import', () => {
  const scss = buildScss(palette);
  for (const [key, c] of Object.entries(flavor.colors)) {
    assert.ok(scss.includes(`$${key}: ${c.hex};`), key);
  }
  assert.match(scss, /\$colors: \(/);
  assert.doesNotMatch(scss, /@import/);
});

test('preview links the CSS and shows every color', () => {
  const html = buildPreview(palette);
  assert.match(html, /<link rel="stylesheet" href="cyber-cat\.css">/);
  for (const c of Object.values(flavor.colors)) assert.ok(html.includes(c.hex), c.name);
});

test('swatch table lists all 26 colors with hex and an image chip', () => {
  const md = buildSwatches(palette);
  const rows = md.split('\n').filter((l) => l.startsWith('| ![')).length;
  assert.equal(rows, 26);
  for (const c of Object.values(flavor.colors)) {
    const h = c.hex.slice(1);
    assert.ok(md.includes(`\`${c.hex}\``), `missing ${c.hex}`);
    assert.ok(md.includes(`https://placehold.co/24x24/${h}/${h}.png`));
  }
});

test('injectSwatches replaces only the marked block', () => {
  const src = 'a\n<!-- swatches:start -->\nold\n<!-- swatches:end -->\nb\n';
  assert.equal(injectSwatches(src, 'NEW'), 'a\n<!-- swatches:start -->\nNEW\n<!-- swatches:end -->\nb\n');
  assert.throws(() => injectSwatches('no markers', 'NEW'));
});
