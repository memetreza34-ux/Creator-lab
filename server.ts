import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/ai/suggest", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
      }

      const { prompt, content, platform, tool } = req.body;
      
      const ai = new GoogleGenAI({ apiKey });
      
      let systemInstruction = "You are a professional social media manager and content creator assistant. Return ONLY the final requested text, without conversational filler or markdown code blocks (unless formatting specifically requires it).";
      
      let finalPrompt = "";
      
      if (tool === 'Improve') {
        finalPrompt = `Improve this social media post caption to make it more engaging and professional:\n\n${content}`;
      } else if (tool === 'Hook') {
        finalPrompt = `Write a compelling 1-2 sentence hook for this social media post:\n\n${content}`;
      } else if (tool === 'Rewrite') {
        finalPrompt = `Rewrite this social media post to sound more natural and engaging:\n\n${content}`;
      } else if (tool === 'Shorten') {
        finalPrompt = `Shorten this social media post while keeping the core message:\n\n${content}`;
      } else if (tool === 'Hashtags') {
        finalPrompt = `Suggest 5-10 relevant and trending hashtags for this social media post. Return them separated by spaces:\n\n${content}`;
      } else if (prompt) {
        finalPrompt = `Help me with my social media post content based on this request: "${prompt}".\n\nCurrent content: ${content}`;
      } else {
        return res.status(400).json({ error: "No prompt or tool provided" });
      }
      
      if (platform) {
        finalPrompt += `\n\nOptimize this specifically for ${platform}.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: finalPrompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.7
        }
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
