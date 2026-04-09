import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, category } = await req.json();

    if (!title || !category) {
      return NextResponse.json({ error: "Missing title or category" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an expert financial analyst and prediction market expert.
      Analyze the following market:
      Title: "${title}"
      Category: "${category}"

      Provide a brief, objective summary (max 2 sentences) of the current market sentiment and key factors driving this prediction.
      Also provide a sentiment score from 0 to 100, where 0 is extremely pessimistic/unlikely and 100 is extremely optimistic/likely.

      Respond ONLY with a JSON object in the following format:
      {
        "summary": "Your brief summary here.",
        "score": 75
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze market" }, { status: 500 });
  }
}
