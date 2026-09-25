// 拡張ファイル出力機能

// ファイルをダウンロードする共通関数
function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
}

// ビット列を8ビット区切りで整形
function formatBitsForFile(bits, label) {
  if (!bits || bits.length === 0) return `${label}: (なし)\n`;
  
  const bitString = bits.join('');
  const chunks = [];
  
  for (let i = 0; i < bitString.length; i += 8) {
    chunks.push(bitString.slice(i, i + 8));
  }
  
  return `${label}: ${chunks.join('_')}\n`;
}

// UTF-8 text and hexadecimal bytes are exported without interpreting ciphertext as text.
function formatTextWithAscii(text, label) {
  return `${label}: "${text}"\n${label} (UTF-8): ${OtpCore.toHex(OtpCore.encodeText(text))}\n`;
}

function buildExportContent(mode) {
  const decrypt = mode === 'decryption';
  const state = decrypt ? decryptionState : encryptionState;
  const plain = decrypt ? decryptionPlain() : state.plain;
  const cipher = decrypt ? state.cipher : encryptionCipher();
  if (!state.key || state.completed !== plain.length * 8) return '';
  let content = '='.repeat(60) + '\n';
  content += decrypt ? 'OTP復号結果レポート\n' : 'OTP暗号化結果レポート\n';
  content += `出力日時: ${new Date().toISOString()}\n\n`;
  content += formatTextWithAscii(OtpCore.decodeBytes(plain).text, '平文');
  for (const [label, bytes] of [['平文', plain], ['鍵', state.key], ['暗号文', cipher]]) {
    content += `${label} (16進数): ${OtpCore.toHex(bytes)}\n`;
    content += formatBitsForFile(OtpCore.bytesToBits(bytes), label);
  }
  content += '\n【XOR演算詳細】\n';
  const plainBits = OtpCore.bytesToBits(plain);
  const keyBits = OtpCore.bytesToBits(state.key);
  const cipherBits = OtpCore.bytesToBits(cipher);
  for (let i = 0; i < plainBits.length; i++) {
    content += `ビット${i + 1}: ${plainBits[i]} XOR ${keyBits[i]} = ${cipherBits[i]}\n`;
  }
  content += '\n※ 鍵が真にランダムで、平文と同じ長さで、一度しか使わず、秘密に保たれるときに限り、';
  content += '暗号文から平文の情報は得られません（完全秘匿性）。';
  content += 'このファイルには鍵が含まれるため、教材としての記録です。\n';
  return content;
}

function exportEncryptionResult() {
  const content = buildExportContent('encryption');
  if (content) downloadFile(content, `otp-encryption-${Date.now()}.txt`);
}

function exportDecryptionResult() {
  const content = buildExportContent('decryption');
  if (content) downloadFile(content, `otp-decryption-${Date.now()}.txt`);
}

// ファイル出力ボタンのイベントハンドラを設定
function setupFileExportHandlers() {
  // 暗号化結果出力ボタン
  const exportEncryption = document.getElementById('exportEncryption');
  if (exportEncryption) {
    exportEncryption.addEventListener('click', () => {
      exportEncryptionResult();
    });
  }

  // 復号結果出力ボタン
  const exportDecryption = document.getElementById('exportDecryption');
  if (exportDecryption) {
    exportDecryption.addEventListener('click', () => {
      exportDecryptionResult();
    });
  }
}
