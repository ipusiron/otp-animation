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
  console.log(`📤 ビット列コピー: [${text}]`);
  
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

// ビット列文字列をパースして配列に変換
function parseBitString(bitString) {
  // 空白、アンダースコア、その他の区切り文字を除去
  const cleanedBits = bitString.replace(/[\s_\-,|]/g, '');
  
  // 0と1のみで構成されているかチェック
  if (!/^[01]*$/.test(cleanedBits)) {
    throw new Error('ビット列は0と1のみで構成されている必要があります');
  }
  
  if (cleanedBits.length === 0) {
    throw new Error('有効なビット列が見つかりません');
  }
  
  // 8の倍数でない場合は警告（でも処理は続行）
  if (cleanedBits.length % 8 !== 0) {
    console.warn(`⚠️ ビット長が8の倍数ではありません: ${cleanedBits.length}ビット`);
  }
  
  // 文字列を数値配列に変換
  const result = cleanedBits.split('').map(bit => parseInt(bit));
  console.log(`📥 ビット列ペースト: ${result.length}ビット [${result.join('')}]`);
  return result;
}

// クリップボードからペースト（タイムアウト付き）
async function pasteFromClipboard(successCallback, errorCallback) {
  // フォールバック: Clipboard API が利用できない場合
  if (!navigator.clipboard || !navigator.clipboard.readText) {
    fallbackPaste(successCallback, errorCallback);
    return;
  }
  
  try {
    // タイムアウト付きでクリップボードを読み取り
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Clipboard read timeout')), 2000);
    });
    
    const text = await Promise.race([
      navigator.clipboard.readText(),
      timeoutPromise
    ]);
    
    const bitArray = parseBitString(text);
    
    try {
      successCallback(bitArray, text);
    } catch (callbackErr) {
      console.error('❌ ペースト処理エラー:', callbackErr);
      errorCallback(`処理中にエラーが発生しました: ${callbackErr.message}`);
    }
  } catch (err) {
    // エラーの種類に関係なくフォールバックを使用
    fallbackPaste(successCallback, errorCallback);
  }
}

// フォールバック: 手動入力
function fallbackPaste(successCallback, errorCallback) {
  const text = prompt('ビット列を入力してください（アンダースコア区切り、空白区切り、区切りなしに対応）:');
  if (text !== null && text.trim() !== '') {
    try {
      const bitArray = parseBitString(text);
      successCallback(bitArray, text);
    } catch (parseErr) {
      errorCallback(parseErr.message);
    }
  } else {
    errorCallback('入力がキャンセルされました');
  }
}

// ビットコピー・ペーストボタンのイベントハンドラを設定
function setupBitCopyButtons() {
  // 暗号化タブのコピーボタン
  document.getElementById('copyPlaintextBits').addEventListener('click', () => {
    if (plainBits && plainBits.length > 0) {
      const formattedBits = formatBitsForClipboard(plainBits);
      copyToClipboard(formattedBits, `平文ビット列をコピーしました: ${formattedBits}`);
    } else {
      showToast('コピーする平文ビットがありません', 'error');
    }
  });
  
  // 平文ビットペーストボタン
  document.getElementById('pastePlaintextBits').addEventListener('click', () => {
    pasteFromClipboard(
      (bitArray, originalText) => {
        plainBits = bitArray;
        renderBits('plaintextBitsContainer', plainBits, 'plain');
        
        // 対応するテキストを入力欄に設定（可能な場合）
        try {
          const text = bitsToText(plainBits);
          document.getElementById('plaintext').value = text;
        } catch (e) {
          // テキスト変換できない場合はそのまま
        }
        
        // 暗号化状態をリセット
        encryptAnimationState.keysGenerated = false;
        encryptAnimationState.currentIndex = 0;
        updateEncryptButtonStates();
        
        showToast(`平文ビット列をペーストしました: ${formatBitsForClipboard(bitArray)}`, 'success');
      },
      (errorMessage) => {
        showToast(errorMessage, 'error');
      }
    );
  });
  
  document.getElementById('copyKeyBits').addEventListener('click', () => {
    if (keyBits && keyBits.length > 0) {
      const formattedBits = formatBitsForClipboard(keyBits);
      copyToClipboard(formattedBits, `鍵ビット列をコピーしました: ${formattedBits}`);
    } else {
      showToast('コピーする鍵ビットがありません', 'error');
    }
  });
  
  // 鍵ビットペーストボタン
  document.getElementById('pasteKeyBits').addEventListener('click', () => {
    pasteFromClipboard(
      (bitArray, originalText) => {
        keyBits = bitArray;
        renderBits('keyBitsContainer', keyBits, 'key');
        
        // 鍵がペーストされた場合、平文と長さを合わせる必要があるかチェック
        if (plainBits.length > 0 && plainBits.length !== keyBits.length) {
          showToast(`警告: 平文(${plainBits.length}ビット)と鍵(${keyBits.length}ビット)の長さが異なります`, 'error');
        } else if (plainBits.length > 0) {
          // 平文と鍵の両方が揃った場合、暗号文を生成
          cipherBits = xorBits(plainBits, keyBits);
          renderPlaceholderCipherBits(plainBits.length);
          console.log(`🔐 ペースト後暗号文計算: [${cipherBits.join('')}]`);
          
          // 暗号化状態を更新
          encryptAnimationState.keysGenerated = true;
          encryptAnimationState.totalBits = plainBits.length;
          encryptAnimationState.currentIndex = 0;
          updateEncryptButtonStates();
          updateEncryptProgress(0, plainBits.length);
        }
        
        showToast(`鍵ビット列をペーストしました: ${formatBitsForClipboard(bitArray)}`, 'success');
      },
      (errorMessage) => {
        showToast(errorMessage, 'error');
      }
    );
  });
  
  document.getElementById('copyCipherBits').addEventListener('click', () => {
    if (cipherBits && cipherBits.length > 0) {
      const formattedBits = formatBitsForClipboard(cipherBits);
      copyToClipboard(formattedBits, `暗号文ビット列をコピーしました: ${formattedBits}`);
    } else {
      showToast('コピーする暗号文ビットがありません', 'error');
    }
  });
  
  // 復号タブのコピー・ペーストボタン
  document.getElementById('copyCiphertextBits').addEventListener('click', () => {
    if (cipherTextBits && cipherTextBits.length > 0) {
      const formattedBits = formatBitsForClipboard(cipherTextBits);
      copyToClipboard(formattedBits, `暗号文ビット列をコピーしました: ${formattedBits}`);
    } else {
      showToast('コピーする暗号文ビットがありません', 'error');
    }
  });
  
  // 暗号文ビットペーストボタン
  document.getElementById('pasteCiphertextBits').addEventListener('click', () => {
    pasteFromClipboard(
      (bitArray, originalText) => {
        cipherTextBits = bitArray;
        renderBits('ciphertextBitsContainer', cipherTextBits, 'cipher');
        
        // 対応するテキストを入力欄に設定（可能な場合）
        try {
          const text = bitsToText(cipherTextBits);
          document.getElementById('ciphertext').value = text;
        } catch (e) {
          // テキスト変換できない場合はそのまま
        }
        
        // 復号状態をリセット
        decryptAnimationState.keysGenerated = false;
        decryptAnimationState.currentIndex = 0;
        updateDecryptButtonStates();
        
        showToast(`暗号文ビット列をペーストしました: ${formatBitsForClipboard(bitArray)}`, 'success');
      },
      (errorMessage) => {
        showToast(errorMessage, 'error');
      }
    );
  });
  
  document.getElementById('copyDecryptKeyBits').addEventListener('click', () => {
    if (decryptKeyBits && decryptKeyBits.length > 0) {
      const formattedBits = formatBitsForClipboard(decryptKeyBits);
      copyToClipboard(formattedBits, `鍵ビット列をコピーしました: ${formattedBits}`);
    } else {
      showToast('コピーする鍵ビットがありません', 'error');
    }
  });
  
  // 復号鍵ビットペーストボタン
  document.getElementById('pasteDecryptKeyBits').addEventListener('click', () => {
    pasteFromClipboard(
      (bitArray, originalText) => {
        decryptKeyBits = bitArray;
        renderBits('decryptKeyBitsContainer', decryptKeyBits, 'key');
        
        // 鍵がペーストされた場合、暗号文と長さを合わせる必要があるかチェック
        if (cipherTextBits.length > 0 && cipherTextBits.length !== decryptKeyBits.length) {
          showToast(`警告: 暗号文(${cipherTextBits.length}ビット)と鍵(${decryptKeyBits.length}ビット)の長さが異なります`, 'error');
        } else if (cipherTextBits.length > 0) {
          // 暗号文と鍵の両方が揃った場合、復号文を生成
          decryptedTextBits = xorBits(cipherTextBits, decryptKeyBits);
          renderPlaceholderDecryptedBits(cipherTextBits.length);
          
          // 復号状態を更新
          decryptAnimationState.keysGenerated = true;
          decryptAnimationState.totalBits = cipherTextBits.length;
          decryptAnimationState.currentIndex = 0;
          updateDecryptButtonStates();
        }
        
        showToast(`鍵ビット列をペーストしました: ${formatBitsForClipboard(bitArray)}`, 'success');
      },
      (errorMessage) => {
        showToast(errorMessage, 'error');
      }
    );
  });
  
  document.getElementById('copyDecryptedBits').addEventListener('click', () => {
    if (decryptedTextBits && decryptedTextBits.length > 0) {
      const formattedBits = formatBitsForClipboard(decryptedTextBits);
      copyToClipboard(formattedBits, `平文ビット列をコピーしました: ${formattedBits}`);
    } else {
      showToast('コピーする平文ビットがありません', 'error');
    }
  });
}