#!/usr/bin/env tsx

// Host implementation for testing WASM with host functions
import { createPlugin, CallContext } from '@extism/extism'
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
        get_time: (): bigint => {
          const timestamp = BigInt(Date.now())
          console.log('📅 Host function called: get_time() ->', timestamp.toString())
          return timestamp
        },
        
        add_numbers: (callContext: CallContext, a: number, b: number): number => {
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
    const helloOutput = helloResult ? new TextDecoder().decode(helloResult.bytes()) : '(no output)'
    console.log('WASM Output:', helloOutput)

    console.log('\n' + '='.repeat(50))
    console.log('Testing test_host_functions():')
    console.log('='.repeat(50))
    const testResult = await plugin.call('test_host_functions')
    const testOutput = testResult ? new TextDecoder().decode(testResult.bytes()) : '(no output)'
    console.log('WASM Output:', testOutput)

    console.log('\n✅ Host function test completed successfully!')
    
  } catch (error) {
    console.error('❌ Error:', (error as Error).message)
    console.error('Stack:', (error as Error).stack)
  }
}

// Run the test
runWithHostFunctions()
