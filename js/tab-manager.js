// タブ切り替え機能

// タブ切り替え機能
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach((button, index) => {
    button.addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      const next = tabButtons[(index + (e.key === 'ArrowRight' ? 1 : -1) + tabButtons.length) % tabButtons.length];
      next.focus();
      next.click();
    });
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // すべてのタブボタンとパネルの非アクティブ化
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
        btn.tabIndex = -1;
      });
      tabPanels.forEach(panel => panel.classList.remove('active'));

      // クリックされたタブのアクティブ化
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');
      button.tabIndex = 0;
      document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
  });
}
