import React, { useState, useEffect } from 'react';
import { ActivityComment } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send } from 'lucide-react';

const Comment = ({ comment, onReply }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3"
    >
        <img src={comment.user?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg'} alt="avatar" className="w-8 h-8 rounded-full object-cover"/>
        <div className="flex-1 bg-gray-100 p-3 rounded-lg">
            <div className="flex justify-between items-center">
                <p className="font-semibold text-sm">{comment.user?.full_name || '匿名用户'}</p>
                <p className="text-xs text-gray-500">{new Date(comment.created_date).toLocaleDateString()}</p>
            </div>
            <p className="text-sm mt-1">{comment.content}</p>
        </div>
    </motion.div>
);

export default function CommentSection({ activityId, currentUser }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadComments();
    }, [activityId]);

    const loadComments = async () => {
        const commentData = await ActivityComment.filter({ activity_id: activityId }, "-created_date");
        const commentsWithUsers = await Promise.all(commentData.map(async c => {
            const user = await User.get(c.user_id).catch(() => null);
            return { ...c, user };
        }));
        setComments(commentsWithUsers);
    };

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            await ActivityComment.create({
                activity_id: activityId,
                user_id: currentUser.id,
                content: newComment,
            });
            setNewComment("");
            loadComments();
        } catch (error) {
            console.error("Failed to post comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const canComment = currentUser?.verification_status === 'verified';

    return (
        <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-4">留言板 ({comments.length})</h3>
            <div className="space-y-4 mb-6">
                <AnimatePresence>
                    {comments.map(comment => <Comment key={comment.id} comment={comment} />)}
                </AnimatePresence>
            </div>
            {currentUser ? (
                canComment ? (
                    <div className="flex gap-2">
                        <Textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="发布你的提问或留言..."
                            className="flex-1"
                            disabled={isSubmitting}
                        />
                        <Button onClick={handleCommentSubmit} disabled={isSubmitting}>
                            <Send className="w-4 h-4"/>
                        </Button>
                    </div>
                ) : (
                    <div className="text-center p-4 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-600">请先完成身份认证后，再参与留言讨论。</p>
                    </div>
                )
            ) : (
                 <div className="text-center p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">请登录后参与留言讨论。</p>
                </div>
            )}
        </div>
    )
}