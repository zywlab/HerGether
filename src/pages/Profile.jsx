
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Bell, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActivityPost } from "@/api/entities";
import { ActivityRegistration } from "@/api/entities";
import { Favorite } from "@/api/entities";
import { Review } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReviewPrompt from "../components/review/ReviewPrompt";
import ActivityRating from "../components/review/ActivityRating";
import ReviewListModal from "../components/review/ReviewListModal";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("activities");
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [myPosts, setMyPosts] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [myFavorites, setMyFavorites] = useState([]);
  const [myReviews, setMyReviews] = useState([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      const [posts, registrations, favorites, reviewsReceived] = await Promise.all([
          ActivityPost.filter({ created_by: userData.email }, '-updated_date'),
          ActivityRegistration.filter({ user_id: userData.id }),
          Favorite.filter({ user_id: userData.id }),
          Review.filter({ reviewee_id: userData.id })
      ]);
      
      const populatedRegistrations = await Promise.all(
          registrations.map(async (reg) => {
              try {
                  const activity = await ActivityPost.get(reg.activity_id);
                  // Ensure activity.dates exists and is an array
                  const activityDates = Array.isArray(activity.dates) ? activity.dates : [new Date().toISOString()];
                  return { ...reg, activity: { ...activity, dates: activityDates } };
              } catch (e) {
                  // Fallback for activities that might be deleted or inaccessible
                  return { ...reg, activity: { title: "活动已失效", dates: [new Date().toISOString()] } };
              }
              
          })
      );

      setMyPosts(posts);
      setMyRegistrations(populatedRegistrations);
      setMyFavorites(favorites);
      setMyReviews(reviewsReceived);

    } catch (error) {
      console.error("用户未登录或网络错误:", error);
      setUser(null); // Ensure user is null if not authenticated
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    try {
      await User.login();
    } catch (error) {
      console.error("登录失败:", error);
    }
  };
  
  const handleToggleAnonymity = async (regId, currentStatus) => {
    try {
        await ActivityRegistration.update(regId, { is_public: !currentStatus });
        setMyRegistrations(prev => prev.map(r => r.id === regId ? {...r, is_public: !currentStatus} : r));
    } catch(e) {
        alert("更新失败，请重试");
        console.error("Failed to update anonymity:", e);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-25/30 to-purple-25/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-25/30 to-purple-25/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm p-8">
            <CardContent>
              <LogIn className="w-16 h-16 mx-auto text-pink-500 mb-4" />
              <h2 className="2xl font-bold gradient-text mb-2">欢迎来到她聚</h2>
              <p className="text-gray-600 mb-6">登录后即可查看个人资料和活动记录</p>
              <Button
                onClick={handleLogin}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                <LogIn className="w-4 h-4 mr-2" />
                立即登录
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const VerificationStatus = () => {
    if (!user) return null;
    switch (user.verification_status) {
        case 'verified':
            return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        case 'pending':
            return <Badge variant="outline" className="text-yellow-600 border-yellow-400">审核中</Badge>;
        case 'rejected':
            return <Badge variant="destructive">认证失败</Badge>;
        default:
            return (
                <Link to={createPageUrl("Verification")}>
                    <Badge className="bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer">
                        未认证
                    </Badge>
                </Link>
            );
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 pb-24">
      {/* Header */}
      <div className="flex justify-end gap-2 mb-4">
        <Link to={createPageUrl("Notifications")}>
          <Button variant="ghost" size="icon"><Bell className="w-5 h-5"/></Button>
        </Link>
        <Link to={createPageUrl("Settings")}>
          <Button variant="ghost" size="icon"><Settings className="w-5 h-5"/></Button>
        </Link>
      </div>

      {/* Review Prompt - 类似Uber的评价提醒 */}
      <ReviewPrompt user={user} />

      {/* User Info */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="avatar" className="w-full h-full rounded-full object-cover"/>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">
              {user?.full_name?.charAt(0) || '女'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-xl font-bold">{user?.full_name || '新用户'}</h2>
            <VerificationStatus />
          </div>
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <ActivityRating 
              reviews={myReviews} 
              onClick={() => setShowReviewModal(true)}
            />
          </div>
          <p className="text-sm text-gray-500 mb-1">ID: {user?.custom_user_id || (user?.id ? user.id.slice(0, 8) + '...' : 'N/A')}</p>
          
          {/* 显示年龄和城市信息 */}
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
            {user?.age && user?.settings?.privacy?.showAge !== false && (
              <span>{user.age}岁</span>
            )}
            {user?.city && user?.settings?.privacy?.showCity !== false && (
              <span>{user.city}</span>
            )}
            {user?.phone && user?.settings?.privacy?.showPhone && (
              <span>📱 {user.phone}</span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{user?.bio || '这位姐妹很神秘，什么也没留下~'}</p>
        </div>
        <Link to={createPageUrl("Settings")}>
          <Button variant="outline" size="sm" className="rounded-full">编辑资料</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-2 font-semibold ${activeTab === 'activities' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
        >
          活动
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 font-semibold ${activeTab === 'favorites' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
        >
          收藏
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'activities' && (
          <div className="space-y-4">
            <h3 className="font-bold">我发起的</h3>
            {myPosts.length > 0 ? (
              myPosts.map(p => {
                const hasEnded = !p.is_long_term && p.dates && p.dates.length > 0 && new Date(p.dates[0]) < new Date();
                return (
                  <div key={p.id} className={`p-3 bg-gray-50 rounded-md border border-gray-100 ${hasEnded ? 'text-gray-400' : ''}`}>
                    <h4 className="font-semibold text-sm">{p.title}</h4>
                    <p className="text-xs">创建于: {new Date(p.created_date).toLocaleDateString()}</p>
                    {hasEnded && <Badge variant="outline" className="mt-1">已结束</Badge>}
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-gray-400">还没有发起过活动</p>
            )}
            <h3 className="font-bold mt-4">我报名的</h3>
            {myRegistrations.length > 0 ? (
              myRegistrations.map(r => (
                <div key={r.id} className="p-3 bg-gray-50 rounded-md border border-gray-100 space-y-2">
                  <h4 className="font-semibold text-sm">{r.activity?.title}</h4>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>报名时间: {new Date(r.created_date).toLocaleDateString()}</span>
                    <Badge variant={r.status === '已报名' ? 'default' : 'secondary'}>{r.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t mt-2">
                     <p className="text-xs">
                        {r.guest_count > 0 && `携带 ${r.guest_count} 位朋友`}
                     </p>
                     <div className="flex items-center gap-2">
                        <Label className="text-xs">{r.is_public ? '公开' : '匿名'}</Label>
                        <Switch 
                            checked={r.is_public}
                            onCheckedChange={() => handleToggleAnonymity(r.id, r.is_public)}
                            className="w-8 h-4 [&>span]:w-3 [&>span]:h-3"
                        />
                     </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">还没有报过名</p>
            )}
          </div>
        )}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            {myFavorites.length > 0 ? (
              myFavorites.map(f => (
                <div key={f.id} className="p-3 bg-gray-50 rounded-md border border-gray-100">
                  <h4 className="font-semibold text-sm">{f.title || `收藏项 ID: ${f.id}`}</h4>
                  <p className="text-xs text-gray-500">收藏时间: {new Date(f.created_date).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">还没有收藏</p>
            )}
          </div>
        )}
      </div>

      {/* Review List Modal */}
      <ReviewListModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        reviews={myReviews}
        userName={user?.full_name || '用户'}
        currentUser={user}
      />
    </div>
  );
}
