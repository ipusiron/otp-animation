// UTF-8 byte operations shared by the browser and Node tests.
'use strict';

const OtpCore = (() => {
  const MAX_BYTES = 64;

  function encodeText(text) {
    return Array.from(new TextEncoder().encode(String(text)));
  }

  function charSpans(text) {
    const spans = [];
    let start = 0;
    for (const ch of String(text)) {
      const len = new TextEncoder().encode(ch).length;
      spans.push({ char: ch, start, length: len });
      start += len;
    }
    return spans;
  }

  function validateText(text) {
    const s = String(text);
    if (!s.length) return { ok: false, reason: 'empty' };
    if (/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(s)) {
      return { ok: false, reason: 'surrogate' };
    }
    const ctrl = [...s].find(c => { const p = c.codePointAt(0); return p < 0x20 || p === 0x7f; });
    if (ctrl !== undefined) return { ok: false, reason: 'control', char: ctrl.codePointAt(0) };
    const n = encodeText(s).length;
    if (n > MAX_BYTES) return { ok: false, reason: 'tooLong', bytes: n };
    return { ok: true, bytes: n };
  }

  function decodeBytes(bytes) {
    const u8 = Uint8Array.from(bytes);
    try {
      return { text: new TextDecoder('utf-8', { fatal: true }).decode(u8), valid: true };
    } catch {
      return { text: new TextDecoder('utf-8').decode(u8), valid: false };
    }
  }

  function bytesToBits(bytes) {
    return bytes.flatMap(b => b.toString(2).padStart(8, '0').split('').map(Number));
  }

  function bitsToBytes(bits) {
    if (bits.length % 8 !== 0) throw new Error('notByteAligned');
    const out = [];
    for (let i = 0; i < bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8).join(''), 2));
    return out;
  }

  function toHex(bytes) {
    return bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
  }

  function parseHex(text) {
    const s = String(text).replace(/0x/gi, '').replace(/[\s:\-_]/g, '');
    if (!s.length) throw new Error('empty');
    if (!/^[0-9a-fA-F]+$/.test(s)) throw new Error('notHex');
    if (s.length % 2) throw new Error('oddLength');
    const out = [];
    for (let i = 0; i < s.length; i += 2) out.push(parseInt(s.slice(i, i + 2), 16));
    return out;
  }

  function parseBits(text) {
    const s = String(text).replace(/[\s_\-,|]/g, '');
    if (!s.length) throw new Error('empty');
    if (!/^[01]+$/.test(s)) throw new Error('notBits');
    if (s.length % 8) throw new Error('notByteAligned');
    return s.split('').map(Number);
  }

  function xorBytes(a, b) {
    if (a.length !== b.length) throw new Error('lengthMismatch');
    return a.map((x, i) => x ^ b[i]);
  }

  function randomBytes(n, fill = u8 => globalThis.crypto.getRandomValues(u8)) {
    const u8 = new Uint8Array(n);
    fill(u8);
    return Array.from(u8);
  }

  return {
    MAX_BYTES, encodeText, charSpans, validateText, decodeBytes, bytesToBits,
    bitsToBytes, toHex, parseHex, parseBits, xorBytes, randomBytes
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = OtpCore;
}

// Temporary stage-one adapters: keep the existing ASCII screen unchanged.
function textToBits(text) {
  return OtpCore.bytesToBits(OtpCore.encodeText(text));
}

function textToBitsWithValidation(text) {
  const chars = [...text];
  const index = chars.findIndex(ch => ch.codePointAt(0) < 32 || ch.codePointAt(0) > 126);
  return {
    bits: textToBits(index < 0 ? text : chars.slice(0, index).join('')),
    invalidChar: index < 0 ? null : chars[index]
  };
}

function bitsToText(bits) {
  return String.fromCharCode(...OtpCore.bitsToBytes(bits));
}

function generateRandomBits(length) {
  return OtpCore.bytesToBits(OtpCore.randomBytes(Math.ceil(length / 8))).slice(0, length);
}

function xorBits(bits1, bits2) {
  return OtpCore.bytesToBits(OtpCore.xorBytes(OtpCore.bitsToBytes(bits1), OtpCore.bitsToBytes(bits2)));
}
