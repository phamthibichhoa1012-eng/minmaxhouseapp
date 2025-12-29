
import { GoogleGenAI, Type } from "@google/genai";

// Khởi tạo Gemini AI với API Key từ môi trường
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Phân tích bộ hồ sơ khảo sát chuyên sâu
 */
export const analyzeDesignRequirements = async (requirements: any) => {
  const ai = getAI();
  const prompt = `Bạn là một Kiến trúc sư trưởng (Chief Architect) dày dặn kinh nghiệm tại Việt Nam. 
  Hãy phân tích bộ hồ sơ khảo sát khách hàng sau và đưa ra một bản đề xuất chuyên môn gồm:
  1. Core Concept: Ý tưởng thiết kế độc bản dựa trên gu của khách.
  2. Giải pháp công năng: Tối ưu mặt bằng dựa trên diện tích đất ${requirements.arch.landStatus || ''}.
  3. Tư vấn vật liệu & Ánh sáng: Gợi ý các loại vật liệu cụ thể (ví dụ: đá, gỗ, kính) phù hợp với ngân sách ${requirements.arch.budget}.
  4. Cảnh báo kỹ thuật: Các vấn đề cần lưu ý (hướng nắng, gió, phong thủy).

  Hồ sơ dự án:
  - Kiến trúc: Phong cách ${requirements.arch.style}, mục đích ${requirements.arch.purpose}, thành viên ${requirements.arch.members}.
  - Nội thất: Style ${requirements.interior.style}, vật liệu ưu tiên ${requirements.interior.materials}.
  - Sân vườn: Style ${requirements.landscape.style}, nhu cầu ${requirements.landscape.functions}.

  Hãy viết bằng tiếng Việt chuyên ngành kiến trúc, súc tích, đẳng cấp.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Hệ thống AI đang bảo trì, vui lòng thử lại sau.";
  }
};

/**
 * Chat với trợ lý kiến trúc sư AI dựa trên bối cảnh dự án
 */
export const createArchitectChat = (projectContext: any) => {
  const ai = getAI();
  const systemInstruction = `Bạn là "Trợ lý KTS AI" của MINMAXHOUSE. 
  Bối cảnh dự án hiện tại:
  - Tên: ${projectContext.name}
  - Địa chỉ: ${projectContext.address}
  - Diện tích: Đất ${projectContext.landArea}m2, XD ${projectContext.buildArea}m2
  - Khách hàng: ${projectContext.clientName}, Phong cách: ${projectContext.designDetails?.arch.style}
  - Ngân sách: ${projectContext.designDetails?.arch.budget}

  Nhiệm vụ của bạn:
  1. Hỗ trợ Designer giải quyết các bài toán về mặt bằng, phối cảnh.
  2. Tư vấn quy chuẩn xây dựng và xu hướng thiết kế mới nhất.
  3. Phản biện các ý tưởng thiết kế để tìm ra giải pháp tối ưu nhất.
  
  Hãy luôn giữ thái độ chuyên nghiệp, sáng tạo và thực tế.`;

  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
    },
  });
};

/**
 * Render kiến trúc chuyên nghiệp (Model Pro cho chất lượng cao)
 */
export const generateProfessionalRender = async (options: {
  prompt: string;
  style?: string;
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  isHighQuality?: boolean;
  sourceImage?: string;
}) => {
  const { prompt, style = "Modern", aspectRatio = "16:9", isHighQuality = false, sourceImage } = options;

  // Nếu dùng model Pro, yêu cầu chọn key (theo quy định Studio)
  if (isHighQuality) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
  }

  const ai = getAI();
  const modelName = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  const architecturalPrefix = `High-end professional architectural render, ${style} style, photorealistic, 8k resolution, cinematic lighting, masterpiece, ultra-detailed interior/exterior: `;
  
  try {
    const contents: any = {
      parts: []
    };

    if (sourceImage) {
      const parts = sourceImage.split(',');
      const data = parts[1];
      const mimeType = sourceImage.split(';')[0].split(':')[1];
      contents.parts.push({ inlineData: { data, mimeType } });
      contents.parts.push({ text: `Based on this site photo, render a new design with these instructions: ${prompt}. Keep architectural structure but upgrade aesthetics to ${style} style.` });
    } else {
      contents.parts.push({ text: `${architecturalPrefix}${prompt}` });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: isHighQuality ? {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: "1K"
        }
      } : {
        imageConfig: {
          aspectRatio: aspectRatio as any
        }
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Render Error:", error);
    return null;
  }
};
