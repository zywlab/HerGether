# OCR API 配置和使用指南

## 🚀 快速开始

### 1. 环境配置

#### 1.1 生成API密钥
```bash
node generate-keys.js
```

#### 1.2 配置云服务API密钥

**腾讯云OCR配置：**
1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 开通"文字识别OCR"服务
3. 获取 `SecretId` 和 `SecretKey`
4. 在 `.env.local` 中配置：
```env
TENCENT_SECRET_ID=你的腾讯云SecretId
TENCENT_SECRET_KEY=你的腾讯云SecretKey
```

**百度云OCR配置：**
1. 登录 [百度智能云控制台](https://console.bce.baidu.com/)
2. 开通"文字识别"服务
3. 创建应用获取 `API Key` 和 `Secret Key`
4. 在 `.env.local` 中配置：
```env
BAIDU_API_KEY=你的百度云APIKey
BAIDU_SECRET_KEY=你的百度云SecretKey
```

### 2. 部署方式

#### 2.1 Docker部署（推荐）
```bash
# 配置环境变量
cp .env.example .env.production
# 编辑 .env.production 填入真实配置

# 部署服务
./deploy-ocr.sh
```

#### 2.2 直接运行
```bash
cd apps/web/src/api
npm install
node ocrServer.js
```

## 📝 API 接口说明

### 基础配置

**请求头部：**
```
Content-Type: application/json
X-API-Key: your_api_key
```

**速率限制：** 10次/分钟/IP

### 接口列表

#### 1. 通用身份证OCR
**POST** `/api/ocr/id-card`

**请求参数：**
```json
{
  "image": "base64编码的图片数据",
  "side": "front" // front: 正面, back: 反面
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "name": "张三",
    "gender": "女",
    "birth": "1990-01-01",
    "id_number": "110101199001011234",
    "address": "北京市朝阳区...",
    "nation": "汉"
  },
  "provider": "tencent"
}
```

#### 2. 腾讯云OCR
**POST** `/api/ocr/tencent-id-card`

#### 3. 百度云OCR  
**POST** `/api/ocr/baidu-id-card`

#### 4. 文件上传OCR
**POST** `/api/ocr/upload`

**请求方式：** `multipart/form-data`
```
image: 图片文件
side: front/back
```

## 🔒 安全特性

### 1. 图片处理安全
- ✅ 文件大小限制 (5MB)
- ✅ 格式验证 (JPEG/PNG)
- ✅ 图片压缩和优化
- ✅ 身份证内容检测
- ✅ 自动添加水印（可选）

### 2. 数据安全
- ✅ AES-256加密传输
- ✅ 临时文件自动清理
- ✅ 敏感数据加密存储
- ✅ API密钥验证

### 3. 访问控制
- ✅ IP请求频率限制
- ✅ CORS跨域保护
- ✅ HTTPS强制重定向
- ✅ 安全头部设置

## 🛠️ 小程序集成

### 1. 配置API地址
```typescript
// apps/miniapp/src/utils/idCardOCRService.ts
const OCR_CONFIG = {
  proxy: {
    baseUrl: 'https://your-api-domain.com', // 替换为你的API域名
    tencentEndpoint: '/api/ocr/tencent-id-card',
    baiduEndpoint: '/api/ocr/baidu-id-card'
  }
}
```

### 2. 使用示例
```typescript
import idCardOCRService from './utils/idCardOCRService'

// 识别身份证
const result = await idCardOCRService.recognizeIdCard(imagePath, 'front')
if (result.success) {
  console.log('识别结果:', result.data)
}
```

## 🔧 故障排除

### 常见问题

**1. OCR识别失败**
- 检查图片清晰度和光线
- 确认身份证完整在图片中
- 验证API密钥配置正确

**2. 网络请求超时**
- 检查网络连接
- 确认API服务器状态
- 适当增加请求超时时间

**3. 权限认证失败**
- 验证API-Key是否正确
- 检查请求头部设置
- 确认IP没有被限制

### 调试模式

开发环境会自动使用模拟数据，无需配置真实API密钥：
```bash
NODE_ENV=development npm run dev
```

### 日志查看

```bash
# Docker部署
docker-compose logs -f ocr-api

# 直接运行
tail -f /var/log/ocr-api.log
```

## 📊 监控和维护

### 健康检查
```bash
curl http://your-domain.com/health
```

### 性能监控
- 请求响应时间
- OCR识别成功率
- 错误日志统计

### 定期维护
- 轮换API密钥（建议每月）
- 清理临时文件
- 更新SSL证书
- 监控云服务用量

## 💰 成本优化

### API用量控制
- 设置每日调用限额
- 监控云服务费用
- 优化图片压缩比例

### 缓存策略
- 相同图片结果缓存
- 用户会话缓存
- CDN静态资源缓存

## 📞 技术支持

如遇到问题，请提供以下信息：
- 错误日志
- 请求参数
- 环境配置
- 复现步骤

---

**⚠️ 重要提醒：**
- 请妥善保管所有API密钥
- 生产环境务必使用HTTPS
- 定期备份重要配置文件
- 遵守相关法律法规和隐私政策
