import Lab from "./Lab";
import jsPDF from "jspdf";
import { useState, useEffect } from "react";
import AIChat from "./components/AIChat";
import { askAI } from "./utils/ai";
import IDORLab from "./IDORLab";


import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [subLab, setSubLab] = useState("brute");
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);

  const [userProfile, setUserProfile] = useState({
    attempts: 0,
    successes: 0,
    level: "Beginner",
  });

  useEffect(() => {
    console.log("PROFILE UPDATED:", userProfile);
  }, [userProfile]);

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <div className="w-64 p-6 border-r border-white/10 backdrop-blur-md">
        <h1 className="text-xl font-bold mb-8 text-purple-400">
          CortexSec
        </h1>

        <div className="space-y-4 text-gray-400">
          {[
            ["dashboard", "Dashboard"],
            ["recon", "Recon"],
            ["exploit", "Exploitation"],
            ["labs", "Labs"],
            ["reports", "Reports"],
            ["ai", "AI Assistant"],
          ].map(([key, label]) => (
            <p
              key={key}
              onClick={() => setPage(key)}
              className={`cursor-pointer ${page === key ? "text-purple-400" : ""}`}
            >
              {label}
            </p>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-6">
        {page === "dashboard" && <Dashboard reports={reports} />}
        {page === "recon" && <Page name="Recon Module" />}
        {page === "exploit" && <Page name="Exploitation Module" />}

        {page === "labs" && (
          <div className="space-y-6">

            {/* Tabs */}
            <div className="flex gap-3">
              <button
                onClick={() => setSubLab("brute")}
                className={`px-4 py-2 rounded ${subLab === "brute" ? "bg-purple-500" : "bg-white/10"
                  }`}
              >
                Brute Force
              </button>

              <button
                onClick={() => setSubLab("idor")}
                className={`px-4 py-2 rounded ${subLab === "idor" ? "bg-purple-500" : "bg-white/10"
                  }`}
              >
                IDOR
              </button>
            </div>

            {/* Content */}
            {subLab === "brute" && (
              <Lab
                onSaveReport={(r) => setReports((prev) => [r, ...prev])}
                updateProfile={setUserProfile}
                setLogs={setLogs}
              />
            )}

            {subLab === "idor" && (
              <IDORLab
                onSaveReport={(r) => setReports((prev) => [r, ...prev])}
                setLogs={setLogs}
              />
            )}

          </div>
        )}

        {page === "reports" && (
          <Reports reports={reports} setReports={setReports} />
        )}
        {page === "ai" && <AIChat />}
      </div>
    </div>
  );
}

/* ================= DASHBOARD ================= */

function Dashboard({ reports }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const severityCount = { HIGH: 0, MEDIUM: 0, LOW: 0 };

  reports.forEach((r) => {
    severityCount[r.severity]++;
  });

  const riskScore =
    severityCount.HIGH * 30 +
    severityCount.MEDIUM * 15 +
    severityCount.LOW * 5;
  useEffect(() => {
    let start = 0;
    const end = Math.min(riskScore, 100);

    const interval = setInterval(() => {
      start += 2;
      if (start >= end) {
        start = end;
        clearInterval(interval);
      }
      setAnimatedScore(start);
    }, 20);

    return () => clearInterval(interval);
  }, [riskScore]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide">
            Security Dashboard
          </h1>
          <p className="text-gray-400 text-sm">
            Real-time visibility into threats & risk
          </p>
        </div>
        <div className="text-xs text-gray-400">Last 7 days</div>
      </div>

      {/* 🔴 PRIMARY ROW */}
      <div className="grid grid-cols-3 gap-6">

        {/* Risk */}
        <div className="card p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/10 blur-2xl"></div>

          <p className="text-gray-400 mb-2 z-10">Risk Score</p>

          <div className="risk-glow">
            <RadialBarChart
              width={200}
              height={200}
              innerRadius="70%"
              outerRadius="100%"
              data={[{ value: animatedScore }]}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />

              <RadialBar
                dataKey="value"
                cornerRadius={10}
                fill={
                  animatedScore > 70
                    ? "#ef4444"
                    : animatedScore > 30
                      ? "#eab308"
                      : "#22c55e"
                }
                animationDuration={800}
              />
            </RadialBarChart>
          </div>

          <div className="absolute text-center">
            <h2 className="text-3xl text-red-400 font-bold">
              {animatedScore}
            </h2>
            <p className="text-xs text-gray-400">
              {riskScore > 70 ? "High" : riskScore > 30 ? "Medium" : "Low"}
            </p>
          </div>
        </div>

        {/* Threats */}
        <div className="col-span-2 card p-5 border border-red-500/20">
          <h2 className="text-red-400 mb-3">Active Threats</h2>

          <div className="space-y-3 text-sm">
            <ThreatItem label="Brute-force detected" level="HIGH" />
            <ThreatItem label="Suspicious IP activity" level="MEDIUM" />
            <ThreatItem label="Auth bypass attempt" level="HIGH" />
          </div>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">

        <div className="card p-4">
          <h2 className="text-purple-400 mb-2">Severity</h2>

          <BarChart width={300} height={200} data={[
            { name: "HIGH", value: severityCount.HIGH },
            { name: "MEDIUM", value: severityCount.MEDIUM },
            { name: "LOW", value: severityCount.LOW },
          ]}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#a855f7" />
          </BarChart>
        </div>

        <div className="card p-4">
          <h2 className="text-purple-400 mb-2">Activity</h2>

          <LineChart width={300} height={200} data={[
            { day: "Mon", value: 2 },
            { day: "Tue", value: 4 },
            { day: "Wed", value: 3 },
            { day: "Thu", value: 6 },
            { day: "Fri", value: 5 },
          ]}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#22c55e" />
          </LineChart>
        </div>

      </div>

      {/* Logs + Stats */}
      <div className="grid grid-cols-2 gap-6">

        <div className="card p-5 text-green-400 text-sm" style={{ fontFamily: 'JetBrains Mono' }}>
          <p>$ scanning target...</p>
          <p>$ vulnerability found: SQL Injection</p>
          <p>$ exploit deployed</p>
          <p>$ access granted</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {["Recon", "Exploit", "Creativity", "Score"].map((s, i) => (
            <div key={i} className="card p-4 opacity-80">
              <p className="text-gray-400 text-xs">{s}</p>
              <h3 className="text-lg text-purple-300">
                {Math.floor(Math.random() * 100)}%
              </h3>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

/* Threat Component */
function ThreatItem({ label, level }) {
  const colors = {
    HIGH: "text-red-400 border-red-500/30",
    MEDIUM: "text-yellow-400 border-yellow-500/30",
    LOW: "text-green-400 border-green-500/30",
  };

  return (
    <div className={`flex justify-between items-center p-3 rounded-lg border ${colors[level]}`}>
      <span>{label}</span>
      <span className="text-xs">{level}</span>
    </div>
  );
}

/* ================= GENERIC ================= */

function Page({ name }) {
  return (
    <div className="card p-6">
      <h1 className="text-xl text-purple-400">{name}</h1>
    </div>
  );
}

/* ================= REPORTS ================= */

function Reports({ reports, setReports }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");

  // 🗑 Delete
  const deleteReport = (id) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  // 📄 PDF DOWNLOAD
  const downloadPDF = (r) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("CortexSec Vulnerability Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Type: ${r.vuln}`, 20, 40);
    doc.text(`Severity: ${r.severity}`, 20, 50);
    doc.text(`Endpoint: ${r.endpoint}`, 20, 60);
    doc.text(`Impact: ${r.impact}`, 20, 70);
    doc.text(`Time: ${r.time}`, 20, 80);

    doc.save(`Report_${r.id}.pdf`);
  };

  // 🔍 Search
  let filtered = reports.filter((r) =>
    r.vuln.toLowerCase().includes(search.toLowerCase())
  );

  // 🔽 Sort
  if (sort === "latest") {
    filtered = [...filtered].sort((a, b) => b.id - a.id);
  }

  if (sort === "severity") {
    const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    filtered = [...filtered].sort(
      (a, b) => order[b.severity] - order[a.severity]
    );
  }

  // 🎨 Severity badge
  const getSeverityColor = (severity) => {
    if (severity === "HIGH") return "bg-red-500";
    if (severity === "MEDIUM") return "bg-yellow-400 text-black";
    return "bg-green-500";
  };

  return (
    <div className="space-y-4">

      <h1 className="text-xl text-purple-400">
        Saved Reports
      </h1>

      {/* Controls */}
      <div className="flex gap-3">

        <input
          type="text"
          placeholder="Search vulnerability..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-black border border-gray-700 px-3 py-2 rounded w-full text-white"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-black border border-gray-700 px-3 py-2 rounded"
        >
          <option value="latest">Latest</option>
          <option value="severity">Severity</option>
        </select>

      </div>

      {/* Reports */}
      {filtered.length === 0 && (
        <p className="text-gray-400">No reports found</p>
      )}

      {filtered.map((r) => (
        <div key={r.id} className="card p-4 space-y-2">

          {/* Header */}
          <div className="flex justify-between items-center">
            <p className="font-semibold">{r.vuln}</p>

            <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(r.severity)}`}>
              {r.severity}
            </span>
          </div>

          {/* Details */}
          <p className="text-sm text-gray-400">
            Endpoint: {r.endpoint}
          </p>

          <p className="text-gray-300 text-sm">
            {r.impact}
          </p>

          <p className="text-xs text-gray-500">
            {r.time}
          </p>

          {/* Actions */}
          <div className="flex gap-3 mt-2">

            <button
              onClick={() => downloadPDF(r)}
              className="bg-green-400 text-black px-3 py-1 rounded"
            >
              Download PDF
            </button>

            <button
              onClick={() => deleteReport(r.id)}
              className="bg-red-500 px-3 py-1 rounded"
            >
              Delete
            </button>

          </div>

        </div>
      ))}

    </div>
  );
}