// Decryption uses hexadecimal inputs and a single animation path.
const decryptionState = { cipher: [], key: null, completed: 0 };
const decryptPlayback = { timer: null, playing: false, speed: 300 };

function decryptionPlain() {
  return decryptionState.key ? OtpCore.xorBytes(decryptionState.cipher, decryptionState.key) : [];
}

function stopDecryption() {
  clearTimeout(decryptPlayback.timer);
  decryptPlayback.timer = null;
  decryptPlayback.playing = false;
}

function refreshDecryption() {
  const state = decryptionState;
  renderByteRow('ciphertextBitsContainer', state.cipher, 'source');
  renderByteRow('decryptKeyBitsContainer', state.key || [], 'key', null, state.completed);
  renderByteRow('decryptedBitsContainer', decryptionPlain(), 'result', null, state.completed);
  const complete = state.key && state.completed === state.cipher.length * 8;
  const decoded = OtpCore.decodeBytes(decryptionPlain());
  document.getElementById('decryptedText').textContent = complete ? decoded.text : '';
  document.getElementById('decryptedHex').textContent = complete ? OtpCore.toHex(decryptionPlain()) : '';
  document.getElementById('decodeNote').textContent = complete && !decoded.valid ? inputError('invalidUtf8') : '';
  document.getElementById('decryptProgress').textContent = `${state.completed} / ${state.cipher.length * 8}`;
  document.getElementById('decryptAnimationControls').hidden = !state.key;
  document.getElementById('startDecryption').disabled = !state.key || decryptPlayback.playing;
  document.getElementById('decryptPlayPause').textContent = decryptPlayback.playing ? '⏸ 一時停止' : '▶ 再生';
  document.getElementById('decryptStepBack').disabled = !state.completed || decryptPlayback.playing;
  document.getElementById('decryptStepForward').disabled = !state.key ||
    state.completed >= state.cipher.length * 8 || decryptPlayback.playing;
  document.getElementById('decryptComplete').disabled = !state.key || complete;
  document.getElementById('exportDecryption').disabled = !complete;
}

function updateDecryptionInputs() {
  stopDecryption();
  decryptionState.cipher = [];
  decryptionState.key = null;
  decryptionState.completed = 0;
  const error = document.getElementById('decryptErrorMessage');
  try {
    const cipher = OtpCore.parseHex(document.getElementById('ciphertext').value);
    if (cipher.length > OtpCore.MAX_BYTES) throw new Error('tooLong');
    decryptionState.cipher = cipher;
    const key = OtpCore.parseHex(document.getElementById('decryptKey').value);
    OtpCore.xorBytes(cipher, key);
    decryptionState.key = key;
    error.textContent = '';
  } catch (e) {
    error.textContent = inputError(e.message);
  }
  refreshDecryption();
}

function executeDecryptionStep() {
  if (!decryptionState.key || decryptionState.completed >= decryptionState.cipher.length * 8) return;
  decryptionState.completed++;
  refreshDecryption();
}

function playDecryption() {
  stopDecryption();
  if (!decryptionState.key) return;
  if (decryptionState.completed === decryptionState.cipher.length * 8) decryptionState.completed = 0;
  decryptPlayback.playing = true;
  function tick() {
    if (!decryptPlayback.playing) return;
    executeDecryptionStep();
    if (decryptionState.completed >= decryptionState.cipher.length * 8) {
      stopDecryption();
      refreshDecryption();
    } else {
      decryptPlayback.timer = setTimeout(tick, decryptPlayback.speed);
    }
  }
  tick();
}

function setupDecryptionControls() {
  document.getElementById('decryptPlayPause').addEventListener('click', () => {
    if (decryptPlayback.playing) { stopDecryption(); refreshDecryption(); } else playDecryption();
  });
  document.getElementById('decryptStepForward').addEventListener('click', () => { stopDecryption(); executeDecryptionStep(); });
  document.getElementById('decryptStepBack').addEventListener('click', () => {
    stopDecryption();
    decryptionState.completed = Math.max(0, decryptionState.completed - 1);
    refreshDecryption();
  });
  document.getElementById('decryptReset').addEventListener('click', () => {
    stopDecryption();
    decryptionState.completed = 0;
    refreshDecryption();
  });
  document.getElementById('decryptComplete').addEventListener('click', () => {
    stopDecryption();
    decryptionState.completed = decryptionState.cipher.length * 8;
    refreshDecryption();
  });
  document.getElementById('decryptSpeed').addEventListener('change', e => {
    decryptPlayback.speed = Number(e.target.value);
    if (decryptPlayback.playing) playDecryption();
  });
}

function setupDecryptionHandlers() {
  for (const id of ['ciphertext', 'decryptKey']) {
    document.getElementById(id).addEventListener('input', updateDecryptionInputs);
  }
  document.getElementById('copyFromEncryption').addEventListener('click', () => {
    if (!encryptionState.key) {
      const message = '先に暗号化タブで鍵を生成してください';
      document.getElementById('decryptErrorMessage').textContent = message;
      showToast(message, 'error');
      return;
    }
    document.getElementById('ciphertext').value = OtpCore.toHex(encryptionCipher());
    document.getElementById('decryptKey').value = OtpCore.toHex(encryptionState.key);
    updateDecryptionInputs();
  });
  document.getElementById('generateDecryptKey').addEventListener('click', () => {
    try {
      const cipher = OtpCore.parseHex(document.getElementById('ciphertext').value);
      if (cipher.length > OtpCore.MAX_BYTES) throw new Error('tooLong');
      document.getElementById('decryptKey').value = OtpCore.toHex(OtpCore.randomBytes(cipher.length));
      updateDecryptionInputs();
    } catch (e) {
      document.getElementById('decryptErrorMessage').textContent = inputError(e.message);
    }
  });
  document.getElementById('startDecryption').addEventListener('click', playDecryption);
}
