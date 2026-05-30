import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductDiscovery from '../components/ProductDiscovery';
import CheckoutSummary  from '../components/CheckoutSummary';
import ReceiptOverlay   from '../components/ReceiptOverlay';
import { useAuth }      from '../context/AuthContext';

export default function CashierPOS() {
  const navigate   = useNavigate();
  const { pathname } = useLocation();
  const { user }     = useAuth(); // Connects straight to your global AuthContext state management loop

  const isProducts = pathname === '/cashier/products';
  const isCheckout = pathname === '/cashier/checkout';
  const isReceipt  = pathname === '/cashier/receipt';

  /* ── Live Database Sync States ────────────────────────────── */
  const [dbProducts, setDbProducts]       = useState([]);
  const [loadingProducts, setLoading]     = useState(true);
  const [cart, setCart]                   = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentStatus, setPaymentStatus] = useState('paid');   // 'paid' | 'partial' | 'unpaid'
  const [paidAmount, setPaidAmount]       = useState('');
  
  // Real completed transaction response context data returned straight from MongoDB cluster
  const [completedOrder, setCompletedOrder] = useState(null);

  /* ── Load Dynamic Catalog Vector Metrics from Server ─────────── */
  const fetchInventoryCatalog = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products');
      setDbProducts(response.data || []);
    } catch (err) {
      console.error("Critical error syncing catalog parameters down from DB cluster:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryCatalog();
  }, [pathname]); // Refresh catalog thresholds when navigating across checkout layouts

  /* ── Session Identity Mappings ────────────────────────────── */
  const session = useMemo(() => {
    return {
      cashierName: user?.name || 'Authorized Operator',
      shiftStart: user?.lastLogin 
        ? new Date(user.lastLogin).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      billNumber: completedOrder ? completedOrder._id : "PENDING_CHECKOUT_ID"
    };
  }, [user, completedOrder]);

  /* ── Cart Operations & Real-time Stock Boundaries ─────────── */
  /* ── Update this function inside your CashierPOS.jsx parent file ── */
const addToCart = useCallback((product, specifiedQty = null) => {
  setCart(prev => {
    const existingItem = prev.find(i => i._id === product._id);
    
    // Determine target quantity based on standard card click (+1) or keyboard manual input popup
    const targetQty = specifiedQty !== null ? specifiedQty : (existingItem ? existingItem.qty + 1 : 1);

    // Dynamic database safety boundary check
    if (targetQty > product.stock) {
      alert(`Insufficient stock. Only ${product.stock} ${product.unit || 'units'} left in database records.`);
      return prev;
    }

    if (existingItem) {
      return prev.map(i => i._id === product._id ? { ...i, qty: targetQty } : i);
    }
    return [...prev, { ...product, qty: targetQty }];
  });
}, []);

  const updateQty = useCallback((id, val) => {
    const qty = parseFloat(val);
    if (isNaN(qty) || qty <= 0) { 
      setCart(prev => prev.filter(i => i._id !== id)); 
      return; 
    }
    
    setCart(prev => prev.map(i => {
      if (i._id === id) {
        if (qty > i.stock) {
          alert(`Stock bounds exceeded. Maximum warehouse stock: ${i.stock} ${i.unit || 'units'}.`);
          return i;
        }
        return { ...i, qty };
      }
      return i;
    }));
  }, []);

  const removeItem = useCallback((id) => setCart(prev => prev.filter(i => i._id !== id)), []);

  /* ── Financial Matrix Calculation Engine ──────────────────── */
  const financials = useMemo(() => {
    const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
    const discount = cart.reduce((a, i) => a + (i.originalPrice - i.price) * i.qty, 0);
    const gst      = parseFloat((subtotal * 0.18).toFixed(2)); // Standard 18% matching utils engine calculation rules
    const total    = parseFloat((subtotal + gst - discount).toFixed(2));

    let paid = 0;
    if (paymentStatus === 'paid') paid = total;
    else if (paymentStatus === 'partial') paid = Math.min(parseFloat(paidAmount) || 0, total);

    const changeDue = paid > total ? parseFloat((paid - total).toFixed(2)) : 0;
    const remaining = total > paid ? parseFloat((total - paid).toFixed(2)) : 0;

    return { subtotal, discount, gst, total, paid, changeDue, remaining, paymentStatus };
  }, [cart, paidAmount, paymentStatus]);

  /* ── Free Gifts & Offers Vector Trackers ──────────────────── */
  const gifts = useMemo(() =>
    cart.filter(i => i.gift?.name && i.qty >= i.gift.minQty)
        .map(i => ({ name: i.gift.name, fromProduct: i.name, minQty: i.gift.minQty })),
    [cart]);

  const specialOffers = useMemo(() =>
    cart.filter(i => i.offer)
        .map(i => ({ title: i.offer, product: i.name, saving: (i.originalPrice - i.price) * i.qty })),
    [cart]);

  /* ── Navigation Routing & Order Creation Post Engine ──────── */
  const goProducts = () => navigate('/cashier/products');
  const goCheckout = () => cart.length > 0 && navigate('/cashier/checkout');
  
  // Handles atomic session dispatching to POST /api/orders
  const handleCheckoutCommit = async (completedOrderDataFromChild) => {
    // Saves transaction return metadata safely to sync the parent element state
    setCompletedOrder(completedOrderDataFromChild);
    navigate('/cashier/receipt');
  };

  const resetSession = () => {
    setCart([]); 
    setPaidAmount(''); 
    setPaymentMethod('cash'); 
    setPaymentStatus('paid');
    setCompletedOrder(null);
    navigate('/cashier/products');
  };

  const sharedProperties = {
    cart, 
    financials, 
    gifts, 
    specialOffers,
    paymentMethod, 
    setPaymentMethod,
    paymentStatus, 
    setPaymentStatus,
    paidAmount,    
    setPaidAmount,
    addToCart, 
    updateQty, 
    removeItem,
    session,
    dbProducts,       // Real database collection list passed right through parameters mapping
    loadingProducts,  // Global context loader flag
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#0d0d0f]" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {isProducts && <ProductDiscovery {...sharedProperties} onGoCheckout={goCheckout} />}
      {isCheckout && <CheckoutSummary  {...sharedProperties} onBack={goProducts} onCheckout={handleCheckoutCommit} />}
      {isReceipt  && <ReceiptOverlay   {...sharedProperties} onNewBill={resetSession} />}
    </div>
  );
}