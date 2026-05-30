import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Search, Plus, Minus, Trash2, ArrowRight,
  Package, Gift, Tag, ShoppingCart, Zap, X,
  Check, AlertCircle, RefreshCw, ChevronRight,
  SlidersHorizontal, Star, Percent,
} from 'lucide-react';

const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;

const getUnitConfig = (unit = 'pc') => {
  const u = unit.toLowerCase().trim();
  if (['kg','kgs','kilogram','kilograms'].includes(u)) return { step:0.5, min:0.5, decimals:1, label:'kg' };
  if (['g','gm','gram','grams'].includes(u))           return { step:100, min:100, decimals:0, label:'g'  };
  if (['l','ltr','litre','liter','liters'].includes(u)) return { step:0.5, min:0.5, decimals:1, label:'L'  };
  if (['ml','millilitre','milliliter'].includes(u))     return { step:250, min:250, decimals:0, label:'ml' };
  return { step:1, min:1, decimals:0, label: unit };
};

// ── Qty Popup ─────────────────────────────────────────────────
const QtyPopup = ({ product, onConfirm, onClose }) => {
  const cfg = getUnitConfig(product.unit);
  const [qty, setQty] = useState(cfg.min);
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current?.select(), 60); }, []);
  const clamp = (v) => Math.max(cfg.min, parseFloat(v.toFixed(3)));
  const inc = () => setQty(q => clamp(q + cfg.step));
  const dec = () => setQty(q => clamp(q - cfg.step));
  const handleInput = (e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) setQty(Math.max(cfg.min, v)); };
  const handleKey  = (e) => {
    if (e.key==='Enter')     { e.preventDefault(); onConfirm(product, qty); }
    if (e.key==='Escape')    { e.preventDefault(); onClose(); }
    if (e.key==='ArrowUp')   { e.preventDefault(); inc(); }
    if (e.key==='ArrowDown') { e.preventDefault(); dec(); }
  };
  const lineTotal    = product.price * qty;
  const exceedsStock = qty > product.stock;
  const giftUnlocked = product.gift?.name && qty >= product.gift.minQty;
  const presets = cfg.step < 1
    ? [cfg.min, cfg.min*2, cfg.min*4, cfg.min*6]
    : [1,2,3,5,10].filter(n => n >= cfg.min);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
      onClick={(e) => e.target===e.currentTarget && onClose()}>
      <div className="bg-[#111115] border border-white/10 rounded-3xl w-full max-w-[360px] shadow-2xl overflow-hidden"
        style={{ animation:'fadeIn 0.18s ease forwards' }}>
        <div className="relative h-40 overflow-hidden">
          <img src={product.image||'https://placehold.co/400x160/1a1a1f/444?text=No+Image'}
            alt={product.name} className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-[#111115]/50 to-transparent"/>
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition-colors">
            <X size={14}/>
          </button>
          {product.offer && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-orange-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
              <Zap size={8}/> {product.offer}
            </div>
          )}
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{product.brand}</p>
            <h2 className="text-[18px] font-black text-white leading-tight mt-0.5">{product.name}</h2>
          </div>
        </div>
        <div className="px-5 pt-4 pb-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[24px] font-black text-white font-mono-num">{fmt(product.price)}</span>
                <span className="text-zinc-500 text-[12px]">/ {cfg.label}</span>
              </div>
              {product.discountPercent > 0 && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-zinc-600 line-through font-mono-num">{fmt(product.originalPrice)}</span>
                  <span className="text-[10px] font-black text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-md">-{product.discountPercent}% OFF</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Available</p>
              <p className={`text-[15px] font-black font-mono-num mt-0.5 ${product.stock===0?'text-red-400':product.stock<=5?'text-orange-400':'text-emerald-400'}`}>
                {product.stock} {cfg.label}
              </p>
            </div>
          </div>
          {product.gift?.name && (
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border transition-all ${giftUnlocked?'bg-purple-500/20 border-purple-400/40':'bg-purple-500/8 border-purple-500/15'}`}>
              <Gift size={13} className={giftUnlocked?'text-purple-300':'text-purple-500'}/>
              <span className={`text-[11px] font-bold ${giftUnlocked?'text-purple-200':'text-purple-400'}`}>
                {giftUnlocked ? `🎁 Gift unlocked: ${product.gift.name}!` : `Free ${product.gift.name} with ${product.gift.minQty}+ ${cfg.label}`}
              </span>
            </div>
          )}
          <div>
            <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">Quantity ({cfg.label})</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={dec} disabled={qty<=cfg.min}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all active:scale-95 flex-shrink-0">
                <Minus size={18}/>
              </button>
              <div className="flex-1 relative">
                <input ref={inputRef} type="number" value={qty} onChange={handleInput} onKeyDown={handleKey}
                  min={cfg.min} step={cfg.step}
                  className={`w-full h-12 text-center text-[20px] font-black text-white bg-white/5 border rounded-xl outline-none transition-all font-mono-num ${exceedsStock?'border-red-500/60 bg-red-500/5':'border-white/10 focus:border-emerald-500/60 focus:bg-white/8'}`}/>
              </div>
              <button type="button" onClick={inc}
                className="w-12 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-all active:scale-95 flex-shrink-0 shadow-lg shadow-emerald-500/20">
                <Plus size={18}/>
              </button>
            </div>
            {exceedsStock && (
              <div className="flex items-center gap-1.5 mt-2 text-red-400">
                <AlertCircle size={12}/>
                <p className="text-[11px] font-bold">Only {product.stock} {cfg.label} in stock</p>
              </div>
            )}
            <div className="flex gap-2 mt-3 flex-wrap">
              {presets.map((p) => (
                <button key={p} type="button" onClick={() => setQty(p)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${qty===p?'bg-emerald-500/20 border-emerald-500/40 text-emerald-300':'bg-white/5 border-white/8 text-zinc-400 hover:border-white/15 hover:text-zinc-200'}`}>
                  {cfg.decimals>0?p.toFixed(cfg.decimals):p} {cfg.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between bg-white/3 border border-white/6 rounded-xl px-4 py-3">
            <span className="text-[12px] font-bold text-zinc-400">{fmt(product.price)} × {cfg.decimals>0?qty.toFixed(cfg.decimals):qty} {cfg.label}</span>
            <span className="text-[20px] font-black text-emerald-400 font-mono-num">{fmt(lineTotal)}</span>
          </div>
          <button type="button" onClick={() => onConfirm(product, qty)} disabled={exceedsStock||product.stock===0}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed font-black text-[14px] text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20">
            <Check size={17}/> Add {cfg.decimals>0?qty.toFixed(cfg.decimals):qty} {cfg.label} to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Filter pill components ────────────────────────────────────
const Pill = ({ label, active, count, color = 'emerald', onClick }) => {
  const colors = {
    emerald: active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'           : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5',
    blue   : active ? 'bg-blue-500/25 text-blue-300 border border-blue-400/40'                        : 'bg-white/4 text-zinc-500 hover:bg-white/8 hover:text-zinc-300 border border-white/6',
    violet : active ? 'bg-violet-500/25 text-violet-300 border border-violet-400/40'                  : 'bg-white/4 text-zinc-500 hover:bg-white/8 hover:text-zinc-300 border border-white/6',
    orange : active ? 'bg-orange-500/25 text-orange-300 border border-orange-400/40 scale-105'        : 'bg-white/4 text-zinc-500 hover:bg-white/8 hover:text-zinc-300 border border-white/6',
  };
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-200 whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${colors[color]}`}>
      {label}
      {count !== undefined && (
        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${active?'bg-white/20 text-white':'bg-white/8 text-zinc-600'}`}>
          {count}
        </span>
      )}
    </button>
  );
};

// ── Product card ─────────────────────────────────────────────
const ProductCard = ({ product, cartQty, onCardClick, onUpdateQty }) => {
  const oos = product.stock === 0;
  return (
    <div
      className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 ${oos?'opacity-40 grayscale border-white/5 cursor-not-allowed bg-white/3':'bg-[#1a1a1f] border-white/8 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 cursor-pointer'}`}
      onClick={() => !oos && onCardClick(product)}>
      <div className="relative h-36 overflow-hidden bg-zinc-800">
        <img src={product.image||'https://placehold.co/300x144/1a1a1f/444?text=No+Image'} alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-transparent to-transparent opacity-70"/>
        {product.offer && !oos && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-orange-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
            <Zap size={8}/> {product.offer}
          </div>
        )}
        {product.discountPercent > 0 && !product.offer && !oos && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-rose-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
            <Percent size={8}/> -{product.discountPercent}%
          </div>
        )}
        {oos && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="bg-red-500/90 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Out of Stock</span>
          </div>
        )}
        {product.gift?.name && !oos && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-purple-600/90 backdrop-blur text-white text-[9px] font-bold px-2 py-1 rounded-full">
            <Gift size={8}/> FREE GIFT
          </div>
        )}
        {cartQty > 0 && (
          <div className="absolute top-2.5 right-2.5 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[11px] font-black shadow-lg ring-2 ring-[#1a1a1f]">
            {cartQty}
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col p-3 gap-2">
        <div>
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">{product.brand}</p>
          <h3 className="text-[13px] font-bold text-white leading-snug line-clamp-2">{product.name}</h3>
          {product.subcategory && <p className="text-[9px] text-zinc-600 mt-0.5 truncate">{product.subcategory}</p>}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-[16px] font-black text-white font-mono-num">{fmt(product.price)}</span>
            <span className="text-[10px] text-zinc-500 ml-1">/{product.unit||'pc'}</span>
            {product.discountPercent > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-zinc-600 line-through font-mono-num">{fmt(product.originalPrice)}</span>
                <span className="text-[9px] font-black text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-md">-{product.discountPercent}%</span>
              </div>
            )}
          </div>
          {!oos && (
            cartQty > 0
              ? (
                <div className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-1.5 py-1"
                  onClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={() => onUpdateQty(product._id, cartQty - getUnitConfig(product.unit).step)}
                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-red-500/30 flex items-center justify-center text-white transition-colors">
                    {cartQty <= getUnitConfig(product.unit).min ? <Trash2 size={10}/> : <Minus size={10}/>}
                  </button>
                  <span className="w-8 text-center text-[11px] font-black text-emerald-400 font-mono-num">
                    {getUnitConfig(product.unit).decimals > 0 ? cartQty.toFixed(1) : cartQty}
                  </span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); onCardClick(product); }}
                    className="w-6 h-6 rounded-lg bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-white transition-colors">
                    <Plus size={10}/>
                  </button>
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 transition-all group-hover:scale-110">
                  <Plus size={16} strokeWidth={3}/>
                </div>
              )
          )}
        </div>
        {product.gift?.name && !oos && (
          <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg px-2 py-1.5">
            <Gift size={10} className="text-purple-400 flex-shrink-0"/>
            <span className="text-[9px] font-bold text-purple-300 truncate">Free {product.gift.name} with {product.gift.minQty}+</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Cart sidebar row ─────────────────────────────────────────
const CartRow = ({ item, onAdd, onUpdate }) => (
  <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
    <img src={item.image||'https://placehold.co/44/1a1a1f/444'} alt={item.name}
      className="w-11 h-11 rounded-xl object-cover flex-shrink-0 ring-1 ring-white/10"/>
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-bold text-white truncate leading-tight">{item.name}</p>
      <p className="text-[10px] text-zinc-500 mt-0.5 font-mono-num">{fmt(item.price)} × {item.qty}</p>
    </div>
    <div className="flex flex-col items-end gap-1">
      <p className="text-[13px] font-black text-emerald-400 font-mono-num">{fmt(item.price*item.qty)}</p>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onUpdate(item._id, item.qty - getUnitConfig(item.unit).step)}
          className="w-5 h-5 rounded-md bg-white/10 hover:bg-red-500/30 flex items-center justify-center text-white transition-colors">
          {item.qty <= getUnitConfig(item.unit).min ? <Trash2 size={9}/> : <Minus size={9}/>}
        </button>
        <span className="w-6 text-center text-[11px] font-black text-white font-mono-num">
          {getUnitConfig(item.unit).decimals>0?Number(item.qty).toFixed(1):item.qty}
        </span>
        <button type="button" onClick={() => onAdd(item)}
          className="w-5 h-5 rounded-md bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-colors">
          <Plus size={9}/>
        </button>
      </div>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────
export default function ProductDiscovery({
  cart, financials, gifts,
  addToCart, updateQty,
  session, onGoCheckout,
  dbProducts = [],
  loadingProducts = false,
  productError = '',
}) {
  const [category,        setCategory]        = useState('All');
  const [subcategory,     setSubcategory]      = useState('All');
  const [brand,           setBrand]            = useState('All');
  const [specialFilter,   setSpecialFilter]    = useState('all');   // 'all' | 'offers' | 'discounted' | 'gifts'
  const [search,          setSearch]           = useState('');
  const [showBrandPanel,  setShowBrandPanel]   = useState(false);
  const [popupItem,       setPopupItem]        = useState(null);
  const inputRef = useRef(null);

  // ── Derived filter options ─────────────────────────────────

  const categories = useMemo(() => {
    const unique = [...new Set(dbProducts.map(p => p.category).filter(Boolean))].sort();
    return ['All', ...unique];
  }, [dbProducts]);

  const subcategories = useMemo(() => {
    if (category === 'All') return [];
    const pool   = dbProducts.filter(p => p.category === category);
    const unique = [...new Set(pool.map(p => p.subcategory).filter(Boolean))].sort();
    return unique;
  }, [dbProducts, category]);

  const subcategoryCounts = useMemo(() => {
    const counts = {};
    dbProducts
      .filter(p => p.category === category && p.subcategory)
      .forEach(p => { counts[p.subcategory] = (counts[p.subcategory] || 0) + 1; });
    return counts;
  }, [dbProducts, category]);

  // All unique brands, sorted — scoped to active category/subcategory
  const brands = useMemo(() => {
    let pool = dbProducts;
    if (category    !== 'All') pool = pool.filter(p => p.category    === category);
    if (subcategory !== 'All') pool = pool.filter(p => p.subcategory === subcategory);
    const unique = [...new Set(pool.map(p => p.brand).filter(Boolean))].sort();
    return unique;
  }, [dbProducts, category, subcategory]);

  // Brand counts
  const brandCounts = useMemo(() => {
    const counts = {};
    let pool = dbProducts;
    if (category    !== 'All') pool = pool.filter(p => p.category    === category);
    if (subcategory !== 'All') pool = pool.filter(p => p.subcategory === subcategory);
    pool.forEach(p => { if (p.brand) counts[p.brand] = (counts[p.brand] || 0) + 1; });
    return counts;
  }, [dbProducts, category, subcategory]);

  // Special filter counts
  const specialCounts = useMemo(() => {
    let pool = dbProducts;
    if (category    !== 'All') pool = pool.filter(p => p.category    === category);
    if (subcategory !== 'All') pool = pool.filter(p => p.subcategory === subcategory);
    if (brand       !== 'All') pool = pool.filter(p => p.brand       === brand);
    return {
      offers    : pool.filter(p => p.offer).length,
      discounted: pool.filter(p => p.discountPercent > 0).length,
      gifts     : pool.filter(p => p.gift?.name).length,
    };
  }, [dbProducts, category, subcategory, brand]);

  // Reset chain: category → subcategory → brand
  useEffect(() => { setSubcategory('All'); setBrand('All'); }, [category]);
  useEffect(() => { setBrand('All'); }, [subcategory]);
  useEffect(() => { if (category !== 'All' && !categories.includes(category)) setCategory('All'); }, [categories, category]);

  // Close brand panel if brand selected or context lost
  useEffect(() => { if (brands.length === 0) setShowBrandPanel(false); }, [brands]);

  // ── Cart map ───────────────────────────────────────────────
  const cartMap = useMemo(() => {
    const m = {};
    cart.forEach(i => { m[i._id] = i.qty; });
    return m;
  }, [cart]);

  // ── Filtered products ──────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = dbProducts;

    if (category    !== 'All') list = list.filter(p => p.category    === category);
    if (subcategory !== 'All') list = list.filter(p => p.subcategory === subcategory);
    if (brand       !== 'All') list = list.filter(p => p.brand       === brand);

    // Special filters
    if (specialFilter === 'offers')     list = list.filter(p => p.offer);
    if (specialFilter === 'discounted') list = list.filter(p => p.discountPercent > 0);
    if (specialFilter === 'gifts')      list = list.filter(p => p.gift?.name);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q)          ||
        p.brand.toLowerCase().includes(q)         ||
        (p.subcategory||'').toLowerCase().includes(q)
      );
    }
    return list;
  }, [category, subcategory, brand, specialFilter, search, dbProducts]);

  const totalQty = cart.reduce((a, i) => a + i.qty, 0);

  // Active filter count (for badge on filter button)
  const activeFilterCount = [
    category    !== 'All',
    subcategory !== 'All',
    brand       !== 'All',
    specialFilter !== 'all',
    search.trim() !== '',
  ].filter(Boolean).length;

  const clearAll = () => {
    setCategory('All');
    setSubcategory('All');
    setBrand('All');
    setSpecialFilter('all');
    setSearch('');
  };

  // Ctrl+F
  useEffect(() => {
    const fn = (e) => {
      if ((e.ctrlKey||e.metaKey) && e.key==='f') { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const handleCardClick    = useCallback((product) => { if (product.stock > 0) setPopupItem(product); }, []);
  const handlePopupConfirm = useCallback((product, qty) => { if (typeof addToCart==='function') addToCart(product, qty); setPopupItem(null); }, [addToCart]);

  const showSubcategoryBar = category !== 'All' && subcategories.length > 0;

  // ── Special filter options ─────────────────────────────────
  const SPECIAL_OPTIONS = [
    { key:'all',        label:'All Products',    icon: null,    color:'emerald' },
    { key:'offers',     label:'Special Offers',  icon: <Zap size={10}/>,     color:'orange'  },
    { key:'discounted', label:'On Discount',     icon: <Percent size={10}/>, color:'orange'  },
    { key:'gifts',      label:'Free Gift',       icon: <Gift size={10}/>,    color:'violet'  },
  ];

  return (
    <>
      <div className="flex-1 flex h-full overflow-hidden w-full">

        {/* ── LEFT: Product catalog ─────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0d0f]">

          {/* ═══ FILTER HEADER ══════════════════════════════ */}
          <div className="flex-shrink-0 border-b border-white/5 bg-[#111114]">

            {/* Row 1 — Logo · Search · Category pills */}
            <div className="flex flex-wrap items-center gap-4 px-6 pt-4 pb-3">
              {/* Logo */}
              <div className="flex-shrink-0">
                <h1 className="text-xl font-black tracking-tight text-white">
                  Super<span className="text-emerald-500">Mart</span>
                  <span className="ml-2 text-xs font-semibold text-zinc-600 tracking-wider">TERMINAL POS</span>
                </h1>
                <p className="text-[10px] text-zinc-600 mt-0.5 font-medium">
                  Operator: {session.cashierName} · Since {session.shiftStart}
                </p>
              </div>

              <div className="h-8 w-px bg-white/5 hidden sm:block flex-shrink-0"/>

              {/* Search */}
              <div className="relative flex-1 max-w-sm min-w-[180px]">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"/>
                <input ref={inputRef} type="text" value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search product or brand (Ctrl+F)…"
                  className="w-full h-10 pl-9 pr-8 bg-white/5 border border-white/8 rounded-xl text-[13px] font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all"/>
                {search && (
                  <button type="button" onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                    <X size={13}/>
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 flex-shrink-0 max-w-full">
                {loadingProducts
                  ? [1,2,3,4].map(i => <div key={i} className="h-8 w-20 rounded-xl bg-white/5 animate-pulse flex-shrink-0"/>)
                  : categories.map(c => (
                    <Pill key={c} label={c} active={category===c} color="emerald"
                      count={c==='All' ? undefined : dbProducts.filter(p=>p.category===c).length}
                      onClick={() => setCategory(c)}/>
                  ))
                }
              </div>
            </div>

            {/* Row 2 — Subcategory bar */}
            {showSubcategoryBar && !loadingProducts && (
              <div className="flex items-center gap-2 px-6 pb-2.5 overflow-x-auto">
                <div className="flex items-center gap-1 flex-shrink-0 mr-1">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-wider">{category}</span>
                  <ChevronRight size={10} className="text-zinc-700"/>
                </div>
                <Pill label="All" active={subcategory==='All'} color="blue"
                  count={dbProducts.filter(p=>p.category===category).length}
                  onClick={() => setSubcategory('All')}/>
                {subcategories.map(sc => (
                  <Pill key={sc} label={sc} active={subcategory===sc} color="blue"
                    count={subcategoryCounts[sc]||0}
                    onClick={() => setSubcategory(sc)}/>
                ))}
              </div>
            )}

            {/* Row 3 — Brand panel toggle + special filters */}
            {!loadingProducts && (
              <div className="flex items-center gap-2 px-6 pb-3 overflow-x-auto">

                {/* Brand toggle button */}
                {brands.length > 0 && (
                  <button type="button"
                    onClick={() => setShowBrandPanel(s => !s)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold flex-shrink-0 border transition-all
                      ${showBrandPanel
                        ? 'bg-violet-500/20 border-violet-400/40 text-violet-300'
                        : brand !== 'All'
                          ? 'bg-violet-500/15 border-violet-500/25 text-violet-400'
                          : 'bg-white/5 border-white/8 text-zinc-400 hover:text-zinc-200 hover:bg-white/10'
                      }`}>
                    <Star size={11}/>
                    {brand !== 'All' ? brand : 'Brand'}
                    {brand !== 'All' && (
                      <span onClick={(e) => { e.stopPropagation(); setBrand('All'); }}
                        className="ml-0.5 hover:text-white transition-colors">
                        <X size={9}/>
                      </span>
                    )}
                    {brand === 'All' && brands.length > 0 && (
                      <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full">{brands.length}</span>
                    )}
                  </button>
                )}

                {/* Divider */}
                {brands.length > 0 && <div className="w-px h-5 bg-white/8 flex-shrink-0"/>}

                {/* Special offer / discount filters */}
                {SPECIAL_OPTIONS.map(opt => {
                  const count = opt.key==='all'
                    ? filteredProducts.length
                    : specialCounts[opt.key] || 0;
                  if (opt.key !== 'all' && count === 0) return null;
                  return (
                    <Pill key={opt.key}
                      label={
                        <span className="flex items-center gap-1">
                          {opt.icon}
                          {opt.label}
                        </span>
                      }
                      active={specialFilter===opt.key}
                      color={opt.color}
                      count={count}
                      onClick={() => setSpecialFilter(opt.key)}/>
                  );
                })}
              </div>
            )}

            {/* Brand panel — slides open */}
            {showBrandPanel && brands.length > 0 && !loadingProducts && (
              <div className="px-6 pb-3 border-t border-white/[4%] pt-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={11} className="text-violet-400"/>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Filter by Brand</span>
                  <button type="button" onClick={() => setShowBrandPanel(false)} className="ml-auto text-zinc-600 hover:text-zinc-400">
                    <X size={12}/>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Pill label="All Brands" active={brand==='All'} color="violet"
                    count={Object.values(brandCounts).reduce((a,b)=>a+b,0)}
                    onClick={() => { setBrand('All'); setShowBrandPanel(false); }}/>
                  {brands.map(b => (
                    <Pill key={b} label={b} active={brand===b} color="violet"
                      count={brandCounts[b]||0}
                      onClick={() => { setBrand(b); setShowBrandPanel(false); }}/>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Active filter chips bar ───────────────────── */}
          {activeFilterCount > 0 && !loadingProducts && (
            <div className="flex-shrink-0 flex items-center gap-2 px-6 py-2 bg-[#0f0f13] border-b border-white/4 overflow-x-auto">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-wider flex-shrink-0">Filters:</span>

              {category !== 'All' && (
                <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                  {category}
                  <button onClick={() => setCategory('All')} className="hover:text-white"><X size={9}/></button>
                </span>
              )}
              {subcategory !== 'All' && (
                <span className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                  {subcategory}
                  <button onClick={() => setSubcategory('All')} className="hover:text-white"><X size={9}/></button>
                </span>
              )}
              {brand !== 'All' && (
                <span className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                  <Star size={9}/> {brand}
                  <button onClick={() => setBrand('All')} className="hover:text-white"><X size={9}/></button>
                </span>
              )}
              {specialFilter !== 'all' && (
                <span className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                  {SPECIAL_OPTIONS.find(o=>o.key===specialFilter)?.label}
                  <button onClick={() => setSpecialFilter('all')} className="hover:text-white"><X size={9}/></button>
                </span>
              )}
              {search && (
                <span className="flex items-center gap-1.5 bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                  "{search}"
                  <button onClick={() => setSearch('')} className="hover:text-white"><X size={9}/></button>
                </span>
              )}

              <span className="text-[10px] text-zinc-600 font-semibold flex-shrink-0 ml-1">
                {filteredProducts.length} product{filteredProducts.length!==1?'s':''}
              </span>

              <button onClick={clearAll}
                className="ml-auto flex-shrink-0 text-[10px] font-bold text-zinc-600 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10">
                Clear all
              </button>
            </div>
          )}

          {/* ── Product grid ───────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-6 light-scroll">
            {productError ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-600">
                <AlertCircle size={40} strokeWidth={1.2} className="text-red-500/50"/>
                <p className="font-bold text-red-400">{productError}</p>
                <button onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 text-sm font-bold transition-colors">
                  <RefreshCw size={14}/> Retry
                </button>
              </div>
            ) : loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(10)].map((_,i) => (
                  <div key={i} className="animate-pulse bg-[#1a1a1f] h-60 rounded-2xl border border-white/5">
                    <div className="bg-white/5 h-36 rounded-t-2xl w-full"/>
                    <div className="p-3 space-y-2">
                      <div className="bg-white/5 h-3 rounded w-1/2"/>
                      <div className="bg-white/5 h-4 rounded w-3/4"/>
                      <div className="bg-white/5 h-4 rounded w-1/3 mt-3"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-700">
                <Package size={48} strokeWidth={1.2}/>
                <p className="font-bold text-base">No products found</p>
                <p className="text-sm text-center px-8">
                  {brand !== 'All'
                    ? `No "${brand}" products match your filters`
                    : specialFilter !== 'all'
                      ? `No ${SPECIAL_OPTIONS.find(o=>o.key===specialFilter)?.label} products here`
                      : 'Try adjusting your filters'}
                </p>
                <button onClick={clearAll}
                  className="text-[12px] text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-2 transition-colors">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.map(p => (
                  <ProductCard key={p._id} product={p}
                    cartQty={cartMap[p._id]||0}
                    onCardClick={handleCardClick}
                    onUpdateQty={updateQty}/>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Cart sidebar ───────────────────────────── */}
        <div className="w-[320px] flex-shrink-0 flex flex-col bg-[#111114] border-l border-white/5">
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <ShoppingCart size={15} className="text-emerald-500"/>
              </div>
              <span className="font-black text-[15px] text-white tracking-tight">Cart</span>
            </div>
            {totalQty > 0 && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono-num">
                {totalQty} item{totalQty!==1?'s':''}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 light-scroll">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-zinc-700">
                <ShoppingCart size={36} strokeWidth={1.2}/>
                <p className="text-xs font-bold uppercase tracking-widest">Cart is empty</p>
                <p className="text-[11px] text-zinc-600 text-center">Tap a product to add</p>
              </div>
            ) : cart.map(item => (
              <CartRow key={item._id} item={item} onAdd={addToCart} onUpdate={updateQty}/>
            ))}
          </div>

          {gifts.length > 0 && (
            <div className="mx-4 mb-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-3.5">
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Gift size={11}/> Gifts Unlocked
              </p>
              {gifts.map((g,i) => <p key={i} className="text-[12px] font-bold text-white truncate">🎁 {g.name}</p>)}
            </div>
          )}

          <div className="flex-shrink-0 border-t border-white/5 px-5 py-4 bg-[#0d0d0f]">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[12px]">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-bold text-zinc-300 font-mono-num">{fmt(financials.subtotal)}</span>
              </div>
              {financials.discount > 0 && (
                <div className="flex justify-between text-[12px]">
                  <span className="text-emerald-500 flex items-center gap-1"><Tag size={11}/> Savings</span>
                  <span className="font-black text-emerald-400 font-mono-num">−{fmt(financials.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[12px]">
                <span className="text-zinc-500">GST (18%)</span>
                <span className="font-bold text-zinc-300 font-mono-num">{fmt(financials.gst)}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-white/5">
                <span className="text-base font-black text-white">Total</span>
                <span className="text-2xl font-black text-emerald-400 font-mono-num">{fmt(financials.total)}</span>
              </div>
            </div>
            <button type="button" onClick={onGoCheckout} disabled={cart.length===0}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed font-black text-[13px] text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:from-emerald-500 hover:to-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]">
              Proceed to Checkout <ArrowRight size={16}/>
            </button>
          </div>
        </div>
      </div>

      {popupItem && (
        <QtyPopup product={popupItem} onConfirm={handlePopupConfirm} onClose={() => setPopupItem(null)}/>
      )}
    </>
  );
}