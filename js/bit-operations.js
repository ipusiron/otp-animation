// ビット操作・レンダリング関連

// Group all three rows identically by UTF-8 character boundaries.
function renderByteRow(containerId, bytes, role, spans = null, completed = 0) {
  const container = document.getElementById(containerId);
  container.replaceChildren();
  const bits = OtpCore.bytesToBits(bytes);
  const groups = spans || bytes.map((_, start) => ({ start, length: 1, char: '' }));
  for (const span of groups) {
    if (span.start >= bytes.length) break;
    const character = document.createElement('div');
    character.className = 'character-group';
    const label = document.createElement('div');
    label.className = 'character-label';
    label.textContent = role === 'plain' ? span.char : '\u00a0';
    character.append(label);
    const row = document.createElement('div');
    row.className = 'character-bytes';
    for (let b = span.start; b < span.start + span.length && b < bytes.length; b++) {
      const byte = document.createElement('div');
      byte.className = 'byte-unit';
      const hex = document.createElement('div');
      hex.className = 'byte-hex';
      const output = role === 'cipher' || role === 'result';
      hex.textContent = !output || completed >= (b + 1) * 8 ? OtpCore.toHex([bytes[b]]) : '??';
      const group = document.createElement('div');
      group.className = 'bit-group';
      for (let j = 0; j < 8; j++) {
        const index = b * 8 + j;
        const bit = document.createElement('span');
        bit.dataset.index = index;
        bit.className = `bit ${role === 'result' ? 'plain' : role === 'source' ? 'cipher' : role}`;
        bit.textContent = output && index >= completed ? '?' : bits[index];
        bit.classList.toggle('placeholder', output && index >= completed);
        if (role === 'key' && index < completed) {
          bit.classList.add('ash');
          if (index === completed - 1) bit.classList.add('burn');
        }
        group.append(bit);
      }
      byte.append(hex, group);
      row.append(byte);
    }
    character.append(row);
    container.append(character);
  }
}

// Translate validation errors without retaining input text.
function inputError(reason, detail = {}) {
  if (reason === 'control') {
    const code = (detail.char || 0).toString(16).toUpperCase().padStart(4, '0');
    return i18n.t('error.control', { code });
  }
  if (reason === 'tooLong' && detail.bytes) return i18n.t('error.tooLongCount', { bytes: detail.bytes });
  const key = 'error.' + reason;
  return Object.hasOwn(i18n.ja, key) ? i18n.t(key) : reason;
}

// 各ビットを画面に描画（8ビットグループで）
function renderBits(containerId, bits, className) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  // 8ビットごとにグループ化
  for (let i = 0; i < bits.length; i += 8) {
    const group = document.createElement('div');
    group.className = 'bit-group';
    
    for (let j = 0; j < 8 && i + j < bits.length; j++) {
      const span = document.createElement('span');
      span.className = `bit ${className}`;
      span.dataset.index = i + j;
      span.textContent = bits[i + j];
      group.appendChild(span);
    }
    
    container.appendChild(group);
  }
}

// 仮の暗号ビットを描画（'?'でプレースホルダ表示）
function renderPlaceholderCipherBits(length) {
  const container = document.getElementById('cipherBitsContainer');
  container.innerHTML = '';
  
  // 8ビットごとにグループ化
  for (let i = 0; i < length; i += 8) {
    const group = document.createElement('div');
    group.className = 'bit-group';
    
    for (let j = 0; j < 8 && i + j < length; j++) {
      const span = document.createElement('span');
      span.className = 'bit placeholder';
      span.dataset.index = i + j;
      span.textContent = '?';
      group.appendChild(span);
    }
    
    container.appendChild(group);
  }
}

// 復号ビットのプレースホルダー表示
function renderPlaceholderDecryptedBits(length) {
  const container = document.getElementById('decryptedBitsContainer');
  container.innerHTML = '';
  
  // 8ビットごとにグループ化
  for (let i = 0; i < length; i += 8) {
    const group = document.createElement('div');
    group.className = 'bit-group';
    
    for (let j = 0; j < 8 && i + j < length; j++) {
      const span = document.createElement('span');
      span.className = 'bit placeholder';
      span.dataset.index = i + j;
      span.textContent = '?';
      group.appendChild(span);
    }
    
    container.appendChild(group);
  }
}
