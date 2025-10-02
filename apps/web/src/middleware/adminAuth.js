// 管理员身份验证中间件
import jwt from 'jsonwebtoken'

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-key-2024'

// 管理员身份验证中间件
export const adminAuthMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '缺少管理员身份认证token'
      })
    }

    const decoded = jwt.verify(token, ADMIN_SECRET)
    
    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '权限不足，需要管理员权限'
      })
    }

    req.admin = decoded
    next()
  } catch (error) {
    console.error('管理员身份验证失败：', error)
    res.status(401).json({
      success: false,
      message: '管理员身份认证失败'
    })
  }
}

// 管理员登录
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body
    
    // 这里应该从数据库验证管理员账号
    // 暂时硬编码几个管理员账号
    const adminAccounts = [
      { username: 'admin', password: 'admin123', id: '1', name: '系统管理员' },
      { username: 'reviewer', password: 'review123', id: '2', name: '审核员' }
    ]
    
    const admin = adminAccounts.find(acc => 
      acc.username === username && acc.password === password
    )
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      })
    }
    
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username, 
        name: admin.name,
        isAdmin: true 
      },
      ADMIN_SECRET,
      { expiresIn: '24h' }
    )
    
    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name
      }
    })
  } catch (error) {
    console.error('管理员登录失败：', error)
    res.status(500).json({
      success: false,
      message: '登录失败'
    })
  }
}

export default {
  adminAuthMiddleware,
  adminLogin
}
