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

  const CRIB_SAMPLE = {
    p1: 'MEET ME AT THE NORTH GATE AT NOON',
    p2: 'THE PACKAGE IS UNDER THE OLD OAK.'
  };

  function isReadable(bytes) {
    return bytes.length > 0 && bytes.every(b =>
      (b >= 0x41 && b <= 0x5a) || (b >= 0x61 && b <= 0x7a) || [0x20, 0x2e, 0x2c, 0x27].includes(b));
  }

  function cribDrag(x, crib) {
    const c = encodeText(crib);
    const out = [];
    for (let i = 0; i + c.length <= x.length; i++) {
      const bytes = c.map((b, k) => b ^ x[i + k]);
      out.push({ offset: i, bytes, text: String.fromCharCode(...bytes), readable: isReadable(bytes) });
    }
    return out;
  }

  function assemble(x, placements) {
    const p1 = new Array(x.length).fill(null), p2 = new Array(x.length).fill(null);
    const conflict = new Set();
    for (const { offset, crib, into } of placements) {
      const c = encodeText(crib);
      c.forEach((b, k) => {
        const i = offset + k;
        if (i >= x.length) return;
        const [mine, other] = into === 1 ? [p1, p2] : [p2, p1];
        if (mine[i] !== null && mine[i] !== b) conflict.add(i);
        mine[i] = b;
        other[i] = b ^ x[i];
      });
    }
    const show = a => a.map(b => (b === null ? '_' : String.fromCharCode(b))).join('');
    return { p1: show(p1), p2: show(p2), known: p1.filter(b => b !== null).length, conflict: [...conflict].sort((a, b) => a - b) };
  }

  function forgeKey(c, alt) {
    return xorBytes(c, encodeText(alt));
  }

  function flip(c, offset, known, target) {
    const a = encodeText(known), b = encodeText(target);
    if (a.length !== b.length) throw new Error('lengthMismatch');
    if (offset < 0 || offset + a.length > c.length) throw new Error('outOfRange');
    const out = c.slice();
    a.forEach((v, k) => { out[offset + k] ^= v ^ b[k]; });
    return out;
  }

  return {
    MAX_BYTES, encodeText, charSpans, validateText, decodeBytes, bytesToBits,
    bitsToBytes, toHex, parseHex, parseBits, xorBytes, randomBytes,
    CRIB_SAMPLE, isReadable, cribDrag, assemble, forgeKey, flip
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = OtpCore;
}
