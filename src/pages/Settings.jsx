
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Shield, User as UserIcon, LogOut, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Textarea } from "@/components/ui/textarea"; // New import for Textarea

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState(''); // New state for bio
  const [age, setAge] = useState(''); // New state for age
  const [city, setCity] = useState(''); // New state for city
  const [phone, setPhone] = useState(''); // New state for phone
  const [settings, setSettings] = useState({
    notifications: {
      activity: true,
      system: false // 'message' notification removed as per outline
    },
    privacy: {
      showAge: true,
      showCity: true,
      showPhone: false
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      setFullName(userData.full_name || '');
      setBio(userData.bio || ''); // Load bio
      setAge(userData.age ? String(userData.age) : ''); // Load age, convert to string
      setCity(userData.city || ''); // Load city
      setPhone(userData.phone || ''); // Load phone
      // Load saved settings if they exist
      if (userData.settings) {
        // Merge saved settings with default structure to ensure consistency
        setSettings(prev => ({
          ...prev, // Keep default structure
          ...userData.settings, // Overlay saved settings
          notifications: { // Specifically handle notifications
            ...prev.notifications, // Keep default notification structure
            ...userData.settings.notifications // Overlay saved notification settings
          }
        }));
      }
    } catch (error) {
      console.error("加载用户数据失败:", error);
    }
    setIsLoading(false);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Save all user data
      await User.updateMyUserData({
        full_name: fullName,
        bio: bio, // Save bio
        age: age ? parseInt(age) : null, // Save age, convert to int or null
        city: city, // Save city
        phone: phone, // Save phone
        settings: settings,
      });
      alert("设置已保存");
      navigate(createPageUrl('Profile'));
    } catch (error) {
      console.error("保存设置失败:", error);
      alert("保存失败，请重试");
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    if (confirm("确定要退出登录吗？")) {
      try {
        await User.logout();
        navigate(createPageUrl('Welcome')); // 退出后跳转到欢迎页面
      } catch (error) {
        console.error("退出登录失败:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-25/30 to-purple-25/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-25/30 to-purple-25/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">设置</h1>
          <p className="text-gray-600">管理你的账户和偏好设置</p>
        </motion.div>

        <div className="space-y-6">
          {/* 账户信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-pink-500" />
                  账户信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">昵称 *</label> {/* Updated label */}
                    <Input 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="输入你的昵称"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">用户名</label>
                    <p className="text-gray-700 bg-gray-50 p-2 rounded border text-lg font-mono">
                      @{user?.custom_user_id || '未设置'}
                      <span className="text-xs text-gray-500 ml-2 font-sans">(设置后不可更改)</span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">个人简介</label>
                    <Textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="介绍一下自己吧..."
                      className="bg-white h-20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">年龄</label>
                      <Input 
                        type="number"
                        min="16"
                        max="99"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="选填"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">所在城市</label>
                      <Input 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="选填"
                        className="bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">手机号</label>
                    <Input 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="选填，用于紧急联系"
                      className="bg-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 通知设置 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-500" />
                  通知设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">活动通知</p>
                    <p className="text-sm text-gray-500">活动报名、取消、公告等通知</p> {/* Updated description */}
                  </div>
                  <Switch 
                    checked={settings.notifications.activity}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        notifications: {...prev.notifications, activity: checked}
                      }))
                    }
                  />
                </div>
                <Separator />
                {/* Message notification removed */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">系统通知</p>
                    <p className="text-sm text-gray-500">系统更新、维护等通知</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.system}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        notifications: {...prev.notifications, system: checked}
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 隐私设置 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  隐私设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">显示年龄</p>
                    <p className="text-sm text-gray-500">是否在个人资料中显示年龄</p>
                  </div>
                  <Switch 
                    checked={settings.privacy.showAge}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        privacy: {...prev.privacy, showAge: checked}
                      }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">显示城市</p>
                    <p className="text-sm text-gray-500">是否在个人资料中显示所在城市</p>
                  </div>
                  <Switch 
                    checked={settings.privacy.showCity}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        privacy: {...prev.privacy, showCity: checked}
                      }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">显示手机号</p>
                    <p className="text-sm text-gray-500">是否允许其他用户看到手机号</p>
                  </div>
                  <Switch 
                    checked={settings.privacy.showPhone}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        privacy: {...prev.privacy, showPhone: checked}
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 操作按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <Button 
              onClick={handleSaveSettings} 
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "保存中..." : "保存设置"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
