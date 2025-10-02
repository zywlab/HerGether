
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, X, Trash2, Edit, History } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ReviewReply, Review } from "@base44/shared/api";
import ReviewReplyComponent from "./ReviewReply";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ReviewModal from "./ReviewModal";

export default function ReviewListModal({ isOpen, onClose, reviews: allReviews, userName, currentUser }) {
    const [reviewReplies, setReviewReplies] = useState({});
    const [editingReview, setEditingReview] = useState(null);
    const [reviews, setReviews] = useState(allReviews);

    useEffect(() => {
        setReviews(allReviews); // Sync internal state with prop
        if (isOpen && allReviews.length > 0) {
            loadReplies(allReviews);
        } else if (isOpen && allReviews.length === 0) {
            // If there are no reviews, clear replies
            setReviewReplies({});
        }
    }, [isOpen, allReviews]);

    const loadReplies = async (currentReviews) => {
        try {
            const repliesMap = {};
            for (const review of currentReviews) {
                const replies = await ReviewReply.filter({ review_id: review.id });
                repliesMap[review.id] = replies;
            }
            setReviewReplies(repliesMap);
        } catch (error) {
            console.error("加载回复失败:", error);
        }
    };

    const handleHideReview = async (reviewId) => {
        if(window.confirm("确定要隐藏这条评价吗？隐藏后您将无法恢复，但评分仍计入总分。")) {
            try {
                await Review.update(reviewId, { is_hidden_by_reviewee: true });
                setReviews(prev => prev.map(r => 
                    r.id === reviewId ? { ...r, is_hidden_by_reviewee: true } : r
                ));
            } catch (error) {
                console.error("隐藏评价失败:", error);
                alert("隐藏评价失败，请稍后再试。");
            }
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if(window.confirm("确定要永久删除您的评价吗？此操作不可逆。")) {
            try {
                await Review.delete(reviewId);
                // This needs to trigger a full refresh of data on the profile page
                onClose(); 
            } catch (error) {
                console.error("删除评价失败:", error);
                alert("删除评价失败，请稍后再试。");
            }
        }
    };

    if (!isOpen) return null;

    // Average rating is calculated on ALL reviews, including hidden ones
    const averageRating = allReviews.length > 0 
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length 
        : 0;
        
    // Visible reviews are those not hidden by the reviewee (for display in the list)
    const visibleReviews = reviews.filter(r => !r.is_hidden_by_reviewee);

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
                    className="w-full max-w-lg max-h-[80vh] overflow-hidden"
                >
                    <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm">
                        <CardHeader className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl gradient-text mb-2">
                                        {userName}的评价
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star 
                                                    key={star}
                                                    className={`w-5 h-5 ${
                                                        star <= Math.round(averageRating) 
                                                            ? 'text-yellow-400 fill-yellow-400' 
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-lg font-bold text-gray-800">
                                            {averageRating.toFixed(2)}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            ({allReviews.length}条评价)
                                        </span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-0 max-h-[60vh] overflow-y-auto">
                            {visibleReviews.length > 0 ? (
                                <div className="space-y-0">
                                    {visibleReviews.map((review, index) => (
                                        <motion.div
                                            key={review.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start gap-3">
                                                    {/* 匿名头像 */}
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white font-medium text-sm">匿</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="font-medium text-gray-800">
                                                                匿名用户
                                                            </h4>
                                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star 
                                                                        key={star}
                                                                        className={`w-3 h-3 ${
                                                                            star <= review.rating 
                                                                                ? 'text-yellow-400 fill-yellow-400' 
                                                                                : 'text-gray-300'
                                                                        }`}
                                                                    />
                                                                ))}
                                                                <span className="text-xs text-gray-600 ml-1">
                                                                    {review.rating}.0
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-700 text-sm leading-relaxed mb-2">
                                                            {review.content}
                                                        </p>
                                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                                            <span>{format(new Date(review.created_date), "yyyy年MM月dd日", { locale: zhCN })}</span>
                                                            {review.is_edited && review.edit_history && review.edit_history.length > 0 && (
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <Button variant="link" size="sm" className="text-xs p-0 h-auto flex items-center gap-1 text-gray-500 hover:text-gray-700">
                                                                            <History className="w-3 h-3"/>已编辑
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-64">
                                                                        <h4 className="font-bold text-sm mb-2">编辑历史</h4>
                                                                        <ul className="space-y-2 text-xs">
                                                                            {review.edit_history.map((h, i) => (
                                                                                <li key={i} className="pb-1 border-b last:border-b-0">
                                                                                    {h.content && <p className="mb-1">内容: &quot;{h.content}&quot;</p>}
                                                                                    {h.rating && <p className="mb-1">评分: {h.rating}星</p>}
                                                                                    <p className="text-gray-400">{format(new Date(h.edited_at), 'Pp', {locale: zhCN})}</p>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-end gap-2">
                                                            {currentUser?.id === review.reviewer_id && (
                                                                <>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-gray-700" onClick={() => setEditingReview(review)}>
                                                                        <Edit className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => handleDeleteReview(review.id)}>
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {currentUser?.id === review.reviewee_id && (
                                                                <Button variant="outline" size="sm" className="text-xs h-7 px-2 py-0.5 text-gray-600 hover:bg-gray-100" onClick={() => handleHideReview(review.id)}>
                                                                    隐藏
                                                                </Button>
                                                            )}
                                                        </div>
                                                        
                                                        {/* 回复组件 */}
                                                        <ReviewReplyComponent
                                                            review={review}
                                                            currentUser={currentUser}
                                                            replies={reviewReplies[review.id] || []}
                                                            onReplyAdded={() => loadReplies(reviews)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Star className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">还没有收到评价</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
             {editingReview && (
                <ReviewModal
                    isOpen={!!editingReview}
                    onClose={() => setEditingReview(null)}
                    revieweeUser={{id: editingReview.reviewee_id}}
                    activity={{id: editingReview.activity_id}}
                    currentUser={currentUser}
                    reviewType={editingReview.review_type}
                    onReviewSubmitted={() => { setEditingReview(null); onClose(); }} // Close edit modal, then close list modal to trigger refresh
                    reviewToEdit={editingReview}
                />
            )}
        </AnimatePresence>
    );
}
