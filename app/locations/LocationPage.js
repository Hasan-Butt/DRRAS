"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const STATUS_LEVELS = (incidents) =>
  incidents >= 3 ? "Critical" : incidents >= 1 ? "Elevated" : "Stable";

const STATUS_STYLES = {
  Critical: { bar: "bg-[#ba1a1a]", badge: "bg-[#ba1a1a]/15 text-[#ba1a1a]", text: "text-[#ba1a1a]" },
  Elevated: { bar: "bg-[#00687a]", badge: "bg-[#00687a]/15 text-[#00687a]", text: "text-[#00687a]" },
  Stable:   { bar: "bg-[#006229]", badge: "bg-[#006229]/15 text-[#006229]", text: "text-[#006229]" },
};

const EMPTY = { City: "", Region: "", Latitude: "", Longitude: "" };

export default function LocationPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/locations").then((r) => r.json()).then((d) => { setLocations(d); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = locations.filter((l) =>
    l.City?.toLowerCase().includes(search.toLowerCase()) ||
    l.Region?.toLowerCase().includes(search.toLowerCase())
  );

  const critical = locations.filter((l) => STATUS_LEVELS(l.ActiveIncidents) === "Critical").length;
  const elevated = locations.filter((l) => STATUS_LEVELS(l.ActiveIncidents) === "Elevated").length;
  const stable   = locations.filter((l) => STATUS_LEVELS(l.ActiveIncidents) === "Stable").length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, Latitude: Number(form.Latitude), Longitude: Number(form.Longitude) }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      setShowModal(false); setForm(EMPTY); load();
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f9fb]">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-y-auto">
        <Topbar />
        <main className="flex-1 p-8 space-y-8">

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#434655] uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-pulse"></span>
                Operational Sector Alpha
              </p>
              <h1 className="text-5xl font-extrabold tracking-tight text-[#191c1e]">Locations</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative bg-white rounded-xl shadow-ambient px-4 py-2 flex items-center gap-2 w-64 border border-[#c3c6d7]/20">
                <span className="material-symbols-outlined text-[#434655] text-[16px]">search</span>
                <input type="text" placeholder="Search sectors..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm w-full text-[#191c1e] outline-none" />
              </div>
              <button onClick={() => setShowModal(true)}
                className="bg-gradient-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-ambient hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-[16px]">add</span>
                New Sector
              </button>
            </div>
          </div>

          {/* Summary Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-ambient col-span-1 md:col-span-2 relative overflow-hidden border border-[#c3c6d7]/20">
              <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-[#004ac6]/5 to-transparent pointer-events-none"></div>
              <div className="flex justify-between items-start mb-3">
                <p className="text-sm font-medium text-[#434655]">Global Status Overview</p>
                <span className="material-symbols-outlined text-[#004ac6]">public</span>
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-5xl font-extrabold text-[#191c1e]">{loading ? "—" : locations.length}</span>
                <span className="text-[#434655] text-sm font-medium">Active Zones</span>
              </div>
              <div className="mt-5 flex gap-6">
                {[{ label: "Critical", val: critical, color: "text-[#ba1a1a]" },
                  { label: "Elevated", val: elevated, color: "text-[#00687a]" },
                  { label: "Stable",   val: stable,   color: "text-[#006229]" }].map(({ label, val, color }, i) => (
                  <div key={label} className={`flex flex-col ${i > 0 ? "pl-6 border-l border-[#e6e8ea]" : ""}`}>
                    <span className="text-xs text-[#434655] uppercase tracking-wider mb-1">{label}</span>
                    <span className={`text-lg font-bold ${color}`}>{loading ? "—" : val} Areas</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-ambient border border-[#c3c6d7]/20 flex flex-col justify-between">
              <div>
                <p className="text-sm font-medium text-[#434655] mb-3">Total Locations</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-[#191c1e]">{loading ? "—" : locations.length}</span>
                </div>
              </div>
              <div className="mt-4 w-full bg-[#e6e8ea] rounded-full h-2">
                <div className="bg-gradient-to-r from-[#004ac6] to-[#57dffe] h-2 rounded-full"
                  style={{ width: locations.length ? `${Math.min((stable / locations.length) * 100, 100)}%` : "0%" }}></div>
              </div>
              <p className="text-xs text-[#434655] mt-2 text-right">
                {locations.length ? Math.round((stable / locations.length) * 100) : 0}% Stable
              </p>
            </div>
          </div>

          {/* Location Cards Grid */}
          {loading ? (
            <div className="text-center py-16 text-[#434655]">Loading locations...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-[#434655]">No locations found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((loc) => {
                const level = STATUS_LEVELS(loc.ActiveIncidents);
                const st = STATUS_STYLES[level];
                return (
                  <div key={loc.LocationID}
                    className="bg-white rounded-xl p-6 shadow-ambient border border-[#c3c6d7]/20 flex flex-col group hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${st.bar}`}></div>
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <h3 className="text-lg font-bold text-[#191c1e] mb-1">{loc.City}</h3>
                        <p className="text-sm text-[#434655] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {loc.Region}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${st.badge}`}>{level}</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      {[
                        { label: "Active Incidents",    val: loc.ActiveIncidents ?? 0 },
                        { label: "Latitude",            val: loc.Latitude },
                        { label: "Longitude",           val: loc.Longitude },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex justify-between items-center py-2 border-b border-[#e6e8ea]/50">
                          <span className="text-sm text-[#434655]">{label}</span>
                          <span className="font-bold text-[#191c1e]">{val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-[#c3c6d7]/20 flex justify-end">
                      <button className="text-[#004ac6] text-sm font-semibold hover:text-[#2563eb] transition-colors flex items-center gap-1">
                        View Details <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Add Location Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#191c1e]">Add New Sector</h2>
              <button onClick={() => { setShowModal(false); setError(""); }}
                className="text-[#434655] hover:text-[#191c1e] p-1 rounded-lg hover:bg-[#f2f4f6] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {error && <p className="text-sm text-[#ba1a1a] bg-[#ffdad6] px-3 py-2 rounded-lg">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: "City",      label: "City *",      type: "text",   req: true },
                { key: "Region",    label: "Region *",    type: "text",   req: true },
                { key: "Latitude",  label: "Latitude *",  type: "number", req: true, step: "any" },
                { key: "Longitude", label: "Longitude *", type: "number", req: true, step: "any" },
              ].map(({ key, label, type, req, step }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">{label}</label>
                  <input required={req} type={type} step={step} value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none" />
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setError(""); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#434655] bg-[#f2f4f6] hover:bg-[#e6e8ea] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary hover:opacity-90 disabled:opacity-60 transition-opacity">
                  {saving ? "Saving..." : "Add Sector"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
