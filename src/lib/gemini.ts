import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function askCoach(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      systemInstruction: 'You are an elite AI personal trainer named PixelGym Coach. You respond kindly and provide expert-level workout and nutrition advice.'
    }
  });
  return response.text || '';
}

export async function analyzeFood(base64Image: string, mimeType: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: 'Analyze this food image. Provide a quick summary of the meal, estimated calories, macronutrients (Protein, Carbs, Fat) in JSON format.' }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      systemInstruction: 'You must return a JSON with strictly the keys: "meal", "calories", "protein", "carbs", "fat", "tips". Keep it brief.'
    }
  });
  return response.text || '{}';
}

export async function analyzeVideoBase64(base64Video: string, mimeType: string, prompt: string): Promise<string> {
   const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Video, mimeType } },
        { text: prompt }
      ]
    },
    config: {
       thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
       systemInstruction: 'You are an elite AI personal trainer. Analyze the user\'s exercise form from this video and provide constructive feedback on technique, posture, and safety.'
    }
  });
  return response.text || '';
}
