import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 API KEY (from .env)
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ Missing GEMINI_API_KEY in .env");
    process.exit(1);
}

app.post("/analyze", async (req, res) => {
    const { logs, labType } = req.body;

    if (!logs || !logs.length) {
        return res.json({ answer: "⚠️ No logs provided for analysis" });
    }

    const prompt = `
Analyze these cybersecurity attack logs from a ${labType} lab:
${logs.join("\n")}

Identify the vulnerability and return a structured JSON response.

CRITICAL RULES:
- Use precise vulnerability names:
  - "No Rate Limiting (Brute Force Attack)" (for brute force labs)
  - "IDOR (Broken Access Control)" (for user data access labs)
- NEVER use generic names like "Weak Password".
- Format must be EXACTLY:
{
  "vulnerability": "Precise Name",
  "severity": "HIGH/MEDIUM/LOW",
  "analysis": "Detailed but concise explanation of why the attack worked",
  "impact": "The security impact on the system",
  "fix": ["Actionable step 1", "Actionable step 2"]
}

Do not include any other text, only the JSON.
`;

    try {
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": API_KEY,
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
            }),
        }
        );

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.error?.message || "Unknown error";
            return res.json({ answer: `❌ API Error: ${errorMsg}` });
        }

        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        // Clean up JSON if AI adds markdown blocks
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const analysis = JSON.parse(text);
            res.json(analysis);
        } catch (e) {
            console.error("JSON PARSE ERROR:", text);
            res.json({ answer: "❌ Failed to parse AI analysis into JSON" });
        }

    } catch (err) {
        console.error("SERVER ERROR:", err);
        res.status(500).json({ answer: "❌ Server error" });
    }
});

app.post("/ask", async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.json({ answer: "⚠️ No question provided" });
    }

    try {
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": API_KEY,
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: question }],
                    },
                ],
            }),
        }
        );

        const data = await response.json();

        // 🔍 Debug logs (VERY IMPORTANT)
        console.log("STATUS:", response.status);
        console.log("FULL RESPONSE:", JSON.stringify(data, null, 2));

        // ❌ API ERROR HANDLING
        if (!response.ok) {
            const errorMsg = data.error?.message || "Unknown error";

            // 🧠 Handle quota
            if (errorMsg.toLowerCase().includes("quota")) {
                return res.json({
                    answer: "⚠️ AI is busy right now. Please wait a few seconds and try again.",
                });
            }

            return res.json({
                answer: `❌ API Error: ${errorMsg}`,
            });
        }

        // ✅ SAFE RESPONSE PARSE
        let text = "⚠️ Empty AI response";

        if (
            data.candidates &&
            data.candidates.length > 0 &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts.length > 0
        ) {
            text = data.candidates[0].content.parts[0].text;
        }

        res.json({ answer: text });

    } catch (err) {
        console.error("SERVER ERROR:", err);
        res.status(500).json({ answer: "❌ Server error" });
    }
});

// 🌐 SERVE FRONTEND (In Production)
import fs from "fs";
const possibleDistPath1 = path.join(__dirname, "../dist");
const possibleDistPath2 = path.join(__dirname, "./dist");

const distPath = fs.existsSync(possibleDistPath1) ? possibleDistPath1 : possibleDistPath2;

console.log("📂 Serving frontend from:", distPath);
app.use(express.static(distPath));

app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

// 🚀 START SERVER (PRODUCTION SAFE)
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ AI server running on http://0.0.0.0:${PORT}`);
});