// ヘルプモーダル機能

// ヘルプモーダルを表示
function showHelpModal() {
  const modal = document.getElementById('helpModal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // 背景のスクロールを無効化
    console.log('❓ ヘルプモーダルを開きました');
  }
}

// ヘルプモーダルを非表示
function hideHelpModal() {
  const modal = document.getElementById('helpModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = ''; // 背景のスクロールを復元
    console.log('❓ ヘルプモーダルを閉じました');
  }
}

// ヘルプモーダルの表示切り替え
function toggleHelpModal() {
  const modal = document.getElementById('helpModal');
  if (modal && modal.classList.contains('show')) {
    hideHelpModal();
  } else {
    showHelpModal();
  }
}

// ヘルプモーダル関連のイベントハンドラを設定
function setupHelpModalHandlers() {
  // ヘルプボタンのクリックイベント
  const helpButton = document.getElementById('helpButton');
  if (helpButton) {
    helpButton.addEventListener('click', showHelpModal);
  }

  // 閉じるボタンのクリックイベント
  const closeButton = document.getElementById('closeHelp');
  if (closeButton) {
    closeButton.addEventListener('click', hideHelpModal);
  }

  // モーダル背景クリックで閉じる
  const modal = document.getElementById('helpModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideHelpModal();
      }
    });
  }

  // キーボードショートカット
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('helpModal');
    
    // Escキーでモーダルを閉じる
    if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
      e.preventDefault();
      hideHelpModal();
    }
    
    // ?キーまたはF1キーでヘルプを表示
    if ((e.key === '?' || e.key === 'F1') && (!modal || !modal.classList.contains('show'))) {
      e.preventDefault();
      showHelpModal();
    }
  });

  // モーダル内のスクロール位置を記憶
  const modalBody = modal?.querySelector('.modal-body');
  if (modalBody) {
    let scrollPosition = 0;
    
    modal.addEventListener('transitionend', () => {
      if (modal.classList.contains('show')) {
        // モーダルが開いた時、前回のスクロール位置を復元
        modalBody.scrollTop = scrollPosition;
      } else {
        // モーダルが閉じる時、スクロール位置を保存
        scrollPosition = modalBody.scrollTop;
      }
    });
  }

  console.log('❓ ヘルプモーダル機能が有効になりました（? または F1 キーで表示、Esc で閉じる）');
}

// ヘルプセクションへのスムーズスクロール機能（将来の拡張用）
function scrollToHelpSection(sectionId) {
  const modal = document.getElementById('helpModal');
  const section = document.getElementById(sectionId);
  
  if (modal && section && modal.classList.contains('show')) {
    const modalBody = modal.querySelector('.modal-body');
    const sectionTop = section.offsetTop;
    
    modalBody.scrollTo({
      top: sectionTop - 20, // 少し余白を持たせる
      behavior: 'smooth'
    });
  }
}