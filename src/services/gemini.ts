import { GoogleGenAI } from "@google/genai";
import { Message, Document } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateDocumentContent(prompt: string, type: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: 'user',
        parts: [{ text: `Generate a high-quality ${type} based on the user's request: ${prompt}. Use professional PM terminology and clear structure. Format in Markdown.` }]
      }
    ]
  });
  
  return response.text || "";
}

export async function generateRepoDiagram(repoStructure: string, readmeContent: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: 'user',
        parts: [{ text: `You are a Senior Architect AI. Analyze this GitHub repository structure and README content. 
        Generate a clean, professional Mermaid.js flowchart or class diagram that explains the core architecture and data flow of this repository.
        
        Repository Structure:
        ${repoStructure}
        
        README Content:
        ${readmeContent.substring(0, 2000)}
        
        Return ONLY the Mermaid code block starting with \`\`\`mermaid and ending with \`\`\`.` }]
      }
    ]
  });

  const text = response.text || "";
  const match = text.match(/```mermaid\n([\s\S]*?)\n```/);
  return match ? match[1] : "graph TD\nA[Error] --> B[Could not generate diagram]";
}
export async function generateResponse(prompt: string, contextDoc?: Document, history: Message[] = []): Promise<string> {
  const contextPrompt = contextDoc 
    ? `Current Document Context (${contextDoc.type}):\nTitle: ${contextDoc.title}\nContent: ${contextDoc.content}\n\n`
    : "";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      {
        role: 'user',
        parts: [{ text: contextPrompt + prompt }]
      }
    ],
    config: {
      systemInstruction: "You are a world-class Senior Product Manager AI. Provide strategic, clear, and actionable advice. Format with clean markdown. If asked to improve or add something, provide the updated markdown block."
    }
  });

  return response.text || "";
}
