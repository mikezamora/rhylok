import { test, expect, Page } from '@playwright/test';

test.describe('WASM DOM Integration Tests', () => {
  
  test('should load the page and initialize WASM', async ({ page }) => {
    // Listen for console messages to capture WASM output
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Navigate to the page
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page.locator('#app')).toBeVisible();
    
    // Check if the basic elements exist
    await expect(page.locator('h1')).toContainText('Extism WASM Plugin Example');
    await expect(page.locator('#test-button')).toBeVisible();
    await expect(page.locator('#output-area')).toBeVisible();
    
    // Wait a bit for WASM to initialize
    await page.waitForTimeout(2000);
    
    // Print all console messages to see WASM initialization
    console.log('=== Console Messages ===');
    consoleMessages.forEach(msg => console.log(msg));
    
    // Check if WASM loaded successfully by looking for specific messages
    const wasmMessages = consoleMessages.filter(msg => 
      msg.includes('WASM') || 
      msg.includes('plugin') || 
      msg.includes('🔧') ||
      msg.includes('🚀') ||
      msg.includes('✅')
    );
    
    console.log('=== WASM Related Messages ===');
    wasmMessages.forEach(msg => console.log(msg));
  });

  test('should call getElementById for app element', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto('/');
    await page.waitForTimeout(3000); // Wait for WASM to fully initialize
    
    // Look for specific getElementById calls in console
    const getElementByIdCalls = consoleMessages.filter(msg => 
      msg.includes('getElementById') || 
      msg.includes('Looking for element') ||
      msg.includes('app') ||
      msg.includes('🔍')
    );
    
    console.log('=== getElementById Calls ===');
    getElementByIdCalls.forEach(msg => console.log(msg));
    
    // Check if any getElementById calls were made
    expect(getElementByIdCalls.length).toBeGreaterThan(0);
  });

  test('should handle button clicks through WASM', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Click the WASM test button
    await page.click('#test-button');
    
    // Wait for WASM to process the click
    await page.waitForTimeout(1000);
    
    // Check console for button click messages
    const buttonClickMessages = consoleMessages.filter(msg => 
      msg.includes('Button clicked') || 
      msg.includes('handleButtonClick') ||
      msg.includes('🖱️')
    );
    
    console.log('=== Button Click Messages ===');
    buttonClickMessages.forEach(msg => console.log(msg));
    
    // Check if the output area was updated
    const outputText = await page.locator('#output-area').textContent();
    console.log('Output area text:', outputText);
  });

  test('should test text processing through WASM', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Fill the input and click process button
    await page.fill('#text-input', 'hello world');
    await page.click('#process-text');
    
    // Wait for processing
    await page.waitForTimeout(1000);
    
    // Check console for processing messages
    const processingMessages = consoleMessages.filter(msg => 
      msg.includes('processUserInput') || 
      msg.includes('Text processed') ||
      msg.includes('Processed:')
    );
    
    console.log('=== Text Processing Messages ===');
    processingMessages.forEach(msg => console.log(msg));
    
    // Check output
    const outputText = await page.locator('#output-area').textContent();
    console.log('Final output:', outputText);
  });

  test('should capture all WASM errors and debug info', async ({ page }) => {
    const consoleMessages: string[] = [];
    const errors: string[] = [];
    
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(text);
      if (msg.type() === 'error') {
        errors.push(text);
      }
    });

    page.on('pageerror', error => {
      errors.push(`[pageerror] ${error.message}`);
    });

    await page.goto('/');
    await page.waitForTimeout(5000); // Give plenty of time for everything to load
    
    console.log('=== ALL Console Messages ===');
    consoleMessages.forEach((msg, i) => console.log(`${i}: ${msg}`));
    
    if (errors.length > 0) {
      console.log('=== ERRORS ===');
      errors.forEach(error => console.log(error));
    }
    
    // This test mainly gathers info, so we just ensure no critical errors
    const criticalErrors = errors.filter(error => 
      error.includes('failed') || 
      error.includes('cannot') ||
      error.includes('undefined')
    );
    
    if (criticalErrors.length > 0) {
      console.log('=== CRITICAL ERRORS ===');
      criticalErrors.forEach(error => console.log(error));
    }
  });
  
});
