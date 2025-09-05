# Extism AssemblyScript MVP Test

A minimal working example of an AssemblyScript module that works with the Extism CLI.

## Files

- `main.ts` - The AssemblyScript source code with console logging functions
- `main.wasm` - The compiled WebAssembly module 
- `package.json` - Dependencies and build scripts
- `manifest.json` - Extism manifest file (optional)

## Requirements

- Node.js and npm
- Extism CLI (`extism`)
- AssemblyScript compiler
- Extism AssemblyScript PDK

## Setup

```bash
npm install
```

## Build

```bash
npm run build
```

This compiles `main.ts` to `main.wasm` using the correct flags for Extism compatibility:
```bash
asc main.ts --target release --outFile main.wasm --use abort= --exportRuntime --bindings esm
```

## Test

Test individual functions:
```bash
npm run test          # Test hello function
npm run test-greet    # Test greet function with input
npm run test-all      # Test all functions
```

Or test directly with Extism CLI:
```bash
extism call main.wasm hello
extism call main.wasm greet --input "World"
extism call main.wasm test
```

## Functions

- `hello()` - Outputs "Hello from AssemblyScript WASM module!"
- `greet()` - Takes input string and outputs "Hello, [input]!"
- `test()` - Outputs "Test function called - WASM is working!"

## Key Points

1. Use `@extism/as-pdk` for Host functions like `Host.outputString()` and `Host.inputString()`
2. Compile with `--use abort= --exportRuntime --bindings esm` flags for Extism compatibility
3. Functions should return `i32` (0 for success, non-zero for error)
4. All console output goes through `Host.outputString()` which prints to the Extism CLI

## Success!

✅ AssemblyScript compiles to WASM  
✅ WASM works with Extism CLI  
✅ Console logging works  
✅ Input/output works
