#!/bin/bash

echo "🧪 Testing the Example Project with Separate Builds"
echo "=================================================="
echo ""

# Test separate builds
echo "🔨 Building both versions..."
npm run build:all --silent

echo ""
echo "📁 Checking generated files:"

# Check normal build
echo "📦 Normal Vite Build (dist-normal/):"
if [ -f "dist-normal/index.html" ]; then
    echo "✅ dist-normal/index.html - $(du -h dist-normal/index.html | cut -f1)"
else
    echo "❌ dist-normal/index.html - Missing"
fi

if [ -d "dist-normal/assets" ]; then
    echo "✅ dist-normal/assets/ - $(du -sh dist-normal/assets | cut -f1)"
else
    echo "❌ dist-normal/assets/ - Missing"
fi

echo ""
echo "🔌 Plugin-Enhanced Build (dist-wasm/):"
if [ -f "dist-wasm/example.wasm" ]; then
    echo "✅ dist-wasm/example.wasm - $(du -h dist-wasm/example.wasm | cut -f1)"
else
    echo "❌ dist-wasm/example.wasm - Missing"
fi

if [ -f "dist-wasm/manifest.json" ]; then
    echo "✅ dist-wasm/manifest.json - $(du -h dist-wasm/manifest.json | cut -f1)"
else
    echo "❌ dist-wasm/manifest.json - Missing"
fi

if [ -f "dist-wasm/preview.html" ]; then
    echo "✅ dist-wasm/preview.html - $(du -h dist-wasm/preview.html | cut -f1)"
else
    echo "❌ dist-wasm/preview.html - Missing"
fi

echo ""
echo "📋 Manifest content:"
if [ -f "dist-wasm/manifest.json" ]; then
    cat dist-wasm/manifest.json
else
    echo "❌ Manifest file not found"
fi
echo ""

echo "🌐 Available servers:"
echo "   📦 Normal Version: http://localhost:5173 (npm run preview:normal)"
echo "   � WASM Version: http://localhost:3001 (npm run preview:wasm)"
echo "   🚀 Both Servers: npm run serve:all"
echo ""
echo "🧪 Test both versions to compare functionality:"
echo "   1. Click buttons to test event handling"
echo "   2. Enter text to test input processing" 
echo "   3. Check browser console for WASM output"
echo ""
echo "✅ Example project setup complete with separate build outputs!"
