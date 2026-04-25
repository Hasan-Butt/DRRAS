"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const SEVERITY_COLORS = {
  5: { bg: "bg-[#ba1a1a]/15", text: "text-[#ba1a1a]" },
  4: { bg: "bg-[#f57c00]/15", text: "text-[#e65100]" },
  3: { bg: "bg-[#fbc02d]/15", text: "text-[#f57f17]" },
  2: { bg: "bg-[#004ac6]/15", text: "text-[#004ac6]" },
  1: { bg: "bg-[#e6e8ea]",    text: "text-[#434655]"  },
};

const EMPTY = { Title: "", Type: "", SeverityLevel: 3, StartDate: "", EndDate: "", Status: "Active", Description: "" };

export default function DisasterPage() {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterSev, setFilterSev] = useState("");
  const [filterStatus, setFilterStatus] = useState("Active");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus && filterStatus !== "All") params.set("status", filterStatus);
    if (filterSev) params.set("severity", filterSev);
    fetch(`/api/disasters?${params}`)
      .then((r) => r.json())
      .then((d) => { setDisasters(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus, filterSev]);

  const filtered = disasters.filter((d) =>
    d.Title?.toLowerCase().includes(search.toLowerCase()) ||
    d.Type?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    active:   disasters.filter((d) => d.Status === "Active").length,
    critical: disasters.filter((d) => d.SeverityLevel === 5).length,
    resolved: disasters.filter((d) => d.Status === "Resolved").length,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/disasters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, SeverityLevel: Number(form.SeverityLevel) }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      setShowModal(false); setForm(EMPTY); load();
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    await fetch("/api/disasters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ DisasterID: id, Status: newStatus }),
    });
    load();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f9fb]">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-y-auto">
        <Topbar />
        <main className="flex-1 p-8 space-y-8">

          {/* Hero */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight text-[#191c1e]">Disaster Registry</h1>
              <p className="text-[#434655] mt-1 text-lg">Monitor, track, and manage all active crises.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-primary text-white px-6 py-3.5 rounded-xl font-semibold flex items-center gap-2 shadow-ambient hover:opacity-95 transition-opacity active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add New Disaster
            </button>
          </div>

          {/* Stats Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label: "Active Operations", val: stats.active,   icon: "monitoring",          iconBg: "bg-[#00687a]/15",  iconColor: "text-[#00687a]", bg: "public"             },
              { label: "Critical (Level 5)", val: stats.critical, icon: "warning",             iconBg: "bg-[#ba1a1a]/15",  iconColor: "text-[#ba1a1a]", bg: "local_fire_department" },
              { label: "Recently Resolved", val: stats.resolved,  icon: "check_circle",        iconBg: "bg-[#006229]/15",  iconColor: "text-[#006229]", bg: "verified"           },
            ].map(({ label, val, icon, iconBg, iconColor, bg }) => (
              <div key={label} className="bg-white rounded-xl p-6 shadow-ambient relative overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
                    <span className="material-symbols-outlined text-[16px]">{icon}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#434655] uppercase tracking-wider">{label}</p>
                </div>
                <div className={`text-4xl font-black ${val > 0 && label.includes("Critical") ? "text-[#ba1a1a]" : "text-[#191c1e]"}`}>{val}</div>
                <div className="absolute -bottom-4 -right-4 text-[#e6e8ea]">
                  <span className="material-symbols-outlined" style={{ fontSize: "6rem" }}>{bg}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar + Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#f2f4f6] p-2 rounded-xl">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-[#c3c6d7]/20">
                  <span className="material-symbols-outlined text-[#434655] text-[16px]">filter_list</span>
                  <select className="bg-transparent border-none text-sm font-medium text-[#191c1e] focus:ring-0 p-0 cursor-pointer"
                    value={filterSev} onChange={(e) => setFilterSev(e.target.value)}>
                    <option value="">All Severities</option>
                    {[5,4,3,2,1].map((l) => <option key={l} value={l}>Level {l}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-[#c3c6d7]/20">
                  <span className="material-symbols-outlined text-[#434655] text-[16px]">toggle_on</span>
                  <select className="bg-transparent border-none text-sm font-medium text-[#191c1e] focus:ring-0 p-0 cursor-pointer"
                    value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="Active">Status: Active</option>
                    <option value="Contained">Status: Contained</option>
                    <option value="Resolved">Status: Resolved</option>
                    <option value="All">Status: All</option>
                  </select>
                </div>
              </div>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] text-[16px]">search</span>
                <input
                  type="text" placeholder="Search disasters..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#c3c6d7]/20 rounded-lg text-sm text-[#191c1e] focus:ring-2 focus:ring-[#004ac6] outline-none shadow-sm"
                  value={search} onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-ambient overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f2f4f6]/50">
                    {["Title","Type","Severity","Status","Start Date","Actions"].map((h, i) => (
                      <th key={h} className={`py-4 px-6 text-xs font-semibold text-[#434655] uppercase tracking-wider ${i === 5 ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr><td colSpan={6} className="py-12 text-center text-[#434655]">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-[#434655]">No disasters found.</td></tr>
                  ) : filtered.map((d, i) => {
                    const sc = SEVERITY_COLORS[d.SeverityLevel] || SEVERITY_COLORS[1];
                    const isActive = d.Status === "Active";
                    return (
                      <tr key={d.DisasterID} className={`group transition-colors border-t border-[#e6e8ea]/50 ${i % 2 ? "bg-[#f2f4f6]/20" : ""} hover:bg-[#f2f4f6]/50`}>
                        <td className="py-4 px-6 font-semibold text-[#191c1e]">
                          <div className="flex items-center gap-3">
                            {isActive && <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse shadow-[0_0_6px_rgba(186,26,26,0.5)]"></span>}
                            {d.Title}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[#434655]">{d.Type}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${sc.bg} ${sc.text}`}>Level {d.SeverityLevel}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${
                            isActive ? "bg-[#00687a]/15 text-[#00687a]" : "bg-[#006229]/15 text-[#006229]"
                          }`}>
                            <span className="material-symbols-outlined text-[12px]">{isActive ? "sync" : "check"}</span>
                            {d.Status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[#434655] font-medium">
                          {d.StartDate ? new Date(d.StartDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isActive ? (
                              <button onClick={() => handleStatusChange(d.DisasterID, "Resolved")}
                                className="text-xs px-2 py-1 bg-[#006229]/10 text-[#006229] rounded-lg font-semibold hover:bg-[#006229]/20 transition-colors">
                                Resolve
                              </button>
                            ) : (
                              <button onClick={() => handleStatusChange(d.DisasterID, "Active")}
                                className="text-xs px-2 py-1 bg-[#004ac6]/10 text-[#004ac6] rounded-lg font-semibold hover:bg-[#004ac6]/20 transition-colors">
                                Reopen
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add Disaster Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#191c1e]">Add New Disaster</h2>
              <button onClick={() => { setShowModal(false); setError(""); }}
                className="text-[#434655] hover:text-[#191c1e] p-1 rounded-lg hover:bg-[#f2f4f6] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {error && <p className="text-sm text-[#ba1a1a] bg-[#ffdad6] px-3 py-2 rounded-lg">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">Title *</label>
                  <input required value={form.Title} onChange={(e) => setForm({ ...form, Title: e.target.value })}
                    className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">Type *</label>
                  <select required value={form.Type} onChange={(e) => setForm({ ...form, Type: e.target.value })}
                    className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none bg-white">
                    <option value="">Select type</option>
                    {["Earthquake","Flood","Hurricane","Wildfire","Tsunami","Tornado","Landslide","Technological","Meteorological","Hydrological"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">Severity (1–5) *</label>
                  <select required value={form.SeverityLevel} onChange={(e) => setForm({ ...form, SeverityLevel: e.target.value })}
                    className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none bg-white">
                    {[1,2,3,4,5].map((l) => <option key={l} value={l}>Level {l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">Start Date *</label>
                  <input required type="datetime-local" value={form.StartDate} onChange={(e) => setForm({ ...form, StartDate: e.target.value })}
                    className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">End Date *</label>
                  <input required type="datetime-local" value={form.EndDate} onChange={(e) => setForm({ ...form, EndDate: e.target.value })}
                    className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">Status *</label>
                  <select required value={form.Status} onChange={(e) => setForm({ ...form, Status: e.target.value })}
                    className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none bg-white">
                    <option>Active</option><option>Contained</option><option>Resolved</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">Description</label>
                  <textarea rows={3} value={form.Description} onChange={(e) => setForm({ ...form, Description: e.target.value })}
                    className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none resize-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setError(""); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#434655] bg-[#f2f4f6] hover:bg-[#e6e8ea] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary hover:opacity-90 transition-opacity disabled:opacity-60">
                  {saving ? "Saving..." : "Add Disaster"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
