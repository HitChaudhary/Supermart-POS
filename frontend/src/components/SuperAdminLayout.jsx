import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Users, LayoutDashboard,
  ChevronRight, Store, Bell, Menu,
  LogOut, Settings,
} from 'lucide-react';

const NAV = [
  { to: '/superadmin/control-panel', icon: Users,           label: 'Control Panel'  },
  { to: '/superadmin/dashboard',     icon: LayoutDashboard, label: 'Overview'       },
];

export default function SuperAdminLayout() {
  const { user, logout }  = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();

  const pageTitle = NAV.find(n => location.pathname.startsWith(n.to))?.label || 'Super Admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#09090b] overflow-hidden select-none">

      {/* Sidebar */}
      <aside className={`flex-shrink-0 flex flex-col bg-[#0d0b12] border-r border-purple-500/10 transition-all duration-300 ${collapsed ? 'w-[64px]' : 'w-[220px]'}`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-purple-500/10 h-[64px]">
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
            <Shield size={16} className="text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span className="font-black text-[16px] tracking-tight text-white">
              Super<span className="text-purple-400">Admin</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150
                ${isActive
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                }`
              }
            >
              <Icon size={17} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mx-2 mb-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={17} className="flex-shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>

        {/* Collapse */}
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          className="m-3 mt-0 flex items-center justify-center h-9 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white transition-colors outline-none"
        >
          {collapsed ? <ChevronRight size={15} /> : <Menu size={15} />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 h-[64px] border-b border-purple-500/10 bg-[#0d0b12]">
          <div>
            <h1 className="text-[18px] font-black text-white tracking-tight">{pageTitle}</h1>
            <p className="text-[11px] text-zinc-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
              SuperMart Super Admin Console
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <Bell size={15} />
            </button>

            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <div className="w-7 h-7 rounded-lg bg-purple-500/30 border border-purple-500/40 flex items-center justify-center">
                <span className="text-[11px] font-black text-purple-300 uppercase">{user?.name?.[0] || 'S'}</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[12px] font-bold text-zinc-300 max-w-[100px] truncate leading-none mb-0.5">{user?.name}</span>
                <span className="text-[9px] font-black text-purple-400 uppercase tracking-wider leading-none">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#09090b] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
