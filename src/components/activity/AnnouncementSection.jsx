import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Pin } from 'lucide-react';
import { ActivityAnnouncement } from '@/api/entities';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function AnnouncementSection({ activityId, hasRegistered }) {
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (hasRegistered) {
            loadAnnouncements();
        } else {
            setIsLoading(false);
        }
    }, [activityId, hasRegistered]);

    const loadAnnouncements = async () => {
        setIsLoading(true);
        try {
            const announcementData = await ActivityAnnouncement.filter(
                { activity_id: activityId, is_pinned: true }, 
                '-created_date'
            );
            setAnnouncements(announcementData);
        } catch (error) {
            console.error('加载公告失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 如果用户未报名，不显示公告区域
    if (!hasRegistered) {
        return null;
    }

    // 如果正在加载或没有公告，不显示
    if (isLoading || announcements.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-orange-500" />
                活动公告
            </h3>
            
            {announcements.map((announcement, index) => (
                <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Pin className="w-4 h-4 text-orange-600" />
                                    <h4 className="font-semibold text-orange-800">
                                        {announcement.title}
                                    </h4>
                                    {announcement.is_urgent && (
                                        <Badge className="bg-red-500 text-white text-xs">
                                            紧急
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-xs text-orange-600">
                                    {format(new Date(announcement.created_date), 'MM-dd HH:mm', { locale: zhCN })}
                                </span>
                            </div>
                            <p className="text-sm text-orange-700 leading-relaxed whitespace-pre-wrap">
                                {announcement.content}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}