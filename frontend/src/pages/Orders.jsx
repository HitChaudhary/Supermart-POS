import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Eye, CheckCircle2, Clock, XCircle, 
  Banknote, Smartphone, CreditCard, X, AlertTriangle
} from 'lucide-react';

const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const StatusBadge = ({ status }) => {
  const cfg = {
    paid:    { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2, label: 'Paid' },
    partial: { cls: 'bg-orange-500/10  text-orange-400  border-orange-500/20',  icon: Clock,        label: 'Partial' },
    unpaid:  { cls: 'bg-red-500/10     text-red-400     border-red-500/20',     icon: XCircle,      label: 'Unpaid' },
  }[status] || { cls: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: Clock, label: status };

  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <Icon size={9} /> {cfg.label}
    </span>
  );
};

const MethodIcon = ({ method }) => {
  const cfg = { cash: Banknote, upi: Smartphone, card: CreditCard }[method?.toLowerCase()] || Banknote;
  const Icon = cfg;
  return <Icon size={13} className="text-zinc-500" />;
};

// ── Order detail modal ────────────────────────────────────────
const OrderModal = ({ order, onClose, onUpdateStatus }) => {
  const [status, setStatus] = useState(order.paymentStatus);
  const [partial, setPartial] = useState(order.paidAmount || 0);
  const [saving, setSaving] = useState(false);

  // Get cashier name safely handle string vs object structure populated from your backend
  const cashierName = typeof order.cashier === 'object' ? order.cashier?.name : 'System Operator';

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateStatus(order._id, status, parseFloat(partial) || 0);
      onClose();
    } catch (err) {
      console.error("Failed updating order financial configurations: ", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111115] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-[14px] font-mono font-bold text-zinc-400">ORDER ID: {order._id}</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">{fmtDate(order.createdAt)} · {cashierName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Items mapping real backend properties */}
          <div className="space-y-2">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex justify-between text-[13px] py-1 border-b border-white/5 last:border-0">
                <span className="text-zinc-300">{item.name} <span className="text-zinc-500 font-mono">x{item.qty} {item.unit || ''}</span></span>
                <span className="font-bold text-white font-mono">{fmt(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-4 space-y-2">
            <div className="flex justify-between text-[12px]"><span className="text-zinc-500">Subtotal</span><span className="font-mono text-zinc-300">{fmt(order.subtotal)}</span></div>
            {(order.discount > 0) && <div className="flex justify-between text-[12px]"><span className="text-emerald-400">Savings</span><span className="text-emerald-400 font-mono">−{fmt(order.discount)}</span></div>}
            <div className="flex justify-between text-[12px]"><span className="text-zinc-500">GST</span><span className="font-mono text-zinc-300">{fmt(order.gst)}</span></div>
            <div className="flex justify-between text-[15px] font-black pt-2 border-t border-white/5 text-white"><span>Total Bill</span><span className="font-mono text-emerald-400">{fmt(order.total)}</span></div>
          </div>

          {/* Update payment status gate via system role authentication */}
          <div className="bg-white/3 border border-white/5 rounded-xl p-4">
            <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-3">Administrative Action Override</p>
            <div className="flex gap-2 mb-3">
              {['paid', 'partial', 'unpaid'].map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase transition-all border
                    ${status === s
                      ? s === 'paid'    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : s === 'partial' ? 'bg-orange-500/15  text-orange-400  border-orange-500/30'
                                        : 'bg-red-500/15     text-red-400     border-red-500/30'
                      : 'bg-white/5 text-zinc-600 border-transparent hover:border-white/5'
                    }`}>
                  {s}
                </button>
              ))}
            </div>
            {status === 'partial' && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Acknowledge Amount Received (₹)</label>
                <input
                  type="number"
                  value={partial}
                  onChange={e => setPartial(e.target.value)}
                  placeholder="Amount received..."
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-orange-500/30 text-[13px] text-white outline-none font-mono"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-white/5 text-zinc-300 text-[13px] font-bold hover:bg-white/10 transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-black transition-colors disabled:opacity-40">
            {saving ? 'Syncing...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Orders Module ──────────────────────────────────────────────────
export default function Orders() {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusF, setStatusF]     = useState('all');
  const [methodF, setMethodF]     = useState('all');
  const [viewing, setViewing]     = useState(null);

  // Load orders array on page creation mount
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Direct pass filter mappings into Express endpoints parsing queries
      let queryUrl = '/api/orders?limit=100';
      if (statusF !== 'all') queryUrl += `&status=${statusF}`;
      
      const res = await axios.get(queryUrl);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error retrieving historical database elements: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusF]);

  // Client side compute filter subsets matching interactive inputs
  const filtered = orders.filter(o => {
    const matchMethod = methodF === 'all' || o.paymentMethod?.toLowerCase() === methodF.toLowerCase();
    
    // Process structural variations if cashier object population is string or full document
    const cashierData = typeof o.cashier === 'object' ? o.cashier?.name : '';
    const matchSearch = !search 
      || o._id.includes(search) 
      || cashierData.toLowerCase().includes(search.toLowerCase());
      
    return matchMethod && matchSearch;
  });

  // Call database updating route matching your PATCH controller configuration
  const handleUpdatePayment = async (id, paymentStatus, paidAmount) => {
    try {
      const res = await axios.patch(`/api/orders/${id}/payment`, {
        paymentStatus,
        paidAmount
      });
      
      // Update local storage arrays safely matching returned instance modification payload
      setOrders(prev => prev.map(o => o._id === id ? res.data : o));
    } catch (err) {
      alert(err.response?.data?.message || "Failed changing parameters. Admins Only.");
      throw err;
    }
  };

  // Aggregate stats mapping rules straight from live collection response indices
  const totalRevenue  = orders.reduce((s, o) => s + (o.paidAmount || 0), 0);
  const totalBalance  = orders.reduce((s, o) => s + (o.balanceDue || 0), 0);
  const unpaidCount   = orders.filter(o => o.paymentStatus === 'unpaid').length;

  return (
    <div className="space-y-5">

      {/* Financial Vector Summary Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Calculated Ledger Elements', value: orders.length, color: 'text-white' },
          { label: 'Cumulative Volume Collections', value: fmt(totalRevenue), color: 'text-emerald-400' },
          { label: 'Live Credit Debts Outstanding', value: fmt(totalBalance), color: 'text-orange-400' },
          { label: 'Total Unsettled Invoices', value: unpaidCount, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#111115] border border-white/5 rounded-xl px-4 py-3">
            <p className={`text-xl font-black font-mono tracking-tight ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters Architecture Control Strip */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search matching invoice ID or Operator..."
            className="w-full h-10 pl-9 pr-4 bg-[#111115] border border-white/8 rounded-xl text-[13px] text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 transition-all" 
          />
        </div>

        <div className="flex flex-wrap gap-1.5 bg-[#111115] border border-white/5 p-1 rounded-xl">
          {['all', 'paid', 'partial', 'unpaid'].map(s => (
            <button key={s} onClick={() => setStatusF(s)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all capitalize
                ${statusF === s
                  ? s === 'paid'    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : s === 'partial' ? 'bg-orange-500/15  text-orange-400  border border-orange-500/20'
                  : s === 'unpaid'  ? 'bg-red-500/15     text-red-400     border border-red-500/20'
                                    : 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
                }`}>
              {s === 'all' ? 'All Channels' : s}
            </button>
          ))}
        </div>

        <select value={methodF} onChange={e => setMethodF(e.target.value)}
          className="h-10 px-3 bg-[#111115] border border-white/8 rounded-xl text-[12px] font-bold text-zinc-400 outline-none cursor-pointer">
          <option value="all">All Methods</option>
          <option value="cash">Cash Ledger</option>
          <option value="upi">UPI Gateway</option>
          <option value="card">POS Terminal Card</option>
        </select>
      </div>

      {/* Interactive Main Document Table Block */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-[#111115] border border-white/5 rounded-2xl">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-500">Syncing transaction registry matrices...</p>
        </div>
      ) : (
        <div className="bg-[#111115] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5 bg-white-[1%]">
                  {['Invoice ID Mapping', 'System Operator', 'Items Count', 'Grand Total', 'Paid Amount', 'Due Balance', 'Method', 'Current Status', 'Control'].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-[10px] font-black text-zinc-600 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(o => {
                  const cashierDisplay = typeof o.cashier === 'object' ? o.cashier?.name : 'Operator Locked';
                  return (
                    <tr key={o._id} className="hover:bg-white/[1.5%] transition-colors group">
                      <td className="px-4 py-3.5">
                        <p className="text-[12px] font-bold font-mono text-white max-w-[120px] truncate">{o._id}</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                      </td>
                      <td className="px-4 py-3.5 text-[12px] font-semibold text-zinc-400">{cashierDisplay}</td>
                      <td className="px-4 py-3.5 text-[12px] text-zinc-500 font-mono">{o.items?.length || 0} unit(s)</td>
                      <td className="px-4 py-3.5 text-[14px] font-black text-white font-mono">{fmt(o.total)}</td>
                      <td className="px-4 py-3.5 text-[13px] font-bold text-emerald-400 font-mono">{fmt(o.paidAmount)}</td>
                      <td className="px-4 py-3.5">
                        {(o.balanceDue > 0) ? (
                          <span className="text-[13px] font-black text-red-400 font-mono">{fmt(o.balanceDue)}</span>
                        ) : (
                          <span className="text-[13px] text-zinc-700 font-mono">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5"><MethodIcon method={o.paymentMethod} /></td>
                      <td className="px-4 py-3.5"><StatusBadge status={o.paymentStatus} /></td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => setViewing(o)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-zinc-500 hover:text-emerald-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-16 text-center text-zinc-600 text-[13px]">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-xs mx-auto">
                        <AlertTriangle size={20} className="text-zinc-700" />
                        <p>No valid matching ledger orders found within specified collection vector parameters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Sheet Layer Container */}
      {viewing && (
        <OrderModal 
          order={viewing} 
          onClose={() => setViewing(null)} 
          onUpdateStatus={handleUpdatePayment} 
        />
      )}
    </div>
  );
}