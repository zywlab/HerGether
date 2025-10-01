#!/bin/bash

# 她聚管理员认证系统 - 系统检查脚本
# 用于验证管理员认证系统的配置和运行状态

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 她聚管理员认证系统 - 状态检查${NC}"
echo "=================================="

# 检查文件结构
check_file_structure() {
    echo -e "${BLUE}📁 检查文件结构...${NC}"
    
    files=(
        "apps/miniapp/src/utils/adminAuthService.ts"
        "apps/miniapp/src/pages/admin-panel/index.tsx"
        "apps/miniapp/src/pages/admin-management/index.tsx"
        "apps/web/src/api/authRoutes.js"
        "apps/web/src/api/adminConfig.js"
        "apps/web/src/api/server.js"
        "apps/web/.env.example"
        "ADMIN-AUTH-GUIDE.md"
    )
    
    missing_files=()
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            echo -e "   ${GREEN}✅ $file${NC}"
        else
            echo -e "   ${RED}❌ $file${NC}"
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ 所有核心文件都存在${NC}"
    else
        echo -e "${RED}❌ 缺少 ${#missing_files[@]} 个核心文件${NC}"
        return 1
    fi
}

# 检查配置文件
check_configuration() {
    echo -e "${BLUE}⚙️  检查配置文件...${NC}"
    
    if [ -f "apps/web/.env" ]; then
        echo -e "   ${GREEN}✅ .env 配置文件存在${NC}"
        
        # 检查关键配置项
        if grep -q "WECHAT_APP_ID=" apps/web/.env; then
            app_id=$(grep "WECHAT_APP_ID=" apps/web/.env | cut -d'=' -f2)
            if [ "$app_id" = "your_wechat_app_id" ] || [ -z "$app_id" ]; then
                echo -e "   ${YELLOW}⚠️  WECHAT_APP_ID 需要配置${NC}"
            else
                echo -e "   ${GREEN}✅ WECHAT_APP_ID 已配置${NC}"
            fi
        else
            echo -e "   ${RED}❌ 缺少 WECHAT_APP_ID 配置${NC}"
        fi
        
        if grep -q "JWT_SECRET=" apps/web/.env; then
            jwt_secret=$(grep "JWT_SECRET=" apps/web/.env | cut -d'=' -f2)
            if [ "$jwt_secret" = "your_super_secret_jwt_key_here" ] || [ -z "$jwt_secret" ]; then
                echo -e "   ${YELLOW}⚠️  JWT_SECRET 需要配置${NC}"
            else
                echo -e "   ${GREEN}✅ JWT_SECRET 已配置${NC}"
            fi
        else
            echo -e "   ${RED}❌ 缺少 JWT_SECRET 配置${NC}"
        fi
        
    else
        echo -e "   ${YELLOW}⚠️  .env 配置文件不存在，使用示例文件创建：${NC}"
        echo -e "   ${BLUE}   cp apps/web/.env.example apps/web/.env${NC}"
    fi
}

# 检查依赖
check_dependencies() {
    echo -e "${BLUE}📦 检查项目依赖...${NC}"
    
    # 检查后端依赖
    if [ -f "apps/web/src/api/package.json" ]; then
        echo -e "   ${GREEN}✅ 后端 package.json 存在${NC}"
        
        if [ -d "apps/web/src/api/node_modules" ]; then
            echo -e "   ${GREEN}✅ 后端依赖已安装${NC}"
        else
            echo -e "   ${YELLOW}⚠️  后端依赖未安装，运行：${NC}"
            echo -e "   ${BLUE}   cd apps/web/src/api && npm install${NC}"
        fi
    else
        echo -e "   ${RED}❌ 后端 package.json 不存在${NC}"
    fi
    
    # 检查前端依赖
    if [ -f "apps/miniapp/package.json" ]; then
        echo -e "   ${GREEN}✅ 小程序 package.json 存在${NC}"
        
        if [ -d "apps/miniapp/node_modules" ]; then
            echo -e "   ${GREEN}✅ 小程序依赖已安装${NC}"
        else
            echo -e "   ${YELLOW}⚠️  小程序依赖未安装，运行：${NC}"
            echo -e "   ${BLUE}   cd apps/miniapp && npm install${NC}"
        fi
    else
        echo -e "   ${RED}❌ 小程序 package.json 不存在${NC}"
    fi
}

# 检查API服务状态
check_api_service() {
    echo -e "${BLUE}🌐 检查API服务状态...${NC}"
    
    if curl -f -s http://localhost:3000/health >/dev/null 2>&1; then
        echo -e "   ${GREEN}✅ API服务运行正常${NC}"
        
        # 获取健康检查详情
        health_info=$(curl -s http://localhost:3000/health 2>/dev/null || echo "无法获取详情")
        if [[ $health_info == *"ok"* ]]; then
            echo -e "   ${GREEN}✅ 健康检查通过${NC}"
        fi
        
        # 检查认证端点
        if curl -f -s http://localhost:3000/api/auth >/dev/null 2>&1; then
            echo -e "   ${GREEN}✅ 认证API端点可访问${NC}"
        else
            echo -e "   ${YELLOW}⚠️  认证API端点响应异常${NC}"
        fi
        
    else
        echo -e "   ${RED}❌ API服务未运行或无法访问${NC}"
        echo -e "   ${BLUE}   启动服务：cd apps/web/src/api && npm start${NC}"
    fi
}

# 检查小程序构建
check_miniprogram_build() {
    echo -e "${BLUE}📱 检查小程序构建状态...${NC}"
    
    if [ -d "apps/miniapp/dist" ]; then
        echo -e "   ${GREEN}✅ 小程序构建目录存在${NC}"
        
        if [ -f "apps/miniapp/dist/app.js" ]; then
            echo -e "   ${GREEN}✅ 小程序构建文件完整${NC}"
        else
            echo -e "   ${YELLOW}⚠️  小程序需要重新构建${NC}"
            echo -e "   ${BLUE}   运行：cd apps/miniapp && npm run build:weapp${NC}"
        fi
    else
        echo -e "   ${YELLOW}⚠️  小程序未构建${NC}"
        echo -e "   ${BLUE}   运行：cd apps/miniapp && npm run build:weapp${NC}"
    fi
}

# 运行安全检查
security_check() {
    echo -e "${BLUE}🔒 安全配置检查...${NC}"
    
    if [ -f "apps/web/.env" ]; then
        # 检查JWT密钥强度
        if grep -q "JWT_SECRET=" apps/web/.env; then
            jwt_secret=$(grep "JWT_SECRET=" apps/web/.env | cut -d'=' -f2)
            if [ ${#jwt_secret} -lt 32 ]; then
                echo -e "   ${YELLOW}⚠️  JWT_SECRET 长度建议至少32位${NC}"
            else
                echo -e "   ${GREEN}✅ JWT_SECRET 长度符合要求${NC}"
            fi
        fi
        
        # 检查生产环境设置
        if grep -q "NODE_ENV=production" apps/web/.env; then
            echo -e "   ${GREEN}✅ 生产环境配置${NC}"
            
            if grep -q "SKIP_WECHAT_AUTH=true" apps/web/.env; then
                echo -e "   ${RED}❌ 生产环境不应跳过微信认证${NC}"
            else
                echo -e "   ${GREEN}✅ 微信认证已启用${NC}"
            fi
        else
            echo -e "   ${YELLOW}⚠️  当前为开发环境${NC}"
        fi
    fi
    
    # 检查文件权限
    if [ -f "apps/web/.env" ]; then
        env_perms=$(stat -f "%A" apps/web/.env 2>/dev/null || stat -c "%a" apps/web/.env 2>/dev/null || echo "未知")
        if [ "$env_perms" = "600" ] || [ "$env_perms" = "644" ]; then
            echo -e "   ${GREEN}✅ .env 文件权限安全${NC}"
        else
            echo -e "   ${YELLOW}⚠️  建议设置 .env 文件权限为 600${NC}"
            echo -e "   ${BLUE}   运行：chmod 600 apps/web/.env${NC}"
        fi
    fi
}

# 性能检查
performance_check() {
    echo -e "${BLUE}⚡ 性能检查...${NC}"
    
    if curl -f -s http://localhost:3000/health >/dev/null 2>&1; then
        # 测试API响应时间
        start_time=$(date +%s%N)
        curl -s http://localhost:3000/health >/dev/null 2>&1
        end_time=$(date +%s%N)
        response_time=$(( (end_time - start_time) / 1000000 ))
        
        if [ $response_time -lt 100 ]; then
            echo -e "   ${GREEN}✅ API响应时间良好 (${response_time}ms)${NC}"
        elif [ $response_time -lt 500 ]; then
            echo -e "   ${YELLOW}⚠️  API响应时间一般 (${response_time}ms)${NC}"
        else
            echo -e "   ${RED}❌ API响应时间较慢 (${response_time}ms)${NC}"
        fi
    fi
}

# 生成检查报告
generate_report() {
    echo -e "${BLUE}📋 生成检查报告...${NC}"
    
    report_file="admin-auth-check-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "她聚管理员认证系统检查报告"
        echo "=================================="
        echo "检查时间: $(date)"
        echo "检查脚本: $0"
        echo ""
        
        # 重新运行检查并输出到文件
        check_file_structure 2>&1 | sed 's/\x1b\[[0-9;]*m//g'
        echo ""
        check_configuration 2>&1 | sed 's/\x1b\[[0-9;]*m//g'
        echo ""
        check_dependencies 2>&1 | sed 's/\x1b\[[0-9;]*m//g'
        echo ""
        check_api_service 2>&1 | sed 's/\x1b\[[0-9;]*m//g'
        echo ""
        check_miniprogram_build 2>&1 | sed 's/\x1b\[[0-9;]*m//g'
        echo ""
        security_check 2>&1 | sed 's/\x1b\[[0-9;]*m//g'
        echo ""
        performance_check 2>&1 | sed 's/\x1b\[[0-9;]*m//g'
        
    } > "$report_file"
    
    echo -e "   ${GREEN}✅ 检查报告已生成: $report_file${NC}"
}

# 主执行流程
main() {
    check_file_structure
    echo ""
    check_configuration
    echo ""
    check_dependencies
    echo ""
    check_api_service
    echo ""
    check_miniprogram_build
    echo ""
    security_check
    echo ""
    performance_check
    echo ""
    
    echo "=================================="
    echo -e "${GREEN}🎉 系统检查完成！${NC}"
    
    # 询问是否生成报告
    read -p "是否生成详细检查报告？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        generate_report
    fi
}

# 执行主流程
main
