import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Image, Modal, Space, Tag, message, Descriptions } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons'

const AdminAppeals = () => {
  const [appeals, setAppeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedAppeal, setSelectedAppeal] = useState(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadAppeals()
    // 每30秒自动刷新
    const interval = setInterval(loadAppeals, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadAppeals = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/appeals')
      const data = await response.json()
      if (data.success) {
        setAppeals(data.appeals)
      }
    } catch (error) {
      console.error('加载申诉失败：', error)
      message.error('加载申诉失败')
    } finally {
      setLoading(false)
    }
  }

  // 一键批准 - 自动设置相反性别
  const handleApprove = async (appeal) => {
    setProcessing(true)
    try {
      const newGender = appeal.aiDetectedGender === 'female' ? 'male' : 'female'
      
      const response = await fetch('/api/admin/appeals/quick-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: appeal.ticketId,
          action: 'approve',
          newGender: newGender,
          adminId: 'admin-001'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        message.success(`申诉已批准，用户性别已修改为${newGender === 'female' ? '女性' : '男性'}`)
        loadAppeals() // 刷新列表
      } else {
        message.error(result.message || '处理失败')
      }
    } catch (error) {
      message.error('处理失败')
    } finally {
      setProcessing(false)
    }
  }

  // 一键拒绝
  const handleReject = async (appeal) => {
    setProcessing(true)
    try {
      const response = await fetch('/api/admin/appeals/quick-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: appeal.ticketId,
          action: 'reject',
          adminId: 'admin-001'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        message.success('申诉已拒绝')
        loadAppeals() // 刷新列表
      } else {
        message.error(result.message || '处理失败')
      }
    } catch (error) {
      message.error('处理失败')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'processing'
      case 'approved': return 'success'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '待处理'
      case 'approved': return '已批准'
      case 'rejected': return '已拒绝'
      default: return '未知'
    }
  }

  const columns = [
    {
      title: '工单号',
      dataIndex: 'ticketId',
      key: 'ticketId',
      width: 180,
      render: (text) => (
        <span style={{ 
          fontFamily: 'monospace', 
          fontSize: '12px',
          backgroundColor: '#f0f0f0',
          padding: '2px 6px',
          borderRadius: '4px'
        }}>
          {text}
        </span>
      )
    },
    {
      title: '用户信息',
      key: 'userInfo',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.userNickname || '未知用户'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            AI识别: <span style={{ color: record.aiDetectedGender === 'female' ? '#ff1890' : '#1890ff' }}>
              {record.aiDetectedGender === 'female' ? '女性' : '男性'}
            </span>
          </div>
        </div>
      )
    },
    {
      title: '申诉原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
      ellipsis: true
    },
    {
      title: '联系方式',
      dataIndex: 'contactInfo',
      key: 'contactInfo',
      width: 120,
      ellipsis: true
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: 120,
      render: (time) => (
        <div>
          <div>{new Date(time).toLocaleDateString()}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {new Date(time).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <Space>
          <Button 
            size="small"
            onClick={() => setSelectedAppeal(record)}
          >
            查看详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Button 
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record)}
                loading={processing}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                批准 (改为{record.aiDetectedGender === 'female' ? '男性' : '女性'})
              </Button>
              <Button 
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
                loading={processing}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🚨 性别验证申诉管理</span>
            <div>
              <Tag color="processing">待处理: {appeals.filter(a => a.status === 'pending').length}</Tag>
              <Button onClick={loadAppeals} loading={loading} style={{ marginLeft: '8px' }}>
                刷新
              </Button>
            </div>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={appeals}
          loading={loading}
          rowKey="ticketId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条申诉记录`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 申诉详情弹窗 */}
      <Modal
        title={`申诉详情 - ${selectedAppeal?.ticketId}`}
        open={!!selectedAppeal}
        onCancel={() => setSelectedAppeal(null)}
        width={900}
        footer={
          selectedAppeal?.status === 'pending' ? (
            <Space>
              <Button onClick={() => setSelectedAppeal(null)}>
                关闭
              </Button>
              <Button 
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  handleReject(selectedAppeal)
                  setSelectedAppeal(null)
                }}
                loading={processing}
              >
                拒绝申诉
              </Button>
              <Button 
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => {
                  handleApprove(selectedAppeal)
                  setSelectedAppeal(null)
                }}
                loading={processing}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                批准申诉 (性别改为: {selectedAppeal?.aiDetectedGender === 'female' ? '男性' : '女性'})
              </Button>
            </Space>
          ) : (
            <Button onClick={() => setSelectedAppeal(null)}>
              关闭
            </Button>
          )
        }
      >
        {selectedAppeal && (
          <div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="工单号">
                <span style={{ fontFamily: 'monospace' }}>{selectedAppeal.ticketId}</span>
              </Descriptions.Item>
              <Descriptions.Item label="用户昵称">
                {selectedAppeal.userNickname || '未知用户'}
              </Descriptions.Item>
              <Descriptions.Item label="AI识别性别">
                <Tag color={selectedAppeal.aiDetectedGender === 'female' ? 'magenta' : 'blue'}>
                  {selectedAppeal.aiDetectedGender === 'female' ? '女性' : '男性'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="申诉状态">
                <Tag color={getStatusColor(selectedAppeal.status)}>
                  {getStatusText(selectedAppeal.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {new Date(selectedAppeal.submitTime).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="联系方式">
                {selectedAppeal.contactInfo}
              </Descriptions.Item>
              <Descriptions.Item label="申诉原因" span={2}>
                <div style={{ backgroundColor: '#f9f9f9', padding: '8px', borderRadius: '4px' }}>
                  {selectedAppeal.reason}
                </div>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
              <div>
                <h4>🤖 AI验证照片</h4>
                <Image
                  width={200}
                  src={selectedAppeal.aiPhotoUrl || '/placeholder-ai-photo.jpg'}
                  placeholder="AI验证照片"
                  style={{ border: '1px solid #d9d9d9', borderRadius: '8px' }}
                />
              </div>

              <div>
                <h4>🆔 身份证照片</h4>
                <Image
                  width={200}
                  src={selectedAppeal.idCardPhotoUrl || '/placeholder-id-card.jpg'}
                  placeholder="身份证照片"
                  style={{ border: '1px solid #d9d9d9', borderRadius: '8px' }}
                />
              </div>
            </div>

            {selectedAppeal.status !== 'pending' && (
              <div style={{ 
                marginTop: '24px', 
                padding: '16px', 
                backgroundColor: selectedAppeal.status === 'approved' ? '#f6ffed' : '#fff2f0',
                border: `1px solid ${selectedAppeal.status === 'approved' ? '#b7eb8f' : '#ffccc7'}`,
                borderRadius: '8px' 
              }}>
                <h4>📋 处理结果</h4>
                <p>处理时间: {new Date(selectedAppeal.processTime).toLocaleString()}</p>
                <p>处理结果: <Tag color={getStatusColor(selectedAppeal.status)}>{getStatusText(selectedAppeal.status)}</Tag></p>
                {selectedAppeal.status === 'approved' && (
                  <p style={{ color: '#52c41a', fontWeight: 'bold' }}>
                    ✅ 用户性别已修改为: {selectedAppeal.newGender === 'female' ? '女性' : '男性'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminAppeals
