export async function askAI(question) {
    const res = await fetch("https://cortexsec-server.onrender.com/ask")
    const data = await res.json();
    return data.answer;
}