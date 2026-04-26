import { useState, useRef, useEffect } from "react";
import { askAI } from "../utils/ai";

export default function AIChat() {
    const [messages, setMessages] = useState([
        {
            role: "ai",
            text: "👋 Welcome to CortexSec AI. Ask anything or use quick actions.",
        },
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 🧠 Prompt
    const generatePrompt = (q) => `
You are a cybersecurity tutor inside a lab.

Context:
- Lab: brute-force
- Vulnerability: no rate limiting
- User level: beginner

Rules:
- Keep short (3-5 lines)
- Be practical
- Relate to lab

User: ${q}
`;

    const handleSend = async (customText = null) => {
        const text = customText || input;
        if (!text.trim()) return;

        setMessages((prev) => [...prev, { role: "user", text }]);
        setInput("");
        setLoading(true);

        try {
            const res = await askAI(generatePrompt(text));
            setMessages((prev) => [...prev, { role: "ai", text: res }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "ai", text: "❌ AI failed" },
            ]);
        }

        setLoading(false);
    };

    const suggestions = [
        "Explain this attack",
        "Suggest payloads",
        "Why did it work?",
        "How to fix it?",
    ];

    return (
        <div className="flex h-[90vh] gap-4">

            {/* LEFT PANEL */}
            <div className="w-60 card p-4 space-y-3">
                <h3 className="text-purple-400">Quick Actions</h3>

                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => handleSend(s)}
                        className="w-full text-left text-sm p-2 bg-white/10 rounded hover:bg-purple-500 transition"
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* CENTER CHAT */}
            <div className="flex-1 card flex flex-col p-4">

                <h2 className="text-purple-400 mb-3">
                    AI Security Assistant
                </h2>

                <div className="flex-1 overflow-auto space-y-3">

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                        >
                            <div
                                className={`px-3 py-2 rounded-xl max-w-[70%] ${msg.role === "user"
                                        ? "bg-purple-500 text-white"
                                        : "bg-white/10 text-gray-300"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <p className="text-gray-400 animate-pulse">
                            🤖 Thinking...
                        </p>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* INPUT */}
                <div className="flex gap-2 mt-3 border-t border-white/10 pt-3">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        className="flex-1 p-2 bg-black/60 rounded border border-white/10"
                    />

                    <button
                        onClick={() => handleSend()}
                        className="bg-purple-500 px-4 rounded"
                    >
                        Send
                    </button>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="w-64 card p-4 space-y-3">

                <h3 className="text-purple-400">Context</h3>

                <div className="text-sm text-gray-300 space-y-2">
                    <p>Lab: Brute-force</p>
                    <p>Vulnerability: No Rate Limiting</p>
                    <p>Difficulty: Beginner</p>
                </div>

                <h3 className="text-purple-400 mt-4">Tips</h3>

                <div className="text-xs text-gray-400 space-y-1">
                    <p>• Try common passwords</p>
                    <p>• Observe response codes</p>
                    <p>• Use automation</p>
                </div>

            </div>

        </div>
    );
}