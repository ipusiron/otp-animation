'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const css = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8');
const block = pattern => Object.fromEntries([...css.match(pattern)[1].matchAll(/--([\w-]+):\s*(#[\da-f]+);/gi)]
  .map(m => [m[1], m[2]]));
const light = block(/:root\s*\{([^}]+)\}/);
const dark = block(/body\.dark-mode,\s*html\.dark-mode\s*\{([^}]+)\}/);
const lum = hex => hex.slice(1).match(/../g).map(x => parseInt(x, 16) / 255)
  .map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
  .reduce((sum, x, i) => sum + x * [0.2126, 0.7152, 0.0722][i], 0);
const pairs = [
  ['light', 'accent', '#f9f9f9'], ['light', 'accent', '#ffffff'], ['light', '#ffffff', 'accent'],
  ['light', 'green', '#ffffff'], ['light', 'blue', '#ffffff'], ['light', '#ffffff', 'blue'],
  ['light', 'orange-ink', '#ffe0cc'], ['light', 'orange-ink', '#fff8e1'],
  ['light', 'purple', '#ffffff'], ['light', 'purple', '#fafafa'],
  ['light', 'pink', '#f8f9fa'], ['light', 'pink', '#f8f9fa'], ['light', 'orange-ink', '#ffffff'],
  ['light', 'muted', '#f9f9f9'], ['light', 'disabled-ink', '#f0f0f0'],
  ['dark', 'table-ink', 'table-bg'], ['dark', 'purple', '#333333'], ['dark', 'purple', '#2a2a2a'],
  ['dark', 'error-ink', '#333333'], ['dark', 'pink', '#404040'], ['dark', 'disabled-ink', '#1a1a1a'],
  ['light', 'toast-ink', 'toast-bg'], ['light', 'toast-ink', 'toast-success-bg'], ['light', 'toast-ink', 'toast-error-bg'],
  ['dark', 'toast-ink', 'toast-bg'], ['dark', 'toast-ink', 'toast-success-bg'], ['dark', 'toast-ink', 'toast-error-bg']
];

for (const [index, [theme, foreground, background]] of pairs.entries()) {
  test(`F-1 pair ${index + 1}: ${theme} ${foreground}/${background}`, () => {
    const vars = theme === 'light' ? light : dark;
    const resolve = value => value.startsWith('#') ? value : vars[value];
    const a = lum(resolve(foreground));
    const b = lum(resolve(background));
    assert.ok((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5);
  });
}

test('toast selectors use the tested theme variables', () => {
  for (const [suffix, background] of [['', 'toast-bg'], ['.success', 'toast-success-bg'], ['.error', 'toast-error-bg']]) {
    for (const prefix of ['', ':is(html.dark-mode, body.dark-mode) ']) {
      const selector = `${prefix}.toast${suffix} {`;
      const start = css.indexOf(selector);
      assert.ok(start >= 0, selector);
      const declarations = css.slice(start + selector.length, css.indexOf('}', start));
      assert.ok(declarations.includes(`background: var(--${background})`), selector);
    }
  }
  assert.match(css, /\.toast\s*\{[^}]*color: var\(--toast-ink\)/);
});
