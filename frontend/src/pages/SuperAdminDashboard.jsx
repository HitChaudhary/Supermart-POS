import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Users, Shield, Crown, TrendingUp,
  UserCheck, UserX, BarChart3, RefreshCw,
  ArrowRight, Store,
} from 'lucide-react';

const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [users,   setUsers]   = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [usersRes, statsRes] = await Promise.all([
          axios.get('/api/users/control-panel'),
          axios.get('/api/reports/dashboard'),
        ]);
        setUsers(usersRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('SuperAdmin dashboard load failed', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-semibold">Loading system overview...</p>
      </div>
    );
  }

  const admins    = users.filter(u => u.role === 'admin');
  const cashiers  = users.filter(u => u.role === 'cashier');
  const active    = users.filter(u => u.isActive && u.role !== 'superadmin');
  const inactive  = users.filter(u => !u.isActive);

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/15 rounded-2xl px-6 py-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
          <Crown size={22} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white">System Overview</h2>
          <p className="text-sm text-zinc-500">Full visibility across all users, roles, and store activity.</p>
        </div>
        <button
          onClick={() => navigate('/superadmin/control-panel')}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-black transition-all"
        >
          Manage Users <ArrowRight size={14} />
        </button>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff',    value: users.filter(u => u.role !== 'superadmin').length, icon: Users,     color: 'text-white',        bg: 'bg-white/5',           border: 'border-white/5'           },
          { label: 'Admins',         value: admins.length,                                      icon: Shield,    color: 'text-emerald-400',  bg: 'bg-emerald-500/10',    border: 'border-emerald-500/15'    },
          { label: 'Cashiers',       value: cashiers.length,                                    icon: UserCheck, color: 'text-blue-400',     bg: 'bg-blue-500/10',       border: 'border-blue-500/15'       },
          { label: 'Inactive Users', value: inactive.length,                                    icon: UserX,     color: 'text-red-400',      bg: 'bg-red-500/10',        border: 'border-red-500/15'        },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-5`}>
            <s.icon size={18} className={`${s.color} mb-3`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[12px] text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Store Metrics (from reports) */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-[#111115] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={15} className="text-emerald-400" />
              <span className="text-[12px] font-bold text-zinc-400">Today's Revenue</span>
            </div>
            <p className="text-2xl font-black text-white">{fmt(stats.today?.revenue)}</p>
            <p className="text-[11px] text-zinc-600 mt-1">{stats.today?.bills || 0} bills today</p>
          </div>

          <div className="bg-[#111115] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={15} className="text-orange-400" />
              <span className="text-[12px] font-bold text-zinc-400">Outstanding</span>
            </div>
            <p className="text-2xl font-black text-orange-400">{fmt(stats.outstanding)}</p>
            <p className="text-[11px] text-zinc-600 mt-1">Unpaid / partial orders</p>
          </div>

          <div className="bg-[#111115] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Store size={15} className="text-red-400" />
              <span className="text-[12px] font-bold text-zinc-400">Stock Alerts</span>
            </div>
            <p className="text-2xl font-black text-red-400">{(stats.lowStock?.length || 0) + (stats.outOfStock || 0)}</p>
            <p className="text-[11px] text-zinc-600 mt-1">{stats.outOfStock || 0} out of stock</p>
          </div>
        </div>
      )}

      {/* User List Preview */}
      <div className="bg-[#111115] border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="font-black text-[14px] text-white flex items-center gap-2">
            <Users size={14} className="text-purple-400" /> Staff Accounts
          </h3>
          <button
            onClick={() => navigate('/superadmin/control-panel')}
            className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Manage all <ArrowRight size={11} />
          </button>
        </div>
        <div className="divide-y divide-white/[3%]">
          {users.filter(u => u.role !== 'superadmin').slice(0, 8).map(u => (
            <div key={u._id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[1.5%] transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[13px]
                ${u.role === 'admin' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {u.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white truncate">{u.name}</p>
                <p className="text-[11px] text-zinc-600 truncate">{u.email}</p>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border
                ${u.role === 'admin'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                {u.role}
              </span>
              <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
