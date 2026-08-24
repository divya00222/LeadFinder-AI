
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { validateAndSend } from './src/server/integrations';
import fs from 'fs';

const __dirname = process.cwd();
const DATA_FILE = path.join(__dirname, 'data.json');

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ messages: [] }));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Client Initialization
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // AI API Route
  app.post("/api/ai", async (req, res) => {
    const { action, context } = req.body;
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Analyze the following CRM task: ${action}. Context: ${JSON.stringify(context)}. Provide an advisory analysis in JSON format.`,
        config: {
            responseMimeType: "application/json",
            systemInstruction: "You are an advisory AI CRM assistant. You must ONLY return structured JSON responses. NEVER perform actions like sending messages directly. Your role is purely to provide advisory insights, analysis, and drafts for human approval."
        }
      });
      
      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      res.json(JSON.parse(text));
    } catch (error) {
      console.error("AI API Error:", error);
      res.status(500).json({ error: "AI processing failed." });
    }
  });

  // Send Message API Route (Updated)
  app.post("/api/send", async (req, res) => {
    const { leadId, messageId, body, channel } = req.body;
    
    // Read current data
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    const message = data.messages.find((m: any) => m.id === messageId);

    // Server-side validation
    if (!message) return res.status(400).json({ error: "Message not found" });
    if (message.approvalStatus !== 'approved') {
      return res.status(400).json({ error: "Message requires human approval before sending." });
    }

    const mockConnector: any = {
      channel,
      authenticate: async () => true,
      send: async () => ({ success: true })
    };

    try {
      await validateAndSend(mockConnector, leadId, messageId, body);
      // Update message status
      message.status = 'sent';
      message.sentAt = new Date().toISOString();
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Send Error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
