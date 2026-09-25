'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

test('new JavaScript and tests remain readable', () => {
  for (const name of ['js/otp-core.js', 'test/core.test.js', 'test/format.test.js']) {
    read(name).split(/\r?\n/).forEach((line, i) => assert.ok(line.length <= 160, `${name}:${i + 1}`));
  }
});

test('existing document and stylesheet structure is retained', () => {
  assert.ok(read('style.css').split('\n').length >= 1500);
  assert.ok(read('index.html').split('\n').length >= 500);
  assert.ok(read('js/otp-core.js').split('\n').length >= 80);
});
