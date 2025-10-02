import React, { useState } from 'react';
import { User, ExtractDataFromUploadedFile } from '@base44/shared/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ImageUploader from '../components/common/ImageUploader';

export default function Verification() {
    const navigate = useNavigate();
    const [idCardFrontUrl, setIdCardFrontUrl] = useState('');
    const [idCardHandheldUrl, setIdCardHandheldUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!idCardFrontUrl || !idCardHandheldUrl) {
            setError('请上传两张必需的图片。');
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            // 1. 从身份证正面提取信息
            const extractionResult = await ExtractDataFromUploadedFile({
                file_url: idCardFrontUrl,
                json_schema: {
                    type: "object",
                    properties: {
                        gender: { type: "string", description: "The gender of the person" }
                    }
                }
            });

            if (extractionResult.status !== 'success' || !extractionResult.output) {
                 throw new Error("无法识别身份证信息，请确保图片清晰。");
            }
            
            const gender = extractionResult.output.gender;

            // 2. 检查性别是否为女
            if (gender !== '女') {
                throw new Error("认证信息不符合要求。");
            }

            // 3. 更新用户信息为待审核
            await User.updateMyUserData({
                id_card_front_url: idCardFrontUrl,
                id_card_handheld_url: idCardHandheldUrl,
                verification_status: 'pending'
            });

            alert('认证申请已提交！我们将在1-2个工作日内完成审核。');
            navigate(-1); // 返回上一页

        } catch (e) {
            console.error(e);
            setError(e.message || '提交失败，请重试。');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
                <Link to={-1}>
                    <Button variant="ghost" size="icon"><ArrowLeft /></Button>
                </Link>
                <h1 className="text-xl font-bold ml-2">身份认证</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>上传认证信息</CardTitle>
                    <p className="text-sm text-gray-500">为了社区安全，我们需要您提供真实信息。请使用相机实时拍照，信息将被严格保密。</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">1. 拍摄身份证人像面</h3>
                        <ImageUploader 
                            value={idCardFrontUrl}
                            onChange={(url) => setIdCardFrontUrl(url)}
                            placeholder="请实时拍摄身份证正面，确保文字清晰可见"
                            forceCamera={true}
                        />
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">2. 拍摄手持身份证自拍</h3>
                        <p className="text-xs text-gray-500 mb-2">请确保您的面部和身份证信息都清晰可见，我们将以此确认是您本人操作。</p>
                        <ImageUploader 
                            value={idCardHandheldUrl}
                            onChange={(url) => setIdCardHandheldUrl(url)}
                            placeholder="请实时拍摄您的手持身份证自拍"
                            forceCamera={true}
                        />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || !idCardFrontUrl || !idCardHandheldUrl}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        {isSubmitting ? '提交中...' : '提交审核'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}