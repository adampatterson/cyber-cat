import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrast, hexToOklch, oklchDistance } from '../src/color.mjs';
import { colors, ACCENTS, NEUTRALS } from '../src/seeds.mjs';

const hex = (key) => colors[key].hex;

test('has the 26 Catppuccin roles in order', () => {
  assert.deepEqual(Object.keys(colors), [...ACCENTS, ...NEUTRALS]);
  assert.equal(ACCENTS.length, 14);
  assert.equal(NEUTRALS.length, 12);
});

test('keeps the reference seeds pinned', () => {
  assert.equal(hex('base'), '#192631');
  assert.equal(hex('surface0'), '#1e332c');
  assert.equal(hex('overlay0'), '#4b6c52');
  assert.equal(hex('subtext0'), '#8bb07c');
  assert.equal(hex('text'), '#d0e4b3');
});

test('keeps red, peach, yellow, blue and mauve at Mocha values', () => {
  assert.equal(hex('red'), '#f38ba8');
  assert.equal(hex('peach'), '#fab387');
  assert.equal(hex('yellow'), '#f9e2af');
  assert.equal(hex('blue'), '#89b4fa');
  assert.equal(hex('mauve'), '#cba6f7');
});

test('neutral lightness rises from crust to text', () => {
  const ls = [...NEUTRALS].reverse().map((k) => hexToOklch(hex(k)).l);
  for (let i = 1; i < ls.length; i++) {
    assert.ok(ls[i] > ls[i - 1], `${[...NEUTRALS].reverse()[i]} is not lighter than the step below`);
  }
});

test('text roles meet contrast targets on base', () => {
  assert.ok(contrast(hex('text'), hex('base')) >= 7, 'text');
  assert.ok(contrast(hex('subtext1'), hex('base')) >= 4.5, 'subtext1');
  assert.ok(contrast(hex('subtext0'), hex('base')) >= 4.5, 'subtext0');
  assert.ok(contrast(hex('overlay1'), hex('base')) >= 3, 'overlay1');
});

test('every accent reads on base, and base reads on every accent', () => {
  for (const k of ACCENTS) {
    const r = contrast(hex(k), hex('base'));
    assert.ok(r >= 4.5, `${k} ${hex(k)} on base: ${r.toFixed(2)}`);
  }
});

test('green and teal accents are distinct from the green UI text', () => {
  for (const accent of ['green', 'teal']) {
    for (const ui of ['text', 'subtext1', 'subtext0']) {
      const d = oklchDistance(hex(accent), hex(ui));
      assert.ok(d >= 0.08, `${accent} vs ${ui}: ${d.toFixed(3)}`);
    }
  }
});

test('accents are distinct from each other', () => {
  for (let i = 0; i < ACCENTS.length; i++) {
    for (let j = i + 1; j < ACCENTS.length; j++) {
      const d = oklchDistance(hex(ACCENTS[i]), hex(ACCENTS[j]));
      assert.ok(d >= 0.03, `${ACCENTS[i]} vs ${ACCENTS[j]}: ${d.toFixed(3)}`);
    }
  }
});
