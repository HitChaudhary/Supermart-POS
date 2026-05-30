import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  TrendingUp, AlertTriangle, CheckCircle2, Clock, 
  XCircle, Users, ArrowRight, Package
} from 'lucide-react';

const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;

// ── Reusable Stat Card Component ──────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, accent, onClick }) => (
  <button
    onClick={onClick}
    className={`group text-left w-full bg-[#111115] border rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl
      ${accent === 'emerald' ? 'border-emerald-500/15 hover:border-emerald-500/30 hover:shadow-emerald-500/10' :
        accent === 'orange'  ? 'border-orange-500/15  hover:border-orange-500/30  hover:shadow-orange-500/10'  :
        accent === 'red'     ? 'border-red-500/15     hover:border-red-500/30     hover:shadow-red-500/10'     :
                               'border-white/5        hover:border-white/10'}`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
        ${accent === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' :
          accent === 'orange'  ? 'bg-orange-500/15  text-orange-400'  :
          accent === 'red'     ? 'bg-red-500/15     text-red-400'     :
                                 'bg-white/5        text-zinc-400'    }`}
      >
        <Icon size={18} />
      </div>
      <ArrowRight size={14} className="text-zinc-700 group-hover:text-zinc-400 transition-colors mt-1" />
    </div>
    <p className="text-2xl font-black text-white font-mono tracking-tight">{value}</p>
    <p className="text-[13px] font-semibold text-zinc-400 mt-1">{label}</p>
    {sub && <p className="text-[11px] text-zinc-600 mt-0.5">{sub}</p>}
  </button>
);

// ── Order status badge ────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    paid:    { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Paid' },
    partial: { cls: 'bg-orange-500/10  text-orange-400  border-orange-500/20',  label: 'Partial' },
    unpaid:  { cls: 'bg-red-500/10     text-red-400     border-red-500/20',     label: 'Unpaid' },
  }[status?.toLowerCase()] || { cls: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', label: status };

  return (
    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

// ── Main Controller Component ───────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  
  const [stats, setStats]         = useState(null);
  const [recentOrders, setOrders] = useState([]);
  const [loading, setLoading]     = useState(true);

  // Poll database clusters asynchronously upon loading mount
  useEffect(() => {
    const fetchDashboardContext = async () => {
      setLoading(true);
      try {
        // 1. Fetch live report calculations via your high-level overview analytics endpoint
        const reportsRes = await axios.get('/api/reports/dashboard');
        setStats(reportsRes.data);

        // 2. Query recent transaction records dynamically via your secure order registry route
        const ordersRes = await axios.get('/api/orders?limit=6&page=1');
        setOrders(ordersRes.data?.orders || []);
      } catch (err) {
        console.error("Dashboard database sync failed: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardContext();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-semibold tracking-wider">Syncing operational data logs...</p>
      </div>
    );
  }

  // Derived calculations cleanly destructured from backend response vectors
  const todayRevenue = stats.today?.revenue || 0;
  const todayBills   = stats.today?.bills || 0;
  const lowStockCount = stats.lowStock?.length || 0;
  const outStockCount = stats.outOfStock || 0;

  return (
    <div className="space-y-6">

      {/* ── Stat cards panel ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Today's Revenue"  
          value={fmt(todayRevenue)}  
          sub={`${todayBills} bill(s) created today`}    
          icon={TrendingUp}    
          accent="emerald" 
          onClick={() => navigate('/admin/reports')} 
        />
        <StatCard 
          label="Settled Invoices"        
          value={stats.today?.paid || 0}          
          sub="Fully collected today"                                
          icon={CheckCircle2}  
          accent="emerald" 
          onClick={() => navigate('/admin/orders')}  
        />
        <StatCard 
          label="Pending / Unsettled" 
          value={(stats.today?.partial || 0) + (stats.today?.unpaid || 0)} 
          sub={`${fmt(stats.outstanding)} total outstanding`} 
          icon={Clock} 
          accent="orange" 
          onClick={() => navigate('/admin/orders')} 
        />
        <StatCard 
          label="Inventory Alerts"      
          value={lowStockCount + outStockCount} 
          sub={`${outStockCount} out of stock, ${lowStockCount} low`} 
          icon={AlertTriangle} 
          accent="red"    
          onClick={() => navigate('/admin/products')} 
        />
      </div>

      {/* ── Two-column operational section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent orders ledger list */}
        <div className="lg:col-span-2 bg-[#111115] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="font-black text-[15px] text-white">Recent Real-time Orders</h3>
            <button onClick={() => navigate('/admin/orders')} className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {recentOrders.length === 0 ? (
              <p className="text-center p-8 text-zinc-600 text-xs font-medium">No order elements recorded in your database.</p>
            ) : recentOrders.map(o => {
              // Gracefully handle strings or object instances populated down from Mongoose models
              const cashierDisplay = typeof o.cashier === 'object' ? o.cashier?.name : 'System Operator';
              return (
                <div key={o._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[1.5%] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-white font-mono truncate">ID: {o._id}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{cashierDisplay} · {o.items?.length || 0} unique items</p>
                  </div>
                  <StatusBadge status={o.paymentStatus} />
                  <div className="text-right">
                    <p className="text-[14px] font-black text-white font-mono">{fmt(o.total)}</p>
                    <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider mt-0.5">{o.paymentMethod || 'CASH'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic low stock warning indicators side tray */}
        <div className="bg-[#111115] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="font-black text-[15px] text-white">Stock Warnings Basket</h3>
            <button onClick={() => navigate('/admin/products')} className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Manage <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-white/5 max-h-[350px] overflow-y-auto">
            {stats.lowStock?.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 space-y-2">
                <Package size={24} className="mx-auto opacity-20" />
                <p className="text-xs font-medium text-emerald-500/80">✓ Inventory levels are balanced.</p>
              </div>
            ) : stats.lowStock?.map(p => (
              <div key={p._id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-white truncate">{p.name}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Scale notation unit: {p.unit || 'unit'}</p>
                </div>
                <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg font-mono
                  ${p.stock === 0 ? 'bg-red-500/15 text-red-400' : 'bg-orange-500/15 text-orange-400'}`}>
                  {p.stock === 0 ? 'OUT' : `${p.stock} Left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── System Operations Operators Information Bar ── */}
      <div className="bg-[#111115] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="font-black text-[15px] text-white flex items-center gap-2">
            <Users size={16} className="text-emerald-400" /> Active Database System Cashiers
          </h3>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 bg-white/[2%] p-4 border border-white/5 rounded-xl max-w-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
              ∑
            </div>
            <div>
              <p className="text-[14px] font-black text-white">{stats.totalCashiers || 0} Cashiers Registered</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Authorized to process client sales tickets safely.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}