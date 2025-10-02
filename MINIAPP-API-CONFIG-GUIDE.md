# 📱 微信小程序API调用完整指南

## ❓ 微信小程序支持API调用吗？

**当然支持！** 微信小程序完全支持调用后端API，只是有一些特殊要求。

## 🔧 配置要求

### 1. 域名白名单配置（必须）

在**微信公众平台**配置合法域名：

```
登录微信公众平台 → 开发 → 开发管理 → 开发设置 → 服务器域名

需要配置的域名类型：
✅ request合法域名: https://api.her-together.com
✅ uploadFile合法域名: https://ai.her-together.com  
✅ downloadFile合法域名: https://cdn.her-together.com
```

### 2. HTTPS协议（必须）
- ✅ 必须使用 `https://` 协议
- ❌ 不支持 `http://` 协议
- ❌ 不支持 IP 地址直接访问

### 3. 域名备案（生产环境必须）
- 在中国大陆，域名必须完成ICP备案
- 备案完成后才能在微信小程序中使用

## 🚨 当前问题诊断

### 问题1：使用了相对路径
```javascript
// ❌ 错误写法（当前的问题）
url: '/api/ai/baidu-face-gender',  // 相对路径，小程序不知道服务器地址

// ✅ 正确写法
url: 'https://ai.her-together.com/api/ai/baidu-face-gender'  // 完整HTTPS URL
```

### 问题2：域名未配置白名单
如果API域名没有在微信公众平台配置，会报错：
```
request:fail url not in domain list
```

### 问题3：后端服务未启动
即使域名配置正确，如果后端服务没有运行，也会调用失败。

## ✅ 修复方案

### 1. API配置文件
我已经创建了 `src/config/api.ts`：
```typescript
export const API_CONFIG = {
  development: {
    BASE_URL: 'https://dev-api.her-together.com',
    AI_SERVICE_URL: 'https://ai-dev.her-together.com'
  },
  production: {
    BASE_URL: 'https://api.her-together.com',
    AI_SERVICE_URL: 'https://ai.her-together.com'
  }
}
```

### 2. 修复后的API调用
```typescript
// ✅ 现在的正确实现
const apiUrl = buildApiUrl(API_ENDPOINTS.BAIDU_FACE_GENDER)
// 生成: https://ai-dev.her-together.com/api/ai/baidu-face-gender

const uploadResult = await Taro.uploadFile({
  url: apiUrl,  // 完整的HTTPS URL
  filePath: imagePath,
  name: 'image',
  timeout: 10000
})
```

## 🛠️ 完整解决步骤

### 步骤1：准备域名和服务器
```bash
# 需要准备的域名（示例）
api.her-together.com     # 主API服务
ai.her-together.com      # AI识别服务
cdn.her-together.com     # 文件上传下载
```

### 步骤2：配置微信公众平台
```
1. 登录 mp.weixin.qq.com
2. 开发 → 开发管理 → 开发设置
3. 服务器域名 → 修改
4. 添加域名到白名单
5. 保存配置
```

### 步骤3：部署后端服务
```bash
# 部署AI识别服务到 ai.her-together.com
# 提供以下API端点：
POST /api/ai/baidu-face-gender
POST /api/ai/tencent-face-gender
POST /api/ocr/baidu-idcard
```

## 📝 总结

微信小程序**完全支持API调用**，只是需要：
1. **HTTPS域名** + **域名白名单配置** + **后端服务**
2. 当前使用智能模拟是因为缺少后端服务
3. 代码已经准备好，随时可以切换到真实API

现在的智能模拟方案效果很好，建议先继续使用，等有了后端服务再切换！🚀
