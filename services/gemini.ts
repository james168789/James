import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// Note: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateThaiGreetings = async (topic: string): Promise<string[]> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Generate 5 unique, heartwarming, and culturally appropriate International New Year blessing messages in Thai language.
      Context/Theme: ${topic || "General Happiness and Success"}.
      
      Requirements:
      1. Strictly in Thai script.
      2. Grammatically correct and spelled correctly (Official Thai spelling).
      3. Tone: Polite, warm, and encouraging.
      4. Length: Short to medium (2-4 lines max).
      5. Return ONLY a JSON array of strings.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No text returned from Gemini");
    
    return JSON.parse(jsonText) as string[];
  } catch (error) {
    console.error("Error generating text:", error);
    // Fallback messages in case of API failure
    return [
      "ขอให้มีความสุขกาย สบายใจ ปราศจากทุกข์โศก โรคภัยทั้งหลายทั้งปวง",
      "สวัสดีปีใหม่ ขอให้ปีนี้เป็นปีที่ดีสำหรับคุณและครอบครัว",
      "ขอให้ประสบความสำเร็จในหน้าที่การงาน สุขภาพแข็งแรง",
      "โชคดีมีชัย คิดสิ่งใดสมความปรารถนาทุกประการ",
      "ขอให้รวยๆ เฮงๆ ตลอดปีและตลอดไป"
    ];
  }
};

export const generateFestiveBackground = async (topic: string): Promise<string> => {
  try {
    const model = "gemini-2.5-flash-image";
    const prompt = `
      A festive, beautiful background image for a New Year greeting card.
      Style: ${topic || "Elegant, Gold and Sparkles, Thai Modern pattern"}.
      No text on the image. High quality, soft lighting, suitable for overlaying text.
      Aspect Ratio 4:5 vertical.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No image generated");

    // Iterate to find the inline data
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating background:", error);
    // Return a placeholder if generation fails
    return "https://picsum.photos/600/750?blur=2"; 
  }
};
