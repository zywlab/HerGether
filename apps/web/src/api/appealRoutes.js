// 申诉管理 API
import express from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { adminAuthMiddleware } from '../middleware/adminAuth'
import { notifyNewAppeal, notifyAppealProcessed } from '../services/notificationService'

const router = express.Router()
const upload = multer({ dest: 'uploads/appeals/' })

// 存储申诉数据（实际项目中应该使用数据库）
let appeals = []
let users = [] // 用户数据

// 创建申诉工单
router.post('/appeal/create-ticket', async (req, res) => {
  try {
    const {
      type,
      idcard_photo_url,
      ai_photo_url,
      reason,
      contact_info,
      submit_time,
      user_id
    } = req.body

    const ticketId = `APPEAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const appeal = {
      ticketId,
      userId: user_id,
      type,
      idCardPhotoUrl: idcard_photo_url,
      aiPhotoUrl: ai_photo_url,
      reason,
      contactInfo: contact_info,
      submitTime: submit_time,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    appeals.push(appeal)

    // 发送通知给管理员（企业微信）
    await notifyNewAppeal(appeal)

    res.json({
      success: true,
      ticket_id: ticketId,
      message: '申诉提交成功，客服将在1-3个工作日内处理'
    })
  } catch (error) {
    console.error('创建申诉工单失败：', error)
    res.status(500).json({
      success: false,
      message: '创建申诉工单失败'
    })
  }
})

// 一键快速处理申诉 (简化版)
router.post('/admin/appeals/quick-process', async (req, res) => {
  try {
    const { ticketId, action, newGender, adminId } = req.body

    const appealIndex = appeals.findIndex(appeal => appeal.ticketId === ticketId)
    
    if (appealIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '申诉工单不存在'
      })
    }

    const appeal = appeals[appealIndex]
    
    // 更新申诉状态
    appeals[appealIndex] = {
      ...appeal,
      status: action === 'approve' ? 'approved' : 'rejected',
      processTime: Date.now(),
      processedBy: adminId,
      newGender: action === 'approve' ? newGender : null
    }

    // 如果批准申诉，同步更新用户性别
    if (action === 'approve') {
      await updateUserGenderSync(appeal.userId, newGender, ticketId)
    }

    // 通知用户结果
    await notifyUserQuickResult(appeals[appealIndex])

    res.json({
      success: true,
      message: action === 'approve' ? '申诉已批准，用户性别已更新' : '申诉已拒绝'
    })
  } catch (error) {
    console.error('快速处理申诉失败：', error)
    res.status(500).json({
      success: false,
      message: '处理失败'
    })
  }
})

// 管理员获取用户列表
router.get('/admin/users', adminAuthMiddleware, async (req, res) => {
  try {
    const { search, page = 1, pageSize = 50 } = req.query
    
    // 模拟用户数据（实际项目中应该从数据库获取）
    let mockUsers = [
      {
        id: 'user-001',
        nickName: '小美',
        gender: 2,
        verificationData: {
          isVerified: true,
          faceGenderDetected: 'female',
          idCardGender: '女',
          lastVerified: Date.now() - 86400000,
        }
      },
      {
        id: 'user-002', 
        nickName: '小明',
        gender: 1,
        verificationData: {
          isVerified: false,
          faceGenderDetected: 'male',
          appealStatus: 'pending',
          lastVerified: Date.now() - 3600000,
        }
      },
      {
        id: 'user-003',
        nickName: '李华',
        gender: 2,
        verificationData: {
          isVerified: false,
          faceGenderDetected: 'male',
          idCardGender: '女',
          lastVerified: Date.now() - 7200000,
        }
      },
      {
        id: 'user-004',
        nickName: '王丽',
        gender: 2,
        verificationData: {
          isVerified: true,
          faceGenderDetected: 'female',
          idCardGender: '女',
          lastVerified: Date.now() - 1800000,
        }
      },
      {
        id: 'user-005',
        nickName: '张三',
        gender: 1,
        verificationData: {
          isVerified: false,
          faceGenderDetected: 'female',
          appealStatus: 'rejected',
          lastVerified: Date.now() - 14400000,
        }
      }
    ]

    // 搜索过滤
    if (search) {
      mockUsers = mockUsers.filter(user => 
        user.nickName?.includes(search) || 
        user.id.includes(search)
      )
    }

    // 分页
    const total = mockUsers.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + parseInt(pageSize)
    const paginatedUsers = mockUsers.slice(startIndex, endIndex)

    res.json({
      success: true,
      users: paginatedUsers,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('获取用户列表失败：', error)
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    })
  }
})

// 管理员获取申诉列表
router.get('/admin/appeals', adminAuthMiddleware, async (req, res) => {
  try {
    const { status, page = 1, pageSize = 10 } = req.query
    
    let filteredAppeals = appeals
    if (status && status !== 'all') {
      filteredAppeals = appeals.filter(appeal => appeal.status === status)
    }

    // 添加用户信息
    const appealsWithUserInfo = filteredAppeals.map(appeal => {
      const userInfo = users.find(user => user.id === appeal.userId)
      return {
        ...appeal,
        userInfo: userInfo ? {
          nickName: userInfo.nickName,
          gender: userInfo.gender,
          avatarUrl: userInfo.avatarUrl
        } : null,
        aiGenderDetected: userInfo?.verificationData?.faceGenderDetected || 'unknown',
        verificationTime: userInfo?.verificationData?.lastVerified
      }
    })

    // 分页
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedAppeals = appealsWithUserInfo.slice(startIndex, endIndex)

    res.json({
      success: true,
      appeals: paginatedAppeals,
      total: filteredAppeals.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    })
  } catch (error) {
    console.error('获取申诉列表失败：', error)
    res.status(500).json({
      success: false,
      message: '获取申诉列表失败'
    })
  }
})

// 管理员一键处理申诉
router.post('/admin/appeals/quick-process', async (req, res) => {
  try {
    const {
      ticketId,
      userId,
      action, // 'approve' 或 'reject'
      correctedGender,
      adminId,
      adminNote
    } = req.body

    const appealIndex = appeals.findIndex(appeal => appeal.ticketId === ticketId)
    
    if (appealIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '申诉工单不存在'
      })
    }

    const processTime = Date.now()
    
    // 更新申诉状态
    appeals[appealIndex] = {
      ...appeals[appealIndex],
      status: action === 'approve' ? 'approved' : 'rejected',
      processTime,
      adminId,
      adminNote,
      correctedGender: action === 'approve' ? correctedGender : null,
      updatedAt: new Date()
    }

    const appeal = appeals[appealIndex]

    // 如果批准申诉，更新用户性别
    if (action === 'approve' && correctedGender) {
      await updateUserGender(userId, correctedGender, adminId, ticketId)
    }

    // 通知用户处理结果
    await notifyUserQuickResult(appeal, action)

    // 通知管理员处理完成
    await notifyAppealProcessed(appeal, adminId)

    res.json({
      success: true,
      message: action === 'approve' ? '申诉已批准，用户性别已更新' : '申诉已拒绝'
    })
  } catch (error) {
    console.error('快速处理申诉失败：', error)
    res.status(500).json({
      success: false,
      message: '处理申诉失败'
    })
  }
})

// 管理员处理申诉
router.post('/admin/appeals/:ticketId/process', adminAuthMiddleware, async (req, res) => {
  try {
    const { ticketId } = req.params
    const {
      status,
      adminNote,
      correctedGender,
      processedBy,
      processedAt
    } = req.body

    const appealIndex = appeals.findIndex(appeal => appeal.ticketId === ticketId)
    
    if (appealIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '申诉工单不存在'
      })
    }

    // 更新申诉状态
    appeals[appealIndex] = {
      ...appeals[appealIndex],
      status,
      adminNote,
      correctedGender,
      processedBy,
      processedAt,
      updatedAt: new Date()
    }

    const appeal = appeals[appealIndex]

    // 如果申诉通过，更新用户信息
    if (status === 'approved') {
      await updateUserProfile(appeal.userId, correctedGender, ticketId)
    }

    // 通知用户处理结果
    await notifyUserResult(appeal)
    
    // 通知管理员处理完成
    await notifyAppealProcessed(appeal, processedBy)

    res.json({
      success: true,
      message: '申诉处理成功'
    })
  } catch (error) {
    console.error('处理申诉失败：', error)
    res.status(500).json({
      success: false,
      message: '处理申诉失败'
    })
  }
})

// 管理员直接修改用户性别
router.put('/admin/users/:userId/gender', adminAuthMiddleware, async (req, res) => {
  try {
    const { userId } = req.params
    const { gender, updatedBy, reason } = req.body

    const userIndex = users.findIndex(user => user.id === userId)
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    // 更新用户性别
    users[userIndex] = {
      ...users[userIndex],
      gender,
      verificationData: {
        ...users[userIndex].verificationData,
        manuallyVerified: true,
        manualVerificationBy: updatedBy,
        manualVerificationReason: reason,
        manualVerificationTime: Date.now(),
        appealStatus: 'approved'
      },
      updatedAt: new Date()
    }

    // 记录操作日志
    console.log(`管理员 ${updatedBy} 修改用户 ${userId} 性别为 ${gender}，原因：${reason}`)

    res.json({
      success: true,
      message: '用户性别修改成功'
    })
  } catch (error) {
    console.error('修改用户性别失败：', error)
    res.status(500).json({
      success: false,
      message: '修改用户性别失败'
    })
  }
})

// 用户获取申诉状态
router.get('/users/:userId/appeal-status', async (req, res) => {
  try {
    const { userId } = req.params
    
    const userAppeals = appeals.filter(appeal => appeal.userId === userId)
    const latestAppeal = userAppeals.sort((a, b) => b.submitTime - a.submitTime)[0]

    if (!latestAppeal) {
      return res.json({
        success: true,
        hasAppeal: false
      })
    }

    res.json({
      success: true,
      hasAppeal: true,
      appeal: {
        ticketId: latestAppeal.ticketId,
        status: latestAppeal.status,
        submitTime: latestAppeal.submitTime,
        adminNote: latestAppeal.adminNote
      }
    })
  } catch (error) {
    console.error('获取申诉状态失败：', error)
    res.status(500).json({
      success: false,
      message: '获取申诉状态失败'
    })
  }
})

// 通知用户验证状态更新
router.post('/users/:userId/verification/update', async (req, res) => {
  try {
    const { userId } = req.params
    const { appealStatus, correctedGender, verificationUpdated } = req.body

    const userIndex = users.findIndex(user => user.id === userId)
    
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        gender: correctedGender,
        verificationData: {
          ...users[userIndex].verificationData,
          appealStatus,
          verificationUpdated,
          lastUpdated: Date.now()
        }
      }
    }

    res.json({
      success: true,
      message: '用户验证状态更新成功'
    })
  } catch (error) {
    console.error('更新用户验证状态失败：', error)
    res.status(500).json({
      success: false,
      message: '更新用户验证状态失败'
    })
  }
})

// 辅助函数：快速通知用户处理结果
async function notifyUserQuickResult(appeal, action) {
  try {
    const statusText = action === 'approve' ? '已通过' : '已拒绝'
    console.log(`📢 申诉处理完成 - 工单号: ${appeal.ticketId}`)
    console.log(`处理结果: ${statusText}`)
    
    if (action === 'approve') {
      console.log(`✅ 用户性别已修改为: ${appeal.correctedGender === 'female' ? '女性' : '男性'}`)
    } else {
      console.log(`❌ 申诉被拒绝，验证状态保持不变`)
    }
    
    // 实际项目中可以发送小程序模板消息
    // await sendMiniprogramMessage({
    //   touser: appeal.userId,
    //   template_id: 'appeal_result_template',
    //   data: {
    //     ticket_id: appeal.ticketId,
    //     result: statusText,
    //     note: appeal.adminNote || (action === 'approve' ? '申诉通过，性别信息已更正' : 'AI识别结果准确')
    //   }
    // })
  } catch (error) {
    console.error('通知用户失败：', error)
  }
}

// 辅助函数：更新用户性别（简化版）
async function updateUserGender(userId, newGender, adminId, ticketId) {
  try {
    const userIndex = users.findIndex(user => user.id === userId)
    
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        gender: newGender,
        verificationData: {
          ...users[userIndex].verificationData,
          appealStatus: 'approved',
          correctedGender: newGender,
          manuallyVerified: true,
          manualVerificationTime: Date.now(),
          manualVerificationBy: adminId,
          relatedTicket: ticketId,
          lastUpdated: Date.now()
        },
        updatedAt: new Date()
      }
      
      console.log(`✅ 用户 ${userId} 性别已更新为 ${newGender}，工单号: ${ticketId}`)
    }
  } catch (error) {
    console.error('更新用户性别失败：', error)
  }
}

// 辅助函数：同步更新用户性别
async function updateUserGenderSync(userId, newGender, ticketId) {
  try {
    const userIndex = users.findIndex(user => user.id === userId)
    
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        gender: newGender,
        verificationData: {
          ...users[userIndex].verificationData,
          appealStatus: 'approved',
          correctedGender: newGender,
          manuallyVerified: true,
          manualVerificationTime: Date.now(),
          relatedTicket: ticketId
        },
        updatedAt: new Date()
      }
      
      console.log(`✅ 快速更新：用户 ${userId} 性别已更新为 ${newGender}`)
    }
  } catch (error) {
    console.error('同步更新用户性别失败：', error)
  }
}

// 辅助函数：快速通知用户结果
async function notifyUserQuickResult(appeal) {
  try {
    console.log(`📱 通知用户：工单 ${appeal.ticketId} - ${appeal.status === 'approved' ? '已批准' : '已拒绝'}`)
    
    // 这里可以集成小程序模板消息
    // await sendMiniprogramTemplate({
    //   touser: appeal.userId,
    //   template_id: 'appeal_result',
    //   data: {
    //     ticket_id: appeal.ticketId,
    //     result: appeal.status === 'approved' ? '已通过' : '已拒绝',
    //     gender: appeal.newGender ? (appeal.newGender === 'female' ? '女性' : '男性') : ''
    //   }
    // })
  } catch (error) {
    console.error('通知用户失败：', error)
  }
}

// 辅助函数：通知管理员
async function notifyAdmins(appeal) {
  try {
    // 实际项目中可以发送邮件、企业微信消息等
    console.log(`🚨 新申诉提交 - 工单号: ${appeal.ticketId}`)
    console.log(`用户ID: ${appeal.userId}`)
    console.log(`申诉原因: ${appeal.reason}`)
    console.log(`联系方式: ${appeal.contactInfo}`)
    
    // 可以集成邮件服务
    // await sendEmailToAdmins({
    //   subject: `新的性别验证申诉 - ${appeal.ticketId}`,
    //   content: `用户提交了新的申诉，请及时处理。工单号：${appeal.ticketId}`
    // })
    
    // 可以集成企业微信机器人
    // await sendWeworkNotification({
    //   text: `收到新申诉：${appeal.ticketId}\n原因：${appeal.reason}`
    // })
  } catch (error) {
    console.error('通知管理员失败：', error)
  }
}

// 辅助函数：通知用户处理结果
async function notifyUserResult(appeal) {
  try {
    console.log(`📢 申诉处理完成 - 工单号: ${appeal.ticketId}`)
    console.log(`处理结果: ${appeal.status}`)
    console.log(`管理员备注: ${appeal.adminNote}`)
    
    // 实际项目中可以发送小程序模板消息
    // await sendMiniprogramMessage({
    //   touser: appeal.userId,
    //   template_id: 'appeal_result_template',
    //   data: {
    //     ticket_id: appeal.ticketId,
    //     result: appeal.status === 'approved' ? '已通过' : '已拒绝',
    //     note: appeal.adminNote
    //   }
    // })
  } catch (error) {
    console.error('通知用户失败：', error)
  }
}

// 辅助函数：更新用户资料
async function updateUserProfile(userId, correctedGender, ticketId) {
  try {
    const userIndex = users.findIndex(user => user.id === userId)
    
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        gender: correctedGender,
        verificationData: {
          ...users[userIndex].verificationData,
          appealStatus: 'approved',
          correctedGender,
          manuallyVerified: true,
          manualVerificationTime: Date.now(),
          relatedTicket: ticketId
        },
        updatedAt: new Date()
      }
      
      console.log(`✅ 用户 ${userId} 性别已更新为 ${correctedGender}`)
    }
  } catch (error) {
    console.error('更新用户资料失败：', error)
  }
}

export default router
