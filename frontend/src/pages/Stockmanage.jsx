import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { 
  Package, Plus, ClipboardList, RefreshCw, Layers, Calendar, 
  User, FileText, Search, Trash2, Check, Sparkles, AlertOctagon, TrendingDown, Tag
} from 'lucide-react';

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export default function StockManager() {
  const [dbProducts, setDbProducts] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);

  // Modes: 'cargo_inward' | 'damaged_loss' | 'expired_loss' | 'price_override'
  const [workspaceMode, setWorkspaceMode] = useState('cargo_inward');

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  // Voucher Draft Workspace
  const [batchNote, setBatchNote] = useState('');
  const [voucherItems, setVoucherItems] = useState([]); 

  const [viewLogsMobile, setViewLogsMobile] = useState(false);

  // De-coupled syncing routine handles errors without blocking the product array
  const syncData = async () => {
    setLoading(true);
    
    try {
      const prodRes = await axios.get('/api/products');
      const parsedProducts = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.products || [];
      setDbProducts(parsedProducts);
    } catch (err) {
      console.error("Error connecting to inventory networks:", err);
    }

    try {
      const logRes = await axios.get('/api/products/stock-logs');
      const parsedLogs = Array.isArray(logRes.data) ? logRes.data : logRes.data?.logs || [];
      setHistoryLogs(parsedLogs);
    } catch (err) {
      console.warn("History logs unaligned or empty:", err);
      setHistoryLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncData();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleModeChange = (newMode) => {
    setWorkspaceMode(newMode);
    setVoucherItems([]);
    setBatchNote('');
  };

  const suggestions = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    
    return (dbProducts || []).filter(p => {
      if (!p) return false;
      const nameMatch     = p.name ? p.name.toLowerCase().includes(q) : false;
      const brandMatch    = p.brand ? p.brand.toLowerCase().includes(q) : false;
      const categoryMatch = p.category ? p.category.toLowerCase().includes(q) : false;
      
      const matchesSearch = nameMatch || brandMatch || categoryMatch;
      const alreadyInVoucher = voucherItems.some(item => item.productObj?._id === p._id);
      return matchesSearch && !alreadyInVoucher;
    }).slice(0, 8); 
  }, [searchQuery, dbProducts, voucherItems]);

  const handleSelectProduct = (product) => {
    setVoucherItems(prev => [
      ...prev,
      { 
        productObj: product, 
        mainDelta: 0, 
        giftDelta: 0,
        newPrice: product.price || 0,
        newOriginalPrice: product.originalPrice || 0,
        newOffer: product.offer || ''
      }
    ]);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleVoucherFieldChange = (productId, field, value) => {
    setVoucherItems(prev => prev.map(item => 
      item.productObj?._id === productId ? { ...item, [field]: value } : item
    ));
  };

  const handleRemoveFromVoucher = (productId) => {
    setVoucherItems(prev => prev.filter(item => item.productObj?._id !== productId));
  };

  const handleCommitBatch = async (e) => {
    e.preventDefault();

    // ── RE-MAPPING MATRIX ALIGNED ──
    const adjustmentsPayload = voucherItems.map(item => {
      const mainDeltaValue = parseInt(item.mainDelta) || 0;
      const giftDeltaValue = parseInt(item.giftDelta) || 0;

      return {
        productId: item.productObj?._id,
        mode: workspaceMode, // ◄── Dynamically passes active operational tab state
        mainDelta: mainDeltaValue, 
        giftDelta: giftDeltaValue,
        newPrice: parseFloat(item.newPrice) || 0,
        newOriginalPrice: parseFloat(item.newOriginalPrice) || 0,
        newOffer: String(item.newOffer || '').trim()
      };
    }).filter(item => {
      // If we are overriding prices, we allow submission even if inventory deltas are 0
      if (workspaceMode === 'price_override') return true;
      return item.mainDelta > 0 || item.giftDelta > 0;
    });

    if (adjustmentsPayload.length === 0) {
      alert("Please key in quantity values greater than 0 before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const formattedNote = batchNote.trim() || `${workspaceMode.replace('_', ' ').toUpperCase()} Adjustment`;
      
      await axios.post('/api/products/inventory-workspace', {
        note: formattedNote,
        adjustments: adjustmentsPayload
      });

      alert("Stock workspace container logs successfully mapped and applied!");
      setVoucherItems([]);
      setBatchNote('');
      await syncData(); 
    } catch (err) {
      alert(err.response?.data?.message || "Failed committing stock entry update arrays.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-zinc-300 font-sans max-w-7xl mx-auto p-2 select-none">
      
      {/* Tab Switch Bar */}
      <div className="bg-[#111115] border border-white/5 p-2 rounded-2xl flex flex-wrap gap-1 items-center shadow-md">
        {[
          { id: 'cargo_inward',   label: 'Inward Cargo Restock', icon: Package,      color: 'hover:text-emerald-400', activeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' },
          { id: 'damaged_loss',   label: 'Log Damaged Stock',   icon: AlertOctagon, color: 'hover:text-red-400',     activeClass: 'bg-red-500/15 text-red-400 border border-red-500/20' },
          { id: 'expired_loss',   label: 'Log Expired Stock',   icon: TrendingDown, color: 'hover:text-orange-400',  activeClass: 'bg-orange-500/15 text-orange-400 border border-orange-500/20' },
          { id: 'price_override', label: 'Price & Offer Tuning', icon: Tag,          color: 'hover:text-blue-400',    activeClass: 'bg-blue-500/15 text-blue-400 border border-blue-500/20' }
        ].map(mode => (
          <button
            key={mode.id}
            type="button"
            onClick={() => handleModeChange(mode.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${mode.color} ${workspaceMode === mode.id ? mode.activeClass : 'text-zinc-500'}`}
          >
            <mode.icon size={14} /> {mode.label}
          </button>
        ))}
        
        <div className="ml-auto pr-2 flex items-center gap-2">
          <button type="button" onClick={() => setViewLogsMobile(!viewLogsMobile)} className="lg:hidden text-xs bg-white/5 px-3 py-1.5 rounded-xl font-bold border border-white/5">
            {viewLogsMobile ? 'Show Workspace' : 'View History Logs'}
          </button>
          <button type="button" onClick={syncData} className="p-2 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-xl border border-white/5 transition-all">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 bg-[#111115] rounded-2xl border border-white/5 space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-500 font-semibold tracking-wider">Syncing workspace operational matrix indices...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT PANEL: Working Voucher Form */}
          <div className={`lg:col-span-2 space-y-4 ${viewLogsMobile ? 'hidden lg:block' : 'block'}`}>
            
            <div className="bg-[#111115] border border-white/5 rounded-2xl p-5 relative shadow-sm" ref={dropdownRef}>
              <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2.5">Search Commodities</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  placeholder="Type product name, brand, or categories..."
                  className="w-full h-11 pl-10 pr-4 bg-white/5 border border-white/8 rounded-xl text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/15 transition-all"
                />
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-5 right-5 top-[calc(100%-12px)] z-50 bg-[#16161c] border border-white/10 rounded-xl shadow-2xl overflow-hidden mt-2 divide-y divide-white/5 max-h-[260px] overflow-y-auto light-scroll">
                  {suggestions.map(p => (
                    <div
                      key={p._id}
                      onClick={() => handleSelectProduct(p)}
                      className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-emerald-500/10 transition-colors group cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{p.name}</p>
                        <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{p.brand || 'No Brand'} · {p.category || 'Uncategorized'} · Current Stock: {p.stock || 0} {p.unit || 'pcs'}</p>
                      </div>
                      <span className="text-[11px] font-black text-zinc-600 group-hover:text-emerald-400 transition-colors bg-white/5 px-2 py-1 rounded-lg border border-white/5">+ Append</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleCommitBatch} className="space-y-4">
              <div className="bg-[#111115] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-5 py-4 border-b border-white/5 bg-white/[0.5%] flex flex-wrap gap-4 items-center justify-between">
                  <span className="text-sm font-bold text-white uppercase flex items-center gap-2"><Sparkles size={14} className="text-emerald-400" /> Active Voucher Sheet</span>
                  <input
                    type="text"
                    required
                    value={batchNote}
                    onChange={(e) => setBatchNote(e.target.value)}
                    placeholder="Enter shipment reference note..."
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-white/20 outline-none w-full sm:max-w-xs font-medium"
                  />
                </div>

                {voucherItems.length === 0 ? (
                  <div className="p-16 text-center text-zinc-600 text-xs flex flex-col items-center justify-center space-y-2">
                    <Package size={28} className="opacity-15 mb-1" />
                    <p className="font-bold text-zinc-500">Your manifest sheet is empty</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[650px]">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.5%] text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          <th className="px-5 py-3.5">Commodity Description</th>
                          <th className="px-5 py-3.5 text-center">Status Before</th>
                          <th className="px-5 py-3.5 text-right">Adjustment Values</th>
                          <th className="px-4 py-3.5 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-[13px]">
                        {voucherItems.map(item => {
                          const p = item.productObj;
                          if (!p) return null;
                          return (
                            <tr key={p._id} className="hover:bg-white/[0.5%] transition-colors">
                              <td className="px-5 py-4">
                                <p className="font-bold text-white">{p.name}</p>
                                <p className="text-[11px] text-zinc-500 font-medium mt-1">{p.brand} · {p.category}</p>
                              </td>
                              <td className="px-5 py-4 text-center font-mono">
                                <p className="text-zinc-400 font-bold">Stock: {p.stock} {p.unit}</p>
                                <p className="text-zinc-600 text-[11px]">Price: ₹{p.price}</p>
                              </td>
                              <td className="px-5 py-4 text-right">
                                {workspaceMode === 'cargo_inward' && (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-end gap-2">
                                      <span className="text-[10px] text-zinc-500 font-bold">Main Cargo In:</span>
                                      <input type="number" min="1" value={item.mainDelta || ''} onChange={(e) => handleVoucherFieldChange(p._id, 'mainDelta', e.target.value)} placeholder="+0" className="w-24 h-9 bg-white/5 border border-white/10 rounded-lg text-center font-mono text-white outline-none focus:border-emerald-500/50" />
                                    </div>
                                    {p.gift?.name && (
                                      <div className="flex items-center justify-end gap-2">
                                        <span className="text-[10px] text-purple-400 font-bold">Gift Boxes:</span>
                                        <input type="number" min="0" value={item.giftDelta || ''} onChange={(e) => handleVoucherFieldChange(p._id, 'giftDelta', e.target.value)} placeholder="+0" className="w-24 h-9 bg-purple-500/5 border border-purple-500/15 rounded-lg text-center font-mono text-purple-300 outline-none" />
                                      </div>
                                    )}
                                  </div>
                                )}
                                {(workspaceMode === 'damaged_loss' || workspaceMode === 'expired_loss') && (
                                  <div className="flex items-center justify-end gap-2">
                                    <span className="text-[10px] text-red-400 font-bold uppercase">Write-Off Qty:</span>
                                    <input type="number" min="1" max={p.stock} required value={item.mainDelta || ''} onChange={(e) => handleVoucherFieldChange(p._id, 'mainDelta', e.target.value)} placeholder="0" className="w-24 h-9 bg-red-500/5 border border-red-500/15 rounded-lg text-center font-mono text-red-400 outline-none" />
                                  </div>
                                )}
                                {workspaceMode === 'audit_correction' && (
                                  <div className="flex items-center justify-end gap-2">
                                    <span className="text-[10px] text-orange-400 font-bold uppercase">Actual Count:</span>
                                    <input type="number" min="0" required value={item.mainDelta || ''} onChange={(e) => handleVoucherFieldChange(p._id, 'mainDelta', e.target.value)} placeholder={p.stock} className="w-24 h-9 bg-orange-500/5 border border-orange-500/15 rounded-lg text-center font-mono text-orange-400 outline-none" />
                                  </div>
                                )}
                                {workspaceMode === 'price_override' && (
                                  <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-end gap-2">
                                      <span className="text-[10px] text-zinc-500 font-bold">Sale Price:</span>
                                      <input type="number" step="0.01" value={item.newPrice} onChange={(e) => handleVoucherFieldChange(p._id, 'newPrice', e.target.value)} className="w-24 h-9 bg-white/5 border border-white/10 rounded-lg text-center font-mono text-white outline-none" />
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                      <span className="text-[10px] text-zinc-500 font-bold">MRP Price:</span>
                                      <input type="number" step="0.01" value={item.newOriginalPrice} onChange={(e) => handleVoucherFieldChange(p._id, 'newOriginalPrice', e.target.value)} className="w-24 h-9 bg-white/5 border border-white/10 rounded-lg text-center font-mono text-white outline-none" />
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                      <span className="text-[10px] text-blue-400 font-bold">Offer:</span>
                                      <input type="text" value={item.newOffer} onChange={(e) => handleVoucherFieldChange(p._id, 'newOffer', e.target.value)} placeholder="BOGO" className="w-24 h-9 bg-blue-500/5 border border-blue-500/15 rounded-lg text-center text-blue-300 font-bold outline-none" />
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <button type="button" onClick={() => handleRemoveFromVoucher(p._id)} className="text-zinc-600 hover:text-red-400 p-1.5 rounded-lg"><Trash2 size={14} /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {voucherItems.length > 0 && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Check size={16} strokeWidth={2.5} />
                  {submitting ? 'Applying Variations...' : 'Commit Operational Workspace Logs'}
                </button>
              )}
            </form>
          </div>

          {/* RIGHT PANEL: History Stream Cards */}
          <div className={`space-y-4 ${viewLogsMobile ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-[#111115] border border-white/5 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
              <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><ClipboardList className="text-zinc-400" size={16} /> Historical Audit Trails</span>
              <span className="text-[10px] bg-white/5 border border-white/5 font-mono text-zinc-500 font-bold px-2 rounded">{historyLogs.length} entries</span>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[75vh] pr-1 light-scroll">
              {historyLogs.length === 0 ? (
                <div className="bg-[#111115] border border-white/5 p-12 text-center rounded-2xl text-zinc-600 text-xs">
                  <FileText className="mx-auto opacity-15 mb-2" size={26} />
                  <p>No transactions logged inside database yet.</p>
                </div>
              ) : historyLogs.map(log => (
                <div key={log._id} className="bg-[#111115] border border-white/5 rounded-2xl p-4 space-y-3 border-l-2 border-l-purple-500/30 hover:border-l-purple-400 transition-all">
                  <div className="flex flex-col gap-1 border-b border-white/5 pb-2.5">
                    <p className="text-[13px] font-black text-white tracking-wide">{log.note}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-500 font-medium mt-1">
                      <span className="flex items-center gap-1"><Calendar size={11} /> {fmtDate(log.createdAt)}</span>
                      <span className="flex items-center gap-1"><User size={11} /> By: {log.receivedBy?.name || 'Admin'}</span>
                    </div>
                  </div>
                  <div className="space-y-2 pt-0.5">
                    {(log.items || []).map((item, idx) => {
                      const qtyValue = item.changedQty !== undefined ? item.changedQty : item.addedQty || 0;
                      const isLoss = item.type?.includes('loss') || qtyValue < 0;
                      const isNeutral = qtyValue === 0;
                      return (
                        <div key={idx} className="flex justify-between items-start text-[12px] py-1 border-b border-white/[1%] last:border-0">
                          <span className="font-semibold text-zinc-400 truncate max-w-[180px]">{item.name}</span>
                          <div className="flex items-center gap-2 font-mono text-right flex-shrink-0">
                            {isNeutral ? <span className="text-blue-400 font-bold">Override</span> : <span className={isLoss ? 'text-red-400 font-black' : 'text-emerald-400 font-black'}>{qtyValue > 0 ? `+${qtyValue}` : qtyValue}</span>}
                            <span className="text-zinc-600 text-[10px]">Stock: {item.newTotalStock}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}