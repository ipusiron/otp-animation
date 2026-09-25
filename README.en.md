# OTP Animation - One-Time Pad Encryption Animation Tool

日本語: [README.md](README.md)

![GitHub Repo stars](https://img.shields.io/github/stars/ipusiron/otp-animation?style=social)
![GitHub forks](https://img.shields.io/github/forks/ipusiron/otp-animation?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/ipusiron/otp-animation)
![GitHub license](https://img.shields.io/github/license/ipusiron/otp-animation)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue?logo=github)](https://ipusiron.github.io/otp-animation/)

**Day029 - 100 Security Tools with Generative AI**

OTP Animation teaches the one-time pad through bit-by-bit XOR and a burning-key animation.
It supports UTF-8 text, including Japanese and emoji, with four tabs and six experiments in Japanese and English.

## 🌐 Demo

[Open OTP Animation in your browser](https://ipusiron.github.io/otp-animation/)

## 📸 Screenshots

![Encryption after 40 bits](assets/screenshot.png)

Light Japanese UI: OTP暗号 after 40 bits, with the rows scrolled to the three bytes of 暗. 1280×1200, 55,572 bytes.

![Completed decryption](assets/screenshot2.png)

Light Japanese UI: received ciphertext and key, and the recovered plaintext, after scrolling down. 1280×1200, 54,333 bytes.

![XOR with a reused key](assets/screenshot3.png)

Dark English UI: Experiment 2 with HELLO and WORLD, showing C₁⊕C₂＝P₁⊕P₂. 1280×1200, 53,826 bytes.

![Crib candidates and assembled plaintexts](assets/screenshot4.png)

Light Japanese UI: Experiment 4, placing “ THE ” into plaintext 1 at position 11 and plaintext 2 at position 21. 1280×1000, 41,841 bytes.

![Tampering changes the amount to 900](assets/screenshot5.png)

Light Japanese UI: Experiment 6, with difference 08 at byte 5 and PAY 900 YEN TO BOB received. 1280×1000, 60,998 bytes.

## ✨ Features

- UTF-8 plaintext up to 64 bytes, grouped by character with hexadecimal and bit views
- Keys of the same byte length generated using crypto.getRandomValues
- Bit-by-bit XOR playback, pause, forward and backward steps, with consumed key bits shown as ash
- Decryption from hexadecimal ciphertext and key; invalid UTF-8 shown with replacement characters and a note
- Bit-string copy and paste, and text-file result exports
- Japanese/English switching that preserves state, plus persistent light and dark themes
- XOR basics and experiments in gate construction, key reuse and known-plaintext fragments
- Experiment 4: find crib-dragging candidates and assemble two plaintexts
- Experiment 5: demonstrate perfect secrecy by deriving keys for alternative plaintexts from the same ciphertext
- Experiment 6: change an amount or recipient by flipping ciphertext bits without the key

The burning animation is a visual effect. It does not securely erase keys.

## 📖 Usage

### Encryption tab

1. Enter plaintext such as HELLO, OTP暗号 or 😀. Check the character count and UTF-8 byte count.
2. Select “🔑 Generate key” to create an equally long key. Unprocessed ciphertext bits appear as “?”.
3. Select “▶ Start encryption”. Use playback, pause, forward/backward steps, reset or completion controls.
4. Once complete, export the result to a text file.

Editing plaintext clears the key, progress and ciphertext, and stops playback. Encryption cannot start before generating a key.
Five speed settings range from 0.1 to 2 seconds per bit. Narrow displays scroll inside the bit rows, not across the page.

### Decryption tab

1. Receive both ciphertext and key from the Encryption tab, or enter each as hexadecimal.
2. Start decryption or complete all steps to display the original UTF-8 text.
3. Try a random key of the same length to compare it with the correct key.

Editing inputs clears the previous result and progress. Ciphertext and key must have equal lengths.
Invalid byte sequences are shown as U+FFFD with an explanatory note. A wrong key may coincidentally produce readable text.

### XOR Basics tab

Explore the truth table, commutativity, associativity, identity and self-inverse property.
Changing input A or B updates the result and explanation.

### OTP Lab tab

- Experiment 1: construct XOR from NOT, AND and OR gates; inspect changing wires and table values
- Experiment 2: encrypt two plaintexts with one key and verify C₁⊕C₂＝P₁⊕P₂; unequal texts are shortened with a length note
- Experiment 3: enter a known plaintext fragment and a one-based position; recover only the corresponding key fragment and compare it with the actual key
- Experiment 4: select “🔀 Encrypt with a New Key”, try “ THE ” (with surrounding spaces) at every position, then place it in plaintext 1 at position 11 and plaintext 2 at position 21; undo, clear, hints and answers are available
- Experiment 5: encrypt the default ATTACK AT DAWN with “🔑 Generate Key and Encrypt”, then enter RETREAT AT SIX or 撤退せよ!! as the alternative; both occupy 14 bytes, and the displayed key decrypts to that alternative
- Experiment 6: encrypt the default PAY 100 YEN TO BOB, then use position 5, 100→900 and “✂️ Rewrite Ciphertext”; position 16, BOB→EVE changes the recipient

Text inputs in experiments 2–4 and 6 accept ASCII code points 32–126. Experiment 5 supports UTF-8 like the encryption and decryption tabs.
Experiment 4 accepts two custom messages of up to 64 characters each and cribs of 1–20 characters. Unequal messages use the shorter length.
Matching both sample plaintexts displays completion. Readability alone does not prove a guess correct: test neighboring words.
Experiment 5 accepts up to 64 bytes. Experiment 6 accepts up to 64 plaintext characters and checks fragment lengths and positions.
Editing plaintext clears previous ciphertext, keys and results. Folding experiments and switching languages preserve results.

### Additional controls

Copied bits are separated into eight-bit groups. Pasting accepts either binary or hexadecimal.
If clipboard access is unavailable, paste directly into an input field. Clipboard reads time out after two seconds.
Use arrow keys to select tabs and ? or F1 to open help. The ? character remains editable in inputs; Ctrl/Cmd+D is left to the browser.
Tab stays inside the help dialog. Escape closes it and returns focus to the original button.

## 🔐 What Is the One-Time Pad

The one-time pad (OTP) encrypts plaintext by XORing it with a key.
Perfect secrecy requires all four conditions: a truly random key, the same length as the plaintext, used exactly once, and kept secret.
Securely distributing and storing large amounts of key material is difficult, so modern cryptographic schemes are preferred for many uses.

Under all four conditions, every plaintext of the same length has a corresponding key, so ciphertext alone cannot select the original plaintext (Experiment 5).
This protects confidentiality, not integrity. Detecting changes such as those in Experiment 6 requires a message authentication code or authenticated encryption such as AES-GCM.

### Origin of the name

“One-Time” means used once, and “Pad” refers to bound sheets of paper.
Each page contained random key material and was destroyed after use. The burning animation illustrates this single-use rule.

### OTP and the Vernam cipher

In 1917, Gilbert Vernam devised a method combining telegraph data with a key.
A Vernam system using a repeating key must be distinguished from OTP with a truly random, single-use key.
Joseph Mauborgne's ideas about random keys also contributed to this history.
Some literature uses “Vernam cipher” to mean OTP, so examine the key conditions rather than relying on terminology alone.

### Soviet operations and VENONA

In early 1942, amid disruption caused by the German invasion, Soviet cryptographic production duplicated about 35,000 pages of key material and distributed the copies to geographically separated users.
Duplicate keys in communications involving the NKVD/NKGB (later the KGB), GRU and other organizations provided the opening exploited by VENONA.
Only a small fraction of the traffic was decrypted. This did not break the perfect secrecy of correctly used OTP.
Experiment 4 demonstrates the idea of guessing words and assembling plaintexts after key reuse.
See the primary source, [NSA Cryptologic Almanac: VENONA: An Overview](https://www.nsa.gov/Portals/70/documents/news-features/declassified-documents/crypto-almanac-50th/VENONA_An_Overview.pdf).

### From Caesar to OTP

| Cipher | Type | Key |
|---|---|---|
| Caesar | Monoalphabetic substitution | Fixed shift of 3 |
| Shift cipher | Monoalphabetic substitution | One arbitrary shift |
| Vigenère | Polyalphabetic substitution | Repeating keyword |
| One-time pad | One-time pad | Truly random, equal length, single use, secret |

Shift ciphers use one substitution table; Vigenère uses multiple tables according to its key.
Addition over an alphabet also gives OTP when each key symbol is independently uniform, the key has the same length as the plaintext, and it is secret and used once.
This tool XORs UTF-8 bytes instead of substituting letters.

### Comparing other systems with Vigenère

| Cipher | Type | Substitution tables |
|---|---|---|
| Caesar | Monoalphabetic substitution | One fixed table |
| Shift cipher | Monoalphabetic substitution | One table; 25 nonidentity choices for English letters |
| Vigenère | Polyalphabetic substitution | Multiple tables selected by the key |
| One-time pad | One-time pad | An independent random substitution at each position |

## 🔬 Specification and Known Answers

Plaintext uses TextEncoder UTF-8 with a 64-byte limit.
Empty input, control characters U+0000–U+001F and U+007F, and isolated surrogates are rejected.
あ occupies three bytes and 😀 four bytes. Bits are displayed most-significant first, eight per byte, grouped by character.

Hexadecimal output uses uppercase two-digit bytes separated by spaces. Input accepts either case, 0x prefixes, spaces, colons, hyphens and underscores.
Binary separators include whitespace, underscores, commas, vertical bars and hyphens. Incomplete bytes are rejected.
Actual keys are generated with crypto.getRandomValues.

The following known answers use a deterministic test key: byte i is (i×73+41)&255.
**Never use this test key for actual encryption.**

| Plaintext | UTF-8 hexadecimal | Bytes | Key (test only) | Ciphertext |
|---|---|---|---|---|
| HELLO | 48 45 4C 4C 4F | 5 | 29 72 BB 04 4D | 61 37 F7 48 02 |
| A | 41 | 1 | 29 | 68 |
| あ | E3 81 82 | 3 | 29 72 BB | CA F3 39 |
| OTP暗号 | 4F 54 50 E6 9A 97 E5 8F B7 | 9 | 29 72 BB 04 4D 96 DF 28 71 | 66 26 EB E2 D7 01 3A A7 C6 |
| Hi!? | 48 69 21 3F | 4 | 29 72 BB 04 | 61 1B 9A 3B |
| 😀 | F0 9F 98 80 | 4 | 29 72 BB 04 | D9 ED 23 84 |

Tests recalculate every cell using OtpCore. See [TECHNICAL.md](TECHNICAL.md) for implementation details.

### Known Answers for Experiments 4–6

These reference values use the same deterministic test key. Never use test keys for actual encryption.
The UI generates fresh random keys, so ciphertext varies while candidates, recovered messages and tampering differences remain the same.

<!-- lab-sample -->
| Plaintext | Sample message | Bytes |
|---|---|---|
| 1 | `MEET ME AT THE NORTH GATE AT NOON` | 33 |
| 2 | `THE PACKAGE IS UNDER THE OLD OAK.` | 33 |

C₁⊕C₂ is always `19 0D 00 74 70 0C 06 6B 00 13 65 74 01 16 00 1B 01 16 11 1A 00 13 09 11 65 6F 0D 10 00 01 0E 04 60`, independent of the key.
Of the 29 positions tested for “ THE ”, three are readable. Spaces inside the quotation marks are part of the text.
Positions are one-based. Position 5 is a coincidental false positive; placing the crib in plaintext 1 at position 11 and plaintext 2 at position 21 matches the sample.

<!-- lab-crib -->
| Position | Crib | Other plaintext fragment |
|---|---|---|
| 5 | `" THE "` | `"PXN. "` |
| 11 | `" THE "` | `"E IS "` |
| 21 | `" THE "` | `" GATE"` |

Experiment 5 keeps the ciphertext of ATTACK AT DAWN fixed and derives a key for each alternative plaintext.

<!-- lab-secrecy -->
| Decrypted plaintext | Key | Shared ciphertext |
|---|---|---|
| `ATTACK AT DAWN` | 29 72 BB 04 4D 96 DF 28 71 BA 03 4C 95 DE | 68 26 EF 45 0E DD FF 69 25 9A 47 0D C2 90 |
| `RETREAT AT SIX` | 3A 63 BB 17 4B 9C AB 49 64 CE 67 5E 8B C8 | 68 26 EF 45 0E DD FF 69 25 9A 47 0D C2 90 |
| `撤退せよ!!` | 8E B4 4B AC 8E 5D 1C E8 BE 79 C5 85 E3 B1 | 68 26 EF 45 0E DD FF 69 25 9A 47 0D C2 90 |

Experiment 6 starts with PAY 100 YEN TO BOB. The receiver decrypts every ciphertext with the same real key.

<!-- lab-tamper -->
| Position (from 1) | Known fragment | Replacement | Ciphertext | Receiver's plaintext |
|---|---|---|---|---|
| - | - | - | 79 33 E2 24 7C A6 EF 08 28 FF 4D 6C C1 91 07 32 F6 40 | `PAY 100 YEN TO BOB` |
| 5 | 100 | 900 | 79 33 E2 24 74 A6 EF 08 28 FF 4D 6C C1 91 07 32 F6 40 | `PAY 900 YEN TO BOB` |
| 16 | BOB | EVE | 79 33 E2 24 7C A6 EF 08 28 FF 4D 6C C1 91 07 35 EF 47 | `PAY 100 YEN TO EVE` |

The difference for 100→900 is `00 00 00 00 08 00 00 00 00 00 00 00 00 00 00 00 00 00`: only byte 5 changes.

## 🔒 Security

This is an educational demonstration, not a tool for protecting real data or securely distributing and erasing keys.
Exported files contain plaintext, key and ciphertext.

- Meta CSP limits scripts and styles to the same origin; no inline event handlers or styles
- Referrer policy is no-referrer
- The app makes no external requests and does not print plaintext, keys or ciphertext to the console
- Only theme and language are stored in localStorage, within the same browser; the app also works when storage is blocked
- Cryptographic state consists of byte arrays and a completed-bit count; editing input invalidates old results

## 📚 References

- [暗号技術のすべて](https://akademeia.info/?page_id=157), pp. 96–107
  - Unbreakability of the Vernam cipher (OTP) and its limitations
- [Pythonでいかにして暗号を破るか](https://akademeia.info/?page_id=94), pp. 424–429
  - Implementing OTP in Python; avoiding two-time pads and their relation to Vigenère
- [暗号解読 実践ガイド](https://akademeia.info/?page_id=39995), pp. 164–165, 176–177
- [シーザー暗号の解読法](https://akademeia.info/?page_id=37037), p. 92
  - The requirements of truly random, equal-length, secret, single-use keys
- [安全な暗号をどう実装するか 暗号技術の新設計思想](https://book.mynavi.jp/ec/products/detail/id=147364), pp. 10–13
  - Why OTP is secure
- [NSA Cryptologic Almanac: VENONA: An Overview](https://www.nsa.gov/Portals/70/documents/news-features/declassified-documents/crypto-almanac-50th/VENONA_An_Overview.pdf) (primary source)
- [Wikipedia: Venona project](https://en.wikipedia.org/wiki/Venona_project) (supplementary reference)

## 🧪 Tests

Run with Node.js 22. No dependency installation is needed.

```sh
npm test
```

- core.test.js: six known answers, validation, 200 UTF-8 round trips, hexadecimal/binary round trips and weak RNG prohibition
- Additional core.test.js checks: five crib searches, assembly and conflicts, secrecy/tampering known answers, and 100 property cases each for key derivation and tampering
- i18n.test.js: matching dictionary keys, nonempty values, key usage, placeholders and Japanese literals
- html.test.js: CSP, ARIA, prohibited inline operations, early theme and noninteractive toasts
- contrast.test.js: light and dark text/background ratios of at least 4.5:1
- format.test.js: maximum line lengths and minimum line counts
- readme.test.js: known-answer tables, YAML, headings, actual files and tree, images and historical regression phrases

GitHub Actions runs npm test on push and pull_request.

## 📁 Directory Structure

```
otp-animation/                   # Project root
├── .github/                     # GitHub configuration
│   └── workflows/               # GitHub Actions workflows
│       └── test.yml             # Run tests on Node 22 for pushes and pull requests
├── .gitignore                   # Files excluded from Git
├── .nojekyll                    # Disable Jekyll processing
├── CLAUDE.md                    # Development guide
├── LICENSE                      # MIT license
├── README.md                    # Japanese usage and specification
├── README.en.md                 # English README
├── TECHNICAL.md                 # UTF-8, state, CSP and clipboard details
├── package.json                 # Dependency-free node --test command
├── index.html                   # Four tabs, help and CSP
├── style.css                    # Themes, responsive layout and burn effects
├── assets/                      # README screenshots
│   ├── screenshot.png           # OTP暗号 encryption after 40 bits
│   ├── screenshot2.png          # Completed decryption of received ciphertext and key
│   ├── screenshot3.png          # Experiment 2 results in dark English UI
│   ├── screenshot4.png          # Experiment 4 candidates and plaintext assembly
│   └── screenshot5.png          # Experiment 6 difference and receiver plaintext
├── js/                          # Classic scripts supporting file://
│   ├── otp-core.js              # DOM-free UTF-8, hex, bits, XOR and key generation
│   ├── bit-operations.js        # Character and byte rendering
│   ├── tab-manager.js           # Tabs with ARIA and arrow keys
│   ├── encryption.js            # Encryption state and playback
│   ├── decryption.js            # Hex input, decryption state and playback
│   ├── clipboard.js             # Copy, paste and toast notifications
│   ├── file-export.js           # Text-file exports
│   ├── dark-mode.js             # Theme switching
│   ├── theme-init.js            # Theme selection before first paint
│   ├── help-modal.js            # Help dialog
│   ├── i18n.js                  # Japanese and English dictionaries and switching
│   ├── xor-basics.js            # XOR basics
│   ├── otp-lab.js               # Experiments 1–6 and their states
│   └── main.js                  # Application initialization
└── test/                        # Dependency-free automated tests
    ├── core.test.js             # Known answers, validation, round trips and weak RNG prohibition
    ├── i18n.test.js             # Dictionary, key usage and Japanese literal checks
    ├── html.test.js             # CSP, ARIA, prohibited APIs and early theme
    ├── contrast.test.js         # Light and dark contrast
    ├── format.test.js           # Maximum line lengths and minimum line counts
    └── readme.test.js           # Known-answer tables, YAML, structure and images
```

## 💻 Requirements

Use a browser supporting TextEncoder, TextDecoder and crypto.getRandomValues.
Open index.html directly via file:// or serve it over local HTTP. There are no dependencies, build steps or external CDNs.

```sh
python -m http.server 8000
```

For HTTP, visit http://localhost:8000/. Clipboard API availability depends on browser permissions.

## 📄 License

MIT License. See [LICENSE](LICENSE).

## 🛠️ About This Tool

This tool is part of the “100 Security Tools with Generative AI” project.
The project uses AI assistance to build and publish security-related tools over 100 days.

See the [project page](https://akademeia.info/?page_id=42163) for details and other tools.
