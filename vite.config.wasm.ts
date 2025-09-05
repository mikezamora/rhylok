import { defineConfig } from 'vite'
import { vitePluginExtism } from './packages/vite-plugin-extism/src/index'

export default defineConfig({
  plugins: [
    vitePluginExtism({
      // Entry point - use the existing main.ts
      entry: 'src/main.ts',
      
      // Output configuration
      outDir: 'dist-wasm',
      wasmFileName: 'rhylok-game.wasm',
      manifestFileName: 'manifest.json',
      
      // Generate preview from existing index.html
      generatePreview: true,
      previewFileName: 'preview.html',
      sourceHtml: 'index.html',
      
      // Extism manifest configuration
      manifest: {
        config: {
          gameTitle: 'Rhylok - Rhythm Game',
          version: '1.0.0',
          debug: false
        },
        memory: {
          max_pages: 256, // 16MB
          max_var_bytes: 1024 * 1024 // 1MB
        },
        timeout_ms: 10000
      },
      
      // AssemblyScript compilation options
      assemblyscriptOptions: {
        debug: false,
        optimizeLevel: 3,
        runtime: 'minimal',
        flags: [
          '--exportTable',
          '--memoryBase=0'
        ]
      },
      
      // Host functions for game integration
      hostFunctions: [
        {
          name: 'log',
          inputs: ['ptr'],
          outputs: [],
          description: 'Console logging from WASM'
        },
        {
          name: 'playSound',
          inputs: ['ptr', 'f32'],
          outputs: ['i32'],
          description: 'Play audio with given name and volume'
        },
        {
          name: 'getTime',
          inputs: [],
          outputs: ['i64'],
          description: 'Get current timestamp'
        },
        {
          name: 'httpRequest',
          inputs: ['ptr', 'ptr'],
          outputs: ['ptr'],
          description: 'Make HTTP request'
        }
      ]
    })
  ]
})
