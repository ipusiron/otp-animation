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

const sampleXorHex = '19 0D 00 74 70 0C 06 6B 00 13 65 74 01 16 00 1B 01 16 11 1A 00 13 09 11 65 6F 0D 10 00 01 0E 04 60';
const sampleXor = core.parseHex(sampleXorHex);

test('crib sample is two 33-byte texts with the reference XOR', () => {
  assert.deepEqual(core.CRIB_SAMPLE, {
    p1: 'MEET ME AT THE NORTH GATE AT NOON', p2: 'THE PACKAGE IS UNDER THE OLD OAK.'
  });
  const a = core.encodeText(core.CRIB_SAMPLE.p1), b = core.encodeText(core.CRIB_SAMPLE.p2);
  assert.equal(a.length, 33);
  assert.equal(b.length, 33);
  assert.equal(core.toHex(core.xorBytes(a, b)), sampleXorHex);
  for (const key of [fixedKey(33), Array(33).fill(0), Array(33).fill(255)]) {
    assert.deepEqual(core.xorBytes(core.xorBytes(a, key), core.xorBytes(b, key)), sampleXor);
  }
});

for (const [crib, count, readable] of [
  [' THE ', 29, [[4, 'PXN. '], [10, 'E IS '], [20, ' GATE']]],
  ['THE ', 30, [[0, 'MEET'], [5, 'XN. '], [11, ' IS '], [21, 'GATE'], [27, 'DHD.']]],
  [' AT ', 30, [[4, 'PMRK'], [7, 'KAGE'], [25, 'OLD ']]],
  ['NORTH', 29, [[12, 'OYROI'], [14, 'NTSBY'], [15, 'UNDER'], [16, 'OYCNH']]],
  ['PACKAGE', 27, [[4, ' ME AT '], [16, 'QWRQATL'], [17, 'FPYKRNT'], [21, 'CHR..JU']]]
]) {
  test(`reference crib candidates: ${JSON.stringify(crib)}`, () => {
    const rows = core.cribDrag(sampleXor, crib);
    assert.equal(rows.length, count);
    assert.equal(rows.length, sampleXor.length - core.encodeText(crib).length + 1);
    assert.deepEqual(rows.filter(row => row.readable).map(row => [row.offset, row.text]), readable);
    for (const row of rows) assert.deepEqual(row.bytes, [...row.text].map(ch => ch.charCodeAt(0)));
  });
}

test('reference assembly and conflict', () => {
  assert.deepEqual(core.assemble(sampleXor, [
    { offset: 11, crib: 'THE NORTH', into: 1 }, { offset: 0, crib: 'THE PACKAGE', into: 2 }
  ]), { p1: 'MEET ME AT THE NORTH_____________', p2: 'THE PACKAGE IS UNDER_____________', known: 20, conflict: [] });
  assert.deepEqual(core.assemble(sampleXor, [
    { offset: 0, crib: 'MEET', into: 1 }, { offset: 2, crib: 'XX', into: 1 }
  ]), { p1: 'MEXX_____________________________', p2: 'THX,_____________________________', known: 4, conflict: [2, 3] });
});

test('complete sample assembly restores both original texts', () => {
  assert.deepEqual(core.assemble(sampleXor, [
    { offset: 0, crib: core.CRIB_SAMPLE.p1, into: 1 }, { offset: 0, crib: core.CRIB_SAMPLE.p2, into: 2 }
  ]), { ...core.CRIB_SAMPLE, known: 33, conflict: [] });
});

test('readability boundaries', () => {
  for (const text of ['', '123', '!', '?', '-', 'あ', '\n']) assert.equal(core.isReadable(core.encodeText(text)), false);
  for (const text of ['a', 'z', 'A', 'Z', ' ', '.', ',', "'"]) assert.equal(core.isReadable(core.encodeText(text)), true);
});

const secrecyCipher = core.parseHex('68 26 EF 45 0E DD FF 69 25 9A 47 0D C2 90');
test('reference perfect-secrecy ciphertext and keys', () => {
  assert.equal(core.toHex(fixedKey(14)), '29 72 BB 04 4D 96 DF 28 71 BA 03 4C 95 DE');
  assert.deepEqual(core.xorBytes(core.encodeText('ATTACK AT DAWN'), fixedKey(14)), secrecyCipher);
  for (const [alt, expected] of [
    ['RETREAT AT SIX', '3A 63 BB 17 4B 9C AB 49 64 CE 67 5E 8B C8'],
    ['撤退せよ!!', '8E B4 4B AC 8E 5D 1C E8 BE 79 C5 85 E3 B1']
  ]) {
    const key = core.forgeKey(secrecyCipher, alt);
    assert.equal(core.toHex(key), expected);
    assert.deepEqual(core.decodeBytes(core.xorBytes(secrecyCipher, key)), { text: alt, valid: true });
  }
  assert.throws(() => core.forgeKey(secrecyCipher, 'RETREAT'), { message: 'lengthMismatch' });
});

const paymentCipher = core.parseHex('79 33 E2 24 7C A6 EF 08 28 FF 4D 6C C1 91 07 32 F6 40');
test('reference tampering changes amount or recipient without the key', () => {
  assert.equal(core.toHex(fixedKey(18)), '29 72 BB 04 4D 96 DF 28 71 BA 03 4C 95 DE 27 70 B9 02');
  assert.deepEqual(core.xorBytes(core.encodeText('PAY 100 YEN TO BOB'), fixedKey(18)), paymentCipher);
  for (const [offset, known, target, hex, text] of [
    [4, '100', '900', '79 33 E2 24 74 A6 EF 08 28 FF 4D 6C C1 91 07 32 F6 40', 'PAY 900 YEN TO BOB'],
    [15, 'BOB', 'EVE', '79 33 E2 24 7C A6 EF 08 28 FF 4D 6C C1 91 07 35 EF 47', 'PAY 100 YEN TO EVE']
  ]) {
    const result = core.flip(paymentCipher, offset, known, target);
    assert.equal(core.toHex(result), hex);
    assert.equal(core.decodeBytes(core.xorBytes(result, fixedKey(18))).text, text);
  }
  const delta = core.xorBytes(paymentCipher, core.flip(paymentCipher, 4, '100', '900'));
  assert.equal(core.toHex(delta), '00 00 00 00 08 00 00 00 00 00 00 00 00 00 00 00 00 00');
  assert.throws(() => core.flip(paymentCipher, 4, '100', '9000'), { message: 'lengthMismatch' });
  assert.throws(() => core.flip(paymentCipher, 17, 'BOB', 'EVE'), { message: 'outOfRange' });
});

test('seeded forgeKey and flip properties: 100 cases each', () => {
  let seed = 0x12345678;
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  for (let i = 0; i < 100; i++) {
    const n = 1 + next() % 64;
    const text = Array.from({ length: n }, () => String.fromCharCode(32 + next() % 95)).join('');
    const alt = Array.from({ length: n }, () => String.fromCharCode(32 + next() % 95)).join('');
    const cipher = core.xorBytes(core.encodeText(text), fixedKey(n));
    assert.equal(core.decodeBytes(core.xorBytes(cipher, core.forgeKey(cipher, alt))).text, alt);
    const offset = next() % n, length = 1 + next() % (n - offset);
    const before = cipher.slice();
    const result = core.flip(cipher, offset, text.slice(offset, offset + length), alt.slice(offset, offset + length));
    assert.deepEqual(cipher, before);
    assert.deepEqual(result.slice(0, offset), cipher.slice(0, offset));
    assert.deepEqual(result.slice(offset + length), cipher.slice(offset + length));
    assert.equal(core.decodeBytes(core.xorBytes(result, fixedKey(n))).text,
      text.slice(0, offset) + alt.slice(offset, offset + length) + text.slice(offset + length));
  }
});
