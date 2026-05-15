import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) throw new Error("Missing Gemini API Key");
const genAI = new GoogleGenerativeAI(apiKey);

// 1. THE NEW UNIFIED SCHEMA
// We now ask for an Object containing BOTH the transcript AND the mind map array
const unifiedSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    transcript: {
      type: SchemaType.STRING,
      description: "The full, word-for-word raw text transcription of the audio."
    },
    mindmap: {
      type: SchemaType.ARRAY,
      description: "A list of nodes representing a hierarchical mind map.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: {
            type: SchemaType.STRING,
            description: "A unique, short, lowercase alphanumeric identifier. The main topic MUST be 'root'."
          },
          label: {
            type: SchemaType.STRING,
            description: "A concise, 1-to-4 word summary of the concept."
          },
          parent: {
            type: SchemaType.STRING,
            description: "The id of the parent node. For the root node, this MUST be an empty string.",
            nullable: true,
          }
        },
        required: ["id", "label", "parent"] as string[] 
      }
    }
  },
  required: ["transcript", "mindmap"]
};

const MIND_MAP_PROMPT = `
You are an expert cognitive architect and structural editor. 
Listen to the attached audio brainstorming session.

YOUR TASKS:
1. Provide a highly accurate, word-for-word transcript of the audio.
2. Distill the concepts into a clean, hierarchical mind map. Extract the main theme as "root", identify core sub-themes, and attach supporting details. Keep node labels incredibly concise (1-4 words).

Output strictly according to the required JSON schema, providing both the 'transcript' and the 'mindmap'.
`;

const MOCK_MODE = true; 

export const aiService = {
    async blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    const base64Data = reader.result.split(",")[1];
                    resolve(base64Data);
                } else {
                    reject(new Error("Failed to convert blob to base64"));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    async generateMindMapFromAudio(audioBlob: Blob) {
        
        // ------------------------------------------------
        // MOCK MODE UPDATE: Now returns the Transcript too!
        // ------------------------------------------------
        if (MOCK_MODE) {
            console.log("MOCK MODE ON: Skipping real Gemini API call.");
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            return {
                transcript: "Okay, let's plan the new marketing campaign. We need to focus on social media, specifically some TikTok videos. We also need an email marketing push with a weekly newsletter, and finally, let's run some paid ads on Google.",
                mindmap: [
                    { id: "root", label: "Mock Campaign", parent: "" },
                    { id: "n1", label: "Social Media", parent: "root" },
                    { id: "n2", label: "Email Marketing", parent: "root" },
                    { id: "n3", label: "Paid Ads", parent: "root" },
                    { id: "n4", label: "TikTok Video", parent: "n1" },
                    { id: "n5", label: "Weekly Newsletter", parent: "n2" },
                    { id: "n6", label: "Google Ads", parent: "n3" }
                ]
            };
        }

        // ------------------------------------------------
        // REAL MODE
        // ------------------------------------------------
        const base64Audio = await this.blobToBase64(audioBlob);

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: unifiedSchema, // Using our new schema here!
                temperature: 0.2, 
            }
        });

        try {
            const result = await model.generateContent([
                MIND_MAP_PROMPT,
                { inlineData: { mimeType: audioBlob.type || "audio/webm", data: base64Audio } }
            ]);

            const responseText = result.response.text();
            
            // This now returns an object: { transcript: "...", mindmap: [...] }
            const data = JSON.parse(responseText);
            return data;

        } catch (error) {
            console.error("AI Generation failed:", error);
            throw new Error("Failed to generate data from audio");
        }
    }
};