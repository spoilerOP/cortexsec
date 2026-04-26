import { useState, useRef, useEffect } from "react";
import { askAI } from "../utils/ai";
import { Brain, MessageSquare, Shield, Activity, Target } from "lucide-react";

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
            ? logs.slice(0, 10).join("\n")
            : "No recent activity logs.";

        return `
You are CortexSec AI, a context-aware cybersecurity assistant and SOC mentor integrated into the CortexSec platform.

# USER DATA
- Level: ${userProfile.level || "Novice"}
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
   - Novice: Simple, no jargon.
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
        <div className="flex flex-col xl:flex-row h-full xl:h-[80vh] gap-6">

            {/* LEFT PANEL: Quick Actions */}
            <div className="w-full xl:w-72 flex flex-col gap-6">
                <div className="card p-6 flex-1">
                    <div className="flex items-center gap-2 mb-6">
                        <Target size={18} className="text-[#00f2ff]" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-200">Quick Actions</h3>
                    </div>

                    <div className="space-y-3">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(s)}
                                className="w-full text-left text-xs p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-[#00f2ff]/10 hover:border-[#00f2ff]/30 transition-all group"
                            >
                                <span className="text-gray-400 group-hover:text-[#00f2ff] transition-colors">{s}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CENTER PANEL: Chat UI */}
            <div className="flex-1 card flex flex-col overflow-hidden min-h-[500px]">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="glow-dot" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-white">
                            AI Security Assistant
                        </h2>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Neural Link Active</span>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-auto p-6 space-y-6 scrollbar-hide">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`px-5 py-4 rounded-2xl max-w-[85%] border transition-all ${
                                    msg.role === "user"
                                        ? "bg-[#00f2ff]/10 border-[#00f2ff]/30 text-white rounded-tr-none"
                                        : "bg-white/[0.03] border-white/5 text-gray-300 rounded-tl-none"
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">
                                    {msg.text}
                                </p>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white/[0.03] border border-white/5 px-5 py-4 rounded-2xl rounded-tl-none">
                                <p className="text-[#00f2ff] text-xs font-bold animate-pulse flex items-center gap-3">
                                   <Activity size={14} className="animate-spin" />
                                   NEURAL CORE ANALYZING...
                                </p>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input area */}
                <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                    <div className="flex gap-4 p-2 bg-black/40 rounded-2xl border border-white/10 focus-within:border-[#00f2ff]/50 transition-all">
                        <input
                            value={input}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your reports or attacks..."
                            className="flex-1 px-4 bg-transparent outline-none text-sm text-gray-200 placeholder-gray-600"
                        />
                        <button
                            onClick={() => handleSend()}
                            className="bg-[#00f2ff] text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#00f2ff]/80 transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)] active:scale-95"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Context */}
            <div className="w-full xl:w-80 flex flex-col gap-6">
                <div className="card p-6 flex flex-col gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <Shield size={18} className="text-[#10b981]" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-200">Live Context</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <ContextItem label="User Level" value={userProfile.level || "Novice"} color="#00f2ff" />
                            <ContextItem label="Total Reports" value={reports.length} color="#ef4444" />
                            <ContextItem label="Success Rate" 
                                value={userProfile.attempts > 0 ? `${Math.round((userProfile.successes / userProfile.attempts) * 100)}%` : "0%"} 
                                color="#10b981" 
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-6 pt-6 border-t border-white/5">
                            <Brain size={18} className="text-[#00f2ff]" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-200">Key Findings</h3>
                        </div>

                        <div className="space-y-3">
                            {reports.length > 0 ? reports.slice(0, 3).map((r, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                    <p className="text-[10px] font-black text-[#00f2ff] uppercase tracking-widest mb-1">{r.vuln}</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">{r.severity}</p>
                                </div>
                            )) : (
                                <p className="text-xs text-gray-600 italic">No vulnerabilities found yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

function ContextItem({ label, value, color }) {
    return (
        <div>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">{label}</p>
            <p className="text-lg font-black italic tracking-tighter" style={{ color }}>{value}</p>
        </div>
    );
}