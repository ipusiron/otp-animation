# CLAUDE.md

## Project Overview

OTP Animation is Day029 of 100 Security Tools with Generative AI.
This dependency-free, static MIT-licensed educational app visualizes byte-based OTP with four tabs:
encryption, decryption, XOR basics and six OTP lab experiments.

## Key Commands

- Run tests: `npm test` with Node.js 22; no installation needed.
- Open `index.html` directly or run `python -m http.server 8000`.
- GitHub Actions runs the same tests on push and pull_request.
- GitHub Pages serves the main branch.

## Architecture

- `index.html`: four accessible tabs, SVG circuit, help dialog, CSP and translation attributes.
- `style.css`: light/dark variables, narrow layouts, internal scrolling and burn animation.
- `js/otp-core.js`: DOM-free UTF-8, byte/bit/hex conversion, validation, XOR and secure key generation.
- `js/encryption.js`, `decryption.js`: byte arrays plus completed-bit counts; results are derived.
- `js/bit-operations.js`: character-aware byte groups, hex and bit rendering, translated validation errors.
- `js/clipboard.js`: copy, paste, two-second read timeout and nonblocking toast fallback.
- `js/file-export.js`: translated educational text records containing plaintext, key and ciphertext.
- `js/tab-manager.js`, `help-modal.js`: ARIA, keyboard tabs, focus trap and focus restoration.
- `js/theme-init.js`: synchronous theme selection before first paint.
- `js/dark-mode.js`: theme switching and safe storage access.
- `js/i18n.js`: matching Japanese/English dictionaries and state-preserving switching.
- `js/xor-basics.js`, `otp-lab.js`: XOR basics, gate construction, key reuse, fragment recovery, crib dragging, secrecy and tampering.
- `js/main.js`: initialization.

Keep classic scripts so that file:// works without a server, fetch or modules.
The core also exports through CommonJS for Node tests.

## Data and Cryptographic Rules

Plaintext is UTF-8 up to 64 bytes. Reject empty text, isolated surrogates and U+0000–U+001F/U+007F.
Use TextEncoder/TextDecoder. Invalid decoded UTF-8 produces U+FFFD and a visible note.
Ciphertext and keys are hexadecimal inputs; byte lengths must match.
Generate keys only with crypto.getRandomValues. Deterministic test keys must never be used in the app.
Derive known answers and README tables from OtpCore; do not change reference expectations to pass tests.

Editing input stops playback and invalidates old results. Never keep a separate mutable result representation.
Experiments 2–4 and 6 accept printable ASCII 32–126; experiment 5 supports UTF-8 like encryption/decryption.
A known plaintext fragment reveals only its corresponding key fragment.

The core exports CRIB_SAMPLE, isReadable, cribDrag, assemble, forgeKey and flip in addition to the original API.
Keep the reference implementations unchanged, including readability characters, conflict handling and exception messages.
Derive all experiment values from OtpCore, not duplicated arithmetic in UI or documentation.
CRIB_SAMPLE has two 33-byte messages; the default space-padded THE crib has readable one-based positions 5, 11 and 21.
Only exact assembly of both sample plaintexts is completion; readability is not proof that a guess is correct.
forgeKey maps fixed ciphertext to any equal-byte-length alternative; flip never receives the key.
Default tampering changes PAY 100 YEN TO BOB into PAY 900 YEN TO BOB, with only byte 5 differing by 08.
Keep cribState placements, secrecyState ciphertext/keys and tamperState results in memory only.
Changing source plaintext clears old cryptographic state; language switching and accordion folding preserve it.
Keys are generated on explicit encryption actions, never on accordion expansion.
Secrecy does not provide integrity: explain MACs and authenticated encryption such as AES-GCM.

Perfect secrecy requires truly random, equal-length, secret keys used once.
The animation does not securely erase memory. This app and its key-containing exports are educational, not production security.

## Dictionary Rules

Put every UI message, error, toast, help paragraph and export label in js/i18n.js.
Both dictionaries must have identical nonempty keys and matching placeholders.
No raw Japanese literals in other application scripts, except comments.
HTML uses data-i18n and data-i18n-title/placeholder/aria-label, including hidden and SVG content.
Never translate user input or decoded plaintext.
Language priority: ?lang=ja|en, saved otp-language, navigator.language.

## Security and Accessibility

Keep meta CSP with same-origin scripts/styles. No unsafe-inline or meta frame-ancestors.
Do not add inline handlers, style attributes, style elements or element.style assignments.
Do not add external services, fonts, CDNs or dependencies.
Never log keys, plaintext or ciphertext. Do not use alert or prompt.
Keep DOM text insertion safe; preserve HTTP and file:// behavior.
Keep 44px controls, internal rather than page-level horizontal scrolling, 4.5:1 text contrast,
keyboard tabs, help focus containment, Escape restoration and reduced-motion support.

## Local Storage

Only otp-animation-dark-mode (light/dark) and otp-language (ja/en) may persist.
Wrap storage access in try/catch. All functionality must remain available when storage is blocked.
Do not store plaintext, keys, ciphertext or experiment data.

## Tests

- core.test.js: six known answers, validation, 200 mixed UTF-8 round trips, hex/bits and weak RNG prohibition.
- Additional core tests: five crib cases, assembly/conflicts, secrecy/tampering references and 100 property cases for each transformation.
- i18n.test.js: key parity, nonempty values, usage, placeholders and Japanese literal prohibition.
- html.test.js: CSP, ARIA, labels, safe APIs, early dark styling and noninteractive toasts.
- contrast.test.js: actual theme variables and required light/dark contrast pairs.
- format.test.js: readable line limits and minimum document/module lengths.
- readme.test.js: recomputed known-answer tables, YAML, headings, complete file trees and images.

Keep existing numerical expectations. Test UI in Japanese and English, HTTP/file, light/dark,
1280/768/390/320px, including mobile contexts and blocked storage.
See TECHNICAL.md for clipboard behavior and state details.
