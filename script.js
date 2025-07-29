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

// 指定長のランダムビット列（鍵）を生成
function generateRandomBits(length) {
  return Array.from({ length }, () => Math.round(Math.random()));
}

// XOR処理（ビット単位）
function xorBits(bits1, bits2) {
  return bits1.map((bit, i) => bit ^ bits2[i]);
}

// 各ビットを画面に描画（8ビットグループで）
function renderBits(containerId, bits, className) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  // 8ビットごとにグループ化
  for (let i = 0; i < bits.length; i += 8) {
    const group = document.createElement('div');
    group.className = 'bit-group';
    
    for (let j = 0; j < 8 && i + j < bits.length; j++) {
      const span = document.createElement('span');
      span.className = `bit ${className}`;
      span.dataset.index = i + j;
      span.textContent = bits[i + j];
      group.appendChild(span);
    }
    
    container.appendChild(group);
  }
}

// 仮の暗号ビットを描画（'?'でプレースホルダ表示）
function renderPlaceholderCipherBits(length) {
  const container = document.getElementById('cipherBitsContainer');
  container.innerHTML = '';
  
  // 8ビットごとにグループ化
  for (let i = 0; i < length; i += 8) {
    const group = document.createElement('div');
    group.className = 'bit-group';
    
    for (let j = 0; j < 8 && i + j < length; j++) {
      const span = document.createElement('span');
      span.className = 'bit placeholder';
      span.dataset.index = i + j;
      span.textContent = '?';
      group.appendChild(span);
    }
    
    container.appendChild(group);
  }
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

  let index = 0;

  function step() {
    if (index >= plainBits.length) return;

    const keySpan = document.querySelector(`#keyBitsContainer .bit[data-index='${index}']`);
    const cipherSpan = document.querySelector(`#cipherBitsContainer .bit[data-index='${index}']`);

    keySpan.classList.add('burn');

    cipherSpan.textContent = cipherBitsInput[index];
    cipherSpan.classList.remove('placeholder');
    cipherSpan.classList.add('appear');

    setTimeout(() => {
      keySpan.classList.add('ash');
      // 🔧 鍵ビットの内容は消さない → あえて保持する
    }, 800);

    index++;
    setTimeout(step, 300);
  }

  step();
}


// グローバル変数
let plainBits = [];
let keyBits = [];
let cipherBits = [];

// 平文リアルタイム入力処理
document.getElementById('plaintext').addEventListener('input', () => {
  const text = document.getElementById('plaintext').value;
  const { bits, invalidChar } = textToBitsWithValidation(text);
  const errorArea = document.getElementById('errorMessage');

  if (invalidChar) {
    errorArea.textContent = `❌ 使用できない文字があります：「${invalidChar}」`;
    renderBits('plaintextBitsContainer', [], 'plain');
    plainBits = [];
  } else {
    errorArea.textContent = '';
    renderBits('plaintextBitsContainer', bits, 'plain');
    plainBits = bits;
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

  renderBits('plaintextBitsContainer', plainBits, 'plain');
  renderBits('keyBitsContainer', keyBits, 'key');
  renderPlaceholderCipherBits(plainBits.length);
});

// 🔘 暗号化開始ボタン
document.getElementById('startAnimation').addEventListener('click', () => {
  if (!plainBits.length || !keyBits.length || !cipherBits.length) return;
  animateEncryption(plainBits, keyBits, cipherBits);
});

// タブ切り替え機能
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // すべてのタブボタンとパネルの非アクティブ化
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));

      // クリックされたタブのアクティブ化
      button.classList.add('active');
      document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
  });
}

// 復号用のグローバル変数
let cipherTextBits = [];
let decryptKeyBits = [];
let decryptedTextBits = [];

// 復号タブのイベントハンドラ
function setupDecryptionHandlers() {
  // 暗号文リアルタイム入力処理
  document.getElementById('ciphertext').addEventListener('input', () => {
    const text = document.getElementById('ciphertext').value;
    const { bits, invalidChar } = textToBitsWithValidation(text);
    const errorArea = document.getElementById('decryptErrorMessage');

    if (invalidChar) {
      errorArea.textContent = `❌ 使用できない文字があります：「${invalidChar}」`;
      renderBits('ciphertextBitsContainer', [], 'cipher');
      cipherTextBits = [];
    } else {
      errorArea.textContent = '';
      renderBits('ciphertextBitsContainer', bits, 'cipher');
      cipherTextBits = bits;
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

    renderBits('ciphertextBitsContainer', cipherTextBits, 'cipher');
    renderBits('decryptKeyBitsContainer', decryptKeyBits, 'key');
    renderPlaceholderDecryptedBits(cipherTextBits.length);
  });

  // 復号開始ボタン
  document.getElementById('startDecryption').addEventListener('click', () => {
    if (!cipherTextBits.length || !decryptKeyBits.length || !decryptedTextBits.length) return;
    animateDecryption(cipherTextBits, decryptKeyBits, decryptedTextBits);
  });
}

// 復号ビットのプレースホルダー表示
function renderPlaceholderDecryptedBits(length) {
  const container = document.getElementById('decryptedBitsContainer');
  container.innerHTML = '';
  
  // 8ビットごとにグループ化
  for (let i = 0; i < length; i += 8) {
    const group = document.createElement('div');
    group.className = 'bit-group';
    
    for (let j = 0; j < 8 && i + j < length; j++) {
      const span = document.createElement('span');
      span.className = 'bit placeholder';
      span.dataset.index = i + j;
      span.textContent = '?';
      group.appendChild(span);
    }
    
    container.appendChild(group);
  }
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

  let index = 0;

  function step() {
    if (index >= cipherBits.length) return;

    const keySpan = document.querySelector(`#decryptKeyBitsContainer .bit[data-index='${index}']`);
    const decryptedSpan = document.querySelector(`#decryptedBitsContainer .bit[data-index='${index}']`);

    keySpan.classList.add('burn');

    decryptedSpan.textContent = decryptedBitsInput[index];
    decryptedSpan.classList.remove('placeholder');
    decryptedSpan.classList.add('appear');

    setTimeout(() => {
      keySpan.classList.add('ash');
    }, 800);

    index++;
    setTimeout(step, 300);
  }

  step();
}

// 初期表示でHELLOのビットを反映
window.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupDecryptionHandlers();

  const input = document.getElementById('plaintext');
  const text = input.value;
  const { bits, invalidChar } = textToBitsWithValidation(text);
  const errorArea = document.getElementById('errorMessage');

  if (invalidChar) {
    errorArea.textContent = `❌ 使用できない文字があります：「${invalidChar}」`;
    renderBits('plaintextBitsContainer', [], 'plain');
    return;
  }

  errorArea.textContent = '';
  plainBits = bits;
  renderBits('plaintextBitsContainer', plainBits, 'plain');
});
