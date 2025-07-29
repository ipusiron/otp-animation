// 復号関連の処理

// 復号用のグローバル変数
let cipherTextBits = [];
let decryptKeyBits = [];
let decryptedTextBits = [];

// 復号アニメーション制御用変数
let decryptAnimationState = {
  isPlaying: false,
  isPaused: false,
  currentIndex: 0,
  timeoutId: null,
  totalBits: 0,
  speed: 300,
  keysGenerated: false
};

// 復号ボタンの状態を更新
function updateDecryptButtonStates() {
  const keysGenerated = decryptAnimationState.keysGenerated;
  const isPlaying = decryptAnimationState.isPlaying && !decryptAnimationState.isPaused;
  const currentIndex = decryptAnimationState.currentIndex;
  const totalBits = decryptAnimationState.totalBits;
  
  // 復号開始ボタン
  document.getElementById('startDecryption').disabled = !keysGenerated;
  
  // コントロールパネルの表示/非表示
  const controlsPanel = document.getElementById('decryptAnimationControls');
  if (keysGenerated) {
    controlsPanel.style.display = 'flex';
  } else {
    controlsPanel.style.display = 'none';
    return;
  }
  
  // 各ボタンの有効/無効状態
  const hasStarted = decryptAnimationState.isPlaying || decryptAnimationState.isPaused || currentIndex > 0;
  
  document.getElementById('decryptPlayPause').disabled = !hasStarted; // 開始前は無効
  document.getElementById('decryptReset').disabled = false;
  document.getElementById('decryptStepBack').disabled = currentIndex <= 0 || isPlaying;
  document.getElementById('decryptStepForward').disabled = currentIndex >= totalBits || isPlaying;
  document.getElementById('decryptComplete').disabled = !hasStarted || currentIndex >= totalBits || isPlaying; // 開始前は無効
  document.getElementById('decryptSpeed').disabled = false;
}

// 復号アニメーション
function animateDecryption(cipherBits, keyBitsInput, decryptedBitsInput) {
  if (!keyBitsInput.length || keyBitsInput.length !== cipherBits.length) {
    keyBitsInput = generateRandomBits(cipherBits.length);
    decryptKeyBits = keyBitsInput;
    decryptedBitsInput = xorBits(cipherBits, keyBitsInput);
    decryptedTextBits = decryptedBitsInput;
    renderBits('decryptKeyBitsContainer', keyBitsInput, 'key');
    renderPlaceholderDecryptedBits(cipherBits.length);
  }

  // アニメーション状態を初期化
  decryptAnimationState.isPlaying = true;
  decryptAnimationState.isPaused = false;
  decryptAnimationState.currentIndex = 0;
  decryptAnimationState.totalBits = cipherBits.length;

  // ボタン状態を更新
  document.getElementById('decryptPlayPause').textContent = '⏸ 一時停止';
  updateDecryptProgress(0, cipherBits.length);
  updateDecryptButtonStates();

  function step() {
    if (!decryptAnimationState.isPlaying || decryptAnimationState.isPaused) return;
    if (decryptAnimationState.currentIndex >= cipherBits.length) {
      decryptAnimationState.isPlaying = false;
      document.getElementById('decryptPlayPause').textContent = '▶ 再生';
      updateDecryptButtonStates();
      return;
    }

    const index = decryptAnimationState.currentIndex;
    const cipherSpan = document.querySelector(`#ciphertextBitsContainer .bit[data-index='${index}']`);
    const keySpan = document.querySelector(`#decryptKeyBitsContainer .bit[data-index='${index}']`);
    const decryptedSpan = document.querySelector(`#decryptedBitsContainer .bit[data-index='${index}']`);

    // 処理中のビットをハイライト
    cipherSpan.classList.add('active');
    keySpan.classList.add('active');

    setTimeout(() => {
      cipherSpan.classList.remove('active');
      keySpan.classList.remove('active');
      keySpan.classList.add('burn');

      decryptedSpan.textContent = decryptedBitsInput[index];
      decryptedSpan.classList.remove('placeholder');
      decryptedSpan.classList.add('appear');

      setTimeout(() => {
        keySpan.classList.add('ash');
        // 復号ビットの光を消す
        setTimeout(() => {
          decryptedSpan.classList.remove('appear');
        }, 300);
      }, 500);

      // 進捗を更新
      decryptAnimationState.currentIndex++;
      updateDecryptProgress(decryptAnimationState.currentIndex, cipherBits.length);
      updateDecryptButtonStates();

      decryptAnimationState.timeoutId = setTimeout(step, decryptAnimationState.speed);
    }, 100);
  }

  step();
}

// 復号タブのイベントハンドラ
function setupDecryptionHandlers() {
  // 暗号化結果を反映ボタン
  document.getElementById('copyFromEncryption').addEventListener('click', () => {
    // 暗号化が完了しているかチェック
    if (!cipherBits.length || !keyBits.length) {
      alert('まず暗号化タブで暗号化を実行してください。');
      return;
    }

    // ビット列を文字列に変換
    const cipherText = bitsToText(cipherBits);
    const keyText = bitsToText(keyBits);

    console.log(`📋 暗号化結果を復号タブに反映:`);
    console.log(`   暗号文: "${cipherText}" → [${cipherBits.join('')}]`);
    console.log(`   鍵: "${keyText}" → [${keyBits.join('')}]`);

    // 復号タブの入力欄に設定
    document.getElementById('ciphertext').value = cipherText;
    
    // ビット表示を更新
    cipherTextBits = [...cipherBits];
    decryptKeyBits = [...keyBits];
    decryptedTextBits = xorBits(cipherTextBits, decryptKeyBits);
    
    console.log(`🔓 復号文計算: [${decryptedTextBits.join('')}]`);
    
    renderBits('ciphertextBitsContainer', cipherTextBits, 'cipher');
    renderBits('decryptKeyBitsContainer', decryptKeyBits, 'key');
    renderPlaceholderDecryptedBits(cipherTextBits.length);
    
    // エラーメッセージをクリア
    document.getElementById('decryptErrorMessage').textContent = '';
    
    // 復号状態を更新
    decryptAnimationState.keysGenerated = true;
    decryptAnimationState.totalBits = cipherTextBits.length;
    decryptAnimationState.currentIndex = 0;
    updateDecryptButtonStates();
    
    // エクスポートボタンを無効化（まだ復号完了していない）
    const exportButton = document.getElementById('exportDecryption');
    if (exportButton) exportButton.disabled = true;
  });

  // 暗号文リアルタイム入力処理
  document.getElementById('ciphertext').addEventListener('input', () => {
    const text = document.getElementById('ciphertext').value;
    const { bits, invalidChar } = textToBitsWithValidation(text);
    const errorArea = document.getElementById('decryptErrorMessage');

    if (invalidChar) {
      console.log(`❌ 暗号文入力エラー: 使用不可文字 "${invalidChar}"`);
      errorArea.textContent = `❌ 使用できない文字があります：「${invalidChar}」`;
      renderBits('ciphertextBitsContainer', [], 'cipher');
      cipherTextBits = [];
    } else {
      console.log(`🔐 暗号文入力: "${text}" → ${bits.length}ビット [${bits.join('')}]`);
      errorArea.textContent = '';
      renderBits('ciphertextBitsContainer', bits, 'cipher');
      cipherTextBits = bits;
      
      // 暗号文が変更されたら復号状態をリセット
      decryptAnimationState.keysGenerated = false;
      decryptAnimationState.currentIndex = 0;
      updateDecryptButtonStates();
      
      // エクスポートボタンを無効化
      const exportButton = document.getElementById('exportDecryption');
      if (exportButton) exportButton.disabled = true;
    }
  });

  // 鍵入力ボタン（ここでは暗号化と同じランダム生成を使用）
  document.getElementById('generateDecryptKey').addEventListener('click', () => {
    const cipherText = document.getElementById('ciphertext').value;
    const { bits, invalidChar } = textToBitsWithValidation(cipherText);
    const errorArea = document.getElementById('decryptErrorMessage');

    if (invalidChar) {
      errorArea.textContent = `❌ 使用できない文字があります：「${invalidChar}」`;
      renderBits('ciphertextBitsContainer', [], 'cipher');
      renderBits('decryptKeyBitsContainer', [], 'key');
      renderBits('decryptedBitsContainer', [], 'plain');
      cipherTextBits = [];
      decryptKeyBits = [];
      decryptedTextBits = [];
      return;
    }

    errorArea.textContent = '';
    cipherTextBits = bits;
    decryptKeyBits = generateRandomBits(cipherTextBits.length);
    decryptedTextBits = xorBits(cipherTextBits, decryptKeyBits);

    console.log(`🔑 復号鍵生成: ${decryptKeyBits.length}ビット [${decryptKeyBits.join('')}]`);
    console.log(`🔓 復号文計算: [${decryptedTextBits.join('')}]`);

    renderBits('ciphertextBitsContainer', cipherTextBits, 'cipher');
    renderBits('decryptKeyBitsContainer', decryptKeyBits, 'key');
    renderPlaceholderDecryptedBits(cipherTextBits.length);
    
    // 復号状態を更新
    decryptAnimationState.keysGenerated = true;
    decryptAnimationState.totalBits = cipherTextBits.length;
    decryptAnimationState.currentIndex = 0;
    updateDecryptButtonStates();
    
    // エクスポートボタンを無効化（まだ復号完了していない）
    const exportButton = document.getElementById('exportDecryption');
    if (exportButton) exportButton.disabled = true;
  });

  // 復号開始ボタン
  document.getElementById('startDecryption').addEventListener('click', () => {
    if (!cipherTextBits.length || !decryptKeyBits.length || !decryptedTextBits.length) return;
    
    console.log(`▶️ 復号アニメーション開始: ${cipherTextBits.length}ステップ`);
    
    // アニメーションをリセット
    resetDecryptionAnimation();
    animateDecryption(cipherTextBits, decryptKeyBits, decryptedTextBits);
  });
}

// 復号コントロールのセットアップ
function setupDecryptionControls() {
  // 再生/一時停止ボタン
  document.getElementById('decryptPlayPause').addEventListener('click', () => {
    if (decryptAnimationState.isPlaying && !decryptAnimationState.isPaused) {
      // 一時停止
      decryptAnimationState.isPaused = true;
      document.getElementById('decryptPlayPause').textContent = '▶ 再生';
      clearTimeout(decryptAnimationState.timeoutId);
      updateDecryptButtonStates();
    } else if (decryptAnimationState.isPaused) {
      // 再開
      decryptAnimationState.isPaused = false;
      document.getElementById('decryptPlayPause').textContent = '⏸ 一時停止';
      updateDecryptButtonStates();
      
      function step() {
        if (!decryptAnimationState.isPlaying || decryptAnimationState.isPaused) return;
        if (decryptAnimationState.currentIndex >= cipherTextBits.length) {
          decryptAnimationState.isPlaying = false;
          document.getElementById('decryptPlayPause').textContent = '▶ 再生';
          updateDecryptButtonStates();
          return;
        }

        executeDecryptionStep(decryptAnimationState.currentIndex);
        decryptAnimationState.currentIndex++;
        updateDecryptButtonStates();

        decryptAnimationState.timeoutId = setTimeout(step, decryptAnimationState.speed);
      }
      step();
    } else {
      // 最初から再生
      resetDecryptionAnimation();
      animateDecryption(cipherTextBits, decryptKeyBits, decryptedTextBits);
    }
  });

  // 1つ戻るボタン
  document.getElementById('decryptStepBack').addEventListener('click', () => {
    if (decryptAnimationState.currentIndex > 0) {
      decryptAnimationState.currentIndex--;
      
      // 一時停止状態にする
      decryptAnimationState.isPaused = true;
      document.getElementById('decryptPlayPause').textContent = '▶ 再生';
      clearTimeout(decryptAnimationState.timeoutId);
      
      // ビットの状態をリセットしてから指定位置まで再現
      resetDecryptBitStates();
      for (let i = 0; i < decryptAnimationState.currentIndex; i++) {
        executeSilentDecryptStep(i);
      }
      
      // 最後に生成された復号文ビットをハイライト
      if (decryptAnimationState.currentIndex > 0) {
        const index = decryptAnimationState.currentIndex - 1;
        const decryptedSpan = document.querySelector(`#decryptedBitsContainer .bit[data-index='${index}']`);
        if (decryptedSpan) {
          decryptedSpan.classList.add('appear');
          // 一定時間後にハイライトを削除
          setTimeout(() => {
            decryptedSpan.classList.remove('appear');
          }, 1000);
        }
      }
      
      updateDecryptProgress(decryptAnimationState.currentIndex, cipherTextBits.length);
      updateDecryptButtonStates();
    }
  });

  // 1つ進むボタン
  document.getElementById('decryptStepForward').addEventListener('click', () => {
    if (decryptAnimationState.currentIndex < cipherTextBits.length) {
      // 一時停止状態にする
      decryptAnimationState.isPaused = true;
      document.getElementById('decryptPlayPause').textContent = '▶ 再生';
      clearTimeout(decryptAnimationState.timeoutId);
      
      executeDecryptionStep(decryptAnimationState.currentIndex);
      decryptAnimationState.currentIndex++;
      updateDecryptButtonStates();
    }
  });

  // 全処理ボタン
  document.getElementById('decryptComplete').addEventListener('click', () => {
    clearTimeout(decryptAnimationState.timeoutId);
    decryptAnimationState.isPlaying = false;
    decryptAnimationState.isPaused = true;
    document.getElementById('decryptPlayPause').textContent = '▶ 再生';
    
    // すべてのステップを一気に実行
    resetDecryptBitStates();
    for (let i = 0; i < cipherTextBits.length; i++) {
      executeSilentDecryptStep(i);
    }
    
    decryptAnimationState.currentIndex = cipherTextBits.length;
    updateDecryptProgress(cipherTextBits.length, cipherTextBits.length);
    updateDecryptButtonStates();
  });

  // スピード選択
  document.getElementById('decryptSpeed').addEventListener('change', (e) => {
    decryptAnimationState.speed = parseInt(e.target.value);
  });
  
  // リセットボタン
  document.getElementById('decryptReset').addEventListener('click', () => {
    clearTimeout(decryptAnimationState.timeoutId);
    decryptAnimationState.isPlaying = false;
    decryptAnimationState.isPaused = false;
    decryptAnimationState.currentIndex = 0;
    
    document.getElementById('decryptPlayPause').textContent = '▶ 再生';
    
    resetDecryptBitStates();
    updateDecryptProgress(0, cipherTextBits.length);
    updateDecryptButtonStates();
  });
}

// 復号アニメーションをリセット
function resetDecryptionAnimation() {
  clearTimeout(decryptAnimationState.timeoutId);
  decryptAnimationState.isPlaying = false;
  decryptAnimationState.isPaused = false;
  decryptAnimationState.currentIndex = 0;
  
  // ビットの状態をリセット
  resetDecryptBitStates();
}

// 復号の1ステップを実行
function executeDecryptionStep(index) {
  if (index >= cipherTextBits.length || index < 0) return;

  // 以前のハイライトをクリア
  document.querySelectorAll('#ciphertextBitsContainer .bit.active').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('#decryptKeyBitsContainer .bit.active').forEach(el => el.classList.remove('active'));

  const cipherSpan = document.querySelector(`#ciphertextBitsContainer .bit[data-index='${index}']`);
  const keySpan = document.querySelector(`#decryptKeyBitsContainer .bit[data-index='${index}']`);
  const decryptedSpan = document.querySelector(`#decryptedBitsContainer .bit[data-index='${index}']`);

  // 速度に応じた遅延時間を計算
  const baseDelay = Math.max(50, decryptAnimationState.speed * 0.3);
  const burnDelay = Math.max(200, decryptAnimationState.speed * 0.8);
  const appearDelay = Math.max(100, decryptAnimationState.speed * 0.5);

  // 処理中のビットをハイライト
  cipherSpan.classList.add('active');
  keySpan.classList.add('active');

  // 復号処理の視覚効果
  setTimeout(() => {
    cipherSpan.classList.remove('active');
    keySpan.classList.remove('active');
    keySpan.classList.add('burn');

    decryptedSpan.textContent = decryptedTextBits[index];
    decryptedSpan.classList.remove('placeholder');
    decryptedSpan.classList.add('appear');

    setTimeout(() => {
      keySpan.classList.add('ash');
      setTimeout(() => {
        decryptedSpan.classList.remove('appear');
      }, appearDelay);
    }, burnDelay);
  }, baseDelay);

  // 進捗を更新
  updateDecryptProgress(index + 1, cipherTextBits.length);
}

// アニメーションなしでステップを実行（戻る時用）
function executeSilentDecryptStep(index) {
  const keySpan = document.querySelector(`#decryptKeyBitsContainer .bit[data-index='${index}']`);
  const decryptedSpan = document.querySelector(`#decryptedBitsContainer .bit[data-index='${index}']`);
  
  keySpan.classList.add('burn', 'ash');
  decryptedSpan.textContent = decryptedTextBits[index];
  decryptedSpan.classList.remove('placeholder');
}

// 復号進捗表示を更新
function updateDecryptProgress(current, total) {
  document.getElementById('decryptProgress').textContent = `${current} / ${total}`;
  
  // 復号完了時にエクスポートボタンを有効化
  const exportButton = document.getElementById('exportDecryption');
  if (exportButton) {
    exportButton.disabled = current < total;
  }
}

// 復号ビットの視覚状態をリセット
function resetDecryptBitStates() {
  // すべてのアクティブ状態を解除
  document.querySelectorAll('.bit.active').forEach(el => el.classList.remove('active'));
  
  // 鍵ビットをリセット
  document.querySelectorAll('#decryptKeyBitsContainer .bit').forEach(el => {
    el.classList.remove('burn', 'ash');
  });
  
  // 復号ビットをプレースホルダーに戻す
  renderPlaceholderDecryptedBits(cipherTextBits.length);
}