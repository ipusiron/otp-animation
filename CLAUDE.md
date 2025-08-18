# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static web application that visualizes the One-Time Pad (OTP) encryption algorithm through animations. It's part of a "100 Security Tools with Generative AI" project (Day 029). The application provides interactive visualization and educational experiments for understanding XOR operations and OTP encryption.

## Key Commands

Since this is a static site with no build process:
- **Run locally**: Open `index.html` directly in a browser or use a simple HTTP server like `python -m http.server`
- **Deploy**: Commits to main branch automatically deploy to GitHub Pages at https://ipusiron.github.io/otp-animation/
- **No build/test/lint commands** - pure HTML/CSS/JavaScript with no dependencies

## Architecture

The application uses a modular JavaScript architecture with separate files for different concerns:

### Core Structure
- **index.html**: Japanese UI with four tabs (暗号化, 復号, XORの基礎, OTP実験室)
- **style.css**: Visual styling including animations, dark mode, responsive layout

### JavaScript Modules
- `js/main.js`: Entry point and initialization
- `js/utils.js`: Core bit conversion and XOR operations
- `js/bit-operations.js`: Bit rendering and display
- `js/tab-manager.js`: Tab switching logic
- `js/encryption.js`: Encryption animation and controls
- `js/decryption.js`: Decryption animation and controls
- `js/xor-basics.js`: XOR educational content and truth tables
- `js/otp-lab.js`: Interactive experiments (XOR gate simulator, key reuse demo, fragment analysis)
- `js/clipboard.js`: Clipboard operations with fallback for browser restrictions
- `js/file-export.js`: Export results to text files
- `js/dark-mode.js`: Theme switching with localStorage persistence
- `js/help-modal.js`: Help dialog implementation

## Key Implementation Details

### Technical Constraints
- **Character encoding**: ASCII only (code points 32-126)
- **Animation timing**: 300ms per bit, 800ms burn effect
- **Speed control**: 5 levels from 0.1s to 2s
- **Bit grouping**: 8-bit groups with visual separators

### Interactive Features
- **Experiment 1**: XOR gate circuit simulator with real-time signal visualization
- **Experiment 2**: Key reuse vulnerability demonstration (C₁ ⊕ C₂ = P₁ ⊕ P₂)
- **Experiment 3**: Fragment analysis for partial key recovery

### Browser Compatibility
- Clipboard API with 2-second timeout and manual input fallback
- Dark mode auto-detection with system preference support
- LocalStorage for persistent settings

## Development Notes

- The codebase is intentionally simple with no external dependencies
- All UI text is in Japanese as this is an educational tool for Japanese users
- The burn effect on key bits is visual only - bits remain readable after use (intentional design)
- Uses vanilla JavaScript with ES6+ features (async/await, modules, arrow functions)