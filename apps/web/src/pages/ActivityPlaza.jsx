
import React, { useState, useEffect } from "react";
import { ActivityPost, User, Favorite } from "@base44/shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, MapPin, Calendar, Users, Star, Heart, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ActivityFilter from "../components/activity/ActivityFilter"; // Added import

const ActivityCard = ({ activity, onFavoriteToggle, isFavorited }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-pink-50 hover:shadow-xl transition-all duration-300 flex flex-col"
  >
    <Link to={createPageUrl(`ActivityDetail?id=${activity.id}`)} className="flex-grow">
      <img
        src={activity.image_url || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop'}
        alt={activity.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg line-clamp-2 mb-2">{activity.title}</h3>

        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-pink-100 text-pink-700 text-xs">
            {activity.project_type}
          </Badge>
          <Badge className="bg-purple-100 text-purple-700 text-xs">
            {activity.category}
          </Badge>
          {activity.tags && activity.tags.map((tag, index) => (
            <Badge key={index} className="bg-blue-100 text-blue-700 text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{activity.description}</p>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <MapPin className="w-3 h-3" />
          <span>{activity.city}</span>
          <Calendar className="w-3 h-3 ml-2" />
          <span>
            {activity.is_long_term ? '长期' : format(new Date(activity.dates[0]), "MM/dd", { locale: zhCN })}
          </span>
        </div>
      </div>
    </Link>
    <div className="p-4 pt-0 mt-auto">
        <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-pink-500">
                {activity.cost_type === '自定义' ? activity.cost_description : activity.cost_type}
            </div>
            <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Users className="w-3 h-3"/> {activity.max_participants}人
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onFavoriteToggle(activity); }} 
                    className="text-pink-300 hover:text-pink-500 z-10"
                >
                    <Heart className={`w-5 h-5 transition-all ${isFavorited ? 'text-red-500 fill-current' : ''}`} />
                </button>
            </div>
        </div>
    </div>
  </motion.div>
);

export default function ActivityPlaza() {
  const [activities, setActivities] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveType] = useState('旅游出行');
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false); // Added state for filter modal visibility
  const [filters, setFilters] = useState({ // Added state for filters
    activity_type: 'all',
    category: 'all',
    city: '',
    tags: [],
    cost_type: 'all',
    date_range: 'all',
    max_participants: 'all'
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
        const currentUserPromise = User.me().catch(() => null); // Handle case where user is not logged in
        const activitiesPromise = ActivityPost.filter({ is_public: true });

        const [user, activitiesData] = await Promise.all([currentUserPromise, activitiesPromise]);
        
        setActivities(activitiesData);
        setCurrentUser(user);

        if (user) {
            const favoritesData = await Favorite.filter({ user_id: user.id });
            setUserFavorites(favoritesData);
        }
    } catch (error) {
      console.error("加载活动失败:", error);
      setActivities([]);
      setUserFavorites([]); // Ensure favorites are also reset on error
      setCurrentUser(null);
    }
    setIsLoading(false);
  };

  const handleFavoriteToggle = async (activity) => {
    if (!currentUser) {
        alert("请先登录再收藏");
        return;
    }
    const favorite = userFavorites.find(f => f.item_id === activity.id && f.item_type === 'activity');
    if (favorite) {
        try {
            await Favorite.delete(favorite.id);
            setUserFavorites(prev => prev.filter(f => f.id !== favorite.id));
        } catch (error) {
            console.error("取消收藏失败:", error);
            alert("取消收藏失败，请稍后再试。");
        }
    } else {
        try {
            const newFav = await Favorite.create({
                user_id: currentUser.id,
                item_id: activity.id,
                item_type: 'activity',
                title: activity.title,
            });
            setUserFavorites(prev => [...prev, newFav]);
        } catch (error) {
            console.error("收藏失败:", error);
            alert("收藏失败，请稍后再试。");
        }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const getFilteredActivities = () => {
    return activities.filter(activity => {
      // 基本类型过滤 (from main category buttons)
      // activeType === '全部' is unreachable with current UI, but kept as per outline
      const typeMatch = activeType === '全部' || activity.activity_type === activeType;
      
      // 搜索词过滤
      const searchMatch = !searchTerm ||
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.tags && activity.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      // 高级筛选过滤
      const activityTypeMatch = filters.activity_type === 'all' || activity.activity_type === filters.activity_type;
      const categoryMatch = filters.category === 'all' || activity.category === filters.category;
      const cityMatch = !filters.city || activity.city.toLowerCase().includes(filters.city.toLowerCase());
      
      const tagsMatch = filters.tags.length === 0 || 
        (activity.tags && filters.tags.some(filterTag => 
          activity.tags.some(activityTag => 
            activityTag.toLowerCase().includes(filterTag.toLowerCase())
          )
        ));
      
      const costMatch = filters.cost_type === 'all' || activity.cost_type === filters.cost_type;
      
      const participantMatch = filters.max_participants === 'all' ||
        (filters.max_participants === 'small' && activity.max_participants >= 2 && activity.max_participants <= 5) ||
        (filters.max_participants === 'medium' && activity.max_participants >= 6 && activity.max_participants <= 10) ||
        (filters.max_participants === 'large' && activity.max_participants > 10);
      
      // 时间过滤
      let dateMatch = true;
      if (filters.date_range !== 'all' && activity.dates && activity.dates.length > 0) {
        const activityDate = new Date(activity.dates[0]);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today to start of day

        switch (filters.date_range) {
          case 'today':
            dateMatch = activityDate.toDateString() === today.toDateString();
            break;
          case 'week':
            const weekFromNow = new Date(today);
            weekFromNow.setDate(today.getDate() + 7);
            dateMatch = activityDate >= today && activityDate <= weekFromNow;
            break;
          case 'month':
            const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, 1); // First day of next month
            dateMatch = activityDate >= today && activityDate < monthFromNow; // activityDate < monthFromNow to include all days in current month
            break;
        }
      }

      return typeMatch && searchMatch && activityTypeMatch && categoryMatch && 
             cityMatch && tagsMatch && costMatch && participantMatch && dateMatch;
    });
  };

  const filteredActivities = getFilteredActivities();

  return (
    <div className="p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold gradient-text">她聚</h1>
        <div className="flex gap-2">
            <Link to={createPageUrl("Notifications")}>
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
            </Link>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-pink-400 to-purple-400 text-white p-4 rounded-2xl mb-4 text-center">
        <h2 className="font-bold text-lg">找到你的"远方的姐妹"</h2>
        <p className="text-xs">探索、分享，与志同道合的她同行</p>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜索活动、地点、标签..."
            className="pl-9 rounded-full bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          className="rounded-full bg-white"
          onClick={() => setShowFilter(true)} // Toggle filter modal
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Categories */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => {setActiveType('旅游出行'); setFilters(prev => ({...prev, activity_type: 'all'}))}} // Reset activity_type filter when main category changes
          className={`flex-1 rounded-full transition-all text-base h-12 ${
            activeType === '旅游出行' ?
            'bg-pink-500 text-white shadow-lg' :
            'bg-white text-gray-700 hover:bg-pink-50'
          }`}
        >
          旅游出行
        </Button>
        <Button
          onClick={() => {setActiveType('生活娱乐'); setFilters(prev => ({...prev, activity_type: 'all'}))}} // Reset activity_type filter when main category changes
          className={`flex-1 rounded-full transition-all text-base h-12 ${
            activeType === '生活娱乐' ?
            'bg-purple-500 text-white shadow-lg' :
            'bg-white text-gray-700 hover:bg-purple-50'
          }`}
        >
          生活娱乐
        </Button>
      </div>

      {/* Activities Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-4 animate-pulse">
              <div className="w-full h-40 bg-pink-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-pink-200 rounded mb-2"></div>
              <div className="h-3 bg-pink-100 rounded mb-2"></div>
              <div className="h-3 bg-pink-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredActivities.length > 0 ? (
              filteredActivities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavorited={userFavorites.some(f => f.item_id === activity.id && f.item_type === 'activity')}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <div className="mb-4">
                  <Users className="w-16 h-16 mx-auto text-pink-200" />
                </div>
                <p className="text-lg font-medium mb-2">没有找到符合条件的活动</p>
                <p className="text-sm">试试调整筛选条件或搜索关键词</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Filter Modal */}
      <ActivityFilter
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onApplyFilter={handleFilterChange}
        currentFilters={filters}
      />
    </div>
  );
}
