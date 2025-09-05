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
@external("extism:host/env", "dom_get_element_by_id")
declare function dom_get_element_by_id(idOffset: u32): i32

function getElementById(id: string): ElementHandle | null {
  Host.outputString("🔧 AssemblyScript getElementById called with: '" + id + "'")
  Host.outputString("🔧 String length: " + id.length.toString())
  const idMem = Memory.allocateString(id)
  Host.outputString("🔧 Memory allocated at offset: " + idMem.offset.toString())
  const result = dom_get_element_by_id(u32(idMem.offset))
  Host.outputString("🔧 Host function returned: " + result.toString())
  if (result > 0) {
    return new ElementHandle(id)
  }
  return null
}

// DOM element creation using external host function
@external("extism:host/env", "dom_create_element")
declare function dom_create_element(tagNameOffset: u32): i32

function createElement(tagName: string): ElementHandle | null {
  const tagNameMem = Memory.allocateString(tagName)
  const result = dom_create_element(u32(tagNameMem.offset))
  if (result > 0) {
    return new ElementHandle(tagName + "_" + result.toString())
  }
  return null
}

// Event listener setup using external host function
@external("extism:host/env", "dom_add_event_listener")
declare function dom_add_event_listener(elementIdOffset: u32, eventOffset: u32, handlerOffset: u32): i32

function addEventListener(element: ElementHandle, event: string, handler: string): void {
  const elementIdMem = Memory.allocateString(element.id)
  const eventMem = Memory.allocateString(event)
  const handlerMem = Memory.allocateString(handler)
  dom_add_event_listener(u32(elementIdMem.offset), u32(eventMem.offset), u32(handlerMem.offset))
}

// Text content setting using external host function
@external("extism:host/env", "dom_set_text_content")
declare function dom_set_text_content(elementIdOffset: u32, textOffset: u32): i32

function setTextContent(element: ElementHandle, text: string): void {
  const elementIdMem = Memory.allocateString(element.id)
  const textMem = Memory.allocateString(text)
  dom_set_text_content(u32(elementIdMem.offset), u32(textMem.offset))
}

// Console log implementation using Host.outputString for CLI compatibility
function log(message: string): void {
  Host.outputString(message)
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

// Fetch API implementation using external host function
@external("extism:host/env", "fetch_request")
declare function fetch_request(urlOffset: u32, methodOffset: u32): i32

function fetch(url: string, options: string = "GET"): i32 {
  const urlMem = Memory.allocateString(url)
  const methodMem = Memory.allocateString(options)
  return fetch_request(u32(urlMem.offset), u32(methodMem.offset))
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
  // Initialize DOM elements
  let appElement = getElementById("app")
  if (appElement != null) {
    log("Found app element!")
  }
  
  return 0
}




// Export function for DOM element interaction  
export function dom_get_element(): string {
  return '{"status": "dom_get_element_available"}'
}

// Export function for DOM element creation
export function dom_create_element_test(): string {
  return '{"status": "dom_create_element_available"}'
}

// Export function for event listener testing
export function dom_add_event_listener_test(): string {
  return '{"status": "dom_add_event_listener_available"}'
}

// Export function for text content updates
export function dom_set_text(): string {
  return '{"status": "dom_set_text_available"}'
}

// Export function for fetch API
export function fetch_test(): string {
  return '{"status": "fetch_available"}'
}
