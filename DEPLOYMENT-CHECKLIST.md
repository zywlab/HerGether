# 🔐 OCR API 生产环境配置清单

## ✅ 必须完成的配置项

### 1. 云服务API密钥配置

#### 腾讯云OCR
- [ ] 注册腾讯云账号
- [ ] 开通"文字识别OCR"服务
- [ ] 获取 `TENCENT_SECRET_ID`
- [ ] 获取 `TENCENT_SECRET_KEY`
- [ ] 设置地域为 `ap-beijing`

#### 百度云OCR
- [ ] 注册百度智能云账号
- [ ] 开通"文字识别"服务
- [ ] 创建应用获取 `BAIDU_API_KEY`
- [ ] 获取 `BAIDU_SECRET_KEY`

### 2. 安全密钥生成
- [ ] 运行 `node generate-keys.js` 生成密钥
- [ ] 配置 `ENCRYPTION_KEY` (32位随机字符)
- [ ] 配置 `JWT_SECRET` (64位base64字符)
- [ ] 配置 `API_KEY` (用于API认证)

### 3. 环境配置文件
- [ ] 复制 `.env.example` 到 `.env.production`
- [ ] 填写所有必须的环境变量
- [ ] 设置正确的 `API_BASE_URL`
- [ ] 配置 `ALLOWED_ORIGINS`

### 4. 小程序配置
- [ ] 更新 `OCR_CONFIG.proxy.baseUrl`
- [ ] 添加API域名到微信小程序后台
- [ ] 配置request合法域名

## 🛠️ 可选配置项

### 1. 高级安全设置
- [ ] 配置SSL证书
- [ ] 设置WAF防火墙
- [ ] 启用IP白名单
- [ ] 配置日志监控

### 2. 性能优化
- [ ] 配置CDN加速
- [ ] 设置Redis缓存
- [ ] 配置负载均衡
- [ ] 优化图片压缩参数

### 3. 监控告警
- [ ] 配置API调用量监控
- [ ] 设置错误率告警
- [ ] 配置成本预算提醒
- [ ] 设置健康检查

## 🚀 部署检查

### 1. Docker部署
- [ ] 安装Docker和docker-compose
- [ ] 构建Docker镜像
- [ ] 启动服务容器
- [ ] 验证健康检查

### 2. 服务验证
- [ ] 访问 `/health` 端点
- [ ] 测试OCR API接口
- [ ] 验证错误处理
- [ ] 检查日志输出

### 3. 小程序测试
- [ ] 上传身份证正面照片
- [ ] 验证OCR识别结果
- [ ] 测试错误处理流程
- [ ] 验证性别更新功能

## 🔒 安全检查

### 1. 密钥安全
- [ ] 密钥不在代码中硬编码
- [ ] 环境变量文件不提交到Git
- [ ] 生产密钥与开发密钥不同
- [ ] 定期轮换API密钥

### 2. 网络安全
- [ ] 强制HTTPS访问
- [ ] 设置CORS策略
- [ ] 配置请求频率限制
- [ ] 启用安全头部

### 3. 数据安全
- [ ] 图片数据加密传输
- [ ] 临时文件自动清理
- [ ] 用户隐私信息加密
- [ ] 符合数据保护法规

## 📊 监控指标

### 1. 技术指标
- [ ] API响应时间 < 3秒
- [ ] OCR识别成功率 > 95%
- [ ] 服务可用性 > 99.9%
- [ ] 错误率 < 1%

### 2. 业务指标
- [ ] 用户验证通过率
- [ ] 图片质量合格率
- [ ] 用户体验满意度
- [ ] 成本控制在预算内

## ⚠️ 常见问题预防

### 1. API限额
- [ ] 监控日调用量
- [ ] 设置用量告警
- [ ] 准备备用服务商
- [ ] 优化调用频率

### 2. 图片质量
- [ ] 提供拍照指导
- [ ] 实现质量检测
- [ ] 支持重新上传
- [ ] 人工审核兜底

### 3. 网络异常
- [ ] 实现重试机制
- [ ] 设置合理超时
- [ ] 提供离线提示
- [ ] 缓存机制优化

---

## 🎯 部署步骤

1. **准备阶段**
   ```bash
   # 生成密钥
   node generate-keys.js
   
   # 配置环境
   cp .env.example .env.production
   # 编辑 .env.production
   ```

2. **部署阶段**
   ```bash
   # Docker部署
   ./deploy-ocr.sh
   
   # 或直接运行
   cd apps/web/src/api && node ocrServer.js
   ```

3. **验证阶段**
   ```bash
   # 健康检查
   curl http://localhost:3001/health
   
   # API测试
   curl -X POST http://localhost:3001/api/ocr/id-card \
     -H "Content-Type: application/json" \
     -H "X-API-Key: your_api_key" \
     -d '{"image":"base64_data","side":"front"}'
   ```

**📝 配置完成后，请在本清单上打勾确认每一项都已正确设置！**
