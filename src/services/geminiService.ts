import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export const geminiService = {
  async generateContent(prompt: string, systemInstruction?: string): Promise<string> {
    try {
      const apiKey = (process.env.API_KEY || process.env.GEMINI_API_KEY) as string;
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "You are a helpful assistant for Boardly, a creator monetization platform.",
        },
      });
      return response.text || "";
    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  },

  async getPricingSuggestions(stats: {
    followerCount: number;
    avgViewers: number;
    niche: string;
    country: string;
    adType: string;
  }) {
    const prompt = `Suggest 4 pricing tiers for a TikTok creator with:
    - Followers: ${stats.followerCount}
    - Avg Viewers: ${stats.avgViewers}
    - Niche: ${stats.niche}
    - Country: ${stats.country}
    - Ad Type: ${stats.adType}

    Return JSON format:
    {
      "recommended": number,
      "safe": number,
      "aggressive": number,
      "premium": number,
      "explanation": "string",
      "tips": ["string"]
    }`;

    const response = await this.generateContent(prompt, "You are a monetization expert for social media creators.");
    try {
      return JSON.parse(response.replace(/```json|```/g, ""));
    } catch (e) {
      console.error("Failed to parse pricing JSON", response);
      return null;
    }
  },

  async scanContent(content: string, type: 'text' | 'link'): Promise<{ isSafe: boolean; reason: string; riskLevel: string }> {
    const prompt = `Scan the following ${type} for safety: "${content}"
    Check for: pornography, gambling, harmful promotions, illegal acts, or exploitative content.
    Return JSON format:
    {
      "isSafe": boolean,
      "riskLevel": "low" | "medium" | "high" | "critical",
      "reason": "string"
    }`;

    const response = await this.generateContent(prompt, "You are a content safety AI for a professional advertising platform.");
    try {
      return JSON.parse(response.replace(/```json|```/g, ""));
    } catch (e) {
      console.error("Failed to parse safety JSON", response);
      return { isSafe: true, reason: "Unable to scan", riskLevel: "low" };
    }
  },

  async evaluateBoxBattle(stats: any) {
    const prompt = `Evaluate this TikTok creator for a sponsored Box Battle:
    ${JSON.stringify(stats)}
    
    Return JSON format:
    {
      "score": number (0-100),
      "isEligible": boolean,
      "feedback": "string",
      "suggestedLeagues": ["string"]
    }`;

    const response = await this.generateContent(prompt, "You are a talent scout for competitive live streaming events.");
    try {
      return JSON.parse(response.replace(/```json|```/g, ""));
    } catch (e) {
      return null;
    }
  }
};
