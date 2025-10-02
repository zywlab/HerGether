import React, { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

const AdminLogin = () => {
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminId', data.admin.id)
        localStorage.setItem('adminName', data.admin.name)
        
        message.success('登录成功')
        
        // 跳转到申诉管理页面
        window.location.href = '/admin/appeals'
      } else {
        message.error(data.message || '登录失败')
      }
    } catch (error) {
      console.error('登录失败：', error)
      message.error('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card 
        title="管理员登录" 
        style={{ width: 400 }}
        headStyle={{ textAlign: 'center', fontSize: '20px' }}
      >
        <Form
          name="admin_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%' }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
          <p>测试账号：</p>
          <p>管理员：admin / admin123</p>
          <p>审核员：reviewer / review123</p>
        </div>
      </Card>
    </div>
  )
}

export default AdminLogin
