// api/generateMindmap.ts (Secure Backend Function)
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// 1. The Schema lives safely on the backend now
const unifiedSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    transcript: { type: SchemaType.STRING },
    mindmap: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          label: { type: SchemaType.STRING },
          parent: { type: SchemaType.STRING, nullable: true }
        },
        required: ["id", "label", "parent"]
      }
    }
  },
  required: ["transcript", "mindmap"]
};

const MIND_MAP_PROMPT = `
You are an expert cognitive architect and structural editor. 
Listen to the attached audio brainstorming session.
1. Provide a highly accurate, word-for-word transcript.
2. Distill the concepts into a clean, hierarchical mind map. Extract the main theme as "root", identify core sub-themes, and attach supporting details. Keep node labels incredibly concise (1-4 words).
Output strictly according to the required JSON schema.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Safely grab the hidden key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration: Missing API Key' });
  }

  const { audioData, mimeType } = req.body;
  if (!audioData) {
    return res.status(400).json({ error: 'No audio data provided' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: unifiedSchema,
        temperature: 0.2, 
      }
    });

    const result = await model.generateContent([
      MIND_MAP_PROMPT,
      { inlineData: { mimeType: mimeType || "audio/webm", data: audioData } }
    ]);

    const data = JSON.parse(result.response.text());
    
    // Send the { transcript, mindmap } object back to the frontend
    return res.status(200).json(data);

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process audio' });
  }
}