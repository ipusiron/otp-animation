// Apply the saved theme before the first paint; storage may be blocked.
(() => {
  let saved = null;
  try { saved = localStorage.getItem('otp-animation-dark-mode'); } catch {}
  const dark = saved === 'dark' || (saved !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark-mode', dark);
})();
