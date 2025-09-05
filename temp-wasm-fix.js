// Backup of the correct debugging logic for temp-wasm directory

// Variables for debugging
let analysisResults = null
let transformResults = null

// Apply custom transform if provided
if (options.transform) {
  wasmCode = await options.transform(wasmCode, bundle)
} else {
  // Default transformation to make code AssemblyScript compatible
  const analysis = analyzeTypeScriptCode(wasmCode)
  const transformResult = await transpileToAssemblyScript(wasmCode, analysis, config.root)
  wasmCode = transformResult.assemblyScriptCode
  
  // Add detected DOM host functions to the manifest
  if (transformResult.detectedHostFunctions.length > 0) {
    console.log('🔍 Detected ' + transformResult.detectedHostFunctions.length + ' DOM APIs, adding host functions')
    hostFunctions.push(...transformResult.detectedHostFunctions)
  }
  
  // Store variables for debugging
  analysisResults = analysis
  transformResults = transformResult
}

// Ensure output directory exists
const fullOutDir = path.resolve(config.root, resolvedOutDir)
await fs.mkdir(fullOutDir, { recursive: true })

// Create temp-wasm directory for debugging intermediate steps
const tempWasmDir = path.resolve(config.root, 'temp-wasm')
await fs.mkdir(tempWasmDir, { recursive: true })

// Create temporary AssemblyScript file in both locations
const tempAsFile = path.join(fullOutDir, 'temp.ts') // Use .ts extension for AssemblyScript
const debugAsFile = path.join(tempWasmDir, 'generated.as')

await fs.writeFile(tempAsFile, wasmCode)
await fs.writeFile(debugAsFile, wasmCode)

console.log('📝 Generated AssemblyScript file: ' + tempAsFile)
console.log('🔍 Debug AssemblyScript saved to: ' + debugAsFile)

// Save original TypeScript for comparison (get from entry chunk or file)
const originalTsFile = path.join(tempWasmDir, 'original.ts')
const originalCode = entryChunk ? entryChunk.code : wasmCode
await fs.writeFile(originalTsFile, originalCode)
console.log('📄 Original TypeScript saved to: ' + originalTsFile)

// Save analysis results if available
if (analysisResults && transformResults) {
  const analysisFile = path.join(tempWasmDir, 'analysis.json')
  await fs.writeFile(analysisFile, JSON.stringify({
    domAPIs: Array.from(analysisResults.domAPIs),
    functions: analysisResults.functions,
    variables: analysisResults.variables,
    detectedHostFunctions: transformResults.detectedHostFunctions
  }, null, 2))
  console.log('📊 Code analysis saved to: ' + analysisFile)
}

// Generate host function declarations if needed
if (hostFunctions.length > 0) {
  const hostDeclarations = generateHostFunctionDeclarations(hostFunctions)
  const hostDeclFile = path.join(tempWasmDir, 'host-declarations.ts')
  await fs.writeFile(hostDeclFile, hostDeclarations)
  console.log('🔧 Host function declarations saved to: ' + hostDeclFile)
}

// Compile with Extism AssemblyScript PDK
const wasmPath = path.join(fullOutDir, wasmFileName)
await compileWithExtismPDK(tempAsFile, wasmPath, assemblyscriptOptions)
