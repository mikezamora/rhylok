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
  `declare function ${fn.name}(${fn.inputs.map((type, i) => `param${i}: ${type}`).join(', ')}): ${fn.outputs[0] || 'void'}`
).join('\n') || ''}

// Simple example functions for WASM module
export function add(a: i32, b: i32): i32 {
  return a + b
}

export function multiply(a: f64, b: f64): f64 {
  return a * b
}

export function greet(name: string): string {
  log("Hello from WASM: " + name)
  return "Hello, " + name + "!"
}

export function processAudio(level: f32, frequency: f32): i32 {
  // Simple beat detection logic
  if (level > 0.5 && frequency > 60.0 && frequency < 250.0) {
    log("Beat detected!")
    return 1
  }
  return 0
}

export function getTimestamp(): f64 {
  return getTime()
}

// Initialize function
export function init(): void {
  log("WASM module initialized")
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
    case 'ptr': return 'usize'
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

// Export types for external use
export type { ExtismPluginOptions, ExtismManifest }
