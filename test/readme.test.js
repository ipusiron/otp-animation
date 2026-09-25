'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../js/otp-core.js');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const docs = ['README.md', 'README.en.md'];
const headings = [
  ['🌐 デモページ', '🌐 Demo'], ['📸 スクリーンショット', '📸 Screenshots'],
  ['✨ 機能', '✨ Features'], ['📖 使い方', '📖 Usage'],
  ['🔐 ワンタイムパッドとは', '🔐 What Is the One-Time Pad'],
  ['🔬 仕様と既知解答', '🔬 Specification and Known Answers'],
  ['🔒 セキュリティ', '🔒 Security'], ['📚 参考', '📚 References'],
  ['🧪 テスト', '🧪 Tests'], ['📁 ディレクトリー構造', '📁 Directory Structure'],
  ['💻 動作環境', '💻 Requirements'], ['📄 ライセンス', '📄 License'],
  ['🛠️ このツールについて', '🛠️ About This Tool']
];

for (const [language, name] of docs.entries()) {
  test(`${name}: six known answers match the core in every cell`, () => {
    const section = read(name).split(/^## 🔬.*$/m)[1].split(/^## /m)[0].split(/^### /m)[0];
    const rows = section.split('\n').filter(line => line.startsWith('| ')).slice(1);
    assert.equal(rows.length, 6);
    const expectedTexts = ['HELLO', 'A', 'あ', 'OTP暗号', 'Hi!?', '😀'];
    rows.forEach((line, index) => {
      const cells = line.split('|').slice(1, -1).map(value => value.trim());
      const bytes = core.encodeText(expectedTexts[index]);
      const key = core.randomBytes(bytes.length, a => a.forEach((_, i) => { a[i] = (i * 73 + 41) & 255; }));
      assert.deepEqual(cells, [expectedTexts[index], core.toHex(bytes), String(bytes.length),
        core.toHex(key), core.toHex(core.xorBytes(bytes, key))]);
    });
  });

  test(`${name}: thirteen corresponding sections`, () => {
    assert.deepEqual([...read(name).matchAll(/^## (.+)$/gm)].map(m => m[1]), headings.map(row => row[language]));
  });

  test(`${name}: file tree exactly matches repository files`, () => {
    const block = read(name).split(/^## 📁.*$/m)[1].match(/```\n([\s\S]*?)```/)[1];
    const lines = block.trimEnd().split('\n');
    const listed = [];
    const stack = [];
    for (const [i, line] of lines.entries()) {
      assert.match(line, /\s+# \S/);
      if (!i) continue;
      const text = line.split('#')[0].trimEnd();
      const marker = text.search(/[├└]/);
      assert.ok(marker >= 0, line);
      const depth = marker / 4;
      const entry = text.slice(marker + 4);
      stack.length = depth;
      if (entry.endsWith('/')) stack.push(entry.slice(0, -1));
      else listed.push([...stack, entry].join('/'));
    }
    function walk(dir = '') {
      return fs.readdirSync(path.join(root, dir), { withFileTypes: true })
        .filter(e => !['.git', '.claude'].includes(e.name))
        .flatMap(e => e.isDirectory() ? walk(`${dir}${e.name}/`) : [`${dir}${e.name}`]);
    }
    assert.deepEqual(listed.sort(), walk().sort());
    const hashColumns = lines.map(line => line.indexOf('#'));
    assert.equal(new Set(hashColumns).size, 1);
  });

  test(`${name}: five screenshots exist and every asset is referenced`, () => {
    const refs = [...read(name).matchAll(/!\[[^\]]*\]\((assets\/[^)]+\.png)\)/g)].map(m => m[1]);
    assert.equal(refs.length, 5);
    assert.deepEqual(refs.sort(), fs.readdirSync(path.join(root, 'assets'))
      .filter(file => file.endsWith('.png')).map(file => `assets/${file}`).sort());
    for (const file of refs) {
      const data = fs.readFileSync(path.join(root, file));
      assert.equal(data.readUInt32BE(16), 1280);
      assert.ok([1000, 1200].includes(data.readUInt32BE(20)));
      assert.ok(data.length <= 300 * 1024);
    }
  });

  test(`${name}: obsolete historical and usage phrases do not return`, () => {
    for (const phrase of ['Crassical', 'Cryptograhpy', 'パット', 'ヴィジュアル暗号',
      '再利用せざるを得ない', '鍵を生成せずに暗号化開始した場合']) assert.ok(!read(name).includes(phrase), phrase);
  });

  test(`${name}: experiment tables recompute all 11 rows from the byte core`, () => {
    const source = read(name);
    function rows(marker, count) {
      const block = source.split(`<!-- lab-${marker} -->`)[1].trimStart().split(/\n\s*\n/)[0];
      const parsed = block.split('\n').filter(line => line.startsWith('| ')).slice(1)
        .map(line => line.split('|').slice(1, -1).map(cell => cell.trim().replace(/^`|`$/g, '')));
      assert.equal(parsed.length, count, marker);
      return parsed;
    }
    const samples = rows('sample', 2);
    assert.deepEqual(samples, [core.CRIB_SAMPLE.p1, core.CRIB_SAMPLE.p2]
      .map((text, i) => [String(i + 1), text, String(core.encodeText(text).length)]));
    const xor = core.xorBytes(core.encodeText(core.CRIB_SAMPLE.p1), core.encodeText(core.CRIB_SAMPLE.p2));
    assert.ok(source.includes('`' + core.toHex(xor) + '`'));
    const cribRows = rows('crib', 3);
    assert.deepEqual(cribRows, core.cribDrag(xor, ' THE ').filter(row => row.readable)
      .map(row => [String(row.offset + 1), JSON.stringify(' THE '), JSON.stringify(row.text)]));
    const key = n => core.randomBytes(n, a => a.forEach((_, i) => { a[i] = (i * 73 + 41) & 255; }));
    const cipher = core.xorBytes(core.encodeText('ATTACK AT DAWN'), key(14));
    const secrecy = rows('secrecy', 3);
    assert.deepEqual(secrecy, ['ATTACK AT DAWN', 'RETREAT AT SIX', '撤退せよ!!']
      .map(text => [text, core.toHex(core.forgeKey(cipher, text)), core.toHex(cipher)]));
    for (const [plain, hexKey, hexCipher] of secrecy) {
      assert.equal(core.decodeBytes(core.xorBytes(core.parseHex(hexCipher), core.parseHex(hexKey))).text, plain);
    }
    const original = core.xorBytes(core.encodeText('PAY 100 YEN TO BOB'), key(18));
    const tamper = rows('tamper', 3);
    const conditions = [['-', '-', '-'], ['5', '100', '900'], ['16', 'BOB', 'EVE']];
    assert.deepEqual(tamper, conditions.map(([position, known, target]) => {
      const bytes = position === '-' ? original : core.flip(original, Number(position) - 1, known, target);
      return [position, known, target, core.toHex(bytes), core.decodeBytes(core.xorBytes(bytes, key(18))).text];
    }));
    const delta = core.xorBytes(original, core.flip(original, 4, '100', '900'));
    assert.ok(source.includes('`' + core.toHex(delta) + '`'));
  });
}

test('Japanese YAML keeps the original keys, immutable values and block lists', () => {
  const front = read('README.md').match(/^<!--\n---\n([\s\S]*?)\n---\n-->/)[1];
  assert.deepEqual([...front.matchAll(/^(\w+):/gm)].map(m => m[1]), [
    'id', 'slug', 'title', 'subtitle_ja', 'subtitle_en', 'description_ja', 'description_en',
    'category_ja', 'category_en', 'difficulty', 'tags', 'repo_url', 'demo_url', 'hub'
  ]);
  for (const line of ['id: day029', 'slug: otp-animation', 'hub: true',
    'repo_url: "https://github.com/ipusiron/otp-animation"',
    'demo_url: "https://ipusiron.github.io/otp-animation/"']) assert.ok(front.split('\n').includes(line), line);
  for (const key of ['category_ja', 'category_en', 'tags']) assert.ok(front.includes(`${key}:\n  - `));
  assert.ok(front.includes('  - Classical Cryptography\n  - Modern Cryptography'));
  assert.ok(!read('README.en.md').startsWith('<!--'));
});
