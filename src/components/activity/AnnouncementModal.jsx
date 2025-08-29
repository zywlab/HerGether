import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Megaphone, Send } from 'lucide-react';
import { ActivityAnnouncement } from '@/api/entities';
import { Notification } from '@/api/entities';

export default function AnnouncementModal({ isOpen, onClose, activity, registrations, currentUser }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            alert('请填写公告标题和内容');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. 创建公告
            await ActivityAnnouncement.create({
                activity_id: activity.id,
                title: title.trim(),
                content: content.trim(),
                is_urgent: isUrgent,
                is_pinned: true
            });

            // 2. 为所有报名者创建通知
            const notificationPromises = registrations.map(reg => 
                Notification.create({
                    user_id: reg.user_id,
                    title: `${isUrgent ? '【紧急】' : ''}活动公告：${title}`,
                    content: `《${activity.title}》发布了新公告：${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
                    type: 'activity',
                    related_id: activity.id
                })
            );

            await Promise.all(notificationPromises);
            
            alert(`公告发布成功！已通知 ${registrations.length} 位参与者`);
            onClose();
            
        } catch (error) {
            console.error('发布公告失败:', error);
            alert('发布公告失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md"
                >
                    <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm">
                        <CardHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-red-50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl gradient-text flex items-center gap-2">
                                    <Megaphone className="w-6 h-6 text-orange-500" />
                                    发布活动公告
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                            <p className="text-sm text-gray-600">
                                向所有已报名的参与者发送重要通知
                            </p>
                        </CardHeader>
                        
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <Label className="text-sm font-medium">公告标题 *</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="例如：集合地点变更通知"
                                    className="mt-1"
                                    maxLength={50}
                                />
                                <p className="text-xs text-gray-500 mt-1">{title.length}/50</p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">公告内容 *</Label>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="详细说明公告内容..."
                                    className="mt-1 min-h-[100px]"
                                    maxLength={500}
                                />
                                <p className="text-xs text-gray-500 mt-1">{content.length}/500</p>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <Label className="text-sm font-medium">紧急公告</Label>
                                    <p className="text-xs text-gray-600">标记为紧急会优先推送</p>
                                </div>
                                <Switch 
                                    checked={isUrgent}
                                    onCheckedChange={setIsUrgent}
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    📋 将通知 <span className="font-bold">{registrations.length}</span> 位已报名参与者
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" onClick={onClose} className="flex-1">
                                    取消
                                </Button>
                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={isSubmitting || !title.trim() || !content.trim()}
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {isSubmitting ? '发布中...' : '发布公告'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}