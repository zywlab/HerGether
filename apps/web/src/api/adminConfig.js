// 管理员身份验证配置
// 这个文件包含了管理员认证所需的配置信息

module.exports = {
  // WeChat 小程序配置
  wechat: {
    // 请替换为您的微信小程序 AppID 和 AppSecret
    appId: process.env.WECHAT_APP_ID || 'your_wechat_app_id',
    appSecret: process.env.WECHAT_APP_SECRET || 'your_wechat_app_secret',
    
    // 微信登录 API 地址
    loginUrl: 'https://api.weixin.qq.com/sns/jscode2session'
  },

  // JWT Token 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    expiresIn: '7d' // Token 有效期：7天
  },

  // 管理员配置
  admin: {
    // 初始管理员 openId 列表（建议通过环境变量配置）
    initialAdmins: process.env.INITIAL_ADMIN_OPENIDS ? 
      process.env.INITIAL_ADMIN_OPENIDS.split(',') : 
      [],
    
    // 开发环境的测试管理员 openId
    developmentAdmins: [
      'dev_admin_openid_1',
      'dev_admin_openid_2'
    ]
  },

  // 数据库配置（如果使用数据库存储管理员列表）
  database: {
    // 可以配置 MongoDB、MySQL 等数据库连接信息
    // 目前使用内存存储，生产环境建议使用持久化存储
    type: 'memory', // 'memory' | 'mongodb' | 'mysql'
    
    // MongoDB 配置示例
    mongodb: {
      url: process.env.MONGODB_URL || 'mongodb://localhost:27017/shejuu',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    }
  },

  // 安全配置
  security: {
    // 管理员操作日志记录
    enableAuditLog: true,
    
    // 限制管理员添加频率（防止滥用）
    rateLimits: {
      addAdmin: {
        windowMs: 60 * 60 * 1000, // 1 小时
        max: 10 // 每小时最多添加 10 个管理员
      }
    }
  },

  // 开发环境配置
  development: {
    // 开发环境下是否跳过微信登录验证
    skipWechatVerification: process.env.NODE_ENV === 'development' && process.env.SKIP_WECHAT_AUTH === 'true',
    
    // 开发环境默认管理员权限
    defaultAdminInDev: true
  }
}
