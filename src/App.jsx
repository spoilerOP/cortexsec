import Lab from "./Lab";
import jsPDF from "jspdf";
import { useState, useEffect } from "react";
import AIChat from "./components/AIChat";
import { askAI, getReports, saveReport, deleteRemoteReport } from "./utils/ai";
import IDORLab from "./IDORLab";
import { Radar, Bomb, Brain, Trophy, Menu, X, MessageSquare } from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [subLab, setSubLab] = useState("brute");
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [userProfile, setUserProfile] = useState({
    attempts: 0,
    successes: 0,
    level: "Novice",
  });

  useEffect(() => {
    // 📥 Load reports from backend
    getReports().then(data => {
      setReports(data);
    });
  }, []);

  const handleSaveReport = async (report) => {
    const saved = await saveReport(report);
    setReports((prev) => [saved, ...prev]);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div>
           <h1 className="text-xl font-bold tracking-tighter text-white">CORTEX<span className="text-[#00f2ff]">SEC</span></h1>
           <p className="text-[10px] text-[#00f2ff]/60 tracking-widest uppercase">Neural Defense System</p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 w-64 p-6 border-r border-white/5 bg-black/10 backdrop-blur-2xl z-50 transform transition-transform duration-300 flex flex-col
        md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mb-12">
          <h1 className="text-2xl font-extrabold tracking-tighter text-white">CORTEX<span className="text-[#00f2ff] drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]">SEC</span></h1>
          <p className="text-[10px] text-[#00f2ff]/60 tracking-widest uppercase font-bold">Neural Defense System</p>
        </div>

        <nav className="flex-1 space-y-2 text-sm font-semibold">
          {[
            ["dashboard", "Dashboard", <Radar size={18} />],
            ["labs", "Labs", <Bomb size={18} />],
            ["ai", "AI Assistant", <Brain size={18} />],
            ["reports", "Reports", <MessageSquare size={18} />],
            ["leaderboard", "Leaderboard", <Trophy size={18} />],
          ].map(([key, label, icon]) => (
            <div
              key={key}
              onClick={() => {
                setPage(key);
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-lg transition-all duration-200 ${
                page === key 
                ? "active-nav text-[#00f2ff]" 
                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              {icon}
              {label}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="pt-6 border-t border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#10b981] p-0.5">
             <div className="w-full h-full bg-[#10b981]/20 rounded-full flex items-center justify-center">
                <span className="text-[#10b981] text-xs font-bold">GU</span>
             </div>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Guest_User</p>
            <p className="text-[10px] text-[#10b981] font-bold uppercase tracking-wider">Rank: {userProfile.level}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-10 overflow-x-hidden">
        {page === "dashboard" && <Dashboard reports={reports} logs={logs} />}
        {page === "labs" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold tracking-tight">ACTIVE <span className="text-[#00f2ff]">MISSIONS</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="card p-6 group cursor-pointer relative overflow-hidden" onClick={() => setSubLab("brute")}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start mb-4 relative z-10">
                     <span className="text-[10px] bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded font-bold uppercase tracking-widest">Easy</span>
                     <span className="text-xs text-gray-500 font-bold">100 PTS</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#00f2ff] transition-colors relative z-10">Login Bypass</h3>
                  <p className="text-sm text-gray-400 relative z-10">Identify and exploit rate limiting flaws in authentication systems.</p>
               </div>
               <div className="card p-6 group cursor-pointer relative overflow-hidden" onClick={() => setSubLab("idor")}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start mb-4 relative z-10">
                     <span className="text-[10px] bg-[#3b82f6]/10 text-[#3b82f6] px-2 py-0.5 rounded font-bold uppercase tracking-widest">Medium</span>
                     <span className="text-xs text-gray-500 font-bold">250 PTS</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#00f2ff] transition-colors relative z-10">IDOR API</h3>
                  <p className="text-sm text-gray-400 relative z-10">Exploit insecure direct object references to access unauthorized data.</p>
               </div>
            </div>

            <div className="mt-12">
               {subLab === "brute" && (
                 <Lab
                   onSaveReport={handleSaveReport}
                   updateProfile={setUserProfile}
                   setLogs={setLogs}
                 />
               )}
               {subLab === "idor" && (
                 <IDORLab
                   onSaveReport={handleSaveReport}
                   setLogs={setLogs}
                 />
               )}
            </div>
          </div>
        )}

        {page === "reports" && (
          <Reports reports={reports} setReports={setReports} />
        )}

        {page === "ai" && (
          <AIChat 
            reports={reports} 
            logs={logs} 
            userProfile={userProfile} 
          />
        )}
      </div>
    </div>
  );
}

/* ================= DASHBOARD ================= */

function Dashboard({ reports, logs }) {
  const severityCount = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  reports.forEach((r) => {
    severityCount[r.severity]++;
  });

  // 🧠 Dynamic Calculations
  const stats = {
    recon: Math.min(Math.round((reports.length / 5) * 100), 100),
    exploit: Math.min(Math.round((severityCount.HIGH / 3) * 100), 100),
    creativity: Math.min(reports.length * 20, 100),
    score: reports.length * 250,
  };

  const skillData = [
    { name: "Week 1", value: 40 },
    { name: "Week 2", value: 55 },
    { name: "Week 3", value: 48 },
    { name: "Week 4", value: 72 },
    { name: "Week 5", value: 65 },
    { name: "Week 6", value: 85 },
  ];

  return (
    <div className="space-y-10">

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Recon" value={`${stats.recon}%`} percentage={stats.recon} color="#00f2ff" />
        <StatCard label="Exploit" value={`${stats.exploit}%`} percentage={stats.exploit} color="#ef4444" />
        <StatCard label="Creativity" value={`${stats.creativity}%`} percentage={stats.creativity} color="#eab308" />
        <StatCard label="Score" value={stats.score} percentage={Math.min(stats.score/20, 100)} color="#10b981" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Performance Chart */}
        <div className="xl:col-span-2 card p-8">
           <div className="flex justify-between items-start mb-8">
              <div>
                 <h2 className="text-xl font-black italic uppercase tracking-tighter">Performance</h2>
                 <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Skill Growth - Last 30 Days</p>
              </div>
              <div className="text-right">
                 <p className="bg-gradient-to-r from-[#10b981] to-[#00f2ff] bg-clip-text text-transparent font-black text-2xl">+12.4%</p>
                 <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">System Efficiency</p>
              </div>
           </div>

           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={skillData}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(2, 4, 8, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#0a0c10' }} 
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                 </LineChart>
              </ResponsiveContainer>
           </div>
           
           <div className="flex justify-between mt-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest px-2">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
           </div>
        </div>

        {/* AI Insights */}
        <div className="card p-8 flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
                    <Brain size={18} className="text-[#10b981]" />
                 </div>
                 <h2 className="text-lg font-black uppercase tracking-tight">AI Insights</h2>
              </div>
              <span className="text-[10px] bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded font-bold uppercase tracking-widest">Neural Core Active</span>
           </div>

           <div className="flex-1 space-y-4">
              <InsightItem icon={<Bomb size={14} />} text="Frequent brute-force attempts detected. Efficiency low." color="#ef4444" />
              <InsightItem icon={<Radar size={14} />} text="Strong reconnaissance pattern observed in Lab #4." color="#00f2ff" />
              <InsightItem icon={<Trophy size={14} />} text="Missing business logic flaws in current target." color="#3b82f6" />
           </div>

           <button className="mt-8 w-full py-3 border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:border-white/20 transition-all">
              Generate New Analysis
           </button>
        </div>

      </div>

      {/* Lower Row: Terminal & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2">
            <Terminal logs={logs} />
         </div>
         <div className="card p-8">
            <h2 className="text-lg font-black uppercase tracking-tight mb-6">Recent Activity</h2>
            <div className="space-y-4">
               {reports.slice(0, 3).map((r, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5">
                     <div className="glow-dot" style={{ backgroundColor: r.severity === 'HIGH' ? '#ef4444' : '#10b981' }} />
                     <div>
                        <p className="text-xs font-bold text-white">{r.vuln}</p>
                        <p className="text-[10px] text-gray-500">{r.time}</p>
                     </div>
                  </div>
               ))}
               {reports.length === 0 && <p className="text-sm text-gray-600 italic">No activity recorded yet.</p>}
            </div>
         </div>
      </div>

    </div>
  );
}

function StatCard({ label, value, color, percentage = 0 }) {
  return (
    <div className="card p-6 flex flex-col items-center justify-center text-center group relative overflow-hidden">
       {/* 🎨 Interior Light Gradient */}
       <div 
         className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"
         style={{ background: `linear-gradient(135deg, ${color}, transparent)` }}
       />

       <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1 z-10">{label}</p>
       <p className="text-3xl font-black italic tracking-tighter transition-all duration-300 group-hover:scale-110 z-10" 
          style={{ 
            color: color,
            textShadow: `0 0 20px ${color}44`
          }}>{value}</p>
       
       {/* 📊 Progress Meter */}
       <div className="w-full h-1.5 bg-white/5 mt-4 rounded-full overflow-hidden relative z-10">
          <div 
            className="h-full transition-all duration-1000 ease-out" 
            style={{ 
              width: `${percentage}%`, 
              background: `linear-gradient(90deg, ${color}, ${color}88)`,
              boxShadow: `0 0 15px ${color}`
            }} 
          />
       </div>

       {/* Background Glow */}
       <div 
         className="absolute -bottom-4 -right-4 w-16 h-16 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity" 
         style={{ backgroundColor: color }} 
       />
    </div>
  );
}

function InsightItem({ icon, text, color }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors group">
       <div className="mt-1 p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-white transition-colors" style={{ color: color + '44' }}>
          {icon}
       </div>
       <p className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-200 transition-colors">{text}</p>
    </div>
  );
}

function Terminal({ logs }) {
  const displayLogs = logs.length > 0 ? logs : [
    "Initializing neural scan engine...",
    "Mapping attack surface...",
    "Waiting for input..."
  ];

  return (
    <div className="terminal-window rounded-xl overflow-hidden shadow-2xl h-full flex flex-col min-h-[300px]">
       <div className="terminal-header px-4 py-2 flex items-center justify-between">
          <div className="flex gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
             <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
             <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
          </div>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">bash — cortex_scan.sh</p>
          <div className="w-10" />
       </div>
       <div className="p-6 flex-1 text-sm text-[#10b981] font-mono space-y-1 overflow-auto max-h-[300px]">
          <p className="text-white mb-2"><span className="text-[#10b981]">root@cortex</span>:<span className="text-[#3b82f6]">~</span>$ ./cortex_scan.sh --target internal_api_v2</p>
          {displayLogs.map((log, i) => (
             <p key={i} className="opacity-80"><span className="opacity-40">[INFO]</span> {log}</p>
          ))}
          <p className="animate-pulse">_</p>
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
  const deleteReport = async (id) => {
    await deleteRemoteReport(id);
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
      <div className="flex flex-col sm:flex-row gap-3">

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