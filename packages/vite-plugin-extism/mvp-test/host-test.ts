#!/usr/bin/env tsx

// Host implementation for testing WASM with host functions
import { createPlugin, CallContext, ManifestLike } from '@extism/extism'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function runWithHostFunctions() {
  console.log('🚀 Starting WASM test with host functions...\n')

  try {
    // Read the manifest file
    const manifestPath = join(__dirname, 'manifest.json')
    const manifestData: ManifestLike = JSON.parse(readFileSync(manifestPath, 'utf8'))
    console.log('✅ Manifest loaded:', manifestPath)
    
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
        },
        
        console_log: (callContext: CallContext, messagePtr: bigint, messageLen: bigint): void => {
          console.log('🔍 Debug: messagePtr =', messagePtr, 'messageLen =', messageLen)
          try {
            // Read from the pointer - the Extism SDK should handle the length automatically
            const memory = callContext.read(messagePtr)
            if (memory) {
              // Try to decode the first messageLen bytes
            //   const allBytes = memory.bytes()
            //   const targetBytes = allBytes.slice(0, Number(messageLen))
            //   const message = new TextDecoder('utf-8').decode(allBytes)
              console.log('🖥️  WASM console.log:', memory.text())
            } else {
              console.log('🖥️  WASM console.log: [Failed to read memory]')
            }
          } catch (error) {
            console.log('🔍 Debug: Error reading memory:', error)
            console.log('🖥️  WASM console.log: [Error reading string]')
          }
        }
      }
    }

    // Create plugin with host functions and enable logging
    const plugin = await createPlugin(manifestData, {
      useWasi: false,
      functions: hostFunctions,
    })
    console.log('✅ Plugin created with host functions and logging enabled')

    console.log('\n' + '='.repeat(50))
    console.log('Testing hello_with_time() with host functions:')
    console.log('='.repeat(50))
    const helloResult = await plugin.call('hello_with_time')
    const helloOutput = helloResult ? new TextDecoder().decode(helloResult.bytes()) : '(no output)'
    console.log('WASM Output:', helloOutput)

    console.log('\n' + '='.repeat(50))
    console.log('Testing test_console_log():')
    console.log('='.repeat(50))
    const consoleResult = await plugin.call('test_console_log')
    const consoleOutput = consoleResult ? new TextDecoder().decode(consoleResult.bytes()) : '(no output)'
    console.log('WASM Output:', consoleOutput)

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
