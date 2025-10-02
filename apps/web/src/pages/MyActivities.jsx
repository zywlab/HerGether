import React, { useState, useEffect } from "react";
import { User, ActivityRegistration, Favorite, ActivityPost } from "@base44/shared/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Heart, Star, Users, MapPin, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function MyActivities() {
  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [myFavorites, setMyFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // 获取我发布的活动
      const posts = await ActivityPost.filter({ created_by: userData.email });
      setMyPosts(posts);

      // 获取我报名的活动
      const registrations = await ActivityRegistration.filter({ user_id: userData.id });
      setMyRegistrations(registrations);

      // 获取我的收藏
      const favorites = await Favorite.filter({ user_id: userData.id });
      setMyFavorites(favorites);
    } catch (error) {
      console.error("加载数据失败:", error);
    }
    setIsLoading(false);
  };

  const handleDeletePost = async (postId) => {
    if (confirm("确定要删除这个活动吗？")) {
      try {
        await ActivityPost.delete(postId);
        loadData();
      } catch (error) {
        console.error("删除失败:", error);
      }
    }
  };

  const handleCancelRegistration = async (registrationId) => {
    if (confirm("确定要取消报名吗？")) {
      try {
        await ActivityRegistration.update(registrationId, { status: "已取消" });
        loadData();
      } catch (error) {
        console.error("取消报名失败:", error);
      }
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await Favorite.delete(favoriteId);
      loadData();
    } catch (error) {
      console.error("移除收藏失败:", error);
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">我的活动</h1>
          <p className="text-gray-600">管理你的找搭子、报名记录和收藏</p>
        </motion.div>

        {/* User Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-pink-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">{myPosts.length}</div>
              <div className="text-sm text-gray-600">发布的找搭子</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{myRegistrations.length}</div>
              <div className="text-sm text-gray-600">报名的活动</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-rose-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-rose-600">{myFavorites.length}</div>
              <div className="text-sm text-gray-600">收藏数量</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-yellow-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">Lv.{user?.level || 1}</div>
              <div className="text-sm text-gray-600">用户等级</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="published" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-sm">
              <TabsTrigger value="published" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700">
                我发布的
              </TabsTrigger>
              <TabsTrigger value="registered" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                已报名的
              </TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700">
                我的收藏
              </TabsTrigger>
            </TabsList>

            {/* 我发布的 */}
            <TabsContent value="published" className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-pink-100 text-pink-700">
                            {post.category}
                          </Badge>
                          <Badge variant={post.status === "开放" ? "default" : "secondary"}>
                            {post.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{post.content}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <MapPin className="w-4 h-4" />
                          <span>{post.city}</span>
                          <Calendar className="w-4 h-4 ml-2" />
                          <span>{format(new Date(post.date), "MM-dd", { locale: zhCN })}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="w-4 h-4 mr-1" />
                            编辑
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {myPosts.length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <Users className="w-16 h-16 mx-auto text-pink-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">还没有发布找搭子</h3>
                    <p className="text-gray-500">快去发布你的第一个找搭子吧！</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 已报名的 */}
            <TabsContent value="registered" className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRegistrations.map((registration, index) => (
                  <motion.div
                    key={registration.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-purple-100 text-purple-700">
                            {registration.activity_type === "partner" ? "找搭子" : 
                             registration.activity_type === "organizer" ? "精选活动" : "全女服务"}
                          </Badge>
                          <Badge 
                            variant={registration.status === "已报名" ? "default" : "secondary"}
                            className={registration.status === "已取消" ? "bg-red-100 text-red-700" : ""}
                          >
                            {registration.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">活动ID: {registration.activity_id}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4">
                          报名时间: {format(new Date(registration.created_date), "yyyy-MM-dd HH:mm")}
                        </p>
                        {registration.message && (
                          <p className="text-gray-600 text-sm mb-4">留言: {registration.message}</p>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            查看详情
                          </Button>
                          {registration.status === "已报名" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleCancelRegistration(registration.id)}
                            >
                              取消报名
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {myRegistrations.length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <Calendar className="w-16 h-16 mx-auto text-purple-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">还没有报名活动</h3>
                    <p className="text-gray-500">快去找找感兴趣的活动吧！</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 我的收藏 */}
            <TabsContent value="favorites" className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myFavorites.map((favorite, index) => (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-rose-100 text-rose-700">
                            {favorite.item_type === "partner" ? "找搭子" : 
                             favorite.item_type === "activity" ? "精选活动" : "全女服务"}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveFavorite(favorite.id)}
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </Button>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{favorite.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4">
                          收藏时间: {format(new Date(favorite.created_date), "yyyy-MM-dd")}
                        </p>
                        <Button size="sm" variant="outline" className="w-full">
                          查看详情
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {myFavorites.length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <Heart className="w-16 h-16 mx-auto text-rose-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">还没有收藏</h3>
                    <p className="text-gray-500">收藏你感兴趣的活动和服务吧！</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}