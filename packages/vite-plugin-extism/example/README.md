# Extism Plugin Example

This is a minimal example project demonstrating how to use the `vite-plugin-extism` to convert TypeScript code to WASM using Extism.

## What This Example Does

This example showcases the generic capabilities of the vite-plugin-extism:

1. **DOM Manipulation**: Shows how TypeScript code that manipulates the DOM gets transpiled to WASM with host function bindings
2. **Event Handling**: Demonstrates button clicks and input processing through WASM
3. **Console Logging**: Shows how `console.log` calls are bridged to the browser console
4. **Text Processing**: Simple string manipulation that runs in WASM

## Features Demonstrated

- ✅ `document.getElementById()` - DOM element access
- ✅ `addEventListener()` - Event handling
- ✅ `textContent` manipulation - DOM updates
- ✅ `console.log()` - Console output from WASM
- ✅ Function exports - Making TypeScript functions available in WASM
- ✅ Generic project support - No hardcoded game logic

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the WASM plugin:**
   ```bash
   npm run build
   ```
   This will create:
   - `dist/example.wasm` - The compiled WASM module
   - `dist/manifest.json` - Extism manifest
   - `dist/index.html` - WASM-enabled preview

3. **Serve the WASM version:**
   ```bash
   # Serve the WASM build
   npm run preview-wasm
   # Opens on http://localhost:3001
   ```

   Or manually:
   ```bash
   npx serve dist -p 3001
   ```

4. **Or run the regular TypeScript version:**
   ```bash
   npm run dev
   # Open http://localhost:5173
   ```

## Project Structure

```
example/
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite config with extism plugin
├── tsconfig.json         # TypeScript configuration
├── index.html            # Main HTML file
├── src/
│   ├── main.ts          # TypeScript code (converted to WASM)
│   └── style.css        # Styles
└── dist/                # Generated WASM output
    ├── example.wasm     # Compiled WASM module
    ├── manifest.json    # Extism manifest
    └── index.html       # WASM-enabled preview
```

## How It Works

1. **TypeScript Source**: The `src/main.ts` file contains regular TypeScript code with DOM manipulation
2. **Plugin Analysis**: The vite-plugin-extism analyzes the code and detects DOM API usage
3. **WASM Generation**: Creates AssemblyScript bindings and compiles to WASM with Extism PDK
4. **Host Functions**: Generates host functions to bridge WASM calls back to the browser DOM
5. **Preview**: Creates a preview HTML that loads the WASM module and connects it to the original UI

## Testing the Plugin

Compare the behavior between:
- **Regular TypeScript** (`npm run dev`) - Direct DOM manipulation
- **WASM Version** (`npx serve dist`) - Same functionality through WASM with host functions

Both should work identically, proving the plugin successfully transpiled TypeScript to WASM!

## Configuration

The plugin is configured in `vite.config.ts`:

```typescript
import extismPlugin from '../dist/index.js'

export default defineConfig({
  plugins: [
    extismPlugin({
      entry: 'main.ts',           // Entry file to convert
      outDir: 'dist-wasm',        // Output directory
      wasmFileName: 'example.wasm', // WASM file name
      generatePreview: true       // Generate preview HTML
    })
  ]
})
```

This example proves that the vite-plugin-extism is truly generic and can work with any TypeScript project, not just the Rhylok rhythm game!
