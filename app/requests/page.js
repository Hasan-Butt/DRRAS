"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useSidebar, SidebarProvider } from "../context/SidebarContext";

const PRIORITY_STYLES = {
  Critical: "bg-[#ba1a1a]/15 text-[#ba1a1a]",
  High: "bg-[#f57c00]/15 text-[#e65100]",
  Medium: "bg-[#fbc02d]/15 text-[#f57f17]",
  Low: "bg-[#004ac6]/15 text-[#004ac6]",
};
const STATUS_STYLES = {
  Pending: "bg-[#f57c00]/15 text-[#e65100]",
  Approved: "bg-[#004ac6]/15 text-[#004ac6]",
  Denied: "bg-[#ba1a1a]/15 text-[#ba1a1a]",
  Fulfilled: "bg-[#006229]/15 text-[#006229]",
};

function RequestContent() {
  // ✅ ALL hooks must be inside here
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [disasters, setDisasters] = useState([]);
  const [resources, setResources] = useState([]);
  const [requestForm, setRequestForm] = useState({
    DisasterID: "",
    ResourceID: "",
    RequestedQuantity: "",
    PriorityLevel: "Medium",
    Remarks: "",
  });
  const [saving, setSaving] = useState(false);
  const { isCollapsed } = useSidebar();

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filterStatus !== "All") p.set("status", filterStatus);
    fetch(`/api/requests?${p}`)
      .then((r) => r.json())
      .then((d) => {
        setRequests(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
    fetch("/api/disasters").then((r) => r.json()).then(setDisasters).catch(() => {});
    fetch("/api/resources").then((r) => r.json()).then(setResources).catch(() => {});
  }, [filterStatus]);

  const handleNewRequest = async (e) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...requestForm,
        DisasterID: Number(requestForm.DisasterID),
        ResourceID: Number(requestForm.ResourceID),
        RequestedQuantity: Number(requestForm.RequestedQuantity),
        RequestByUserID: 1,
        Status: "Pending",
      }),
    });
    setSaving(false);
    setShowModal(false);
    setRequestForm({ DisasterID: "", ResourceID: "", RequestedQuantity: "", PriorityLevel: "Medium", Remarks: "" });
    load();
  };

  const filtered = requests.filter(
    (r) =>
      r.DisasterTitle?.toLowerCase().includes(search.toLowerCase()) ||
      r.ResourceName?.toLowerCase().includes(search.toLowerCase()) ||
      r.RequestedBy?.toLowerCase().includes(search.toLowerCase()),
  );

  const counts = {
    pending: requests.filter((r) => r.Status === "Pending").length,
    approved: requests.filter((r) => r.Status === "Approved").length,
    total: requests.length,
  };

  const handleStatus = async (id, status) => {
    setUpdating(id);
    await fetch("/api/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ RequestID: id, Status: status }),
    });
    setUpdating(null);
    load();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f9fb]">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}
      >
        <Topbar />
        <main className="flex-1 p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight text-[#191c1e]">
                Resource Requests
              </h1>
              <p className="text-[#434655] mt-1 text-lg">
                Review and approve incoming resource requests.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-primary text-white px-6 py-3.5 rounded-xl font-semibold flex items-center gap-2 shadow-ambient hover:opacity-95 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Request
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label: "Total Requests", val: counts.total, icon: "list_alt", iconBg: "bg-[#004ac6]/15", iconColor: "text-[#004ac6]" },
              { label: "Pending", val: counts.pending, icon: "schedule", iconBg: "bg-[#f57c00]/15", iconColor: "text-[#e65100]" },
              { label: "Approved", val: counts.approved, icon: "check_circle", iconBg: "bg-[#006229]/15", iconColor: "text-[#006229]" },
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
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-[#c3c6d7]/20">
                <span className="material-symbols-outlined text-[#434655] text-[16px]">filter_list</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium text-[#191c1e] focus:ring-0 p-0 cursor-pointer"
                >
                  {["All", "Pending", "Approved", "Denied", "Fulfilled"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] text-[16px]">search</span>
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#c3c6d7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#004ac6] outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-ambient overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f2f4f6]/50">
                    {["Disaster", "Resource", "Requested By", "Qty", "Priority", "Status", "Actions"].map((h) => (
                      <th key={h} className="py-4 px-5 text-xs font-semibold text-[#434655] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr><td colSpan={7} className="py-12 text-center text-[#434655]">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-[#434655]">No requests found.</td></tr>
                  ) : (
                    filtered.map((req, i) => (
                      <tr
                        key={req.RequestID}
                        className={`group border-t border-[#e6e8ea]/50 transition-colors ${i % 2 ? "bg-[#f2f4f6]/20" : ""} hover:bg-[#f2f4f6]/50`}
                      >
                        <td className="py-4 px-5 font-semibold text-[#191c1e]">{req.DisasterTitle}</td>
                        <td className="py-4 px-5 text-[#434655]">{req.ResourceName}</td>
                        <td className="py-4 px-5 text-[#434655]">{req.RequestedBy}</td>
                        <td className="py-4 px-5 font-medium text-[#191c1e]">{req.RequestedQuantity}</td>
                        <td className="py-4 px-5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${PRIORITY_STYLES[req.PriorityLevel] || ""}`}>
                            {req.PriorityLevel}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${STATUS_STYLES[req.Status] || ""}`}>
                            {req.Status}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          {req.Status === "Pending" && (
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                disabled={updating === req.RequestID}
                                onClick={() => handleStatus(req.RequestID, "Approved")}
                                className="text-xs px-2.5 py-1 bg-[#006229]/10 text-[#006229] rounded-lg font-semibold hover:bg-[#006229]/20 transition-colors disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                disabled={updating === req.RequestID}
                                onClick={() => handleStatus(req.RequestID, "Denied")}
                                className="text-xs px-2.5 py-1 bg-[#ba1a1a]/10 text-[#ba1a1a] rounded-lg font-semibold hover:bg-[#ba1a1a]/20 transition-colors disabled:opacity-50"
                              >
                                Deny
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#191c1e]">New Resource Request</h2>
              <button onClick={() => setShowModal(false)} className="text-[#434655] hover:text-[#191c1e] p-1 rounded-lg hover:bg-[#f2f4f6]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleNewRequest} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">Disaster *</label>
                <select required value={requestForm.DisasterID}
                  onChange={(e) => setRequestForm({ ...requestForm, DisasterID: e.target.value })}
                  className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none">
                  <option value="">Select disaster...</option>
                  {disasters.map((d) => (
                    <option key={d.DisasterID} value={d.DisasterID}>{d.Title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">Resource *</label>
                <select required value={requestForm.ResourceID}
                  onChange={(e) => setRequestForm({ ...requestForm, ResourceID: e.target.value })}
                  className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none">
                  <option value="">Select resource...</option>
                  {resources.map((r) => (
                    <option key={r.ResourceID} value={r.ResourceID}>
                      {r.ResourceName} (Available: {r.AvailableQuantity})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">Quantity *</label>
                <input required type="number" min="1" value={requestForm.RequestedQuantity}
                  onChange={(e) => setRequestForm({ ...requestForm, RequestedQuantity: e.target.value })}
                  className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">Priority *</label>
                <select value={requestForm.PriorityLevel}
                  onChange={(e) => setRequestForm({ ...requestForm, PriorityLevel: e.target.value })}
                  className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none">
                  {["Low", "Medium", "High", "Critical"].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">Remarks</label>
                <textarea value={requestForm.Remarks}
                  onChange={(e) => setRequestForm({ ...requestForm, Remarks: e.target.value })}
                  rows={2}
                  className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#434655] bg-[#f2f4f6] hover:bg-[#e6e8ea] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary hover:opacity-90 disabled:opacity-60 transition-opacity">
                  {saving ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RequestPage() {
  return (
    <SidebarProvider>
      <RequestContent />
    </SidebarProvider>
  );
}