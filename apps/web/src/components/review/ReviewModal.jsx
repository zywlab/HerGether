
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, X, Send, ThumbsUp, Clock, Users, Heart } from "lucide-react";
import { Review, ActivityRegistration } from "@base44/shared/api";

const quickReviewOptions = {
    to_organizer: [
        { icon: ThumbsUp, text: "组织得很好", rating: 5 },
        { icon: Clock, text: "准时靠谱", rating: 5 },
        { icon: Users, text: "沟通顺畅", rating: 4 },
        { icon: Heart, text: "人很nice", rating: 4 }
    ],
    to_participant: [
        { icon: Clock, text: "准时到达", rating: 5 },
        { icon: ThumbsUp, text: "配合度高", rating: 5 },
        { icon: Users, text: "很好相处", rating: 4 },
        { icon: Heart, text: "很有趣", rating: 4 }
    ]
};

export default function ReviewModal({ 
    isOpen, 
    onClose, 
    revieweeUser,
    activity,
    currentUser,
    reviewType,
    onReviewSubmitted,
    reviewToEdit // New prop for editing
}) {
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);

    const isEditMode = !!reviewToEdit;

    useEffect(() => {
        if (isOpen) { // Only update state when modal becomes open or reviewToEdit changes
            if (isEditMode) {
                setRating(reviewToEdit.rating);
                setContent(reviewToEdit.content);
            } else {
                setRating(0);
                setContent("");
            }
        }
    }, [reviewToEdit, isOpen, isEditMode]); // Added isEditMode to dependency array

    const handleQuickReview = (option) => {
        setRating(option.rating);
        setContent(option.text);
    };

    const handleSubmit = async () => {
        if (!rating) {
            alert("请选择评分");
            return;
        }
        
        setIsSubmitting(true);
        try {
            if (isEditMode) {
                // Handle editing logic
                const historyEntry = {
                    content: reviewToEdit.content,
                    rating: reviewToEdit.rating,
                    edited_at: new Date().toISOString()
                };
                const updatedHistory = [...(reviewToEdit.edit_history || []), historyEntry];

                await Review.update(reviewToEdit.id, {
                    content: content,
                    rating: rating,
                    is_edited: true,
                    edit_history: updatedHistory
                });

            } else {
                // Handle new review creation logic
                await Review.create({
                    reviewer_id: currentUser.id,
                    reviewee_id: revieweeUser.id,
                    activity_id: activity.id,
                    rating: rating,
                    content: content.trim() || "好评",
                    review_type: reviewType
                });
                
                // Update registration status only for new reviews
                if (reviewType === "to_organizer") {
                    const registration = await ActivityRegistration.filter({ user_id: currentUser.id, activity_id: activity.id });
                    if (registration[0]) await ActivityRegistration.update(registration[0].id, { has_reviewed_organizer: true });
                } else {
                    const registration = await ActivityRegistration.filter({ user_id: revieweeUser.id, activity_id: activity.id });
                    if (registration[0]) await ActivityRegistration.update(registration[0].id, { has_been_reviewed: true });
                }
            }
            
            onReviewSubmitted?.();
            onClose();
        } catch (error) {
            console.error("提交评价失败:", error);
            alert("提交评价失败，请稍后再试。");
        }
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    const quickOptions = quickReviewOptions[reviewType] || [];

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
                        <CardHeader className="border-b border-pink-100">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl gradient-text">
                                    {isEditMode ? "编辑评价" : `为${reviewType === 'to_organizer' ? '发起人' : '参与者'}评价`}
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-6 space-y-6">
                            {/* 被评价用户信息 */}
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                                <img 
                                    src={revieweeUser?.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b6fb8f02?w=150'} 
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                                    alt="Reviewee Avatar" // Added alt attribute for accessibility
                                />
                                <div>
                                    <h3 className="font-semibold text-gray-800">{revieweeUser?.full_name}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-1">{activity?.title}</p>
                                </div>
                            </div>

                            {/* 星级评分 */}
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-700 mb-3">点击星星评分</p>
                                <div className="flex justify-center gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            className="transition-all duration-200 hover:scale-110"
                                        >
                                            <Star 
                                                className={`w-8 h-8 ${
                                                    (hoveredStar > 0 ? star <= hoveredStar : star <= rating)
                                                        ? 'text-yellow-400 fill-yellow-400' 
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500">
                                    {rating === 5 ? '非常满意 ⭐️' : 
                                     rating === 4 ? '比较满意 👍' : 
                                     rating === 3 ? '一般 😐' : 
                                     rating === 2 ? '不太满意 😞' : 
                                     rating === 1 ? '很不满意 😠' : '请选择评分'}
                                </p>
                            </div>

                            {/* 快速评价选项 */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-3">快速评价（可选）</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {quickOptions.map((option, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleQuickReview(option)}
                                            className={`flex items-center gap-2 ${
                                                content === option.text ? 'border-pink-400 bg-pink-50' : ''
                                            }`}
                                        >
                                            <option.icon className="w-3 h-3" />
                                            {option.text}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* 详细评价 */}
                            <div>
                                <label htmlFor="review-content" className="block text-sm font-medium mb-2 text-gray-700">
                                    详细评价 (可选)
                                </label>
                                <Textarea
                                    id="review-content" // Added id for accessibility
                                    placeholder="分享你的体验感受..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="min-h-[80px] border-pink-200 focus:border-pink-400"
                                    maxLength={200}
                                />
                                <p className="text-xs text-gray-500 mt-1">{content.length}/200</p>
                            </div>

                            {/* 提交按钮 */}
                            <div className="flex gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={onClose}
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    取消
                                </Button>
                                <Button 
                                    onClick={handleSubmit}
                                    disabled={!rating || isSubmitting}
                                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {isSubmitting ? '提交中...' : (isEditMode ? "更新评价" : "提交评价")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
