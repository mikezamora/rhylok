// Generated Extism AssemblyScript module with DOM bindings
import { Host, Config, Var, Memory } from '@extism/as-pdk'

// External function for getting memory length
declare function length(offset: u64): u64

// Required abort function for AssemblyScript/Extism
function myAbort(
  message: string | null,
  fileName: string | null,
  lineNumber: u32,
  columnNumber: u32
): void {
  if (message) {
    Host.outputString("ABORT: " + message)
  }
}


// DOM element handle class
class ElementHandle {
  constructor(public id: string) {}
}

// DOM element access using external host functions
@external("extism:host/user", "dom_get_element_by_id")
declare function dom_get_element_by_id(idPtr: u64, idLen: u64): i32

function getElementById(id: string): ElementHandle | null {
  log("🔧 AssemblyScript getElementById called with: '" + id + "'")
  log("🔧 String length: " + id.length.toString())
  const idMem = Memory.allocateString(id)
  log("🔧 Memory allocated at offset: " + idMem.offset.toString())
  const result = dom_get_element_by_id(idMem.offset, idMem.length)
  log("🔧 Host function returned: " + result.toString())
  if (result > 0) {
    return new ElementHandle(id)
  }
  return null
}

// Event listener setup using external host function
@external("extism:host/user", "dom_add_event_listener")
declare function dom_add_event_listener(elementIdPtr: u64, elementIdLen: u64, eventPtr: u64, eventLen: u64, handlerPtr: u64, handlerLen: u64): i32

function addEventListener(element: ElementHandle, event: string, handler: string): void {
  const elementIdMem = Memory.allocateString(element.id)
  const eventMem = Memory.allocateString(event)
  const handlerMem = Memory.allocateString(handler)
  dom_add_event_listener(elementIdMem.offset, elementIdMem.length, eventMem.offset, eventMem.length, handlerMem.offset, handlerMem.length)
}

// Text content setting using external host function
@external("extism:host/user", "dom_set_text_content")
declare function dom_set_text_content(elementIdPtr: u64, elementIdLen: u64, textPtr: u64, textLen: u64): i32

function setTextContent(element: ElementHandle, text: string): void {
  const elementIdMem = Memory.allocateString(element.id)
  const textMem = Memory.allocateString(text)
  dom_set_text_content(elementIdMem.offset, elementIdMem.length, textMem.offset, textMem.length)
}

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
}

// Simple test function that doesn't require host functions
export function simple_test(): string {
  return "WASM is working!"
}

// Addition test without host functions
export function add_numbers(a: i32, b: i32): i32 {
  return a + b
}

// Main entry point for WASM module - transpiled from actual TypeScript
export function main(): i32 {
  log("Hello from TypeScript! This will become WASM.")
  // Get element: app
  let appElement = getElementById("app")
  log("TypeScript example initialized - ready for WASM conversion!")
  
  return 0
}




// Export function for DOM element interaction  
export function dom_get_element(): string {
  return '{"status": "dom_get_element_available"}'
}

// Export function for event listener testing
export function dom_add_event_listener_test(): string {
  return '{"status": "dom_add_event_listener_available"}'
}

// Export function for text content updates
export function dom_set_text(): string {
  return '{"status": "dom_set_text_available"}'
}
