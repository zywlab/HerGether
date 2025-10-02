const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const authRoutes = require('./authRoutes')
const appealRoutes = require('./appealRoutes')
const ocrRoutes = require('./ocrRoutes')

const app = express()
const PORT = process.env.PORT || 3000

// 中间件配置
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-domain.com'], // 根据实际域名配置
  credentials: true
}))
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

// 路由配置
app.use('/api/auth', authRoutes)
app.use('/api/admin', authRoutes) // admin routes are included in authRoutes
app.use('/api/appeal', appealRoutes)
app.use('/api/ocr', ocrRoutes)

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: '她聚 Backend API'
  })
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('API Error:', err)
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  })
})

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 她聚 Backend API Server running on port ${PORT}`)
    console.log(`📱 Health check: http://localhost:${PORT}/health`)
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`)
    console.log(`👥 Admin API: http://localhost:${PORT}/api/admin`)
    console.log(`📧 Appeal API: http://localhost:${PORT}/api/appeal`)
    console.log(`🔍 OCR API: http://localhost:${PORT}/api/ocr`)
  })
}

module.exports = app
