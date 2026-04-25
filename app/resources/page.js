"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const EMPTY = { ResourceName: "", ResourceType: "", TotalQuantity: "", AvailableQuantity: "", Units: "" };

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/resources").then((r) => r.json()).then((d) => { setResources(d); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = resources.filter((r) =>
    r.ResourceName?.toLowerCase().includes(search.toLowerCase()) ||
    r.ResourceType?.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems    = resources.reduce((s, r) => s + (r.TotalQuantity || 0), 0);
  const deployedItems = resources.reduce((s, r) => s + ((r.TotalQuantity || 0) - (r.AvailableQuantity || 0)), 0);
  const lowStock      = resources.filter((r) => r.AvailableQuantity < r.TotalQuantity * 0.2).length;

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const res = await fetch("/api/resources", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, TotalQuantity: Number(form.TotalQuantity), AvailableQuantity: Number(form.AvailableQuantity) }),
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

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight text-[#191c1e]">Resource Inventory</h1>
              <p className="text-[#434655] mt-1 text-lg">Manage and track all response assets and supplies.</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="bg-gradient-primary text-white px-6 py-3.5 rounded-xl font-semibold flex items-center gap-2 shadow-ambient hover:opacity-95 transition-opacity">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Resource
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label: "Total Stock",   val: totalItems.toLocaleString(), icon: "inventory_2",  iconBg: "bg-[#004ac6]/15", iconColor: "text-[#004ac6]", bg: "widgets" },
              { label: "Deployed",      val: deployedItems.toLocaleString(), icon: "local_shipping", iconBg: "bg-[#00687a]/15", iconColor: "text-[#00687a]", bg: "send" },
              { label: "Low Stock",     val: lowStock,                    icon: "warning",       iconBg: "bg-[#ba1a1a]/15", iconColor: "text-[#ba1a1a]", bg: "error" },
            ].map(({ label, val, icon, iconBg, iconColor, bg }) => (
              <div key={label} className="bg-white rounded-xl p-6 shadow-ambient relative overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
                    <span className="material-symbols-outlined text-[16px]">{icon}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#434655] uppercase tracking-wider">{label}</p>
                </div>
                <div className={`text-4xl font-black ${label === "Low Stock" && Number(val) > 0 ? "text-[#ba1a1a]" : "text-[#191c1e]"}`}>{val}</div>
                <div className="absolute -bottom-4 -right-4 text-[#e6e8ea]">
                  <span className="material-symbols-outlined" style={{ fontSize: "5rem" }}>{bg}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Search + Table */}
          <div className="space-y-4">
            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] text-[16px]">search</span>
              <input type="text" placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#c3c6d7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#004ac6] outline-none shadow-sm" />
            </div>

            <div className="bg-white rounded-xl shadow-ambient overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f2f4f6]/50">
                    {["Name","Type","Total","Available","Units","Utilisation"].map((h) => (
                      <th key={h} className="py-4 px-6 text-xs font-semibold text-[#434655] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr><td colSpan={6} className="py-12 text-center text-[#434655]">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-[#434655]">No resources found.</td></tr>
                  ) : filtered.map((r, i) => {
                    const used  = r.TotalQuantity - r.AvailableQuantity;
                    const pct   = r.TotalQuantity ? Math.round((used / r.TotalQuantity) * 100) : 0;
                    const isLow = r.AvailableQuantity < r.TotalQuantity * 0.2;
                    return (
                      <tr key={r.ResourceID} className={`border-t border-[#e6e8ea]/50 transition-colors ${i % 2 ? "bg-[#f2f4f6]/20" : ""} hover:bg-[#f2f4f6]/50`}>
                        <td className="py-4 px-6 font-semibold text-[#191c1e]">{r.ResourceName}</td>
                        <td className="py-4 px-6 text-[#434655]">{r.ResourceType}</td>
                        <td className="py-4 px-6 text-[#191c1e] font-medium">{r.TotalQuantity?.toLocaleString()}</td>
                        <td className={`py-4 px-6 font-medium ${isLow ? "text-[#ba1a1a]" : "text-[#191c1e]"}`}>{r.AvailableQuantity?.toLocaleString()}</td>
                        <td className="py-4 px-6 text-[#434655]">{r.Units}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-[#e6e8ea] rounded-full h-1.5">
                              <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: pct > 80 ? "#ba1a1a" : "#004ac6" }}></div>
                            </div>
                            <span className="text-xs text-[#434655] w-10 text-right">{pct}%</span>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#191c1e]">Add Resource</h2>
              <button onClick={() => { setShowModal(false); setError(""); }} className="text-[#434655] hover:text-[#191c1e] p-1 rounded-lg hover:bg-[#f2f4f6]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {error && <p className="text-sm text-[#ba1a1a] bg-[#ffdad6] px-3 py-2 rounded-lg">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: "ResourceName",      label: "Resource Name *", type: "text",   req: true },
                { key: "ResourceType",      label: "Type *",          type: "text",   req: true },
                { key: "TotalQuantity",     label: "Total Quantity *", type: "number", req: true },
                { key: "AvailableQuantity", label: "Available Qty *",  type: "number", req: true },
                { key: "Units",             label: "Units *",          type: "text",   req: true },
              ].map(({ key, label, type, req }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-[#434655] uppercase tracking-wide">{label}</label>
                  <input required={req} type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="mt-1 w-full border border-[#c3c6d7]/60 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none" />
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setError(""); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#434655] bg-[#f2f4f6] hover:bg-[#e6e8ea] transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary hover:opacity-90 disabled:opacity-60 transition-opacity">
                  {saving ? "Saving..." : "Add Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
