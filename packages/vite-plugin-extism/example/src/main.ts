// Example TypeScript project that will be transpiled to WASM
// This demonstrates DOM manipulation, event handling, and console logging

console.log("Hello from TypeScript! This will become WASM.")

// Test DOM element access
const appElement = document.getElementById('app')
if (appElement) {
  console.log("Found app element!")
}

// Test button click handling
const testButton = document.getElementById('test-button')
if (testButton) {
  testButton.addEventListener('click', () => {
    console.log("Button clicked from TypeScript!")
    handleButtonClick()
  })
}

// Test DOM manipulation
const domTestButton = document.getElementById('dom-test')
const outputArea = document.getElementById('output-area')
if (domTestButton && outputArea) {
  domTestButton.addEventListener('click', () => {
    outputArea.textContent = `Updated at ${new Date().toLocaleTimeString()}`
    console.log("DOM updated successfully!")
  })
}

// Test text processing
const processTextButton = document.getElementById('process-text')
const textInput = document.getElementById('text-input') as HTMLInputElement
if (processTextButton && textInput && outputArea) {
  processTextButton.addEventListener('click', () => {
    const inputText = textInput.value
    const processedText = processUserInput(inputText)
    outputArea.textContent = `Processed: "${processedText}"`
    console.log(`Text processed: ${inputText} -> ${processedText}`)
  })
}

// Functions that will be available in WASM
function handleButtonClick(): void {
  console.log("handleButtonClick called - this will be a WASM function!")
  const outputArea = document.getElementById('output-area')
  if (outputArea) {
    outputArea.textContent = "Button clicked! WASM is working!"
  }
}

function processUserInput(input: string): string {
  // Simple text processing that will run in WASM
  return input.split('').reverse().join('').toUpperCase()
}

// Export functions for WASM
export { handleButtonClick, processUserInput }

// Log successful initialization
console.log("TypeScript example initialized - ready for WASM conversion!")
