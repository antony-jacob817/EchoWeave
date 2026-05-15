// src/services/aiService.ts (Frontend)

const MOCK_MODE = true; // Set to true to test UI, false for real AI

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
        // MOCK MODE
        if (MOCK_MODE) {
            console.log("MOCK MODE ON: Skipping backend API call.");
            await new Promise(resolve => setTimeout(resolve, 2000));
            return {
                transcript: "This is a secure mock transcript to test the UI.",
                mindmap: [
                    { id: "root", label: "Secure App", parent: "" },
                    { id: "n1", label: "Frontend", parent: "root" },
                    { id: "n2", label: "Backend", parent: "root" }
                ]
            };
        }

        // REAL MODE (Securely passes data to your Vercel backend)
        const base64Audio = await this.blobToBase64(audioBlob);

        const response = await fetch('/api/generateMindmap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                audioData: base64Audio,
                mimeType: audioBlob.type || "audio/webm"
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to generate mind map");
        }

        const data = await response.json();
        return data;
    }
};