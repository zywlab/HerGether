import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { User, Review, ActivityPost } from "@base44/shared/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Star, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import ActivityRating from "../components/review/ActivityRating";
import ReviewListModal from "../components/review/ReviewListModal";
import { Badge } from "@/components/ui/badge";

const ActivityCard = ({ activity }) => (
    <Link to={createPageUrl(`ActivityDetail?id=${activity.id}`)}>
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <h4 className="font-semibold text-gray-800 line-clamp-2">{activity.title}</h4>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Badge variant="outline">{activity.city}</Badge>
                    <Badge variant="outline">{activity.category}</Badge>
                </div>
            </CardContent>
        </Card>
    </Link>
);

export default function ProfileView() {
    const location = useLocation();
    const [viewedUser, setViewedUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [activities, setActivities] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const userId = searchParams.get("userId");
        if (userId) {
            loadData(userId);
        }
    }, [location.search]);

    const loadData = async (userId) => {
        setIsLoading(true);
        try {
            const [userData, reviewsData, activitiesData, currentUserData] = await Promise.all([
                User.get(userId),
                Review.filter({ reviewee_id: userId }),
                ActivityPost.filter({ created_by: (await User.get(userId)).email, is_public: true }),
                User.me().catch(() => null)
            ]);
            
            setViewedUser(userData);
            setReviews(reviewsData);
            setActivities(activitiesData);
            setCurrentUser(currentUserData);
        } catch (error) {
            console.error("加载用户资料失败:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
            </div>
        );
    }
    
    if (!viewedUser) {
        return (
             <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
                 <p className="text-lg text-gray-600 mb-4">无法找到该用户。</p>
                 <Link to={createPageUrl("ActivityPlaza")}>
                    <Button variant="outline">返回广场</Button>
                 </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-between p-4 border-b">
                <Link to={-1}>
                    <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                </Link>
                <h2 className="font-bold text-lg">{viewedUser.full_name}的主页</h2>
                <div className="w-9"></div> {/* Placeholder for alignment */}
            </div>

            <div className="p-4 space-y-6 pb-24">
                {/* User Info */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-start gap-4">
                        <img 
                            src={viewedUser.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                            alt="avatar" 
                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xl font-bold">{viewedUser.full_name}</h2>
                                {viewedUser.verification_status === 'verified' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                            </div>
                            <ActivityRating 
                                reviews={reviews} 
                                onClick={() => setShowReviewModal(true)}
                            />
                            <p className="text-sm text-gray-500 mt-1">ID: {viewedUser.custom_user_id}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">{viewedUser.bio || '这位姐妹很神秘，什么也没留下~'}</p>
                </motion.div>

                {/* Reviews Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold">收到的评价 ({reviews.length})</h3>
                                <Button variant="link" onClick={() => setShowReviewModal(true)}>查看全部</Button>
                            </div>
                            {reviews.length > 0 && (
                                <div className="mt-2 text-sm text-gray-700 border-t pt-3">
                                    <div className="flex items-start gap-2">
                                        <Star className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0"/>
                                        <p className="line-clamp-2">"{reviews[0].content}"</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Activities Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h3 className="font-semibold text-lg mb-3">Ta发布的活动 ({activities.length})</h3>
                    <div className="space-y-3">
                        {activities.length > 0 ? activities.map(activity => (
                            <ActivityCard key={activity.id} activity={activity} />
                        )) : (
                            <p className="text-sm text-gray-500 text-center py-4">Ta还没有发布过公开活动。</p>
                        )}
                    </div>
                </motion.div>
            </div>
            
            {/* Bottom Action Bar */}
             <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
                <div className="max-w-md mx-auto">
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600" size="lg">
                        <MessageSquare className="w-4 h-4 mr-2"/>
                        联系Ta (功能开发中)
                    </Button>
                </div>
            </div>

            {/* Review List Modal */}
            <ReviewListModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                reviews={reviews}
                userName={viewedUser.full_name}
                currentUser={currentUser}
            />
        </div>
    );
}