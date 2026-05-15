// api/generateInsight.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing API Key' });

    const { title, nodes } = req.body;

    const prompt = `You are Echo AI, a brilliant cognitive assistant for a mind-mapping app.
        Analyze this mind map for a project titled "${title}".
        Nodes: ${JSON.stringify(nodes)}

        Format your response EXACTLY with these three sections. Do not deviate:

        **Echo AI Analysis for "${title}"**

        🎯 **Core Theme**
        (One sentence identifying the main overarching concept).

        🧠 **Structural Analysis**
        (Briefly analyze how well the sub-topics connect. Use bullet points for specific observations).

        ⚡ **Actionable Next Step**
        (Give one highly specific, actionable suggestion for what they should brainstorm or break down next).

        Keep the tone professional, warm, and highly analytical.`;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        
        return res.status(200).json({ text: result.response.text() });
    } catch (error: any) {
        console.error('Insight Generation Error:', error);
        return res.status(500).json({ error: error.message || 'AI Generation failed' });
    }
}