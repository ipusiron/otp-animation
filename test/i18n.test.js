'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const i18n = require('../js/i18n.js');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const ranges = [[0x3040, 0x30ff], [0x4e00, 0x9fff], [0xff01, 0xff60]];
const japanese = new RegExp('[' + ranges.map(([a, b]) =>
  String.fromCodePoint(a) + '-' + String.fromCodePoint(b)).join('') + ']');

test('crib experiment has bilingual instructions and outcome messages', () => {
  for (const key of ['crib.title', 'crib.intro', 'crib.history', 'crib.conflict', 'crib.complete', 'crib.shorter']) {
    assert.ok(i18n.ja[key]);
    assert.ok(i18n.en[key]);
  }
});

test('Japanese and English dictionaries have identical nonempty keys', () => {
  assert.deepEqual(Object.keys(i18n.ja).sort(), Object.keys(i18n.en).sort());
  for (const dictionary of [i18n.ja, i18n.en]) {
    for (const [key, value] of Object.entries(dictionary)) assert.ok(typeof value === 'string' && value.trim(), key);
  }
  for (const [key, value] of Object.entries(i18n.en)) assert.doesNotMatch(value, japanese, key);
});

test('all literal translation calls and HTML translation attributes have dictionary entries', () => {
  for (const file of fs.readdirSync(path.join(root, 'js'))) {
    const source = read(`js/${file}`);
    for (const [, key] of source.matchAll(/i18n\.t\(['"]([^'"]+)['"]/g)) assert.ok(key in i18n.ja, key);
  }
  for (const [, key] of read('index.html').matchAll(/data-i18n(?:-[\w-]+)?="([^"]+)"/g)) {
    assert.ok(key in i18n.ja, key);
  }
});

test('application scripts have no Japanese literals outside the dictionary or comments', () => {
  for (const file of fs.readdirSync(path.join(root, 'js')).filter(name => name !== 'i18n.js')) {
    const source = read(`js/${file}`).replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
    assert.doesNotMatch(source, japanese, file);
  }
});

test('translation parameter placeholders match in both languages', () => {
  const placeholders = value => (value.match(/\{\w+\}/g) || []).sort();
  for (const key of Object.keys(i18n.ja)) assert.deepEqual(placeholders(i18n.ja[key]), placeholders(i18n.en[key]), key);
});
