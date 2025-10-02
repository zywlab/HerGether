#!/bin/bash

# 微信小程序项目提取脚本
# 将当前项目中的小程序部分提取为独立项目

echo "🚀 开始提取微信小程序项目..."

# 检查参数
if [ -z "$1" ]; then
    echo "❌ 请提供目标目录名称"
    echo "用法: ./extract-miniapp.sh <target-directory>"
    exit 1
fi

TARGET_DIR="$1"
SOURCE_DIR="$(pwd)"

echo "📁 源目录: $SOURCE_DIR"
echo "📁 目标目录: $TARGET_DIR"

# 创建目标目录
if [ -d "$TARGET_DIR" ]; then
    echo "⚠️  目标目录已存在，将清空并重新创建"
    rm -rf "$TARGET_DIR"
fi

mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

# 初始化git仓库
echo "🔧 初始化Git仓库..."
git init

# 创建基础项目结构
echo "📦 创建项目结构..."

# 复制小程序相关文件
echo "📱 复制微信小程序文件..."
cp -r "$SOURCE_DIR/apps/miniapp" ./
mv miniapp/* ./
rmdir miniapp

# 复制共享的packages (如果小程序依赖的话)
if [ -d "$SOURCE_DIR/packages" ]; then
    echo "📚 复制共享包..."
    cp -r "$SOURCE_DIR/packages" ./
fi

# 复制相关的脚本文件
echo "🔧 复制构建脚本..."
mkdir -p scripts
if [ -f "$SOURCE_DIR/scripts/build.sh" ]; then
    # 修改build.sh，只保留小程序部分
    cat > scripts/build.sh << 'EOF'
#!/bin/bash

echo "🚀 微信小程序构建脚本"

echo "📱 Building MiniApp..."
npm run build:weapp

echo "✅ Build completed!"
echo "📂 MiniApp build: dist/"
EOF
    chmod +x scripts/build.sh
fi

if [ -f "$SOURCE_DIR/scripts/check-deploy.sh" ]; then
    # 修改check-deploy.sh，只检查小程序
    cat > scripts/check-deploy.sh << 'EOF'
#!/bin/bash

echo "🔍 微信小程序部署检查"

if [ -d "dist" ]; then
    echo "✅ MiniApp build exists at dist/"
    echo "📁 MiniApp files:"
    ls -la dist/ | head -5
else
    echo "❌ MiniApp build not found. Run: npm run build:weapp"
fi

echo ""
echo "🚀 部署说明:"
echo "📱 MiniApp: 将 dist/ 目录导入微信开发者工具"
EOF
    chmod +x scripts/check-deploy.sh
fi

# 创建新的package.json，只包含小程序相关配置
echo "📄 创建package.json..."
cat > package.json << 'EOF'
{
  "name": "shejuu-miniapp",
  "version": "1.0.0",
  "description": "她聚 - 女性社交平台微信小程序",
  "main": "index.js",
  "scripts": {
    "dev": "npm run dev:weapp",
    "dev:weapp": "taro build --type weapp --watch",
    "dev:weapp:prod": "NODE_ENV=production taro build --type weapp --watch",
    "build": "npm run build:weapp",
    "build:weapp": "taro build --type weapp",
    "build:weapp:prod": "NODE_ENV=production taro build --type weapp",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "build:script": "./scripts/build.sh",
    "check:deploy": "./scripts/check-deploy.sh"
  },
  "keywords": [
    "miniapp",
    "wechat",
    "taro",
    "react",
    "social",
    "women"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "@tarojs/components": "3.6.25",
    "@tarojs/helper": "3.6.25", 
    "@tarojs/plugin-platform-weapp": "3.6.25",
    "@tarojs/react": "3.6.25",
    "@tarojs/runtime": "3.6.25",
    "@tarojs/shared": "3.6.25",
    "@tarojs/taro": "3.6.25",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.8.0",
    "@tarojs/cli": "3.6.25",
    "@tarojs/webpack5-runner": "3.6.25",
    "@types/react": "^18.0.0",
    "@typescript-eslint/eslint-plugin": "^5.20.0",
    "@typescript-eslint/parser": "^5.20.0",
    "babel-preset-taro": "3.6.25",
    "eslint": "^8.12.0",
    "eslint-plugin-react": "^7.8.2",
    "eslint-plugin-react-hooks": "^4.2.0",
    "typescript": "^4.1.0",
    "webpack": "5.78.0"
  }
}
EOF

# 复制相关文档
echo "📚 复制相关文档..."
if [ -f "$SOURCE_DIR/README.md" ]; then
    # 创建小程序专用的README
    cat > README.md << 'EOF'
# 她聚 - 微信小程序

女性专属社交平台，支持活动创建、参与和性别验证系统。

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发环境
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 部署检查
```bash
npm run check:deploy
```

## 📱 功能特性

- 🔐 微信登录认证
- 👥 活动创建与参与
- 🛡️ 多重性别验证系统
- ⭐ 用户评分体系
- 📊 个人数据统计

## 🛠️ 技术栈

- **框架**: Taro 3.6+ (React)
- **语言**: TypeScript
- **平台**: 微信小程序
- **状态管理**: React Hooks
- **样式**: SCSS

## 📁 项目结构

```
src/
├── app.config.ts          # 小程序配置
├── app.tsx                # 应用入口
├── pages/                 # 页面目录
│   ├── index/            # 广场页面
│   ├── profile/          # 个人中心
│   ├── login/            # 登录页面
│   ├── activities/       # 活动列表
│   ├── create-activity/  # 创建活动
│   ├── my-activities/    # 我的活动
│   └── ...
├── components/           # 公共组件
├── utils/               # 工具函数
└── styles/             # 全局样式
```

## 🔧 开发指南

### 页面路由
小程序使用 TabBar 导航，主要页面：
- 广场：`pages/index/index`
- 发布：`pages/create-activity/index`  
- 我的：`pages/profile/index`

### 性别验证系统
支持三种验证方式：
1. AI人脸识别验证
2. 身份证OCR验证
3. 人工申诉流程

### 构建部署
```bash
# 构建生产版本
npm run build

# 导入微信开发者工具
# 选择 dist/ 目录作为项目根目录
```

## 📄 许可证

MIT License
EOF
fi

# 复制其他相关文档
for doc in "GENDER-VERIFICATION-PRD.md" "GENDER-VERIFICATION-SYSTEM.md" "WECHAT-LOGIN-TEST-GUIDE.md"; do
    if [ -f "$SOURCE_DIR/$doc" ]; then
        cp "$SOURCE_DIR/$doc" ./
    fi
done

# 复制环境配置示例
if [ -f "$SOURCE_DIR/.env.example" ]; then
    cp "$SOURCE_DIR/.env.example" ./
fi

# 创建.gitignore
echo "🚫 创建.gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
temp/

# Environment files
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Taro
.temp/
.rn_temp/

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock
EOF

# 提交到git
echo "📝 创建初始提交..."
git add .
git commit -m "feat: 初始化她聚微信小程序项目

- 完整的微信小程序功能
- 性别验证系统  
- 活动管理功能
- 用户评分体系
- 个人中心页面"

echo ""
echo "✅ 微信小程序项目提取完成！"
echo ""
echo "📋 下一步操作："
echo "1. 在GitHub创建新仓库 (例如: shejuu-miniapp)"
echo "2. 添加远程仓库:"
echo "   git remote add origin https://github.com/你的用户名/仓库名.git"
echo "3. 推送代码:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "🎯 项目目录: $(pwd)"
echo "📱 开发命令: npm install && npm run dev"
EOF

chmod +x extract-miniapp.sh
