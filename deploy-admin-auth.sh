#!/bin/bash

# 她聚管理员认证系统 - 快速部署脚本
# 使用方法: ./deploy-admin-auth.sh [environment]
# 环境选项: dev, staging, production

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 环境参数
ENVIRONMENT=${1:-dev}

echo -e "${BLUE}🚀 开始部署她聚管理员认证系统...${NC}"
echo -e "${YELLOW}📋 部署环境: $ENVIRONMENT${NC}"

# 检查必要的工具
check_requirements() {
    echo -e "${BLUE}🔍 检查系统要求...${NC}"
    
    command -v node >/dev/null 2>&1 || { 
        echo -e "${RED}❌ Node.js 未安装，请先安装 Node.js${NC}" 
        exit 1 
    }
    
    command -v npm >/dev/null 2>&1 || { 
        echo -e "${RED}❌ npm 未安装，请先安装 npm${NC}" 
        exit 1 
    }
    
    echo -e "${GREEN}✅ 系统要求检查通过${NC}"
}

# 设置环境变量
setup_environment() {
    echo -e "${BLUE}🔧 设置环境配置...${NC}"
    
    if [ ! -f "apps/web/.env" ]; then
        echo -e "${YELLOW}📝 创建环境配置文件...${NC}"
        cp apps/web/.env.example apps/web/.env
        
        echo -e "${YELLOW}⚠️  请编辑 apps/web/.env 文件并填入正确的配置：${NC}"
        echo -e "   - WECHAT_APP_ID: 微信小程序AppID"
        echo -e "   - WECHAT_APP_SECRET: 微信小程序密钥"
        echo -e "   - JWT_SECRET: JWT加密密钥"
        echo -e "   - INITIAL_ADMIN_OPENIDS: 初始管理员openId列表"
        
        read -p "配置完成后按回车继续..."
    else
        echo -e "${GREEN}✅ 环境配置文件已存在${NC}"
    fi
}

# 安装依赖
install_dependencies() {
    echo -e "${BLUE}📦 安装项目依赖...${NC}"
    
    # 安装后端依赖
    echo -e "${YELLOW}🔧 安装后端API依赖...${NC}"
    cd apps/web/src/api
    
    if [ ! -f "package.json" ]; then
        echo -e "${YELLOW}📝 创建后端API package.json...${NC}"
        cat > package.json << 'EOF'
{
  "name": "shejuu-admin-api",
  "version": "1.0.0",
  "description": "她聚管理员认证API服务",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node --test"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "jsonwebtoken": "^9.0.2",
    "axios": "^1.5.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "keywords": ["wechat", "miniprogram", "admin", "auth"],
  "author": "SheJuu Team",
  "license": "MIT"
}
EOF
    fi
    
    npm install
    cd ../../../..
    
    # 安装前端依赖
    echo -e "${YELLOW}🔧 安装小程序依赖...${NC}"
    cd apps/miniapp
    npm install
    cd ../..
    
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
}

# 构建项目
build_project() {
    echo -e "${BLUE}🔨 构建项目...${NC}"
    
    # 构建小程序
    echo -e "${YELLOW}📱 构建微信小程序...${NC}"
    cd apps/miniapp
    npm run build:weapp
    cd ../..
    
    echo -e "${GREEN}✅ 项目构建完成${NC}"
}

# 启动服务
start_services() {
    echo -e "${BLUE}🚀 启动服务...${NC}"
    
    case $ENVIRONMENT in
        "production")
            echo -e "${YELLOW}🌐 启动生产环境服务...${NC}"
            cd apps/web/src/api
            npm start &
            API_PID=$!
            echo "API服务PID: $API_PID"
            ;;
        "dev"|"staging")
            echo -e "${YELLOW}🛠️  启动开发环境服务...${NC}"
            cd apps/web/src/api
            npm run dev &
            API_PID=$!
            echo "API服务PID: $API_PID"
            ;;
    esac
    
    cd ../../../..
    
    # 等待服务启动
    sleep 3
    
    # 检查服务状态
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ API服务启动成功${NC}"
    else
        echo -e "${RED}❌ API服务启动失败${NC}"
        exit 1
    fi
}

# 运行测试
run_tests() {
    echo -e "${BLUE}🧪 运行系统测试...${NC}"
    
    # 测试API健康检查
    echo -e "${YELLOW}🔍 测试API健康检查...${NC}"
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ API健康检查通过${NC}"
    else
        echo -e "${RED}❌ API健康检查失败${NC}"
        return 1
    fi
    
    # 测试认证接口
    echo -e "${YELLOW}🔍 测试认证接口...${NC}"
    AUTH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/get-openid \
        -H "Content-Type: application/json" \
        -d '{"code":"test_code"}' || echo "failed")
    
    if [[ $AUTH_RESPONSE == *"success"* ]] || [[ $AUTH_RESPONSE == *"error"* ]]; then
        echo -e "${GREEN}✅ 认证接口响应正常${NC}"
    else
        echo -e "${YELLOW}⚠️  认证接口需要有效的微信code进行完整测试${NC}"
    fi
    
    echo -e "${GREEN}✅ 系统测试完成${NC}"
}

# 显示部署信息
show_deployment_info() {
    echo -e "${GREEN}🎉 部署完成！${NC}"
    echo -e "${BLUE}📋 部署信息：${NC}"
    echo -e "   🌐 API服务地址: http://localhost:3000"
    echo -e "   🏥 健康检查: http://localhost:3000/health"
    echo -e "   🔐 认证API: http://localhost:3000/api/auth"
    echo -e "   👥 管理员API: http://localhost:3000/api/admin"
    echo -e "   📱 小程序构建目录: apps/miniapp/dist"
    
    echo -e "${YELLOW}📝 下一步操作：${NC}"
    echo -e "   1. 使用微信开发者工具打开 apps/miniapp/dist 目录"
    echo -e "   2. 在小程序中测试管理员认证功能"
    echo -e "   3. 配置初始管理员openId"
    echo -e "   4. 上传小程序到微信后台"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${RED}⚠️  生产环境提醒：${NC}"
        echo -e "   - 确保使用HTTPS协议"
        echo -e "   - 配置防火墙和安全组"
        echo -e "   - 启用日志监控"
        echo -e "   - 定期备份管理员数据"
    fi
}

# 创建停止脚本
create_stop_script() {
    echo -e "${BLUE}📝 创建停止脚本...${NC}"
    
    cat > stop-admin-auth.sh << 'EOF'
#!/bin/bash

echo "🛑 停止她聚管理员认证服务..."

# 查找并停止API服务
API_PID=$(ps aux | grep 'node.*server.js' | grep -v grep | awk '{print $2}')
if [ ! -z "$API_PID" ]; then
    echo "停止API服务 (PID: $API_PID)"
    kill $API_PID
    echo "✅ API服务已停止"
else
    echo "⚠️  未找到运行中的API服务"
fi

echo "🎉 服务停止完成"
EOF
    
    chmod +x stop-admin-auth.sh
    echo -e "${GREEN}✅ 停止脚本已创建: ./stop-admin-auth.sh${NC}"
}

# 主执行流程
main() {
    check_requirements
    setup_environment
    install_dependencies
    build_project
    start_services
    run_tests
    create_stop_script
    show_deployment_info
}

# 错误处理
trap 'echo -e "${RED}❌ 部署过程中出现错误${NC}"; exit 1' ERR

# 执行主流程
main

echo -e "${GREEN}🎊 她聚管理员认证系统部署成功！${NC}"
