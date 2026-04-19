export default function Topbar({ title }) {
  return (
    <header className="sticky top-0 z-30 flex justify-between items-center h-16 px-8 w-full bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60">
      <span className="text-xl font-black tracking-tight text-slate-900">DRRAS</span>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search system..."
            className="pl-9 pr-4 py-1.5 bg-slate-100/70 border-none rounded-full text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 transition-all"
          />
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors relative">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
          AD
        </div>
      </div>
    </header>
  );
}
