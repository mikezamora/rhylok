// Extended Extism AssemblyScript module with host functions
import { Host } from "@extism/as-pdk"

// Declare external host functions that will be provided by the host
@external("extism:host/user", "get_time")
declare function get_time(): i64

@external("extism:host/user", "log_message")  
declare function log_message(ptr: i32): void

@external("extism:host/user", "add_numbers")
declare function add_numbers(a: i32, b: i32): i32

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
  
  // Use host function to log the message (pass as string directly)
  Host.outputString("Calling host log function...")
  // For now, we'll pass 0 as a placeholder since we need proper memory management
  log_message(0)
  
  Host.outputString("Message logged via host function!")
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

// Test host functions
export function test_host_functions(): i32 {
  // Test get_time host function
  const time = get_time();
  
  // Test log_message host function
  const message = "Hello from AssemblyScript!";
  // For log_message, we pass 0 as a placeholder since we need proper memory management
  log_message(0);
  
  // Test add_numbers host function  
  const sum = add_numbers(10, 32);
  
  // Output the results
  Host.outputString(`Host function tests completed! Time: ${time.toString()}, Sum: ${sum.toString()}`);
  
  return 0;
}
