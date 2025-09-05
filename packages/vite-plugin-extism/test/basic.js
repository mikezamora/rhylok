// Test the plugin by using it with the rhylok game
const { build } = require('vite')
const path = require('path')

async function testPlugin() {
  console.log('🧪 Testing vite-plugin-extism with rhylok game...')
  
  try {
    // Import the plugin
    const { vitePluginExtism } = require('../dist/index.js')
    
    // Test build with rhylok game
    await build({
      configFile: false,
      root: path.resolve(__dirname, '../../../'), // Root rhylok directory
      plugins: [
        vitePluginExtism({
          entry: 'src/main.ts',
          wasmFileName: 'rhylok-game.wasm',
          outDir: 'dist-plugin-test',
          generatePreview: true,
          manifest: {
            config: {
              gameTitle: 'Rhylok',
              version: '1.0.0'
            }
          },
          hostFunctions: [
            {
              name: 'log',
              inputs: ['ptr'],
              outputs: [],
              description: 'Console logging'
            },
            {
              name: 'playSound',
              inputs: ['ptr', 'f32'],
              outputs: ['i32'],
              description: 'Play audio'
            }
          ]
        })
      ]
    })
    
    console.log('✅ Plugin test completed successfully!')
    
  } catch (error) {
    console.error('❌ Plugin test failed:', error)
    process.exit(1)
  }
}

testPlugin()
