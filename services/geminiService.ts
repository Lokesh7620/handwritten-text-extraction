
import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const env = (import.meta as any).env;
  const apiKey = env ? env.VITE_GEMINI_API_KEY : undefined;

  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY not found in environment.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Extracts text from a handwritten image.
 */
export const extractHandwriting = async (base64Image: string) => {
  const ai = getClient();

  const base64Data = base64Image.includes(',')
    ? base64Image.split(',')[1]
    : base64Image;

  const mimeMatch = base64Image.match(/^data:(image\/[\w\-\.\+]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  const extractionPrompt = "Analyze this image and extract all handwritten or printed text exactly as it appears. Preserve the layout and structure using Markdown.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: extractionPrompt
          }
        ]
      },
      config: {
        systemInstruction: `
          You are an advanced OCR engine.
          
          CAPABILITIES:
          - High-precision handwriting recognition.
          - Layout preservation.
          - Contextual spelling correction for handwritten notes.

          OUTPUT RULES:
          - Return the extracted text in Markdown format.
          - Do NOT include any conversational text or meta-commentary.
          - If no text is found, return "No text detected."
        `
      }
    });

    return response.text || "No text could be extracted.";
  } catch (error) {
    console.error("Extraction Error:", error);
    throw error;
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text || !text.trim()) {
    return "";
  }

  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: `Translate the following text into ${targetLanguage}.` },
          { text: text }
        ]
      },
      config: {
        systemInstruction: `
          You are a professional translator.
          
          Instructions:
          1. Translate the text accurately to the target language.
          2. STRICTLY maintain the original formatting.
          3. Return ONLY the translated text.
        `
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Translation API Error:", error);
    throw error;
  }
};
