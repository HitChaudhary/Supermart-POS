export const GST_RATE = 0.18;

export const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Bakery'];

export const PRODUCTS = [
  {
    _id: 'p1', name: 'Organic Avocado', price: 180, originalPrice: 200,
    discountPercent: 10, offer: 'BUY 2 GET 1', brand: 'Nature Select',
    category: 'Fruits', subcategory: 'Tropical', stock: 42, unit: 'pc',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=300',
    gift: { name: 'Reusable Bag', minQty: 3 },
  },
  {
    _id: 'p2', name: 'Almond Milk', price: 128, originalPrice: 160,
    discountPercent: 20, offer: '20% OFF', brand: 'Silk Road',
    category: 'Dairy', subcategory: 'Plant-Based', stock: 12, unit: 'btl',
    image: 'https://images.unsplash.com/photo-1550583724-1255814264b3?auto=format&fit=crop&q=80&w=300',
    gift: null,
  },
  {
    _id: 'p3', name: 'Green Kale', price: 42, originalPrice: 56,
    discountPercent: 25, offer: 'FRESH DEAL', brand: 'Farm Fresh',
    category: 'Vegetables', subcategory: 'Leafy Greens', stock: 25, unit: 'kg',
    image: 'https://images.unsplash.com/photo-1524179524541-4416a506729d?auto=format&fit=crop&q=80&w=300',
    gift: null,
  },
  {
    _id: 'p4', name: 'Greek Yogurt', price: 232, originalPrice: 232,
    discountPercent: 0, offer: null, brand: 'Oikos',
    category: 'Dairy', subcategory: 'Yogurt', stock: 18, unit: 'cup',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=300',
    gift: { name: 'Granola Pack', minQty: 2 },
  },
  {
    _id: 'p5', name: 'Sourdough Bread', price: 260, originalPrice: 300,
    discountPercent: 13, offer: 'DAILY FRESH', brand: 'The Bakehouse',
    category: 'Bakery', subcategory: 'Bread', stock: 8, unit: 'loaf',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300',
    gift: null,
  },
  {
    _id: 'p6', name: 'Cherry Tomatoes', price: 120, originalPrice: 140,
    discountPercent: 14, offer: null, brand: 'Farm Fresh',
    category: 'Vegetables', subcategory: 'Tomatoes', stock: 0, unit: 'punnet',
    image: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&q=80&w=300',
    gift: null,
  },
  {
    _id: 'p7', name: 'Alphonso Mango', price: 320, originalPrice: 400,
    discountPercent: 20, offer: 'SEASON SPECIAL', brand: 'Ratnagiri',
    category: 'Fruits', subcategory: 'Tropical', stock: 30, unit: 'kg',
    image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&q=80&w=300',
    gift: { name: 'Mango Pickle Jar', minQty: 2 },
  },
  {
    _id: 'p8', name: 'Whole Wheat Pita', price: 112, originalPrice: 112,
    discountPercent: 0, offer: null, brand: 'The Bakehouse',
    category: 'Bakery', subcategory: 'Flatbread', stock: 20, unit: 'pack',
    image: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?auto=format&fit=crop&q=80&w=300',
    gift: null,
  },
];