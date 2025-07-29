// メイン初期化処理

// 初期表示でHELLOのビットを反映
window.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupDecryptionHandlers();
  setupEncryptionControls();
  setupDecryptionControls();
  setupEncryptionHandlers();
  setupBitCopyButtons();
  setupFileExportHandlers();

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
  
  // 初期状態でボタン状態を更新
  updateEncryptButtonStates();
  updateDecryptButtonStates();
});