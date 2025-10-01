# 她聚管理员认证系统 - 部署与使用指南

## 概述

本文档介绍如何部署和使用她聚小程序的管理员认证系统。该系统基于微信 openId 实现安全的管理员身份验证，支持动态管理员添加/删除功能。

## 🏗️ 系统架构

### 前端（微信小程序）
- **框架**: Taro 3.6+ + React + TypeScript
- **管理员页面**:
  - `/pages/admin-panel/index.tsx` - 管理员操作面板
  - `/pages/admin-management/index.tsx` - 管理员用户管理
- **认证服务**: `apps/miniapp/src/utils/adminAuthService.ts`

### 后端（Node.js API）
- **框架**: Express.js
- **认证路由**: `apps/web/src/api/authRoutes.js`
- **配置文件**: `apps/web/src/api/adminConfig.js`
- **主服务器**: `apps/web/src/api/server.js`

## 🚀 部署步骤

### 1. 后端API部署

#### 安装依赖
```bash
cd apps/web/src/api
npm install
```

#### 环境配置
1. 复制环境变量模板：
```bash
cp ../../.env.example .env
```

2. 编辑 `.env` 文件，填入实际配置：
```env
# 微信小程序配置
WECHAT_APP_ID=你的微信小程序AppID
WECHAT_APP_SECRET=你的微信小程序AppSecret

# JWT密钥（请使用强密码）
JWT_SECRET=your_super_secret_jwt_key_32_chars

# 初始管理员openId（从微信开发者工具获取）
INITIAL_ADMIN_OPENIDS=openid1,openid2,openid3

# 开发环境配置
NODE_ENV=production
SKIP_WECHAT_AUTH=false
```

#### 获取微信小程序配置
1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入您的小程序后台
3. 在「开发」-「开发管理」-「开发设置」中获取：
   - AppID（小程序ID）
   - AppSecret（小程序密钥）

#### 获取管理员 openId
1. 在微信开发者工具中运行小程序
2. 在控制台中运行以下代码获取当前用户的 openId：
```javascript
wx.login({
  success: (res) => {
    console.log('当前用户的 code:', res.code)
    // 将此 code 发送给后端，后端调用微信API获取 openId
  }
})
```

3. 或者在小程序中添加临时调试代码：
```typescript
// 在小程序页面中添加
const getOpenId = async () => {
  try {
    const { code } = await Taro.login()
    const response = await Taro.request({
      url: 'https://your-api-domain.com/api/auth/get-openid',
      method: 'POST',
      data: { code }
    })
    console.log('当前用户 openId:', response.data.openId)
  } catch (error) {
    console.error('获取 openId 失败:', error)
  }
}
```

#### 启动服务
```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

### 2. 前端小程序配置

#### 更新API基础地址
编辑 `apps/miniapp/src/utils/adminAuthService.ts`，更新API地址：
```typescript
const API_BASE_URL = 'https://your-api-domain.com' // 替换为您的API域名
```

#### 编译和部署小程序
```bash
cd apps/miniapp
npm run build:weapp
```

然后使用微信开发者工具打开 `dist` 目录，上传到微信后台。

## 👥 管理员管理

### 初始管理员设置
1. 在 `.env` 文件中配置 `INITIAL_ADMIN_OPENIDS`
2. 重启后端服务，这些 openId 会自动成为管理员

### 添加新管理员
1. 管理员登录小程序
2. 进入「我的」-「管理员管理」
3. 输入新管理员的微信 openId
4. 点击「添加管理员」

### 删除管理员
1. 在管理员管理页面中找到要删除的管理员
2. 点击「移除」按钮
3. 确认删除操作

### 获取用户 openId 的方法
为了添加新管理员，您需要获取目标用户的 openId：

1. **通过小程序调试**：让目标用户运行上述调试代码
2. **通过后端日志**：在用户登录时记录 openId
3. **通过管理员工具**：可以在管理员面板中添加「查看用户openId」功能

## 🔒 安全特性

### 多层安全验证
1. **微信官方认证**：通过微信 code2session 验证用户身份
2. **openId 白名单**：只有预设的 openId 才能获得管理员权限
3. **JWT Token**：使用加密token进行会话管理
4. **权限检查**：每次管理员操作都会验证权限

### 安全最佳实践
1. **定期更换JWT密钥**
2. **限制管理员数量**：避免过多管理员账户
3. **审计日志**：记录所有管理员操作
4. **网络安全**：使用HTTPS协议
5. **定期审查**：定期检查管理员列表

## 🛠️ 开发调试

### 开发环境设置
```env
NODE_ENV=development
SKIP_WECHAT_AUTH=true  # 跳过微信登录验证（仅开发环境）
```

### 调试工具
1. **后端日志**：查看服务器控制台输出
2. **微信开发者工具**：使用网络面板查看API请求
3. **小程序调试**：在微信开发者工具中查看console输出

### 常见问题排查

#### 1. 无法获取管理员权限
- 检查 openId 是否正确添加到白名单
- 确认微信 AppID 和 AppSecret 配置正确
- 查看后端日志确认认证流程

#### 2. API调用失败
- 检查网络连接和API地址
- 确认CORS配置正确
- 检查请求参数格式

#### 3. Token过期
- 检查JWT配置
- 确认token有效期设置
- 验证时间同步

## 📊 监控和维护

### 日志监控
系统会记录以下关键事件：
- 管理员登录/登出
- 管理员添加/删除操作
- 权限验证失败尝试
- API调用异常

### 性能监控
- API响应时间
- 并发用户数
- 数据库查询性能
- 内存使用情况

### 备份策略
1. **管理员数据备份**：定期备份管理员openId列表
2. **配置文件备份**：备份环境变量和配置文件
3. **日志归档**：定期归档操作日志

## 🔄 升级和扩展

### 数据库集成
当前系统使用内存存储，生产环境建议升级为数据库存储：

```javascript
// adminConfig.js 中配置数据库
database: {
  type: 'mongodb', // 或 'mysql'
  mongodb: {
    url: 'mongodb://localhost:27017/shejuu'
  }
}
```

### 功能扩展
1. **角色权限系统**：添加不同级别的管理员权限
2. **操作审计**：详细记录管理员操作历史
3. **批量操作**：支持批量添加/删除管理员
4. **通知系统**：管理员变更时发送通知

## 📞 技术支持

如有问题，请联系技术团队或查看以下资源：
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/)
- [Taro框架文档](https://taro-docs.jd.com/)
- [Express.js文档](https://expressjs.com/)

---

**重要提醒**：在生产环境中，请务必使用强密码，定期更新密钥，并建立完善的安全监控机制。
