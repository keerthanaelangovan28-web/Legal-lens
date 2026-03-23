import { GoogleGenAI } from "@google/genai";
import { Language } from "../store";

// Lazy initialization to prevent app crash when API key is missing
let _ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    try {
      _ai = new GoogleGenAI({ apiKey });
    } catch {
      return null;
    }
  }
  return _ai;
}

export async function getLegalAdvice(query: string, language: Language) {
  const prompt = `
    You are LegalLens, an AI legal rights co-pilot for Indian citizens.
    The user is in a crisis situation and said: "${query}" in ${language}.
    
    Provide the exact legal rights protecting them under Indian Law.
    
    STRICT RULES:
    1. Cite exact Section number + Act name (e.g. "Section 41D, CrPC 1973").
    2. Provide exactly 3 bullet points of rights.
    3. Provide one "Say this:" scripted phrase that the user can say to the authority/person.
    4. Keep it extremely simple and clear for a frightened person.
    5. Respond in ${language}.
    
    Return the response in JSON format:
    {
      "rights": ["Right 1 with Section", "Right 2 with Section", "Right 3 with Section"],
      "scriptedPhrase": "The exact phrase to say",
      "section": "Primary Section/Act cited"
    }
  `;

  const ai = getAI();
  if (!ai) {
    console.warn("Gemini API key not configured — using mock data.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error fetching legal advice:", error);
    return null;
  }
}
