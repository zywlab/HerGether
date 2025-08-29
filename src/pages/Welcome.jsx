import React, { useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, Users, Heart } from 'lucide-react';

export default function Welcome() {
    // 微信浏览器检测和优化
    useEffect(() => {
        // 设置微信分享信息
        if (window.navigator.userAgent.toLowerCase().includes('micromessenger')) {
            // 设置页面标题供微信分享使用
            document.title = '她聚 - 女性专属安全社交平台';
            
            // 添加微信分享的meta标签
            const addMetaTag = (property, content) => {
                let meta = document.querySelector(`meta[property="${property}"]`);
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.setAttribute('property', property);
                    document.head.appendChild(meta);
                }
                meta.setAttribute('content', content);
            };
            
            addMetaTag('og:title', '她聚 - 找到你的远方姐妹');
            addMetaTag('og:description', '专为女性打造的安全、互助、有趣的社区，一起旅游、探店、分享生活！');
            addMetaTag('og:image', 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400');
            addMetaTag('og:type', 'website');
        }
    }, []);

    const handleLogin = async () => {
        try {
            // 检测微信浏览器
            const isWeChat = window.navigator.userAgent.toLowerCase().includes('micromessenger');
            
            if (isWeChat) {
                // 在微信浏览器中，给用户更友好的提示
                const confirmed = confirm('检测到您在微信中打开，登录后将跳转到浏览器完成认证，是否继续？');
                if (!confirmed) return;
            }
            
            await User.login();
        } catch (error) {
            console.error("登录失败:", error);
            
            // 微信浏览器中的错误提示优化
            if (window.navigator.userAgent.toLowerCase().includes('micromessenger')) {
                alert("登录遇到问题，请尝试在浏览器中打开链接，或稍后再试。");
            } else {
                alert("登录失败，请重试。");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-white flex flex-col justify-center items-center p-4 text-center">
            {/* 微信浏览器顶部安全区域适配 */}
            <div className="w-full h-safe-area-inset-top"></div>
            
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="text-5xl font-bold gradient-text mb-4">她聚</h1>
                <p className="text-gray-600 text-lg mb-8">一个专为女性打造的安全、互助、有趣的社区。</p>
            </motion.div>

            <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.2 } }
                }}
            >
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white">
                    <Heart className="w-10 h-10 text-pink-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-xl mb-2">找到搭子</h3>
                    <p className="text-gray-500 text-sm">无论是旅游、探店还是运动，总能找到志同道合的她。</p>
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white">
                    <Users className="w-10 h-10 text-purple-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-xl mb-2">安全互助</h3>
                    <p className="text-gray-500 text-sm">通过身份认证，我们致力于打造一个真实、可靠的女性专属空间。</p>
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white">
                    <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-xl mb-2">分享生活</h3>
                    <p className="text-gray-500 text-sm">发布你的活动，分享你的精彩，结识更多有趣的灵魂。</p>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 120 }}
                className="flex flex-col items-center"
            >
                <Button
                    onClick={handleLogin}
                    size="lg"
                    variant="outline"
                    className="bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-base h-12 px-8 rounded-full shadow-md flex items-center clickable"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5 mr-3" />
                    通过 Google 登录 / 注册
                </Button>
                <p className="text-xs text-gray-500 mt-4 max-w-xs mx-auto">
                    {window.navigator.userAgent.toLowerCase().includes('micromessenger') ? 
                        '在微信中使用她聚，享受便捷的社交体验。登录将在浏览器中完成以确保安全。' :
                        '目前平台仅支持通过 Google 账户进行安全登录。如果您所在地区无法访问 Google，我们深表歉意，并正在努力在未来支持更多登录方式。'
                    }
                </p>
            </motion.div>
            
            {/* 微信浏览器底部安全区域适配 */}
            <div className="w-full h-safe-area-inset-bottom"></div>
        </div>
    );
}