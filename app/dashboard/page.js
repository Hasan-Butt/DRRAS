"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const d = stats?.disasters || {};
  const r = stats?.resources  || {};
  const q = stats?.requests   || {};
  const sev = stats?.severityDistribution || [];
  const maxCount = Math.max(...sev.map((s) => s.cnt), 1);
  const deployedPct = r.total ? Math.round((r.deployed / r.total) * 100) : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f9fb]">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-y-auto">
        <Topbar />
        <main className="flex-1 px-6 md:px-8 py-8 space-y-8">

          {/* Header */}
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#00bcd4] pulse-dot inline-block"></span>
                <span className="text-xs font-semibold tracking-wider text-[#434655] uppercase">Live Telemetry Active</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-[#191c1e]">Global Overview</h1>
              <p className="text-sm text-[#434655] mt-1">Last updated: Just now</p>
            </div>
            <Link
              href="/disasters"
              className="bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold shadow-ambient hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Incident
            </Link>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Active Disasters — wide card */}
            <div className="col-span-1 md:col-span-2 bg-white rounded-xl p-6 shadow-ambient flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#ba1a1a]/5 rounded-full blur-3xl pointer-events-none"></div>
              <div>
                <h3 className="text-xs font-semibold text-[#434655] uppercase tracking-widest mb-1">Active Disasters</h3>
                <div className="text-5xl font-black text-[#ba1a1a] mb-2">
                  {loading ? "—" : (d.active ?? 0)}
                </div>
                <div className="flex items-center gap-1 text-sm text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>Live count from database</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 bg-[#ba1a1a]/10 text-[#ba1a1a] rounded-full text-xs font-bold">
                  {loading ? "—" : d.critical ?? 0} Critical
                </span>
                <span className="px-3 py-1 bg-[#004ac6]/10 text-[#004ac6] rounded-full text-xs font-bold">
                  {loading ? "—" : d.high ?? 0} High
                </span>
              </div>
            </div>

            {/* Total Resources */}
            <div className="bg-white rounded-xl p-6 shadow-ambient flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-[#434655] uppercase tracking-widest mb-1">Total Resources</h3>
                <div className="text-4xl font-black text-[#191c1e]">
                  {loading ? "—" : (r.total ?? 0).toLocaleString()}
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-[#e6e8ea] h-2 rounded-full">
                  <div className="bg-[#004ac6] h-2 rounded-full transition-all duration-700" style={{ width: `${deployedPct}%` }}></div>
                </div>
                <p className="text-xs text-[#434655] mt-1 text-right">{deployedPct}% Deployed</p>
              </div>
            </div>

            {/* Pending Requests */}
            <div className="bg-white rounded-xl p-6 shadow-ambient flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-[#434655] uppercase tracking-widest mb-1">Pending Requests</h3>
                <div className="text-4xl font-black text-[#191c1e]">
                  {loading ? "—" : (q.pending ?? 0)}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#434655] mt-4">
                <span className="material-symbols-outlined text-[16px] text-[#00687a]">schedule</span>
                <span>Awaiting approval</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Severity Bar Chart */}
            <div className="col-span-1 md:col-span-2 bg-white rounded-xl p-6 shadow-ambient">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-[#191c1e]">Disaster Severity Distribution</h2>
                <Link href="/disasters" className="text-[#004ac6] text-sm font-semibold hover:bg-[#004ac6]/10 px-3 py-1 rounded-full transition-colors">
                  Details →
                </Link>
              </div>
              <div className="h-52 flex items-end gap-4 border-b border-[#c3c6d7]/30 pb-1">
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const row = sev.find((s) => s.SeverityLevel === lvl);
                  const cnt = row?.cnt || 0;
                  const pct = Math.round((cnt / maxCount) * 100) || 8;
                  const isHigh = lvl >= 4;
                  return (
                    <div key={lvl} className="flex-1 flex flex-col items-center group">
                      <span className="text-xs text-[#434655] mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{cnt}</span>
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 ${isHigh ? "bg-[#ba1a1a]/70 group-hover:bg-[#ba1a1a]" : "bg-[#004ac6]/30 group-hover:bg-[#004ac6]/60"}`}
                        style={{ height: `${pct}%` }}
                      ></div>
                      <span className="text-xs font-semibold mt-2 text-[#434655]">L{lvl}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resource Donut */}
            <div className="bg-white rounded-xl p-6 shadow-ambient">
              <h2 className="text-lg font-bold text-[#191c1e] mb-4">Resource Allocation</h2>
              <div className="flex justify-center items-center h-40">
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e6e8ea" strokeWidth="3.8" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#004ac6" strokeWidth="3.8"
                      strokeDasharray={`${deployedPct} ${100 - deployedPct}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-[#191c1e]">{deployedPct}%</span>
                    <span className="text-xs text-[#434655]">deployed</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                {[
                  { label: "Deployed",  color: "#004ac6", val: r.deployed ?? 0 },
                  { label: "Available", color: "#e6e8ea", val: r.available ?? 0 },
                ].map(({ label, color, val }) => (
                  <div key={label} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: color }}></span>
                      <span className="text-[#434655]">{label}</span>
                    </div>
                    <span className="font-bold text-[#191c1e]">{val.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}