import { defineConfig } from 'vite'
import { vitePluginExtism } from './vite-plugin-extism'

export default defineConfig({
  plugins: [
    vitePluginExtism({
      // Entry point for your WASM module (relative to src/)
      entry: 'main-wasm.ts',
      
      // Output directory for WASM and manifest
      outDir: 'dist-extism',
      
      // Generated file names
      wasmFileName: 'rhylok-game.wasm',
      manifestFileName: 'manifest.json',
      
      // Extism manifest configuration
      manifest: {
        // Configuration passed to the plugin at runtime
        config: {
          debug: false,
          maxPlayers: 4,
          gameVersion: '1.0.0'
        },
        
        // Memory limits for the WASM module
        memory: {
          max_pages: 256, // 16MB (64KB per page)
          max_var_bytes: 1024 * 1024 // 1MB for variables
        },
        
        // Timeout for plugin execution (in milliseconds)
        timeout_ms: 5000,
        
        // Allowed external hosts (if your plugin makes HTTP requests)
        allowed_hosts: []
      },
      
      // AssemblyScript compiler options
      assemblyscriptOptions: {
        debug: false,
        optimizeLevel: 3, // Maximum optimization
        runtime: 'minimal', // Minimal runtime for smaller WASM size
        flags: [
          '--exportTable',
          '--memoryBase=0'
        ]
      },
      
      // Host functions that will be available to your WASM plugin
      hostFunctions: [
        {
          name: 'log',
          inputs: ['ptr'], // string pointer
          outputs: [],
          description: 'Log a message to the host console'
        },
        {
          name: 'playSound',
          inputs: ['ptr', 'f32'], // sound name pointer, volume
          outputs: ['i32'], // success status
          description: 'Play a sound file from the host'
        },
        {
          name: 'getTime',
          inputs: [],
          outputs: ['f64'], // timestamp
          description: 'Get current timestamp from host'
        },
        {
          name: 'httpRequest',
          inputs: ['ptr', 'ptr'], // method pointer, url pointer
          outputs: ['ptr'], // response pointer
          description: 'Make HTTP request via host'
        }
      ],
      
      // Optional: Custom code transformation before compilation
      transform: async (code, bundle) => {
        // You can modify the bundled code here before it gets compiled to WASM
        // For example, remove browser-specific APIs that won't work in WASM
        let transformed = code
        
        // Remove DOM APIs
        transformed = transformed.replace(/document\./g, '// document.')
        transformed = transformed.replace(/window\./g, '// window.')
        
        // Replace Web Audio API calls with host function calls
        transformed = transformed.replace(
          /audioContext\.(.*?)\(/g, 
          'hostAudioCall("$1", '
        )
        
        return transformed
      }
    })
  ],
  
  // Vite build configuration for WASM
  build: {
    // Ensure we're building a simple bundle for WASM conversion
    target: 'es2020',
    outDir: 'temp-build',
    rollupOptions: {
      input: 'src/main-wasm.ts',
      output: {
        format: 'es',
        entryFileNames: 'wasm-entry.js'
      }
    },
    minify: false // Keep code readable for transformation
  }
})
