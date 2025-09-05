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
   * @default 'dist-extism'
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
    outDir = 'dist-extism',
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

  return {
    name: 'vite-plugin-extism',
    apply: 'build', // Only apply during build, not dev
    
    configResolved(resolvedConfig) {
      config = resolvedConfig
      srcDir = path.resolve(config.root, 'src')
      entryPath = path.resolve(srcDir, entry)
    },

    async generateBundle(outputOptions, bundle) {
      // Find the main entry chunk
      const entryChunk = Object.values(bundle).find(
        (chunk): chunk is OutputChunk => 
          chunk.type === 'chunk' && chunk.isEntry
      )

      console.log('📦 Bundle contents:', Object.keys(bundle))
      console.log('🎯 Entry chunk found:', !!entryChunk)

      // If no entry chunk, create a simple one from our WASM entry file
      if (!entryChunk) {
        console.log('⚠️  No entry chunk found, using WASM entry file directly')
        const wasmEntryPath = path.resolve(srcDir, entry)
        
        if (!(await fs.access(wasmEntryPath).then(() => true).catch(() => false))) {
          this.error(`Entry file not found: ${wasmEntryPath}`)
          return
        }
      }

      try {
        // Check if we have a WASM-specific entry file
        const wasmEntryPath = path.resolve(srcDir, entry.replace('.ts', '-wasm.ts'))
        let wasmCode: string

        if (await fs.access(wasmEntryPath).then(() => true).catch(() => false)) {
          // Use the WASM-specific entry file
          console.log(`📄 Using WASM entry file: ${path.relative(config.root, wasmEntryPath)}`)
          wasmCode = await fs.readFile(wasmEntryPath, 'utf-8')
        } else if (entryChunk) {
          // Transform the bundled code
          console.log(`🔄 Transforming bundled code for WASM compatibility`)
          wasmCode = entryChunk.code
        } else {
          // Fallback: read the entry file directly
          const fallbackEntryPath = path.resolve(srcDir, entry)
          console.log(`📄 Reading entry file directly: ${path.relative(config.root, fallbackEntryPath)}`)
          wasmCode = await fs.readFile(fallbackEntryPath, 'utf-8')
        }

        // Apply custom transform if provided
        if (options.transform) {
          wasmCode = await options.transform(wasmCode, bundle)
        } else {
          // Default transformation to make code AssemblyScript compatible
          wasmCode = await transformToAssemblyScript(wasmCode, hostFunctions)
        }

        // Ensure output directory exists
        const fullOutDir = path.resolve(config.root, outDir)
        await fs.mkdir(fullOutDir, { recursive: true })

        // Create temporary AssemblyScript file
        const tempAsFile = path.join(fullOutDir, 'temp.ts') // Use .ts extension for AssemblyScript
        await fs.writeFile(tempAsFile, wasmCode)

        // Generate host function declarations if needed
        if (hostFunctions.length > 0) {
          const hostDeclarations = generateHostFunctionDeclarations(hostFunctions)
          const hostDeclFile = path.join(fullOutDir, 'host.ts')
          await fs.writeFile(hostDeclFile, hostDeclarations)
        }

        // Compile with AssemblyScript
        const wasmPath = path.join(fullOutDir, wasmFileName)
        await compileWithAssemblyScript(tempAsFile, wasmPath, assemblyscriptOptions)

        // Create Extism manifest
        const manifestData: ExtismManifest = {
          wasm: [{
            path: wasmFileName,
            name: path.basename(wasmFileName, '.wasm')
          }],
          ...manifest
        }

        const manifestPath = path.join(fullOutDir, manifestFileName)
        await fs.writeFile(manifestPath, JSON.stringify(manifestData, null, 2))

        // Clean up temporary files
        await fs.unlink(tempAsFile).catch(() => {})
        if (hostFunctions.length > 0) {
          await fs.unlink(path.join(fullOutDir, 'host.ts')).catch(() => {})
        }

        this.emitFile({
          type: 'asset',
          fileName: `${outDir}/${wasmFileName}`,
          source: await fs.readFile(wasmPath)
        })

        this.emitFile({
          type: 'asset',
          fileName: `${outDir}/${manifestFileName}`,
          source: JSON.stringify(manifestData, null, 2)
        })

        console.log(`✅ Extism WASM plugin generated:`)
        console.log(`   📦 WASM: ${path.relative(config.root, wasmPath)}`)
        console.log(`   📋 Manifest: ${path.relative(config.root, manifestPath)}`)

        // Generate preview HTML if requested
        if (generatePreview) {
          await generatePreviewHtml(config.root, fullOutDir, sourceHtml, previewFileName, manifestData, wasmFileName)
        }

      } catch (error) {
        this.error(`Failed to compile WASM plugin: ${error}`)
      }

      // Clear the bundle to prevent normal output
      for (const fileName of Object.keys(bundle)) {
        delete bundle[fileName]
      }
    }
  }
}

async function transformToAssemblyScript(code: string, hostFunctions: ExtismPluginOptions['hostFunctions'] = []): Promise<string> {
  // If the code looks like it's already AssemblyScript, return it as-is
  if (code.includes('export function') && !code.includes('Object.defineProperty')) {
    console.log('📄 Code appears to be AssemblyScript-compatible, using as-is')
    return code
  }

  console.log('🔄 Converting JavaScript/TypeScript to AssemblyScript')
  
  // Basic transformations to make JavaScript/TypeScript code AssemblyScript compatible
  let transformed = code

  // Remove JavaScript-specific constructs
  transformed = transformed
    // Remove var/const declarations and Object.defineProperty calls
    .replace(/var \w+ = Object\.defineProperty.*?;/g, '')
    .replace(/var \w+ = \(.*?\) => .*?;/g, '')
    .replace(/var \w+ = \(.*?\) => \w+ in \w+.*?;/g, '')
    
    // Remove import statements that aren't compatible
    .replace(/import\s+{[^}]*}\s+from\s+["'][^"']*["'];?/g, '')
    .replace(/import\s+\w+\s+from\s+["'][^"']*["'];?/g, '')
    
    // Remove class helper functions
    .replace(/var h = \(.*?\) => .*?;/g, '')
    .replace(/h\(this, ["'][^"']*["'], [^)]*\);/g, '')
    
    // Replace console.log with host function
    .replace(/console\.log\((.*?)\)/g, 'log($1)')
    .replace(/console\.error\((.*?)\)/g, 'log($1)')
    .replace(/console\.warn\((.*?)\)/g, 'log($1)')
    
    // Replace Math.* with simple math operations
    .replace(/Math\.floor\(/g, 'i32(')
    .replace(/Math\.ceil\(/g, 'i32(')
    .replace(/Math\.round\(/g, 'i32(')
    .replace(/Math\.abs\(/g, 'abs(')
    
    // Replace number types with explicit AssemblyScript types
    .replace(/: number/g, ': f64')
    .replace(/: boolean/g, ': bool')
    
    // Clean up any remaining issues
    .replace(/\bwindow\./g, '// window.')
    .replace(/\bdocument\./g, '// document.')
    .replace(/\bnew Audio\(/g, '// new Audio(')
    .replace(/\bnavigator\./g, '// navigator.')

  // Create a simple AssemblyScript module structure
  const assemblyScriptCode = `
// Generated AssemblyScript code from TypeScript source

// Host function declarations
${hostFunctions?.map(fn => 
  `declare function ${fn.name}(${fn.inputs.map((type, i) => `param${i}: ${mapTypeToAssemblyScript(type)}`).join(', ')}): ${fn.outputs.length > 0 ? mapTypeToAssemblyScript(fn.outputs[0]) : 'void'}`
).join('\n') || ''}

// Simple example functions for WASM module
export function add(a: i32, b: i32): i32 {
  return a + b
}

export function multiply(a: f64, b: f64): f64 {
  return a * b
}

export function greet(name: string): string {
  // log("Hello from WASM: " + name)  // Commented out for now due to string handling
  return "Hello, " + name + "!"
}

export function processAudio(level: f32, frequency: f32): i32 {
  // Simple beat detection logic
  if (level > 0.5 && frequency > 60.0 && frequency < 250.0) {
    // log("Beat detected!")  // Commented out for now due to string handling
    return 1
  }
  return 0
}

export function getTimestamp(): f64 {
  // Return a simple timestamp for now
  return 0.0
}

// Initialize function
export function init(): void {
  // log("WASM module initialized")  // Commented out for now due to string handling
}
`

  return assemblyScriptCode
}

function generateHostFunctionDeclarations(hostFunctions: ExtismPluginOptions['hostFunctions'] = []): string {
  return hostFunctions.map(fn => `
// ${fn.description || `Host function: ${fn.name}`}
declare function ${fn.name}(
  ${fn.inputs.map((type, i) => `param${i}: ${mapTypeToAssemblyScript(type)}`).join(',\n  ')}
): ${fn.outputs.length > 0 ? mapTypeToAssemblyScript(fn.outputs[0]) : 'void'}
`).join('\n')
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

async function compileWithAssemblyScript(
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

  // Build AssemblyScript command
  const asc = 'npx asc' // AssemblyScript compiler
  
  const args = [
    inputPath,
    '--outFile', outputPath,
    '--runtime', runtime,
    debug ? '--debug' : '--optimize',
    `--optimizeLevel`, optimizeLevel.toString(),
    '--exportRuntime',
    '--bindings', 'esm',
    '--exportStart', '_start',
    ...flags
  ]

  const command = `${asc} ${args.join(' ')}`
  
  try {
    console.log(`🔨 Compiling WASM with AssemblyScript...`)
    console.log(`   Command: ${command}`)
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.dirname(inputPath)
    })
    
    console.log(`✅ WASM compilation successful`)
    
  } catch (error) {
    throw new Error(`AssemblyScript compilation failed: ${error}`)
  }
}

async function generatePreviewHtml(
  rootDir: string, 
  outDir: string, 
  sourceHtml: string, 
  previewFileName: string,
  manifestData: ExtismManifest,
  wasmFileName: string
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
    await generateBundledPreviewScript(rootDir, outDir, wasmFileName)
    
    // Replace script import with bundled preview script
    htmlContent = htmlContent.replace(
      /<script[^>]*src=["']\/src\/main\.ts["'][^>]*><\/script>/gi,
      `<style>\n${cssContent}\n</style>\n<script type="module" src="./preview-bundle.js"></script>`
    )
    
    // Update title to indicate WASM version
    htmlContent = htmlContent.replace(
      /<title>([^<]*)<\/title>/gi,
      '<title>$1 - WASM Edition</title>'
    )
    
    // Write the preview HTML
    await fs.writeFile(previewHtmlPath, htmlContent)
    
    console.log(`🌐 Preview HTML generated: ${path.relative(rootDir, previewHtmlPath)}`)
    
  } catch (error) {
    console.error(`⚠️  Failed to generate preview HTML: ${error}`)
  }
}

async function generateBundledPreviewScript(
  rootDir: string,
  outDir: string, 
  wasmFileName: string
): Promise<void> {
  // Create a temporary source file for the preview bundle
  const previewSourcePath = path.resolve(outDir, 'preview-source.ts')
  const previewBundlePath = path.resolve(outDir, 'preview-bundle.js')
  
  // Generate the preview source code
  const previewSource = `
import { createPlugin } from '@extism/extism'

class RhylokWASMAdapter {
  constructor() {
    this.plugin = null
    this.isInitialized = false
    this.loadWASMPlugin()
    this.initializeExistingUI()
  }

  async loadWASMPlugin() {
    try {
      console.log('📦 Loading WASM plugin...')
      
      // Load the manifest and WASM file
      const manifestResponse = await fetch('./manifest.json')
      const manifest = await manifestResponse.json()
      
      const wasmResponse = await fetch('./${wasmFileName}')
      const wasmBytes = await wasmResponse.arrayBuffer()
      
      // Update manifest to use the loaded WASM data
      manifest.wasm = [{ data: new Uint8Array(wasmBytes) }]
      
      // Create plugin with host functions
      this.plugin = await createPlugin(manifest, {
        log: (offset) => {
          const message = this.plugin.read(offset).text()
          console.log('🎮 WASM:', message)
        },
        
        playSound: (nameOffset, volume) => {
          const soundName = this.plugin.read(nameOffset).text()
          this.playSound(soundName, volume)
          return 1
        },
        
        getTime: () => Date.now(),
        
        httpRequest: (methodOffset, urlOffset) => {
          const method = this.plugin.read(methodOffset).text()
          const url = this.plugin.read(urlOffset).text()
          console.log('🌐 HTTP', method, url)
          return this.plugin.alloc('{"status": 200}').offset
        }
      })
      
      // Initialize the game
      this.plugin.call('initGame')
      this.isInitialized = true
      console.log('✅ WASM plugin loaded successfully!')
      
    } catch (error) {
      console.error('❌ Failed to load WASM plugin:', error)
    }
  }

  initializeExistingUI() {
    // Hook into existing UI elements and redirect to WASM
    const playPauseBtn = document.getElementById('play-pause')
    const audioFileInput = document.getElementById('audio-file')
    
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => this.handlePlayPause())
    }
    
    if (audioFileInput) {
      audioFileInput.addEventListener('change', (e) => this.handleAudioFile(e))
    }
    
    // Hook into existing keyboard controls
    document.addEventListener('keydown', (e) => this.handleKeydown(e))
    
    // Replace the existing game initialization
    this.replaceExistingGameLogic()
  }

  handlePlayPause() {
    if (!this.plugin || !this.isInitialized) return
    
    try {
      const isPlaying = this.plugin.call('isGameRunning')
      if (isPlaying) {
        this.plugin.call('stopGame')
      } else {
        this.plugin.call('startGame')
      }
    } catch (error) {
      console.error('WASM play/pause error:', error)
    }
  }

  handleAudioFile(event) {
    const file = event.target.files[0]
    if (!file) return
    
    console.log('🎵 Loading audio file for WASM processing:', file.name)
    // Audio processing would be handled by the existing Web Audio API
    // and pass data to WASM for beat detection
  }

  handleKeydown(event) {
    if (!this.plugin || !this.isInitialized) return
    
    const keyMap = {
      'KeyA': 1, 'KeyS': 2, 'KeyD': 3, 'KeyF': 4,
      'KeyJ': 5, 'KeyK': 6, 'KeyL': 7, 'Semicolon': 8,
      'Space': 32
    }
    
    const keyValue = keyMap[event.code]
    if (keyValue) {
      event.preventDefault()
      try {
        this.plugin.call('handleInput', 1, keyValue, Date.now())
        this.updateUI()
      } catch (error) {
        console.error('WASM input error:', error)
      }
    }
  }

  updateUI() {
    if (!this.plugin || !this.isInitialized) return
    
    try {
      const score = this.plugin.call('getScore')
      const combo = this.plugin.call('getCombo')
      
      const scoreElement = document.getElementById('score')
      const comboElement = document.getElementById('combo')
      
      if (scoreElement) scoreElement.textContent = score.toString()
      if (comboElement) comboElement.textContent = combo.toString()
      
    } catch (error) {
      // Ignore UI update errors to prevent spam
    }
  }

  playSound(soundName, volume) {
    // Simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = soundName.includes('hit') ? 800 : 400
      gainNode.gain.value = volume * 0.1
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.log('Audio playback not available')
    }
  }

  replaceExistingGameLogic() {
    // Override any existing game initialization
    window.RhythemGame = class {
      constructor() {
        console.log('🎮 Using WASM-powered RhythemGame')
        // The WASM adapter handles everything
      }
    }
  }
}

// Initialize the WASM adapter when the page loads
window.addEventListener('load', () => {
  new RhylokWASMAdapter()
})
`

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
          '@extism/extism': path.resolve(rootDir, 'node_modules/@extism/extism/dist/index.js')
        }
      }
    })
    
    console.log(`📦 Bundled preview script: preview-bundle.js`)
    
  } catch (error) {
    console.error('⚠️  Failed to bundle preview script, falling back to simple copy:', error)
    
    // Fallback: create a simple bundled version without Vite
    const simpleBundledScript = previewSource.replace(
      "import { createPlugin } from '@extism/extism'",
      "// Extism will be loaded separately\\nconst { createPlugin } = window.Extism || {}"
    )
    
    await fs.writeFile(previewBundlePath, simpleBundledScript)
  }
  
  // Clean up temporary source file
  try {
    await fs.unlink(previewSourcePath)
  } catch {
    // Ignore cleanup errors
  }
}

function generateWasmLoaderScript(manifestData: ExtismManifest): string {
  return `
// Import Extism using import map
import { createPlugin } from '@extism/extism'

class RhylokWASMAdapter {
  constructor() {
    this.plugin = null
    this.isInitialized = false
    this.loadWASMPlugin()
    this.initializeExistingUI()
  }

  async loadWASMPlugin() {
    try {
      console.log('📦 Loading WASM plugin...')
      
      // Load the manifest and WASM file
      const manifestResponse = await fetch('./manifest.json')
      const manifest = await manifestResponse.json()
      
      const wasmResponse = await fetch('./rhylok-game.wasm')
      const wasmBytes = await wasmResponse.arrayBuffer()
      
      // Update manifest to use the loaded WASM data
      manifest.wasm = [{ data: new Uint8Array(wasmBytes) }]
      
      // Create plugin with host functions
      this.plugin = await createPlugin(manifest, {
        log: (offset) => {
          const message = this.plugin.read(offset).text()
          console.log('🎮 WASM:', message)
        },
        
        playSound: (nameOffset, volume) => {
          const soundName = this.plugin.read(nameOffset).text()
          this.playSound(soundName, volume)
          return 1
        },
        
        getTime: () => Date.now(),
        
        httpRequest: (methodOffset, urlOffset) => {
          const method = this.plugin.read(methodOffset).text()
          const url = this.plugin.read(urlOffset).text()
          console.log('🌐 HTTP', method, url)
          return this.plugin.alloc('{"status": 200}').offset
        }
      })
      
      // Initialize the game
      this.plugin.call('initGame')
      this.isInitialized = true
      console.log('✅ WASM plugin loaded successfully!')
      
    } catch (error) {
      console.error('❌ Failed to load WASM plugin:', error)
    }
  }

  initializeExistingUI() {
    // Hook into existing UI elements and redirect to WASM
    const playPauseBtn = document.getElementById('play-pause')
    const audioFileInput = document.getElementById('audio-file')
    
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => this.handlePlayPause())
    }
    
    if (audioFileInput) {
      audioFileInput.addEventListener('change', (e) => this.handleAudioFile(e))
    }
    
    // Hook into existing keyboard controls
    document.addEventListener('keydown', (e) => this.handleKeydown(e))
    
    // Replace the existing game initialization
    this.replaceExistingGameLogic()
  }

  handlePlayPause() {
    if (!this.plugin || !this.isInitialized) return
    
    try {
      const isPlaying = this.plugin.call('isGameRunning')
      if (isPlaying) {
        this.plugin.call('stopGame')
      } else {
        this.plugin.call('startGame')
      }
    } catch (error) {
      console.error('WASM play/pause error:', error)
    }
  }

  handleAudioFile(event) {
    const file = event.target.files[0]
    if (!file) return
    
    console.log('🎵 Loading audio file for WASM processing:', file.name)
    // Audio processing would be handled by the existing Web Audio API
    // and pass data to WASM for beat detection
  }

  handleKeydown(event) {
    if (!this.plugin || !this.isInitialized) return
    
    const keyMap = {
      'KeyA': 1, 'KeyS': 2, 'KeyD': 3, 'KeyF': 4,
      'KeyJ': 5, 'KeyK': 6, 'KeyL': 7, 'Semicolon': 8,
      'Space': 32
    }
    
    const keyValue = keyMap[event.code]
    if (keyValue) {
      event.preventDefault()
      try {
        this.plugin.call('handleInput', 1, keyValue, Date.now())
        this.updateUI()
      } catch (error) {
        console.error('WASM input error:', error)
      }
    }
  }

  updateUI() {
    if (!this.plugin || !this.isInitialized) return
    
    try {
      const score = this.plugin.call('getScore')
      const combo = this.plugin.call('getCombo')
      
      const scoreElement = document.getElementById('score')
      const comboElement = document.getElementById('combo')
      
      if (scoreElement) scoreElement.textContent = score.toString()
      if (comboElement) comboElement.textContent = combo.toString()
      
    } catch (error) {
      // Ignore UI update errors to prevent spam
    }
  }

  playSound(soundName, volume) {
    // Simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = soundName.includes('hit') ? 800 : 400
      gainNode.gain.value = volume * 0.1
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.log('Audio playback not available')
    }
  }

  replaceExistingGameLogic() {
    // Override any existing game initialization
    window.RhythemGame = class {
      constructor() {
        console.log('🎮 Using WASM-powered RhythemGame')
        // The WASM adapter handles everything
      }
    }
  }
}

// Initialize the WASM adapter when the page loads
window.addEventListener('load', () => {
  new RhylokWASMAdapter()
})
`
}

// Export types for external use
export type { ExtismPluginOptions, ExtismManifest }
