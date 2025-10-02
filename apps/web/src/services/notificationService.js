// 企业微信机器人通知服务
import fetch from 'node-fetch'

// 企业微信机器人配置
const WEWORK_WEBHOOK_URL = process.env.WEWORK_WEBHOOK_URL || 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_BOT_KEY'

/**
 * 发送企业微信通知
 * @param {Object} options 通知选项
 * @param {string} options.text 文本内容
 * @param {Array} options.mentionedList 要@的用户列表
 * @param {boolean} options.mentionedMobile 是否@所有人
 */
export async function sendWeworkNotification(options) {
  try {
    const { text, mentionedList = [], mentionedMobile = false } = options
    
    const messageData = {
      msgtype: 'text',
      text: {
        content: text,
        mentioned_list: mentionedList,
        mentioned_mobile_list: mentionedMobile ? ['@all'] : []
      }
    }

    const response = await fetch(WEWORK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    })

    const result = await response.json()
    
    if (result.errcode === 0) {
      console.log('✅ 企业微信通知发送成功')
      return { success: true }
    } else {
      console.error('❌ 企业微信通知发送失败：', result.errmsg)
      return { success: false, error: result.errmsg }
    }
  } catch (error) {
    console.error('企业微信通知发送异常：', error)
    return { success: false, error: error.message }
  }
}

/**
 * 发送申诉通知给管理员
 * @param {Object} appeal 申诉信息
 */
export async function notifyNewAppeal(appeal) {
  const text = `🚨 新的性别验证申诉
工单号：${appeal.ticketId}
用户ID：${appeal.userId}
申诉原因：${appeal.reason}
联系方式：${appeal.contactInfo}
提交时间：${new Date(appeal.submitTime).toLocaleString()}

请及时处理：https://admin.base44.com/appeals`

  return await sendWeworkNotification({
    text,
    mentionedList: ['@all'], // @所有人
    mentionedMobile: true
  })
}

/**
 * 发送申诉处理完成通知
 * @param {Object} appeal 申诉信息
 * @param {string} processorName 处理人姓名
 */
export async function notifyAppealProcessed(appeal, processorName) {
  const statusText = appeal.status === 'approved' ? '✅ 已通过' : '❌ 已拒绝'
  
  const text = `📋 申诉处理完成
工单号：${appeal.ticketId}
处理结果：${statusText}
处理人：${processorName}
处理时间：${new Date().toLocaleString()}
备注：${appeal.adminNote || '无'}`

  return await sendWeworkNotification({ text })
}

/**
 * 发送每日申诉汇总
 */
export async function sendDailyAppealSummary(appeals) {
  const pending = appeals.filter(a => a.status === 'pending').length
  const processed = appeals.filter(a => a.status !== 'pending').length
  
  const text = `📊 申诉处理日报 - ${new Date().toLocaleDateString()}
待处理申诉：${pending} 个
今日已处理：${processed} 个
管理后台：https://admin.base44.com/appeals`

  return await sendWeworkNotification({ text })
}

// 邮件通知服务（可选）
export async function sendEmailNotification(options) {
  try {
    // 这里可以集成邮件服务，如 SendGrid、阿里云邮件等
    console.log('📧 邮件通知功能待集成', options)
    return { success: true }
  } catch (error) {
    console.error('邮件发送失败：', error)
    return { success: false, error: error.message }
  }
}

export default {
  sendWeworkNotification,
  notifyNewAppeal,
  notifyAppealProcessed,
  sendDailyAppealSummary,
  sendEmailNotification
}
