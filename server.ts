import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { allowLocalUnauthenticatedAi, validateAiRequest } from "./src/server/aiRequest";

dotenv.config();

// In-memory rate limiter: max 40 requests per 60 seconds per IP
const ipRequestTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 40;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipRequestTimestamps.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  timestamps.push(now);
  ipRequestTimestamps.set(ip, timestamps);
  return true;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Suggest & Creator Intelligence Endpoint
  app.post("/api/ai/suggest", async (req, res) => {
    // Production, missing NODE_ENV, proxy traffic and public dev access all
    // fail closed. Only explicit local development over the loopback socket can
    // use the prototype unauthenticated paid-model endpoint.
    if (!allowLocalUnauthenticatedAi(
      process.env.NODE_ENV,
      process.env.CREATOR_LAB_ALLOW_LOCAL_AI,
      req.socket.remoteAddress,
    )) {
      return res.status(503).json({
        error: 'AI assistance is unavailable until secure account access is enabled.',
      });
    }

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ 
        error: "Rate limit exceeded. Please wait a moment before generating more suggestions." 
      });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
      }

      const validated = validateAiRequest(req.body);
      if (validated.ok === false) {
        return res.status(400).json({ error: validated.error });
      }
      const { content, tool, platform, platforms, tone, weaknesses } = validated.value;

      const ai = new GoogleGenAI({ apiKey });

      // Build specific prompt & system instruction depending on tool
      let systemInstruction = "You are an expert social media strategist and content creator intelligence assistant. Provide thoughtful, actionable, high-performing output.";
      let userPrompt = "";
      let responseSchemaFormat = false;

      if (tool === 'analyze') {
        systemInstruction += " You evaluate social media posts realistically. NOTE: These are AI estimates and diagnostic feedback, not guarantees of virality.";
        userPrompt = `Perform a comprehensive Creator Intelligence diagnostic on this social media post.
Platform destination: ${platform || 'Cross-Platform'}
Post Content:
"""${content}"""

Return a valid JSON object ONLY (without markdown wrapper if possible, or inside \`\`\`json \`\`\`) with the following structure:
{
  "overallScore": number (0-100, realistic assessment),
  "scores": {
    "hookStrength": number (0-100),
    "clarity": number (0-100),
    "ctaStrength": number (0-100),
    "platformFit": number (0-100),
    "engagementPotential": number (0-100)
  },
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "recommendedChanges": ["string", "string"]
}`;
        responseSchemaFormat = true;
      } else if (tool === 'hook') {
        userPrompt = `Generate exactly 3 distinct, high-impact hook variations for this social media content.
Strategy 1: Curiosity Gap
Strategy 2: Bold Contrarian Statement
Strategy 3: Direct Value / Problem Callout
Platform: ${platform || 'General'}
Content:
"""${content}"""

Return a valid JSON object with the format:
{
  "hooks": [
    "First hook here",
    "Second hook here",
    "Third hook here"
  ]
}`;
        responseSchemaFormat = true;
      } else if (tool === 'hashtags') {
        userPrompt = `Suggest 6-10 highly relevant, targeted hashtags for this content.
Platform: ${platform || 'Instagram/TikTok'}
Content:
"""${content}"""

Return a valid JSON object with the format:
{
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6"]
}`;
        responseSchemaFormat = true;
      } else if (tool === 'rewrite') {
        const selectedTone = tone || 'Professional';
        userPrompt = `Rewrite the following social media post preserving its original core message and facts, but adopting a "${selectedTone}" tone of voice.
Platform: ${platform || 'General'}
Content:
"""${content}"""

Return ONLY the rewritten post caption text.`;
      } else if (tool === 'improve') {
        userPrompt = `Refine and elevate this social media post for higher readability, punchier pacing, and better engagement while retaining its authentic voice.
Platform: ${platform || 'General'}
Content:
"""${content}"""

Return ONLY the improved post caption text.`;
      } else if (tool === 'shorten') {
        userPrompt = `Condense this social media post to be tight, high-signal, and easily skimmable without losing key benefits.
Platform: ${platform || 'General'}
Content:
"""${content}"""

Return ONLY the shortened post caption text.`;
      } else if (tool === 'weak_points') {
        userPrompt = `The creator content received the following weakness diagnosis:
${Array.isArray(weaknesses) ? weaknesses.map((w: string) => `- ${w}`).join('\n') : weaknesses || 'General weaknesses in hook and CTA'}

Original Content:
"""${content}"""
Platform: ${platform || 'General'}

Generate an improved version of the post that directly corrects these weak points while maintaining the creator's voice.
Return a valid JSON object with:
{
  "improvedContent": "The full revised text of the post",
  "explanation": "Brief 1-2 sentence summary of what was corrected"
}`;
        responseSchemaFormat = true;
      } else if (tool === 'variations') {
        userPrompt = `Generate 3 meaningfully different strategic variations of this content for testing.
Original Content:
"""${content}"""
Platform: ${platform || 'General'}

Variation 1: Direct Promise (clear, immediate ROI)
Variation 2: Curiosity Gap (intrigue and unexpected perspective)
Variation 3: Story Hook (personal narrative or behind-the-scenes framing)

Return a valid JSON object with:
{
  "variations": [
    {
      "strategy": "Direct Promise",
      "title": "Clear ROI Focus",
      "content": "Full caption text",
      "explanation": "Why this angle works"
    },
    {
      "strategy": "Curiosity Gap",
      "title": "Unexpected Angle",
      "content": "Full caption text",
      "explanation": "Why this angle works"
    },
    {
      "strategy": "Story Hook",
      "title": "Narrative Journey",
      "content": "Full caption text",
      "explanation": "Why this angle works"
    }
  ]
}`;
        responseSchemaFormat = true;
      } else if (tool === 'optimize_platform') {
        const destPlatforms = Array.isArray(platforms) && platforms.length > 0 
          ? platforms 
          : (platform ? [platform] : ['instagram', 'tiktok', 'linkedin', 'twitter']);
        
        userPrompt = `Adapt the following base social media content specifically for each destination platform: ${destPlatforms.join(', ')}.
Each platform version should follow the specific culture, spacing, hashtag conventions, and length limits of that platform.
Base Content:
"""${content}"""

Return a valid JSON object mapping each platform key to its adapted text:
{
  "optimizations": {
    ${destPlatforms.map((p: string) => `"${p}": "Adapted text for ${p}"`).join(',\n    ')}
  }
}`;
        responseSchemaFormat = true;
      }

      // Execute with timeout protection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("AI generation request timed out after 15 seconds")), 15000)
      );

      const aiCallPromise = ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: tool === 'analyze' ? 0.2 : 0.7,
          maxOutputTokens: 2048
        }
      });

      const response: any = await Promise.race([aiCallPromise, timeoutPromise]);
      const rawText = response.text || "";

      // Parse JSON if needed
      if (responseSchemaFormat) {
        try {
          const cleanedText = rawText
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
          const parsed = JSON.parse(cleanedText);
          return res.json({ result: rawText, data: parsed });
        } catch (jsonErr) {
          console.warn("Could not parse AI response as JSON:", rawText);
          return res.json({ result: rawText, raw: true });
        }
      }

      res.json({ result: rawText.trim() });
    } catch (error: any) {
      console.error("AI Assistant Error:", error);
      res.status(502).json({
        error: "AI assistance is temporarily unavailable. Your draft has not been changed.",
      });
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
