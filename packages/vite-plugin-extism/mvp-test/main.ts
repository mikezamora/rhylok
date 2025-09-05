// Extended Extism AssemblyScript module with host functions
import { Host, Memory } from "@extism/as-pdk"

function myAbort(
  message: string | null,
  fileName: string | null,
  lineNumber: u32,
  columnNumber: u32
): void { }

// Declare external host functions that will be provided by the host
@external("extism:host/user", "get_time")
declare function get_time(): i64

@external("extism:host/user", "add_numbers")
declare function add_numbers(a: i32, b: i32): i32

@external("extism:host/user", "console_log")
declare function console_log(messagePtr: u64, messageLen: u64): void

// Helper function to make console.log easier to use
function log(message: string): void {
  // Use Memory API to allocate string properly
  const mem = Memory.allocateString(message)
  console_log(mem.offset, mem.length)
}

// Basic hello function
export function hello(): i32 {
  Host.outputString("Hello from WASM! (basic version)")
  return 0
}

// Export function that uses host functions
export function hello_with_time(): i32 {
  const timestamp = get_time()
  Host.outputString("Hello from WASM! Current time: " + timestamp.toString())
  return 0
}

// Export function that uses host logging
export function greet(): i32 {
  const name = Host.inputString()
  const message = "Greeting: " + name
  
  log("Calling built-in log function...")
  log("Message: " + message)

  Host.outputString("Message logged via built-in log function!")
  return 0
}

// Export function that uses host math
export function calculate(): i32 {
  const input = Host.inputString()
  Host.outputString("Input received: " + input)
  
  // Use host function to add numbers
  const result = add_numbers(10, 5)
  Host.outputString("Host calculation result: " + result.toString())
  
  return 0
}

// Test console.log host function
export function test_console_log(): i32 {
  log("🚀 Testing console.log host function!")
  log("This message should appear in the host console")
  log("You can use this like console.log in JavaScript")
  
  const number = 42
  const text = "Hello World"
  log("Number: " + number.toString() + ", Text: " + text)
  
  Host.outputString("Console.log test completed!")
  return 0
}

// Test host functions
export function test_host_functions(): i32 {
  // Test console.log host function first
  log("🎉 Hello from WASM console.log!");
  log("Testing custom console.log host function...");
  
  // Test get_time host function
  const time = get_time();
  log("Current timestamp: " + time.toString());
  
  // Test built-in log function instead of custom host function
  const message = "Hello from AssemblyScript!";
  log("📝 Testing built-in logging: " + message);
  log("📋 This is a debug message");
  log("⚠️ This is a warning message");

  // Test add_numbers host function
  const sum = add_numbers(10, 32);
  log("Addition result (10 + 32): " + sum.toString());
  
  // Output the results
  Host.outputString(`Host function tests completed! Time: ${time.toString()}, Sum: ${sum.toString()}`);
  
  return 0;
}
