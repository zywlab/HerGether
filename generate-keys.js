#!/usr/bin/env node

// OCR API密钥生成工具
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

console.log('🔐 OCR API 密钥生成工具\n')

// 生成随机密钥
function generateSecureKey(length = 32) {
    return crypto.randomBytes(length).toString('hex')
}

// 生成API密钥
function generateApiKey() {
    const timestamp = Date.now().toString(36)
    const random = crypto.randomBytes(16).toString('hex')
    return `base44_${timestamp}_${random}`
}

// 生成JWT密钥
function generateJwtSecret() {
    return crypto.randomBytes(64).toString('base64')
}

// 生成所有必要的密钥
const keys = {
    ENCRYPTION_KEY: generateSecureKey(32),
    JWT_SECRET: generateJwtSecret(),
    API_KEY: generateApiKey()
}

console.log('🔑 生成的密钥:')
console.log('=' * 50)
Object.entries(keys).forEach(([key, value]) => {
    console.log(`${key}=${value}`)
})
console.log('=' * 50)

// 询问是否保存到文件
const readline = require('readline')
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

rl.question('\n💾 是否将密钥保存到 .env.local 文件? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        try {
            const envPath = path.join(process.cwd(), '.env.local')
            let envContent = ''
            
            // 读取现有文件内容
            if (fs.existsSync(envPath)) {
                envContent = fs.readFileSync(envPath, 'utf8')
            }
            
            // 更新或添加新的密钥
            Object.entries(keys).forEach(([key, value]) => {
                const regex = new RegExp(`^${key}=.*$`, 'm')
                if (regex.test(envContent)) {
                    envContent = envContent.replace(regex, `${key}=${value}`)
                } else {
                    envContent += `\n${key}=${value}`
                }
            })
            
            // 写入文件
            fs.writeFileSync(envPath, envContent.trim() + '\n')
            
            console.log(`✅ 密钥已保存到 ${envPath}`)
            console.log('⚠️  请妥善保管这些密钥，不要提交到版本控制系统！')
            
        } catch (error) {
            console.error('❌ 保存文件失败:', error.message)
        }
    } else {
        console.log('📋 请手动复制上述密钥到您的环境配置文件中')
    }
    
    console.log('\n🔐 安全提示:')
    console.log('- 这些密钥用于加密和API认证')
    console.log('- 请不要在代码中硬编码这些密钥')
    console.log('- 生产环境请使用不同的密钥')
    console.log('- 定期轮换API密钥以提高安全性')
    
    rl.close()
})

rl.on('close', () => {
    console.log('\n👋 密钥生成完成！')
    process.exit(0)
})
