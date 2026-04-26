import { useState, useRef, useEffect } from "react";
import { askAI } from "../utils/ai";

export default function AIChat({ reports = [], logs = [], userProfile = {} }) {
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

    // 🧠 System Prompt Generator
    const generatePrompt = (q) => {
        const reportsSummary = reports.length > 0
            ? reports.map(r => `- ${r.vuln} (${r.severity}): ${r.impact}`).join("\n")
            : "No vulnerabilities found yet.";

        const logsSummary = logs.length > 0
            ? logs.slice(0, 10).map(l => `- ${l.time}: ${l.message}`).join("\n")
            : "No recent activity logs.";

        return `
You are CortexSec AI, a context-aware cybersecurity assistant and SOC mentor integrated into the CortexSec platform.

# USER DATA
- Level: ${userProfile.level || "Beginner"}
- Lab Successes: ${userProfile.successes || 0}
- Lab Attempts: ${userProfile.attempts || 0}

# ACTIVE REPORTS
${reportsSummary}

# RECENT ACTIVITY LOGS
${logsSummary}

# BEHAVIOR RULES
1. Understand and use the above reports/logs to answer questions.
2. If the user asks about reports, count them and list them with severity and impact.
3. If no reports exist, say: "No vulnerabilities found yet. Try running a lab to generate reports."
4. Personalize explanations based on Level:
   - Beginner: Simple, no jargon.
   - Intermediate: Moderate detail, technical terms.
   - Advanced: In-depth technical explanation (rate limiting, access control, auth bypass).
5. If asked "why did this work?" or "how to fix?", analyze the logs/reports and give practical fixes (e.g., rate limiting, account lockout).
6. Act like a real SOC assistant/mentor, not a generic chatbot. Be clear and structured.

User: ${q}
`;
    };

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
                { role: "ai", text: "⚠️ AI is busy right now. Please try again in a moment." },
            ]);
        }

        setLoading(false);
    };

    const suggestions = [
        "How many reports are there?",
        "Why did the attack work?",
        "How to fix these vulnerabilities?",
        "Explain my activity logs",
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

                <h2 className="text-purple-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    AI Security Assistant
                </h2>

                <div className="flex-1 overflow-auto space-y-3 pr-2 scrollbar-thin">

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === "user"
                                ? "justify-end"
                                : "justify-start"
                                }`}
                        >
                            <div
                                className={`px-4 py-3 rounded-2xl max-w-[85%] shadow-sm ${msg.role === "user"
                                    ? "bg-purple-600 text-white rounded-tr-none"
                                    : "bg-white/10 text-gray-200 border border-white/5 rounded-tl-none"
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                    {msg.text}
                                </p>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white/10 px-4 py-2 rounded-xl rounded-tl-none border border-white/5">
                                <p className="text-gray-400 text-sm animate-pulse flex items-center gap-2">
                                    🤖 Analyzing security data...
                                </p>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* INPUT */}
                <div className="flex gap-2 mt-3 border-t border-white/10 pt-4">
                    <input
                        value={input}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your reports or attacks..."
                        className="flex-1 p-3 bg-black/40 rounded-xl border border-white/10 focus:border-purple-500 outline-none transition"
                    />

                    <button
                        onClick={() => handleSend()}
                        className="bg-purple-500 px-6 rounded-xl font-medium hover:bg-purple-600 transition shadow-lg shadow-purple-500/20"
                    >
                        Send
                    </button>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="w-64 card p-4 space-y-3">

                <h3 className="text-purple-400 font-semibold border-b border-white/10 pb-2">
                    Live Context
                </h3>

                <div className="text-sm text-gray-300 space-y-3">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">User Level</p>
                        <p className="font-medium text-purple-300">{userProfile.level || "Beginner"}</p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Reports</p>
                        <p className="font-medium text-red-400">{reports.length}</p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Success Rate</p>
                        <p className="font-medium text-green-400">
                            {userProfile.attempts > 0
                                ? Math.round((userProfile.successes / userProfile.attempts) * 100)
                                : 0}%
                        </p>
                    </div>
                </div>

                <h3 className="text-purple-400 font-semibold border-b border-white/10 pb-2 mt-6">
                    Key Findings
                </h3>

                <div className="space-y-2">
                    {reports.length > 0 ? reports.slice(0, 3).map((r, i) => (
                        <div key={i} className="text-xs bg-white/5 p-2 rounded border border-white/5">
                            <p className="text-purple-300 font-medium truncate">{r.vuln}</p>
                            <p className="text-gray-500">{r.severity}</p>
                        </div>
                    )) : (
                        <p className="text-xs text-gray-500 italic">No vulnerabilities found yet.</p>
                    )}
                </div>

            </div>

        </div>
    );
}