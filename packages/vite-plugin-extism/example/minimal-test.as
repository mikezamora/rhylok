// Minimal AssemblyScript module for testing - no imports

export function test(): string {
  return "Hello from WASM!"
}

export function add(a: i32, b: i32): i32 {
  return a + b
}
