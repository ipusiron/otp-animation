// XORの基礎タブの機能

// XOR演算を実行
function performXOR(bitA, bitB) {
  return bitA ^ bitB;
}

// デモの説明文を生成
function generateExplanation(bitA, bitB, result) {
  const key = bitA === bitB ? 'xor.same' : 'xor.different';
  return i18n.t(key, { a: bitA, b: bitB, result });
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
  resultElement.classList.add('pulse');
  setTimeout(() => {
    resultElement.classList.remove('pulse');
  }, 200);

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

  }
}
