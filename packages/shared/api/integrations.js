import { base44 } from './base44Client';




export const Core = base44.integrations.Core;

export const InvokeLLM = base44.integrations.Core.InvokeLLM;

export const SendEmail = base44.integrations.Core.SendEmail;

export const UploadFile = base44.integrations.Core.UploadFile;

export const GenerateImage = base44.integrations.Core.GenerateImage;

export const ExtractDataFromUploadedFile = base44.integrations.Core.ExtractDataFromUploadedFile;

// 身份证OCR识别集成
export const IdCardOCR = {
  // 腾讯云身份证OCR识别
  tencentOCR: async (imageBase64, side = 'front') => {
    try {
      const response = await fetch('/api/ocr/tencent-id-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
          side: side // 'front' 或 'back'
        })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('腾讯云OCR识别失败：', error);
      throw error;
    }
  },

  // 百度云身份证OCR识别
  baiduOCR: async (imageBase64, side = 'front') => {
    try {
      const response = await fetch('/api/ocr/baidu-id-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
          id_card_side: side // 'front' 或 'back'
        })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('百度云OCR识别失败：', error);
      throw error;
    }
  }
};
