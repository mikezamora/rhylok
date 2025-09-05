#!/bin/bash

echo "🧪 Testing the Example Project"
echo "================================"
echo ""

# Check if files exist
echo "📁 Checking generated files:"
if [ -f "dist/example.wasm" ]; then
    echo "✅ dist/example.wasm - $(du -h dist/example.wasm | cut -f1)"
else
    echo "❌ dist/example.wasm - Missing"
fi

if [ -f "dist/manifest.json" ]; then
    echo "✅ dist/manifest.json - $(du -h dist/manifest.json | cut -f1)"
else
    echo "❌ dist/manifest.json - Missing"
fi

if [ -f "dist/index.html" ]; then
    echo "✅ dist/index.html - $(du -h dist/index.html | cut -f1)"
else
    echo "❌ dist/index.html - Missing"
fi

echo ""
echo "📋 Manifest content:"
cat dist/manifest.json
echo ""

echo "🌐 Servers available:"
echo "   📦 WASM Version: http://localhost:3002"
echo "   🔧 TypeScript Version: http://localhost:5173"
echo ""
echo "🧪 Test both versions to compare functionality:"
echo "   1. Click buttons to test event handling"
echo "   2. Enter text to test input processing" 
echo "   3. Check browser console for WASM output"
echo ""
echo "✅ Example project setup complete!"
