"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useSidebar, SidebarProvider } from "../context/SidebarContext";

const STATUS_STYLES = {
  Pending: "bg-[#f57c00]/15 text-[#e65100]",
  Approved: "bg-[#004ac6]/15 text-[#004ac6]",
  Deployed: "bg-[#9c27b0]/15 text-[#7b1fa2]",
  Completed: "bg-[#006229]/15 text-[#006229]",
};

function AllocationsContent() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [disasters, setDisasters] = useState([]);
  const [resources, setResources] = useState([]);
  const [teams, setTeams] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [allocForm, setAllocForm] = useState({
    DisasterID: "",
    ResourceID: "",
    RequestID: "",
    TeamID: "",
    AllocatedQuantity: "",
    Status: "Pending",
  });
  const [saving, setSaving] = useState(false);
  const { isCollapsed } = useSidebar();

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filterStatus !== "All") p.set("status", filterStatus);
    fetch(`/api/allocations?${p}`)
      .then((r) => r.json())
      .then((d) => {
        setAllocations(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
    fetch("/api/disasters")
      .then((r) => r.json())
      .then(setDisasters)
      .catch(() => {});
    fetch("/api/resources")
      .then((r) => r.json())
      .then(setResources)
      .catch(() => {});
    fetch("/api/responseteams")
      .then((r) => r.json())
      .then((d) => setTeams(Array.isArray(d) ? d : []))
      .catch(() => {});
    fetch("/api/requests?status=Approved")
      .then((r) => r.json())
      .then((d) => setApprovedRequests(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [filterStatus]);

  const handleNewAllocation = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/allocations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        DisasterID: Number(allocForm.DisasterID),
        ResourceID: Number(allocForm.ResourceID),
        RequestID: Number(allocForm.RequestID),
        TeamID: Number(allocForm.TeamID),
        AllocatedQuantity: Number(allocForm.AllocatedQuantity),
        Status: "Pending",
      }),
    });
    setSaving(false);
    if (res.ok) {
      setShowModal(false);
      setAllocForm({
        DisasterID: "",
        ResourceID: "",
        RequestID: "",
        TeamID: "",
        AllocatedQuantity: "",
        Status: "Pending",
      });
      load();
    }
  };

  const filtered = allocations.filter(
    (a) =>
      a.DisasterTitle?.toLowerCase().includes(search.toLowerCase()) ||
      a.ResourceName?.toLowerCase().includes(search.toLowerCase()) ||
      a.TeamName?.toLowerCase().includes(search.toLowerCase()),
  );

  const counts = {
    pending: allocations.filter((a) => a.Status === "Pending").length,
    approved: allocations.filter((a) => a.Status === "Approved").length,
    deployed: allocations.filter((a) => a.Status === "Deployed").length,
    total: allocations.length,
  };

  const handleStatus = async (id, status) => {
    setUpdating(id);
    await fetch("/api/allocations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ AllocationID: id, Status: status }),
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
          {/* ✅ Header: title on left, button on right */}
          <div className="flex flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight text-[#191c1e]">
                Allocations
              </h1>
              <p className="text-[#434655] mt-1 text-lg">
                Manage and deploy resource allocations to response teams.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-primary text-white px-6 py-3.5 rounded-xl font-semibold flex items-center gap-2 shadow-ambient hover:opacity-95 transition-opacity whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Allocation
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              {
                label: "Total",
                val: counts.total,
                icon: "list_alt",
                iconBg: "bg-[#434655]/15",
                iconColor: "text-[#434655]",
              },
              {
                label: "Pending",
                val: counts.pending,
                icon: "schedule",
                iconBg: "bg-[#f57c00]/15",
                iconColor: "text-[#e65100]",
              },
              {
                label: "Approved",
                val: counts.approved,
                icon: "thumb_up",
                iconBg: "bg-[#004ac6]/15",
                iconColor: "text-[#004ac6]",
              },
              {
                label: "Deployed",
                val: counts.deployed,
                icon: "local_shipping",
                iconBg: "bg-[#9c27b0]/15",
                iconColor: "text-[#7b1fa2]",
              },
            ].map(({ label, val, icon, iconBg, iconColor }) => (
              <div
                key={label}
                className="bg-white rounded-xl p-6 shadow-ambient"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {icon}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#434655] uppercase tracking-wider">
                    {label}
                  </p>
                </div>
                <div className="text-4xl font-black text-[#191c1e]">{val}</div>
              </div>
            ))}
          </div>

          {/* Filters + Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#f2f4f6] p-2 rounded-xl">
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-[#c3c6d7]/20">
                <span className="material-symbols-outlined text-[#434655] text-[16px]">
                  filter_list
                </span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium text-[#191c1e] focus:ring-0 p-0 cursor-pointer"
                >
                  {["All", "Pending", "Approved", "Deployed", "Completed"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search allocations..."
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
                    {[
                      "Disaster",
                      "Resource",
                      "Team",
                      "Qty",
                      "Date",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="py-4 px-5 text-xs font-semibold text-[#434655] uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-[#434655]"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-[#434655]"
                      >
                        No allocations found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((alloc, i) => (
                      <tr
                        key={alloc.AllocationID}
                        className={`group border-t border-[#e6e8ea]/50 transition-colors ${i % 2 ? "bg-[#f2f4f6]/20" : ""} hover:bg-[#f2f4f6]/50`}
                      >
                        <td className="py-4 px-5 font-semibold text-[#191c1e]">
                          {alloc.DisasterTitle}
                        </td>
                        <td className="py-4 px-5 text-[#434655]">
                          {alloc.ResourceName}
                        </td>
                        <td className="py-4 px-5 text-[#434655]">
                          {alloc.TeamName}
                        </td>
                        <td className="py-4 px-5 font-medium text-[#191c1e]">
                          {alloc.AllocatedQuantity}
                        </td>
                        <td className="py-4 px-5 text-[#434655]">
                          {new Date(alloc.AllocationDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${STATUS_STYLES[alloc.Status] || ""}`}
                          >
                            {alloc.Status}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {alloc.Status === "Pending" && (
                              <button
                                disabled={updating === alloc.AllocationID}
                                onClick={() =>
                                  handleStatus(alloc.AllocationID, "Approved")
                                }
                                className="text-xs px-2.5 py-1 bg-[#004ac6]/10 text-[#004ac6] rounded-lg font-semibold hover:bg-[#004ac6]/20 disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}
                            {alloc.Status === "Approved" && (
                              <button
                                disabled={updating === alloc.AllocationID}
                                onClick={() =>
                                  handleStatus(alloc.AllocationID, "Deployed")
                                }
                                className="text-xs px-2.5 py-1 bg-[#9c27b0]/10 text-[#7b1fa2] rounded-lg font-semibold hover:bg-[#9c27b0]/20 disabled:opacity-50"
                              >
                                Deploy
                              </button>
                            )}
                            {alloc.Status === "Deployed" && (
                              <button
                                disabled={updating === alloc.AllocationID}
                                onClick={() =>
                                  handleStatus(alloc.AllocationID, "Completed")
                                }
                                className="text-xs px-2.5 py-1 bg-[#006229]/10 text-[#006229] rounded-lg font-semibold hover:bg-[#006229]/20 disabled:opacity-50"
                              >
                                Complete
                              </button>
                            )}
                          </div>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#191c1e]">
                New Allocation
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#434655] hover:text-[#191c1e] p-1 rounded-lg hover:bg-[#f2f4f6]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleNewAllocation} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">
                  Disaster *
                </label>
                <select
                  required
                  value={allocForm.DisasterID}
                  onChange={(e) =>
                    setAllocForm({ ...allocForm, DisasterID: e.target.value })
                  }
                  className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none"
                >
                  <option value="">Select disaster...</option>
                  {disasters.map((d) => (
                    <option key={d.DisasterID} value={d.DisasterID}>
                      {d.Title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">
                  Approved Request *
                </label>
                <select
                  required
                  value={allocForm.RequestID}
                  onChange={(e) => {
                    const req = approvedRequests.find(
                      (r) => r.RequestID === Number(e.target.value),
                    );
                    setAllocForm({
                      ...allocForm,
                      RequestID: e.target.value,
                      ResourceID: req ? String(req.ResourceID) : "",
                      AllocatedQuantity: req
                        ? String(req.RequestedQuantity)
                        : "",
                    });
                  }}
                  className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none"
                >
                  <option value="">Select approved request...</option>
                  {approvedRequests.map((r) => (
                    <option key={r.RequestID} value={r.RequestID}>
                      #{r.RequestID} — {r.ResourceName} (qty:{" "}
                      {r.RequestedQuantity})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">
                  Resource *
                </label>
                <select
                  required
                  value={allocForm.ResourceID}
                  onChange={(e) =>
                    setAllocForm({ ...allocForm, ResourceID: e.target.value })
                  }
                  className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none"
                >
                  <option value="">Select resource...</option>
                  {resources.map((r) => (
                    <option key={r.ResourceID} value={r.ResourceID}>
                      {r.ResourceName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">
                  Response Team *
                </label>
                <select
                  required
                  value={allocForm.TeamID}
                  onChange={(e) =>
                    setAllocForm({ ...allocForm, TeamID: e.target.value })
                  }
                  className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none"
                >
                  <option value="">Select team...</option>
                  {teams.length === 0 ? (
                    <option disabled>No teams found — check API route</option>
                  ) : (
                    teams.map((t) => (
                      <option key={t.TeamID} value={t.TeamID}>
                        {t.TeamName} — {t.Specialization}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">
                  Quantity *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={allocForm.AllocatedQuantity}
                  onChange={(e) =>
                    setAllocForm({
                      ...allocForm,
                      AllocatedQuantity: e.target.value,
                    })
                  }
                  className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#434655] bg-[#f2f4f6] hover:bg-[#e6e8ea] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  {saving ? "Creating..." : "Create Allocation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AllocationsPage() {
  return (
    <SidebarProvider>
      <AllocationsContent />
    </SidebarProvider>
  );
}
