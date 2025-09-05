# Vite Plugin Extism

A Vite plugin that compiles your TypeScript/JavaScript source files into an Extism WebAssembly (WASM) plugin instead of creating a traditional dist folder.

## Features

- 🚀 **Seamless Integration**: Works with Vite's existing build pipeline
- 🔧 **TypeScript Support**: Compiles TypeScript to WASM using AssemblyScript
- 📦 **Dependency Resolution**: Leverages Vite's module resolution and bundling
- 🔌 **Host Functions**: Define host functions for WASM-host communication
- ⚡ **Extism Ready**: Generates Extism-compatible WASM modules and manifests
- 🎯 **Configurable**: Extensive configuration options for compilation and optimization

## Installation

```bash
npm install --save-dev @types/node assemblyscript
```

## Quick Start

1. **Create a Vite config for Extism compilation**:

```typescript
// vite.config.extism.ts
import { defineConfig } from 'vite'
import { vitePluginExtism } from './vite-plugin-extism'

export default defineConfig({
  plugins: [
    vitePluginExtism({
      entry: 'main-wasm.ts', // Your WASM entry point
      outDir: 'dist-extism',
      wasmFileName: 'my-plugin.wasm',
      
      // Define host functions available to your WASM module
      hostFunctions: [
        {
          name: 'log',
          inputs: ['ptr'],
          outputs: [],
          description: 'Log messages to host console'
        }
      ]
    })
  ]
})
```

2. **Create a WASM-compatible entry point**:

```typescript
// src/main-wasm.ts
declare function log(message: string): void

export function greet(name: string): string {
  log(`Hello from WASM: ${name}`)
  return `Hello, ${name}!`
}

export function add(a: i32, b: i32): i32 {
  return a + b
}
```

3. **Build your WASM plugin**:

```bash
npx vite build --config vite.config.extism.ts
```

This will generate:
- `dist-extism/my-plugin.wasm` - Your compiled WASM module
- `dist-extism/manifest.json` - Extism manifest file

## Configuration Options

### `ExtismPluginOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entry` | `string` | `'main.ts'` | Entry point file (relative to src/) |
| `outDir` | `string` | `'dist-extism'` | Output directory |
| `wasmFileName` | `string` | `'plugin.wasm'` | Generated WASM file name |
| `manifestFileName` | `string` | `'manifest.json'` | Generated manifest file name |
| `manifest` | `object` | `{}` | Extism manifest configuration |
| `assemblyscriptOptions` | `object` | `{}` | AssemblyScript compiler options |
| `hostFunctions` | `array` | `[]` | Host function definitions |
| `transform` | `function` | `undefined` | Custom code transformation |

### Manifest Configuration

```typescript
manifest: {
  config: {
    // Runtime configuration for your plugin
    debug: false,
    maxIterations: 1000
  },
  memory: {
    max_pages: 256,     // 16MB (64KB per page)
    max_var_bytes: 1024 * 1024  // 1MB
  },
  timeout_ms: 5000,
  allowed_hosts: ['api.example.com']
}
```

### AssemblyScript Options

```typescript
assemblyscriptOptions: {
  debug: false,
  optimizeLevel: 3,      // 0-3, higher = more optimization
  runtime: 'minimal',    // 'incremental' | 'minimal' | 'stub'
  flags: [
    '--exportTable',
    '--memoryBase=0'
  ]
}
```

### Host Functions

Define functions that your WASM module can call:

```typescript
hostFunctions: [
  {
    name: 'log',
    inputs: ['ptr'],     // string pointer
    outputs: [],
    description: 'Log to host console'
  },
  {
    name: 'httpGet',
    inputs: ['ptr'],     // URL string pointer
    outputs: ['ptr'],    // Response string pointer
    description: 'Make HTTP GET request'
  },
  {
    name: 'playSound',
    inputs: ['ptr', 'f32'], // file path, volume
    outputs: ['i32'],       // success status
    description: 'Play audio file'
  }
]
```

## Type Reference

### AssemblyScript Types

When writing WASM-compatible code, use these types:

| JavaScript | AssemblyScript | Description |
|------------|---------------|-------------|
| `number` | `i32` | 32-bit integer |
| `number` | `i64` | 64-bit integer |
| `number` | `f32` | 32-bit float |
| `number` | `f64` | 64-bit float |
| `boolean` | `bool` | Boolean |
| `string` | `string` | String |
| `Array<T>` | `StaticArray<T>` | Fixed-size array |

### Example Game Plugin

```typescript
// src/game-wasm.ts
declare function log(message: string): void
declare function playSound(file: string, volume: f32): i32
declare function getTime(): f64

interface GameState {
  score: i32
  level: i32
  isActive: bool
}

let gameState: GameState = {
  score: 0,
  level: 1,
  isActive: false
}

export function initGame(): void {
  log("Game initialized")
  gameState.score = 0
  gameState.level = 1
  gameState.isActive = true
  playSound("start.wav", 0.8)
}

export function updateScore(points: i32): void {
  gameState.score += points
  log(\`Score updated: \${gameState.score}\`)
  
  if (gameState.score > gameState.level * 1000) {
    gameState.level++
    playSound("levelup.wav", 1.0)
  }
}

export function getScore(): i32 {
  return gameState.score
}

export function getGameState(): string {
  return \`{"score": \${gameState.score}, "level": \${gameState.level}}\`
}
```

## Using the Generated Plugin

Once compiled, you can use your WASM plugin with Extism:

### Node.js (Host Application)

```javascript
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Plugin } = require('@extism/extism')
const fs = require('fs')

// Load the generated plugin
const manifest = JSON.parse(fs.readFileSync('dist-extism/manifest.json'))
const plugin = new Plugin(manifest, {
  // Host function implementations
  log: (message) => {
    console.log('WASM Log:', message)
  },
  playSound: (file, volume) => {
    console.log(\`Playing: \${file} at volume \${volume}\`)
    return 1 // success
  },
  getTime: () => {
    return Date.now()
  }
})

// Call plugin functions
plugin.call('initGame')
plugin.call('updateScore', 100)
const score = plugin.call('getScore')
console.log('Current score:', score)
```

### Browser (with Extism Web)

```html
<script type="module">
import { createPlugin } from '@extism/extism-web'

const response = await fetch('dist-extism/my-plugin.wasm')
const wasmBytes = await response.arrayBuffer()

const plugin = await createPlugin(
  { wasm: [{ data: wasmBytes }] },
  {
    // Host functions
    log: (message) => console.log('WASM:', message),
    playSound: (file, volume) => {
      // Implement audio playback
      return 1
    }
  }
)

// Use the plugin
plugin.call('initGame')
const result = plugin.call('getGameState')
console.log('Game state:', result)
</script>
```

## Advanced Usage

### Custom Code Transformation

Transform your bundled code before WASM compilation:

```typescript
vitePluginExtism({
  transform: async (code, bundle) => {
    // Remove browser-specific APIs
    let transformed = code
      .replace(/document\./g, '// document.')
      .replace(/window\./g, '// window.')
    
    // Replace Web APIs with host function calls
    transformed = transformed.replace(
      /fetch\((.*?)\)/g,
      'hostHttpRequest($1)'
    )
    
    return transformed
  }
})
```

### Multiple Build Targets

Create different configs for different WASM modules:

```typescript
// vite.config.game.ts - Game logic WASM
export default defineConfig({
  plugins: [
    vitePluginExtism({
      entry: 'game/index.ts',
      outDir: 'dist-game',
      wasmFileName: 'game-engine.wasm'
    })
  ]
})

// vite.config.audio.ts - Audio processing WASM  
export default defineConfig({
  plugins: [
    vitePluginExtism({
      entry: 'audio/processor.ts',
      outDir: 'dist-audio',
      wasmFileName: 'audio-processor.wasm'
    })
  ]
})
```

## Troubleshooting

### Common Issues

1. **AssemblyScript compilation errors**: Ensure your code uses AssemblyScript-compatible syntax
2. **Missing host functions**: Declare all host functions you plan to use
3. **Memory issues**: Adjust `memory.max_pages` in manifest configuration
4. **Type errors**: Use AssemblyScript types (`i32`, `f32`, etc.) instead of TypeScript types

### Debug Mode

Enable debug mode for better error messages:

```typescript
assemblyscriptOptions: {
  debug: true,
  optimizeLevel: 0
}
```

## Examples

See the `/examples` directory for complete working examples:

- `examples/rhythm-game/` - Complete rhythm game WASM plugin
- `examples/calculator/` - Simple math operations plugin  
- `examples/text-processor/` - String manipulation utilities

## License

MIT
