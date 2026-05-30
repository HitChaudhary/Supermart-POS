import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, ShoppingBag,
  BarChart3, Users, ChevronRight,
  Store, Bell, Menu, Layers, LogOut,
} from 'lucide-react';

const buildNav = (permissions, role) => {
  const isSuperAdmin = role === 'superadmin';
  return [
    { to: '/admin/dashboard',        icon: LayoutDashboard, label: 'Dashboard',     show: true },
    { to: '/admin/products',         icon: Package,         label: 'Products',      show: isSuperAdmin || permissions?.canManageProducts },
    { to: '/admin/stock-management', icon: Layers,          label: 'Stock Manager', show: isSuperAdmin || permissions?.canManageProducts },
    { to: '/admin/orders',           icon: ShoppingBag,     label: 'Orders',        show: true },
    { to: '/admin/reports',          icon: BarChart3,       label: 'Reports',       show: isSuperAdmin || permissions?.canViewReports },
    { to: '/admin/cashiers',         icon: Users,           label: 'Cashiers',      show: true },
  ].filter(n => n.show);
};

export default function AdminLayout() {
  const { user, logout }  = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();

  const NAV = buildNav(user?.permissions, user?.role);
  const pageTitle = NAV.find(n => location.pathname.startsWith(n.to))?.label || 'Admin';

  const currentName = user?.name || 'Admin';
  const roleLabel   = user?.role === 'superadmin' ? 'Super Admin' : 'Admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#09090b] overflow-hidden select-none">

      {/* Sidebar */}
      <aside className={`flex-shrink-0 flex flex-col bg-[#0f0f12] border-r border-white/5 transition-all duration-300 ${collapsed ? 'w-[64px]' : 'w-[220px]'}`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5 h-[64px]">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
            <Store size={16} className="text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span className="font-black text-[16px] tracking-tight text-white">
              Super<span className="text-emerald-500">Mart</span>
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
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
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
        <header className="flex-shrink-0 flex items-center justify-between px-6 h-[64px] border-b border-white/5 bg-[#0f0f12]">
          <div>
            <h1 className="text-[18px] font-black text-white tracking-tight">{pageTitle}</h1>
            <p className="text-[11px] text-zinc-600">SuperMart {roleLabel} Console</p>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            </button>

            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <span className="text-[11px] font-black text-emerald-400 uppercase">{currentName[0]}</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[12px] font-bold text-zinc-300 max-w-[100px] truncate leading-none mb-0.5">{currentName}</span>
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider leading-none">{user?.role}</span>
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
