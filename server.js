import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 5173;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
};

function safePath(urlPath) {
  const clean = urlPath.split("?")[0];
  const rel = clean === "/" ? "/index.html" : clean;
  const resolved = path.normalize(rel).replace(/^\.\.(\/|\\)/g, "");
  return path.join(__dirname, resolved);
}

async function handleStatic(req, res) {
  try {
    const filePath = safePath(req.url);
    const ext = path.extname(filePath);
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(data);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
}

async function handleTts(req, res) {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing OPENAI_API_KEY" }));
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 5000) req.destroy();
  });

  req.on("end", async () => {
    try {
      const { text, voice, speed } = JSON.parse(body || "{}");
      if (!text || typeof text !== "string") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Text required" }));
        return;
      }

      const response = await client.audio.speech.create({
        model: "gpt-4o-mini-tts-2025-12-15",
        voice: voice || "cedar",
        input: text.slice(0, 200),
        response_format: "mp3",
        speed: Number(speed) || 1.0,
        instructions:
          "Voice Affect: Clear, neutral announcer. Tone: Professional and calm. Pacing: Steady. Emphasis: Pronounce the word crisply.",
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      res.writeHead(200, {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      });
      res.end(buffer);
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "TTS failed" }));
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.url?.startsWith("/api/tts")) {
    handleTts(req, res);
    return;
  }
  handleStatic(req, res);
});

server.listen(port, () => {
  console.log(`Spell Bee server running on http://localhost:${port}`);
});
