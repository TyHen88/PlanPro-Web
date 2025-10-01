// src/pages/api/chat.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, ChatSession } from '@google/generative-ai';

const MODEL_NAME = "gemini-2.5-flash"; // Upgraded to Pro for better image processing capabilities

// Ensure the API key is available
if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Optional: Keep a simple in-memory store for chat histories for demonstration
// For production, you'd use a database or a more persistent solution.
const chatHistories: Record<string, ChatSession> = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, history, sessionId, images } = req.body as {
      message: string;
      history?: { role: 'user' | 'model'; parts: { text: string }[] }[];
      sessionId?: string; // Optional: to maintain separate chat sessions
      images?: string[]; // Base64 encoded images
    };

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let chat: ChatSession;

    // Use sessionId to retrieve or start a new chat session
    const currentSessionId = sessionId || 'default_session';
    if (sessionId && chatHistories[currentSessionId]) {
      chat = chatHistories[currentSessionId];
      // Note: If history is also passed, you might want to reconcile it
      // or trust the history managed by the ChatSession object.
      // For simplicity, we're prioritizing the ChatSession's internal history.
    } else {
      // Start a new chat session
      const generationConfig = {
        temperature: 0.9, // Adjust as needed
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048, // Adjust as needed
      };

      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ];

      chat = genAI.getGenerativeModel({ model: MODEL_NAME })
        .startChat({
          generationConfig,
          safetySettings,
          history: history || [], // Initialize with provided history if any
        });

      if (sessionId) {
        chatHistories[currentSessionId] = chat;
      }
    }

    // Prepare message parts for multimodal input
    const messageParts: any[] = [{ text: message }];

    // Add images if provided
    if (images && images.length > 0) {
      for (const imageBase64 of images) {
        // Remove data URL prefix if present
        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        messageParts.push({
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg' // Default to JPEG, could be enhanced to detect actual type
          }
        });
      }
    }

    const result = await chat.sendMessage(messageParts);
    const response = result.response;
    const aiMessage = response.text();

    // For streaming (more advanced):
    // const stream = await chat.sendMessageStream(message);
    // res.setHeader('Content-Type', 'text/plain'); // Or application/octet-stream
    // for await (const chunk of stream.stream) {
    //   res.write(chunk.text());
    // }
    // res.end();
    // return; // Important: End the function here if streaming

    return res.status(200).json({ reply: aiMessage });

  } catch (error: unknown) {
    console.error("Error in /api/chat:", error);
    let errorMessage = 'Failed to get response from AI';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    }
    return res.status(500).json({ error: errorMessage });
  }
}