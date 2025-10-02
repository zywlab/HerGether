
import React, { useState, useEffect } from 'react';
import { ActivityPost, User, Review, ActivityRegistration, Favorite } from '@base44/shared/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Star, Heart, Edit, MessageSquare, MapPin, Calendar, Users, Trash2, CheckCircle2, Repeat, Megaphone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import ReviewModal from '../components/review/ReviewModal';
import ReviewList from '../components/review/ReviewList';
import ActivityRating from '../components/review/ActivityRating';
import RegistrationModal from '../components/activity/RegistrationModal';
import CommentSection from '../components/activity/CommentSection'; // Added CommentSection import
import AnnouncementModal from '../components/activity/AnnouncementModal';
import AnnouncementSection from '../components/activity/AnnouncementSection';

export default function ActivityDetail() {
  const location = useLocation();
  const [activity, setActivity] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewType, setReviewType] = useState('');
  const [userRegistration, setUserRegistration] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false); // Added isFavorited state
  const [favoriteId, setFavoriteId] = useState(null); // Added favoriteId state
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const activityId = searchParams.get('id');
    if (activityId) {
      loadData(activityId);
    }
  }, [location.search]);

  const loadData = async (activityId) => {
    setIsLoading(true);
    try {
      const currentUserDataPromise = User.me().catch(() => null); // Allow anonymous users
      const [activityData, currentUserData] = await Promise.all([
        ActivityPost.get(activityId),
        currentUserDataPromise
      ]);
      
      setActivity(activityData);
      setCurrentUser(currentUserData);

      // 获取发起人信息
      const organizerData = await User.filter({ email: activityData.created_by });
      setOrganizer(organizerData[0]);

      // 获取活动评价
      const reviewsData = await Review.filter({ activity_id: activityId });
      setReviews(reviewsData);

      // 获取活动报名信息
      const registrationsData = await ActivityRegistration.filter({ activity_id: activityId });
      setRegistrations(registrationsData);

      // 检查当前用户是否已报名
      // Only set user registration if currentUserData is not null
      if (currentUserData) {
        const currentUserRegistration = registrationsData.find(r => r.user_id === currentUserData.id);
        setUserRegistration(currentUserRegistration);

        // 检查是否已收藏
        const favs = await Favorite.filter({ user_id: currentUserData.id, item_id: activityId });
        if (favs.length > 0) {
            setIsFavorited(true);
            setFavoriteId(favs[0].id);
        } else {
            setIsFavorited(false);
            setFavoriteId(null);
        }
      } else {
        setUserRegistration(null); // No current user means no registration
        setIsFavorited(false); // No current user means not favorited
        setFavoriteId(null);
      }

    } catch (error) {
      console.error("Failed to load activity details", error);
    }
    setIsLoading(false);
  };

  const handleToggleFavorite = async () => {
    if (!currentUser) {
        alert("请先登录");
        return;
    }
    try {
        if (isFavorited) {
            await Favorite.delete(favoriteId);
            setIsFavorited(false);
            setFavoriteId(null);
        } else {
            const newFav = await Favorite.create({
                user_id: currentUser.id,
                item_id: activity.id,
                item_type: 'activity',
                title: activity.title,
            });
            setIsFavorited(true);
            setFavoriteId(newFav.id);
        }
    } catch (error) {
        console.error("Failed to toggle favorite status:", error);
        alert("操作失败，请重试。");
    }
  };

  const handleDeleteActivity = async () => {
    if (window.confirm("⚠️ 确定要永久删除这个活动吗？\n\n删除后：\n• 活动将从广场消失\n• 所有报名记录将被清除\n• 此操作无法撤销")) {
        try {
            await ActivityPost.delete(activity.id);
            // Navigate away after deletion
            window.history.back(); // Or navigate to a specific page
        } catch (error) {
            console.error("删除活动失败:", error);
            alert("删除失败，请重试。");
        }
    }
  };

  const handleRegister = async () => {
    if (!currentUser) {
      await User.login();
      return;
    }
    if(currentUser.verification_status !== 'verified') {
        alert("请先完成身份认证后再报名活动。");
        return;
    }
    setShowRegistrationModal(true);
  };

  const handleReviewUser = (user, type) => {
    setReviewTarget(user);
    setReviewType(type);
    setShowReviewModal(true);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
    </div>
  );

  if (!activity) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">活动不存在</p>
    </div>
  );

  const formatRecurrenceRule = (rule) => {
    if (!rule) return null;
    const weekdays = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    switch(rule.type) {
        case 'weekly':
            // rule.value for weekly is a number 1-7 for day of week
            return `每周${weekdays[rule.value]}`;
        case 'monthly':
            // rule.value for monthly is a number 1-31 for day of month
            return `每月${rule.value}日`;
        case 'daily_interval':
            // rule.value for daily_interval is a number for interval days
            return `每隔 ${rule.value} 天`;
        default:
            return "长期活动";
    }
  }

  const isOwner = currentUser?.email === activity.created_by;
  const hasRegistered = !!userRegistration;
  const canReview = hasRegistered && userRegistration.status === "已参加";
  const isVerified = currentUser?.verification_status === 'verified';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-between p-4 border-b">
        <Link to={createPageUrl("ActivityPlaza")}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
            <Heart className={`w-5 h-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
          </Button>
          {isOwner && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowAnnouncementModal(true)}
                className="text-orange-500 hover:text-orange-600"
                title="发布公告"
              >
                <Megaphone className="w-5 h-5" />
              </Button>
              <Link to={createPageUrl(`ActivityEditor?id=${activity.id}`)}>
                <Button variant="ghost" size="icon">
                  <Edit className="w-5 h-5" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-500 hover:text-red-600" 
                onClick={handleDeleteActivity}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Image */}
      <div className="relative">
        <img 
          src={activity.image_url || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop'} 
          alt={activity.title} 
          className="w-full h-64 object-cover" 
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-pink-500 text-white shadow-lg">
            {activity.project_type}
          </Badge>
          <Badge className="bg-purple-500 text-white shadow-lg">
            {activity.category}
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Title & Basic Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{activity.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{activity.city}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {activity.is_long_term ? '长期' : 
                 activity.dates.map(d => format(new Date(d), 'MM月dd日', { locale: zhCN })).join(', ')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{registrations.length}/{activity.max_participants}人</span>
            </div>
            {activity.is_long_term && activity.recurrence_rule && (
              <div className="flex items-center gap-1">
                  <Repeat className="w-4 h-4" />
                  <span>{formatRecurrenceRule(activity.recurrence_rule)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Organizer Info */}
        {organizer && (
          <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Link to={isVerified ? createPageUrl(`ProfileView?userId=${organizer.id}`) : '#'} className="no-underline">
                    <div className="flex items-center gap-3">
                      <img 
                        src={organizer.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b6fb8f02?w=150'} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-800">{organizer.full_name}</h3>
                            {organizer.verification_status === 'verified' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </div>
                        <ActivityRating reviews={reviews.filter(r => r.reviewee_id === organizer.id)} />
                      </div>
                    </div>
                </Link>
                {canReview && !isOwner && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleReviewUser(organizer, 'to_organizer')}
                    className="border-pink-300 text-pink-600 hover:bg-pink-50"
                  >
                    <Star className="w-4 h-4 mr-1" />
                    评价发起人
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Announcement Section - 仅报名者可见 */}
        <AnnouncementSection 
          activityId={activity.id} 
          hasRegistered={hasRegistered} 
        />

        {/* Activity Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">费用：</span>
              <span className="text-pink-600 font-semibold">
                {activity.cost_type === '自定义' ? activity.cost_description : activity.cost_type}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">预期人数：</span>
              <span className="text-gray-600">{activity.max_participants}人</span>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-2">活动描述</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{activity.description}</p>
          </div>

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">标签</h3>
              <div className="flex flex-wrap gap-2">
                {activity.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="border-pink-200 text-pink-700">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Registered Users */}
        {registrations.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-3">已报名用户 ({registrations.length})</h3>
            <div className="grid grid-cols-2 gap-3">
              {registrations.map(registration => (
                <Card key={registration.id} className="border-pink-100">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center text-xs font-medium">
                        {registration.is_public ? (registration.user_name?.charAt(0) || '?') : '匿'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {registration.is_public ? `用户${registration.user_id.slice(0, 6)}` : '匿名用户'}
                          {registration.guest_count > 0 && <span className="text-xs font-normal"> +{registration.guest_count}</span>}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(registration.created_date), 'MM/dd', { locale: zhCN })}报名
                        </p>
                      </div>
                      {canReview && isOwner && registration.status === "已参加" && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleReviewUser({ id: registration.user_id }, 'to_participant')}
                          className="text-pink-600 hover:bg-pink-50"
                        >
                          <Star className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <ReviewList reviews={reviews} title="用户评价" />

        {/* Comment Section */}
        <CommentSection activityId={activity.id} currentUser={currentUser} />
      </div>
      
      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="max-w-md mx-auto">
          {isOwner ? (
            <Button className="w-full" size="lg" disabled>
              <MessageSquare className="w-4 h-4 mr-2"/>
              你是活动发起人
            </Button>
          ) : hasRegistered ? (
            <Button className="w-full" size="lg" disabled>
              <MessageSquare className="w-4 h-4 mr-2"/>
              已报名 · 可查看联系方式
            </Button>
          ) : (
            <Button 
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600" 
              size="lg"
              onClick={handleRegister}
            >
              <MessageSquare className="w-4 h-4 mr-2"/>
              {currentUser && !isVerified ? '认证后即可报名' : '立即报名'}
            </Button>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        activity={activity}
        currentUser={currentUser}
        registrations={registrations}
        onRegistrationSuccess={() => {
          setShowRegistrationModal(false);
          loadData(activity.id);
        }}
      />

      {/* Review Modal */}
      <ReviewModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        revieweeUser={reviewTarget}
        activity={activity}
        currentUser={currentUser}
        reviewType={reviewType}
        onReviewSubmitted={() => loadData(activity.id)}
      />

      {/* Announcement Modal */}
      <AnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        activity={activity}
        registrations={registrations}
        currentUser={currentUser}
      />
    </div>
  );
}
