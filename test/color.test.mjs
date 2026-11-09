import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hexToOklch,
  oklchToHex,
  contrast,
  oklchDistance,
  brightVariant,
} from '../src/color.mjs';

// Reference values copied verbatim from catppuccin/palette v1.8.0 palette.json (Mocha).
const close = (actual, expected, eps, label) =>
  assert.ok(Math.abs(actual - expected) < eps, `${label}: ${actual} vs ${expected}`);

test('hexToRgb parses Mocha rosewater', () => {
  assert.deepEqual(hexToRgb('#f5e0dc'), { r: 245, g: 224, b: 220 });
});

test('rgbToHex round-trips', () => {
  assert.equal(rgbToHex({ r: 245, g: 224, b: 220 }), '#f5e0dc');
});

test('hexToHsl matches palette.json for Mocha rosewater', () => {
  const hsl = hexToHsl('#f5e0dc');
  close(hsl.h, 9.599999999999968, 1e-9, 'h');
  close(hsl.s, 0.555555555555556, 1e-9, 's');
  close(hsl.l, 0.911764705882353, 1e-9, 'l');
});

test('hexToOklch matches palette.json for Mocha rosewater', () => {
  const o = hexToOklch('#f5e0dc');
  close(o.l, 0.922570149778013, 1e-6, 'l');
  close(o.c, 0.02383481197417794, 1e-6, 'c');
  close(o.h, 30.49185525998905, 1e-4, 'h');
});

test('hexToOklch matches palette.json for Mocha surface1', () => {
  const o = hexToOklch('#45475a');
  close(o.l, 0.4036914196944409, 1e-6, 'l');
  close(o.c, 0.03195464132822365, 1e-6, 'c');
  close(o.h, 280.1520036072935, 1e-4, 'h');
});

test('oklchToHex round-trips', () => {
  for (const hex of ['#f5e0dc', '#45475a', '#1e1e2e', '#a6e3a1']) {
    assert.equal(oklchToHex(hexToOklch(hex)), hex);
  }
});

test('contrast follows WCAG 2.x', () => {
  close(contrast('#ffffff', '#000000'), 21, 1e-9, 'white/black');
  close(contrast('#000000', '#000000'), 1, 1e-9, 'black/black');
});

test('oklchDistance is zero for equal colors and symmetric', () => {
  assert.equal(oklchDistance('#a6e3a1', '#a6e3a1'), 0);
  close(oklchDistance('#a6e3a1', '#cdd6f4'), oklchDistance('#cdd6f4', '#a6e3a1'), 1e-12, 'sym');
});

test('brightVariant reproduces Mocha bright ANSI colors', () => {
  // Mocha normal -> bright pairs from palette.json ansiColors.
  const pairs = [
    ['#f38ba8', '#f37799'], // red
  ];
  for (const [normal, bright] of pairs) {
    const d = oklchDistance(brightVariant(normal), bright);
    assert.ok(d < 0.005, `${normal} -> ${brightVariant(normal)}, want ${bright}, dist ${d}`);
  }
});
