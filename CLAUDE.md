# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static web application that visualizes the One-Time Pad (OTP) encryption algorithm through animations. It's part of a "100 Security Tools with Generative AI" project (Day 029).

## Key Commands

Since this is a static site with no build process:
- **Run locally**: Open `index.html` directly in a browser or use a simple HTTP server like `python -m http.server`
- **Deploy**: Commits to main branch automatically deploy to GitHub Pages at https://ipusiron.github.io/otp-animation/
- **No build/test/lint commands** - pure HTML/CSS/JavaScript with no dependencies

## Architecture

The application consists of three core files:

1. **index.html**: UI structure with Japanese interface
   - Input field for plaintext (ASCII only)
   - Buttons for key generation and animation start
   - Three rows displaying bits: plaintext, key, and ciphertext

2. **script.js**: Core encryption logic and animation control
   - `textToBitsWithValidation()`: Converts text to bit array with ASCII validation (32-126)
   - `generateRandomBits()`: Creates random key bits
   - `xorBits()`: Performs XOR encryption
   - `animateEncryption()`: Manages the bit-by-bit animation sequence
   - Global state: `plainBits`, `keyBits`, `cipherBits`

3. **style.css**: Visual styling including:
   - Burn animation for consumed key bits
   - 8-bit grouping for readability
   - Responsive layout

## Key Implementation Details

- **Character encoding**: Only ASCII characters (code points 32-126) are supported
- **Animation timing**: 300ms delay between each bit encryption, 800ms burn effect
- **Visual feedback**: Key bits "burn" when used, cipher bits appear with animation
- **Error handling**: Real-time validation with Japanese error messages
- **Default state**: Initialized with "HELLO" as example plaintext

## Development Notes

- The codebase is intentionally simple with no external dependencies
- All text/UI is in Japanese as this is a Japanese educational tool
- The burn effect on key bits is visual only - the bits remain visible (by design)
- Uses vanilla JavaScript with modern ES6+ features