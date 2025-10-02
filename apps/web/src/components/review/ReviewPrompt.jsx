import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Clock, Users } from "lucide-react";
import { ActivityRegistration, ActivityPost, Review, User } from "@base44/shared/api";
import ReviewModal from "./ReviewModal";

export default function ReviewPrompt({ user }) {
    const [pendingReviews, setPendingReviews] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [currentReviewTarget, setCurrentReviewTarget] = useState(null);
    const [currentActivity, setCurrentActivity] = useState(null);
    const [reviewType, setReviewType] = useState("");

    useEffect(() => {
        if (user) {
            loadPendingReviews();
        }
    }, [user]);

    const loadPendingReviews = async () => {
        try {
            // 获取已参加但未评价的活动
            const registrations = await ActivityRegistration.filter({
                user_id: user.id,
                status: "已参加",
                has_reviewed_organizer: false
            });

            // 获取我发起的已结束但未评价参与者的活动
            const myActivities = await ActivityPost.filter({
                created_by: user.email
            });

            const pendingList = [];

            // 作为参与者需要评价发起人
            for (const reg of registrations) {
                const activity = myActivities.find(a => a.id === reg.activity_id);
                if (activity) {
                    const organizer = await User.filter({ email: activity.created_by });
                    pendingList.push({
                        type: "to_organizer",
                        activity: activity,
                        targetUser: organizer[0],
                        registration: reg
                    });
                }
            }

            // 作为发起人需要评价参与者
            for (const activity of myActivities) {
                const participantRegs = await ActivityRegistration.filter({
                    activity_id: activity.id,
                    status: "已参加"
                });

                for (const reg of participantRegs) {
                    if (!reg.has_been_reviewed && reg.user_id !== user.id) {
                        const participant = await User.get(reg.user_id);
                        pendingList.push({
                            type: "to_participant",
                            activity: activity,
                            targetUser: participant,
                            registration: reg
                        });
                    }
                }
            }

            setPendingReviews(pendingList);
        } catch (error) {
            console.error("加载待评价列表失败:", error);
        }
    };

    const handleStartReview = (reviewItem) => {
        setCurrentReviewTarget(reviewItem.targetUser);
        setCurrentActivity(reviewItem.activity);
        setReviewType(reviewItem.type);
        setShowReviewModal(true);
    };

    const handleReviewSubmitted = async () => {
        await loadPendingReviews();
    };

    if (pendingReviews.length === 0) {
        return null;
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-amber-800">
                            <Star className="w-5 h-5" />
                            待评价活动
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-amber-700 mb-4">
                            像Uber一样，活动结束后请为对方评价，建立互信社区！
                        </p>
                        
                        {pendingReviews.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white/70 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={item.targetUser?.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b6fb8f02?w=150'} 
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-sm text-gray-800">
                                            {item.type === "to_organizer" ? "评价发起人" : "评价参与者"}
                                        </p>
                                        <p className="text-xs text-gray-600 line-clamp-1">
                                            {item.activity.title}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => handleStartReview(item)}
                                    className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white"
                                >
                                    <Star className="w-3 h-3 mr-1" />
                                    评价
                                </Button>
                            </div>
                        ))}

                        {pendingReviews.length > 3 && (
                            <p className="text-xs text-amber-600 text-center">
                                还有 {pendingReviews.length - 3} 个活动等待评价
                            </p>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            <ReviewModal 
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                revieweeUser={currentReviewTarget}
                activity={currentActivity}
                currentUser={user}
                reviewType={reviewType}
                onReviewSubmitted={handleReviewSubmitted}
            />
        </>
    );
}