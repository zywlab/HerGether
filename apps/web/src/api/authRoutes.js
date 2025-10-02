// 微信授权和管理员验证 API
import express from 'express'
import jwt from 'jsonwebtoken'
import axios from 'axios'

const router = express.Router()

// 微信小程序配置
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APPID || 'your_wechat_appid',
  appSecret: process.env.WECHAT_APPSECRET || 'your_wechat_appsecret',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret'
}

// 管理员openId白名单（应该存储在数据库中）
let adminOpenIds = [
  // 'o1234567890abcdef1234567890abcdef', // 示例openId - 需要替换为实际的管理员openId
  // 'o9876543210fedcba0987654321fedcba', // 示例openId - 需要替换为实际的管理员openId
]

/**
 * 通过微信登录code获取openId
 */
router.post('/auth/get-openid', async (req, res) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({
        success: false,
        message: '缺少登录code'
      })
    }

    // 调用微信API获取openId
    const wechatResponse = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: WECHAT_CONFIG.appId,
        secret: WECHAT_CONFIG.appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    })

    const { openid, session_key, unionid, errcode, errmsg } = wechatResponse.data

    if (errcode) {
      console.error('微信登录失败：', errcode, errmsg)
      return res.status(400).json({
        success: false,
        message: `微信登录失败：${errmsg}`
      })
    }

    if (!openid) {
      return res.status(400).json({
        success: false,
        message: '获取openId失败'
      })
    }

    // 检查是否是管理员
    const isAdmin = adminOpenIds.includes(openid)

    // 生成JWT token
    const token = jwt.sign(
      { 
        openId: openid,
        isAdmin,
        sessionKey: session_key,
        unionId: unionid,
        timestamp: Date.now()
      },
      WECHAT_CONFIG.jwtSecret,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      openId: openid,
      isAdmin,
      token,
      sessionKey: session_key, // 注意：sessionKey敏感信息，实际使用时可能不返回
      unionId: unionid
    })

  } catch (error) {
    console.error('获取openId失败：', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

/**
 * 验证管理员身份
 */
router.post('/auth/verify-admin', async (req, res) => {
  try {
    const { openId, token } = req.body

    if (!openId && !token) {
      return res.status(400).json({
        success: false,
        message: '缺少验证信息'
      })
    }

    let verifyOpenId = openId

    // 如果提供了token，验证token并提取openId
    if (token) {
      try {
        const decoded = jwt.verify(token, WECHAT_CONFIG.jwtSecret)
        verifyOpenId = decoded.openId
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Token无效或已过期'
        })
      }
    }

    if (!verifyOpenId) {
      return res.status(400).json({
        success: false,
        message: '无法获取用户标识'
      })
    }

    // 检查管理员权限
    const isAdmin = adminOpenIds.includes(verifyOpenId)

    res.json({
      success: true,
      isAdmin,
      openId: verifyOpenId,
      adminType: isAdmin ? 'openid' : null
    })

  } catch (error) {
    console.error('验证管理员身份失败：', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

/**
 * 获取管理员列表（仅管理员可访问）
 */
router.get('/admin/list', async (req, res) => {
  try {
    // 验证管理员权限
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '缺少认证信息'
      })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, WECHAT_CONFIG.jwtSecret)

    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      })
    }

    res.json({
      success: true,
      adminList: adminOpenIds.map(openId => ({
        openId,
        addedAt: new Date().toISOString() // 实际应该从数据库获取
      }))
    })

  } catch (error) {
    console.error('获取管理员列表失败：', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

/**
 * 添加管理员（仅管理员可操作）
 */
router.post('/admin/add', async (req, res) => {
  try {
    const { openId } = req.body

    // 验证管理员权限
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '缺少认证信息'
      })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, WECHAT_CONFIG.jwtSecret)

    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '只有管理员才能添加其他管理员'
      })
    }

    if (!openId) {
      return res.status(400).json({
        success: false,
        message: '缺少openId'
      })
    }

    if (adminOpenIds.includes(openId)) {
      return res.json({
        success: false,
        message: '该用户已经是管理员'
      })
    }

    adminOpenIds.push(openId)
    // 这里应该保存到数据库
    // await saveAdminOpenIds(adminOpenIds)

    res.json({
      success: true,
      message: '管理员添加成功'
    })

  } catch (error) {
    console.error('添加管理员失败：', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

/**
 * 移除管理员（仅管理员可操作）
 */
router.post('/admin/remove', async (req, res) => {
  try {
    const { openId } = req.body

    // 验证管理员权限
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '缺少认证信息'
      })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, WECHAT_CONFIG.jwtSecret)

    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '只有管理员才能移除其他管理员'
      })
    }

    if (!openId) {
      return res.status(400).json({
        success: false,
        message: '缺少openId'
      })
    }

    const index = adminOpenIds.indexOf(openId)
    if (index === -1) {
      return res.json({
        success: false,
        message: '该用户不是管理员'
      })
    }

    adminOpenIds.splice(index, 1)
    // 这里应该保存到数据库
    // await saveAdminOpenIds(adminOpenIds)

    res.json({
      success: true,
      message: '管理员移除成功'
    })

  } catch (error) {
    console.error('移除管理员失败：', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

export default router
