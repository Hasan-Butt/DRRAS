"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] relative overflow-hidden p-6">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#004ac6]/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ba1a1a]/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[440px] z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg mb-4">
            <span className="material-symbols-outlined text-white text-[32px] icon-fill">shield</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#191c1e]">The Sentinel</h1>
          <p className="text-[#434655] font-medium mt-1">Disaster Response & Resource Allocation</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
          <h2 className="text-xl font-bold text-[#191c1e] mb-1">Welcome Back</h2>
          <p className="text-sm text-[#434655] mb-8">Enter your credentials to access the command center.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-[#ba1a1a] text-sm px-4 py-3 rounded-xl flex items-center gap-3 border border-red-100">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#434655] uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004ac6] transition-colors text-[20px]">mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@drras.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm text-[#191c1e] focus:ring-2 focus:ring-[#004ac6] transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#434655] uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004ac6] transition-colors text-[20px]">lock</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm text-[#191c1e] focus:ring-2 focus:ring-[#004ac6] transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-primary text-white rounded-2xl font-bold shadow-ambient hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 mt-2"
            >
              {loading ? "Authenticating..." : "Sign In to Sentinel"}
            </button>
          </form>

          {/* Quick Help */}
          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-xs text-[#434655]">
              Contact system administrator for password resets.
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-6 mt-8">
          <a href="#" className="text-xs font-semibold text-slate-400 hover:text-[#004ac6] transition-colors">Privacy Policy</a>
          <a href="#" className="text-xs font-semibold text-slate-400 hover:text-[#004ac6] transition-colors">Terms of Service</a>
          <a href="#" className="text-xs font-semibold text-slate-400 hover:text-[#004ac6] transition-colors">v2.4.0</a>
        </div>
      </div>
    </div>
  );
}
