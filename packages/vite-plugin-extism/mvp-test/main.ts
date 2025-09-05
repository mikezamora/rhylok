// Working Extism AssemblyScript module 
import { Host } from "@extism/as-pdk"

// Export a simple hello function that outputs to console
export function hello(): i32 {
  Host.outputString("Hello from AssemblyScript WASM module!")
  return 0
}

// Export a simple greet function that takes input and outputs greeting
export function greet(): i32 {
  const name = Host.inputString()
  const message = "Hello, " + name + "!"
  Host.outputString(message)
  return 0
}

// Export a simple test function 
export function test(): i32 {
  Host.outputString("Test function called - WASM is working!")
  return 0
}
