'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('every application script has valid classic-script syntax', () => {
  for (const file of fs.readdirSync(path.join(root, 'js'))) new vm.Script(read(`js/${file}`));
});

test('decryption has separate ciphertext and key inputs', () => {
  const html = read('index.html');
  assert.match(html, /id="ciphertext"/);
  assert.match(html, /id="decryptKey"/);
  assert.match(html, /for="decryptKey"/);
  assert.match(html, /id="decryptedText"/);
  assert.match(html, /id="decodeNote"/);
});

test('encryption, decryption, clipboard and exports never log secrets or use blocking dialogs', () => {
  for (const file of ['encryption', 'decryption', 'clipboard', 'file-export']) {
    assert.doesNotMatch(read(`js/${file}.js`), /console\.(?:log|warn)|\b(?:prompt|alert)\s*\(/);
  }
});

test('state holds byte arrays and invalidates results on input', () => {
  assert.match(read('js/encryption.js'), /encryptionState\.key = null/);
  assert.match(read('js/decryption.js'), /decryptionState\.key = null/);
  assert.match(read('js/encryption.js'), /addEventListener\('input', updatePlaintext\)/);
  assert.match(read('js/decryption.js'), /addEventListener\('input', updateDecryptionInputs\)/);
});

test('editing question marks and browser bookmark shortcut are preserved', () => {
  assert.match(read('js/help-modal.js'), /e\.key === '\?' && !editing/);
  assert.doesNotMatch(read('js/dark-mode.js'), /e\.ctrlKey|e\.metaKey/);
});
