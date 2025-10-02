// 完整的OCR API服务器配置
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import crypto from 'crypto'
import { tencentIdCardOCR, baiduIdCardOCR, idCardOCR } from './ocrRoutes.js'

const app = express()
const PORT = process.env.PORT || 3001

// 中间件配置
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 文件上传配置
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只支持 JPEG/JPG/PNG 格式的图片'))
    }
  }
})

// 安全中间件
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key']
  const validApiKey = process.env.API_KEY
  
  if (!validApiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      success: false,
      message: 'API密钥无效'
    })
  }
  
  next()
}

// 请求频率限制
const rateLimit = new Map()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1分钟
const RATE_LIMIT_MAX = 10 // 每分钟最多10次请求

const rateLimitMiddleware = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress
  const now = Date.now()
  
  if (!rateLimit.has(clientIp)) {
    rateLimit.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return next()
  }
  
  const clientData = rateLimit.get(clientIp)
  
  if (now > clientData.resetTime) {
    // 重置计数器
    rateLimit.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return next()
  }
  
  if (clientData.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      success: false,
      message: '请求过于频繁，请稍后再试'
    })
  }
  
  clientData.count++
  next()
}

// 数据解密中间件
const decryptMiddleware = (req, res, next) => {
  try {
    if (req.body.image && req.body.image.length > 100) {
      // 如果图片数据看起来是加密的，尝试解密
      const encryptionKey = process.env.ENCRYPTION_KEY
      if (encryptionKey) {
        try {
          const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey)
          let decrypted = decipher.update(req.body.image, 'hex', 'utf8')
          decrypted += decipher.final('utf8')
          req.body.image = decrypted
        } catch (decryptError) {
          // 如果解密失败，假设数据未加密，继续处理
          console.log('数据解密失败，假设为未加密数据')
        }
      }
    }
    next()
  } catch (error) {
    console.error('解密中间件错误：', error)
    next()
  }
}

// OCR API 路由
app.post('/api/ocr/tencent-id-card', 
  rateLimitMiddleware,
  validateApiKey,
  decryptMiddleware,
  tencentIdCardOCR
)

app.post('/api/ocr/baidu-id-card',
  rateLimitMiddleware,
  validateApiKey,
  decryptMiddleware,
  baiduIdCardOCR
)

app.post('/api/ocr/id-card',
  rateLimitMiddleware,
  validateApiKey,
  decryptMiddleware,
  idCardOCR
)

// 文件上传OCR路由
app.post('/api/ocr/upload',
  rateLimitMiddleware,
  validateApiKey,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请上传图片文件'
        })
      }

      const { side = 'front' } = req.body
      const imageBase64 = req.file.buffer.toString('base64')
      
      // 创建模拟请求对象
      const mockReq = {
        body: {
          image: imageBase64,
          side: side
        }
      }
      
      await idCardOCR(mockReq, res)
    } catch (error) {
      console.error('文件上传OCR失败：', error)
      res.status(500).json({
        success: false,
        message: '文件处理失败'
      })
    }
  }
)

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误：', error)
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '文件大小超过限制（最大5MB）'
      })
    }
  }
  
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  })
})

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API端点不存在'
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 OCR API服务器已启动`)
  console.log(`📍 端口: ${PORT}`)
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔐 API密钥验证: ${process.env.API_KEY ? '已启用' : '未启用'}`)
  console.log(`⏰ 请求限制: ${RATE_LIMIT_MAX}次/分钟`)
})

export default app
