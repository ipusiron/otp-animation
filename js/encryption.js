// 暗号化関連の処理

// グローバル変数
let plainBits = [];
let keyBits = [];
let cipherBits = [];

// アニメーション制御用変数
let encryptAnimationState = {
  isPlaying: false,
  isPaused: false,
  currentIndex: 0,
  timeoutId: null,
  totalBits: 0,
  speed: 300,
  keysGenerated: false
};

// アニメーションの1ステップを実行
function executeEncryptionStep(index, plainBits, keyBitsInput, cipherBitsInput) {
  if (index >= plainBits.length || index < 0) return;

  // 以前のハイライトをクリア
  document.querySelectorAll('#plaintextBitsContainer .bit.active').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('#keyBitsContainer .bit.active').forEach(el => el.classList.remove('active'));

  const plainSpan = document.querySelector(`#plaintextBitsContainer .bit[data-index='${index}']`);
  const keySpan = document.querySelector(`#keyBitsContainer .bit[data-index='${index}']`);
  const cipherSpan = document.querySelector(`#cipherBitsContainer .bit[data-index='${index}']`);

  // 速度に応じた遅延時間を計算
  const baseDelay = Math.max(50, encryptAnimationState.speed * 0.3);
  const burnDelay = Math.max(200, encryptAnimationState.speed * 0.8);
  const appearDelay = Math.max(100, encryptAnimationState.speed * 0.5);

  // 処理中のビットをハイライト
  plainSpan.classList.add('active');
  keySpan.classList.add('active');

  // 暗号化処理の視覚効果
  if (!keySpan.classList.contains('burn')) {
    setTimeout(() => {
      plainSpan.classList.remove('active');
      keySpan.classList.remove('active');
      keySpan.classList.add('burn');

      cipherSpan.textContent = cipherBitsInput[index];
      cipherSpan.classList.remove('placeholder');
      cipherSpan.classList.add('appear');

      setTimeout(() => {
        keySpan.classList.add('ash');
        setTimeout(() => {
          cipherSpan.classList.remove('appear');
        }, appearDelay);
      }, burnDelay);
    }, baseDelay);
  }

  // 進捗を更新
  updateEncryptProgress(index + 1, plainBits.length);
}

// アニメーション再生処理
function animateEncryption(plainBits, keyBitsInput, cipherBitsInput) {
  // 鍵や暗号ビットが未生成の場合は、ここで生成する
  if (!keyBitsInput.length || keyBitsInput.length !== plainBits.length) {
    keyBitsInput = generateRandomBits(plainBits.length);
    keyBits = keyBitsInput;
    cipherBitsInput = xorBits(plainBits, keyBitsInput);
    cipherBits = cipherBitsInput;
    renderBits('keyBitsContainer', keyBitsInput, 'key');
    renderPlaceholderCipherBits(plainBits.length);
  }

  // アニメーション状態を初期化
  encryptAnimationState.isPlaying = true;
  encryptAnimationState.isPaused = false;
  encryptAnimationState.currentIndex = 0;
  encryptAnimationState.totalBits = plainBits.length;

  // ボタン状態を更新
  document.getElementById('encryptPlayPause').textContent = '⏸ 一時停止';
  updateEncryptProgress(0, plainBits.length);
  updateEncryptButtonStates();

  function step() {
    if (!encryptAnimationState.isPlaying || encryptAnimationState.isPaused) return;
    if (encryptAnimationState.currentIndex >= plainBits.length) {
      encryptAnimationState.isPlaying = false;
      document.getElementById('encryptPlayPause').textContent = '▶ 再生';
      updateEncryptButtonStates();
      return;
    }

    executeEncryptionStep(encryptAnimationState.currentIndex, plainBits, keyBitsInput, cipherBitsInput);
    encryptAnimationState.currentIndex++;
    updateEncryptButtonStates();

    encryptAnimationState.timeoutId = setTimeout(step, encryptAnimationState.speed);
  }

  step();
}

// 進捗表示を更新
function updateEncryptProgress(current, total) {
  document.getElementById('encryptProgress').textContent = `${current} / ${total}`;
  
  // 暗号化完了時にエクスポートボタンを有効化
  const exportButton = document.getElementById('exportEncryption');
  if (exportButton) {
    exportButton.disabled = current < total;
  }
}

// 暗号化ボタンの状態を更新
function updateEncryptButtonStates() {
  const keysGenerated = encryptAnimationState.keysGenerated;
  const isPlaying = encryptAnimationState.isPlaying && !encryptAnimationState.isPaused;
  const currentIndex = encryptAnimationState.currentIndex;
  const totalBits = encryptAnimationState.totalBits;
  
  // 暗号化開始ボタン
  document.getElementById('startAnimation').disabled = !keysGenerated;
  
  // コントロールパネルの表示/非表示
  const controlsPanel = document.getElementById('encryptAnimationControls');
  if (keysGenerated) {
    controlsPanel.style.display = 'flex';
  } else {
    controlsPanel.style.display = 'none';
    return;
  }
  
  // 各ボタンの有効/無効状態
  const hasStarted = encryptAnimationState.isPlaying || encryptAnimationState.isPaused || currentIndex > 0;
  
  document.getElementById('encryptPlayPause').disabled = !hasStarted; // 開始前は無効
  document.getElementById('encryptReset').disabled = false; // 鍵生成後は常に有効
  document.getElementById('encryptStepBack').disabled = currentIndex <= 0 || isPlaying;
  document.getElementById('encryptStepForward').disabled = currentIndex >= totalBits || isPlaying;
  document.getElementById('encryptComplete').disabled = !hasStarted || currentIndex >= totalBits || isPlaying; // 開始前は無効
  document.getElementById('encryptSpeed').disabled = false; // 常に有効
}

// アニメーションコントロールボタンのイベントハンドラ
function setupEncryptionControls() {
  // 再生/一時停止ボタン
  document.getElementById('encryptPlayPause').addEventListener('click', () => {
    if (encryptAnimationState.isPlaying && !encryptAnimationState.isPaused) {
      // 一時停止
      encryptAnimationState.isPaused = true;
      document.getElementById('encryptPlayPause').textContent = '▶ 再生';
      clearTimeout(encryptAnimationState.timeoutId);
      updateEncryptButtonStates();
    } else if (encryptAnimationState.isPaused) {
      // 再開
      encryptAnimationState.isPaused = false;
      document.getElementById('encryptPlayPause').textContent = '⏸ 一時停止';
      updateEncryptButtonStates();
      
      function step() {
        if (!encryptAnimationState.isPlaying || encryptAnimationState.isPaused) return;
        if (encryptAnimationState.currentIndex >= plainBits.length) {
          encryptAnimationState.isPlaying = false;
          document.getElementById('encryptPlayPause').textContent = '▶ 再生';
          updateEncryptButtonStates();
          return;
        }

        executeEncryptionStep(encryptAnimationState.currentIndex, plainBits, keyBits, cipherBits);
        encryptAnimationState.currentIndex++;
        updateEncryptButtonStates();

        encryptAnimationState.timeoutId = setTimeout(step, encryptAnimationState.speed);
      }
      step();
    } else {
      // 最初から再生
      resetEncryptionAnimation();
      animateEncryption(plainBits, keyBits, cipherBits);
    }
  });

  // 1つ戻るボタン
  document.getElementById('encryptStepBack').addEventListener('click', () => {
    if (encryptAnimationState.currentIndex > 0) {
      encryptAnimationState.currentIndex--;
      
      // 一時停止状態にする
      encryptAnimationState.isPaused = true;
      document.getElementById('encryptPlayPause').textContent = '▶ 再生';
      clearTimeout(encryptAnimationState.timeoutId);
      
      // ビットの状態をリセットしてから指定位置まで再現
      resetBitStates();
      for (let i = 0; i < encryptAnimationState.currentIndex; i++) {
        executeSilentStep(i, plainBits, keyBits, cipherBits);
      }
      
      // 最後に生成された暗号文ビットをハイライト
      if (encryptAnimationState.currentIndex > 0) {
        const index = encryptAnimationState.currentIndex - 1;
        const cipherSpan = document.querySelector(`#cipherBitsContainer .bit[data-index='${index}']`);
        if (cipherSpan) {
          cipherSpan.classList.add('appear');
          // 一定時間後にハイライトを削除
          setTimeout(() => {
            cipherSpan.classList.remove('appear');
          }, 1000);
        }
      }
      
      updateEncryptProgress(encryptAnimationState.currentIndex, plainBits.length);
      updateEncryptButtonStates();
    }
  });

  // 1つ進むボタン
  document.getElementById('encryptStepForward').addEventListener('click', () => {
    if (encryptAnimationState.currentIndex < plainBits.length) {
      // 一時停止状態にする
      encryptAnimationState.isPaused = true;
      document.getElementById('encryptPlayPause').textContent = '▶ 再生';
      clearTimeout(encryptAnimationState.timeoutId);
      
      executeEncryptionStep(encryptAnimationState.currentIndex, plainBits, keyBits, cipherBits);
      encryptAnimationState.currentIndex++;
      updateEncryptButtonStates();
    }
  });

  // リセットボタン
  document.getElementById('encryptReset').addEventListener('click', () => {
    clearTimeout(encryptAnimationState.timeoutId);
    encryptAnimationState.isPlaying = false;
    encryptAnimationState.isPaused = false;
    encryptAnimationState.currentIndex = 0;
    
    document.getElementById('encryptPlayPause').textContent = '▶ 再生';
    
    resetBitStates();
    updateEncryptProgress(0, plainBits.length);
    updateEncryptButtonStates();
  });

  // 全処理ボタン
  document.getElementById('encryptComplete').addEventListener('click', () => {
    clearTimeout(encryptAnimationState.timeoutId);
    encryptAnimationState.isPlaying = false;
    encryptAnimationState.isPaused = true;
    document.getElementById('encryptPlayPause').textContent = '▶ 再生';
    
    // すべてのステップを一気に実行
    resetBitStates();
    for (let i = 0; i < plainBits.length; i++) {
      executeSilentStep(i, plainBits, keyBits, cipherBits);
    }
    
    encryptAnimationState.currentIndex = plainBits.length;
    updateEncryptProgress(plainBits.length, plainBits.length);
    updateEncryptButtonStates();
  });

  // スピード選択
  document.getElementById('encryptSpeed').addEventListener('change', (e) => {
    encryptAnimationState.speed = parseInt(e.target.value);
  });
}

// アニメーションをリセット
function resetEncryptionAnimation() {
  clearTimeout(encryptAnimationState.timeoutId);
  encryptAnimationState.isPlaying = false;
  encryptAnimationState.isPaused = false;
  encryptAnimationState.currentIndex = 0;
  
  // ビットの状態をリセット
  resetBitStates();
}

// ビットの視覚状態をリセット
function resetBitStates() {
  // すべてのアクティブ状態を解除
  document.querySelectorAll('.bit.active').forEach(el => el.classList.remove('active'));
  
  // 鍵ビットをリセット
  document.querySelectorAll('#keyBitsContainer .bit').forEach(el => {
    el.classList.remove('burn', 'ash');
  });
  
  // 暗号ビットをプレースホルダーに戻す
  renderPlaceholderCipherBits(plainBits.length);
}

// アニメーションなしでステップを実行（戻る時用）
function executeSilentStep(index, plainBits, keyBitsInput, cipherBitsInput) {
  const keySpan = document.querySelector(`#keyBitsContainer .bit[data-index='${index}']`);
  const cipherSpan = document.querySelector(`#cipherBitsContainer .bit[data-index='${index}']`);
  
  keySpan.classList.add('burn', 'ash');
  cipherSpan.textContent = cipherBitsInput[index];
  cipherSpan.classList.remove('placeholder');
}

// 暗号化タブのイベントハンドラ設定
function setupEncryptionHandlers() {
  // 平文リアルタイム入力処理
  document.getElementById('plaintext').addEventListener('input', () => {
    const text = document.getElementById('plaintext').value;
    const { bits, invalidChar } = textToBitsWithValidation(text);
    const errorArea = document.getElementById('errorMessage');

    if (invalidChar) {
      console.log(`❌ 平文入力エラー: 使用不可文字 "${invalidChar}"`);
      errorArea.textContent = `❌ 使用できない文字があります：「${invalidChar}」`;
      renderBits('plaintextBitsContainer', [], 'plain');
      plainBits = [];
      
      // エラー時は暗号化状態をリセット
      encryptAnimationState.keysGenerated = false;
      encryptAnimationState.currentIndex = 0;
      updateEncryptButtonStates();
      
      // エクスポートボタンを無効化
      const exportButton = document.getElementById('exportEncryption');
      if (exportButton) exportButton.disabled = true;
    } else {
      console.log(`📝 平文入力: "${text}" → ${bits.length}ビット [${bits.join('')}]`);
      errorArea.textContent = '';
      renderBits('plaintextBitsContainer', bits, 'plain');
      plainBits = bits;
      
      // 平文が変更されたら暗号化状態をリセット
      encryptAnimationState.keysGenerated = false;
      encryptAnimationState.currentIndex = 0;
      updateEncryptButtonStates();
      
      // エクスポートボタンを無効化
      const exportButton = document.getElementById('exportEncryption');
      if (exportButton) exportButton.disabled = true;
    }
  });

  // 鍵生成ボタン
  document.getElementById('generateKey').addEventListener('click', () => {
    const plainText = document.getElementById('plaintext').value;
    const { bits, invalidChar } = textToBitsWithValidation(plainText);
    const errorArea = document.getElementById('errorMessage');

    if (invalidChar) {
      errorArea.textContent = `❌ 使用できない文字があります：「${invalidChar}」`;
      renderBits('plaintextBitsContainer', [], 'plain');
      renderBits('keyBitsContainer', [], 'key');
      renderBits('cipherBitsContainer', [], 'cipher');
      plainBits = [];
      keyBits = [];
      cipherBits = [];
      return;
    }

    errorArea.textContent = '';
    plainBits = bits;
    keyBits = generateRandomBits(plainBits.length);
    cipherBits = xorBits(plainBits, keyBits);

    console.log(`🔑 鍵生成: ${keyBits.length}ビット [${keyBits.join('')}]`);
    console.log(`🔐 暗号文計算: [${cipherBits.join('')}]`);

    renderBits('plaintextBitsContainer', plainBits, 'plain');
    renderBits('keyBitsContainer', keyBits, 'key');
    renderPlaceholderCipherBits(plainBits.length);
    
    // 暗号化状態を更新
    encryptAnimationState.keysGenerated = true;
    encryptAnimationState.totalBits = plainBits.length;
    encryptAnimationState.currentIndex = 0;
    updateEncryptButtonStates();
    updateEncryptProgress(0, plainBits.length);
    
    // エクスポートボタンを無効化（まだ暗号化完了していない）
    const exportButton = document.getElementById('exportEncryption');
    if (exportButton) exportButton.disabled = true;
  });

  // 🔘 暗号化開始ボタン
  document.getElementById('startAnimation').addEventListener('click', () => {
    if (!plainBits.length || !keyBits.length || !cipherBits.length) return;
    
    console.log(`▶️ 暗号化アニメーション開始: ${plainBits.length}ステップ`);
    
    // アニメーションをリセット
    resetEncryptionAnimation();
    animateEncryption(plainBits, keyBits, cipherBits);
  });
}