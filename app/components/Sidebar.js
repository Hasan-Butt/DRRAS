"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSidebar } from "../context/SidebarContext";

const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/disasters", icon: "emergency", label: "Disasters" },
  { href: "/resources", icon: "inventory_2", label: "Resources" },
  { href: "/locations", icon: "distance", label: "Locations" },
  { href: "/requests", icon: "list_alt", label: "Requests" },
  { href: "/responseteams", icon: "groups", label: "Response Teams" },
  { href: "/allocations", icon: "local_shipping", label: "Allocations" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [showSupport, setShowSupport] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col h-screen fixed left-0 top-0 bg-slate-50 border-r border-slate-200/60 z-40 py-6 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } `}
    >
      {/* Brand & Toggle */}
      <div className="px-6 mb-8 flex items-center gap-3 justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3 flex-1">
            <img src="/DRRAS.png" alt="DDRAS Logo" className="w-10 h-10" />
            <div>
              <p>Disaster Response System</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <img src="/DRRAS.png" alt="DDRAS Logo" className="w-10 h-10" />
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          <span className="material-symbols-outlined text-[20px] text-slate-600">
            {isCollapsed ? "chevron_right" : "chevron_left"}
          </span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ href, icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-r-full text-sm font-medium transition-all duration-200 hover:translate-x-1 ${
                active
                  ? "text-blue-700 font-bold bg-blue-50"
                  : "text-slate-500 hover:bg-slate-100"
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? label : ""}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${active ? "icon-fill" : ""}`}
              >
                {icon}
              </span>
              {!isCollapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pt-6 border-t border-slate-200/60 space-y-1 relative">
        <button
          onClick={() => setShowSupport(!showSupport)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-r-full text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all duration-200 hover:translate-x-1 cursor-pointer ${isCollapsed ? "justify-center" : ""}`}
          title={isCollapsed ? "Support" : ""}
        >
          <span className="material-symbols-outlined text-[20px]">help</span>
          {!isCollapsed && <span>Support</span>}
        </button>

        {showSupport && (
          <div
            className={`fixed bottom-20 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50 w-64 ${
              isCollapsed ? "left-24" : "left-4"
            }`}
          >
            <h4 className="font-bold text-slate-800 mb-2">Need Help?</h4>
            <p className="text-xs text-slate-500 mb-3">
              Contact our support team for any issues within the system.
            </p>
            <div className="text-xs font-medium text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">
                mail
              </span>
              support@sentinel.org
              <br />
              <span className="material-symbols-outlined text-[14px] align-middle mr-1 mt-1">
                call
              </span>
              +1 (800) 555-0199
            </div>
            <button
              onClick={() => setShowSupport(false)}
              className="w-full py-1.5 bg-blue-50 text-blue-600 rounded text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              Close
            </button>
          </div>
        )}

        <button
          onClick={async () => {
            await fetch("/api/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-r-full text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 hover:translate-x-1 cursor-pointer ${isCollapsed ? "justify-center" : ""}`}
          title={isCollapsed ? "Logout" : ""}
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
