export async function askAI(question) {
    const res = await fetch("https://cortexsec-server.onrender.com/ask", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
    });
    const data = await res.json();
    return data.answer;
}