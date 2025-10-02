import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Smile } from "lucide-react";
import { ReviewReply } from "@base44/shared/api";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_EMOJIS = ["👍", "❤️", "😊", "🙏", "👏", "😄", "💪", "✨"];

export default function ReviewReplyComponent({ 
    review, 
    currentUser, 
    replies = [], 
    onReplyAdded 
}) {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitReply = async () => {
        if (!replyContent.trim()) return;
        
        setIsSubmitting(true);
        try {
            await ReviewReply.create({
                review_id: review.id,
                replier_id: currentUser.id,
                content: replyContent.trim(),
                type: isEmojiOnly(replyContent) ? "emoji" : "text"
            });
            
            setReplyContent("");
            setShowReplyInput(false);
            onReplyAdded?.();
        } catch (error) {
            console.error("回复失败:", error);
        }
        setIsSubmitting(false);
    };

    const handleEmojiReply = async (emoji) => {
        setIsSubmitting(true);
        try {
            await ReviewReply.create({
                review_id: review.id,
                replier_id: currentUser.id,
                content: emoji,
                type: "emoji"
            });
            
            onReplyAdded?.();
        } catch (error) {
            console.error("回复失败:", error);
        }
        setIsSubmitting(false);
    };

    const isEmojiOnly = (text) => {
        return /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u.test(text);
    };

    // 检查当前用户是否是被评价人（可以回复）
    const canReply = currentUser && review.reviewee_id === currentUser.id;

    return (
        <div className="mt-3 space-y-2">
            {/* 显示现有回复 */}
            <AnimatePresence>
                {replies.map((reply, index) => (
                    <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="ml-8 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-100">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-xs font-medium">主</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className={`${reply.type === 'emoji' ? 'text-lg' : 'text-sm text-gray-700'}`}>
                                            {reply.content}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* 回复操作区域 */}
            {canReply && (
                <div className="ml-8 space-y-2">
                    {!showReplyInput ? (
                        <div className="flex items-center gap-2">
                            {/* 快速emoji回复 */}
                            <div className="flex items-center gap-1">
                                {QUICK_EMOJIS.map((emoji) => (
                                    <Button
                                        key={emoji}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEmojiReply(emoji)}
                                        disabled={isSubmitting}
                                        className="text-lg p-1 h-8 w-8 hover:bg-pink-50"
                                    >
                                        {emoji}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowReplyInput(true)}
                                className="text-xs border-pink-200 text-pink-600 hover:bg-pink-50"
                            >
                                <Smile className="w-3 h-3 mr-1" />
                                回复
                            </Button>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2"
                        >
                            <Input
                                placeholder="写个回复吧..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="flex-1 text-sm border-pink-200 focus:border-pink-400"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSubmitReply();
                                    }
                                }}
                            />
                            <Button
                                size="sm"
                                onClick={handleSubmitReply}
                                disabled={!replyContent.trim() || isSubmitting}
                                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                            >
                                <Send className="w-3 h-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowReplyInput(false);
                                    setReplyContent("");
                                }}
                                className="text-gray-500"
                            >
                                取消
                            </Button>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}