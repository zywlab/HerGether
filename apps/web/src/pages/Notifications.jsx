import React, { useState, useEffect } from "react";
import { Notification, User } from "@base44/shared/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, MessageSquare, Calendar, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const notificationIcons = {
  activity: Calendar,
  system: Settings,
  message: MessageSquare,
  review: Check
};

const notificationColors = {
  activity: "bg-purple-100 text-purple-700",
  system: "bg-blue-100 text-blue-700",
  message: "bg-pink-100 text-pink-700",
  review: "bg-green-100 text-green-700"
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      const notificationData = await Notification.filter(
        { user_id: userData.id }, 
        "-created_date", 
        50
      );
      setNotifications(notificationData);
    } catch (error) {
      console.error("加载通知失败:", error);
    }
    setIsLoading(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await Notification.update(notificationId, { is_read: true });
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? {...n, is_read: true} : n)
      );
    } catch (error) {
      console.error("标记已读失败:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      for (const notification of unreadNotifications) {
        await Notification.update(notification.id, { is_read: true });
      }
      setNotifications(prev => prev.map(n => ({...n, is_read: true})));
    } catch (error) {
      console.error("标记全部已读失败:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await Notification.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("删除通知失败:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-25/30 to-purple-25/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2 flex items-center gap-2">
              <Bell className="w-8 h-8" />
              通知中心
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white ml-2">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-gray-600">查看你的所有通知消息</p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Check className="w-4 h-4 mr-2" />
              全部标为已读
            </Button>
          )}
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <AnimatePresence>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg animate-pulse"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-pink-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-pink-200 rounded mb-2"></div>
                      <div className="h-3 bg-pink-100 rounded mb-2"></div>
                      <div className="h-3 bg-pink-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : notifications.length > 0 ? (
              notifications.map((notification, index) => {
                const IconComponent = notificationIcons[notification.type] || Bell;
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className={`border-none shadow-lg bg-white/80 backdrop-blur-sm transition-all duration-300 ${
                      !notification.is_read ? 'border-l-4 border-l-pink-500' : ''
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            notificationColors[notification.type] || "bg-gray-100 text-gray-700"
                          }`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                )}
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {format(new Date(notification.created_date), "MM-dd HH:mm")}
                                </span>
                              </div>
                            </div>
                            
                            <p className={`text-sm leading-relaxed ${!notification.is_read ? 'text-gray-700' : 'text-gray-600'}`}>
                              {notification.content}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-3">
                              <Badge variant="outline" className={notificationColors[notification.type]}>
                                {notification.type === "activity" ? "活动" :
                                 notification.type === "system" ? "系统" :
                                 notification.type === "message" ? "消息" : "评价"}
                              </Badge>
                              
                              <div className="flex gap-2 ml-auto">
                                {!notification.is_read && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">暂无通知</h3>
                <p className="text-gray-500">当有新的活动或消息时，会在这里显示</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}