
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { X, Filter, Calendar, MapPin, Tag, Users } from 'lucide-react';

export default function ActivityFilter({ isOpen, onClose, onApplyFilter, currentFilters }) {
    const [filters, setFilters] = useState({
        activity_type: currentFilters.activity_type || 'all',
        category: currentFilters.category || 'all',
        city: currentFilters.city || '',
        tags: currentFilters.tags || [],
        cost_type: currentFilters.cost_type || 'all',
        date_range: currentFilters.date_range || 'all',
        max_participants: currentFilters.max_participants || 'all'
    });

    const [currentTag, setCurrentTag] = useState('');

    const popularTags = ['摄影', '美食', '健身', '艺术', '自然风光', '购物', '咖啡', '电影', '音乐', '读书'];
    const popularCities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '西安', '南京', '武汉', '重庆'];

    // 根据活动类型获取对应的分类选项
    const getCategoryOptions = () => {
        if (filters.activity_type === '旅游出行') {
            return [
                { value: 'all', label: '全部分类' },
                { value: '旅游', label: '旅游' }
            ];
        } else if (filters.activity_type === '生活娱乐') {
            return [
                { value: 'all', label: '全部分类' },
                { value: '拍照/探店', label: '拍照/探店' },
                { value: '爱好活动', label: '爱好活动' },
                { value: '其它生活互助', label: '其它生活互助' }
            ];
        } else {
            // activity_type === 'all' 时显示所有分类
            return [
                { value: 'all', label: '全部分类' },
                { value: '旅游', label: '旅游' },
                { value: '拍照/探店', label: '拍照/探店' },
                { value: '爱好活动', label: '爱好活动' },
                { value: '其它生活互助', label: '其它生活互助' }
            ];
        }
    };

    // 当活动类型改变时，重置分类选择
    const handleActivityTypeChange = (type) => {
        setFilters(prev => ({
            ...prev,
            activity_type: type,
            category: 'all' // 重置分类
        }));
    };

    const handleAddTag = (tag) => {
        if (!filters.tags.includes(tag) && filters.tags.length < 3) {
            setFilters(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
        }
        setCurrentTag('');
    };

    const handleRemoveTag = (tagToRemove) => {
        setFilters(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleClearAll = () => {
        setFilters({
            activity_type: 'all',
            category: 'all',
            city: '',
            tags: [],
            cost_type: 'all',
            date_range: 'all',
            max_participants: 'all'
        });
    };

    const handleApply = () => {
        onApplyFilter(filters);
        onClose();
    };

    if (!isOpen) return null;

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
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
                >
                    <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm">
                        <CardHeader className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl gradient-text flex items-center gap-2">
                                    <Filter className="w-6 h-6 text-pink-500" />
                                    筛选活动
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-6 space-y-6">
                            {/* 活动类型 */}
                            <div>
                                <Label className="text-sm font-semibold text-gray-700 mb-3 block">活动类型</Label>
                                <div className="grid grid-cols-1 gap-2">
                                    {['all', '旅游出行', '生活娱乐'].map(type => (
                                        <Button
                                            key={type}
                                            variant={filters.activity_type === type ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleActivityTypeChange(type)}
                                            className={filters.activity_type === type ? 
                                                "bg-pink-500 hover:bg-pink-600" : 
                                                "border-pink-200 hover:bg-pink-50"}
                                        >
                                            {type === 'all' ? '全部类型' : type}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* 活动分类 - 根据活动类型动态显示 */}
                            <div>
                                <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                                    活动分类
                                    {filters.activity_type !== 'all' && (
                                        <span className="text-xs text-gray-500 ml-1">
                                            ({filters.activity_type === '旅游出行' ? '旅游出行' : '生活娱乐'}下的分类)
                                        </span>
                                    )}
                                </Label>
                                <Select value={filters.category} onValueChange={value => setFilters(prev => ({...prev, category: value}))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择分类" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getCategoryOptions().map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 城市筛选 */}
                            <div>
                                <Label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    城市地点
                                </Label>
                                <div className="space-y-3">
                                    <Input
                                        value={filters.city}
                                        onChange={(e) => setFilters(prev => ({...prev, city: e.target.value}))}
                                        placeholder="输入城市名称"
                                        className="border-pink-200 focus:border-pink-400"
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {popularCities.map(city => (
                                            <Button
                                                key={city}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFilters(prev => ({...prev, city: city}))}
                                                className="text-xs border-pink-200 hover:bg-pink-50"
                                            >
                                                {city}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 标签筛选 */}
                            <div>
                                <Label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-1">
                                    <Tag className="w-4 h-4" />
                                    兴趣标签 (最多3个)
                                </Label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={currentTag}
                                            onChange={(e) => setCurrentTag(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddTag(currentTag);
                                                }
                                            }}
                                            placeholder="输入标签或选择热门标签"
                                            className="flex-1 border-pink-200 focus:border-pink-400"
                                        />
                                        <Button 
                                            onClick={() => handleAddTag(currentTag)} 
                                            disabled={filters.tags.length >= 3 || !currentTag.trim()}
                                            size="sm"
                                            className="bg-pink-500 hover:bg-pink-600"
                                        >
                                            添加
                                        </Button>
                                    </div>
                                    
                                    {/* 已选择的标签 */}
                                    {filters.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {filters.tags.map(tag => (
                                                <Badge key={tag} variant="default" className="bg-pink-500 text-white">
                                                    {tag}
                                                    <button
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="ml-1 hover:text-pink-200"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* 热门标签 */}
                                    <div className="flex flex-wrap gap-2">
                                        {popularTags.filter(tag => !filters.tags.includes(tag)).map(tag => (
                                            <Button
                                                key={tag}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAddTag(tag)}
                                                disabled={filters.tags.length >= 3}
                                                className="text-xs border-pink-200 hover:bg-pink-50"
                                            >
                                                #{tag}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 费用类型 */}
                            <div>
                                <Label className="text-sm font-semibold text-gray-700 mb-3 block">费用类型</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['all', '免费', 'AA制', '自定义'].map(type => (
                                        <Button
                                            key={type}
                                            variant={filters.cost_type === type ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setFilters(prev => ({...prev, cost_type: type}))}
                                            className={filters.cost_type === type ? 
                                                "bg-pink-500 hover:bg-pink-600" : 
                                                "border-pink-200 hover:bg-pink-50"}
                                        >
                                            {type === 'all' ? '全部' : type}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* 人数规模 */}
                            <div>
                                <Label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    人数规模
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { key: 'all', label: '全部' },
                                        { key: 'small', label: '2-5人' },
                                        { key: 'medium', label: '6-10人' },
                                        { key: 'large', label: '10人以上' }
                                    ].map(option => (
                                        <Button
                                            key={option.key}
                                            variant={filters.max_participants === option.key ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setFilters(prev => ({...prev, max_participants: option.key}))}
                                            className={filters.max_participants === option.key ? 
                                                "bg-pink-500 hover:bg-pink-600" : 
                                                "border-pink-200 hover:bg-pink-50"}
                                        >
                                            {option.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* 时间范围 */}
                            <div>
                                <Label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    时间范围
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { key: 'all', label: '全部时间' },
                                        { key: 'today', label: '今天' },
                                        { key: 'week', label: '本周' },
                                        { key: 'month', label: '本月' }
                                    ].map(option => (
                                        <Button
                                            key={option.key}
                                            variant={filters.date_range === option.key ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setFilters(prev => ({...prev, date_range: option.key}))}
                                            className={filters.date_range === option.key ? 
                                                "bg-pink-500 hover:bg-pink-600" : 
                                                "border-pink-200 hover:bg-pink-50"}
                                        >
                                            {option.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>

                        {/* 底部按钮 */}
                        <div className="p-6 pt-0 flex gap-3">
                            <Button 
                                variant="outline" 
                                className="flex-1" 
                                onClick={handleClearAll}
                            >
                                清空筛选
                            </Button>
                            <Button 
                                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600" 
                                onClick={handleApply}
                            >
                                应用筛选
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
