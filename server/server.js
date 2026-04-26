import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 API KEY (from .env)
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ Missing GEMINI_API_KEY in .env");
    process.exit(1);
}

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
            return res.json({
                answer: `❌ API Error: ${data.error?.message || "Unknown error"}`,
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

// 🚀 START SERVER (PRODUCTION SAFE)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ AI server running on port ${PORT}`);
});