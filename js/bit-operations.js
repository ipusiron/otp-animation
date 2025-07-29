// ビット操作・レンダリング関連

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