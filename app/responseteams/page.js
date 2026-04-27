"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const STATUS_STYLES = {
  Available:   "bg-[#006229]/15 text-[#006229]",
  Deployed:    "bg-[#f57c00]/15 text-[#e65100]",
  Unavailable: "bg-[#ba1a1a]/15 text-[#ba1a1a]",
};

export default function ResponseTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch]     = useState("");
  const [updating, setUpdating] = useState(null);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    TeamName: "",
    Specialization: "",
    ContactInfo: "",
    AvailabilityStatus: "Available"
  });

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filterStatus !== "All") p.set("status", filterStatus);
    fetch(`/api/responseteams?${p}`).then((r) => r.json())
      .then((d) => { setTeams(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filterStatus]);

  const filtered = teams.filter((t) =>
    t.TeamName?.toLowerCase().includes(search.toLowerCase()) ||
    t.Specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    available: teams.filter((t) => t.AvailabilityStatus === "Available").length,
    deployed:  teams.filter((t) => t.AvailabilityStatus === "Deployed").length,
    total:     teams.length,
  };

  const handleStatus = async (id, status) => {
    setUpdating(id);
    await fetch("/api/responseteams", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ TeamID: id, AvailabilityStatus: status }),
    });
    setUpdating(null); load();
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/responseteams", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setShowAddForm(false);
    setFormData({ TeamName: "", Specialization: "", ContactInfo: "", AvailabilityStatus: "Available" });
    load();
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
              <h1 className="text-5xl font-extrabold tracking-tight text-[#191c1e]">Response Teams</h1>
              <p className="text-[#434655] mt-1 text-lg">Manage operational response teams and their availability.</p>
            </div>
            <button onClick={() => setShowAddForm(true)} className="bg-[#004ac6] text-white px-5 py-2.5 rounded-full font-bold shadow-sm hover:bg-[#003da6] transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Team
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label: "Total Teams", val: counts.total,     icon: "groups",        iconBg: "bg-[#004ac6]/15", iconColor: "text-[#004ac6]" },
              { label: "Available",   val: counts.available, icon: "check_circle",  iconBg: "bg-[#006229]/15", iconColor: "text-[#006229]" },
              { label: "Deployed",    val: counts.deployed,  icon: "flight_takeoff",iconBg: "bg-[#f57c00]/15", iconColor: "text-[#e65100]" },
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
                    {["All","Available","Deployed","Unavailable"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] text-[16px]">search</span>
                <input type="text" placeholder="Search teams..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#c3c6d7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#004ac6] outline-none shadow-sm" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-ambient overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f2f4f6]/50">
                    {["Team Name","Specialization","Contact Info","Status","Actions"].map((h) => (
                      <th key={h} className="py-4 px-5 text-xs font-semibold text-[#434655] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr><td colSpan={5} className="py-12 text-center text-[#434655]">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-[#434655]">No teams found.</td></tr>
                  ) : filtered.map((team, i) => (
                    <tr key={team.TeamID} className={`group border-t border-[#e6e8ea]/50 transition-colors ${i % 2 ? "bg-[#f2f4f6]/20" : ""} hover:bg-[#f2f4f6]/50`}>
                      <td className="py-4 px-5 font-semibold text-[#191c1e]">{team.TeamName}</td>
                      <td className="py-4 px-5 text-[#434655]">{team.Specialization}</td>
                      <td className="py-4 px-5 text-[#434655]">{team.ContactInfo}</td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${STATUS_STYLES[team.AvailabilityStatus] || ""}`}>
                          {team.AvailabilityStatus}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {team.AvailabilityStatus !== "Available" && (
                            <button disabled={updating === team.TeamID}
                              onClick={() => handleStatus(team.TeamID, "Available")}
                              className="text-xs px-2.5 py-1 bg-[#006229]/10 text-[#006229] rounded-lg font-semibold hover:bg-[#006229]/20 transition-colors disabled:opacity-50">
                              Mark Available
                            </button>
                          )}
                          {team.AvailabilityStatus !== "Deployed" && (
                            <button disabled={updating === team.TeamID}
                              onClick={() => handleStatus(team.TeamID, "Deployed")}
                              className="text-xs px-2.5 py-1 bg-[#f57c00]/10 text-[#e65100] rounded-lg font-semibold hover:bg-[#f57c00]/20 transition-colors disabled:opacity-50">
                              Mark Deployed
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

        {/* Add Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Add New Team</h3>
                <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Team Name</label>
                  <input required type="text" value={formData.TeamName} onChange={(e) => setFormData({...formData, TeamName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Specialization</label>
                  <input required type="text" value={formData.Specialization} onChange={(e) => setFormData({...formData, Specialization: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Info</label>
                  <input required type="text" value={formData.ContactInfo} onChange={(e) => setFormData({...formData, ContactInfo: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                  <select required value={formData.AvailabilityStatus} onChange={(e) => setFormData({...formData, AvailabilityStatus: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Available">Available</option>
                    <option value="Deployed">Deployed</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">Save Team</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
