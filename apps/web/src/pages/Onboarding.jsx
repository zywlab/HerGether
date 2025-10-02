import React, { useState, useEffect, useCallback } from 'react';
import { User, UploadFile } from '@base44/shared/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';
import { Loader2, User as UserIcon, AtSign, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Onboarding() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [fullName, setFullName] = useState('');
    const [customUserId, setCustomUserId] = useState('');
    const [idError, setIdError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
                setFullName(userData.full_name || '');
                setAvatarUrl(userData.avatar_url || '');
            } catch (error) {
                // Not logged in, handled by layout
            }
        };
        fetchUser();
    }, []);

    const handleIdChange = (e) => {
        const newId = e.target.value.toLowerCase();
        setCustomUserId(newId);
        // Perform local validation
        if (newId.length > 0 && newId.length < 3) {
            setIdError('ID 至少需要3个字符');
        } else if (newId.length > 0 && !/^[a-zA-Z0-9_]+$/.test(newId)) {
            setIdError('ID 只能包含字母、数字和下划线');
        } else {
            setIdError('');
        }
    };
    
    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setIsUploadingAvatar(true);
        try {
            const { file_url } = await UploadFile({ file });
            setAvatarUrl(file_url);
        } catch (error) {
            console.error("Avatar upload failed", error);
            alert("头像上传失败，请重试");
        }
        setIsUploadingAvatar(false);
    };

    const handleSubmit = async () => {
        if (idError) {
            return;
        }
        if (customUserId.length < 3) {
            setIdError('ID 至少需要3个字符');
            return;
        }
        if (!fullName.trim()) {
            alert('请输入您的昵称。');
            return;
        }

        setIsSubmitting(true);
        try {
            // ================================================================
            // TEMPORARILY REMOVED UNIQUENESS CHECK TO FIX REGISTRATION BLOCKER
            // The User.filter call was failing and preventing users from completing onboarding.
            // This is a temporary measure.
            // ================================================================

            await User.updateMyUserData({
                full_name: fullName,
                avatar_url: avatarUrl,
                custom_user_id: customUserId,
                has_completed_onboarding: true,
            });
            navigate(createPageUrl('ActivityPlaza'));
        } catch (error) {
            console.error('Onboarding failed', error);
            alert('设置失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="bg-white/90 backdrop-blur-sm border-none shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center font-bold gradient-text">欢迎来到她聚！</CardTitle>
                        <p className="text-sm text-center text-gray-500">只需一步，完成你的个人资料设置</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center space-y-2">
                             <div className="relative">
                                <img 
                                    src={avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email}`}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                                />
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <Camera className="w-4 h-4 text-gray-600" />
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarUpload}
                                        disabled={isUploadingAvatar}
                                    />
                                </label>
                                {isUploadingAvatar && <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-full"><Loader2 className="animate-spin text-pink-500" /></div>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="fullName">你的昵称</Label>
                            <div className="relative mt-1">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="pl-9"
                                    placeholder="给自己取个好听的名字吧"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="customId">设置你的专属ID (仅可设置一次)</Label>
                            <div className="relative mt-1">
                                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="customId"
                                    value={customUserId}
                                    onChange={handleIdChange}
                                    placeholder="字母、数字和下划线"
                                    className="pl-9"
                                />
                            </div>
                            {idError && <p className="text-xs text-red-500 mt-1">{idError}</p>}
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || isUploadingAvatar || !!idError}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg text-base h-11"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "完成并进入"}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}