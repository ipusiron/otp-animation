// ダークモード機能

// ダークモード状態を管理
let isDarkMode = false;

// ローカルストレージのキー
const DARK_MODE_KEY = 'otp-animation-dark-mode';

// ダークモードの初期化
function initializeDarkMode() {
  // ローカルストレージから設定を読み込み
  let savedMode = null;
  try { savedMode = localStorage.getItem(DARK_MODE_KEY); } catch {}
  
  if (savedMode === 'dark') {
    enableDarkMode();
  } else if (savedMode === 'light') {
    disableDarkMode();
  } else {
    // 初回訪問時はシステム設定に従う
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
  }

}

// ダークモードを有効にする
function enableDarkMode() {
  isDarkMode = true;
  document.documentElement.classList.add('dark-mode');
  document.body.classList.add('dark-mode');
  updateToggleButton();
  try { localStorage.setItem(DARK_MODE_KEY, 'dark'); } catch {}
  
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
  document.documentElement.classList.remove('dark-mode');
  document.body.classList.remove('dark-mode');
  updateToggleButton();
  try { localStorage.setItem(DARK_MODE_KEY, 'light'); } catch {}
  
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
    toggleButton.title = isDarkMode ? i18n.t('theme.light') : i18n.t('theme.dark');
    toggleButton.setAttribute('aria-label', toggleButton.title);
  }
}

// ダークモードを切り替える
function toggleDarkMode() {
  if (isDarkMode) {
    disableDarkMode();

  } else {
    enableDarkMode();

  }
}

// システムの色設定変更を監視
function setupSystemThemeListener() {
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      // ユーザーが手動で設定を変更していない場合のみシステム設定に従う
      let hasUserPreference = false;
      try { hasUserPreference = ['light', 'dark'].includes(localStorage.getItem(DARK_MODE_KEY)); } catch {}
      
      if (!hasUserPreference) {
        if (e.matches) {
          enableDarkMode();

        } else {
          disableDarkMode();

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
    
  }
  
  // システムテーマ変更の監視を開始
  setupSystemThemeListener();

}
