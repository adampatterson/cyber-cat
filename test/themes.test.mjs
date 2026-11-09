import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPalette } from '../src/build.mjs';
import { buildWarp, buildZed, buildVscode, buildVscodePackage } from '../src/themes.mjs';

const palette = buildPalette();
const f = palette.cybercat;
const HEX = /^#[0-9a-f]{6}([0-9a-f]{2})?$/;

const walk = (v, fn) => {
  if (typeof v === 'string') fn(v);
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => walk(x, fn));
};

test('warp theme has the documented keys and 16 ANSI colors', () => {
  const yaml = buildWarp(palette);
  for (const key of ['name: Cyber Cat', "accent: '", "background: '", "foreground: '", 'details: darker', 'terminal_colors:']) {
    assert.ok(yaml.includes(key), key);
  }
  assert.ok(yaml.includes(`background: '${f.colors.base.hex}'`));
  assert.ok(yaml.includes(`foreground: '${f.colors.text.hex}'`));
  assert.equal((yaml.match(/: '#[0-9a-f]{6}'/g) ?? []).length, 4 + 16); // accent, cursor, background, foreground, then 16 ANSI
});

test('warp ANSI block matches palette ansiColors', () => {
  const yaml = buildWarp(palette);
  for (const [name, a] of Object.entries(f.ansiColors)) {
    assert.ok(yaml.includes(`    ${name}: '${a.normal.hex}'`), `normal ${name}`);
    assert.ok(yaml.includes(`    ${name}: '${a.bright.hex}'`), `bright ${name}`);
  }
});

test('zed theme follows the v0.2.0 family shape', () => {
  const z = JSON.parse(buildZed(palette));
  assert.equal(z.$schema, 'https://zed.dev/schema/themes/v0.2.0.json');
  assert.equal(z.name, 'Cyber Cat');
  assert.equal(z.themes.length, 1);
  const [t] = z.themes;
  assert.equal(t.appearance, 'dark');
  assert.equal(t.style['editor.background'], f.colors.base.hex);
  assert.equal(t.style['terminal.ansi.red'], f.ansiColors.red.normal.hex);
  assert.equal(t.style['terminal.ansi.bright_red'], f.ansiColors.red.bright.hex);
  assert.equal(t.style.syntax.keyword.color, f.colors.mauve.hex);
  assert.ok(t.style.players.length > 0);
});

test('vscode theme has type, colors and tokenColors', () => {
  const v = JSON.parse(buildVscode(palette));
  assert.equal(v.name, 'Cyber Cat');
  assert.equal(v.type, 'dark');
  assert.equal(v.colors['editor.background'], f.colors.base.hex);
  assert.equal(v.colors['terminal.ansiRed'], f.ansiColors.red.normal.hex);
  assert.equal(v.colors['terminal.ansiBrightRed'], f.ansiColors.red.bright.hex);
  const kw = v.tokenColors.find((t) => [t.scope].flat().includes('keyword'));
  assert.equal(kw.settings.foreground, f.colors.mauve.hex);
});

test('vscode package.json points at the theme file', () => {
  const p = JSON.parse(buildVscodePackage(palette));
  assert.equal(p.contributes.themes[0].uiTheme, 'vs-dark');
  assert.equal(p.contributes.themes[0].path, './themes/cyber-cat-color-theme.json');
  assert.match(p.version, /^\d+\.\d+\.\d+$/);
});

test('every color value in every theme is a palette hex or an alpha of one', () => {
  const known = new Set(Object.values(f.colors).flatMap((c) => [c.hex, ...Object.values(f.ansiColors).flatMap((a) => [a.normal.hex, a.bright.hex])]));
  const check = (s) => {
    if (!s.startsWith('#')) return;
    assert.match(s, HEX, s);
    assert.ok(known.has(s.slice(0, 7)), `${s} is not from the palette`);
  };
  walk(JSON.parse(buildZed(palette)).themes, check);
  walk(JSON.parse(buildVscode(palette)), check);
});
