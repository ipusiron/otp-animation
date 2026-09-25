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
  if (!bits || bits.length === 0) return `${label}: ${i18n.t('export.none')}\n`;
  
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
  content += (decrypt ? i18n.t('export.decryption') : i18n.t('export.encryption')) + '\n';
  content += i18n.t('export.date', { date: new Date().toISOString() }) + '\n\n';
  content += formatTextWithAscii(OtpCore.decodeBytes(plain).text, i18n.t('export.plain'));
  for (const [label, bytes] of [[i18n.t('export.plain'), plain], [i18n.t('export.key'), state.key], [i18n.t('export.cipher'), cipher]]) {
    content += `${label} (${i18n.t('export.hex')}): ${OtpCore.toHex(bytes)}\n`;
    content += formatBitsForFile(OtpCore.bytesToBits(bytes), label);
  }
  content += '\n' + i18n.t('export.steps') + '\n';
  const plainBits = OtpCore.bytesToBits(plain);
  const keyBits = OtpCore.bytesToBits(state.key);
  const cipherBits = OtpCore.bytesToBits(cipher);
  for (let i = 0; i < plainBits.length; i++) {
    content += i18n.t('export.bit', { n: i + 1, p: plainBits[i], k: keyBits[i], c: cipherBits[i] }) + '\n';
  }
  content += '\n' + i18n.t('export.note') + '\n';
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
