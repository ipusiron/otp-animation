// 共通ユーティリティ関数

// テキストを8bit単位でビット列（配列）に変換
function textToBits(text) {
  return text
    .split('')
    .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('')
    .split('')
    .map(bit => parseInt(bit));
}

// ビット列変換 + 不正文字チェック
function textToBitsWithValidation(text) {
  const bits = [];
  let invalidChar = null;

  for (const char of text) {
    const code = char.codePointAt(0);

    if (code < 32 || code > 126) {
      invalidChar = char;
      break;
    }

    const bin = code.toString(2).padStart(8, '0');
    bin.split('').forEach(bit => bits.push(Number(bit)));
  }

  return { bits, invalidChar };
}

// ビット列をテキストに変換
function bitsToText(bits) {
  let text = '';
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.slice(i, i + 8).join('');
    const charCode = parseInt(byte, 2);
    text += String.fromCharCode(charCode);
  }
  return text;
}

// 指定長のランダムビット列（鍵）を生成
function generateRandomBits(length) {
  return Array.from({ length }, () => Math.round(Math.random()));
}

// XOR処理（ビット単位）
function xorBits(bits1, bits2) {
  return bits1.map((bit, i) => bit ^ bits2[i]);
}