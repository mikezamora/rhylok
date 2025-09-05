# vite-plugin-extism

A Vite plugin that compiles TypeScript projects to Extism WebAssembly modules.

## Features

- 🎯 **Zero Config**: Works out of the box with sensible defaults
- 🔄 **Hot Reload**: Automatically rebuilds WASM on source changes
- 📦 **Bundle Integration**: Seamlessly integrates with Vite's build pipeline
- 🎮 **Gaming Focus**: Optimized for interactive applications and games
- 🔌 **Host Functions**: Easy host function integration
- 📋 **Manifest Generation**: Automatic Extism manifest creation
- 🎨 **Preview Generation**: Auto-generates preview HTML from existing projects

## Installation

```bash
npm install vite-plugin-extism --save-dev
```

## Basic Usage

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { vitePluginExtism } from 'vite-plugin-extism'

export default defineConfig({
  plugins: [
    vitePluginExtism({
      entry: 'src/main.ts',
      wasmFileName: 'my-plugin.wasm'
    })
  ]
})
```

## Configuration

```typescript
interface ExtismPluginOptions {
  // Entry point for the WASM module
  entry?: string                    // default: 'main.ts'
  
  // Output configuration
  outDir?: string                   // default: 'dist-extism'
  wasmFileName?: string             // default: 'plugin.wasm'
  manifestFileName?: string         // default: 'manifest.json'
  
  // Preview generation
  generatePreview?: boolean         // default: true
  previewFileName?: string          // default: 'preview.html'
  sourceHtml?: string              // default: 'index.html'
  
  // Extism manifest
  manifest?: {
    config?: Record<string, any>
    memory?: { max_pages?: number, max_var_bytes?: number }
    allowed_hosts?: string[]
    timeout_ms?: number
  }
  
  // AssemblyScript options
  assemblyscriptOptions?: {
    debug?: boolean
    optimizeLevel?: number
    runtime?: 'incremental' | 'minimal' | 'stub'
    flags?: string[]
  }
  
  // Host functions
  hostFunctions?: Array<{
    name: string
    inputs: ('i32' | 'i64' | 'f32' | 'f64' | 'ptr')[]
    outputs: ('i32' | 'i64' | 'f32' | 'f64' | 'ptr')[]
    description?: string
  }>
}
```

## Examples

### Game Engine

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    vitePluginExtism({
      entry: 'src/game.ts',
      wasmFileName: 'game-engine.wasm',
      manifest: {
        config: {
          debug: false,
          maxPlayers: 4
        },
        memory: {
          max_pages: 256  // 16MB
        }
      },
      hostFunctions: [
        {
          name: 'playSound',
          inputs: ['ptr', 'f32'],
          outputs: ['i32'],
          description: 'Play audio with given volume'
        },
        {
          name: 'getInput',
          inputs: ['i32'],
          outputs: ['i32'],
          description: 'Get player input state'
        }
      ]
    })
  ]
})
```

### With Preview Generation

The plugin automatically generates a preview HTML file that loads your existing project with WASM:

```typescript
export default defineConfig({
  plugins: [
    vitePluginExtism({
      entry: 'src/wasm-entry.ts',
      generatePreview: true,        // Creates preview.html
      sourceHtml: 'index.html',     // Uses existing HTML as template
      // Preview will include your existing styles and UI
    })
  ]
})
```

## Host Functions

Define host functions that your WASM module can call:

```typescript
// In your Vite config
hostFunctions: [
  {
    name: 'log',
    inputs: ['ptr'],
    outputs: [],
    description: 'Console logging'
  }
]

// In your WASM TypeScript code
declare function log(message: string): void

export function myFunction() {
  log("Hello from WASM!")
}
```

## Generated Files

```
dist-extism/
├── plugin.wasm          # Compiled WebAssembly
├── manifest.json        # Extism plugin manifest
├── plugin.js           # ESM JavaScript bindings
├── plugin.d.ts         # TypeScript definitions
└── preview.html        # Generated preview (if enabled)
```

## Development Workflow

1. **Write** your game/app logic in TypeScript
2. **Configure** the plugin in `vite.config.ts`
3. **Build** with `vite build`
4. **Test** using the generated preview
5. **Deploy** the WASM files

## Advanced Usage

### Custom Transforms

```typescript
vitePluginExtism({
  transform: async (code, bundle) => {
    // Custom code transformation before WASM compilation
    return transformedCode
  }
})
```

### Memory Configuration

```typescript
manifest: {
  memory: {
    max_pages: 512,        // 32MB max memory
    max_var_bytes: 1024*1024  // 1MB for variables
  },
  timeout_ms: 10000       // 10 second timeout
}
```

## License

MIT
