# E2E Tests for vite-plugin-extism Example

This directory contains end-to-end tests using Playwright to validate the functionality of the vite-plugin-extism example.

## Setup

1. Install dependencies:
   ```bash
   npm install
   npm run install
   ```

2. Build the parent example project:
   ```bash
   cd ..
   npm run build:wasm
   ```

3. Run tests:
   ```bash
   npm test
   ```

## Available Scripts

- `npm test` - Run all tests headlessly
- `npm run test:headed` - Run tests with browser UI visible
- `npm run test:debug` - Run tests in debug mode
- `npm run test:ui` - Open Playwright UI for interactive testing
- `npm run report` - Show test report
- `npm run install` - Install Playwright browsers

## Test Structure

- `tests/` - Test files
- `playwright.config.ts` - Playwright configuration
- The web server automatically starts the parent project's preview server

## What We Test

- WASM module loading and execution
- DOM API host functions (document.getElementById, etc.)
- User interactions with the WASM-powered application
- Console output from WASM functions
