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

The application uses a modular JavaScript architecture with separate files for different concerns:

1. **index.html**: UI structure with Japanese interface
   - Tabbed interface: 暗号化, 復号, XORの基礎, OTP実験室
   - Input fields for plaintext/ciphertext (ASCII only)
   - Animation control panels with play/pause, step controls, speed adjustment
   - Three rows displaying bits: plaintext/ciphertext, key, and output

2. **JavaScript modules**:
   - `js/utils.js`: Core utility functions (bit conversion, XOR operations)
   - `js/bit-operations.js`: Bit rendering and display functions
   - `js/tab-manager.js`: Tab switching functionality
   - `js/encryption.js`: Encryption animation logic and controls
   - `js/decryption.js`: Decryption animation logic and controls
   - `js/main.js`: Initialization and global coordination

3. **style.css**: Visual styling including:
   - Burn animation for consumed key bits
   - 8-bit grouping for readability
   - Responsive layout (1-5 character groups per line)
   - Animation control styling

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