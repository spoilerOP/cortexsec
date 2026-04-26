import { useState } from "react";
import { askAI } from "./utils/ai";

const fakeDB = {
    1001: { name: "employee", email: "employee@gmail.com" },
    1002: { name: "Admin", email: "admin@company.com" },
    1003: { name: "User", email: "user@test.com" },
};

export default function IDORLab({ onSaveReport, setLogs: setGlobalLogs }) {
    const [userId, setUserId] = useState("1001");
    const [response, setResponse] = useState("");
    const [logs, setLogs] = useState([]);

    const currentUser = "1001"; // logged-in user

    const fetchData = async () => {
        let status = "FAIL";
        let res = "403 Forbidden";

        if (fakeDB[userId]) {
            // 🚨 IDOR: no authorization check
            status = "SUCCESS";
            res = JSON.stringify(fakeDB[userId], null, 2);

            // 🔥 If accessing other user → vulnerability
            if (userId !== currentUser) {

                // 🤖 AI Explanation
                let explanation = "IDOR vulnerability detected";

                try {
                    explanation = await askAI(`
You are a cybersecurity tutor.

Explain this vulnerability:

- Type: IDOR (Broken Access Control)
- Scenario: User accessed another user's data by changing ID

Keep it short and simple.
Explain why this is dangerous and how to fix it.
`);
                } catch (e) {
                    explanation = "AI explanation failed";
                }

                const report = {
                    id: Date.now(),
                    vuln: "IDOR (Broken Access Control)",
                    severity: "HIGH",
                    endpoint: `/api/user?id=${userId}`,
                    impact: "Unauthorized access to other user data",
                    time: new Date().toLocaleString(),
                    explanation, // 🔥 NEW
                };

                if (onSaveReport) onSaveReport(report);

                alert("🚨 IDOR vulnerability found!");
            }
        }

        setResponse(res);

        const logEntry = `${status} → accessed user ${userId}`;

        setLogs((prev) => [logEntry, ...prev]);

        if (setGlobalLogs) {
            setGlobalLogs((prev) => [logEntry, ...prev]);
        }
    };

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl text-purple-400">
                    IDOR Lab
                </h1>
                <p className="text-gray-400 text-sm">
                    Test insecure direct object reference vulnerability
                </p>
            </div>

            {/* Input */}
            <div className="card p-4">
                <h2 className="text-gray-300 mb-2">Request</h2>

                <div className="flex gap-3 items-center">
                    <input
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="bg-black/60 border border-white/10 p-2 rounded text-white"
                        placeholder="Enter user ID"
                    />

                    <button
                        onClick={fetchData}
                        className="bg-purple-500 px-4 py-2 rounded"
                    >
                        Fetch Data
                    </button>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                    Try changing user ID (1001 → 1002)
                </p>
            </div>

            {/* Response */}
            <div className="card p-4">
                <h2 className="text-gray-300 mb-2">Response</h2>

                <pre className="text-green-400 bg-black/60 p-3 rounded">
                    {response || "No response yet..."}
                </pre>
            </div>

            {/* Logs */}
            <div className="card p-4 h-40 overflow-auto font-mono">
                <h2 className="text-gray-300 mb-2">Logs</h2>

                {logs.length === 0 ? (
                    <p className="text-gray-500">No logs yet...</p>
                ) : (
                    logs.map((l, i) => (
                        <p key={i} className="text-yellow-400">
                            {l}
                        </p>
                    ))
                )}
            </div>

        </div>
    );
}