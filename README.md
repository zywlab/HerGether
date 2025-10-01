# 她聚 (SheJuu) - 女性专属社交活动平台

这是一个支持 Web 和微信小程序的跨平台社交活动应用，专为女性用户设计，提供安全的社交环境和丰富的活动功能。

## ✨ 主要功能

### 👥 社交活动
- **活动广场**: 浏览和发现各类女性活动
- **活动发布**: 创建和组织活动
- **活动管理**: 管理自己的活动和参与记录
- **兴趣匹配**: 基于兴趣爱好的智能推荐

### 🔐 安全认证
- **性别验证**: 三层验证系统确保用户安全
  - AI 人脸识别验证
  - 身份证 OCR 识别
  - 人工申诉审核
- **隐私保护**: 严格的用户信息保护机制
- **管理员系统**: 基于微信 openId 的安全管理

### 📱 多平台支持
- **微信小程序**: 原生小程序体验
- **Web 应用**: 桌面端管理后台
- **响应式设计**: 适配各种设备尺寸

## 🏗️ 项目架构

## 项目结构

```
├── apps/
│   ├── web/                 # Web 管理后台 (Vite + React)
│   │   ├── src/
│   │   │   ├── api/         # 后端 API 服务
│   │   │   ├── components/  # React 组件
│   │   │   └── pages/       # 页面组件
│   │   └── .env.example     # 环境变量示例
│   └── miniapp/             # 微信小程序 (Taro + React)
│       ├── src/
│       │   ├── pages/       # 小程序页面
│       │   ├── components/  # 组件库
│       │   └── utils/       # 工具函数
│       └── config/          # 配置文件
├── packages/
│   └── shared/              # 共享代码库 (API、工具函数)
├── scripts/                 # 部署和构建脚本
├── deploy-admin-auth.sh     # 管理员认证系统部署脚本
├── check-admin-auth.sh      # 系统状态检查脚本
├── ADMIN-AUTH-GUIDE.md      # 管理员认证系统使用指南
└── package.json             # 根配置 (workspace)
```

## 🚀 快速开始

### 基础开发环境

```bash
# 安装所有依赖
npm install

# 开发 Web 应用
npm run dev:web

# 开发微信小程序
npm run dev:miniapp
```

### 🔐 管理员认证系统部署

使用我们提供的一键部署脚本：

```bash
# 快速部署（开发环境）
./deploy-admin-auth.sh dev

# 生产环境部署
./deploy-admin-auth.sh production

# 检查系统状态
./check-admin-auth.sh
```

详细配置指南请参考：[管理员认证系统使用指南](./ADMIN-AUTH-GUIDE.md)

### 手动部署

#### 1. 配置环境变量
```bash
cp apps/web/.env.example apps/web/.env
# 编辑 .env 文件，配置微信小程序信息
```

#### 2. 启动后端API
```bash
cd apps/web/src/api
npm install
npm start
```

#### 3. 构建小程序
```bash
cd apps/miniapp
npm install
npm run build:weapp
```

## 📋 生产构建

```bash
# 构建 Web 管理后台
npm run build:web

# 构建微信小程序
npm run build:miniapp
```

## 🛠️ 技术栈

### 微信小程序
- **框架**: Taro 3.6+ 
- **语言**: TypeScript + React
- **样式**: Sass
- **状态管理**: React Hooks + Taro Storage
- **构建工具**: Webpack 5

### Web 管理后台
- **前端**: Vite + React 18
- **UI 库**: Radix UI + Tailwind CSS
- **路由**: React Router
- **状态管理**: React Hooks

### 后端 API
- **框架**: Express.js + Node.js
- **认证**: JWT + 微信 openId
- **数据存储**: 内存存储 (可扩展为数据库)
- **安全**: CORS + 权限验证

### 共享代码
- **API 客户端**: 统一的网络请求库
- **工具函数**: 通用业务逻辑
- **类型定义**: TypeScript 类型系统

## 🔒 安全特性

### 多层身份验证
1. **微信官方认证**: 通过微信登录获取可信身份
2. **openId 白名单**: 基于微信 openId 的管理员权限控制
3. **JWT Token**: 安全的会话管理
4. **权限验证**: 每次操作都进行权限检查

### 性别验证系统
1. **AI 人脸识别**: 智能识别用户性别
2. **身份证 OCR**: 通过证件验证身份信息
3. **人工申诉**: 提供申诉渠道确保公平性
4. **隐私保护**: 敏感信息脱敏处理

## 📱 功能模块

### 用户端 (微信小程序)
- 👤 **用户认证**: 微信登录、性别验证
- 🏠 **活动广场**: 浏览、搜索、筛选活动
- ➕ **活动发布**: 创建和管理活动
- 📅 **我的活动**: 管理参与和组织的活动
- ⚙️ **个人设置**: 个人信息、隐私设置

### 管理端 (小程序 + Web)
- 🛠️ **管理员面板**: 用户管理、内容审核
- 👥 **管理员管理**: 添加/删除管理员
- 📊 **数据统计**: 用户活跃度、活动数据分析
- 🔍 **内容审核**: 活动内容、用户举报处理

## 🚀 部署指南

### 生产环境部署

#### 服务器要求
- Node.js 16+ 
- 内存: 最低 512MB，推荐 1GB+
- 网络: 支持 HTTPS (微信小程序要求)

#### 部署步骤
1. **克隆代码**
   ```bash
   git clone <repository-url>
   cd base44project
   ```

2. **一键部署**
   ```bash
   ./deploy-admin-auth.sh production
   ```

3. **配置域名和SSL**
   - 配置反向代理 (Nginx/Apache)
   - 配置 SSL 证书
   - 更新 API 基础地址

#### 微信小程序发布
1. 使用微信开发者工具打开 `apps/miniapp/dist/`
2. 配置服务器域名
3. 上传代码到微信后台
4. 提交审核

### 开发环境设置

#### 本地开发
```bash
# 开发环境部署
./deploy-admin-auth.sh dev

# 启动前端开发服务
npm run dev:web
npm run dev:miniapp
```

#### 调试技巧
- 使用微信开发者工具的网络面板查看 API 请求
- 查看后端控制台日志进行问题排查
- 使用 `./check-admin-auth.sh` 检查系统状态

## 📚 文档和支持

### 详细文档
- [管理员认证系统使用指南](./ADMIN-AUTH-GUIDE.md)
- [性别验证产品需求文档](./GENDER-VERIFICATION-PRD.md)
- [系统设计文档](./GENDER-VERIFICATION-SYSTEM.md)
- [部署检查清单](./DEPLOYMENT-CHECKLIST.md)
- [测试报告](./TEST_REPORT.md)

### 脚本工具
- `deploy-admin-auth.sh` - 一键部署脚本
- `check-admin-auth.sh` - 系统状态检查
- `deploy-ocr.sh` - OCR 服务部署
- `scripts/build.sh` - 构建脚本

### 开发支持
- 技术支持: app@base44.com
- 问题反馈: GitHub Issues
- 文档更新: 欢迎提交 PR

## 🔧 配置说明

### 环境变量
```env
# 微信小程序配置
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret

# 安全配置
JWT_SECRET=your_jwt_secret
INITIAL_ADMIN_OPENIDS=openid1,openid2

# 服务配置
NODE_ENV=production
PORT=3000
```

### 关键配置文件
- `apps/web/.env` - 后端环境变量
- `apps/miniapp/config/` - 小程序配置
- `apps/web/src/api/adminConfig.js` - 管理员配置
- `docker-compose.yml` - Docker 部署配置

## 🤝 贡献指南

我们欢迎社区贡献！请查看贡献指南并遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**她聚团队** - 专注于为女性用户提供安全、可靠的社交平台 💖