import { GoogleGenAI, Type } from "@google/genai";
import type { GroundingChunk } from "../types";

export interface FetchedNews {
    rawText: string;
    sources: GroundingChunk[];
}

export interface FoodData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: string;
    foodName: string;
}

export async function fetchWeightLossNews(): Promise<FetchedNews> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Liste as 5 notícias mais recentes e importantes sobre emagrecimento saudável, dieta e exercícios. Para cada notícia, use o formato: 'TÍTULO: [título da notícia]' em uma linha, seguido por 'RESUMO: [resumo da notícia]' em outra linha. Separe cada notícia com '---'.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = (groundingMetadata?.groundingChunks ?? []) as GroundingChunk[];
    
    const text = response.text;
    if (!text) {
      throw new Error("A API não retornou conteúdo.");
    }

    return { rawText: text, sources };

  } catch (error) {
    console.error("Erro ao buscar notícias do Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Falha na comunicação com a API: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido ao buscar notícias.");
  }
}

export async function fetchFoodData(query: string): Promise<FoodData> {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analise a seguinte consulta de alimento e retorne suas informações nutricionais para uma porção padrão. Consulta: "${query}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        foodName: { type: Type.STRING, description: "O nome do alimento identificado." },
                        calories: { type: Type.NUMBER, description: "Total de calorias." },
                        protein: { type: Type.NUMBER, description: "Gramas de proteína." },
                        carbs: { type: Type.NUMBER, description: "Gramas de carboidratos." },
                        fat: { type: Type.NUMBER, description: "Gramas de gordura." },
                        servingSize: { type: Type.STRING, description: "A porção de referência para os valores (ex: '100g', '1 xícara')." }
                    },
                    required: ["foodName", "calories", "protein", "carbs", "fat", "servingSize"]
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as FoodData;

    } catch (error) {
        console.error("Erro ao buscar dados nutricionais:", error);
        if (error instanceof Error) {
            throw new Error(`Falha na comunicação com a API de nutrição: ${error.message}`);
        }
        throw new Error("Ocorreu um erro desconhecido ao buscar dados nutricionais.");
    }
}