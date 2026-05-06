"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useSidebar, SidebarProvider } from "../context/SidebarContext";
import dynamic from "next/dynamic";

const MapLocationPicker = dynamic(
  () => import("@/app/components/MapLocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
    ),
  },
);

const STATUS_STYLES = {
  Available: "bg-[#006229]/15 text-[#006229]",
  Deployed: "bg-[#f57c00]/15 text-[#e65100]",
  Unavailable: "bg-[#ba1a1a]/15 text-[#ba1a1a]",
};

const EMPTY_FORM = {
  TeamName: "",
  Specialization: "",
  ContactInfo: "",
  AvailabilityStatus: "Available",
  Latitude: "",
  Longitude: "",
};

function ResponseTeamsContent() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { isCollapsed } = useSidebar();

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filterStatus !== "All") p.set("status", filterStatus);
    // ⚠️ Make sure this matches your actual API route filename
    fetch(`/api/responseteams?${p}`)
      .then((r) => r.json())
      .then((d) => {
        setTeams(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filterStatus]);

  const filtered = teams.filter(
    (t) =>
      t.TeamName?.toLowerCase().includes(search.toLowerCase()) ||
      t.Specialization?.toLowerCase().includes(search.toLowerCase()),
  );

  const counts = {
    available: teams.filter((t) => t.AvailabilityStatus === "Available").length,
    deployed: teams.filter((t) => t.AvailabilityStatus === "Deployed").length,
    total: teams.length,
  };

  const handleStatus = async (id, status) => {
    setUpdating(id);
    await fetch("/api/responseteams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ TeamID: id, AvailabilityStatus: status }),
    });
    setUpdating(null);
    load();
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/responseteams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        Latitude: formData.Latitude ? Number(formData.Latitude) : null,
        Longitude: formData.Longitude ? Number(formData.Longitude) : null,
      }),
    });
    setSaving(false);
    setShowAddForm(false);
    setFormData(EMPTY_FORM);
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
          <div className="flex flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight text-[#191c1e]">
                Response Teams
              </h1>
              <p className="text-[#434655] mt-1 text-lg">
                Manage operational response teams and their availability.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-primary text-white px-6 py-3.5 rounded-xl font-semibold flex items-center gap-2 shadow-ambient hover:opacity-95 transition-opacity whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Team
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                label: "Total Teams",
                val: counts.total,
                icon: "groups",
                iconBg: "bg-[#004ac6]/15",
                iconColor: "text-[#004ac6]",
              },
              {
                label: "Available",
                val: counts.available,
                icon: "check_circle",
                iconBg: "bg-[#006229]/15",
                iconColor: "text-[#006229]",
              },
              {
                label: "Deployed",
                val: counts.deployed,
                icon: "flight_takeoff",
                iconBg: "bg-[#f57c00]/15",
                iconColor: "text-[#e65100]",
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
                  {["All", "Available", "Deployed", "Unavailable"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search teams..."
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
                      "Team Name",
                      "Specialization",
                      "Contact Info",
                      "Base Location",
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
                        colSpan={6}
                        className="py-12 text-center text-[#434655]"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-[#434655]"
                      >
                        No teams found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((team, i) => (
                      <tr
                        key={team.TeamID}
                        className={`group border-t border-[#e6e8ea]/50 transition-colors ${i % 2 ? "bg-[#f2f4f6]/20" : ""} hover:bg-[#f2f4f6]/50`}
                      >
                        <td className="py-4 px-5 font-semibold text-[#191c1e]">
                          {team.TeamName}
                        </td>
                        <td className="py-4 px-5 text-[#434655]">
                          {team.Specialization}
                        </td>
                        <td className="py-4 px-5 text-[#434655]">
                          {team.ContactInfo}
                        </td>
                        <td className="py-4 px-5 text-[#434655]">
                          {team.Latitude && team.Longitude ? (
                            <span className="flex items-center gap-1 text-xs">
                              <span className="material-symbols-outlined text-[#004ac6] text-[14px]">
                                location_on
                              </span>
                              {Number(team.Latitude).toFixed(4)},{" "}
                              {Number(team.Longitude).toFixed(4)}
                            </span>
                          ) : (
                            <span className="text-xs text-[#c3c6d7] italic">
                              No location set
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${STATUS_STYLES[team.AvailabilityStatus] || ""}`}
                          >
                            {team.AvailabilityStatus}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {team.AvailabilityStatus !== "Available" && (
                              <button
                                disabled={updating === team.TeamID}
                                onClick={() =>
                                  handleStatus(team.TeamID, "Available")
                                }
                                className="text-xs px-2.5 py-1 bg-[#006229]/10 text-[#006229] rounded-lg font-semibold hover:bg-[#006229]/20 disabled:opacity-50"
                              >
                                Available
                              </button>
                            )}
                            {team.AvailabilityStatus !== "Deployed" && (
                              <button
                                disabled={updating === team.TeamID}
                                onClick={() =>
                                  handleStatus(team.TeamID, "Deployed")
                                }
                                className="text-xs px-2.5 py-1 bg-[#f57c00]/10 text-[#e65100] rounded-lg font-semibold hover:bg-[#f57c00]/20 disabled:opacity-50"
                              >
                                Deployed
                              </button>
                            )}
                            {team.AvailabilityStatus !== "Unavailable" && (
                              <button
                                disabled={updating === team.TeamID}
                                onClick={() =>
                                  handleStatus(team.TeamID, "Unavailable")
                                }
                                className="text-xs px-2.5 py-1 bg-[#ba1a1a]/10 text-[#ba1a1a] rounded-lg font-semibold hover:bg-[#ba1a1a]/20 disabled:opacity-50"
                              >
                                Unavailable
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

      {/* Add Team Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="px-5 py-0 border-b border-[#e6e8ea] flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-[#191c1e]">Add New Team</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-[#434655] hover:text-[#191c1e] p-1 rounded-lg hover:bg-[#f2f4f6]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {[
                { key: "TeamName", label: "Team Name *", type: "text" },
                {
                  key: "Specialization",
                  label: "Specialization *",
                  type: "text",
                },
                { key: "ContactInfo", label: "Contact Info *", type: "text" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">
                    {label}
                  </label>
                  <input
                    required
                    type={type}
                    value={formData[key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                    className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none"
                  />
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">
                  Status *
                </label>
                <select
                  required
                  value={formData.AvailabilityStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      AvailabilityStatus: e.target.value,
                    })
                  }
                  className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Deployed">Deployed</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              {/* Map picker - reduced height */}
              <div>
                <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">
                  Team Base Location
                </label>
                <p className="text-xs text-[#434655] mt-0.5 mb-1">
                  Pin the team's home base.
                </p>
                <div className="h-40">
                  <MapLocationPicker
                    onLocationSelect={(lat, lng) =>
                      setFormData((prev) => ({
                        ...prev,
                        Latitude: lat,
                        Longitude: lng,
                      }))
                    }
                    initialLat={
                      formData.Latitude
                        ? parseFloat(formData.Latitude)
                        : undefined
                    }
                    initialLng={
                      formData.Longitude
                        ? parseFloat(formData.Longitude)
                        : undefined
                    }
                  />
                </div>
                {formData.Latitude && formData.Longitude && (
                  <p className="text-xs text-[#004ac6] mt-1 font-medium">
                    📍 {Number(formData.Latitude).toFixed(5)},{" "}
                    {Number(formData.Longitude).toFixed(5)}
                  </p>
                )}
              </div>
            </div>

            {/* Footer - always visible at bottom */}
            <div className="px-5 py-3 border-t border-[#e6e8ea] bg-white shrink-0 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-[#434655] bg-[#f2f4f6] hover:bg-[#e6e8ea] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                onClick={handleAddSubmit}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-primary hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {saving ? "Saving..." : "Save Team"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResponseTeamsPage() {
  return (
    <SidebarProvider>
      <ResponseTeamsContent />
    </SidebarProvider>
  );
}
