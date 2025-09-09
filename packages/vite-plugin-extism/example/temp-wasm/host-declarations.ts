
// Get DOM element by ID, returns 1 if found, 0 if not
declare function dom_get_element_by_id(
  param0: i32,
  param1: i32
): i32


// Add event listener to DOM element
declare function dom_add_event_listener(
  param0: i32,
  param1: i32,
  param2: i32,
  param3: i32,
  param4: i32,
  param5: i32
): i32


// Set text content of DOM element
declare function dom_set_text_content(
  param0: i32,
  param1: i32,
  param2: i32,
  param3: i32
): i32


// Console logging from WASM
declare function console_log(
  param0: i32,
  param1: i32
): void
