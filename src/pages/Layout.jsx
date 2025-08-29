
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, PlusCircle, User as UserIcon } from "lucide-react";
import { User } from '@/api/entities';

export default function Layout({ children, currentPageName }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                const user = await User.me();
                if (user && !user.has_completed_onboarding && currentPageName !== "Onboarding") {
                    navigate(createPageUrl('Onboarding'), { replace: true });
                }
            } catch (error) {
                // Not authenticated
                if (currentPageName !== "Welcome") {
                    navigate(createPageUrl('Welcome'), { replace: true });
                }
            } finally {
                setIsAuthLoading(false);
            }
        };

        // We don't want to run this check on the Welcome or Onboarding pages themselves
        if (currentPageName !== "Welcome" && currentPageName !== "Onboarding") {
            checkUserStatus();
        } else {
             setIsAuthLoading(false);
        }

    }, [currentPageName, navigate]);

    // 微信浏览器优化
    useEffect(() => {
        // 禁用微信浏览器的下拉刷新
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });

        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(e) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // 防止微信浏览器字体调整
        document.addEventListener('WeixinJSBridgeReady', function() {
            // 禁用微信浏览器字体缩放
            WeixinJSBridge.invoke('setFontSizeCallback', {fontSize: 0});
        });

        // 设置viewport防止缩放
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
            document.head.appendChild(meta);
        }

        // 微信浏览器安全区域适配
        if (window.navigator.userAgent.toLowerCase().includes('micromessenger')) {
            document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)');
        }
    }, []);

    const navItems = [
        { name: "广场", path: "ActivityPlaza", icon: Home },
        { name: "发布", path: "ActivityEditor", icon: PlusCircle },
        { name: "我的", path: "Profile", icon: UserIcon },
    ];

    const noNavPages = ['ActivityDetail', 'ActivityEditor', 'Welcome', 'Onboarding', 'Verification', 'Settings', 'Notifications'];
    const showNav = !noNavPages.includes(currentPageName);
    
    if (isAuthLoading) {
        return (
             <div className="min-h-screen bg-gradient-to-br from-pink-25/30 to-purple-25/30 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* 微信浏览器优化样式 */}
            <style>{`
                /* 微信浏览器适配 */
                body {
                    -webkit-user-select: none;
                    -webkit-touch-callout: none;
                    -webkit-tap-highlight-color: transparent;
                    touch-action: pan-y;
                }
                
                /* 防止微信浏览器下拉露出黑色背景 */
                html, body {
                    overflow-x: hidden;
                    background-color: #f9fafb;
                }
                
                /* 微信浏览器安全区域适配 */
                .safe-area-bottom {
                    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 0.5rem);
                }
                
                /* 优化微信浏览器中的按钮点击反馈 */
                button, .clickable {
                    -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
                }
                
                /* 微信浏览器中的输入框优化 */
                input, textarea {
                    -webkit-appearance: none;
                    border-radius: 0;
                }
                
                /* 防止微信浏览器缩放 */
                * {
                    -webkit-text-size-adjust: 100% !important;
                    -webkit-user-select: auto;
                }
                
                /* 微信浏览器滚动优化 */
                .scroll-smooth {
                    -webkit-overflow-scrolling: touch;
                }
                
                /* 微信分享时的页面标题优化 */
                .gradient-text {
                    background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                /* 微信浏览器中的图片优化 */
                img {
                    -webkit-touch-callout: none;
                    pointer-events: auto;
                }
            `}</style>
            
            <main className={`max-w-md mx-auto bg-white min-h-screen scroll-smooth ${showNav ? 'pb-20 safe-area-bottom' : ''}`}>
                {children}
            </main>

            {showNav && (
                <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 safe-area-bottom">
                    <div className="bg-white/90 backdrop-blur-sm border-t flex justify-around items-center">
                        {navItems.map(item => {
                            const pageUrl = createPageUrl(item.path);
                            const isActive = location.pathname === pageUrl;
                            return (
                                <Link 
                                    key={item.name} 
                                    to={pageUrl} 
                                    className={`flex flex-col items-center gap-1 py-2 px-6 clickable transition-colors duration-200 ${
                                        isActive ? 'text-pink-500' : 'text-gray-500'
                                    }`}
                                >
                                    <item.icon className="w-6 h-6" />
                                    <span className="text-xs">{item.name}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
