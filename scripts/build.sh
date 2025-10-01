#!/bin/bash

echo "🚀 Base44 Multi-Platform Build Script"

# 构建 Web 应用
echo "📦 Building Web App..."
cd apps/web
npm run build
cd ../..

# 构建微信小程序
echo "📱 Building MiniApp..."
cd apps/miniapp  
npm run build:weapp
cd ../..

echo "✅ Build completed!"
echo "📂 Web build: apps/web/dist/"
echo "📂 MiniApp build: apps/miniapp/dist/"
