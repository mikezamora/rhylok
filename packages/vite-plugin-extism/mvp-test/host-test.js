#!/usr/bin/env node

// Host implementation for testing WASM with host functions
import { createPlugin } from '@extism/extism'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function runWithHostFunctions() {
  console.log('🚀 Starting WASM test with host functions...\n')

  try {
    // Read the WASM file
    const wasmPath = join(__dirname, 'dist', 'main.wasm')
    const wasmBytes = readFileSync(wasmPath)
    console.log('✅ WASM loaded:', wasmBytes.length, 'bytes')
    
    // Define host functions using the proper Extism format
    const hostFunctions = {
      'extism:host/user': {
        get_time: () => {
          const timestamp = BigInt(Date.now())
          console.log('📅 Host function called: get_time() ->', timestamp.toString())
          return timestamp
        },
        
        log_message: (callContext, offset) => {
          try {
            // Try to read the string from WASM memory
            let message = ''
            let i = 0
            while (i < 100) { // Safety limit
              const byte = callContext.load_u8(offset + i)
              if (byte === 0) break
              message += String.fromCharCode(byte)
              i++
            }
            console.log('📝 Host function called: log_message() with offset:', offset)
            console.log('   📋 Log:', message || 'Message received from WASM!')
          } catch (error) {
            console.log('📝 Host function called: log_message() with offset:', offset)
            console.log('   📋 Log: [Default message - could not read from memory]')
          }
          return 0
        },
        
        add_numbers: (callContext, a, b) => {
          const result = Number(a) + Number(b)
          console.log(`🧮 Host function called: add_numbers(${a}, ${b}) -> ${result}`)
          return result
        }
      }
    }

    // Create the manifest for the plugin
    const manifest = {
      wasm: [{ data: wasmBytes }],
      memory: { max_pages: 20 },
      config: {}
    }

    // Create plugin with host functions
    const plugin = await createPlugin(manifest, {
      useWasi: false,
      functions: hostFunctions
    })
    console.log('✅ Plugin created with host functions')

    console.log('\n' + '='.repeat(50))
    console.log('Testing hello_with_time() with host functions:')
    console.log('='.repeat(50))
    const helloResult = await plugin.call('hello_with_time')
    const helloOutput = helloResult ? new TextDecoder().decode(helloResult) : '(no output)'
    console.log('WASM Output:', helloOutput)

    console.log('\n' + '='.repeat(50))
    console.log('Testing test_host_functions():')
    console.log('='.repeat(50))
    const testResult = await plugin.call('test_host_functions')
    const testOutput = testResult ? new TextDecoder().decode(testResult) : '(no output)'
    console.log('WASM Output:', testOutput)

    console.log('\n✅ Host function test completed successfully!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Stack:', error.stack)
  }
}

// Run the test
runWithHostFunctions()
