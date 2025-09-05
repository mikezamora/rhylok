// Extended Extism AssemblyScript module with host functions
import { Host, Memory, LogLevel } from "@extism/as-pdk"

// Declare external host functions that will be provided by the host
@external("extism:host/user", "get_time")
declare function get_time(): i64

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
  
  // Use built-in Extism logging instead of custom host function
  Host.log(LogLevel.Info, "Calling built-in log function...")
  Host.log(LogLevel.Info, "Message: " + message)
  
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

// Test host functions
export function test_host_functions(): i32 {
  // Test get_time host function
  const time = get_time();
  
  // Test built-in log function instead of custom host function
  const message = "Hello from AssemblyScript!";
  Host.log(LogLevel.Info, "📝 Testing built-in logging: " + message);
  Host.log(LogLevel.Debug, "📋 This is a debug message");
  Host.log(LogLevel.Warn, "⚠️ This is a warning message");
  
  // Test add_numbers host function  
  const sum = add_numbers(10, 32);
  
  // Output the results
  Host.outputString(`Host function tests completed! Time: ${time.toString()}, Sum: ${sum.toString()}`);
  
  return 0;
}
