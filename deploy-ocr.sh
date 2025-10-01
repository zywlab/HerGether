#!/bin/bash

# OCR API部署脚本
set -e

echo "🚀 开始部署 OCR API 服务..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装，请先安装 Docker${NC}"
    exit 1
fi

# 检查docker-compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose 未安装，请先安装 docker-compose${NC}"
    exit 1
fi

# 检查环境配置文件
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠️  .env.production 文件不存在，请创建并配置必要的环境变量${NC}"
    echo "请参考 .env.example 文件进行配置"
    exit 1
fi

# 检查必要的环境变量
echo "🔍 检查环境配置..."
source .env.production

required_vars=("TENCENT_SECRET_ID" "TENCENT_SECRET_KEY" "BAIDU_API_KEY" "BAIDU_SECRET_KEY" "ENCRYPTION_KEY" "API_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo -e "${RED}❌ 以下环境变量未配置:${NC}"
    printf '%s\n' "${missing_vars[@]}"
    exit 1
fi

echo -e "${GREEN}✅ 环境配置检查通过${NC}"

# 构建Docker镜像
echo "🔨 构建 Docker 镜像..."
docker-compose build --no-cache

# 停止现有服务
echo "🛑 停止现有服务..."
docker-compose down

# 启动服务
echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 健康检查
echo "🏥 进行健康检查..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:3001/health &> /dev/null; then
        echo -e "${GREEN}✅ 服务启动成功！${NC}"
        break
    fi
    
    echo "尝试 $attempt/$max_attempts: 等待服务响应..."
    sleep 2
    ((attempt++))
done

if [ $attempt -gt $max_attempts ]; then
    echo -e "${RED}❌ 服务启动失败，请检查日志${NC}"
    docker-compose logs
    exit 1
fi

# 显示服务状态
echo "📊 服务状态:"
docker-compose ps

echo ""
echo -e "${GREEN}🎉 OCR API 服务部署成功！${NC}"
echo ""
echo "🌐 API地址: http://localhost:3001"
echo "🏥 健康检查: http://localhost:3001/health"
echo "📋 API文档:"
echo "  - POST /api/ocr/id-card (通用身份证OCR)"
echo "  - POST /api/ocr/tencent-id-card (腾讯云OCR)"
echo "  - POST /api/ocr/baidu-id-card (百度云OCR)"
echo "  - POST /api/ocr/upload (文件上传OCR)"
echo ""
echo "📝 查看日志: docker-compose logs -f"
echo "🛑 停止服务: docker-compose down"
echo ""
echo -e "${YELLOW}⚠️  请确保在小程序中正确配置 API_BASE_URL${NC}"
