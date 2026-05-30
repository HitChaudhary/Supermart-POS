import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Lock, Eye, EyeOff, TrendingUp, Package,
  CheckCircle2, ShoppingBag, AlertTriangle, Star,
  Layers, Calendar, User, FileText, ArrowUpRight, ShieldOff,
} from 'lucide-react';

const fmt  = (n) => `₹${Number(n || 0).toFixed(2)}`;
const fmtK = (n) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : fmt(n);
const fmtDate = (iso) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  );
};

// ── Access-denied panel ───────────────────────────────────────
const AccessDenied = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="bg-[#111115] border border-red-500/20 rounded-3xl p-10 w-full max-w-sm text-center shadow-2xl">
      <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
        <ShieldOff size={28} className="text-red-400" />
      </div>
      <h2 className="text-2xl font-black text-white mb-2">Access Denied</h2>
      <p className="text-[13px] text-zinc-500">
        You do not have permission to view reports.<br />
        Contact your Super Admin to enable <code className="text-zinc-400">canViewReports</code>.
      </p>
    </div>
  </div>
);

// ── Re-auth gate: verifies via real API, not a plain string ───
const PasswordGate = ({ onUnlock }) => {
  const { user } = useAuth();
  const [pw,      setPw]      = useState('');
  const [show,    setShow]    = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);

  const submit = async () => {
    if (!pw.trim()) return;
    setLoading(true);
    setError('');
    try {
      // Re-authenticate with the server — bcrypt check, no plaintext compare
      await axios.post('/api/auth/login', { email: user.email, password: pw });
      onUnlock();
    } catch {
      setError('Incorrect password.');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPw('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className={`bg-[#111115] border border-white/10 rounded-3xl p-10 w-full max-w-sm text-center shadow-2xl transition-transform ${shaking ? 'animate-bounce' : ''}`}>
        <div className="w-16 h-16 rounded-2xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
          <Lock size={28} className="text-orange-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-1">Reports Locked</h2>
        <p className="text-[13px] text-zinc-500 mb-8">Re-enter your password to unlock reports</p>

        <div className="relative mb-4">
          <input
            type={show ? 'text' : 'password'}
            value={pw}
            onChange={e => { setPw(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Your account password…"
            className={`w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border text-[14px] font-medium text-white outline-none transition-all
              ${error ? 'border-red-500/60' : 'border-white/10 focus:border-orange-500/60 focus:bg-white/8'}`}
          />
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && (
          <p className="text-[12px] text-red-400 font-bold mb-4 flex items-center justify-center gap-1.5">
            <AlertTriangle size={12} /> {error}
          </p>
        )}

        <button type="button" onClick={submit} disabled={loading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500
            disabled:opacity-50 font-black text-[14px] text-white transition-all shadow-lg shadow-orange-500/20">
          {loading ? 'Verifying…' : 'Unlock Reports'}
        </button>
      </div>
    </div>
  );
};

// ── Bar chart ─────────────────────────────────────────────────
const BarChart = ({ data = [], valueKey, labelKey, color = 'emerald', height = 140 }) => {
  const max = data.length > 0 ? Math.max(...data.map(d => d[valueKey] ?? 0)) : 0;
  return (
    <div className="flex items-end gap-1.5 w-full overflow-x-auto pt-6" style={{ height }}>
      {data.map((d, i) => {
        const pct = max > 0 ? ((d[valueKey] ?? 0) / max) * 100 : 0;
        return (
          <div key={i} className="flex-1 min-w-[30px] flex flex-col items-center gap-1 group">
            <div className="relative w-full flex items-end" style={{ height: height - 24 }}>
              <div
                className={`w-full rounded-t-lg transition-all duration-500 group-hover:opacity-80
                  ${color === 'emerald' ? 'bg-emerald-500/40 group-hover:bg-emerald-500/60'
                  : color === 'blue'    ? 'bg-blue-500/40 group-hover:bg-blue-500/60'
                                        : 'bg-violet-500/40 group-hover:bg-violet-500/60'}`}
                style={{ height: `${pct}%` }}
              />
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block
                bg-[#1e1e24] border border-white/10 rounded-lg px-2 py-1 text-[11px] font-bold text-white shadow-xl font-mono">
                {valueKey === 'revenue' ? fmtK(d[valueKey] ?? 0) : (d[valueKey] ?? 0)}
              </div>
            </div>
            <p className="text-[9px] font-bold text-zinc-600 truncate w-full text-center">{d[labelKey]}</p>
          </div>
        );
      })}
    </div>
  );
};

const Section = ({ title, icon: Icon, accent = 'emerald', children }) => (
  <div className="bg-[#111115] border border-white/5 rounded-2xl overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/5 bg-white/[0.5%]">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center
        ${accent === 'emerald' ? 'bg-emerald-500/15 text-emerald-400'
        : accent === 'blue'   ? 'bg-blue-500/15 text-blue-400'
        : accent === 'orange' ? 'bg-orange-500/15 text-orange-400'
        : accent === 'purple' ? 'bg-purple-500/15 text-purple-400'
                              : 'bg-violet-500/15 text-violet-400'}`}>
        <Icon size={15} />
      </div>
      <h3 className="font-black text-[15px] text-white uppercase tracking-wide">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ── Main ─────────────────────────────────────────────────────
export default function Reports() {
  const { user }                                     = useAuth();
  const [unlocked, setUnlocked]                      = useState(false);
  const [period,   setPeriod]                        = useState('weekly');
  const [loading,  setLoading]                       = useState(false);
  const [dashboardStats, setDashboardStats]          = useState(null);
  const [reportDetails,  setReportDetails]           = useState(null);
  const [topProducts,    setTopProducts]             = useState([]);
  const [stockLogs,      setStockLogs]               = useState([]);

  // ── Access check: superadmin always passes; admin needs canViewReports ──
  const hasAccess =
    user?.role === 'superadmin' ||
    user?.permissions?.canViewReports === true;

  if (!hasAccess) return <AccessDenied />;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!unlocked) return;
    const load = async () => {
      setLoading(true);
      try {
        const [dashRes, topRes, logsRes] = await Promise.all([
          axios.get('/api/reports/dashboard'),
          axios.get('/api/reports/top-products?limit=5'),
          axios.get('/api/products/stock-logs'),
        ]);
        setDashboardStats(dashRes.data);
        setTopProducts(topRes.data);
        setStockLogs(Array.isArray(logsRes.data) ? logsRes.data : logsRes.data?.logs ?? []);

        const now = new Date();
        if (period === 'today' || period === 'weekly') {
          const r = await axios.get(`/api/reports/daily?date=${now.toISOString().split('T')[0]}`);
          setReportDetails(r.data);
        } else {
          const r = await axios.get(`/api/reports/monthly?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);
          setReportDetails(r.data);
        }
      } catch (err) {
        console.error('Reports load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [unlocked, period]);

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  if (loading || !dashboardStats || !reportDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-400 space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide">Loading report data…</p>
      </div>
    );
  }

  const todayRevenue   = dashboardStats.today?.revenue ?? 0;
  const outstandingDue = dashboardStats.outstanding    ?? 0;

  let chartData    = [];
  let chartValKey  = 'paidAmount';
  let chartLblKey  = '_id';

  if (period === 'today' || period === 'weekly') {
    chartData   = reportDetails.orders ?? [];
    chartValKey = 'paidAmount';
    chartLblKey = 'invoiceNo';
  } else {
    chartData   = reportDetails.byDay ?? [];
    chartValKey = 'revenue';
    chartLblKey = 'day';
  }

  const totalBills        = reportDetails.totalBills ?? chartData.length;
  const paymentMethodData = Object.entries(reportDetails.methodSplit ?? {}).map(([method, count]) => ({
    method  : method.toUpperCase(),
    count,
    revenue : (reportDetails.revenue ?? 0) * (count / (totalBills || 1)),
  }));

  // Use changedQty throughout — legacy addedQty already normalised in controller
  const totalInwardActions = stockLogs.reduce((acc, log) =>
    acc + (log.items?.length ?? 0), 0);

  return (
    <div className="space-y-6">

      {/* Period selector + lock button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[#111115] border border-white/5 rounded-xl p-1">
          {['today', 'weekly', 'monthly', 'yearly'].map(p => (
            <button key={p} type="button" onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-[12px] font-bold capitalize transition-all
                ${period === p ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {p}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setUnlocked(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 text-zinc-500 text-[12px] font-bold transition-colors">
          <Lock size={12} /> Lock Reports
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue",    value: fmt(todayRevenue),                               sub: `${dashboardStats.today?.bills ?? 0} bills today`, color: 'text-emerald-400' },
          { label: 'Period Revenue',     value: fmt(reportDetails.revenue ?? reportDetails.totalRevenue ?? 0), sub: 'Active period total',        color: 'text-blue-400'    },
          { label: 'GST Collected',      value: fmt(reportDetails.gstTotal ?? reportDetails.totalGST ?? 0),   sub: 'Tax liability',              color: 'text-violet-400'  },
          { label: 'Active Cashiers',    value: dashboardStats.totalCashiers ?? 0,               sub: 'Registered operators',       color: 'text-orange-400'  },
        ].map(s => (
          <div key={s.label} className="bg-[#111115] border border-white/5 rounded-2xl px-5 py-4">
            <p className={`text-2xl font-black tracking-tight ${s.color}`}>{s.value}</p>
            <p className="text-[13px] font-semibold text-zinc-400 mt-1">{s.label}</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <Section title={`Revenue — ${period.charAt(0).toUpperCase() + period.slice(1)}`} icon={TrendingUp}>
        {chartData.length === 0
          ? <p className="text-zinc-500 text-xs py-4 text-center">No orders for this period.</p>
          : <BarChart data={chartData} valueKey={chartValKey} labelKey={chartLblKey} color="emerald" height={160} />
        }
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Payment status */}
        <Section title="Payment Status" icon={CheckCircle2} accent="blue">
          <div className="space-y-3">
            {[
              { label: 'Fully Settled',   count: dashboardStats.today?.paid    ?? 0, color: 'bg-emerald-500', text: 'text-emerald-400' },
              { label: 'Partial',          count: dashboardStats.today?.partial ?? 0, color: 'bg-orange-500',  text: 'text-orange-400'  },
              { label: 'Unpaid',           count: dashboardStats.today?.unpaid  ?? 0, color: 'bg-red-500',     text: 'text-red-400'     },
            ].map(row => {
              const pct = Math.round((row.count / (dashboardStats.today?.bills || 1)) * 100) || 0;
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-bold text-zinc-400">{row.label}</span>
                    <span className={`text-[12px] font-black ${row.text}`}>{row.count} bills ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${row.color} opacity-70`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between pt-3 border-t border-white/5">
              <span className="text-[12px] font-bold text-zinc-500">Outstanding Due</span>
              <span className="text-[14px] font-black text-red-400">{fmt(outstandingDue)}</span>
            </div>
          </div>
        </Section>

        {/* Payment methods */}
        <Section title="Payment Methods" icon={ShoppingBag} accent="violet">
          {paymentMethodData.length === 0
            ? <p className="text-zinc-600 text-xs text-center py-6">No data available.</p>
            : (
              <div className="space-y-4">
                {paymentMethodData.map(m => (
                  <div key={m.method} className="flex items-center gap-4">
                    <span className="w-12 text-[11px] font-black text-zinc-400">{m.method}</span>
                    <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500/70"
                        style={{ width: `${totalBills > 0 ? (m.count / totalBills * 100) : 0}%` }} />
                    </div>
                    <span className="text-[12px] font-black text-zinc-300 w-20 text-right font-mono">{fmt(m.revenue)}</span>
                    <span className="text-[11px] text-zinc-600 w-10 text-right">{m.count}</span>
                  </div>
                ))}
              </div>
            )
          }
        </Section>
      </div>

      {/* Stock log + warehouse summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Section title="Historical Stock Log" icon={Layers} accent="purple">
            {stockLogs.length === 0
              ? (
                <div className="p-10 text-center text-zinc-600 text-xs flex flex-col items-center gap-2">
                  <FileText size={32} className="opacity-15" />
                  <p className="font-bold">No stock batch logs recorded.</p>
                </div>
              )
              : (
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                  {stockLogs.map(log => (
                    <div key={log._id}
                      className="p-4 rounded-xl bg-white/[2%] border border-white/5 hover:border-purple-500/30 transition-all group">
                      <div className="flex flex-wrap items-start justify-between border-b border-white/5 pb-2.5 gap-2">
                        <div>
                          <h4 className="text-[13px] font-black text-white flex items-center gap-1.5">
                            {log.note}
                            <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 text-purple-400" />
                          </h4>
                          <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-1">
                            <span className="flex items-center gap-1"><Calendar size={11} /> {fmtDate(log.createdAt)}</span>
                            <span className="flex items-center gap-1"><User size={11} /> {log.receivedBy?.name ?? 'System Operator'}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black bg-purple-500/10 text-purple-400 px-2.5 py-0.5 rounded-md font-mono">
                          {log.items?.length ?? 0} actions
                        </span>
                      </div>
                      <div className="pt-2.5 space-y-2">
                        {(log.items ?? []).map((item, idx) => {
                          // changedQty is authoritative; controller already normalised it
                          const qty     = item.changedQty ?? 0;
                          const isLoss  = item.type?.includes('loss') || qty < 0;
                          const isZero  = qty === 0;
                          return (
                            <div key={idx} className="flex justify-between items-center text-[12px]">
                              <span className={`font-semibold truncate max-w-[280px]
                                ${item.type?.includes('gift') ? 'text-purple-400/90 pl-3 border-l border-purple-500/20' : 'text-zinc-400'}`}>
                                {item.name}
                              </span>
                              <div className="flex items-center gap-3 font-mono text-right">
                                {isZero
                                  ? <span className="text-blue-400 font-bold">Override</span>
                                  : <span className={isLoss ? 'text-red-400 font-black' : 'text-emerald-400 font-black'}>
                                      {qty > 0 ? `+${qty}` : qty}
                                    </span>
                                }
                                <span className="text-zinc-600 text-[10px]">Total: {item.newTotalStock}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Warehouse Summary" icon={Package} accent="emerald">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Batch Shipments Received</p>
                <p className="text-3xl font-black text-white mt-1 font-mono">{stockLogs.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Total Item Restock Actions</p>
                <p className="text-3xl font-black text-purple-400 mt-1 font-mono">{totalInwardActions}</p>
              </div>
              <div className="pt-2">
                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-3">Stock Alerts</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs bg-orange-500/5 p-2.5 rounded-lg border border-orange-500/10">
                    <span className="text-zinc-400">Low Stock</span>
                    <span className="font-black text-orange-400 font-mono">{dashboardStats.lowStock?.length ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-xs bg-red-500/5 p-2.5 rounded-lg border border-red-500/10">
                    <span className="text-zinc-400">Out of Stock</span>
                    <span className="font-black text-red-400 font-mono">{dashboardStats.outOfStock ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* Top products */}
      <Section title="Top Products by Volume" icon={Star} accent="orange">
        {topProducts.length === 0
          ? <p className="text-zinc-500 text-xs py-4 text-center">No sales data found.</p>
          : (
            <div className="space-y-3">
              {topProducts.map((p, i) => {
                const maxSold = topProducts[0]?.totalQty ?? 1;
                return (
                  <div key={p._id ?? i} className="flex items-center gap-4">
                    <span className={`w-6 text-[12px] font-black ${i < 3 ? 'text-orange-400' : 'text-zinc-600'}`}>
                      {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-semibold text-zinc-300 truncate block">{p.name ?? 'Unknown'}</span>
                      {p.brand && <span className="text-[10px] text-zinc-600">{p.brand}</span>}
                    </div>
                    <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500/60 rounded-full"
                        style={{ width: `${((p.totalQty ?? 0) / maxSold) * 100}%` }} />
                    </div>
                    <span className="text-[12px] font-bold text-zinc-400 w-14 text-right">{p.totalQty ?? 0} units</span>
                    <span className="text-[12px] font-black text-emerald-400 w-24 text-right font-mono">{fmt(p.revenue)}</span>
                  </div>
                );
              })}
            </div>
          )
        }
      </Section>

      {/* Inventory alerts */}
      <Section title="Inventory Attention" icon={Package} accent="emerald">
        {(!dashboardStats.lowStock?.length && !dashboardStats.outOfStock)
          ? <p className="text-emerald-400/80 text-xs font-medium bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">✓ All stock levels are safe.</p>
          : (
            <div className="space-y-2">
              {(dashboardStats.lowStock ?? []).map(p => (
                <div key={p._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-[13px] font-semibold text-white">{p.name}</p>
                    <p className="text-[10px] text-zinc-600">{p.unit} · {p.brand}</p>
                  </div>
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg border
                    ${p.stock === 0
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                    {p.stock === 0 ? 'OUT OF STOCK' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )
        }
      </Section>
    </div>
  );
}