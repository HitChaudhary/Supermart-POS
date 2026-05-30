import React, { useState } from 'react';
import axios from 'axios';
import {
  ArrowLeft, Plus, Minus, Trash2,
  CreditCard, Banknote, Smartphone,
  Tag, Gift, AlertTriangle, CheckCircle2,
  Clock, ChevronRight, ShoppingBag,
} from 'lucide-react';

const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;

/* ── Payment status selector ─────────────────────────────── */
const StatusBtn = ({ label, icon: Icon, value, current, onClick }) => {
  const active = current === value;
  const styles = {
    paid:    active ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30' : 'border-white/10 text-zinc-500 hover:border-emerald-500/40 hover:text-zinc-300',
    partial: active ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/30'   : 'border-white/10 text-zinc-500 hover:border-orange-500/40 hover:text-zinc-300',
    unpaid:  active ? 'bg-red-600   border-red-400   text-white shadow-lg shadow-red-500/30'         : 'border-white/10 text-zinc-500 hover:border-red-500/40   hover:text-zinc-300',
  };
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl border-2 font-bold text-[11px] uppercase tracking-wide transition-all duration-200 ${styles[value]}`}
    >
      <Icon size={18} strokeWidth={2.5} />
      {label}
    </button>
  );
};

/* ── Payment method button ───────────────────────────────── */
const MethodBtn = ({ label, icon: Icon, value, current, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border-2 font-bold text-[12px] tracking-wide transition-all duration-200
      ${current === value
        ? 'bg-white/10 border-white/30 text-white'
        : 'border-white/8 text-zinc-600 hover:border-white/15 hover:text-zinc-400'
      }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

/* ── Cart review row ─────────────────────────────────────── */
const ReviewRow = ({ item, onUpdateQty, onRemove }) => (
  <div className="flex items-center gap-4 py-3.5 border-b border-white/5 last:border-0 group">
    <img src={item.image || 'https://placehold.co/56'} alt={item.name}
      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 ring-1 ring-white/10" />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{item.brand}</p>
      <h4 className="text-[15px] font-bold text-white mt-0.5 leading-tight truncate">{item.name}</h4>
      {item.discountPercent > 0 && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-zinc-600 line-through">{fmt(item.originalPrice)}</span>
          <span className="text-[9px] font-black text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-md">
            -{item.discountPercent}%
          </span>
        </div>
      )}
    </div>

    {/* Qty controls */}
    <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-2 py-1.5">
      <button type="button" onClick={() => onUpdateQty(item._id, item.qty - 1)}
        className="w-7 h-7 rounded-lg bg-white/8 hover:bg-red-500/30 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
        {item.qty <= 1 ? <Trash2 size={11} /> : <Minus size={11} />}
      </button>
      <input
        type="number"
        value={item.qty}
        onChange={e => onUpdateQty(item._id, parseFloat(e.target.value) || 0)}
        className="w-10 bg-transparent text-center text-[15px] font-black text-white outline-none font-mono"
        min="0" step="1"
      />
      <button type="button" onClick={() => onUpdateQty(item._id, item.qty + 1)}
        className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-colors">
        <Plus size={11} />
      </button>
    </div>

    {/* Line total */}
    <div className="text-right w-24 flex-shrink-0">
      <p className="text-[17px] font-black text-white font-mono">{fmt(item.price * item.qty)}</p>
      <p className="text-[10px] text-zinc-600">{fmt(item.price)}/{item.unit}</p>
    </div>

    <button type="button" onClick={() => onRemove(item._id)}
      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-all">
      <Trash2 size={12} />
    </button>
  </div>
);

/* ── Main Panel ───────────────────────────────────────────── */
export default function CheckoutSummary({
  cart, financials, gifts,
  paymentMethod, setPaymentMethod,
  paymentStatus, setPaymentStatus,
  paidAmount,    setPaidAmount,
  updateQty, removeItem,
  session, onBack, onCheckout,
}) {
  const [error, setError]     = useState('');
  const [syncing, setSyncing] = useState(false);
  const { total, subtotal, discount, gst, remaining } = financials;

  // Quick round-up amounts
  const quickAmounts = [
    { label: 'Exact', v: total },
    { label: `₹${Math.ceil(total / 50)  * 50}`,  v: Math.ceil(total / 50)  * 50  },
    { label: `₹${Math.ceil(total / 100) * 100}`, v: Math.ceil(total / 100) * 100 },
    { label: `₹${Math.ceil(total / 500) * 500}`, v: Math.ceil(total / 500) * 500 },
  ].filter((q, i, arr) => i === 0 || q.v !== arr[i - 1].v);

  const handleConfirm = async () => {
    setError('');
    if (cart.length === 0) { setError('Cart is empty — add products first.'); return; }
    if (paymentStatus === 'partial') {
      const p = parseFloat(paidAmount) || 0;
      if (p <= 0) { setError('Enter partial amount received.'); return; }
      if (p >= total) { setError('Partial payment cannot be equal or greater than grand total.'); return; }
    }

    setSyncing(true);
    try {
      // Map cart items exactly to match backend orderController schema structure criteria
      const databasePayloadItems = cart.map(item => ({
        product: item._id,
        qty: item.qty
      }));

      // Fire payload to protected POST /api/orders endpoint via AuthContext base config
      const response = await axios.post('/api/orders', {
        items: databasePayloadItems,
        paymentMethod,
        paymentStatus,
        paidAmount: paymentStatus === 'unpaid' ? 0 : parseFloat(paidAmount) || 0
      });

      // Pass the returned database instance object up to update parent receipt views
      onCheckout(response.data); 
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction drop aborted by backend validation loops.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-[#0d0d0f]">

      {/* ══ LEFT: Order review ══════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-[#111114]">
          <button type="button" onClick={onBack} disabled={syncing}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-[13px] font-bold transition-colors px-3 py-2 rounded-xl hover:bg-white/5 disabled:opacity-40">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="h-6 w-px bg-white/5" />
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Review System Order</h2>
            <p className="text-[11px] text-zinc-600">
              {cart.length} product{cart.length !== 1 ? 's' : ''} · Invoice Gate Checklist
            </p>
          </div>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-6 py-5 light-scroll">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-zinc-700">
              <ShoppingBag size={48} strokeWidth={1.2} />
              <p className="font-bold">Cart is empty</p>
              <button type="button" onClick={onBack} className="text-emerald-500 text-sm font-bold hover:underline">
                ← Add products
              </button>
            </div>
          ) : (
            <div className="bg-[#111114] border border-white/5 rounded-2xl px-5 divide-y divide-white/5">
              {cart.map(item => (
                <ReviewRow key={item._id} item={item} onUpdateQty={updateQty} onRemove={removeItem} />
              ))}
            </div>
          )}

          {/* Gifts earned banner split layout block */}
          {gifts.length > 0 && (
            <div className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
              <p className="text-[12px] font-black text-purple-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Gift size={14} /> Promotional Incentives Unlocked
              </p>
              {gifts.map((g, i) => (
                <div key={i} className="flex items-center gap-2 text-[13px] font-bold text-white">
                  🎁 {g.name}
                  <span className="text-[10px] text-purple-500 font-normal">(buy {g.minQty}+ {g.fromProduct})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ RIGHT: Payment panel ════════════════════════════ */}
      <div className="w-[420px] flex-shrink-0 flex flex-col bg-[#111114] border-l border-white/5">

        {/* Panel header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-white/5">
          <h3 className="text-xl font-black text-white tracking-tight">Payment Parameters</h3>
          <p className="text-[11px] text-emerald-500 font-medium mt-0.5">Operator: {session.cashierName}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Order total card */}
          <div className="bg-[#0d0d0f] border border-white/8 rounded-2xl p-5 space-y-2.5">
            <div className="flex justify-between text-[12px]">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-bold text-zinc-300 font-mono">{fmt(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[12px]">
                <span className="text-emerald-500 flex items-center gap-1.5"><Tag size={11} /> Cumulative Savings</span>
                <span className="font-black text-emerald-400 font-mono">−{fmt(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[12px]">
              <span className="text-zinc-500">GST (18%)</span>
              <span className="font-bold text-zinc-300 font-mono">{fmt(gst)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/8">
              <span className="text-base font-black text-white">Total Due</span>
              <span className="text-[28px] font-black text-white font-mono leading-none">{fmt(total)}</span>
            </div>
          </div>

          {/* ── PAYMENT STATUS VECTOR ── */}
          <div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">Payment Status gate</p>
            <div className="flex gap-2">
              <StatusBtn label="Paid" icon={CheckCircle2} value="paid" current={paymentStatus} onClick={(v) => { setPaymentStatus(v); setPaidAmount(''); }} />
              <StatusBtn label="Partial" icon={Clock} value="partial" current={paymentStatus} onClick={(v) => { setPaymentStatus(v); setPaidAmount(''); }} />
              <StatusBtn label="Unpaid" icon={AlertTriangle} value="unpaid" current={paymentStatus} onClick={(v) => { setPaymentStatus(v); setPaidAmount(''); }} />
            </div>
          </div>

          {/* Partial amount received control splits */}
          {paymentStatus === 'partial' && (
            <div className="space-y-3 animate-fadeIn">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Amount Received</p>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map(q => (
                  <button
                    type="button"
                    key={q.label}
                    onClick={() => setPaidAmount(q.v.toFixed(2))}
                    className="h-9 rounded-xl bg-white/5 hover:bg-orange-500/20 hover:border-orange-500/40 border border-white/8 text-[11px] font-bold text-zinc-400 hover:text-orange-300 transition-all font-mono"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={paidAmount}
                disabled={syncing}
                onChange={e => { setPaidAmount(e.target.value); setError(''); }}
                placeholder={`Enter partial total (max ${fmt(total)})`}
                className="w-full h-14 rounded-xl bg-[#0d0d0f] border-2 border-orange-500/40 focus:border-orange-400 px-4 text-[20px] font-black text-white outline-none transition-all placeholder:text-zinc-700 font-mono"
              />
              {parseFloat(paidAmount) > 0 && (
                <div className="flex justify-between items-center mt-3 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
                  <span className="text-[12px] font-bold text-orange-300">Outstanding Balance</span>
                  <span className="text-[20px] font-black text-orange-300 font-mono">{fmt(remaining)}</span>
                </div>
              )}
            </div>
          )}

          {/* Unpaid confirmation notification alert box */}
          {paymentStatus === 'unpaid' && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-black text-red-300">Credit Asset Debt Voucher</p>
                <p className="text-[11px] text-red-400/70 mt-0.5">
                  Full aggregate total of {fmt(total)} will write to active balance constraints parameters.
                </p>
              </div>
            </div>
          )}

          {/* Paid confirmation success block layout section */}
          {paymentStatus === 'paid' && (
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-[13px] font-black text-emerald-300">Complete Settlement</span>
              </div>
              <span className="text-[20px] font-black text-emerald-300 font-mono">{fmt(total)}</span>
            </div>
          )}

          {/* Payment method selector controls split matrix */}
          <div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Payment Channel</p>
            <div className="flex gap-2">
              <MethodBtn label="Cash" icon={Banknote} value="cash" current={paymentMethod} onClick={setPaymentMethod} />
              <MethodBtn label="UPI QR" icon={Smartphone} value="upi" current={paymentMethod} onClick={setPaymentMethod} />
              <MethodBtn label="Card Terminal" icon={CreditCard} value="card" current={paymentMethod} onClick={setPaymentMethod} />
            </div>
          </div>

          {/* Error messages wrapper banner context layer string block */}
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 text-red-300 text-[12px] font-bold animate-pulse">
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        {/* Action commit footer validation gate trigger strip bar buttons */}
        <div className="flex-shrink-0 px-6 pb-6 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={syncing}
            className={`w-full h-14 rounded-2xl font-black text-[14px] uppercase tracking-widest
              flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40
              ${paymentStatus === 'unpaid'
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/20'
                : paymentStatus === 'partial'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 shadow-lg shadow-orange-500/20'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20'
              }`}
          >
            <CreditCard size={18} />
            {syncing ? 'Syncing Ledger Database...' : 
             paymentStatus === 'unpaid'  ? 'Commit — Log Debt Credit' :
             paymentStatus === 'partial' ? 'Commit — Log Partial Bill' :
                                           'Commit & Print Secure Invoice'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}