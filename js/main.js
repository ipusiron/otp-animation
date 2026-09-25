// メイン初期化処理

// 初期表示でHELLOのビットを反映
window.addEventListener('DOMContentLoaded', () => {
  i18n.init();
  setupTabs();
  setupDecryptionHandlers();
  setupEncryptionControls();
  setupDecryptionControls();
  setupEncryptionHandlers();
  setupBitCopyButtons();
  setupFileExportHandlers();
  
  // ダークモード機能を初期化
  initializeDarkMode();
  setupDarkModeHandlers();
  
  // ヘルプモーダル機能を初期化
  setupHelpModalHandlers();
  
  // XORの基礎タブ機能を初期化
  setupXORBasicsHandlers();
  
  // OTP実験室タブ機能を初期化
  setupOTPLabHandlers();

  updatePlaintext();
  refreshDecryption();
});
