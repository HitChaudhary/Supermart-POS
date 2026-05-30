import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Leaf, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductSearch = ({ onAdd }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);

  // Mock Data - In a real app, this would come from an API
  const mockProducts = [
    { _id: '1', name: 'Organic Avocado', price: 4.50, brand: 'Nature Select', image: null },
    { _id: '2', name: 'Almond Milk', price: 3.20, brand: 'Silk Road', image: null },
    { _id: '3', name: 'Green Kale', price: 2.10, brand: 'Farm Fresh', image: null },
    { _id: '4', name: 'Greek Yogurt', price: 5.80, brand: 'Oikos', image: null },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    if (e.target.value.length > 0) {
      setIsOpen(true);
      // Simulate loading state
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 300);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectItem = (product) => {
    onAdd(product);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      {/* SEARCH INPUT FIELD */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 transition-transform group-focus-within:scale-110">
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Search size={20} strokeWidth={2.5} />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Scan or type product name..."
          className="w-full h-14 pl-12 pr-4 bg-white border-2 border-emerald-50 rounded-2xl outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium focus:border-emerald-500 focus:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
           <kbd className="hidden sm:inline-block px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-black text-slate-400">⌘ F</kbd>
        </div>
      </div>

      {/* DROPDOWN RESULTS */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-0 w-full mt-2 bg-white border border-emerald-100 rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2 max-h-[350px] overflow-y-auto custom-scrollbar">
              {mockProducts.length > 0 ? (
                mockProducts.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleSelectItem(product)}
                    className="w-full flex items-center justify-between p-3 hover:bg-emerald-50 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                        <Leaf size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 leading-tight">
                          {product.name}
                        </h4>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                          {product.brand}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-slate-900">${product.price.toFixed(2)}</span>
                      <div className="p-2 bg-white border border-emerald-100 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Plus size={14} strokeWidth={3} />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No products found</p>
                </div>
              )}
            </div>
            
            {/* Action Footer for Search */}
            <div className="bg-slate-50 p-3 border-t border-emerald-50 flex justify-between items-center">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inventory v2.0</span>
               <button className="text-[10px] font-black text-emerald-600 uppercase hover:underline">Add New Item +</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSearch;