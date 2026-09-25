// Encryption stores bytes and a completed-bit count, never a second result state.
const encryptionState = { plain: [], key: null, completed: 0 };
const encryptPlayback = { timer: null, playing: false, speed: 300 };

function encryptionCipher() {
  return encryptionState.key ? OtpCore.xorBytes(encryptionState.plain, encryptionState.key) : [];
}

function stopEncryption() {
  clearTimeout(encryptPlayback.timer);
  encryptPlayback.timer = null;
  encryptPlayback.playing = false;
}

function refreshEncryption() {
  const state = encryptionState;
  const spans = OtpCore.charSpans(document.getElementById('plaintext').value);
  renderByteRow('plaintextBitsContainer', state.plain, 'plain', spans);
  renderByteRow('keyBitsContainer', state.key || [], 'key', spans, state.completed);
  renderByteRow('cipherBitsContainer', encryptionCipher(), 'cipher', spans, state.completed);
  document.getElementById('encryptProgress').textContent = `${state.completed} / ${state.plain.length * 8}`;
  document.getElementById('encryptAnimationControls').hidden = !state.key;
  document.getElementById('startAnimation').disabled = !state.key || encryptPlayback.playing;
  document.getElementById('encryptPlayPause').textContent = encryptPlayback.playing ? i18n.t('pause') : i18n.t('play');
  document.getElementById('encryptStepBack').disabled = !state.completed || encryptPlayback.playing;
  document.getElementById('encryptStepForward').disabled = !state.key ||
    state.completed >= state.plain.length * 8 || encryptPlayback.playing;
  document.getElementById('encryptComplete').disabled = !state.key || state.completed >= state.plain.length * 8;
  document.getElementById('exportEncryption').disabled = !state.key || state.completed !== state.plain.length * 8;
}

function updatePlaintext() {
  stopEncryption();
  encryptionState.key = null;
  encryptionState.completed = 0;
  const text = document.getElementById('plaintext').value;
  const validation = OtpCore.validateText(text);
  encryptionState.plain = validation.ok ? OtpCore.encodeText(text) : [];
  i18n.assign(document.getElementById('plainCount'), 'textContent',
    i18n.t('plain.count', { chars: [...text].length, bytes: OtpCore.encodeText(text).length }));
  i18n.assign(document.getElementById('errorMessage'), 'textContent', validation.ok ? '' : inputError(validation.reason, validation));
  document.getElementById('generateKey').disabled = !validation.ok;
  refreshEncryption();
}

function setEncryptionKey(bytes) {
  if (!encryptionState.plain.length || bytes.length !== encryptionState.plain.length) throw new Error('lengthMismatch');
  stopEncryption();
  encryptionState.key = bytes.slice();
  encryptionState.completed = 0;
  refreshEncryption();
}

function executeEncryptionStep() {
  if (!encryptionState.key || encryptionState.completed >= encryptionState.plain.length * 8) return;
  encryptionState.completed++;
  refreshEncryption();
}

function playEncryption() {
  stopEncryption();
  if (!encryptionState.key) return;
  if (encryptionState.completed === encryptionState.plain.length * 8) encryptionState.completed = 0;
  encryptPlayback.playing = true;
  function tick() {
    if (!encryptPlayback.playing) return;
    executeEncryptionStep();
    if (encryptionState.completed >= encryptionState.plain.length * 8) {
      stopEncryption();
      refreshEncryption();
    } else {
      encryptPlayback.timer = setTimeout(tick, encryptPlayback.speed);
    }
  }
  tick();
}

function setupEncryptionControls() {
  document.getElementById('encryptPlayPause').addEventListener('click', () => {
    if (encryptPlayback.playing) { stopEncryption(); refreshEncryption(); } else playEncryption();
  });
  document.getElementById('encryptStepForward').addEventListener('click', () => {
    stopEncryption();
    executeEncryptionStep();
  });
  document.getElementById('encryptStepBack').addEventListener('click', () => {
    stopEncryption();
    encryptionState.completed = Math.max(0, encryptionState.completed - 1);
    refreshEncryption();
  });
  document.getElementById('encryptReset').addEventListener('click', () => {
    stopEncryption();
    encryptionState.completed = 0;
    refreshEncryption();
  });
  document.getElementById('encryptComplete').addEventListener('click', () => {
    stopEncryption();
    encryptionState.completed = encryptionState.plain.length * 8;
    refreshEncryption();
  });
  document.getElementById('encryptSpeed').addEventListener('change', e => {
    encryptPlayback.speed = Number(e.target.value);
    if (encryptPlayback.playing) playEncryption();
  });
}

function setupEncryptionHandlers() {
  document.getElementById('plaintext').addEventListener('input', updatePlaintext);
  document.getElementById('generateKey').addEventListener('click', () => {
    if (encryptionState.plain.length) setEncryptionKey(OtpCore.randomBytes(encryptionState.plain.length));
  });
  document.getElementById('startAnimation').addEventListener('click', playEncryption);
}
