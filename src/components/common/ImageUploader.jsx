import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { UploadFile } from '@/api/integrations';

export default function ImageUploader({ value, onChange, placeholder = "点击拍照上传", forceCamera = false }) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(value || '');

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        // 检查文件大小 (限制为5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('图片大小不能超过5MB');
            return;
        }

        setIsUploading(true);
        
        try {
            // 创建本地预览
            const localPreview = URL.createObjectURL(file);
            setPreviewUrl(localPreview);

            // 上传文件
            const result = await UploadFile({ file });
            
            // 更新最终URL
            setPreviewUrl(result.file_url);
            onChange?.(result.file_url);
            
            // 清理本地预览URL
            URL.revokeObjectURL(localPreview);
        } catch (error) {
            console.error('上传失败:', error);
            alert('图片上传失败，请重试');
            setPreviewUrl(value || '');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl('');
        onChange?.('');
    };

    return (
        <div className="space-y-3">
            {previewUrl ? (
                <Card className="relative overflow-hidden">
                    <CardContent className="p-0">
                        <img 
                            src={previewUrl} 
                            alt="预览" 
                            className="w-full h-48 object-cover"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={handleRemove}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-dashed border-2 border-gray-300 hover:border-pink-400 transition-colors">
                    <CardContent className="p-8">
                        <div className="text-center">
                            <div className="mb-4">
                                <Camera className="w-12 h-12 mx-auto text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{placeholder}</p>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isUploading}
                                className="relative"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                {isUploading ? '上传中...' : (forceCamera ? '拍照上传' : '选择图片')}
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture={forceCamera ? "environment" : undefined}
                                    onChange={handleFileSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={isUploading}
                                />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            <p className="text-xs text-gray-500 text-center">
                {forceCamera ? '请使用相机实时拍照，确保照片清晰可见' : '支持 JPG、PNG、GIF 格式，文件大小不超过 5MB'}
            </p>
        </div>
    );
}