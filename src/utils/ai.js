export async function askAI(question) {
    try {
        const res = await fetch("http://localhost:5000/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ question }),
        });
        const data = await res.json();
        
        if (data.answer && data.answer.toLowerCase().includes("quota")) {
            return "⚠️ AI rate limit exceeded. Please try again later.";
        }
        
        return data.answer;
    } catch (error) {
        console.error("AI API Error:", error);
        return "❌ Error communicating with AI server. Make sure your local server is running on port 5000.";
    }
}

export async function analyzeAttack(logs, labType) {
    try {
        const res = await fetch("http://localhost:5000/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ logs, labType }),
        });
        return await res.json();
    } catch (error) {
        console.error("Analysis Error:", error);
        return { answer: "❌ Error connecting to analysis server" };
    }
}