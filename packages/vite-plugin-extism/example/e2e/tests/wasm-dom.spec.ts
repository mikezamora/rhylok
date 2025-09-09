import { test, expect, Page } from '@playwright/test';

test.describe('WASM DOM Integration Tests', () => {
  
  test('should load the page and initialize WASM', async ({ page }) => {
    // Navigate to the page
    await page.goto('/');
    
    // Check basic page structure
    await expect(page.locator('#app')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Extism WASM Plugin Example');
    await expect(page.locator('#test-button')).toBeVisible();
    await expect(page.locator('#output-area')).toBeVisible();
    
    // Wait for WASM to load and initialize
    await page.waitForTimeout(3000);
    
    // Basic smoke test - page loaded successfully
    const title = await page.title();
    expect(title).toContain('Extism');
  });

  test('should call getElementById and find DOM elements', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
    });

    await page.goto('/');
    await page.waitForTimeout(4000); // Give WASM time to fully initialize
    
    // Debug output - show all console messages
    console.log('All console messages:');
    consoleMessages.forEach((msg, i) => console.log(`${i + 1}: ${msg}`));
    
    // Look for getElementById calls in console messages
    const getElementByIdCalls = consoleMessages.filter(msg => 
      msg.includes('getElementById') || 
      msg.includes('Looking for element') ||
      msg.includes('🔍')
    );
    
    // Debug output
    console.log('All console messages:', consoleMessages.length);
    console.log('getElementById related messages:', getElementByIdCalls.length);
    
    // Should have found some getElementById calls from WASM main function
    expect(getElementByIdCalls.length).toBeGreaterThan(0);
  });

  test('should handle button clicks and update DOM', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000); // Wait for WASM to load
    
    // Get initial output area text
    const initialText = await page.locator('#output-area').textContent();
    
    // Click the WASM test button
    await page.click('#test-button');
    await page.waitForTimeout(1000);
    
    // Check if output area changed
    const newText = await page.locator('#output-area').textContent();
    expect(newText).not.toBe(initialText);
    
    // Should contain some indication of WASM interaction
    expect(newText).toMatch(/WASM|clicked|working/i);
  });

  test('should process text through WASM', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Fill input and click process
    await page.fill('#text-input', 'test');
    await page.click('#process-text');
    await page.waitForTimeout(1000);
    
    // Check output shows processed text
    const outputText = await page.locator('#output-area').textContent();
    expect(outputText).toContain('Processed:');
  });

});
