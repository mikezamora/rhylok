# Vite Plugin Extism Architecture

## Overview

The `vite-plugin-extism` is a comprehensive Vite plugin that automatically transpiles TypeScript code to AssemblyScript and compiles it to WebAssembly (WASM) using the Extism framework. It provides seamless DOM API host function injection, enabling TypeScript developers to write code that runs in both browser environments and WASM sandboxes.

## Architecture Layers

### 1. Plugin Integration Layer
**File**: `src/index.ts` (lines 1-150)
**Purpose**: Integrates with Vite's build pipeline

```typescript
// Core plugin function
export default function extismPlugin(options: ExtismPluginOptions = {}): Plugin
```

**Key Responsibilities**:
- Hooks into Vite's `generateBundle` phase
- Manages build configuration and output directories
- Coordinates the transpilation pipeline
- Generates preview HTML files for testing

**Configuration Options**:
- `entry`: Entry point for WASM module (default: 'main.ts')
- `outDir`: Output directory for WASM and manifest files
- `wasmFileName`: Name of generated WASM file (default: 'plugin.wasm')
- `manifestFileName`: Extism manifest file name (default: 'manifest.json')
- `generatePreview`: Whether to generate preview HTML (default: true)
- `assemblyscriptOptions`: AssemblyScript compiler configuration

### 2. Code Analysis Layer
**File**: `src/index.ts` (lines 403-471)
**Function**: `analyzeTypeScriptCode(code: string): CodeAnalysis`

**Purpose**: Analyzes TypeScript source code to detect DOM APIs and extract code structure

```typescript
interface CodeAnalysis {
  functions: Array<{name: string, params: string[], returnType: string, body: string}>
  variables: Array<{name: string, type?: string, value?: string}>
  domAPIs: Set<string>
  eventHandlers: string[]
  imports: string[]
  exports: string[]
}
```

**Detection Patterns**:
- `document.getElementById()`, `document.querySelector()`, `document.createElement()`
- `.addEventListener()`, `.textContent =`, `.innerHTML =`, `.value`, `.style.`
- `window.`, `console.log()`, `fetch()`, `localStorage.`, `sessionStorage.`

**Analysis Process**:
1. Regex pattern matching for DOM API usage
2. Function declaration extraction with parameters and return types
3. Variable declaration parsing with type annotations
4. Import/export statement detection

### 3. Transpilation Layer
**File**: `src/index.ts` (lines 715-900)
**Function**: `transpileToAssemblyScript(code: string, analysis: CodeAnalysis, configRoot: string)`

**Purpose**: Converts TypeScript code to AssemblyScript using template-based generation

**Process Flow**:
1. **Function Extraction**: `extractAndTranspileFunctions(code)` converts TS functions to AS
2. **Initialization Code**: `createInitializationFromCode(code, analysis)` handles top-level statements
3. **Template Loading**: Loads `templates/wasm-entry.as.template`
4. **DOM Binding Generation**: `generateDOMBindings(analysis.domAPIs)` creates host function wrappers
5. **Template Substitution**: Replaces template variables with generated code

**Type Conversion Rules**:
- `string` → `string` (native AS support)
- `number` → `i32`, `i64`, `f32`, or `f64` based on usage
- `boolean` → `bool`
- `void` → `void`
- DOM elements → `ElementHandle` class

### 4. Template System
**File**: `templates/wasm-entry.as.template`

**Purpose**: Provides the basic AssemblyScript structure with placeholders for generated code

**Template Variables**:
- `{{DOM_BINDINGS}}`: Generated DOM API wrapper functions
- `{{INIT_CODE}}`: Transpiled initialization code from top-level statements
- `{{EXTRACTED_FUNCTIONS}}`: Converted TypeScript functions
- `{{EXPORTED_FUNCTIONS}}`: Generated test/export functions

**Template Structure**:
```assemblyscript
// Generated Extism AssemblyScript module with DOM bindings
import { Host, Config, Var, Memory } from '@extism/as-pdk'

// Required abort function for AssemblyScript/Extism
function myAbort(message: string | null, fileName: string | null, lineNumber: u32, columnNumber: u32): void

{{DOM_BINDINGS}}

export function main(): i32 {
{{INIT_CODE}}
  return 0
}

{{EXTRACTED_FUNCTIONS}}
{{EXPORTED_FUNCTIONS}}
```

### 5. Host Function Injection Layer
**File**: `src/index.ts` (lines 472-714)
**Function**: `generateDOMBindings(domAPIs: Set<string>): DOMBindings`

**Purpose**: Automatically generates host function bindings for detected DOM APIs

**Binding Generation Process**:
1. **Pattern Detection**: Analyzes detected DOM API patterns
2. **External Declarations**: Creates `@external` function declarations
3. **Wrapper Functions**: Generates high-level AssemblyScript functions
4. **Export Functions**: Creates test functions for validation
5. **Host Function Metadata**: Defines expected host function signatures

**Example Generated Binding**:
```assemblyscript
// DOM element access using external host functions
@external("extism:host/env", "dom_get_element_by_id")
declare function dom_get_element_by_id(idOffset: u32): i32

function getElementById(id: string): ElementHandle | null {
  const idMem = Memory.allocateString(id)
  const result = dom_get_element_by_id(u32(idMem.offset))
  if (result > 0) {
    return new ElementHandle(id)
  }
  return null
}
```

**Supported DOM APIs**:
- **Element Access**: `getElementById()`, `querySelector()`, `createElement()`
- **Content Manipulation**: `textContent`, `innerHTML`, `value`
- **Event Handling**: `addEventListener()`
- **Network**: `fetch()`
- **Logging**: `console.log()`

### 6. Memory Management Layer
**Integration**: Extism PDK Memory API

**Purpose**: Handles string and data passing between TypeScript host and AssemblyScript WASM

**Key Components**:
```assemblyscript
import { Memory } from '@extism/as-pdk'

// String allocation for host function calls
const mem = Memory.allocateString(message)
console_log(mem.offset, mem.length)
```

**Memory Operations**:
- `Memory.allocateString(data)`: Allocates string in WASM memory
- `Memory.allocateBytes(data)`: Allocates byte array in WASM memory
- `mem.offset`: Gets memory pointer for host function calls
- `mem.length`: Gets data length for host function calls
- `mem.toString()`: Converts memory block back to string
- `mem.free()`: Deallocates memory (automatic in Extism)

**String Passing Protocol**:
1. **WASM → Host**: Use `Memory.allocateString()` + pass `offset` and `length`
2. **Host → WASM**: Host allocates via Extism SDK, passes memory pointers
3. **Host Reading**: Use `callContext.read(pointer).text()` to decode strings

### 7. Build Pipeline Layer

**Build Process**:
1. **Vite Integration**: Plugin hooks into `generateBundle` phase
2. **Code Analysis**: Detect DOM APIs and extract code structure
3. **Transpilation**: Convert TypeScript to AssemblyScript using templates
4. **WASM Compilation**: Use AssemblyScript compiler (`asc`) to generate WASM
5. **Manifest Generation**: Create Extism manifest with WASM file reference
6. **Preview Generation**: Create HTML preview file for testing

**Build Commands**:
```json
{
  "build": "npm run clean && asc main.ts --outFile dist/main.wasm --use abort=main/myAbort",
  "clean": "rm -rf dist && mkdir -p dist"
}
```

**AssemblyScript Compiler Options**:
- `--outFile`: Specify output WASM file path
- `--use abort=main/myAbort`: Use custom abort function
- Debug/optimization flags configurable via plugin options

### 8. Runtime Execution Layer

**Host Environment**: Node.js/Browser with Extism SDK
**WASM Runtime**: Extism plugin execution

**Host Function Implementation Example**:
```typescript
const hostFunctions = {
  'extism:host/user': {
    console_log: (callContext: CallContext, messagePtr: bigint, messageLen: bigint): void => {
      const memory = callContext.read(messagePtr)
      if (memory) {
        console.log('🖥️  WASM console.log:', memory.text())
      }
    },
    
    get_time: (): bigint => {
      return BigInt(Date.now())
    }
  }
}

const plugin = await createPlugin(manifest, {
  useWasi: false,
  functions: hostFunctions
})

const result = await plugin.call('test_host_functions')
```

**Execution Flow**:
1. **Plugin Creation**: Load WASM via Extism with host functions
2. **Function Calls**: Call exported WASM functions with input data
3. **Host Function Invocation**: WASM calls host functions via `@external` declarations
4. **Memory Management**: Host reads/writes WASM memory using Extism SDK
5. **Result Processing**: Process WASM output and return to caller

## Data Flow Architecture

```
TypeScript Source
       ↓
[Code Analysis Layer] → DOM API Detection
       ↓
[Transpilation Layer] → AssemblyScript Generation
       ↓
[Template System] → Code Assembly
       ↓
[Host Function Injection] → Binding Generation
       ↓
[Build Pipeline] → WASM Compilation
       ↓
[Runtime Execution] → Plugin Execution
       ↓
Host Function Calls ↔ Memory Management
```

## Working MVP Analysis

**Current Working Components**:
1. ✅ **String Passing**: Memory.allocateString() + pointer/length protocol works correctly
2. ✅ **Host Functions**: External function declarations and host implementations working
3. ✅ **Build Pipeline**: AssemblyScript compilation with custom abort function successful
4. ✅ **Extism Integration**: Plugin creation and function calls working
5. ✅ **Memory Management**: CallContext.read() and text() decoding working

**Key Success Factors**:
- Proper `@external` function declarations with correct namespaces
- Correct memory allocation using Extism PDK Memory API
- Host function signatures matching WASM expectations
- Proper string encoding/decoding between host and WASM

## Potential Issues and Solutions

### Issue 1: Memory Leaks
**Problem**: Manual memory allocation without proper cleanup
**Solution**: Extism handles automatic memory management, but consider explicit `mem.free()` calls for large data

### Issue 2: Type Conversion Errors
**Problem**: TypeScript types not mapping correctly to AssemblyScript
**Solution**: Enhance type conversion in `convertTypeToAssemblyScript()` function

### Issue 3: DOM API Coverage
**Problem**: Limited set of DOM APIs currently supported
**Solution**: Extend `generateDOMBindings()` with additional DOM patterns and implementations

### Issue 4: Error Handling
**Problem**: Limited error propagation from WASM to host
**Solution**: Implement proper error handling with custom error types and error code returns

## Extension Points

1. **Custom Transformations**: Plugin supports custom `transform` function for specialized conversions
2. **Additional Host Functions**: Easy to add new host function categories beyond DOM APIs
3. **Template Customization**: Templates can be modified for different WASM framework targets
4. **Build Integration**: Can be extended to work with other build tools beyond Vite

## Performance Considerations

1. **Code Analysis**: Regex-based parsing may be slow for large files; consider AST-based parsing
2. **Memory Allocation**: Frequent string allocations may impact performance; consider string pooling
3. **Host Function Calls**: Cross-boundary calls have overhead; batch operations when possible
4. **WASM Size**: Generated code may be large; consider dead code elimination

## Best Practices

1. **Host Function Design**: Keep host functions simple and focused on single operations
2. **Memory Management**: Use Memory API consistently for all string operations
3. **Error Handling**: Always check return values from host functions
4. **Testing**: Use generated preview HTML for integration testing
5. **Type Safety**: Leverage TypeScript types for better development experience

This architecture provides a solid foundation for TypeScript to AssemblyScript transpilation with automatic DOM host function injection, enabling seamless development of WASM plugins from familiar TypeScript code.
