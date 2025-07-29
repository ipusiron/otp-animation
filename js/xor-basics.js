// XORの基礎タブの機能

// XOR演算を実行
function performXOR(bitA, bitB) {
  return bitA ^ bitB;
}

// デモの説明文を生成
function generateExplanation(bitA, bitB, result) {
  const explanations = {
    '0,0': '0 ⊕ 0 = 0（同じ値なので結果は0）',
    '0,1': '0 ⊕ 1 = 1（異なる値なので結果は1）',
    '1,0': '1 ⊕ 0 = 1（異なる値なので結果は1）',
    '1,1': '1 ⊕ 1 = 0（同じ値なので結果は0）'
  };
  
  return explanations[`${bitA},${bitB}`];
}

// デモの結果を更新
function updateXORDemo() {
  const bitA = parseInt(document.getElementById('bitA').value);
  const bitB = parseInt(document.getElementById('bitB').value);
  const result = performXOR(bitA, bitB);
  
  // 結果を表示
  const resultElement = document.getElementById('xorResult');
  resultElement.textContent = result;
  
  // 説明文を更新
  const explanationElement = document.getElementById('demoExplanation');
  explanationElement.textContent = generateExplanation(bitA, bitB, result);
  
  // 視覚的フィードバック（結果の色とアニメーション）
  resultElement.style.transform = 'scale(1.2)';
  setTimeout(() => {
    resultElement.style.transform = 'scale(1)';
  }, 200);
  
  console.log(`🔗 XOR演算: ${bitA} ⊕ ${bitB} = ${result}`);
}

// XORの基礎タブのイベントハンドラを設定
function setupXORBasicsHandlers() {
  // ビット選択のイベントリスナー
  const bitASelect = document.getElementById('bitA');
  const bitBSelect = document.getElementById('bitB');
  
  if (bitASelect && bitBSelect) {
    bitASelect.addEventListener('change', updateXORDemo);
    bitBSelect.addEventListener('change', updateXORDemo);
    
    // 初期状態の結果を設定
    updateXORDemo();
    
    console.log('🔗 XORの基礎タブが初期化されました');
  }
}

// 真理値表の行をハイライト（視覚的な学習効果）
function highlightTruthTableRow(bitA, bitB) {
  // 全ての行のハイライトをクリア
  const rows = document.querySelectorAll('.truth-table tbody tr');
  rows.forEach(row => row.classList.remove('highlighted'));
  
  // 対応する行をハイライト
  const rowIndex = bitA * 2 + bitB; // 0,0->0, 0,1->1, 1,0->2, 1,1->3
  if (rows[rowIndex]) {
    rows[rowIndex].classList.add('highlighted');
    
    // 一定時間後にハイライトを削除
    setTimeout(() => {
      rows[rowIndex].classList.remove('highlighted');
    }, 2000);
  }
}

// 真理値表ハイライト用のCSS（動的に追加）
function addTruthTableHighlightCSS() {
  const style = document.createElement('style');
  style.textContent = `
    .truth-table tbody tr.highlighted {
      background: #fff3cd !important;
      transform: scale(1.02);
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
    }
    
    body.dark-mode .truth-table tbody tr.highlighted {
      background: #4d3d1a !important;
      box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    }
  `;
  document.head.appendChild(style);
}

// XORの性質を説明するアニメーション（将来の拡張用）
function demonstrateXORProperties() {
  // A ⊕ B ⊕ B = A の性質を視覚的に示す
  // この機能は必要に応じて後で実装
}

// XORの基礎タブが表示されたときの処理
function onXORBasicsTabShow() {
  // 真理値表ハイライト用CSSを追加（一度だけ）
  if (!document.querySelector('style[data-xor-highlight]')) {
    addTruthTableHighlightCSS();
    const style = document.querySelector('style:last-child');
    if (style) {
      style.setAttribute('data-xor-highlight', 'true');
    }
  }
  
  // デモの状態を更新
  updateXORDemo();
}