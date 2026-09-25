// クリップボード・トースト通知機能

// ビット列を8ビット区切りでアンダースコア形式に変換
function formatBitsForClipboard(bits) {
  if (!bits || bits.length === 0) return '';
  
  const bitString = bits.join('');
  const chunks = [];
  
  for (let i = 0; i < bitString.length; i += 8) {
    chunks.push(bitString.slice(i, i + 8));
  }
  
  return chunks.join('_');
}

// トースト通知を表示
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// クリップボードにコピー
async function copyToClipboard(text, successMessage) {
  
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage, 'success');
  } catch (err) {
    // フォールバック: 古いブラウザ用
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast(successMessage, 'success');
    } catch (fallbackErr) {
      console.error('❌ コピー失敗:', fallbackErr);
      showToast('コピーに失敗しました', 'error');
    }
  }
}

// Parse binary first; hexadecimal is the alternative representation.
function parseClipboardBytes(text) {
  try {
    return OtpCore.bitsToBytes(OtpCore.parseBits(text));
  } catch (e) {
    // Do not reinterpret a malformed binary string as hexadecimal.
    if (/^[01\s_,|\-]+$/.test(text)) throw e;
    return OtpCore.parseHex(text);
  }
}

async function pasteFromClipboard(successCallback, errorCallback) {
  if (!navigator.clipboard || !navigator.clipboard.readText) {
    fallbackPaste(successCallback, errorCallback);
    return;
  }
  let timer;
  let text;
  try {
    text = await Promise.race([
      navigator.clipboard.readText(),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), 2000); })
    ]);
  } catch {
    fallbackPaste(successCallback, errorCallback);
    return;
  } finally {
    clearTimeout(timer);
  }
  try {
    successCallback(parseClipboardBytes(text));
  } catch (e) {
    errorCallback(inputError(e.message));
  }
}

function fallbackPaste(successCallback, errorCallback) {
  errorCallback('入力欄に直接貼り付けてください');
}

function setupBitCopyButtons() {
  const sources = {
    copyPlaintextBits: () => encryptionState.plain,
    copyKeyBits: () => encryptionState.key || [],
    copyCipherBits: encryptionCipher,
    copyCiphertextBits: () => decryptionState.cipher,
    copyDecryptKeyBits: () => decryptionState.key || [],
    copyDecryptedBits: decryptionPlain
  };
  for (const [id, source] of Object.entries(sources)) {
    document.getElementById(id).addEventListener('click', () => {
      const bytes = source();
      if (!bytes.length) { showToast('コピーするデータがありません', 'error'); return; }
      copyToClipboard(formatBitsForClipboard(OtpCore.bytesToBits(bytes)), 'コピーしました');
    });
  }
  const targets = {
    pastePlaintextBits: bytes => {
      const decoded = OtpCore.decodeBytes(bytes);
      if (!decoded.valid) throw new Error('invalidUtf8');
      const check = OtpCore.validateText(decoded.text);
      if (!check.ok) throw new Error(inputError(check.reason, check));
      document.getElementById('plaintext').value = decoded.text;
      updatePlaintext();
    },
    pasteKeyBits: setEncryptionKey,
    pasteCiphertextBits: bytes => {
      document.getElementById('ciphertext').value = OtpCore.toHex(bytes);
      updateDecryptionInputs();
    },
    pasteDecryptKeyBits: bytes => {
      if (bytes.length !== decryptionState.cipher.length) throw new Error('lengthMismatch');
      document.getElementById('decryptKey').value = OtpCore.toHex(bytes);
      updateDecryptionInputs();
    }
  };
  for (const [id, accept] of Object.entries(targets)) {
    document.getElementById(id).addEventListener('click', () => {
      pasteFromClipboard(bytes => { accept(bytes); showToast('貼り付けました'); }, message => showToast(message, 'error'));
    });
  }
}
