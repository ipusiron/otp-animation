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

test('CSP, referrer and noscript are present without inline executable content', () => {
  const html = read('index.html');
  assert.match(html, /http-equiv="Content-Security-Policy"/);
  assert.match(html, /style-src 'self'/);
  assert.doesNotMatch(html, /unsafe-inline|frame-ancestors|\sstyle=|<style\b|\son\w+=/i);
  assert.match(html, /name="referrer" content="no-referrer"/);
  assert.match(html, /<noscript>/);
  assert.match(html.split('</head>')[0], /<script src="js\/theme-init.js"><\/script>/);
});

test('tabs, dialog, controls and labels expose accessible semantics', () => {
  const html = read('index.html');
  assert.equal((html.match(/role="tab"/g) || []).length, 4);
  assert.equal((html.match(/role="tabpanel"/g) || []).length, 4);
  assert.equal((html.match(/aria-selected=/g) || []).length, 4);
  assert.match(html, /id="helpModal"[^>]*role="dialog"[^>]*aria-modal="true"/);
  for (const tag of html.match(/<button\b[^>]*>/g)) assert.match(tag, /type="button"/);
  for (const [, id] of html.matchAll(/<label[^>]*for="([^"]+)"/g)) assert.ok(html.includes(`id="${id}"`), id);
  for (const tag of html.match(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(tag, /rel="noopener noreferrer"/);
});

test('application scripts contain no logging, inline style mutation or blocking prompts', () => {
  for (const file of fs.readdirSync(path.join(root, 'js'))) {
    assert.doesNotMatch(read(`js/${file}`), /console\.(?:log|warn)|\.style\.|\b(?:prompt|alert)\s*\(/);
  }
});

test('saved dark root class styles the body before application initialization', () => {
  assert.match(read('style.css'), /html\.dark-mode body\s*\{[^}]*background: #1a1a1a;[^}]*color: #e0e0e0;/);
});

test('noninteractive toast does not intercept header controls', () => {
  assert.match(read('style.css'), /\.toast\s*\{[^}]*pointer-events: none;/);
});

test('crib experiment exposes controls and safe output containers', () => {
  for (const id of ['experiment4', 'experiment4-content', 'cribEncrypt', 'cribInput', 'cribSearch', 'cribRows',
    'cribAssembly1', 'cribAssembly2', 'cribUndo', 'cribClear', 'cribCustom', 'cribReadable']) {
    assert.match(read('index.html'), new RegExp(`id="${id}"`));
  }
  assert.doesNotMatch(read('js/otp-lab.js'), /innerHTML|console\.log|\.style\./);
});

test('secrecy and tampering expose labelled controls and preserve secret-key separation', () => {
  for (const id of ['experiment5', 'experiment6', 'secrecyPlain', 'secrecyAlternate', 'secrecyEncrypt', 'secrecyKey',
    'secrecyDecoded', 'tamperPlain', 'tamperEncrypt', 'tamperPosition', 'tamperKnown', 'tamperTarget', 'tamperFlip',
    'tamperDelta', 'tamperDecoded', 'tamperKeyDetails']) assert.ok(read('index.html').includes(`id="${id}"`), id);
  assert.match(read('index.html'), /<details id="tamperKeyDetails">/);
  assert.match(read('js/otp-lab.js'), /OtpCore\.flip\(tamperState\.cipher, position - 1, known, target\)/);
});
