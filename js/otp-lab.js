// OTP実験室の機能

// 実験1: XORゲート構成シミュレーター
let gateSimulatorState = {
  inputA: 0,
  inputB: 0
};

// XOR演算を基本ゲートで実装
function simulateXORConstruction(a, b) {
  const notA = a === 0 ? 1 : 0;
  const notB = b === 0 ? 1 : 0;
  const andLeft = a === 1 && notB === 1 ? 1 : 0;  // A ∧ ¬B
  const andRight = notA === 1 && b === 1 ? 1 : 0; // ¬A ∧ B
  const result = andLeft === 1 || andRight === 1 ? 1 : 0; // (A ∧ ¬B) ∨ (¬A ∧ B)
  
  return {
    notA,
    notB,
    andLeft,
    andRight,
    result
  };
}

// ゲート構成の結果を更新
function updateGateConstruction() {
  const a = gateSimulatorState.inputA;
  const b = gateSimulatorState.inputB;
  const simulation = simulateXORConstruction(a, b);
  
  // 表示を更新
  document.getElementById('inputADisplay').textContent = a;
  document.getElementById('inputBDisplay').textContent = b;
  document.getElementById('notADisplay').textContent = simulation.notA;
  document.getElementById('notBDisplay').textContent = simulation.notB;
  document.getElementById('andLeftDisplay').textContent = simulation.andLeft;
  document.getElementById('andRightDisplay').textContent = simulation.andRight;
  document.getElementById('finalResultDisplay').textContent = simulation.result;
  
  // SVG内の中間値も更新（色と値の動的変化）
  const notAText = document.getElementById('notA');
  const notBText = document.getElementById('notB');
  const andLeftText = document.getElementById('andLeft');
  const andRightText = document.getElementById('andRight');
  
  // ダークモードかどうかをチェック
  const isDarkMode = document.body.classList.contains('dark-mode');
  const INACTIVE_COLOR = isDarkMode ? '#ffffff' : '#333';  // ダークモードでは白色
  const ACTIVE_COLOR = '#e74c3c';
  
  if (notAText) {
    notAText.textContent = `¬A=${simulation.notA}`;
    notAText.classList.add('signal-fill');
    notAText.classList.toggle('signal-active', Boolean(simulation.notA));
  }
  if (notBText) {
    notBText.textContent = `¬B=${simulation.notB}`;
    notBText.classList.add('signal-fill');
    notBText.classList.toggle('signal-active', Boolean(simulation.notB));
  }
  if (andLeftText) {
    andLeftText.textContent = `A∧¬B=${simulation.andLeft}`;
    andLeftText.classList.add('signal-fill');
    andLeftText.classList.toggle('signal-active', Boolean(simulation.andLeft));
  }
  if (andRightText) {
    andRightText.textContent = `¬A∧B=${simulation.andRight}`;
    andRightText.classList.add('signal-fill');
    andRightText.classList.toggle('signal-active', Boolean(simulation.andRight));
  }
  
  // 電線の色を動的に変更
  updateWireColors(a, b, simulation);
  
  // 説明文を更新
  const steps = `NOT(${a})=${simulation.notA}, NOT(${b})=${simulation.notB}, ${a}∧${simulation.notB}=${simulation.andLeft}, ` +
    `${simulation.notA}∧${b}=${simulation.andRight}, ${simulation.andLeft}∨${simulation.andRight}=${simulation.result}`;
  document.getElementById('constructionExplanation').textContent =
    i18n.t('lab.calculation', { a, b, result: simulation.result, steps });

}

// 電線の色を動的に変更する関数
function updateWireColors(a, b, simulation) {
  const svg = document.querySelector('.construction-svg');
  if (!svg) return;
  
  // 全ての線を取得（SVG内のline要素）
  const lines = svg.querySelectorAll('line');
  
  // ダークモードかどうかをチェック
  const isDarkMode = document.body.classList.contains('dark-mode');
  
  // デフォルトの黒色と赤色を定義（ダークモード対応）
  const BLACK = isDarkMode ? '#ffffff' : '#333';  // ダークモードでは白色
  const RED = '#e74c3c';
  
  // 各線の色を設定（新しい配線構造に対応）
  if (lines.length >= 8) {
    // メイン入力線（A, B）
    lines[0].classList.add('signal-stroke');
    lines[0].classList.toggle('signal-active', Boolean(a)); // A入力線
    lines[1].classList.add('signal-stroke');
    lines[1].classList.toggle('signal-active', Boolean(b)); // B入力線
    
    // A入力の直接分岐
    lines[2].classList.add('signal-stroke');
    lines[2].classList.toggle('signal-active', Boolean(a)); // A → 上ANDゲート
    lines[3].classList.add('signal-stroke');
    lines[3].classList.toggle('signal-active', Boolean(a)); // A → ¬A NOTゲート
    
    // B入力の直接分岐
    lines[4].classList.add('signal-stroke');
    lines[4].classList.toggle('signal-active', Boolean(b)); // B → 下ANDゲート
    lines[5].classList.add('signal-stroke');
    lines[5].classList.toggle('signal-active', Boolean(b)); // B → ¬B NOTゲート
    
    // NOTゲートからANDゲートへの接続
    lines[6].classList.add('signal-stroke');
    lines[6].classList.toggle('signal-active', Boolean(simulation.notB)); // ¬B → 上ANDゲート
    lines[7].classList.add('signal-stroke');
    lines[7].classList.toggle('signal-active', Boolean(simulation.notA)); // ¬A → 下ANDゲート
    
    // ANDゲートからORゲートへ
    if (lines.length >= 10) {
      lines[8].classList.add('signal-stroke');
    lines[8].classList.toggle('signal-active', Boolean(simulation.andLeft)); // 上ANDゲート → ORゲート
      lines[9].classList.add('signal-stroke');
    lines[9].classList.toggle('signal-active', Boolean(simulation.andRight)); // 下ANDゲート → ORゲート
    }
    
    // 出力線
    if (lines.length >= 11) {
      lines[10].classList.add('signal-stroke');
    lines[10].classList.toggle('signal-active', Boolean(simulation.result)); // ORゲート → 出力
    }
  }
  
  // 分岐点の円の色も変更
  const circles = svg.querySelectorAll('circle[r="4"]');
  if (circles.length >= 2) {
    circles[0].classList.add('signal-fill');
    circles[0].classList.toggle('signal-active', Boolean(a)); // A入力の分岐点
    circles[1].classList.add('signal-fill');
    circles[1].classList.toggle('signal-active', Boolean(b)); // B入力の分岐点
  }
  
  // 入力ラベルの色も変更
  const labelA = svg.querySelector('text[x="15"][y="75"]');
  const labelB = svg.querySelector('text[x="15"][y="255"]');
  const labelOutput = svg.querySelector('text[x="490"]');
  
  if (labelA) { labelA.classList.add('signal-fill'); labelA.classList.toggle('signal-active', Boolean(a)); }
  if (labelB) { labelB.classList.add('signal-fill'); labelB.classList.toggle('signal-active', Boolean(b)); }
  if (labelOutput) { labelOutput.classList.add('signal-fill'); labelOutput.classList.toggle('signal-active', Boolean(simulation.result)); }
}

// 実験2: 鍵再利用脆弱性デモ
let keyReuseState = {
  plaintext1: [],
  plaintext2: [],
  sharedKey: null,
  cipher1: null,
  cipher2: null
};

// 鍵再利用脆弱性を実証
function demonstrateKeyReuse() {
  const p1 = document.getElementById('plaintext1').value;
  const p2 = document.getElementById('plaintext2').value;
  
  if (!p1 || !p2) {
    showToast(i18n.t('lab.both'));
    return;
  }
  
  // 文字数を合わせる（短い方に合わせる）
  const minLength = Math.min(p1.length, p2.length);
  i18n.assign(document.getElementById('reuseLengthNote'), 'textContent',
    p1.length !== p2.length ? i18n.t('lab.short', { n: minLength }) : '');
  keyReuseState.plaintext1 = OtpCore.encodeText(p1.substring(0, minLength));
  keyReuseState.plaintext2 = OtpCore.encodeText(p2.substring(0, minLength));
  
  // バリデーション
  const { bytes: p1Bits, invalidChar: p1Invalid } = validateLabText(p1.substring(0, minLength));
  const { bytes: p2Bits, invalidChar: p2Invalid } = validateLabText(p2.substring(0, minLength));
  
  if (p1Invalid || p2Invalid) {
    showToast(i18n.t('lab.invalid', { char: p1Invalid || p2Invalid }));
    return;
  }
  
  // 同じ鍵を生成
  keyReuseState.sharedKey = OtpCore.randomBytes(p1Bits.length);
  
  // 暗号化
  keyReuseState.cipher1 = OtpCore.xorBytes(p1Bits, keyReuseState.sharedKey);
  keyReuseState.cipher2 = OtpCore.xorBytes(p2Bits, keyReuseState.sharedKey);
  
  // 攻撃者による暗号文のXOR（鍵が相殺される）
  const ciphertextXor = OtpCore.xorBytes(keyReuseState.cipher1, keyReuseState.cipher2);
  const plaintextXor = OtpCore.xorBytes(p1Bits, p2Bits);
  
  // 結果表示
  displayKeyReuseResults(p1Bits, p2Bits, keyReuseState.sharedKey, 
                        keyReuseState.cipher1, keyReuseState.cipher2, 
                        ciphertextXor, plaintextXor);
  
  document.getElementById('reuseResults').hidden = false;

}

// 鍵再利用結果を表示
function displayKeyReuseResults(p1Bits, p2Bits, key, c1Bits, c2Bits, cXor, pXor) {
  // ビット表示用のフォーマット
  const formatBits = bytes => formatBitsForClipboard(OtpCore.bytesToBits(bytes));
  
  document.getElementById('p1bits').textContent = formatBits(p1Bits);
  document.getElementById('keybits').textContent = formatBits(key);
  document.getElementById('c1bits').textContent = formatBits(c1Bits);
  
  document.getElementById('p2bits').textContent = formatBits(p2Bits);
  document.getElementById('keybits2').textContent = formatBits(key);
  document.getElementById('c2bits').textContent = formatBits(c2Bits);
  
  document.getElementById('ciphertextXor').textContent = formatBits(cXor);
  document.getElementById('plaintextXor').textContent = formatBits(pXor);
  
  // 結果の一致確認
  const isMatch = JSON.stringify(cXor) === JSON.stringify(pXor);
  i18n.assign(document.getElementById('matchResult'), 'textContent',
    isMatch ? i18n.t('lab.match') : i18n.t('lab.mismatch'));
  document.getElementById('matchResult').className = isMatch ? 'result-match' : 'result-error';
}

// 実験3: 断片解析デモ
let fragmentAnalysisState = {
  targetPlaintext: [],
  targetKey: null,
  targetCipher: null
};

// 対象平文を暗号化
function encryptTargetText() {
  const plaintext = document.getElementById('targetPlaintext').value;
  
  if (!plaintext) {
    showToast(i18n.t('lab.target'));
    return;
  }
  
  const { bytes, invalidChar } = validateLabText(plaintext);
  if (invalidChar) {
    showToast(i18n.t('lab.invalid', { char: invalidChar }));
    return;
  }
  
  fragmentAnalysisState.targetPlaintext = OtpCore.encodeText(plaintext);
  fragmentAnalysisState.targetKey = OtpCore.randomBytes(bytes.length);
  fragmentAnalysisState.targetCipher = OtpCore.xorBytes(bytes, fragmentAnalysisState.targetKey);
  
  // 結果表示
  const formatBits = bytes => formatBitsForClipboard(OtpCore.bytesToBits(bytes));
  
  document.getElementById('targetPlaintextBits').textContent = formatBits(bytes);
  document.getElementById('targetKeyBits').textContent = formatBits(fragmentAnalysisState.targetKey);
  document.getElementById('targetCipherBits').textContent = formatBits(fragmentAnalysisState.targetCipher);
  
  document.getElementById('encryptedDisplay').hidden = false;
  document.getElementById('fragmentInput').hidden = false;

}

// 断片から鍵を解析
function analyzeFragment() {
  if (!fragmentAnalysisState.targetCipher) {
    showToast(i18n.t('lab.first'));
    return;
  }
  
  const knownFragment = document.getElementById('knownFragment').value;
  const positionText = document.getElementById('fragmentPosition').value;
  if (!positionText.trim() || !Number.isInteger(Number(positionText))) {
    showToast(i18n.t('lab.position'), 'error');
    return;
  }
  const position = Number(positionText) - 1;
  
  if (!knownFragment) {
    showToast(i18n.t('lab.fragment'));
    return;
  }
  
  if (position < 0 || position + knownFragment.length > fragmentAnalysisState.targetPlaintext.length) {
    showToast(i18n.t('lab.range'));
    return;
  }
  
  const { bytes: fragmentBits, invalidChar } = validateLabText(knownFragment);
  if (invalidChar) {
    showToast(i18n.t('lab.invalid', { char: invalidChar }));
    return;
  }
  
  // 対応する暗号文ビットを取得
  const startBit = position;
  const endBit = startBit + fragmentBits.length;
  const correspondingCipherBits = fragmentAnalysisState.targetCipher.slice(startBit, endBit);
  
  // 鍵を推測 (K = P ⊕ C)
  const deducedKeyBits = OtpCore.xorBytes(fragmentBits, correspondingCipherBits);
  
  // 実際の鍵と比較して検証
  const actualKeyBits = fragmentAnalysisState.targetKey.slice(startBit, endBit);
  const isCorrect = JSON.stringify(deducedKeyBits) === JSON.stringify(actualKeyBits);
  
  // 結果表示
  displayFragmentAnalysis(fragmentBits, correspondingCipherBits, deducedKeyBits, isCorrect);
  
  document.getElementById('analysisResults').hidden = false;

}

// 断片解析結果を表示
function displayFragmentAnalysis(fragmentBits, cipherBits, deducedKey, isCorrect) {
  const formatBits = bytes => formatBitsForClipboard(OtpCore.bytesToBits(bytes));
  
  document.getElementById('knownPlaintextBits').textContent = formatBits(fragmentBits);
  document.getElementById('correspondingCipherBits').textContent = formatBits(cipherBits);
  document.getElementById('deducedKeyBits').textContent = formatBits(deducedKey);
  
  i18n.assign(document.getElementById('verificationResult'), 'textContent',
    isCorrect ? i18n.t('lab.verified') : i18n.t('lab.unverified'));
  document.getElementById('verificationResult').className = isCorrect ? 'result-match' : 'result-error';
}

// アコーディオンの状態管理
let accordionState = {
  1: false, // すべての実験は初期状態で閉じている
  2: false,
  3: false
};

// 表のホバーイベントを設定
function setupTableHoverEffects() {
  // 表の各セルとSVGラベルの対応関係を定義
  const cellMappings = [
    { cellId: 'inputADisplay', svgSelectors: ['text[x="15"][y="75"]'] },      // A入力
    { cellId: 'inputBDisplay', svgSelectors: ['text[x="15"][y="255"]'] },     // B入力
    { cellId: 'notADisplay', svgSelectors: ['#notA'] },                       // ¬A
    { cellId: 'notBDisplay', svgSelectors: ['#notB'] },                       // ¬B
    { cellId: 'andLeftDisplay', svgSelectors: ['#andLeft'] },                 // A∧¬B
    { cellId: 'andRightDisplay', svgSelectors: ['#andRight'] },               // ¬A∧B
    { cellId: 'finalResultDisplay', svgSelectors: ['text[x="490"]'] }         // A⊕B出力
  ];
  
  const svg = document.querySelector('.construction-svg');
  if (!svg) return;
  
  cellMappings.forEach(mapping => {
    const cell = document.getElementById(mapping.cellId);
    if (!cell) return;
    
    // マウスが入った時
    cell.addEventListener('mouseenter', () => {
      mapping.svgSelectors.forEach(selector => {
        const svgElement = svg.querySelector(selector);
        if (svgElement) {
          highlightSVGElement(svgElement);
        }
      });
    });
    
    // マウスが出た時
    cell.addEventListener('mouseleave', () => {
      mapping.svgSelectors.forEach(selector => {
        const svgElement = svg.querySelector(selector);
        if (svgElement) {
          unhighlightSVGElement(svgElement);
        }
      });
    });
  });

}

// SVG要素をハイライト
function highlightSVGElement(element) {
  element.classList.add('svg-highlight');
}

function unhighlightSVGElement(element) {
  element.classList.remove('svg-highlight');
}

// アコーディオンの切り替え
function toggleAccordion(experimentNumber) {
  const header = document.querySelector(`.accordion-header[data-experiment="${experimentNumber}"]`);
  const content = document.getElementById(`experiment${experimentNumber}-content`);
  
  if (!header || !content) return;
  
  // 状態を切り替え
  accordionState[experimentNumber] = !accordionState[experimentNumber];
  header.setAttribute('aria-expanded', String(accordionState[experimentNumber]));
  
  if (accordionState[experimentNumber]) {
    // 開く
    header.classList.remove('collapsed');
    content.classList.remove('collapsed');
  } else {
    // 閉じる
    header.classList.add('collapsed');
    content.classList.add('collapsed');
  }

}

// すべてのアコーディオンを設定
function setupAccordion() {
  for (let i = 1; i <= 6; i++) {
    const header = document.querySelector(`.accordion-header[data-experiment="${i}"]`);
    if (header) {
      header.setAttribute('role', 'button');
      header.tabIndex = 0;
      header.setAttribute('aria-expanded', 'false');
      header.setAttribute('aria-controls', `experiment${i}-content`);
      header.addEventListener('click', () => toggleAccordion(i));
      header.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAccordion(i); }
      });
      
      // 初期状態を設定（すべての実験が折りたたまれた状態）
      if (!accordionState[i]) {
        header.classList.add('collapsed');
        const content = document.getElementById(`experiment${i}-content`);
        if (content) {
          content.classList.add('collapsed');
        }
      }
    }
  }

}

// OTP実験室の初期化
function setupOTPLabHandlers() {
  // アコーディオン機能を設定
  setupAccordion();
  setupCribExperiment();
  setupAdditionalExperiments();
  
  // 実験1: ゲート構成シミュレーター
  const gateInputA = document.getElementById('gateInputA');
  const gateInputB = document.getElementById('gateInputB');
  
  if (gateInputA && gateInputB) {
    gateInputA.addEventListener('change', (e) => {
      gateSimulatorState.inputA = parseInt(e.target.value);
      updateGateConstruction();
    });
    
    gateInputB.addEventListener('change', (e) => {
      gateSimulatorState.inputB = parseInt(e.target.value);
      updateGateConstruction();
    });
    
    // 初期状態を設定
    updateGateConstruction();
  }
  
  // 表のホバーイベントを設定
  setupTableHoverEffects();
  
  // 実験2: 鍵再利用デモ
  const demonstrateButton = document.getElementById('demonstrateReuse');
  if (demonstrateButton) {
    demonstrateButton.addEventListener('click', demonstrateKeyReuse);
  }
  
  // 実験3: 断片解析デモ
  const encryptButton = document.getElementById('encryptTarget');
  const analyzeButton = document.getElementById('analyzeFragment');
  
  if (encryptButton) {
    encryptButton.addEventListener('click', encryptTargetText);
  }
  
  if (analyzeButton) {
    analyzeButton.addEventListener('click', analyzeFragment);
  }
  
  // 入力フィールドの最大長制限
  const plaintext1 = document.getElementById('plaintext1');
  const plaintext2 = document.getElementById('plaintext2');
  const targetPlaintext = document.getElementById('targetPlaintext');
  const knownFragment = document.getElementById('knownFragment');
  
  if (plaintext1) plaintext1.addEventListener('input', validateASCIIInput);
  if (plaintext2) plaintext2.addEventListener('input', validateASCIIInput);
  if (targetPlaintext) targetPlaintext.addEventListener('input', validateASCIIInput);
  if (knownFragment) knownFragment.addEventListener('input', validateASCIIInput);

}

// ASCII入力の検証
function validateASCIIInput(event) {
  const input = event.target;
  const { bytes, invalidChar } = validateLabText(input.value);
  
  if (invalidChar) {
    input.classList.add('invalid-input');
    i18n.assign(input, 'title', i18n.t('lab.invalid', { char: invalidChar }));
  } else {
    input.classList.remove('invalid-input');
    i18n.assign(input, 'title', '');
  }
}

// ASCII-only experiments use the byte core; encryption supports full UTF-8.
function validateLabText(text) {
  const invalidChar = [...text].find(ch => {
    const bytes = OtpCore.encodeText(ch);
    return bytes.length !== 1 || bytes[0] < 0x20 || bytes[0] > 0x7e;
  }) || null;
  return { bytes: invalidChar ? [] : OtpCore.encodeText(text), invalidChar };
}

const cribState = { x: null, placements: [], candidates: [], searched: '', sample: true, error: '' };
const labElement = id => document.getElementById(id);

function labASCII(value, maximum) {
  if (!value.length || value.length > maximum || validateLabText(value).invalidChar) {
    throw new Error('advanced.ascii');
  }
  return OtpCore.encodeText(value);
}

function resetCrib() {
  Object.assign(cribState, { x: null, placements: [], candidates: [], searched: '', error: '' });
  for (const id of ['cribC1', 'cribC2', 'cribX', 'cribLength']) labElement(id).textContent = '';
  renderCrib();
}

function encryptCrib() {
  resetCrib();
  try {
    cribState.sample = !labElement('cribCustom').checked;
    const p1 = labASCII(cribState.sample ? OtpCore.CRIB_SAMPLE.p1 : labElement('cribPlain1').value, 64);
    const p2 = labASCII(cribState.sample ? OtpCore.CRIB_SAMPLE.p2 : labElement('cribPlain2').value, 64);
    const length = Math.min(p1.length, p2.length);
    const key = OtpCore.randomBytes(length);
    const c1 = OtpCore.xorBytes(p1.slice(0, length), key);
    const c2 = OtpCore.xorBytes(p2.slice(0, length), key);
    cribState.x = OtpCore.xorBytes(c1, c2);
    for (const [id, bytes] of [['cribC1', c1], ['cribC2', c2], ['cribX', cribState.x]]) {
      labElement(id).textContent = OtpCore.toHex(bytes);
    }
    if (p1.length !== p2.length) {
      i18n.assign(labElement('cribLength'), 'textContent', i18n.t('crib.shorter', { n: length }));
    }
  } catch (error) { cribState.error = error.message; }
  renderCrib();
}

function searchCrib() {
  cribState.error = '';
  cribState.candidates = [];
  try {
    const crib = labElement('cribInput').value;
    labASCII(crib, 20);
    cribState.searched = crib;
    cribState.candidates = OtpCore.cribDrag(cribState.x, crib);
  } catch (error) { cribState.error = error.message; }
  renderCrib();
}

function renderCrib() {
  labElement('cribSearch').disabled = !cribState.x;
  labElement('cribUndo').disabled = !cribState.placements.length;
  labElement('cribClear').disabled = !cribState.placements.length;
  labElement('cribError').textContent = cribState.error ? i18n.t(cribState.error) : '';
  const body = labElement('cribRows');
  body.replaceChildren();
  for (const candidate of cribState.candidates) {
    if (labElement('cribReadable').checked && !candidate.readable) continue;
    const row = document.createElement('tr');
    row.dataset.offset = candidate.offset;
    for (const text of [candidate.offset + 1, candidate.text.replaceAll(' ', '␣'), candidate.readable ? '✓' : '—']) {
      const cell = document.createElement('td');
      cell.textContent = text;
      row.append(cell);
    }
    const actions = document.createElement('td');
    for (const into of [1, 2]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.into = into;
      button.textContent = i18n.t('crib.place', { n: into });
      button.addEventListener('click', () => {
        cribState.placements.push({ offset: candidate.offset, crib: cribState.searched, into });
        renderCribAssembly();
      });
      actions.append(button);
    }
    row.append(actions);
    body.append(row);
  }
  renderCribAssembly();
}

function renderCribAssembly() {
  const result = cribState.x ? OtpCore.assemble(cribState.x, cribState.placements) : null;
  labElement('cribUndo').disabled = !cribState.placements.length;
  labElement('cribClear').disabled = !cribState.placements.length;
  for (const [id, field] of [['cribAssembly1', 'p1'], ['cribAssembly2', 'p2']]) {
    const line = labElement(id);
    line.replaceChildren();
    if (result) [...result[field]].forEach((character, index) => {
      const span = document.createElement('span');
      span.textContent = character;
      if (result.conflict.includes(index)) span.className = 'lab-conflict';
      line.append(span);
    });
  }
  labElement('cribKnown').textContent = result ? i18n.t('crib.known', { n: result.known, total: cribState.x.length }) : '';
  labElement('cribConflict').textContent = result?.conflict.length ? i18n.t('crib.conflict') : '';
  const complete = result && cribState.sample && result.p1 === OtpCore.CRIB_SAMPLE.p1 && result.p2 === OtpCore.CRIB_SAMPLE.p2;
  labElement('cribComplete').textContent = complete ? i18n.t('crib.complete') : '';
}

function setupCribExperiment() {
  labElement('cribEncrypt').addEventListener('click', encryptCrib);
  labElement('cribSearch').addEventListener('click', searchCrib);
  labElement('cribReadable').addEventListener('change', renderCrib);
  labElement('cribUndo').addEventListener('click', () => { cribState.placements.pop(); renderCribAssembly(); });
  labElement('cribClear').addEventListener('click', () => { cribState.placements = []; renderCribAssembly(); });
  labElement('cribCustom').addEventListener('change', () => {
    labElement('cribCustomInputs').hidden = !labElement('cribCustom').checked;
    labElement('cribAnswers').hidden = labElement('cribCustom').checked;
    resetCrib();
  });
  for (const id of ['cribPlain1', 'cribPlain2']) labElement(id).addEventListener('input', resetCrib);
  labElement('cribAnswer1').textContent = OtpCore.CRIB_SAMPLE.p1;
  labElement('cribAnswer2').textContent = OtpCore.CRIB_SAMPLE.p2;
  renderCrib();
}

const secrecyState = { cipher: null, key: null, alternateKey: null, decoded: '', error: '', parameters: {} };
const tamperState = { cipher: null, key: null, changed: null, decoded: '', error: '' };

function renderAdditionalExperiments() {
  renderCrib();
  labElement('secrecyCipher').textContent = secrecyState.cipher ? OtpCore.toHex(secrecyState.cipher) : '';
  labElement('secrecyKey').textContent = secrecyState.alternateKey ? OtpCore.toHex(secrecyState.alternateKey) : '';
  labElement('secrecyDecoded').textContent = secrecyState.decoded;
  labElement('secrecyError').textContent = secrecyState.error ? i18n.t(secrecyState.error, secrecyState.parameters) : '';
  labElement('tamperCipher').textContent = tamperState.cipher ? OtpCore.toHex(tamperState.cipher) : '';
  labElement('tamperKey').textContent = tamperState.key ? OtpCore.toHex(tamperState.key) : '';
  labElement('tamperChanged').textContent = tamperState.changed ? OtpCore.toHex(tamperState.changed) : '';
  labElement('tamperDecoded').textContent = tamperState.decoded;
  labElement('tamperError').textContent = tamperState.error ? i18n.t(tamperState.error) : '';
  labElement('tamperFlip').disabled = !tamperState.cipher;
  const deltaElement = labElement('tamperDelta');
  deltaElement.replaceChildren();
  if (tamperState.changed) {
    const delta = OtpCore.xorBytes(tamperState.cipher, tamperState.changed);
    delta.forEach((byte, index) => {
      const span = document.createElement('span');
      span.textContent = OtpCore.toHex([byte]);
      if (byte) {
        span.className = 'lab-changed';
        span.title = i18n.t('tamper.changedByte', { n: index + 1 });
      }
      deltaElement.append(span, document.createTextNode(index < delta.length - 1 ? ' ' : ''));
    });
  }
}

function resetSecrecy() {
  Object.assign(secrecyState, { cipher: null, key: null, alternateKey: null, decoded: '', error: '', parameters: {} });
  renderAdditionalExperiments();
}

function deriveAlternateKey() {
  Object.assign(secrecyState, { alternateKey: null, decoded: '', error: '', parameters: {} });
  if (secrecyState.cipher) {
    const alternate = labElement('secrecyAlternate').value;
    const bytes = OtpCore.encodeText(alternate);
    if (bytes.length !== secrecyState.cipher.length) {
      secrecyState.error = 'secrecy.length';
      secrecyState.parameters = { n: secrecyState.cipher.length, m: bytes.length };
    } else {
      const validation = OtpCore.validateText(alternate);
      if (!validation.ok) secrecyState.error = 'advanced.utf8';
      else {
        secrecyState.alternateKey = OtpCore.forgeKey(secrecyState.cipher, alternate);
        secrecyState.decoded = OtpCore.decodeBytes(OtpCore.xorBytes(secrecyState.cipher, secrecyState.alternateKey)).text;
      }
    }
  }
  renderAdditionalExperiments();
}

function encryptSecrecy() {
  resetSecrecy();
  const text = labElement('secrecyPlain').value;
  if (!OtpCore.validateText(text).ok) {
    secrecyState.error = 'advanced.utf8';
    renderAdditionalExperiments();
    return;
  }
  const bytes = OtpCore.encodeText(text);
  secrecyState.key = OtpCore.randomBytes(bytes.length);
  secrecyState.cipher = OtpCore.xorBytes(bytes, secrecyState.key);
  deriveAlternateKey();
}

function resetTamper() {
  Object.assign(tamperState, { cipher: null, key: null, changed: null, decoded: '', error: '' });
  labElement('tamperKeyDetails').open = false;
  renderAdditionalExperiments();
}

function encryptTamper() {
  resetTamper();
  try {
    const bytes = labASCII(labElement('tamperPlain').value, 64);
    tamperState.key = OtpCore.randomBytes(bytes.length);
    tamperState.cipher = OtpCore.xorBytes(bytes, tamperState.key);
  } catch (error) { tamperState.error = error.message; }
  renderAdditionalExperiments();
}

function flipCiphertext() {
  Object.assign(tamperState, { changed: null, decoded: '', error: '' });
  try {
    const known = labElement('tamperKnown').value, target = labElement('tamperTarget').value;
    labASCII(known, 64);
    labASCII(target, 64);
    const position = Number(labElement('tamperPosition').value);
    if (!Number.isInteger(position) || position < 1) throw new Error('outOfRange');
    tamperState.changed = OtpCore.flip(tamperState.cipher, position - 1, known, target);
    tamperState.decoded = OtpCore.decodeBytes(OtpCore.xorBytes(tamperState.changed, tamperState.key)).text;
  } catch (error) {
    tamperState.error = error.message.startsWith('advanced.') ? error.message : 'tamper.' + error.message;
  }
  renderAdditionalExperiments();
}

function setupAdditionalExperiments() {
  labElement('secrecyEncrypt').addEventListener('click', encryptSecrecy);
  labElement('secrecyPlain').addEventListener('input', resetSecrecy);
  labElement('secrecyAlternate').addEventListener('input', deriveAlternateKey);
  labElement('secrecyJapanese').addEventListener('click', () => {
    // UTF-8 input example, not a translatable UI label.
    labElement('secrecyAlternate').value = String.fromCodePoint(0x64a4, 0x9000, 0x305b, 0x3088, 0x21, 0x21);
    deriveAlternateKey();
  });
  labElement('tamperEncrypt').addEventListener('click', encryptTamper);
  labElement('tamperPlain').addEventListener('input', resetTamper);
  labElement('tamperFlip').addEventListener('click', flipCiphertext);
  for (const id of ['tamperKnown', 'tamperTarget', 'tamperPosition']) {
    labElement(id).addEventListener('input', () => {
      Object.assign(tamperState, { changed: null, decoded: '', error: '' });
      renderAdditionalExperiments();
    });
  }
  renderAdditionalExperiments();
}
