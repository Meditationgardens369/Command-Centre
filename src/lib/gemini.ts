import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function processVoiceBrain(input: string, context?: any) {
  const contextText = context ? `\n\nUser's Recent Context (Weekly Plan, Wins, Outcomes):\n${JSON.stringify(context, null, 2)}\n\nUse this context to better understand their priorities, organize the information, and accurately categorize tasks and insights.` : '';

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following voice note or transcript and extract:
1. Actionable Tasks (with category: Business, House, or Family and priority: High, Medium, or Low)
2. Strategic Insights (revelations or discoveries)
3. New Opportunities (potential high-leverage projects)
4. Creative Ideas (for the Idea Vault)${contextText}

Input: "${input}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["Business", "House", "Family"] },
                priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
              },
              required: ["title", "category", "priority"]
            }
          },
          insights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["Business", "House", "Family", "General"] }
              },
              required: ["content", "category"]
            }
          },
          opportunities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                leverageScore: { type: Type.INTEGER }
              },
              required: ["title", "leverageScore"]
            }
          },
          ideas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title"]
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateStrategicAdvice(context: any) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an AI assistant. Analyze the current state of the dashboard and provide strategic advice.
Context: ${JSON.stringify(context)}`,
    config: {
      systemInstruction: "You are a highly intelligent and helpful AI assistant. Your goal is to provide high-leverage strategic advice to a creative entrepreneur. Keep it concise, literal, and impactful."
    }
  });

  return response.text;
}
