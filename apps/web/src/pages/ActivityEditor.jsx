
import React, { useState, useEffect } from 'react';
import { ActivityPost } from '@base44/shared/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ImageUploader from '../components/common/ImageUploader';
import { motion, AnimatePresence } from "framer-motion";

export default function ActivityEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    activity_type: "旅游出行",
    project_type: "找活动搭子",
    category: "旅游",
    city: "",
    dates: [""],
    is_long_term: false,
    recurrence_rule: null, // new field for recurrence
    tags: [],
    cost_type: "免费",
    cost_description: "",
    max_participants: 2,
    contact_info: "",
    is_public: true,
    allow_anonymous_registration: false,
    max_guests_per_participant: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityId, setActivityId] = useState(null);
  const [currentTag, setCurrentTag] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    if (id) {
      setActivityId(id);
      loadActivity(id);
    }
  }, [location.search]);

  const loadActivity = async (id) => {
    const activity = await ActivityPost.get(id);
    setFormData({
        ...activity,
        recurrence_rule: activity.recurrence_rule || null, // load recurrence rule
        tags: activity.tags || [],
        allow_anonymous_registration: activity.allow_anonymous_registration || false,
        max_guests_per_participant: activity.max_guests_per_participant || 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let result;
      if (activityId) {
        result = await ActivityPost.update(activityId, formData);
      } else {
        result = await ActivityPost.create(formData);
      }
      navigate(createPageUrl(`ActivityDetail?id=${result.id}`));
    } catch (error) {
      console.error("Failed to save activity", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleRecurrenceChange = (field, value) => {
    setFormData(prev => {
      let newRule = { ...prev.recurrence_rule, [field]: value };
      // When changing type, reset value to a sensible default
      if (field === 'type') {
        newRule.value = 1;
      }
      return { ...prev, recurrence_rule: newRule };
    });
  };

  const handleLongTermToggle = (isLongTerm) => {
    handleChange('is_long_term', isLongTerm);
    if (isLongTerm) {
      // Initialize with a default rule if enabling long-term
      handleChange('recurrence_rule', { type: 'weekly', value: 1 });
    } else {
      // Clear recurrence rule if disabling long-term
      handleChange('recurrence_rule', null);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim()) && formData.tags.length < 5) {
        handleChange('tags', [...formData.tags, currentTag.trim()]);
        setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
      handleChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleClose = () => {
    if (activityId) {
        // When editing, go back to the previous page (the Activity Detail page).
        navigate(-1);
    } else {
        // When creating, explicitly go to the main plaza for a consistent experience.
        navigate(createPageUrl('ActivityPlaza'));
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{activityId ? "编辑活动" : "发布活动"}</h1>
        <button onClick={handleClose}><X /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label>活动主图 *</Label>
          <ImageUploader 
            value={formData.image_url}
            onChange={(url) => handleChange('image_url', url)}
            placeholder="上传活动封面图片"
          />
        </div>
        
        <div>
          <Label>标题 *</Label>
          <Input value={formData.title} onChange={e => handleChange('title', e.target.value)} required/>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>活动类型</Label>
            <Select value={formData.activity_type} onValueChange={value => handleChange('activity_type', value)}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="旅游出行">旅游出行</SelectItem>
                <SelectItem value="生活娱乐">生活娱乐</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>项目类型</Label>
            <Select value={formData.project_type} onValueChange={value => handleChange('project_type', value)}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="找活动搭子">找活动搭子</SelectItem>
                <SelectItem value="找互助服务">找互助服务</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>活动分类</Label>
          <Select value={formData.category} onValueChange={value => handleChange('category', value)}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="旅游">旅游</SelectItem>
              <SelectItem value="拍照/探店">拍照/探店</SelectItem>
              <SelectItem value="爱好活动">爱好活动</SelectItem>
              <SelectItem value="其它生活互助">其它生活互助</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>城市 *</Label>
          <Input value={formData.city} onChange={e => handleChange('city', e.target.value)} required/>
        </div>
        
        <div>
          <Label>活动日期 *</Label>
          <Input 
            type="date" 
            value={formData.dates[0]} 
            onChange={e => handleChange('dates', [e.target.value])} 
            required={!formData.is_long_term} // Conditional required
            disabled={formData.is_long_term} // Conditional disabled
          />
          <div className="flex items-center space-x-2 mt-2">
            <Switch 
              id="is_long_term" 
              checked={formData.is_long_term} 
              onCheckedChange={handleLongTermToggle} // Use new handler
            />
            <Label htmlFor="is_long_term" className="text-sm">设为长期活动</Label> {/* Updated label text */}
          </div>
        </div>

        <AnimatePresence>
        {formData.is_long_term && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 p-4 bg-pink-50 rounded-lg border border-pink-100 overflow-hidden" // Added overflow-hidden to help with height animation
          >
            <h3 className="text-md font-semibold text-gray-800">设置重复规则</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>重复类型</Label>
                <Select value={formData.recurrence_rule?.type} onValueChange={v => handleRecurrenceChange('type', v)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">每周</SelectItem>
                    <SelectItem value="monthly">每月</SelectItem>
                    <SelectItem value="daily_interval">每隔</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
              {formData.recurrence_rule?.type === 'weekly' && (
                <>
                  <Label>选择星期</Label>
                  <Select value={String(formData.recurrence_rule.value)} onValueChange={v => handleRecurrenceChange('value', Number(v))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">周一</SelectItem>
                      <SelectItem value="2">周二</SelectItem>
                      <SelectItem value="3">周三</SelectItem>
                      <SelectItem value="4">周四</SelectItem>
                      <SelectItem value="5">周五</SelectItem>
                      <SelectItem value="6">周六</SelectItem>
                      <SelectItem value="7">周日</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
              {formData.recurrence_rule?.type === 'monthly' && (
                <>
                  <Label>选择日期 (日)</Label>
                  <Input 
                    type="number"
                    min="1"
                    max="31"
                    value={formData.recurrence_rule.value}
                    onChange={e => handleRecurrenceChange('value', Number(e.target.value))}
                  />
                </>
              )}
              {formData.recurrence_rule?.type === 'daily_interval' && (
                <>
                  <Label>间隔天数</Label>
                  <div className="flex items-center gap-2"> {/* Wrapper for Input and suffix */}
                    <Input 
                      type="number"
                      min="1"
                      value={formData.recurrence_rule.value}
                      onChange={e => handleRecurrenceChange('value', Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-gray-500 text-sm">天</span>
                  </div>
                </>
              )}
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
        
        <div>
          <Label>活动描述 *</Label>
          <Textarea 
            value={formData.description} 
            onChange={e => handleChange('description', e.target.value)} 
            className="min-h-[100px]"
            placeholder="详细描述活动内容、集合地点、注意事项等..."
            required
          />
        </div>

        <div>
            <Label>活动标签 (最多5个)</Label>
            <div className="flex items-center gap-2 mb-2">
                <Input 
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="例如: e人, 爬山, 特种兵..."
                />
                <Button type="button" onClick={handleAddTag} disabled={formData.tags.length >= 5}>
                  添加
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-sm">
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTag(tag)} 
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label>费用类型</Label>
                <Select value={formData.cost_type} onValueChange={v => handleChange('cost_type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="免费">免费</SelectItem>
                        <SelectItem value="AA制">AA制</SelectItem>
                        <SelectItem value="自定义">自定义</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {formData.cost_type === '自定义' && (
              <div>
                <Label>费用说明</Label>
                <Input 
                  value={formData.cost_description} 
                  onChange={e => handleChange('cost_description', e.target.value)}
                  placeholder="例如：每人100元包含门票"
                />
              </div>
            )}
        </div>
        
        <div>
          <Label>预期人数 *</Label>
          <Input 
            type="number" 
            min="1"
            max="50"
            value={formData.max_participants} 
            onChange={e => handleChange('max_participants', Number(e.target.value))} 
            required
          />
        </div>
        
        <div>
          <Label>联系方式 (微信/电话) *</Label>
          <Input 
            value={formData.contact_info} 
            onChange={e => handleChange('contact_info', e.target.value)} 
            placeholder="报名成功后显示给参与者"
            required
          />
        </div>
        
        <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
            <h3 className="text-md font-semibold">高级设置</h3>
            <div className="flex items-center justify-between">
                <Label htmlFor="is_public">在活动广场公开</Label>
                <Switch 
                  id="is_public" 
                  checked={formData.is_public} 
                  onCheckedChange={v => handleChange('is_public', v)}
                />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="allow_anonymous_registration">允许匿名报名</Label>
                <Switch 
                  id="allow_anonymous_registration" 
                  checked={formData.allow_anonymous_registration} 
                  onCheckedChange={v => handleChange('allow_anonymous_registration', v)}
                />
            </div>
            <div>
              <Label>允许每人携带朋友数 (0为不允许)</Label>
              <Select value={String(formData.max_guests_per_participant)} onValueChange={v => handleChange('max_guests_per_participant', Number(v))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  {[...Array(11).keys()].map(i => (
                    <SelectItem key={i} value={String(i)}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600" 
          size="lg" 
          disabled={isSubmitting}
        >
          {isSubmitting ? '发布中...' : (activityId ? '更新活动' : '发布活动')}
        </Button>
      </form>
    </div>
  )
}
