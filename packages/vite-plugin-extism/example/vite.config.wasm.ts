import { defineConfig } from 'vite'
import extismPlugin from 'vite-plugin-extism'

export default defineConfig({
  plugins: [
    extismPlugin({
      entry: 'main.ts',
      wasmFileName: 'example.wasm',
      generatePreview: true
    })
  ],
  build: {
    outDir: 'dist-wasm'
  }
})
