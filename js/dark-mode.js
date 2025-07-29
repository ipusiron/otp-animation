// ダークモード機能

// ダークモード状態を管理
let isDarkMode = false;

// ローカルストレージのキー
const DARK_MODE_KEY = 'otp-animation-dark-mode';

// ダークモードの初期化
function initializeDarkMode() {
  // ローカルストレージから設定を読み込み
  const savedMode = localStorage.getItem(DARK_MODE_KEY);
  
  if (savedMode === 'true') {
    enableDarkMode();
  } else if (savedMode === 'false') {
    disableDarkMode();
  } else {
    // 初回訪問時はシステム設定に従う
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
  }
  
  console.log(`🌙 ダークモード初期化: ${isDarkMode ? 'ON' : 'OFF'}`);
}

// ダークモードを有効にする
function enableDarkMode() {
  isDarkMode = true;
  document.body.classList.add('dark-mode');
  updateToggleButton();
  localStorage.setItem(DARK_MODE_KEY, 'true');
  
  // OTP実験室タブが表示されている場合、回路の色を更新
  if (document.getElementById('otp-lab-tab')?.classList.contains('active')) {
    if (typeof updateGateConstruction === 'function') {
      updateGateConstruction();
    }
  }
}

// ダークモードを無効にする
function disableDarkMode() {
  isDarkMode = false;
  document.body.classList.remove('dark-mode');
  updateToggleButton();
  localStorage.setItem(DARK_MODE_KEY, 'false');
  
  // OTP実験室タブが表示されている場合、回路の色を更新
  if (document.getElementById('otp-lab-tab')?.classList.contains('active')) {
    if (typeof updateGateConstruction === 'function') {
      updateGateConstruction();
    }
  }
}

// トグルボタンの表示を更新
function updateToggleButton() {
  const toggleButton = document.getElementById('darkModeToggle');
  if (toggleButton) {
    toggleButton.textContent = isDarkMode ? '☀️' : '🌙';
    toggleButton.title = isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え';
  }
}

// ダークモードを切り替える
function toggleDarkMode() {
  if (isDarkMode) {
    disableDarkMode();
    console.log('🌙 → ☀️ ライトモードに切り替え');
  } else {
    enableDarkMode();
    console.log('☀️ → 🌙 ダークモードに切り替え');
  }
}

// システムの色設定変更を監視
function setupSystemThemeListener() {
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      // ユーザーが手動で設定を変更していない場合のみシステム設定に従う
      const hasUserPreference = localStorage.getItem(DARK_MODE_KEY) !== null;
      
      if (!hasUserPreference) {
        if (e.matches) {
          enableDarkMode();
          console.log('💻 システム設定変更: ダークモードに自動切り替え');
        } else {
          disableDarkMode();
          console.log('💻 システム設定変更: ライトモードに自動切り替え');
        }
      }
    });
  }
}

// ダークモード関連のイベントハンドラを設定
function setupDarkModeHandlers() {
  const toggleButton = document.getElementById('darkModeToggle');
  
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleDarkMode);
    
    // キーボードショートカット（Ctrl/Cmd + D）
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
      }
    });
  }
  
  // システムテーマ変更の監視を開始
  setupSystemThemeListener();
  
  console.log('🌙 ダークモード機能が有効になりました（Ctrl/Cmd + D で切り替え可能）');
}