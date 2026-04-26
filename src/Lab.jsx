import { useState, useRef } from "react";
import { analyzeAttack } from "./utils/ai";

export default function Lab({ onSaveReport, setLogs: setGlobalLogs, updateProfile }) {
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        if (logs.length === 0) return;
        setAnalyzing(true);
        const result = await analyzeAttack(logs, "brute-force");
        if (result && !result.answer) {
            setAnalysis(result);
            if (onSaveReport) {
                onSaveReport({
                    id: Date.now(),
                    vuln: result.vulnerability,
                    severity: result.severity,
                    endpoint: "/login",
                    impact: result.impact,
                    time: new Date().toLocaleString(),
                });
            }
        }
        setAnalyzing(false);
    };
    const [request, setRequest] = useState(`POST /login HTTP/1.1
Host: target.com
Content-Type: application/json

{"username":"admin","password":"§password§"}`);

    const [response, setResponse] = useState("");
    const [logs, setLogs] = useState([]);
    const [running, setRunning] = useState(false);

    const [progress, setProgress] = useState(0);
    const [probability, setProbability] = useState(0);
    const [found, setFound] = useState(false);

    const foundRef = useRef(false);
    const intervalRef = useRef(null);

    const [payloadInput, setPayloadInput] = useState(
        "1234\npassword\nadmin\nadmin123\nroot"
    );

    const correctPassword = "admin123";

    // 🧠 Probability
    const calculateProbability = (logs, index, total, isSuccess) => {
        if (isSuccess) return 100;

        const attempts = index + 1;
        const failCount = logs.filter((l) => l.includes("FAIL")).length;

        let score =
            (attempts / total) * 50 +
            (failCount / Math.max(attempts, 1)) * 50;

        score += Math.random() * 3;

        return Math.min(Math.floor(score), 95);
    };

    // 🔐 Send request
    const sendRequest = (payload, index = 0, total = 1) => {
        if (foundRef.current) return;

        const req = request.replace("§password§", payload);

        const password =
            req.match(/"password":"(.*?)"/)?.[1] || "";

        const isSuccess = password === correctPassword;

        const status = isSuccess ? "SUCCESS" : "FAIL";
        const res = isSuccess
            ? "HTTP/1.1 200 OK\n\nWelcome admin"
            : "HTTP/1.1 401 Unauthorized\n\nInvalid credentials";

        // ✅ determine success FIRST
        let didSuccess = false;
        if (isSuccess && !foundRef.current) {
            foundRef.current = true;
            didSuccess = true;
        }

        // ✅ SAFE PROFILE UPDATE (no side effects inside)
        if (updateProfile) {
            updateProfile((prev) => {
                const attempts = prev.attempts + 1;

                let successes = prev.successes;
                let level = prev.level;

                if (didSuccess) {
                    successes = prev.successes + 1;

                    if (successes >= 2) level = "Advanced";
                    else if (successes >= 1) level = "Intermediate";
                    else level = "Beginner";
                }

                return {
                    ...prev,
                    attempts,
                    successes,
                    level,
                };
            });
        }

        // ✅ SIDE EFFECTS (outside state update)
        if (didSuccess) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setFound(true);

            if (onSaveReport) {
                onSaveReport({
                    id: Date.now(),
                    vuln: "No Rate Limiting",
                    severity: "HIGH",
                    endpoint: "/login",
                    impact: "Brute-force possible",
                    time: new Date().toLocaleString(),
                });
            }
        }

        // 📊 Progress
        const prog = Math.floor(((index + 1) / total) * 100);
        setProgress(prog);

        // 🎯 Probability
        const prob = calculateProbability(logs, index, total, isSuccess);
        setProbability(prob);

        // ❗ prevent overwrite after success
        if (!foundRef.current || isSuccess) {
            setResponse(res);
        }

        const newLog = `${status} → admin:${password}`;

        setLogs((prev) => [newLog, ...prev]);

        if (setGlobalLogs) {
            setGlobalLogs((prev) => [newLog, ...prev]);
        }
    };

    // 🚀 Start attack
    const startAttack = () => {
        if (running) return;

        setRunning(true);
        setProgress(0);
        setProbability(0);
        setFound(false);
        foundRef.current = false;

        const payloads = payloadInput.split("\n");
        let i = 0;

        intervalRef.current = setInterval(() => {
            if (i >= payloads.length || foundRef.current) {
                clearInterval(intervalRef.current);
                setRunning(false);
                return;
            }

            sendRequest(payloads[i], i, payloads.length);
            i++;
        }, 400);
    };

    const stopAttack = () => {
        clearInterval(intervalRef.current);
        setRunning(false);
    };

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-semibold text-purple-400">
                    Intruder Lab
                </h1>
                <p className="text-gray-400 text-sm">
                    Simulate brute-force attack (No Rate Limiting)
                </p>
            </div>

            {/* Progress */}
            <div className="card p-4">
                <p className="text-gray-400 text-sm mb-2">Attack Progress</p>
                <div className="w-full bg-black/40 rounded h-3 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-xs text-gray-400 mt-1">{progress}%</p>
            </div>

            {/* Probability */}
            <div className="card p-4">
                <p className="text-gray-400 text-sm mb-2">Success Probability</p>
                <div className="text-3xl font-bold">
                    <span className={
                        probability > 70
                            ? "text-red-400"
                            : probability > 40
                                ? "text-yellow-400"
                                : "text-green-400"
                    }>
                        {probability}%
                    </span>
                </div>
            </div>

            {/* Main */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="card p-4">
                    <h2 className="text-gray-300 mb-2">Request</h2>
                    <textarea
                        className="w-full h-48 md:h-64 bg-black/60 text-green-400 font-mono p-3 rounded text-sm"
                        value={request}
                        onChange={(e) => setRequest(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                        <button onClick={() => sendRequest("test", 0, 1)} className="bg-green-400 text-black px-4 py-2 rounded text-sm font-medium">
                            Send
                        </button>
                        <button onClick={startAttack} className="bg-yellow-400 text-black px-4 py-2 rounded text-sm font-medium">
                            Start Attack
                        </button>
                        <button onClick={stopAttack} className="bg-red-500 text-white px-4 py-2 rounded text-sm font-medium">
                            Stop
                        </button>
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing || logs.length === 0}
                            className="bg-purple-600 px-4 py-2 rounded flex items-center gap-2 hover:bg-purple-700 transition disabled:opacity-50 text-sm font-medium"
                        >
                            {analyzing ? "⌛ Analyzing..." : "🧠 Analyze Attack"}
                        </button>
                    </div>
                </div>

                <div className="card p-4">
                    <h2 className="text-gray-300 mb-2">Response</h2>
                    <pre className="text-blue-400 h-48 md:h-64 overflow-auto text-sm font-mono bg-black/40 p-3 rounded">
                        {response || "No response yet..."}
                    </pre>
                </div>
            </div>

            {/* Logs */}
            <div className="card p-4 h-48 overflow-auto font-mono">
                <h2 className="text-gray-300 mb-2">Live Logs</h2>

                {logs.length === 0 ? (
                    <p className="text-gray-500">No logs yet...</p>
                ) : (
                    logs.map((l, i) => {
                        const isSuccess = l.includes("SUCCESS");
                        return (
                            <div key={i} className={`flex justify-between text-sm ${isSuccess ? "text-green-400" : "text-red-400"}`}>
                                <span>{l}</span>
                                <span>{isSuccess ? "✔" : "✖"}</span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* AI Analysis Result */}
            {analysis && (
                <div className={`card p-6 border-t-4 transition-all duration-500 mt-6 ${analysis.severity === "HIGH"
                        ? "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                        : analysis.severity === "MEDIUM"
                            ? "border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                            : "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                    }`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">
                                {analysis.vulnerability}
                            </h2>
                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${analysis.severity === "HIGH"
                                    ? "bg-red-500 text-white"
                                    : analysis.severity === "MEDIUM"
                                        ? "bg-yellow-500 text-black"
                                        : "bg-green-500 text-white"
                                }`}>
                                {analysis.severity}
                            </span>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg backdrop-blur-md">
                            🧠 AI Security Scan
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-purple-400 mb-1">Analysis</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {analysis.analysis}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-purple-400 mb-1">Impact</h3>
                            <p className="text-gray-300 text-sm">
                                {analysis.impact}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-purple-400 mb-2">Recommended Fixes</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {analysis.fix && analysis.fix.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 p-2 rounded border border-white/5">
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}