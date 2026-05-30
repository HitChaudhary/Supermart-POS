import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Edit2, Trash2, X, Check, 
  Package, Tag, Gift, AlertTriangle, SlidersHorizontal, RefreshCw, Layers
} from 'lucide-react';

const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;

const CATEGORIES = ['Vegetables', 'Fruits', 'Groceries', 'Beverages', 'Snacks'];

const StockBadge = ({ stock }) => {
  if (stock === 0) return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">OUT OF STOCK</span>;
  if (stock <= 5)  return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/15">{stock} · CRITICAL</span>;
  if (stock <= 15) return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/15">{stock} · LOW</span>;
  return                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">{stock} · OK</span>;
};

const EMPTY_FORM = { name: '', brand: '', category: 'Vegetables', subcategory: '', price: '', originalPrice: '', offer: '', unit: 'pc', stock: '', image: '', giftName: '', giftMinQty: '' };

// ── GLOBAL RESUABLE INPUT FIELD (Bypasses rendering bottlenecks cleanly) ──
const FormField = ({ label, value, onChange, error, type = 'text', placeholder = '' }) => (
  <div>
    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">{label}</label>
    <input
      type={type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full h-10 px-3 rounded-xl bg-white/5 border text-[13px] font-medium text-white outline-none transition-all
        ${error ? 'border-red-500/60 focus:border-red-400' : 'border-white/8 focus:border-emerald-500/60 focus:bg-white/8'}`}
    />
    {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
  </div>
);

// ── PRODUCT EDIT MODAL LAYER ──
const ProductModal = ({ product, onSave, onClose }) => {
  const [form, setForm] = useState({ 
    ...product, 
    giftName: product.gift?.name || '', 
    giftMinQty: product.gift?.minQty || '' 
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = 'Required';
    if (!form.brand?.trim()) e.brand = 'Required';
    if (!form.price || isNaN(form.price) || parseFloat(form.price) <= 0) e.price = 'Enter valid price';
    if (!form.originalPrice || isNaN(form.originalPrice) || parseFloat(form.originalPrice) <= 0) e.originalPrice = 'Enter valid MRP';
    if (form.stock === undefined || form.stock === '' || isNaN(form.stock) || parseInt(form.stock) < 0) e.stock = 'Enter valid stock';
    if (!form.unit?.trim()) e.unit = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        originalPrice: parseFloat(form.originalPrice),
        stock: parseInt(form.stock),
        gift: form.giftName.trim() ? { name: form.giftName, minQty: parseInt(form.giftMinQty) || 1 } : null
      };

      const res = await axios.put(`/api/products/${product._id}`, payload);
      onSave(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred syncing details to network router.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111115] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-[13px] font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Edit2 size={14} className="text-emerald-400" /> Modify Product Mapping Profile
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Product Name" value={form.name} onChange={e => handleInputChange('name', e.target.value)} error={errors.name} />
            <FormField label="Brand Name" value={form.brand} onChange={e => handleInputChange('brand', e.target.value)} error={errors.brand} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => handleInputChange('category', e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/8 text-[13px] font-medium text-white outline-none focus:border-emerald-500/60 appearance-none cursor-pointer"
              >
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111115]">{c}</option>)}
              </select>
            </div>
            <FormField label="Subcategory" value={form.subcategory} onChange={e => handleInputChange('subcategory', e.target.value)} error={errors.subcategory} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Price (₹)" value={form.price} type="number" onChange={e => handleInputChange('price', e.target.value)} error={errors.price} />
            <FormField label="MRP (₹)" value={form.originalPrice} type="number" onChange={e => handleInputChange('originalPrice', e.target.value)} error={errors.originalPrice} />
            <FormField label="Current Stock" value={form.stock} type="number" onChange={e => handleInputChange('stock', e.target.value)} error={errors.stock} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Measurement Unit" value={form.unit} onChange={e => handleInputChange('unit', e.target.value)} error={errors.unit} />
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Active Promotion</label>
              <div className="relative">
                <FormField value={form.offer} onChange={e => handleInputChange('offer', e.target.value)} placeholder="e.g. 10% OFF" />
                {form.offer && (
                  <button type="button" onClick={() => handleInputChange('offer', '')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-red-400 bg-red-500/10 hover:bg-red-500/20 px-2 py-0.5 rounded-md">Clear</button>
                )}
              </div>
            </div>
          </div>

          <FormField label="Image URL Path" value={form.image} onChange={e => handleInputChange('image', e.target.value)} />

          <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5"><Gift size={12} /> Incentive Promotion</p>
              {form.giftName && <button type="button" onClick={() => { handleInputChange('giftName', ''); handleInputChange('giftMinQty', ''); }} className="text-[10px] font-black uppercase text-red-400">Remove</button>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Free Gift Product Item" value={form.giftName} onChange={e => handleInputChange('giftName', e.target.value)} />
              <FormField label="Min Trigger Quantity" value={form.giftMinQty} type="number" onChange={e => handleInputChange('giftMinQty', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 pb-6 border-t border-white/5 pt-4">
          <button onClick={onClose} disabled={submitting} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold rounded-xl">Cancel</button>
          <button onClick={handleSave} disabled={submitting} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md">{submitting ? 'Saving...' : 'Apply Changes'}</button>
        </div>
      </div>
    </div>
  );
};

// ── MAIN APPLICATION MASTER LAYOUT ──
export default function Products() {
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState('All');
  const [stockFilter, setStockFilter] = useState('all');
  
  const [editModal, setEditModal]     = useState(null); 
  const [deleteId, setDeleteId]       = useState(null);

  // ── INDUCTION SIDE PANEL STATE ──
  const [inductionForm, setInductionForm] = useState(EMPTY_FORM);
  const [inductionErrors, setInductionErrors] = useState({});
  const [inductionSubmitting, setInductionSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let targetUrl = `/api/products?category=${category}`;
      if (stockFilter === 'out') targetUrl += '&inStock=false'; 
      const res = await axios.get(targetUrl);
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failure executing catalog load sequences: ', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, stockFilter]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search || 
        p.name?.toLowerCase().includes(search.toLowerCase()) || 
        p.brand?.toLowerCase().includes(search.toLowerCase());
      
      const matchStock =
        stockFilter === 'all'      ? true :
        stockFilter === 'out'      ? p.stock === 0 :
        stockFilter === 'low'      ? p.stock > 0 && p.stock <= 15 :
        stockFilter === 'instock'  ? p.stock > 15 : true;

      return matchSearch && matchStock;
    });
  }, [search, products, stockFilter]);

  // ── RESTORED: MASTER CALLBACK DISPATCHER ──
  const handleSaveCallback = () => {
    fetchProducts();
    setEditModal(null);
  };

  const handleInductionChange = (k, v) => {
    setInductionForm(f => ({ ...f, [k]: v }));
    if (inductionErrors[k]) setInductionErrors(e => ({ ...e, [k]: '' }));
  };

  const validateInduction = () => {
    const e = {};
    if (!inductionForm.name?.trim()) e.name = 'Required';
    if (!inductionForm.brand?.trim()) e.brand = 'Required';
    if (!inductionForm.price || isNaN(inductionForm.price) || parseFloat(inductionForm.price) <= 0) e.price = 'Invalid Price';
    if (!inductionForm.originalPrice || isNaN(inductionForm.originalPrice) || parseFloat(inductionForm.originalPrice) <= 0) e.originalPrice = 'Invalid MRP';
    if (!inductionForm.stock || isNaN(inductionForm.stock) || parseInt(inductionForm.stock) < 0) e.stock = 'Invalid Stock';
    if (!inductionForm.unit?.trim()) e.unit = 'Required';
    setInductionErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInductionSubmit = async (e) => {
    e.preventDefault();
    if (!validateInduction()) return;
    setInductionSubmitting(true);
    try {
      const payload = {
        ...inductionForm,
        price: parseFloat(inductionForm.price),
        originalPrice: parseFloat(inductionForm.originalPrice),
        stock: parseInt(inductionForm.stock),
        gift: inductionForm.giftName.trim() ? { name: inductionForm.giftName, minQty: parseInt(inductionForm.giftMinQty) || 1 } : null
      };

      await axios.post('/api/products', payload);
      alert(`${inductionForm.name} safely committed to product inventory stores!`);
      setInductionForm(EMPTY_FORM);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred publishing new product matrix.');
    } finally {
      setInductionSubmitting(false);
    }
  };

  const handleDeleteCommit = async () => {
    try {
      await axios.delete(`/api/products/${deleteId}`);
      setProducts(prev => prev.filter(p => p._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed soft-deleting tracking instance.');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start p-2 max-w-7xl mx-auto">
      
      {/* SEPARATE SIDE SECTION: Reliable Fast Induction Form Card */}
      <form onSubmit={handleInductionSubmit} className="xl:col-span-1 bg-[#111115] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="border-b border-white/5 pb-2.5">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Plus size={15} className="text-emerald-400" /> Fast Induction Deck
          </h3>
          <p className="text-[11px] text-zinc-500 mt-1">Register new commodities into cluster tables instantly at full typing speed.</p>
        </div>

        <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1 light-scroll">
          <FormField label="Product Name" value={inductionForm.name} onChange={e => handleInductionChange('name', e.target.value)} error={inductionErrors.name} placeholder="e.g. Bananas Pack" />
          <FormField label="Brand Label" value={inductionForm.brand} onChange={e => handleInductionChange('brand', e.target.value)} error={inductionErrors.brand} placeholder="e.g. Green Earth" />
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={inductionForm.category}
                onChange={e => handleInductionChange('category', e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/8 text-[13px] font-medium text-white outline-none focus:border-emerald-500/60 cursor-pointer"
              >
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111115]">{c}</option>)}
              </select>
            </div>
            <FormField label="Subcategory" value={inductionForm.subcategory} onChange={e => handleInductionChange('subcategory', e.target.value)} placeholder="Leafy Greens" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Sale Price" value={inductionForm.price} type="number" onChange={e => handleInductionChange('price', e.target.value)} error={inductionErrors.price} placeholder="0.00" />
            <FormField label="MRP Cost" value={inductionForm.originalPrice} type="number" onChange={e => handleInductionChange('originalPrice', e.target.value)} error={inductionErrors.originalPrice} placeholder="0.00" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Initial Stock" value={inductionForm.stock} type="number" onChange={e => handleInductionChange('stock', e.target.value)} error={inductionErrors.stock} placeholder="0" />
            <FormField label="Unit" value={inductionForm.unit} onChange={e => handleInductionChange('unit', e.target.value)} error={inductionErrors.unit} placeholder="kg / pc / box" />
          </div>

          <div className="relative">
            <FormField label="Offer Tag (Optional)" value={inductionForm.offer} onChange={e => handleInductionChange('offer', e.target.value)} placeholder="e.g. BUY 1 GET 1" />
            {inductionForm.offer && (
              <button type="button" onClick={() => handleInductionChange('offer', '')} className="absolute right-2.5 top-[34px] text-[10px] font-bold uppercase text-red-400 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">Clear</button>
            )}
          </div>

          <div className="border-t border-white/5 pt-3 space-y-3">
            <span className="text-[10px] font-black uppercase text-purple-400 tracking-widest block">Gift Campaign Mappings</span>
            <div className="grid grid-cols-2 gap-2">
              <FormField label="Gift Item Description" value={inductionForm.giftName} onChange={e => handleInductionChange('giftName', e.target.value)} placeholder="Eco Bag" />
              <FormField label="Min Order Volume" value={inductionForm.giftMinQty} type="number" onChange={e => handleInductionChange('giftMinQty', e.target.value)} placeholder="3" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={inductionSubmitting}
          className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <Check size={14} strokeWidth={2.5} /> {inductionSubmitting ? 'Syncing Base Catalog...' : 'Commit New Entry'}
        </button>
      </form>

      {/* RIGHT SECTION: Master Inventory Search Ledger Matrix */}
      <div className="xl:col-span-3 space-y-4">
        
        {/* Search Controls Strip */}
        <div className="bg-[#111115] border border-white/5 p-4 rounded-2xl flex flex-wrap items-center gap-3 shadow-md">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter list ledger details by title or brand..."
              className="w-full h-10 pl-9 pr-4 bg-white/5 border border-white/8 rounded-xl text-[13px] text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/40 transition-all font-medium"
            />
          </div>

          <div className="flex bg-white/5 border border-white/5 rounded-xl p-1 overflow-x-auto max-w-full light-scroll">
            <button onClick={() => setCategory('All')} className={`px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wide transition-all ${category === 'All' ? 'bg-emerald-500 text-white' : 'text-zinc-500'}`}>ALL</button>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wide transition-all whitespace-nowrap ${category === c ? 'bg-emerald-500 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {c.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="relative flex items-center bg-white/5 border border-white/5 rounded-xl px-3">
            <SlidersHorizontal size={12} className="text-zinc-500 mr-2" />
            <select value={stockFilter} onChange={e => setStockFilter(e.target.value)}
              className="h-9 bg-transparent border-0 text-[11px] font-black text-zinc-400 outline-none cursor-pointer uppercase tracking-wider appearance-none pr-4">
              <option value="all" className="bg-[#111115]">All Volumes</option>
              <option value="instock" className="bg-[#111115]">Safe Stock</option>
              <option value="low" className="bg-[#111115]">Low Warning</option>
              <option value="out" className="bg-[#111115]">Depleted</option>
            </select>
          </div>
        </div>

        {/* Database Presentation Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#111115] border border-white/5 rounded-2xl space-y-3">
            <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-500 font-bold tracking-wider uppercase">Loading live catalog indices...</p>
          </div>
        ) : (
          <div className="bg-[#111115] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.5%] text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    <th className="px-5 py-4">Product Summary</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Pricing Matrix</th>
                    <th className="px-5 py-4">Capacity Status</th>
                    <th className="px-5 py-4">Promotional Campaigns</th>
                    <th className="px-4 py-4 w-20 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[13px]">
                  {filtered.map(p => (
                    <tr key={p._id} className="hover:bg-white/[0.5%] transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={p.image || 'https://placehold.co/40'} alt={p.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-white/5 bg-white/5" />
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate max-w-[160px]">{p.name}</p>
                            <p className="text-[11px] text-zinc-500 font-semibold">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] font-black text-zinc-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg uppercase tracking-wide">{p.category}</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        <p className="font-black text-white text-[14px]">{fmt(p.price)}</p>
                        {p.discountPercent > 0 && (
                          <p className="text-[10px] text-zinc-600 line-through font-bold mt-0.5">{fmt(p.originalPrice)}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5"><StockBadge stock={p.stock} /></td>
                      <td className="px-5 py-3.5">
                        <div className="space-y-1">
                          {p.offer && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-black text-orange-400 bg-orange-500/5 border border-orange-500/10 rounded-md px-1.5 py-0.5">
                              <Tag size={9} /> {p.offer.toUpperCase()}
                            </div>
                          )}
                          {p.gift?.name && (
                            <div className="flex items-center gap-1 text-[10px] font-black text-purple-400 bg-purple-500/5 border border-purple-500/10 rounded-md px-1.5 py-0.5 w-fit">
                              <Gift size={9} /> {p.gift.name} (Min: {p.gift.minQty})
                            </div>
                          )}
                          {!p.offer && !p.gift?.name && <span className="text-[11px] text-zinc-700 font-bold">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditModal(p)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 flex items-center justify-center transition-colors border border-white/5"><Edit2 size={12} /></button>
                          <button onClick={() => setDeleteId(p._id)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-colors border border-white/5"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="p-16 text-center text-zinc-600 border-t border-white/5 flex flex-col items-center justify-center">
                <Package size={28} className="mb-2 opacity-20 animate-pulse" />
                <p className="text-[12px] font-bold text-zinc-500">No matching commodities found within current filter configurations.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Forms/Modals */}
      {editModal && (
        <ProductModal
          product={editModal}
          onSave={handleSaveCallback}
          onClose={() => setEditModal(null)}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111115] border border-white/10 rounded-2xl p-6 w-full max-w-xs shadow-2xl">
            <div className="w-11 h-11 rounded-xl bg-red-500/15 flex items-center justify-center mb-4 border border-red-500/10">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <h3 className="text-[15px] font-black text-white tracking-tight">Archive This Commodity?</h3>
            <p className="text-[12px] text-zinc-500 mt-1 mb-5 leading-relaxed">This item will be soft-deleted out of active view ports while preserving tracking logs safely.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 h-10 rounded-xl bg-white/5 text-zinc-300 text-[12px] font-bold">Cancel</button>
              <button onClick={handleDeleteCommit} className="flex-1 h-10 rounded-xl bg-red-600 text-white text-[12px] font-black">Archive</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}