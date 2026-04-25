"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const PRIORITY_STYLES = {
  Critical: "bg-[#ba1a1a]/15 text-[#ba1a1a]",
  High:     "bg-[#f57c00]/15 text-[#e65100]",
  Medium:   "bg-[#fbc02d]/15 text-[#f57f17]",
  Low:      "bg-[#004ac6]/15 text-[#004ac6]",
};
const STATUS_STYLES = {
  Pending:   "bg-[#f57c00]/15 text-[#e65100]",
  Approved:  "bg-[#004ac6]/15 text-[#004ac6]",
  Denied:    "bg-[#ba1a1a]/15 text-[#ba1a1a]",
  Fulfilled: "bg-[#006229]/15 text-[#006229]",
};

export default function RequestPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch]     = useState("");
  const [updating, setUpdating] = useState(null);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filterStatus !== "All") p.set("status", filterStatus);
    fetch(`/api/requests?${p}`).then((r) => r.json())
      .then((d) => { setRequests(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filterStatus]);

  const filtered = requests.filter((r) =>
    r.DisasterTitle?.toLowerCase().includes(search.toLowerCase()) ||
    r.ResourceName?.toLowerCase().includes(search.toLowerCase()) ||
    r.RequestedBy?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    pending:  requests.filter((r) => r.Status === "Pending").length,
    approved: requests.filter((r) => r.Status === "Approved").length,
    total:    requests.length,
  };

  const handleStatus = async (id, status) => {
    setUpdating(id);
    await fetch("/api/requests", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ RequestID: id, Status: status }),
    });
    setUpdating(null); load();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f9fb]">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-y-auto">
        <Topbar />
        <main className="flex-1 p-8 space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight text-[#191c1e]">Resource Requests</h1>
              <p className="text-[#434655] mt-1 text-lg">Review and approve incoming resource requests.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label: "Total Requests", val: counts.total,    icon: "list_alt",     iconBg: "bg-[#004ac6]/15", iconColor: "text-[#004ac6]" },
              { label: "Pending",        val: counts.pending,  icon: "schedule",     iconBg: "bg-[#f57c00]/15", iconColor: "text-[#e65100]" },
              { label: "Approved",       val: counts.approved, icon: "check_circle", iconBg: "bg-[#006229]/15", iconColor: "text-[#006229]" },
            ].map(({ label, val, icon, iconBg, iconColor }) => (
              <div key={label} className="bg-white rounded-xl p-6 shadow-ambient">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
                    <span className="material-symbols-outlined text-[16px]">{icon}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#434655] uppercase tracking-wider">{label}</p>
                </div>
                <div className="text-4xl font-black text-[#191c1e]">{val}</div>
              </div>
            ))}
          </div>

          {/* Filters + Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#f2f4f6] p-2 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-[#c3c6d7]/20">
                  <span className="material-symbols-outlined text-[#434655] text-[16px]">filter_list</span>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent border-none text-sm font-medium text-[#191c1e] focus:ring-0 p-0 cursor-pointer">
                    {["All","Pending","Approved","Denied","Fulfilled"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] text-[16px]">search</span>
                <input type="text" placeholder="Search requests..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#c3c6d7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#004ac6] outline-none shadow-sm" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-ambient overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f2f4f6]/50">
                    {["Disaster","Resource","Requested By","Qty","Priority","Status","Actions"].map((h) => (
                      <th key={h} className="py-4 px-5 text-xs font-semibold text-[#434655] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr><td colSpan={7} className="py-12 text-center text-[#434655]">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-[#434655]">No requests found.</td></tr>
                  ) : filtered.map((req, i) => (
                    <tr key={req.RequestID} className={`group border-t border-[#e6e8ea]/50 transition-colors ${i % 2 ? "bg-[#f2f4f6]/20" : ""} hover:bg-[#f2f4f6]/50`}>
                      <td className="py-4 px-5 font-semibold text-[#191c1e]">{req.DisasterTitle}</td>
                      <td className="py-4 px-5 text-[#434655]">{req.ResourceName}</td>
                      <td className="py-4 px-5 text-[#434655]">{req.RequestedBy}</td>
                      <td className="py-4 px-5 font-medium text-[#191c1e]">{req.RequestedQuantity}</td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${PRIORITY_STYLES[req.PriorityLevel] || ""}`}>{req.PriorityLevel}</span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${STATUS_STYLES[req.Status] || ""}`}>
                          {req.Status}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        {req.Status === "Pending" && (
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button disabled={updating === req.RequestID}
                              onClick={() => handleStatus(req.RequestID, "Approved")}
                              className="text-xs px-2.5 py-1 bg-[#006229]/10 text-[#006229] rounded-lg font-semibold hover:bg-[#006229]/20 transition-colors disabled:opacity-50">
                              Approve
                            </button>
                            <button disabled={updating === req.RequestID}
                              onClick={() => handleStatus(req.RequestID, "Denied")}
                              className="text-xs px-2.5 py-1 bg-[#ba1a1a]/10 text-[#ba1a1a] rounded-lg font-semibold hover:bg-[#ba1a1a]/20 transition-colors disabled:opacity-50">
                              Deny
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
