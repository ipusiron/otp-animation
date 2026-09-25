let helpReturnFocus = null;
// ヘルプモーダル機能

// ヘルプモーダルを表示
function showHelpModal() {
  const modal = document.getElementById('helpModal');
  if (modal) {
    helpReturnFocus = document.activeElement;
    modal.classList.add('show');
    document.getElementById('closeHelp').focus();
    document.body.classList.add('modal-open'); // 背景のスクロールを無効化

  }
}

// ヘルプモーダルを非表示
function hideHelpModal() {
  const modal = document.getElementById('helpModal');
  if (modal) {
    modal.classList.remove('show');
    if (helpReturnFocus) helpReturnFocus.focus();
    document.body.classList.remove('modal-open'); // 背景のスクロールを復元

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
    
    if (e.key === 'Tab' && modal.classList.contains('show')) {
      const items = [...modal.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')]
        .filter(item => !item.disabled && item.getClientRects().length);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    // Escキーでモーダルを閉じる
    if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
      e.preventDefault();
      hideHelpModal();
    }
    
    // ?キーまたはF1キーでヘルプを表示
    const editing = e.target.closest('input, textarea, select, [contenteditable]');
    if ((e.key === 'F1' || (e.key === '?' && !editing)) && (!modal || !modal.classList.contains('show'))) {
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

}
