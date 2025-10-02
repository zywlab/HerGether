import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function ReviewList({ reviews, title }) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-8">
                <Star className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">还没有{title}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
            {reviews.map((review, index) => (
                <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className="border-pink-100 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <img 
                                    src={review.reviewer?.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b6fb8f02?w=150'} 
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-800">
                                            {review.reviewer?.full_name || '匿名用户'}
                                        </h4>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star 
                                                    key={star}
                                                    className={`w-4 h-4 ${
                                                        star <= review.rating 
                                                            ? 'text-yellow-400 fill-yellow-400' 
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                            <span className="text-sm text-gray-600 ml-1">{review.rating}.0</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed mb-2">
                                        {review.content}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {format(new Date(review.created_date), "yyyy年MM月dd日", { locale: zhCN })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}