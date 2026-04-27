"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const STATUS_STYLES = {
  Pending:   "bg-[#f57c00]/15 text-[#e65100]",
  Approved:  "bg-[#004ac6]/15 text-[#004ac6]",
  Deployed:  "bg-[#9c27b0]/15 text-[#7b1fa2]",
  Completed: "bg-[#006229]/15 text-[#006229]",
};

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch]     = useState("");
  const [updating, setUpdating] = useState(null);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filterStatus !== "All") p.set("status", filterStatus);
    fetch(`/api/allocations?${p}`).then((r) => r.json())
      .then((d) => { setAllocations(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filterStatus]);

  const filtered = allocations.filter((a) =>
    a.DisasterTitle?.toLowerCase().includes(search.toLowerCase()) ||
    a.ResourceName?.toLowerCase().includes(search.toLowerCase()) ||
    a.TeamName?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    pending:  allocations.filter((a) => a.Status === "Pending").length,
    approved: allocations.filter((a) => a.Status === "Approved").length,
    deployed: allocations.filter((a) => a.Status === "Deployed").length,
    total:    allocations.length,
  };

  const handleStatus = async (id, status) => {
    setUpdating(id);
    await fetch("/api/allocations", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ AllocationID: id, Status: status }),
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
              <h1 className="text-5xl font-extrabold tracking-tight text-[#191c1e]">Allocations</h1>
              <p className="text-[#434655] mt-1 text-lg">Manage and deploy resource allocations to response teams.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { label: "Total",    val: counts.total,    icon: "list_alt",     iconBg: "bg-[#434655]/15", iconColor: "text-[#434655]" },
              { label: "Pending",  val: counts.pending,  icon: "schedule",     iconBg: "bg-[#f57c00]/15", iconColor: "text-[#e65100]" },
              { label: "Approved", val: counts.approved, icon: "thumb_up",     iconBg: "bg-[#004ac6]/15", iconColor: "text-[#004ac6]" },
              { label: "Deployed", val: counts.deployed, icon: "local_shipping", iconBg: "bg-[#9c27b0]/15", iconColor: "text-[#7b1fa2]" },
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
                    {["All","Pending","Approved","Deployed","Completed"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] text-[16px]">search</span>
                <input type="text" placeholder="Search allocations..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#c3c6d7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#004ac6] outline-none shadow-sm" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-ambient overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f2f4f6]/50">
                    {["Disaster","Resource","Team","Qty","Date","Status","Actions"].map((h) => (
                      <th key={h} className="py-4 px-5 text-xs font-semibold text-[#434655] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr><td colSpan={7} className="py-12 text-center text-[#434655]">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-[#434655]">No allocations found.</td></tr>
                  ) : filtered.map((alloc, i) => (
                    <tr key={alloc.AllocationID} className={`group border-t border-[#e6e8ea]/50 transition-colors ${i % 2 ? "bg-[#f2f4f6]/20" : ""} hover:bg-[#f2f4f6]/50`}>
                      <td className="py-4 px-5 font-semibold text-[#191c1e]">{alloc.DisasterTitle}</td>
                      <td className="py-4 px-5 text-[#434655]">{alloc.ResourceName}</td>
                      <td className="py-4 px-5 text-[#434655]">{alloc.TeamName}</td>
                      <td className="py-4 px-5 font-medium text-[#191c1e]">{alloc.AllocatedQuantity}</td>
                      <td className="py-4 px-5 text-[#434655]">{new Date(alloc.AllocationDate).toLocaleDateString()}</td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${STATUS_STYLES[alloc.Status] || ""}`}>
                          {alloc.Status}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {alloc.Status === "Pending" && (
                            <button disabled={updating === alloc.AllocationID}
                              onClick={() => handleStatus(alloc.AllocationID, "Approved")}
                              className="text-xs px-2.5 py-1 bg-[#004ac6]/10 text-[#004ac6] rounded-lg font-semibold hover:bg-[#004ac6]/20 transition-colors disabled:opacity-50">
                              Approve
                            </button>
                          )}
                          {alloc.Status === "Approved" && (
                            <button disabled={updating === alloc.AllocationID}
                              onClick={() => handleStatus(alloc.AllocationID, "Deployed")}
                              className="text-xs px-2.5 py-1 bg-[#9c27b0]/10 text-[#7b1fa2] rounded-lg font-semibold hover:bg-[#9c27b0]/20 transition-colors disabled:opacity-50">
                              Deploy
                            </button>
                          )}
                          {alloc.Status === "Deployed" && (
                            <button disabled={updating === alloc.AllocationID}
                              onClick={() => handleStatus(alloc.AllocationID, "Completed")}
                              className="text-xs px-2.5 py-1 bg-[#006229]/10 text-[#006229] rounded-lg font-semibold hover:bg-[#006229]/20 transition-colors disabled:opacity-50">
                              Complete
                            </button>
                          )}
                        </div>
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
