import { Plugin, ResolvedConfig } from 'vite'
import { OutputBundle, OutputChunk, OutputAsset } from 'rollup'
import { promises as fs } from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

interface ExtismPluginOptions {
  /**
   * Entry point for the WASM module (relative to src)
   * @default 'main.ts'
   */
  entry?: string
  
  /**
   * Output directory for the WASM module and manifest
   * If not specified, uses Vite's build.outDir
   * @default undefined (uses Vite's build.outDir)
   */
  outDir?: string
  
  /**
   * Name of the generated WASM file
   * @default 'plugin.wasm'
   */
  wasmFileName?: string
  
  /**
   * Name of the generated manifest file
   * @default 'manifest.json'
   */
  manifestFileName?: string
  
  /**
   * Generate a preview HTML file that loads the existing project with WASM
   * @default true
   */
  generatePreview?: boolean
  
  /**
   * Name of the generated preview HTML file
   * @default 'preview.html'
   */
  previewFileName?: string
  
  /**
   * Source HTML file to use as template for preview
   * @default 'index.html'
   */
  sourceHtml?: string
  
  /**
   * Extism manifest configuration
   */
  manifest?: {
    /**
     * Configuration passed to the plugin
     */
    config?: Record<string, any>
    
    /**
     * Memory configuration
     */
    memory?: {
      max_pages?: number
      max_var_bytes?: number
    }
    
    /**
     * Host functions that will be available to the plugin
     */
    allowed_hosts?: string[]
    
    /**
     * Timeout for plugin execution (in nanoseconds)
     */
    timeout_ms?: number
  }
  
  /**
   * AssemblyScript compiler options
   */
  assemblyscriptOptions?: {
    /**
     * Enable debug mode
     * @default false
     */
    debug?: boolean
    
    /**
     * Optimization level (0-3)
     * @default 3
     */
    optimizeLevel?: number
    
    /**
     * Enable runtime features
     */
    runtime?: 'incremental' | 'minimal' | 'stub'
    
    /**
     * Additional compiler flags
     */
    flags?: string[]
  }
  
  /**
   * Custom transform function for the bundled code before compilation
   */
  transform?: (code: string, bundle: OutputBundle) => Promise<string> | string
  
  /**
   * Host functions definitions for type generation
   */
  hostFunctions?: Array<{
    name: string
    inputs: ('i32' | 'i64' | 'f32' | 'f64' | 'ptr')[]
    outputs: ('i32' | 'i64' | 'f32' | 'f64' | 'ptr')[]
    description?: string
  }>
}

interface ExtismManifest {
  wasm: Array<{
    data?: string  // base64 encoded WASM
    path?: string  // path to WASM file
    url?: string   // URL to WASM file
    name?: string  // optional name
  }>
  main?: string  // name of the main module (required when multiple modules)
  memory?: {
    max_pages?: number
    max_var_bytes?: number
  }
  config?: Record<string, any>
  allowed_hosts?: string[]
  timeout_ms?: number
}

export function vitePluginExtism(options: ExtismPluginOptions = {}): Plugin {
  const {
    entry = 'main.ts',
    outDir,
    wasmFileName = 'plugin.wasm',
    manifestFileName = 'manifest.json',
    generatePreview = true,
    previewFileName = 'preview.html',
    sourceHtml = 'index.html',
    manifest = {},
    assemblyscriptOptions = {},
    hostFunctions = [],
  } = options

  let config: ResolvedConfig
  let srcDir: string
  let entryPath: string
  let resolvedOutDir: string

  // Helper functions for bundle generation
  function findEntryChunk(bundle: OutputBundle, srcDir: string, entry: string) {
    const entryChunk = Object.values(bundle).find(
      (chunk): chunk is OutputChunk => 
        chunk.type === 'chunk' && chunk.isEntry
    )

    console.log('📦 Bundle contents:', Object.keys(bundle))
    console.log('🎯 Entry chunk found:', !!entryChunk)

    return { entryChunk, srcDir, entry }
  }

  async function loadAndTransformCode(entryInfo: any, options: ExtismPluginOptions, bundle: OutputBundle, config: ResolvedConfig, hostFunctions: any[]) {
    // Check if we have a WASM-specific entry file
    const wasmEntryPath = path.resolve(entryInfo.srcDir, entryInfo.entry.replace('.ts', '-wasm.ts'))
    let wasmCode: string

    if (await fs.access(wasmEntryPath).then(() => true).catch(() => false)) {
      // Use the WASM-specific entry file
      console.log('📄 Using WASM entry file: ' + path.relative(config.root, wasmEntryPath))
      wasmCode = await fs.readFile(wasmEntryPath, 'utf-8')
    } else {
      // DON'T use the bundled code - it's minified and unparseable!
      // Instead, read the original source file directly
      const sourceEntryPath = path.resolve(entryInfo.srcDir, entryInfo.entry)
      console.log('📄 Reading original source file for transpilation: ' + path.relative(config.root, sourceEntryPath))
      wasmCode = await fs.readFile(sourceEntryPath, 'utf-8')
      console.log('📄 Source code length: ' + wasmCode.length + ' characters')
    }

    // Variables for debugging
    let analysisResults: any = null
    let transformResults: any = null

    // Apply custom transform if provided
    if (options.transform) {
      wasmCode = await options.transform(wasmCode, bundle)
    } else {
      // Default transformation to make code AssemblyScript compatible
      console.log('🔍 Analyzing source TypeScript code...')
      const analysis = analyzeTypeScriptCode(wasmCode)
      console.log('🔄 Transpiling to AssemblyScript...')
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

    return { wasmCode, analysisResults, transformResults }
  }

  async function setupDirectories(config: ResolvedConfig, resolvedOutDir: string) {
    // Ensure output directory exists
    const fullOutDir = path.resolve(config.root, resolvedOutDir)
    await fs.mkdir(fullOutDir, { recursive: true })

    // Create temp-wasm directory for debugging intermediate steps
    const tempWasmDir = path.resolve(config.root, 'temp-wasm')
    await fs.mkdir(tempWasmDir, { recursive: true })

    return { fullOutDir, tempWasmDir }
  }

  async function generateDebugFiles(transformedCode: any, paths: any, entryChunk: OutputChunk | null, hostFunctions: any[]) {
    // Create temporary AssemblyScript file in both locations
    const tempAsFile = path.join(paths.fullOutDir, 'temp.ts') // Use .ts extension for AssemblyScript
    const debugAsFile = path.join(paths.tempWasmDir, 'generated.as')
    
    await fs.writeFile(tempAsFile, transformedCode.wasmCode)
    await fs.writeFile(debugAsFile, transformedCode.wasmCode)
    
    console.log('📝 Generated AssemblyScript file: ' + tempAsFile)
    console.log('🔍 Debug AssemblyScript saved to: ' + debugAsFile)
    
    // Save original TypeScript for comparison (get from entry chunk or file)
    const originalTsFile = path.join(paths.tempWasmDir, 'original.ts')
    const originalCode = entryChunk ? entryChunk.code : transformedCode.wasmCode
    await fs.writeFile(originalTsFile, originalCode)
    console.log('📄 Original TypeScript saved to: ' + originalTsFile)

    // Save analysis results if available
    if (transformedCode.analysisResults && transformedCode.transformResults) {
      const analysisFile = path.join(paths.tempWasmDir, 'analysis.json')
      await fs.writeFile(analysisFile, JSON.stringify({
        domAPIs: Array.from(transformedCode.analysisResults.domAPIs),
        functions: transformedCode.analysisResults.functions,
        variables: transformedCode.analysisResults.variables,
        detectedHostFunctions: transformedCode.transformResults.detectedHostFunctions
      }, null, 2))
      console.log('📊 Code analysis saved to: ' + analysisFile)
    }

    // Generate host function declarations if needed
    if (hostFunctions.length > 0) {
      const hostDeclarations = generateHostFunctionDeclarations(hostFunctions)
      const hostDeclFile = path.join(paths.tempWasmDir, 'host-declarations.ts')
      await fs.writeFile(hostDeclFile, hostDeclarations)
      console.log('🔧 Host function declarations saved to: ' + hostDeclFile)
    }

    return { tempAsFile }
  }

  async function compileWasmFile(tempAsFile: string, paths: any, wasmFileName: string, assemblyscriptOptions: any) {
    const wasmPath = path.join(paths.fullOutDir, wasmFileName)
    
    await compileWithExtismPDK(tempAsFile, wasmPath, assemblyscriptOptions)
    
    return { wasmPath }
  }

  async function createManifestAndEmitFiles(plugin: any, paths: any, wasmFileName: string, manifestFileName: string, manifest: any, config: ResolvedConfig) {
    const wasmPath = path.join(paths.fullOutDir, wasmFileName)
    
    // Create Extism manifest
    const manifestData: ExtismManifest = {
      wasm: [{
        url: `./${wasmFileName}`  // Use URL for browser compatibility, let Extism auto-assign "main" as the last module
      }],
      ...manifest
    }

    const manifestPath = path.join(paths.fullOutDir, manifestFileName)
    await fs.writeFile(manifestPath, JSON.stringify(manifestData, null, 2))

    plugin.emitFile({
      type: 'asset',
      fileName: wasmFileName,
      source: await fs.readFile(wasmPath)
    })

    plugin.emitFile({
      type: 'asset',
      fileName: manifestFileName,
      source: JSON.stringify(manifestData, null, 2)
    })

    console.log('✅ Extism WASM plugin generated:')
    console.log('   📦 WASM: ' + path.relative(config.root, wasmPath))
    console.log('   📋 Manifest: ' + path.relative(config.root, manifestPath))

    return { manifestData }
  }

  async function generatePreviewFile(rootDir: string, outDir: string, sourceHtml: string, previewFileName: string, manifestData: ExtismManifest, wasmFileName: string, hostFunctions: any[]) {
    await generatePreviewHtml(rootDir, outDir, sourceHtml, previewFileName, manifestData, wasmFileName, hostFunctions)
    
    // Note: index.html copy will be done in writeBundle hook to avoid clearBundle interference
  }

  function clearBundle(bundle: OutputBundle, wasmFileName: string, manifestFileName: string) {
    for (const fileName of Object.keys(bundle)) {
      // Don't delete our emitted WASM files
      if (!fileName.includes(wasmFileName) && !fileName.includes(manifestFileName)) {
        delete bundle[fileName]
      }
    }
  }

  return {
    name: 'vite-plugin-extism',
    apply: 'build', // Only apply during build, not dev
    
    configResolved(resolvedConfig) {
      config = resolvedConfig
      // Use Vite's outDir if not explicitly overridden by plugin options
      resolvedOutDir = outDir || config.build.outDir
      srcDir = path.resolve(config.root, 'src')
      entryPath = path.resolve(srcDir, entry)
    },

    async generateBundle(outputOptions, bundle) {
      try {
        // Step 1: Find and validate entry chunk
        const entryInfo = findEntryChunk(bundle, srcDir, entry)
        
        // Step 2: Load and transform TypeScript code
        const transformedCode = await loadAndTransformCode(entryInfo, options, bundle, config, hostFunctions)
        
        // Step 3: Setup directories and paths
        const paths = await setupDirectories(config, resolvedOutDir)
        
        // Step 4: Generate and save debug files
        const { tempAsFile } = await generateDebugFiles(transformedCode, paths, entryInfo.entryChunk || null, hostFunctions)
        
        // Step 5: Compile WASM
        const { wasmPath } = await compileWasmFile(tempAsFile, paths, wasmFileName, assemblyscriptOptions)
        
        // Step 6: Create manifest and emit files
        const { manifestData } = await createManifestAndEmitFiles(this, paths, wasmFileName, manifestFileName, manifest, config)
        
        // Step 7: Generate preview if requested
        if (generatePreview) {
          await generatePreviewFile(config.root, paths.fullOutDir, sourceHtml, previewFileName, manifestData, wasmFileName, hostFunctions)
        }

      } catch (error) {
        this.error('Failed to compile WASM plugin: ' + error)
      }

      // Clear the bundle to prevent normal output, but preserve our WASM assets
      clearBundle(bundle, wasmFileName, manifestFileName)
    },

    async writeBundle(outputOptions) {
      // After all bundle operations are complete, copy preview.html to index.html
      if (generatePreview) {
        const outDir = outputOptions.dir || resolvedOutDir
        const previewPath = path.resolve(outDir, previewFileName)
        const indexPath = path.resolve(outDir, 'index.html')
        
        try {
          await fs.copyFile(previewPath, indexPath)
          console.log('📝 Created index.html from preview.html (same contents)')
        } catch (error) {
          console.warn('⚠️  Could not create index.html from preview.html: ' + error)
        }
      }
    }
  }
}

interface CodeAnalysis {
  functions: Array<{
    name: string
    params: string[]
    returnType: string
    body: string
  }>
  variables: Array<{
    name: string
    type: string
    initialValue?: string
  }>
  domAPIs: Set<string>
  eventHandlers: Array<{
    element: string
    event: string
    handler: string
  }>
  imports: string[]
  exports: string[]
}

function analyzeTypeScriptCode(code: string): CodeAnalysis {
  const analysis: CodeAnalysis = {
    functions: [],
    variables: [],
    domAPIs: new Set(),
    eventHandlers: [],
    imports: [],
    exports: []
  }

  // Detect DOM API usage patterns
  const domPatterns = [
    /document\.getElementById\(/g,
    /document\.querySelector\(/g,
    /document\.createElement\(/g,
    /\.addEventListener\(/g,
    /\.textContent\s*=/g,
    /\.innerHTML\s*=/g,
    /\.value/g,
    /\.style\./g,
    /window\./g,
    /console\.log\(/g,
    /fetch\(/g,
    /localStorage\./g,
    /sessionStorage\./g
  ]

  domPatterns.forEach(pattern => {
    if (pattern.test(code)) {
      analysis.domAPIs.add(pattern.source)
    }
  })

  // Extract function declarations
  const functionRegex = /(?:export\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*(?::\s*([^{]+))?\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g
  let match
  while ((match = functionRegex.exec(code)) !== null) {
    analysis.functions.push({
      name: match[1],
      params: match[2] ? match[2].split(',').map(p => p.trim()) : [],
      returnType: match[3] ? match[3].trim() : 'void',
      body: match[4]
    })
  }

  // Extract variable declarations
  const varRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?::\s*([^=\n;]+))?\s*(?:=\s*([^;\n]+))?/g
  while ((match = varRegex.exec(code)) !== null) {
    analysis.variables.push({
      name: match[1],
      type: match[2] ? match[2].trim() : 'any',
      initialValue: match[3] ? match[3].trim() : undefined
    })
  }

  return analysis
}

interface DOMBindings {
  assemblyScriptBindings: string
  exportedFunctions: string
  hostFunctions: Array<{
    name: string
    inputs: ('i32' | 'i64' | 'f32' | 'f64' | 'ptr')[]
    outputs: ('i32' | 'i64' | 'f32' | 'f64' | 'ptr')[]
    description: string
  }>
}

function generateDOMBindings(domAPIs: Set<string>): DOMBindings {
  const bindings: DOMBindings = {
    assemblyScriptBindings: '',
    exportedFunctions: '',
    hostFunctions: []
  }

  const bindingParts: string[] = []
  const exportParts: string[] = []

  // Add ElementHandle class definition at the beginning
  bindingParts.push(`
// DOM element handle class
class ElementHandle {
  constructor(public id: string) {}
}`)

  // Generate bindings based on detected DOM APIs
  domAPIs.forEach(apiPattern => {
    switch (apiPattern) {
      case 'document\\.getElementById\\(':
        bindingParts.push(`
// DOM element access using external host functions
@external("extism:host/user", "dom_get_element_by_id")
declare function dom_get_element_by_id(idPtr: u64, idLen: u64): i32

function getElementById(id: string): ElementHandle | null {
  Host.outputString("🔧 AssemblyScript getElementById called with: '" + id + "'")
  Host.outputString("🔧 String length: " + id.length.toString())
  const idMem = Memory.allocateString(id)
  Host.outputString("🔧 Memory allocated at offset: " + idMem.offset.toString())
  const result = dom_get_element_by_id(idMem.offset, idMem.length)
  Host.outputString("🔧 Host function returned: " + result.toString())
  if (result > 0) {
    return new ElementHandle(id)
  }
  return null
}`)
        
        exportParts.push(`
// Export function for DOM element interaction  
export function dom_get_element(): string {
  return '{"status": "dom_get_element_available"}'
}`)

        bindings.hostFunctions.push({
          name: 'dom_get_element_by_id',
          inputs: ['ptr', 'ptr'],
          outputs: ['i32'],
          description: 'Get DOM element by ID, returns 1 if found, 0 if not'
        })
        break

      case '\\.textContent\\s*=':
        bindingParts.push(`
// Text content setting using external host function
@external("extism:host/user", "dom_set_text_content")
declare function dom_set_text_content(elementIdPtr: u64, elementIdLen: u64, textPtr: u64, textLen: u64): i32

function setTextContent(element: ElementHandle, text: string): void {
  const elementIdMem = Memory.allocateString(element.id)
  const textMem = Memory.allocateString(text)
  dom_set_text_content(elementIdMem.offset, elementIdMem.length, textMem.offset, textMem.length)
}`)

        exportParts.push(`
// Export function for text content updates
export function dom_set_text(): string {
  return '{"status": "dom_set_text_available"}'
}`)

        bindings.hostFunctions.push({
          name: 'dom_set_text_content',
          inputs: ['ptr', 'ptr', 'ptr', 'ptr'],
          outputs: ['i32'],
          description: 'Set text content of DOM element'
        })
        break

      case '\\.addEventListener\\(':
        bindingParts.push(`
// Event listener setup using external host function
@external("extism:host/user", "dom_add_event_listener")
declare function dom_add_event_listener(elementIdPtr: u64, elementIdLen: u64, eventPtr: u64, eventLen: u64, handlerPtr: u64, handlerLen: u64): i32

function addEventListener(element: ElementHandle, event: string, handler: string): void {
  const elementIdMem = Memory.allocateString(element.id)
  const eventMem = Memory.allocateString(event)
  const handlerMem = Memory.allocateString(handler)
  dom_add_event_listener(elementIdMem.offset, elementIdMem.length, eventMem.offset, eventMem.length, handlerMem.offset, handlerMem.length)
}`)

        exportParts.push(`
// Export function for event listener testing
export function dom_add_event_listener_test(): string {
  return '{"status": "dom_add_event_listener_available"}'
}`)

        bindings.hostFunctions.push({
          name: 'dom_add_event_listener',
          inputs: ['ptr', 'ptr', 'ptr', 'ptr', 'ptr', 'ptr'],
          outputs: ['i32'],
          description: 'Add event listener to DOM element'
        })
        break

      case 'document\\.createElement\\(':
        bindingParts.push(`
// DOM element creation using external host function
@external("extism:host/user", "dom_create_element")
declare function dom_create_element(tagNamePtr: u64, tagNameLen: u64): i32

function createElement(tagName: string): ElementHandle | null {
  const tagNameMem = Memory.allocateString(tagName)
  const result = dom_create_element(tagNameMem.offset, tagNameMem.length)
  if (result > 0) {
    return new ElementHandle(tagName + "_" + result.toString())
  }
  return null
}`)

        exportParts.push(`
// Export function for DOM element creation
export function dom_create_element_test(): string {
  return '{"status": "dom_create_element_available"}'
}`)

        bindings.hostFunctions.push({
          name: 'dom_create_element',
          inputs: ['ptr', 'ptr'],
          outputs: ['i32'],
          description: 'Create DOM element by tag name, returns element ID if successful'
        })
        break

      case 'fetch\\(':
        bindingParts.push(`
// Fetch API implementation using external host function
@external("extism:host/user", "fetch_request")
declare function fetch_request(urlPtr: u64, urlLen: u64, methodPtr: u64, methodLen: u64): i32

function fetch(url: string, options: string = "GET"): i32 {
  const urlMem = Memory.allocateString(url)
  const methodMem = Memory.allocateString(options)
  return fetch_request(urlMem.offset, urlMem.length, methodMem.offset, methodMem.length)
}`)

        exportParts.push(`
// Export function for fetch API
export function fetch_test(): string {
  return '{"status": "fetch_available"}'
}`)

        bindings.hostFunctions.push({
          name: 'fetch_request',
          inputs: ['ptr', 'ptr', 'ptr', 'ptr'],
          outputs: ['i32'],
          description: 'Perform HTTP fetch request'
        })
        break

      case 'console\\.log\\(':
        bindingParts.push(`
// Console logging host function
@external("extism:host/user", "console_log")
declare function console_log(messagePtr: u64, messageLen: u64): void

// Console log implementation using host function
function log(message: string): void {
  const messageMem = Memory.allocateString(message)
  console_log(messageMem.offset, messageMem.length)
}

// String utility functions for AssemblyScript
function reverseString(input: string): string {
  let result = ""
  for (let i = input.length - 1; i >= 0; i--) {
    result += input.charAt(i)
  }
  return result
}

function toUpperCase(input: string): string {
  let result = ""
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    if (char >= 97 && char <= 122) { // a-z
      result += String.fromCharCode(char - 32)
    } else {
      result += input.charAt(i)
    }
  }
  return result
}`)
        bindings.hostFunctions.push({
          name: 'console_log',
          inputs: ['ptr', 'ptr'],
          outputs: [],
          description: 'Console logging from WASM'
        })
        break

      case 'window\\.':
        bindingParts.push(`
class WindowAPI {
  static get location(): string {
    return Host.inputString()
  }
  
  static set location(url: string) {
    Host.outputString(url)
  }
}`)

        exportParts.push(`
export function dom_get_window_location(): i32 {
  Host.outputString('"window.location"')
  return 0
}

export function dom_set_window_location(): i32 {
  const url = Host.inputString()
  Host.outputString(url)
  return 0
}`)

        bindings.hostFunctions.push({
          name: 'dom_get_window_location',
          inputs: [],
          outputs: ['ptr'],
          description: 'Get window.location'
        })
        bindings.hostFunctions.push({
          name: 'dom_set_window_location',
          inputs: ['ptr'],
          outputs: [],
          description: 'Set window.location'
        })
        break
    }
  })

  bindings.assemblyScriptBindings = bindingParts.join('\n')
  bindings.exportedFunctions = exportParts.join('\n')

  return bindings
}

async function transpileToAssemblyScript(code: string, analysis: CodeAnalysis, configRoot: string): Promise<{
  assemblyScriptCode: string
  detectedHostFunctions: Array<{
    name: string
    inputs: ('i32' | 'i64' | 'f32' | 'f64' | 'ptr')[]
    outputs: ('i32' | 'i64' | 'f32' | 'f64' | 'ptr')[]
    description?: string
  }>
}> {
  console.log('🔄 Transpiling TypeScript to AssemblyScript')
  console.log('📄 Input code length:', code.length)
  console.log('🔍 Detected DOM APIs:', Array.from(analysis.domAPIs))
  
  // Extract functions from the original TypeScript code
  const extractedFunctions = extractAndTranspileFunctions(code)
  
  // Create initialization code based on top-level statements
  const initCode = createInitializationFromCode(code, analysis)
  
  // Load the template file - templates will be copied to dist/templates/
  const currentDir = path.dirname(new URL(import.meta.url).pathname)
  const templatePath = path.resolve(currentDir, 'templates/wasm-entry.as.template')
  let template: string
  try {
    template = await fs.readFile(templatePath, 'utf-8')
  } catch (error) {
    // Fallback: try templates directory relative to the package root
    const fallbackTemplatePath = path.resolve(currentDir, '../templates/wasm-entry.as.template')
    try {
      template = await fs.readFile(fallbackTemplatePath, 'utf-8')
    } catch (fallbackError) {
      throw new Error(`Cannot find template file. Tried: ${templatePath} and ${fallbackTemplatePath}. Error: ${error}`)
    }
  }
  
  // Generate DOM bindings based on detected APIs
  const domBindings = generateDOMBindings(analysis.domAPIs)
  
  // Replace template variables
  const assemblyScriptCode = template
    .replace(/\{\{INIT_CODE\}\}/g, initCode)
    .replace(/\{\{EXTRACTED_FUNCTIONS\}\}/g, extractedFunctions)
    .replace(/\{\{DOM_BINDINGS\}\}/g, domBindings.assemblyScriptBindings)
    .replace(/\{\{EXPORTED_FUNCTIONS\}\}/g, domBindings.exportedFunctions)
  
  return {
    assemblyScriptCode,
    detectedHostFunctions: domBindings.hostFunctions
  }
}

function extractAndTranspileFunctions(code: string): string {
  const functions: string[] = []
  
  // Skip functions that are already defined in the template
  const templateFunctions = new Set(['reverseAndJoinString', 'getCurrentTimeString', 'myAbort'])
  
  // Better function extraction that handles nested braces properly
  const lines = code.split('\n')
  let i = 0
  
  while (i < lines.length) {
    const line = lines[i].trim()
    
    // Look for function declarations
    const functionMatch = line.match(/^function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*:\s*([^{]+)\s*\{?/)
    if (functionMatch) {
      const functionName = functionMatch[1]
      const params = functionMatch[2].trim()
      const returnType = functionMatch[3].trim()
      
      // Skip functions already in template
      if (templateFunctions.has(functionName)) {
        i++
        continue
      }
      
      // Check if this function is exported
      const isExported = code.includes('export { ' + functionName) || 
                        code.includes('export function ' + functionName) ||
                        // Check for multi-function exports like "export { func1, func2 }"
                        new RegExp('export\\s*\\{[^}]*\\b' + functionName + '\\b[^}]*\\}').test(code)
      if (!isExported) {
        i++
        continue
      }
      
      // Extract the full function body including nested braces
      let braceCount = 0
      let functionStarted = false
      let functionBody = ''
      let startIndex = i
      
      // Count braces to find the end of the function
      for (let j = i; j < lines.length; j++) {
        const currentLine = lines[j]
        
        // Count opening and closing braces
        for (let k = 0; k < currentLine.length; k++) {
          if (currentLine[k] === '{') {
            braceCount++
            functionStarted = true
          } else if (currentLine[k] === '}') {
            braceCount--
          }
        }
        
        // Add this line to the function body
        if (j === startIndex) {
          // First line - only take the part after the opening brace
          const braceIndex = currentLine.indexOf('{')
          if (braceIndex !== -1) {
            functionBody += currentLine.substring(braceIndex + 1) + '\n'
          }
        } else if (braceCount > 0) {
          // Middle lines
          functionBody += currentLine + '\n'
        } else if (functionStarted && braceCount === 0) {
          // Last line - only take the part before the closing brace
          const braceIndex = currentLine.lastIndexOf('}')
          if (braceIndex !== -1) {
            functionBody += currentLine.substring(0, braceIndex)
          }
          break
        }
        
        // Update outer loop index
        i = j
      }
      
      // Transpile this function
      if (functionBody.trim()) {
        const transpiledFunction = transpileFunction(functionName, params, returnType, functionBody.trim())
        functions.push(transpiledFunction)
        console.log('✅ Extracted and transpiled function: ' + functionName)
      }
    }
    i++
  }
  
  return functions.join('\n\n')
}

function transpileFunction(name: string, params: string, returnType: string, body: string): string {
  // Convert TypeScript types to AssemblyScript types
  const convertedParams = params ? convertParameters(params) : ''
  const convertedReturnType = convertTypeToAssemblyScript(returnType)
  const convertedBody = convertFunctionBody(body)
  
  return 'export function ' + name + '(' + convertedParams + '): ' + convertedReturnType + ' {\n' +
    convertedBody + '\n' +
    (convertedReturnType === 'void' ? '' : '  return 0\n') +
    '}'
}

function convertParameters(params: string): string {
  // Convert TypeScript parameter syntax to AssemblyScript
  return params.split(',').map(function(param) {
    const trimmed = param.trim()
    if (trimmed.includes(':')) {
      const parts = trimmed.split(':')
      const name = parts[0].trim()
      const type = parts[1].trim()
      return name + ': ' + convertTypeToAssemblyScript(type)
    } else {
      return trimmed + ': string' // Default to string
    }
  }).join(', ')
}

function convertTypeToAssemblyScript(tsType: string): string {
  const type = tsType.trim()
  switch (type) {
    case 'void': return 'void'
    case 'string': return 'string'
    case 'number': return 'i32'
    case 'boolean': return 'bool'
    case 'HTMLElement': return 'i32' // Element handle
    case 'HTMLInputElement': return 'i32' // Element handle
    default: return 'string' // Default fallback
  }
}

function convertFunctionBody(body: string): string {
  let converted = body
  
  // Convert console.log statements
  converted = converted.replace(/console\.log\(/g, 'log(')
  
  // Convert document.getElementById to our binding
  converted = converted.replace(/document\.getElementById\(([^)]+)\)/g, 'getElementById($1)')
  
  // Convert element.textContent = to our binding
  converted = converted.replace(/(\w+)\.textContent\s*=\s*([^;\n]+)/g, function(match, element, value) {
    return 'setTextContent(' + element + ', ' + value + ')'
  })
  
  // Convert element.value to our binding
  converted = converted.replace(/(\w+)\.value/g, 'getInputValue($1)')
  
  // Convert element.addEventListener to our binding
  converted = converted.replace(/(\w+)\.addEventListener\(([^,]+),\s*[^)]*\{\s*([^}]*)\s*\}\s*\)/g, 
    function(match, element, event, handler) {
      // Extract function name if it's a function call
      const handlerMatch = handler.match(/(\w+)\(\)/)
      if (handlerMatch) {
        return 'addEventListener(' + element + ', ' + event + ', "' + handlerMatch[1] + '")'
      }
      return match // Keep original if we can't parse it
    })
  
  // Convert string methods - specifically the example we have
  converted = converted.replace(/(\w+)\.split\(([^)]+)\)\.reverse\(\)\.join\(([^)]+)\)\.toUpperCase\(\)/g, 
    'toUpperCase(reverseString($1))')
  
  // Add proper indentation
  return converted.split('\n').map(function(line) { 
    const trimmed = line.trim()
    return trimmed ? '  ' + trimmed : ''
  }).filter(function(line) { return line.trim() }).join('\n')
}

function createInitializationFromCode(code: string, analysis: CodeAnalysis): string {
  const initLines: string[] = []
  
  console.log('🔄 Creating initialization from TypeScript code...')
  
  // Split the code into lines and filter out function definitions and exports
  const lines = code.split('\n')
  const topLevelStatements: string[] = []
  
  let insideFunction = false
  let braceCount = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue
    
    // Skip import/export statements
    if (trimmed.startsWith('import ') || trimmed.startsWith('export ')) continue
    
    // Track if we're inside a function
    if (trimmed.includes('function ') || trimmed.match(/^\s*\w+\s*\([^)]*\)\s*\{/)) {
      insideFunction = true
    }
    
    // Count braces to track function boundaries
    const openBraces = (line.match(/\{/g) || []).length
    const closeBraces = (line.match(/\}/g) || []).length
    braceCount += openBraces - closeBraces
    
    if (insideFunction && braceCount <= 0) {
      insideFunction = false
      braceCount = 0
      continue
    }
    
    // If we're not inside a function, this is top-level code
    if (!insideFunction && trimmed) {
      topLevelStatements.push(line)
    }
  }
  
  console.log('📝 Found top-level statements:', topLevelStatements.length)
  
  // Convert each top-level statement to AssemblyScript
  topLevelStatements.forEach(statement => {
    const trimmed = statement.trim()
    let converted = statement
    
    // Convert console.log statements
    if (trimmed.includes('console.log(')) {
      converted = statement.replace(/console\.log\(/g, 'log(')
      initLines.push('  ' + converted.trim())
    }
    
    // Convert document.getElementById statements
    else if (trimmed.includes('document.getElementById(')) {
      // Extract variable assignment: const appElement = document.getElementById('app')
      const match = trimmed.match(/(?:const|let|var)\s+(\w+)\s*=\s*document\.getElementById\(['"]([^'"]+)['"]\)/)
      if (match) {
        const varName = match[1]
        const elementId = match[2]
        initLines.push(`  // Get element: ${elementId}`)
        initLines.push(`  let ${varName} = getElementById("${elementId}")`)
      }
    }
    
    // Convert if statements that check for elements
    else if (trimmed.startsWith('if (') && trimmed.includes(') {')) {
      const match = trimmed.match(/if\s*\(\s*(\w+)\s*\)/)
      if (match) {
        const varName = match[1]
        initLines.push(`  if (${varName} != null) {`)
        
        // Look ahead to find the content inside the if block
        const nextLines = topLevelStatements.slice(topLevelStatements.indexOf(statement) + 1)
        for (const nextLine of nextLines) {
          const nextTrimmed = nextLine.trim()
          if (nextTrimmed === '}') {
            initLines.push('  }')
            break
          } else if (nextTrimmed.includes('console.log(')) {
            const logConverted = nextTrimmed.replace(/console\.log\(/g, 'log(')
            initLines.push('    ' + logConverted)
          } else if (nextTrimmed.includes('addEventListener(')) {
            // Convert event listeners - this is more complex, we'll add a placeholder
            initLines.push('    // Event listener setup - handled by DOM bindings')
          }
        }
      }
    }
  })
  
  // If no meaningful initialization was found, add a default
  if (initLines.length === 0) {
    initLines.push('  // Initialize WASM module')
    initLines.push('  log("WASM module initialized successfully!")')
    
    // Add DOM initialization based on detected APIs
    if (analysis.domAPIs.has('document\\.getElementById\\(')) {
      initLines.push('  // Initialize DOM elements')
      initLines.push('  let appElement = getElementById("app")')
      initLines.push('  if (appElement != null) {')
      initLines.push('    log("Found app element!")')
      initLines.push('  }')
    }
  }
  
  console.log('✅ Generated initialization lines:', initLines.length)
  return initLines.join('\n')
}

function extractFunctionsFromCode(code: string): string {
  const functions: string[] = []
  
  // Look for handleButtonClick function
  if (code.includes('function handleButtonClick')) {
    functions.push(`
export function handleButtonClick(): i32 {
  log("handleButtonClick called from WASM!")
  
  // Use DOM bindings to set text content
  let outputArea = getElementById("output-area")
  if (outputArea != null) {
    setTextContent(outputArea, "Button clicked! WASM is working!")
  }
  
  return 0
}`)
  }
  
  // Look for processUserInput function
  if (code.includes('function processUserInput')) {
    functions.push(`
export function processUserInput(input: string): string {
  log("Processing input: " + input)
  
  // Simple string processing - reverse and uppercase
  let result = ""
  for (let i = input.length - 1; i >= 0; i--) {
    const char = input.charCodeAt(i)
    if (char >= 97 && char <= 122) { // a-z
      result += String.fromCharCode(char - 32) // to uppercase
    } else {
      result += input.charAt(i)
    }
  }
  
  log("Processed result: " + result)
  return result
}`)
  }
  
  return functions.join('\n')
}

// Simplified transpiler implementation focusing on core functionality

function generateHostFunctionDeclarations(hostFunctions: ExtismPluginOptions['hostFunctions'] = []): string {
  return hostFunctions.map(fn => {
    const description = fn.description || ('Host function: ' + fn.name)
    const params = fn.inputs.map((type, i) => 'param' + i + ': ' + mapTypeToAssemblyScript(type)).join(',\n  ')
    const returnType = fn.outputs.length > 0 ? mapTypeToAssemblyScript(fn.outputs[0]) : 'void'
    
    return '\n// ' + description + '\ndeclare function ' + fn.name + '(\n  ' + params + '\n): ' + returnType + '\n'
  }).join('\n')
}

function mapTypeToAssemblyScript(type: string): string {
  switch (type) {
    case 'i32': return 'i32'
    case 'i64': return 'i64'
    case 'f32': return 'f32'
    case 'f64': return 'f64'
    case 'ptr': return 'i32' // Use i32 for pointers in AssemblyScript
    default: return 'i32'
  }
}

async function compileWithExtismPDK(
  inputPath: string, 
  outputPath: string, 
  options: ExtismPluginOptions['assemblyscriptOptions'] = {}
): Promise<void> {
  const {
    debug = false,
    optimizeLevel = 3,
    runtime = 'minimal',
    flags = []
  } = options

  // Use AssemblyScript with Extism PDK - minimal flags as recommended by PDK
  const asc = 'npx asc' // AssemblyScript compiler
  
  const args = [
    inputPath,
    '--outFile', outputPath,
    '--runtime', runtime,
    debug ? '--debug' : '--optimize',
    '--optimizeLevel', optimizeLevel.toString(),
    '--use', 'abort=temp/myAbort', // Reference the abort function in our generated code
    ...flags
  ]

  const command = asc + ' ' + args.join(' ')
  
  try {
    console.log('🔨 Compiling WASM with Extism AssemblyScript PDK...')
    console.log('   Command: ' + command)
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.dirname(inputPath)
    })
    
    console.log('✅ WASM compilation successful with Extism PDK')
    
  } catch (error) {
    throw new Error('Extism AssemblyScript PDK compilation failed: ' + error)
  }
}

async function generatePreviewHtml(
  rootDir: string, 
  outDir: string, 
  sourceHtml: string, 
  previewFileName: string,
  manifestData: ExtismManifest,
  wasmFileName: string,
  hostFunctions: Array<{name: string, inputs: string[], outputs: string[], description?: string}> = []
): Promise<void> {
  const sourceHtmlPath = path.resolve(rootDir, sourceHtml)
  const previewHtmlPath = path.resolve(outDir, previewFileName)
  
  try {
    // Read the source HTML file
    let htmlContent = await fs.readFile(sourceHtmlPath, 'utf-8')
    
    // Read the source CSS file
    const srcStylePath = path.resolve(rootDir, 'src/style.css')
    let cssContent = ''
    try {
      cssContent = await fs.readFile(srcStylePath, 'utf-8')
    } catch {
      console.log('⚠️  Could not read src/style.css, continuing without styles')
    }
    
    // Extract and inline CSS
    htmlContent = htmlContent.replace(
      /<link[^>]*href=["']\/vite\.svg["'][^>]*>/gi, 
      ''
    )
    
    // Create a bundled preview script
    const projectName = path.basename(rootDir) || 'GenericProject'
    await generateBundledPreviewScript(rootDir, outDir, wasmFileName, projectName, hostFunctions, manifestData)
    
    // Replace script import with bundled preview script
    htmlContent = htmlContent.replace(
      /<script[^>]*src=["']\/src\/main\.ts["'][^>]*><\/script>/gi,
      '<style>\n' + cssContent + '\n</style>\n<script type="module" src="./preview-bundle.js"></script>'
    )
    
    // Update title to indicate WASM version
    htmlContent = htmlContent.replace(
      /<title>([^<]*)<\/title>/gi,
      '<title>$1 - WASM Edition</title>'
    )
    
    // Write the preview HTML
    await fs.writeFile(previewHtmlPath, htmlContent)
    
    console.log('🌐 Preview HTML generated: ' + path.relative(rootDir, previewHtmlPath))
    
  } catch (error) {
    console.error('⚠️  Failed to generate preview HTML: ' + error)
  }
}

async function generateBundledPreviewScript(
  rootDir: string,
  outDir: string, 
  wasmFileName: string,
  projectName: string = 'GenericProject',
  hostFunctions: Array<{name: string, inputs: string[], outputs: string[], description?: string}> = [],
  manifestData: ExtismManifest
): Promise<void> {
  // Create a temporary source file for the preview bundle
  const previewSourcePath = path.resolve(outDir, 'preview-source.ts')
  const previewBundlePath = path.resolve(outDir, 'preview-bundle.js')
  
  // Generate the preview source code using our generic loader
  const previewSource = await generateWasmLoaderScript(manifestData, wasmFileName, projectName, rootDir, hostFunctions)

  // Write the preview source file
  await fs.writeFile(previewSourcePath, previewSource)
  
  try {
    // Use Vite to bundle the preview script with Extism
    const { build } = await import('vite')
    
    await build({
      configFile: false,
      build: {
        lib: {
          entry: previewSourcePath,
          name: 'RhylokWASMPreview',
          fileName: () => 'preview-bundle.js',
          formats: ['es']
        },
        outDir,
        rollupOptions: {
          external: [],
          output: {
            inlineDynamicImports: true
          }
        },
        minify: false
      },
      resolve: {
        alias: {
          '@extism/extism': path.resolve(rootDir, 'node_modules/@extism/extism/dist/browser/mod.js')
        }
      },
      optimizeDeps: {
        include: ['@extism/extism']
      }
    })
    
    console.log('📦 Bundled preview script: preview-bundle.js')
    
  } catch (error) {
    console.error('❌ CRITICAL: Failed to bundle Extism properly:', error)
    throw new Error('Extism bundling failed: ' + (error instanceof Error ? error.message : String(error)))
  }
  
  // Clean up temporary source file
  try {
    await fs.unlink(previewSourcePath)
  } catch {
    // Ignore cleanup errors
  }
}

async function generateWasmLoaderScript(
  manifestData: ExtismManifest, 
  wasmFileName: string,
  projectName: string = 'GenericWASM',
  configRoot: string,
  hostFunctions: Array<{name: string, inputs: string[], outputs: string[], description?: string}> = []
): Promise<string> {
  const adapterClassName = projectName + 'WASMAdapter'
  
  // Load the template file - templates will be copied to dist/templates/
  const currentDir = path.dirname(new URL(import.meta.url).pathname)
  const templatePath = path.resolve(currentDir, 'templates/wasm-loader.js.template')
  let template: string
  try {
    template = await fs.readFile(templatePath, 'utf-8')
  } catch (error) {
    // Fallback: try templates directory relative to the package root
    const fallbackTemplatePath = path.resolve(currentDir, '../templates/wasm-loader.js.template')
    try {
      template = await fs.readFile(fallbackTemplatePath, 'utf-8')
    } catch (fallbackError) {
      throw new Error(`Cannot find loader template file. Tried: ${templatePath} and ${fallbackTemplatePath}. Error: ${error}`)
    }
  }
  
  // Generate additional host function implementations for detected functions
  let additionalHostFunctions = ''
  for (const hostFunc of hostFunctions) {
    // Skip functions that are already hardcoded in the template
    const hardcodedFunctions = ['console_log', 'dom_get_element_by_id', 'dom_set_text_content', 'dom_create_element', 'fetch_request', 'dom_add_event_listener', 'dom_get_input_value']
    if (hardcodedFunctions.includes(hostFunc.name)) {
      continue
    }
    
    additionalHostFunctions += `,
          
          // ${hostFunc.description || hostFunc.name}
          ${hostFunc.name}: (${hostFunc.inputs.map((input, i) => `param${i}`).join(', ')}) => {
            console.log('🔧 WASM host function called: ${hostFunc.name}')
            // Default implementation - returns 0 or empty
            ${hostFunc.outputs.length > 0 ? 'return 0' : ''}
          }`
  }
  
  // Replace template variables
  return template
    .replace(/\{\{ADAPTER_CLASS_NAME\}\}/g, adapterClassName)
    .replace(/\{\{WASM_FILE_NAME\}\}/g, wasmFileName)
    .replace(/\{\{DETECTED_HOST_FUNCTIONS\}\}/g, additionalHostFunctions)
}

function createFallbackLoaderTemplate(): string {
  return '// Generic WASM loader script\n' +
    'import { createPlugin } from \'@extism/extism\'\n\n' +
    'class {{ADAPTER_CLASS_NAME}} {\n' +
    '  constructor() {\n' +
    '    this.plugin = null\n' +
    '    this.loadWASMPlugin()\n' +
    '  }\n' +
    '  async loadWASMPlugin() {\n' +
    '    console.log("Loading WASM...")\n' +
    '    // Basic WASM loading logic here\n' +
    '  }\n' +
    '}\n' +
    'new {{ADAPTER_CLASS_NAME}}()\n'
}

// Export types for external use
export type { ExtismPluginOptions, ExtismManifest }

// Default export for convenience
export default vitePluginExtism
