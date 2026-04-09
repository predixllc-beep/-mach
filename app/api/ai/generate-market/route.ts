import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert prediction market creator. Analyze the following input (which could be a URL, a news headline, or a general topic) and generate a structured prediction market.

Input: "${input}"

Rules:
1. Category MUST be exactly one of: Crypto, Sports, Politics, TikTok, Music, Series, Tech.
2. Outcomes should typically be ["YES", "NO"] unless it's a specific multi-choice scenario.
3. Probabilities must match the number of outcomes and sum to exactly 1.0. If it's highly uncertain, default to 0.5 for YES/NO.
4. End date should be a reasonable future date in ISO 8601 format (e.g., 2026-12-31T23:59:59Z).
5. Confidence score between 0 and 100 based on how much data is available to resolve this market.

Generate the market data.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A clear, unambiguous question for the market." },
            category: { type: Type.STRING },
            outcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
            probabilities: { type: Type.ARRAY, items: { type: Type.NUMBER } },
            endDate: { type: Type.STRING },
            confidenceScore: { type: Type.INTEGER },
            reasoning: { type: Type.STRING, description: "Brief explanation of why these probabilities and dates were chosen." }
          },
          required: ["title", "category", "outcomes", "probabilities", "endDate", "confidenceScore", "reasoning"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating market:", error);
    return NextResponse.json({ error: "Failed to generate market" }, { status: 500 });
  }
}
