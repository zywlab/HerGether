import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Users, Phone } from 'lucide-react';
import { ActivityRegistration } from '@/api/entities';

export default function RegistrationModal({ isOpen, onClose, activity, currentUser, registrations, onRegistrationSuccess }) {
    const [contactInfo, setContactInfo] = useState('');
    const [message, setMessage] = useState('');
    const [guestCount, setGuestCount] = useState(0);
    const [isPublic, setIsPublic] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 自动填入用户的手机号
    useEffect(() => {
        if (currentUser?.phone && !contactInfo) {
            setContactInfo(currentUser.phone);
        }
    }, [currentUser, isOpen]);

    const handleAutoFillPhone = () => {
        if (currentUser?.phone) {
            setContactInfo(currentUser.phone);
        }
    };

    const handleSubmit = async () => {
        if (!contactInfo.trim()) {
            alert('请填写联系方式');
            return;
        }

        if (guestCount > activity.max_guests_per_participant) {
            alert(`最多只能携带 ${activity.max_guests_per_participant} 位朋友`);
            return;
        }

        setIsSubmitting(true);
        try {
            await ActivityRegistration.create({
                user_id: currentUser.id,
                activity_id: activity.id,
                contact_info: contactInfo.trim(),
                message: message.trim(),
                guest_count: guestCount,
                is_public: isPublic,
                status: "已报名"
            });
            
            alert('报名成功！');
            onRegistrationSuccess();
        } catch (error) {
            console.error('报名失败:', error);
            alert('报名失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const remainingSpots = activity.max_participants - registrations.length;

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
                    className="w-full max-w-md max-h-[90vh] overflow-y-auto"
                >
                    <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm">
                        <CardHeader className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl gradient-text flex items-center gap-2">
                                    <Users className="w-6 h-6 text-pink-500" />
                                    报名活动
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="text-sm text-gray-600">
                                <p className="font-medium">{activity.title}</p>
                                <p>剩余名额：{remainingSpots} 人</p>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-6 space-y-4">
                            {/* 联系方式 */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <Label htmlFor="contact">联系方式 *</Label>
                                    {currentUser?.phone && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleAutoFillPhone}
                                            className="text-xs text-pink-600 hover:text-pink-700 h-auto p-1"
                                        >
                                            <Phone className="w-3 h-3 mr-1" />
                                            使用账户手机号
                                        </Button>
                                    )}
                                </div>
                                <Input
                                    id="contact"
                                    value={contactInfo}
                                    onChange={(e) => setContactInfo(e.target.value)}
                                    placeholder="微信号/手机号"
                                    className="bg-white"
                                />
                                {currentUser?.phone && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        账户手机号：{currentUser.phone}
                                    </p>
                                )}
                            </div>

                            {/* 携带朋友数 */}
                            {activity.max_guests_per_participant > 0 && (
                                <div>
                                    <Label htmlFor="guests">携带朋友数 (可选)</Label>
                                    <Select value={String(guestCount)} onValueChange={(value) => setGuestCount(Number(value))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择携带人数" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: activity.max_guests_per_participant + 1 }, (_, i) => (
                                                <SelectItem key={i} value={String(i)}>
                                                    {i === 0 ? '不携带朋友' : `携带 ${i} 位朋友`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* 报名留言 */}
                            <div>
                                <Label htmlFor="message">给发起人的话 (可选)</Label>
                                <Textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="简单介绍自己，或者问个问题..."
                                    className="bg-white h-20"
                                />
                            </div>

                            {/* 匿名选项 */}
                            {activity.allow_anonymous_registration && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <Label htmlFor="isPublic" className="font-medium">公开显示</Label>
                                        <p className="text-xs text-gray-600">关闭后将匿名显示在报名列表中</p>
                                    </div>
                                    <Switch
                                        id="isPublic"
                                        checked={isPublic}
                                        onCheckedChange={setIsPublic}
                                    />
                                </div>
                            )}

                            {/* 提交按钮 */}
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || remainingSpots <= 0}
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 h-12"
                            >
                                {isSubmitting ? '报名中...' : 
                                 remainingSpots <= 0 ? '名额已满' : 
                                 `确认报名${guestCount > 0 ? ` (${1 + guestCount}人)` : ''}`}
                            </Button>

                            <p className="text-xs text-gray-500 text-center">
                                报名成功后，发起人将看到您的联系方式
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}