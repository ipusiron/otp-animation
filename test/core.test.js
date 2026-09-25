'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../js/otp-core.js');

const answers = [
  ['HELLO', '48 45 4C 4C 4F', 5, 'H@0+1 E@1+1 L@2+1 L@3+1 O@4+1', '29 72 BB 04 4D', '61 37 F7 48 02', '01001000'],
  ['A', '41', 1, 'A@0+1', '29', '68', '01000001'],
  ['あ', 'E3 81 82', 3, 'あ@0+3', '29 72 BB', 'CA F3 39', '11100011'],
  ['OTP暗号', '4F 54 50 E6 9A 97 E5 8F B7', 9, 'O@0+1 T@1+1 P@2+1 暗@3+3 号@6+3',
    '29 72 BB 04 4D 96 DF 28 71', '66 26 EB E2 D7 01 3A A7 C6', '01001111'],
  ['Hi!?', '48 69 21 3F', 4, 'H@0+1 i@1+1 !@2+1 ?@3+1', '29 72 BB 04', '61 1B 9A 3B', '01001000'],
  ['😀', 'F0 9F 98 80', 4, '😀@0+4', '29 72 BB 04', 'D9 ED 23 84', '11110000']
];

function fixedKey(n) {
  return core.randomBytes(n, u8 => u8.forEach((_, i) => { u8[i] = (i * 73 + 41) & 0xff; }));
}

for (const [text, hex, n, spans, keyHex, cipherHex, first] of answers) {
  test(`known answer: ${text}`, () => {
    const bytes = core.encodeText(text);
    const key = fixedKey(n);
    const cipher = core.xorBytes(bytes, key);
    assert.equal(core.toHex(bytes), hex);
    assert.equal(bytes.length, n);
    assert.equal(core.charSpans(text).map(s => `${s.char}@${s.start}+${s.length}`).join(' '), spans);
    assert.equal(core.toHex(key), keyHex);
    assert.equal(core.toHex(cipher), cipherHex);
    assert.equal(core.bytesToBits(bytes).slice(0, 8).join(''), first);
    assert.deepEqual(core.decodeBytes(core.xorBytes(cipher, key)), { text, valid: true });
  });
}

const validations = [
  ['', { ok: false, reason: 'empty' }],
  ['HELLO', { ok: true, bytes: 5 }],
  ['a\tb', { ok: false, reason: 'control', char: 9 }],
  ['x\u007fy', { ok: false, reason: 'control', char: 127 }],
  ['A'.repeat(64), { ok: true, bytes: 64 }],
  ['A'.repeat(65), { ok: false, reason: 'tooLong', bytes: 65 }],
  ['あ'.repeat(21), { ok: true, bytes: 63 }],
  ['あ'.repeat(22), { ok: false, reason: 'tooLong', bytes: 66 }],
  ['\ud800x', { ok: false, reason: 'surrogate' }]
];
for (const [text, expected] of validations) {
  test(`validate ${JSON.stringify(text)}`, () => assert.deepEqual(core.validateText(text), expected));
}

for (const [bytes, text, valid] of [
  [[0x48, 0x49], 'HI', true], [[0xe3, 0x81, 0x82], 'あ', true],
  [[0xe3, 0x81], '\ufffd', false], [[0xff], '\ufffd', false], [[0x80, 0x41], '\ufffdA', false]
]) {
  test(`decode ${bytes}`, () => assert.deepEqual(core.decodeBytes(bytes), { text, valid }));
}

test('valid hexadecimal and binary inputs', () => {
  assert.deepEqual(core.parseHex('48 45 4c 4c 4f'), [72, 69, 76, 76, 79]);
  assert.deepEqual(core.parseHex('0x48:0x49'), [72, 73]);
  assert.deepEqual(core.parseBits('01001000_01001001'), [0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
});

for (const [fn, args, message] of [
  ['parseHex', ['484'], 'oddLength'], ['parseHex', ['zz'], 'notHex'], ['parseHex', [''], 'empty'],
  ['parseBits', ['0100'], 'notByteAligned'], ['parseBits', ['0102'], 'notBits'],
  ['parseBits', [''], 'empty'], ['xorBytes', [[1, 2], [1]], 'lengthMismatch'],
  ['bitsToBytes', [[0, 1]], 'notByteAligned']
]) {
  test(`${fn}: ${message}`, () => assert.throws(() => core[fn](...args), { message }));
}

test('seeded mixed UTF-8 and byte round trips: 200 texts', () => {
  let seed = 0x12345678;
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  const alphabet = [...'ABC !?あいう暗号😀🌊'];
  for (let i = 0; i < 200; i++) {
    const text = Array.from({ length: 1 + next() % 16 }, () => alphabet[next() % alphabet.length]).join('');
    const bytes = core.encodeText(text);
    const key = core.randomBytes(bytes.length, u8 => u8.forEach((_, j) => { u8[j] = next() & 255; }));
    assert.deepEqual(core.decodeBytes(core.xorBytes(core.xorBytes(bytes, key), key)), { text, valid: true });
    assert.deepEqual(core.bitsToBytes(core.bytesToBits(bytes)), bytes);
    assert.deepEqual(core.parseHex(core.toHex(bytes)), bytes);
  }
});

test('default randomness requests getRandomValues with the requested length', t => {
  let requested;
  t.mock.method(globalThis.crypto, 'getRandomValues', u8 => { requested = u8.length; return u8.fill(29); });
  assert.deepEqual(core.randomBytes(9), Array(9).fill(29));
  assert.equal(requested, 9);
});

test('no weak random generator in application scripts', () => {
  for (const name of fs.readdirSync(path.join(__dirname, '../js'))) {
    assert.doesNotMatch(fs.readFileSync(path.join(__dirname, '../js', name), 'utf8'), /Math\.random/);
  }
});
