// 小程序兼容的工具函数（不依赖DOM）
export function createPageUrl(pageName) {
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}

// 日期格式化
export function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN');
}

// 图片 URL 处理
export function getImageUrl(path, defaultImage = '') {
    if (!path) return defaultImage;
    if (path.startsWith('http')) return path;
    return `https://your-cdn-domain.com/${path}`;
}

// 文本截断
export function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}
