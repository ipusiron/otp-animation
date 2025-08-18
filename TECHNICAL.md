# 技術的詳細・制限事項

## OTP実験室 - 実験1: XORゲート構成シミュレーター
- **リアルタイム回路シミュレーション**: 入力値を変更すると即座に回路が更新
- **動的な信号表示**: 
  - 0信号: ライトモードでは濃いグレー、ダークモードでは白
  - 1信号: 赤色（両モード共通）
- **インタラクティブな表**: 表のセルにホバーすると対応する回路要素がハイライト
- **完全な論理ゲート実装**: A ⊕ B = (A ∧ ¬B) ∨ (¬A ∧ B)

## ダークモード対応
- **自動検出**: システムの設定に応じて初期モードを決定
- **永続化**: ローカルストレージに設定を保存
- **完全対応**: すべてのタブとコンポーネントで最適な色調整

## 暗号化・復号処理のアニメーション制御
- **5段階の速度調整**: 超高速（0.1秒）〜 極低速（2秒）
- **ステップ実行**: 1ビットずつ前進/後退
- **全処理**: 残りのビットを一気に処理
- **進捗表示**: 現在のビット位置を常に表示

## クリップボードAPI制限とフォールバック戦略

本ツールではビット列のコピー・ペースト機能を提供していますが、ブラウザーのセキュリティ制限により、**連続的なクリップボードアクセスには制限があります**。

### 問題の背景

現代のブラウザー（Chrome、Firefox、Safari等）では、セキュリティ上の理由からClipboard APIの使用に以下の制限があります：

1. **ユーザーインタラクション要求**: クリップボードアクセスには明示的なユーザーアクション（クリック等）が必要
2. **連続アクセス制限**: 短時間での複数回のクリップボードアクセスが制限される場合がある
3. **タイムアウト**: 特定の条件下でAPIが応答しなくなる場合がある

### 実装した回避策

この問題に対応するため、以下のフォールバック戦略を実装しています：

```javascript
// タイムアウト付きクリップボード読み取り
async function pasteFromClipboard(successCallback, errorCallback) {
  console.log('Starting clipboard read...');
  
  // Clipboard API利用可能性チェック
  if (!navigator.clipboard || !navigator.clipboard.readText) {
    fallbackPaste(successCallback, errorCallback);
    return;
  }
  
  try {
    // 2秒タイムアウトでクリップボード読み取り
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Clipboard read timeout')), 2000);
    });
    
    const text = await Promise.race([
      navigator.clipboard.readText(),
      timeoutPromise
    ]);
    
    // 成功時の処理
    const bitArray = parseBitString(text);
    successCallback(bitArray, text);
  } catch (err) {
    // 失敗時は手動入力フォールバック
    fallbackPaste(successCallback, errorCallback);
  }
}

// フォールバック: 手動入力ダイアログ
function fallbackPaste(successCallback, errorCallback) {
  const text = prompt('ビット列を入力してください（アンダースコア区切り、空白区切り、区切りなしに対応）:');
  if (text !== null && text.trim() !== '') {
    try {
      const bitArray = parseBitString(text);
      successCallback(bitArray, text);
    } catch (parseErr) {
      errorCallback(parseErr.message);
    }
  } else {
    errorCallback('入力がキャンセルされました');
  }
}
```

### 回避アプローチの特徴

1. **Promise.race()**: クリップボード読み取りとタイムアウトを競争させることで、ハングアップを防止
2. **自動フォールバック**: クリップボードアクセスが失敗した場合、自動的に手動入力ダイアログを表示
3. **複数形式対応**: アンダースコア区切り、空白区切り、区切りなしのすべてに対応した柔軟なパーサー
4. **ユーザビリティ重視**: エラー時も操作を継続できるシームレスな体験

### 使用時の注意点

- **初回ペースト**: 通常は正常に動作します
- **2回目以降**: ブラウザー制限により手動入力ダイアログが表示される場合があります
- **対処法**: ダイアログにクリップボードからビット列を貼り付けてください

この実装により、ブラウザーの制限下でも安定した操作性を確保しています。

## 対応ビット列形式

```javascript
// サポートする入力形式
const examples = [
  "01001000_01000101_01001100_01001100_01001111",  // アンダースコア区切り
  "01001000 01000101 01001100 01001100 01001111",  // 空白区切り
  "0100100001000101010011000100110001001111",      // 区切りなし
  "01001000-01000101-01001100-01001100-01001111",  // ハイフン区切り
  "01001000,01000101,01001100,01001100,01001111"   // カンマ区切り
];
```