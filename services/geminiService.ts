import { GoogleGenAI, Type } from "@google/genai";
import { CartItem, RecipeResponse } from '../types';

export const generateRecipeFromCart = async (items: CartItem[]): Promise<RecipeResponse | null> => {
  if (items.length === 0) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const ingredientsList = items.map(item => item.name).join(', ');

    const prompt = `请使用以下食材创建一个富有创意、简短且健康的中文食谱：${ingredientsList}。
    你可以假设有一些基本的调料（如蜂蜜、酸奶、盐、油等）。
    保持简单有趣。`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            ingredients: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as RecipeResponse;
    }
    return null;

  } catch (error) {
    console.error("Error generating recipe:", error);
    throw error;
  }
};