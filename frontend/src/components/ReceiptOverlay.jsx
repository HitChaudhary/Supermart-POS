import React from 'react';
import {
  Printer, RotateCcw, Gift, Tag,
  CheckCircle2, Banknote, CreditCard,
  Smartphone, AlertTriangle, Clock,
} from 'lucide-react';

const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;

const PAY_ICON  = { cash: Banknote, upi: Smartphone, card: CreditCard };
const PAY_LABEL = { cash: 'Cash Ledger', upi: 'UPI Gateway / QR', card: 'POS Card Terminal' };

const STATUS_CONFIG = {
  paid:    { icon: CheckCircle2,  label: 'PAID & SETTLED',  bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  partial: { icon: Clock,         label: 'PARTIAL PAYMENT', bg: 'bg-orange-500/15',  border: 'border-orange-500/30',  text: 'text-orange-400'  },
  unpaid:  { icon: AlertTriangle, label: 'UNPAID CREDIT',   bg: 'bg-red-500/15',     border: 'border-red-500/30',     text: 'text-red-400'     },
};

const Divider = ({ dashed }) => (
  <div className={`w-full my-3 border-t ${dashed ? 'border-dashed border-zinc-300' : 'border-zinc-200'}`} />
);

export default function ReceiptOverlay({
  cart, financials, gifts, specialOffers,
  paymentMethod, paymentStatus,
  session, onNewBill,
}) {
  const { subtotal, discount, gst, total, paid, changeDue, remaining } = financials;
  const PayIcon = PAY_ICON[paymentMethod?.toLowerCase()] || Banknote;
  const status  = STATUS_CONFIG[paymentStatus?.toLowerCase()] || STATUS_CONFIG.paid;
  const StatusIcon = status.icon;

  // Track transaction dates reactively
  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-[#0d0d0f]">

      {/* ══ LEFT: Success Execution Terminal View ══════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0d0d0f] p-12 gap-6 select-none">

        {/* Status circle dynamic badge */}
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-300
          ${paymentStatus === 'paid'    ? 'bg-emerald-500 shadow-emerald-500/30' :
            paymentStatus === 'partial' ? 'bg-orange-500  shadow-orange-500/30'  :
                                          'bg-red-600     shadow-red-500/30'}`}
        >
          <StatusIcon size={44} strokeWidth={2} className="text-white" />
        </div>

        <div className="text-center">
          <h2 className="text-4xl font-black text-white tracking-tight">
            {paymentStatus === 'paid'    ? 'Sale Complete!'    :
             paymentStatus === 'partial' ? 'Partial Bill Logged' :
                                           'Asset Credit Recorded'}
          </h2>
          <p className={`text-2xl font-black font-mono mt-2 ${status.text}`}>{fmt(total)}</p>
          <p className="text-zinc-500 font-mono text-[11px] mt-1 max-w-[280px] truncate mx-auto">
            INVOICE MONGODB ID: {session.billNumber}
          </p>
          <p className="text-zinc-600 text-[11px] mt-0.5">{dateStr} · {timeStr}</p>
        </div>

        {/* Change due visualization container */}
        {changeDue > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-10 py-5 text-center min-w-[220px]">
            <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-1">Return Cash Change</p>
            <p className="text-5xl font-black text-emerald-400 font-mono">{fmt(changeDue)}</p>
          </div>
        )}

        {/* Remaining debt due warning container view */}
        {remaining > 0 && paymentStatus !== 'paid' && (
          <div className={`${status.bg} border ${status.border} rounded-2xl px-10 py-5 text-center min-w-[220px]`}>
            <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${status.text}`}>Ledger Balance Due</p>
            <p className={`text-5xl font-black font-mono ${status.text}`}>{fmt(remaining)}</p>
          </div>
        )}

        {/* Free physical gift alerts handover strip */}
        {gifts.length > 0 && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 text-center w-full max-w-sm">
            <p className="text-[11px] font-black text-purple-400 uppercase tracking-widest flex items-center justify-center gap-2 mb-3">
              <Gift size={13} /> Hand Over Earned Store Incentives
            </p>
            <div className="space-y-1">
              {gifts.map((g, i) => (
                <p key={i} className="text-[14px] font-bold text-white">🎁 {g.name}</p>
              ))}
            </div>
          </div>
        )}

        {/* Action control loops buttons strip */}
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white font-bold text-[13px] transition-all"
          >
            <Printer size={16} /> Print Thermal Ticket
          </button>
          <button
            type="button"
            onClick={onNewBill}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-[13px] transition-all shadow-lg shadow-emerald-500/20"
          >
            <RotateCcw size={16} /> New Transaction
          </button>
        </div>
      </div>

      {/* ══ RIGHT: Document Thermal Receipt Print Node Layout ═══ */}
      <div
        className="w-[360px] flex-shrink-0 flex flex-col bg-white overflow-hidden shadow-2xl print:shadow-none print:w-full"
        id="receipt-print"
        style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}
      >
        <div className="flex-1 overflow-y-auto p-6 text-slate-800 text-[11px] light-scroll print:overflow-visible">

          {/* Corporate store invoice brand layout block */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Super<span className="text-emerald-600">Mart</span>
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5">Smart Supermarket Retail Outlet</p>
            <p className="text-[9px] text-slate-400 font-sans">Surat, Gujarat · GSTIN: 24ABCDE1234F1Z5</p>
          </div>

          <Divider />

          {/* Maps real generated database cluster unique token identities */}
          <div className="space-y-0.5 text-[10px] text-slate-500">
            <div className="flex justify-between">
              <span>BILL MONGODB ID:</span>
              <span className="font-bold text-slate-800 font-mono text-right truncate max-w-[180px]">{session.billNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>System Operator:</span>
              <strong className="text-slate-700">{session.cashierName}</strong>
            </div>
            <div className="flex justify-between pt-1 text-slate-400">
              <span>{dateStr}</span>
              <span>{timeStr}</span>
            </div>
          </div>

          {/* Payment parameter stamp vector layout component */}
          <div className={`mt-3 flex items-center justify-center gap-2 rounded-lg py-2 border font-sans ${status.bg} ${status.border}`}>
            <StatusIcon size={12} className={status.text} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${status.text}`}>{status.label}</span>
          </div>

          <Divider dashed />

          {/* Commodity array presentation columns headers row */}
          <div className="flex text-[9px] font-black uppercase tracking-wider text-slate-400 mb-2">
            <span className="flex-1">Item Description</span>
            <span className="w-8  text-right">Qty</span>
            <span className="w-14 text-right">Rate</span>
            <span className="w-14 text-right">Total</span>
          </div>

          {/* Items mapping structural records loops dynamically */}
          {cart.map(item => (
            <div key={item._id} className="mb-2">
              <div className="flex items-start text-[11px]">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-bold text-slate-900 leading-tight">{item.name}</p>
                  <p className="text-[9px] text-slate-400">{item.brand}</p>
                </div>
                <span className="w-8  text-right font-bold text-slate-700">{item.qty}</span>
                <span className="w-14 text-right text-slate-600">{fmt(item.price)}</span>
                <span className="w-14 text-right font-bold text-slate-900">{fmt(item.price * item.qty)}</span>
              </div>
              {item.discountPercent > 0 && (
                <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5 font-sans">
                  <Tag size={8} /> Saved {fmt((item.originalPrice - item.price) * item.qty)} ({item.discountPercent}% OFF)
                </p>
              )}
            </div>
          ))}

          <Divider dashed />

          {/* Financial summary sub-totals block criteria mapping */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal Basket</span>
              <span className="font-bold">{fmt(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span className="flex items-center gap-1"><Tag size={9} /> Cumulative Savings</span>
                <span>−{fmt(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">GST Add-on (@18%)</span>
              <span className="font-bold">{fmt(gst)}</span>
            </div>
          </div>

          <Divider />

          <div className="flex justify-between items-center py-0.5">
            <span className="text-[14px] font-black text-slate-900">GRAND TOTAL</span>
            <span className="text-[18px] font-black text-slate-900">{fmt(total)}</span>
          </div>

          <Divider dashed />

          {/* Payment verification channel parameter layouts block split view */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <PayIcon size={11} /> {PAY_LABEL[paymentMethod?.toLowerCase()] || 'Payment Received'}
              </span>
              <span className="font-bold text-slate-900">{fmt(paid)}</span>
            </div>
            {changeDue > 0 && (
              <div className="flex justify-between font-black text-emerald-600">
                <span>Cash Change Returned:</span>
                <span>{fmt(changeDue)}</span>
              </div>
            )}
            {remaining > 0 && paymentStatus !== 'paid' && (
              <div className={`flex justify-between font-black ${status.text}`}>
                <span>Outstanding Debt Due:</span>
                <span>{fmt(remaining)}</span>
              </div>
            )}
          </div>

          {/* Complimentary Free Goods allocation vectors sheet section */}
          {gifts.length > 0 && (
            <>
              <Divider dashed />
              <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-1.5 flex items-center gap-1 font-sans">
                <Gift size={9} /> Campaign Items Mapped
              </p>
              {gifts.map((g, i) => (
                <p key={i} className="text-[11px] font-bold text-slate-700">🎁 [FREE GIFT] {g.name}</p>
              ))}
            </>
          )}

          {/* Campaign offers metadata log fields */}
          {specialOffers.length > 0 && (
            <>
              <Divider dashed />
              <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1.5 font-sans">Campaign Promos Applied</p>
              {specialOffers.map((o, i) => (
                <p key={i} className="text-[10px] text-slate-600">✓ {o.title} — saved {fmt(o.saving)}</p>
              ))}
            </>
          )}

          <Divider />

          <div className="text-center text-[9px] text-slate-400 space-y-1 pt-1.5">
            <p className="font-black text-slate-700 text-[11px] font-sans">Thank you for shopping at SuperMart!</p>
            <p>Tax invoice computer generated record.</p>
            <p>support@supermart.in</p>
          </div>
        </div>
      </div>
    </div>
  );
}