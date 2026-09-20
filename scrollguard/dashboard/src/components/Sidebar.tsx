import { Shield, LayoutDashboard, Grid, PieChart, History, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeRoute: string;
}

export default function Sidebar({ activeRoute }: SidebarProps) {
  const menuItems = [
    { name: 'Overview', route: 'overview', icon: LayoutDashboard, path: '#/overview' },
    { name: 'Addiction Heatmap', route: 'heatmap', icon: Grid, path: '#/heatmap' },
    { name: 'Platform Pace', route: 'platforms', icon: PieChart, path: '#/platforms' },
    { name: 'Session Timeline', route: 'sessions', icon: History, path: '#/sessions' },
    { name: 'AI Coach', route: 'coach', icon: Sparkles, path: '#/coach' },
  ];

  const handleNav = (path: string) => {
    window.location.hash = path;
  };

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-900 flex flex-col justify-between py-6 px-4 h-screen text-slate-400 select-none">
      {/* Brand Identity */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <Shield className="w-8 h-8 text-indigo-500 filter drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
          <div className="flex flex-col">
            <span className="font-bold text-white text-lg tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ScrollGuard
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Control Panel
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const isActive = activeRoute === item.route;
            return (
              <button
                key={item.name}
                onClick={() => handleNav(item.path)}
                className={`flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 group active:scale-[0.98] cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/15 to-purple-600/15 text-indigo-400 border-l-2 border-indigo-500'
                    : 'hover:bg-slate-900/60 hover:text-white'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="px-2 border-t border-slate-900 pt-4 flex flex-col gap-1">
        <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
          Version 1.0.0
        </span>
        <span className="text-xs text-slate-400">Running local-only</span>
      </div>
    </aside>
  );
}
