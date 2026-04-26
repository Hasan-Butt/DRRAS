"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SEARCHABLE_PAGES = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Disasters", href: "/disasters" },
  { label: "Resources", href: "/resources" },
  { label: "Locations", href: "/locations" },
  { label: "Requests", href: "/requests" },
  { label: "Response Teams", href: "/responseteams" },
  { label: "Allocations", href: "/allocations" },
];

export default function Topbar({ title }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    // Apply dark theme if saved
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }

    fetch("/api/requests?status=Pending")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPendingRequests(data.length);
        }
      })
      .catch(() => {});
  }, []);

  const filteredPages = SEARCHABLE_PAGES.filter(p => p.label.toLowerCase().includes(search.toLowerCase()));

  const handleSearchNav = (href) => {
    router.push(href);
    setSearch("");
    setShowSearchDropdown(false);
  };

  return (
    <header className="sticky top-0 z-30 flex justify-between items-center h-16 px-8 w-full bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60">
      <span className="text-xl font-black tracking-tight text-slate-900">{title || "DRRAS"}</span>
      <div className="flex items-center gap-4">
        
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search system..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSearchDropdown(e.target.value.length > 0);
            }}
            onFocus={() => setShowSearchDropdown(search.length > 0)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            className="pl-9 pr-4 py-1.5 bg-slate-100/70 border-none rounded-full text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 transition-all"
          />
          {showSearchDropdown && search.length > 0 && (
            <div className="absolute top-10 left-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              {filteredPages.length > 0 ? (
                filteredPages.map(page => (
                  <button
                    key={page.href}
                    onClick={() => handleSearchNav(page.href)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Go to <span className="font-bold">{page.label}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-slate-500">No matching pages.</div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="flex items-center gap-1 relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors relative"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {pendingRequests > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute top-12 right-0 w-72 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
              </div>
              <div className="p-2 max-h-64 overflow-y-auto">
                {pendingRequests > 0 ? (
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 mb-2">
                    <p className="text-sm text-blue-900 font-medium">You have {pendingRequests} pending resource requests.</p>
                    <Link href="/requests" className="text-xs text-blue-600 font-bold mt-1 inline-block hover:underline">View Requests &rarr;</Link>
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
          
          {showSettings && (
            <div className="absolute top-12 right-0 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="p-2">
                <button 
                  onClick={() => {
                    const isDark = document.documentElement.classList.toggle('dark');
                    localStorage.setItem('theme', isDark ? 'dark' : 'light');
                    setShowSettings(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 rounded-lg"
                >
                  <span className="material-symbols-outlined text-[18px]">dark_mode</span>
                  Toggle Dark Theme
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile AD */}
        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm"
          >
            AD
          </button>
          
          {showProfile && (
            <div className="absolute top-12 right-0 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h4 className="text-sm font-bold text-slate-800">Admin User</h4>
                <p className="text-xs text-slate-500">System Administrator</p>
              </div>
              <div className="p-2">
                <button 
                  onClick={async () => {
                    await fetch("/api/logout", { method: "POST" });
                    window.location.href = "/login";
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 rounded-lg font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
