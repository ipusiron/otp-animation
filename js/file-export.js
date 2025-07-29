// ファイル出力機能

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
  
  console.log(`📄 ファイル出力: ${filename}`);
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

// テキストをASCII情報付きで出力
function formatTextWithAscii(text, label) {
  if (!text) return `${label}: (なし)\n`;
  
  let result = `${label}: "${text}"\n`;
  result += `${label}(ASCII): `;
  
  const asciiCodes = [];
  for (const char of text) {
    asciiCodes.push(char.codePointAt(0));
  }
  result += asciiCodes.join(' ') + '\n';
  
  return result;
}

// 暗号化結果をファイル出力
function exportEncryptionResult() {
  if (!plainBits.length || !keyBits.length || !cipherBits.length) {
    alert('暗号化処理が完了していません。まず暗号化を実行してください。');
    return;
  }
  
  const plainText = document.getElementById('plaintext').value;
  const cipherText = bitsToText(cipherBits);
  
  const timestamp = new Date().toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  let content = '';
  content += '='.repeat(60) + '\n';
  content += 'OTP暗号化結果レポート\n';
  content += '='.repeat(60) + '\n';
  content += `出力日時: ${timestamp}\n`;
  content += `URL: ${window.location.href}\n\n`;
  
  content += '【入力データ】\n';
  content += formatTextWithAscii(plainText, '平文');
  content += '\n';
  
  content += '【処理結果】\n';
  content += formatBitsForFile(plainBits, '平文ビット');
  content += formatBitsForFile(keyBits, '鍵ビット');
  content += formatBitsForFile(cipherBits, '暗号文ビット');
  content += '\n';
  
  content += '【出力データ】\n';
  content += formatTextWithAscii(cipherText, '暗号文');
  content += '\n';
  
  content += '【XOR演算詳細】\n';
  for (let i = 0; i < plainBits.length; i++) {
    const byteIndex = Math.floor(i / 8);
    const bitIndex = i % 8;
    if (bitIndex === 0) {
      const char = String.fromCharCode(
        plainBits.slice(i, i + 8).reduce((acc, bit, j) => acc + bit * Math.pow(2, 7 - j), 0)
      );
      content += `\n${byteIndex + 1}文字目 '${char}' (ASCII: ${char.codePointAt(0)}):\n`;
    }
    content += `  ビット${bitIndex + 1}: ${plainBits[i]} XOR ${keyBits[i]} = ${cipherBits[i]}\n`;
  }
  
  content += '\n' + '='.repeat(60) + '\n';
  content += '※ OTP(One-Time Pad)は理論的に解読不可能な暗号方式です\n';
  content += '※ 鍵は平文と同じ長さで、一度だけ使用してください\n';
  content += '='.repeat(60) + '\n';
  
  const filename = `otp-encryption-${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')}.txt`;
  downloadFile(content, filename);
}

// 復号結果をファイル出力
function exportDecryptionResult() {
  if (!cipherTextBits.length || !decryptKeyBits.length || !decryptedTextBits.length) {
    alert('復号処理が完了していません。まず復号を実行してください。');
    return;
  }
  
  const cipherText = document.getElementById('ciphertext').value;
  const decryptedText = bitsToText(decryptedTextBits);
  
  const timestamp = new Date().toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  let content = '';
  content += '='.repeat(60) + '\n';
  content += 'OTP復号結果レポート\n';
  content += '='.repeat(60) + '\n';
  content += `出力日時: ${timestamp}\n`;
  content += `URL: ${window.location.href}\n\n`;
  
  content += '【入力データ】\n';
  content += formatTextWithAscii(cipherText, '暗号文');
  content += '\n';
  
  content += '【処理結果】\n';
  content += formatBitsForFile(cipherTextBits, '暗号文ビット');
  content += formatBitsForFile(decryptKeyBits, '復号鍵ビット');
  content += formatBitsForFile(decryptedTextBits, '復号文ビット');
  content += '\n';
  
  content += '【出力データ】\n';
  content += formatTextWithAscii(decryptedText, '復号文');
  content += '\n';
  
  content += '【XOR演算詳細】\n';
  for (let i = 0; i < cipherTextBits.length; i++) {
    const byteIndex = Math.floor(i / 8);
    const bitIndex = i % 8;
    if (bitIndex === 0) {
      const char = String.fromCharCode(
        cipherTextBits.slice(i, i + 8).reduce((acc, bit, j) => acc + bit * Math.pow(2, 7 - j), 0)
      );
      content += `\n${byteIndex + 1}文字目 '${char}' (ASCII: ${char.codePointAt(0)}):\n`;
    }
    content += `  ビット${bitIndex + 1}: ${cipherTextBits[i]} XOR ${decryptKeyBits[i]} = ${decryptedTextBits[i]}\n`;
  }
  
  content += '\n' + '='.repeat(60) + '\n';
  content += '※ OTP(One-Time Pad)復号が完了しました\n';
  content += '※ 正しい鍵を使用すれば元の平文が復元されます\n';
  content += '='.repeat(60) + '\n';
  
  const filename = `otp-decryption-${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')}.txt`;
  downloadFile(content, filename);
}

// ファイル出力ボタンのイベントハンドラを設定
function setupFileExportHandlers() {
  // 暗号化結果出力ボタン
  document.getElementById('exportEncryption').addEventListener('click', () => {
    exportEncryptionResult();
  });

  // 復号結果出力ボタン
  document.getElementById('exportDecryption').addEventListener('click', () => {
    exportDecryptionResult();
  });
}