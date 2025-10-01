#!/bin/bash

echo "🔍 Base44 Multi-Platform Deployment Check"

# 检查 Web 构建产物
if [ -d "apps/web/dist" ]; then
    echo "✅ Web build exists at apps/web/dist/"
    echo "📁 Web files:"
    ls -la apps/web/dist/ | head -5
else
    echo "❌ Web build not found. Run: npm run build:web"
fi

echo ""

# 检查小程序构建产物  
if [ -d "apps/miniapp/dist" ]; then
    echo "✅ MiniApp build exists at apps/miniapp/dist/"
    echo "📁 MiniApp files:"
    ls -la apps/miniapp/dist/ | head -5
else
    echo "❌ MiniApp build not found. Run: npm run build:miniapp"
fi

echo ""
echo "🚀 Deployment URLs:"
echo "📱 MiniApp: Import apps/miniapp/dist/ into WeChat DevTools"
echo "🌐 Web: Deploy apps/web/dist/ to your hosting service"
