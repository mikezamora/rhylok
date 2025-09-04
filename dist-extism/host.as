
// Log a message to the host console
declare function log(
  param0: usize
): void


// Play a sound file from the host
declare function playSound(
  param0: usize,
  param1: f32
): i32


// Get current timestamp from host
declare function getTime(
  
): f64


// Make HTTP request via host
declare function httpRequest(
  param0: usize,
  param1: usize
): usize
