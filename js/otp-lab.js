// OTP実験室の機能

// 実験1: XORゲート構成シミュレーター
let gateSimulatorState = {
  inputA: 0,
  inputB: 0
};

// XOR演算を基本ゲートで実装
function simulateXORConstruction(a, b) {
  const notA = a === 0 ? 1 : 0;
  const notB = b === 0 ? 1 : 0;
  const andLeft = a === 1 && notB === 1 ? 1 : 0;  // A ∧ ¬B
  const andRight = notA === 1 && b === 1 ? 1 : 0; // ¬A ∧ B
  const result = andLeft === 1 || andRight === 1 ? 1 : 0; // (A ∧ ¬B) ∨ (¬A ∧ B)
  
  return {
    notA,
    notB,
    andLeft,
    andRight,
    result
  };
}

// ゲート構成の結果を更新
function updateGateConstruction() {
  const a = gateSimulatorState.inputA;
  const b = gateSimulatorState.inputB;
  const simulation = simulateXORConstruction(a, b);
  
  // 表示を更新
  document.getElementById('inputADisplay').textContent = a;
  document.getElementById('inputBDisplay').textContent = b;
  document.getElementById('notADisplay').textContent = simulation.notA;
  document.getElementById('notBDisplay').textContent = simulation.notB;
  document.getElementById('andLeftDisplay').textContent = simulation.andLeft;
  document.getElementById('andRightDisplay').textContent = simulation.andRight;
  document.getElementById('finalResultDisplay').textContent = simulation.result;
  
  // SVG内の中間値も更新（色と値の動的変化）
  const notAText = document.getElementById('notA');
  const notBText = document.getElementById('notB');
  const andLeftText = document.getElementById('andLeft');
  const andRightText = document.getElementById('andRight');
  
  // ダークモードかどうかをチェック
  const isDarkMode = document.body.classList.contains('dark-mode');
  const INACTIVE_COLOR = isDarkMode ? '#ffffff' : '#333';  // ダークモードでは白色
  const ACTIVE_COLOR = '#e74c3c';
  
  if (notAText) {
    notAText.textContent = `¬A=${simulation.notA}`;
    notAText.style.fill = simulation.notA ? ACTIVE_COLOR : INACTIVE_COLOR;
  }
  if (notBText) {
    notBText.textContent = `¬B=${simulation.notB}`;
    notBText.style.fill = simulation.notB ? ACTIVE_COLOR : INACTIVE_COLOR;
  }
  if (andLeftText) {
    andLeftText.textContent = `A∧¬B=${simulation.andLeft}`;
    andLeftText.style.fill = simulation.andLeft ? ACTIVE_COLOR : INACTIVE_COLOR;
  }
  if (andRightText) {
    andRightText.textContent = `¬A∧B=${simulation.andRight}`;
    andRightText.style.fill = simulation.andRight ? ACTIVE_COLOR : INACTIVE_COLOR;
  }
  
  // 電線の色を動的に変更
  updateWireColors(a, b, simulation);
  
  // 説明文を更新
  const explanation = `${a} ⊕ ${b} = ${simulation.result}\n【計算過程: NOT(${a})=${simulation.notA}, NOT(${b})=${simulation.notB}, ${a}∧${simulation.notB}=${simulation.andLeft}, ${simulation.notA}∧${b}=${simulation.andRight}, ${simulation.andLeft}∨${simulation.andRight}=${simulation.result}】`;
  document.getElementById('constructionExplanation').textContent = explanation;
  
  console.log(`🔬 実験1: XOR構成シミュレーション ${a} ⊕ ${b} = ${simulation.result}`);
}

// 電線の色を動的に変更する関数
function updateWireColors(a, b, simulation) {
  const svg = document.querySelector('.construction-svg');
  if (!svg) return;
  
  // 全ての線を取得（SVG内のline要素）
  const lines = svg.querySelectorAll('line');
  
  // ダークモードかどうかをチェック
  const isDarkMode = document.body.classList.contains('dark-mode');
  
  // デフォルトの黒色と赤色を定義（ダークモード対応）
  const BLACK = isDarkMode ? '#ffffff' : '#333';  // ダークモードでは白色
  const RED = '#e74c3c';
  
  // 各線の色を設定（新しい配線構造に対応）
  if (lines.length >= 8) {
    // メイン入力線（A, B）
    lines[0].style.stroke = a ? RED : BLACK; // A入力線
    lines[1].style.stroke = b ? RED : BLACK; // B入力線
    
    // A入力の直接分岐
    lines[2].style.stroke = a ? RED : BLACK; // A → 上ANDゲート
    lines[3].style.stroke = a ? RED : BLACK; // A → ¬A NOTゲート
    
    // B入力の直接分岐
    lines[4].style.stroke = b ? RED : BLACK; // B → 下ANDゲート
    lines[5].style.stroke = b ? RED : BLACK; // B → ¬B NOTゲート
    
    // NOTゲートからANDゲートへの接続
    lines[6].style.stroke = simulation.notB ? RED : BLACK; // ¬B → 上ANDゲート
    lines[7].style.stroke = simulation.notA ? RED : BLACK; // ¬A → 下ANDゲート
    
    // ANDゲートからORゲートへ
    if (lines.length >= 10) {
      lines[8].style.stroke = simulation.andLeft ? RED : BLACK; // 上ANDゲート → ORゲート
      lines[9].style.stroke = simulation.andRight ? RED : BLACK; // 下ANDゲート → ORゲート
    }
    
    // 出力線
    if (lines.length >= 11) {
      lines[10].style.stroke = simulation.result ? RED : BLACK; // ORゲート → 出力
    }
  }
  
  // 分岐点の円の色も変更
  const circles = svg.querySelectorAll('circle[r="4"]');
  if (circles.length >= 2) {
    circles[0].style.fill = a ? RED : BLACK; // A入力の分岐点
    circles[1].style.fill = b ? RED : BLACK; // B入力の分岐点
  }
  
  // 入力ラベルの色も変更
  const labelA = svg.querySelector('text[x="15"][y="75"]');
  const labelB = svg.querySelector('text[x="15"][y="255"]');
  const labelOutput = svg.querySelector('text[x="490"]');
  
  if (labelA) labelA.style.fill = a ? RED : BLACK;
  if (labelB) labelB.style.fill = b ? RED : BLACK;
  if (labelOutput) labelOutput.style.fill = simulation.result ? RED : BLACK;
}

// 実験2: 鍵再利用脆弱性デモ
let keyReuseState = {
  plaintext1: '',
  plaintext2: '',
  sharedKey: null,
  cipher1: null,
  cipher2: null
};

// 鍵再利用脆弱性を実証
function demonstrateKeyReuse() {
  const p1 = document.getElementById('plaintext1').value;
  const p2 = document.getElementById('plaintext2').value;
  
  if (!p1 || !p2) {
    showToast('⚠️ 両方の平文を入力してください');
    return;
  }
  
  // 文字数を合わせる（短い方に合わせる）
  const minLength = Math.min(p1.length, p2.length);
  keyReuseState.plaintext1 = p1.substring(0, minLength);
  keyReuseState.plaintext2 = p2.substring(0, minLength);
  
  // バリデーション
  const { bits: p1Bits, invalidChar: p1Invalid } = validateLabText(keyReuseState.plaintext1);
  const { bits: p2Bits, invalidChar: p2Invalid } = validateLabText(keyReuseState.plaintext2);
  
  if (p1Invalid || p2Invalid) {
    showToast(`❌ 使用できない文字があります: ${p1Invalid || p2Invalid}`);
    return;
  }
  
  // 同じ鍵を生成
  keyReuseState.sharedKey = OtpCore.bytesToBits(OtpCore.randomBytes(p1Bits.length / 8));
  
  // 暗号化
  keyReuseState.cipher1 = OtpCore.bytesToBits(OtpCore.xorBytes(
    OtpCore.bitsToBytes(p1Bits), OtpCore.bitsToBytes(keyReuseState.sharedKey)));
  keyReuseState.cipher2 = OtpCore.bytesToBits(OtpCore.xorBytes(
    OtpCore.bitsToBytes(p2Bits), OtpCore.bitsToBytes(keyReuseState.sharedKey)));
  
  // 攻撃者による暗号文のXOR（鍵が相殺される）
  const ciphertextXor = OtpCore.bytesToBits(OtpCore.xorBytes(
    OtpCore.bitsToBytes(keyReuseState.cipher1), OtpCore.bitsToBytes(keyReuseState.cipher2)));
  const plaintextXor = OtpCore.bytesToBits(OtpCore.xorBytes(
    OtpCore.bitsToBytes(p1Bits), OtpCore.bitsToBytes(p2Bits)));
  
  // 結果表示
  displayKeyReuseResults(p1Bits, p2Bits, keyReuseState.sharedKey, 
                        keyReuseState.cipher1, keyReuseState.cipher2, 
                        ciphertextXor, plaintextXor);
  
  document.getElementById('reuseResults').style.display = 'block';
  
  console.log('⚠️ 実験2: 鍵再利用脆弱性を実証しました');
}

// 鍵再利用結果を表示
function displayKeyReuseResults(p1Bits, p2Bits, key, c1Bits, c2Bits, cXor, pXor) {
  // ビット表示用のフォーマット
  const formatBits = (bits) => bits.map((bit, i) => 
    i > 0 && i % 8 === 0 ? '_' + bit : bit
  ).join('').replace(/^_/, '');
  
  document.getElementById('p1bits').textContent = formatBits(p1Bits);
  document.getElementById('keybits').textContent = formatBits(key);
  document.getElementById('c1bits').textContent = formatBits(c1Bits);
  
  document.getElementById('p2bits').textContent = formatBits(p2Bits);
  document.getElementById('keybits2').textContent = formatBits(key);
  document.getElementById('c2bits').textContent = formatBits(c2Bits);
  
  document.getElementById('ciphertextXor').textContent = formatBits(cXor);
  document.getElementById('plaintextXor').textContent = formatBits(pXor);
  
  // 結果の一致確認
  const isMatch = JSON.stringify(cXor) === JSON.stringify(pXor);
  document.getElementById('matchResult').textContent = isMatch ? 
    '一致しています！' : '一致していません（エラー）';
  document.getElementById('matchResult').style.color = isMatch ? '#c62828' : '#4caf50';
}

// 実験3: 断片解析デモ
let fragmentAnalysisState = {
  targetPlaintext: '',
  targetKey: null,
  targetCipher: null
};

// 対象平文を暗号化
function encryptTargetText() {
  const plaintext = document.getElementById('targetPlaintext').value;
  
  if (!plaintext) {
    showToast('⚠️ 対象平文を入力してください');
    return;
  }
  
  const { bits, invalidChar } = validateLabText(plaintext);
  if (invalidChar) {
    showToast(`❌ 使用できない文字があります: ${invalidChar}`);
    return;
  }
  
  fragmentAnalysisState.targetPlaintext = plaintext;
  fragmentAnalysisState.targetKey = OtpCore.bytesToBits(OtpCore.randomBytes(bits.length / 8));
  fragmentAnalysisState.targetCipher = OtpCore.bytesToBits(OtpCore.xorBytes(
    OtpCore.bitsToBytes(bits), OtpCore.bitsToBytes(fragmentAnalysisState.targetKey)));
  
  // 結果表示
  const formatBits = (bits) => bits.map((bit, i) => 
    i > 0 && i % 8 === 0 ? '_' + bit : bit
  ).join('').replace(/^_/, '');
  
  document.getElementById('targetPlaintextBits').textContent = formatBits(bits);
  document.getElementById('targetKeyBits').textContent = formatBits(fragmentAnalysisState.targetKey);
  document.getElementById('targetCipherBits').textContent = formatBits(fragmentAnalysisState.targetCipher);
  
  document.getElementById('encryptedDisplay').style.display = 'block';
  document.getElementById('fragmentInput').style.display = 'block';
  
  console.log('🔒 実験3: 対象テキストを暗号化しました');
}

// 断片から鍵を解析
function analyzeFragment() {
  if (!fragmentAnalysisState.targetCipher) {
    showToast('⚠️ まず対象テキストを暗号化してください');
    return;
  }
  
  const knownFragment = document.getElementById('knownFragment').value;
  const position = parseInt(document.getElementById('fragmentPosition').value) - 1; // 0-based
  
  if (!knownFragment) {
    showToast('⚠️ 既知の断片を入力してください');
    return;
  }
  
  if (position < 0 || position + knownFragment.length > fragmentAnalysisState.targetPlaintext.length) {
    showToast('⚠️ 位置が範囲外です');
    return;
  }
  
  const { bits: fragmentBits, invalidChar } = validateLabText(knownFragment);
  if (invalidChar) {
    showToast(`❌ 使用できない文字があります: ${invalidChar}`);
    return;
  }
  
  // 対応する暗号文ビットを取得
  const startBit = position * 8;
  const endBit = startBit + fragmentBits.length;
  const correspondingCipherBits = fragmentAnalysisState.targetCipher.slice(startBit, endBit);
  
  // 鍵を推測 (K = P ⊕ C)
  const deducedKeyBits = OtpCore.bytesToBits(OtpCore.xorBytes(
    OtpCore.bitsToBytes(fragmentBits), OtpCore.bitsToBytes(correspondingCipherBits)));
  
  // 実際の鍵と比較して検証
  const actualKeyBits = fragmentAnalysisState.targetKey.slice(startBit, endBit);
  const isCorrect = JSON.stringify(deducedKeyBits) === JSON.stringify(actualKeyBits);
  
  // 結果表示
  displayFragmentAnalysis(fragmentBits, correspondingCipherBits, deducedKeyBits, isCorrect);
  
  document.getElementById('analysisResults').style.display = 'block';
  
  console.log(`🕵️ 実験3: 断片解析完了 - 推測成功: ${isCorrect}`);
}

// 断片解析結果を表示
function displayFragmentAnalysis(fragmentBits, cipherBits, deducedKey, isCorrect) {
  const formatBits = (bits) => bits.map((bit, i) => 
    i > 0 && i % 8 === 0 ? '_' + bit : bit
  ).join('').replace(/^_/, '');
  
  document.getElementById('knownPlaintextBits').textContent = formatBits(fragmentBits);
  document.getElementById('correspondingCipherBits').textContent = formatBits(cipherBits);
  document.getElementById('deducedKeyBits').textContent = formatBits(deducedKey);
  
  document.getElementById('verificationResult').textContent = isCorrect ?
    '推測された鍵は実際の鍵と一致します！' : 
    '推測された鍵が実際の鍵と一致しません（エラー）';
  document.getElementById('verificationResult').style.color = isCorrect ? '#2d5016' : '#c62828';
}

// アコーディオンの状態管理
let accordionState = {
  1: false, // すべての実験は初期状態で閉じている
  2: false,
  3: false
};

// 表のホバーイベントを設定
function setupTableHoverEffects() {
  // 表の各セルとSVGラベルの対応関係を定義
  const cellMappings = [
    { cellId: 'inputADisplay', svgSelectors: ['text[x="15"][y="75"]'] },      // A入力
    { cellId: 'inputBDisplay', svgSelectors: ['text[x="15"][y="255"]'] },     // B入力
    { cellId: 'notADisplay', svgSelectors: ['#notA'] },                       // ¬A
    { cellId: 'notBDisplay', svgSelectors: ['#notB'] },                       // ¬B
    { cellId: 'andLeftDisplay', svgSelectors: ['#andLeft'] },                 // A∧¬B
    { cellId: 'andRightDisplay', svgSelectors: ['#andRight'] },               // ¬A∧B
    { cellId: 'finalResultDisplay', svgSelectors: ['text[x="490"]'] }         // A⊕B出力
  ];
  
  const svg = document.querySelector('.construction-svg');
  if (!svg) return;
  
  cellMappings.forEach(mapping => {
    const cell = document.getElementById(mapping.cellId);
    if (!cell) return;
    
    // マウスが入った時
    cell.addEventListener('mouseenter', () => {
      mapping.svgSelectors.forEach(selector => {
        const svgElement = svg.querySelector(selector);
        if (svgElement) {
          highlightSVGElement(svgElement);
        }
      });
    });
    
    // マウスが出た時
    cell.addEventListener('mouseleave', () => {
      mapping.svgSelectors.forEach(selector => {
        const svgElement = svg.querySelector(selector);
        if (svgElement) {
          unhighlightSVGElement(svgElement);
        }
      });
    });
  });
  
  console.log('📊 表のホバーエフェクトが設定されました');
}

// SVG要素をハイライト
function highlightSVGElement(element) {
  // 元の色を保存
  element.dataset.originalFill = element.style.fill || getComputedStyle(element).fill;
  element.dataset.originalStroke = element.style.stroke || getComputedStyle(element).stroke;
  element.dataset.originalStrokeWidth = element.style.strokeWidth || getComputedStyle(element).strokeWidth;
  
  // ダークモードかどうかをチェック
  const isDarkMode = document.body.classList.contains('dark-mode');
  
  // より読みやすいハイライト効果を適用
  element.style.fill = isDarkMode ? '#ffd700' : '#ff6b35';  // ダークモード: 金色、ライトモード: オレンジ
  element.style.stroke = '#ff8c00'; // オレンジ色の輪郭
  element.style.strokeWidth = '1px';
  element.style.filter = 'drop-shadow(0 0 4px rgba(255, 140, 0, 0.6))';
  element.style.transform = 'scale(1.1)';  // 拡大を控えめに
  element.style.transformOrigin = 'center';
  element.style.transition = 'all 0.2s ease';
  element.style.fontWeight = 'bold';
}

// SVG要素のハイライトを解除
function unhighlightSVGElement(element) {
  // 元の色に戻す
  const originalFill = element.dataset.originalFill;
  const originalStroke = element.dataset.originalStroke;
  const originalStrokeWidth = element.dataset.originalStrokeWidth;
  
  if (originalFill && originalFill !== 'none') {
    element.style.fill = originalFill;
  } else {
    element.style.removeProperty('fill');
  }
  
  if (originalStroke && originalStroke !== 'none') {
    element.style.stroke = originalStroke;
  } else {
    element.style.removeProperty('stroke');
  }
  
  if (originalStrokeWidth && originalStrokeWidth !== 'none') {
    element.style.strokeWidth = originalStrokeWidth;
  } else {
    element.style.removeProperty('stroke-width');
  }
  
  element.style.removeProperty('filter');
  element.style.removeProperty('transform');
  element.style.removeProperty('transform-origin');
  element.style.removeProperty('transition');
  element.style.removeProperty('font-weight');
  
  // データ属性をクリア
  delete element.dataset.originalFill;
  delete element.dataset.originalStroke;
  delete element.dataset.originalStrokeWidth;
}

// アコーディオンの切り替え
function toggleAccordion(experimentNumber) {
  const header = document.querySelector(`.accordion-header[data-experiment="${experimentNumber}"]`);
  const content = document.getElementById(`experiment${experimentNumber}-content`);
  
  if (!header || !content) return;
  
  // 状態を切り替え
  accordionState[experimentNumber] = !accordionState[experimentNumber];
  
  if (accordionState[experimentNumber]) {
    // 開く
    header.classList.remove('collapsed');
    content.classList.remove('collapsed');
  } else {
    // 閉じる
    header.classList.add('collapsed');
    content.classList.add('collapsed');
  }
  
  console.log(`🔄 実験${experimentNumber}のアコーディオンを${accordionState[experimentNumber] ? '展開' : '折りたたみ'}しました`);
}

// すべてのアコーディオンを設定
function setupAccordion() {
  for (let i = 1; i <= 3; i++) {
    const header = document.querySelector(`.accordion-header[data-experiment="${i}"]`);
    if (header) {
      header.addEventListener('click', () => toggleAccordion(i));
      
      // 初期状態を設定（すべての実験が折りたたまれた状態）
      if (!accordionState[i]) {
        header.classList.add('collapsed');
        const content = document.getElementById(`experiment${i}-content`);
        if (content) {
          content.classList.add('collapsed');
        }
      }
    }
  }
  
  console.log('🪗 アコーディオン機能が初期化されました');
}

// OTP実験室の初期化
function setupOTPLabHandlers() {
  // アコーディオン機能を設定
  setupAccordion();
  
  // 実験1: ゲート構成シミュレーター
  const gateInputA = document.getElementById('gateInputA');
  const gateInputB = document.getElementById('gateInputB');
  
  if (gateInputA && gateInputB) {
    gateInputA.addEventListener('change', (e) => {
      gateSimulatorState.inputA = parseInt(e.target.value);
      updateGateConstruction();
    });
    
    gateInputB.addEventListener('change', (e) => {
      gateSimulatorState.inputB = parseInt(e.target.value);
      updateGateConstruction();
    });
    
    // 初期状態を設定
    updateGateConstruction();
  }
  
  // 表のホバーイベントを設定
  setupTableHoverEffects();
  
  // 実験2: 鍵再利用デモ
  const demonstrateButton = document.getElementById('demonstrateReuse');
  if (demonstrateButton) {
    demonstrateButton.addEventListener('click', demonstrateKeyReuse);
  }
  
  // 実験3: 断片解析デモ
  const encryptButton = document.getElementById('encryptTarget');
  const analyzeButton = document.getElementById('analyzeFragment');
  
  if (encryptButton) {
    encryptButton.addEventListener('click', encryptTargetText);
  }
  
  if (analyzeButton) {
    analyzeButton.addEventListener('click', analyzeFragment);
  }
  
  // 入力フィールドの最大長制限
  const plaintext1 = document.getElementById('plaintext1');
  const plaintext2 = document.getElementById('plaintext2');
  const targetPlaintext = document.getElementById('targetPlaintext');
  const knownFragment = document.getElementById('knownFragment');
  
  if (plaintext1) plaintext1.addEventListener('input', validateASCIIInput);
  if (plaintext2) plaintext2.addEventListener('input', validateASCIIInput);
  if (targetPlaintext) targetPlaintext.addEventListener('input', validateASCIIInput);
  if (knownFragment) knownFragment.addEventListener('input', validateASCIIInput);
  
  console.log('🧪 OTP実験室が初期化されました');
}

// ASCII入力の検証
function validateASCIIInput(event) {
  const input = event.target;
  const { bits, invalidChar } = validateLabText(input.value);
  
  if (invalidChar) {
    input.style.borderColor = '#f44336';
    input.title = `使用できない文字: ${invalidChar}`;
  } else {
    input.style.borderColor = '';
    input.title = '';
  }
}

// トースト通知（既存の関数を使用）
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  } else {
    // フォールバック
    console.log(`📢 ${message}`);
  }
}

// OTP実験室タブが表示されたときの処理
function onOTPLabTabShow() {
  // 初期状態のゲート構成を更新
  if (typeof updateGateConstruction === 'function') {
    updateGateConstruction();
  }
  
  console.log('🧪 OTP実験室タブが表示されました');
}

// ASCII-only experiments use the byte core; encryption supports full UTF-8.
function validateLabText(text) {
  const invalidChar = [...text].find(ch => {
    const bytes = OtpCore.encodeText(ch);
    return bytes.length !== 1 || bytes[0] < 0x20 || bytes[0] > 0x7e;
  }) || null;
  return { bits: invalidChar ? [] : OtpCore.bytesToBits(OtpCore.encodeText(text)), invalidChar };
}
