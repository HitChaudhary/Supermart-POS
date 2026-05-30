// ── Products ─────────────────────────────────────────────────
export const PRODUCTS = [
  { _id:'p1', name:'Organic Avocado',   brand:'Nature Select', category:'Fruits',     price:4.50,  originalPrice:5.00,  discountPercent:10, offer:'BUY 2 GET 1',     unit:'pc',     stock:42, image:'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&q=80', gift:{ name:'Reusable Bag',     minQty:3 } },
  { _id:'p2', name:'Almond Milk',        brand:'Silk Road',     category:'Dairy',      price:3.20,  originalPrice:4.00,  discountPercent:20, offer:'20% OFF',          unit:'btl',    stock:12, image:'https://images.unsplash.com/photo-1550583724-1255814264b3?w=200&q=80', gift:null },
  { _id:'p3', name:'Green Kale',         brand:'Farm Fresh',    category:'Vegetables', price:2.10,  originalPrice:2.80,  discountPercent:25, offer:'FRESH DEAL',       unit:'kg',     stock:25, image:'https://images.unsplash.com/photo-1524179524541-4416a506729d?w=200&q=80', gift:null },
  { _id:'p4', name:'Greek Yogurt',       brand:'Oikos',         category:'Dairy',      price:5.80,  originalPrice:5.80,  discountPercent:0,  offer:null,               unit:'cup',    stock:18, image:'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&q=80', gift:{ name:'Granola Pack',      minQty:2 } },
  { _id:'p5', name:'Sourdough Bread',    brand:'The Bakehouse', category:'Bakery',     price:6.50,  originalPrice:7.50,  discountPercent:13, offer:'DAILY FRESH',      unit:'loaf',   stock:8,  image:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80', gift:null },
  { _id:'p6', name:'Cherry Tomatoes',    brand:'Farm Fresh',    category:'Vegetables', price:3.00,  originalPrice:3.50,  discountPercent:14, offer:null,               unit:'punnet', stock:0,  image:'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=200&q=80', gift:null },
  { _id:'p7', name:'Alphonso Mango',     brand:'Ratnagiri',     category:'Fruits',     price:8.00,  originalPrice:10.00, discountPercent:20, offer:'SEASON SPECIAL',   unit:'kg',     stock:30, image:'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=200&q=80', gift:{ name:'Mango Pickle Jar', minQty:2 } },
  { _id:'p8', name:'Whole Wheat Pita',   brand:'The Bakehouse', category:'Bakery',     price:2.80,  originalPrice:2.80,  discountPercent:0,  offer:null,               unit:'pack',   stock:20, image:'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=200&q=80', gift:null },
  { _id:'p9', name:'Blueberries',        brand:'Berry Best',    category:'Fruits',     price:5.50,  originalPrice:6.00,  discountPercent:8,  offer:null,               unit:'punnet', stock:4,  image:'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=200&q=80', gift:null },
  { _id:'p10',name:'Cheddar Cheese',     brand:'Amul',          category:'Dairy',      price:7.20,  originalPrice:8.00,  discountPercent:10, offer:'10% OFF',          unit:'block',  stock:0,  image:'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=200&q=80', gift:null },
];

export const CATEGORIES = ['All','Vegetables','Fruits','Dairy','Bakery'];

// ── Orders ───────────────────────────────────────────────────
export const ORDERS = [
  { _id:'o1',  billNumber:'SM-481922', cashier:'Ravi Patel',  items:[{name:'Organic Avocado',qty:2,lineTotal:9.00},{name:'Almond Milk',qty:1,lineTotal:3.20}], subtotal:12.20, discount:1.30, gst:2.20,  total:14.40, paymentMethod:'cash',  paymentStatus:'paid',    paidAmount:14.40, balanceDue:0,     createdAt:'2025-05-17T09:15:00Z' },
  { _id:'o2',  billNumber:'SM-482011', cashier:'Ravi Patel',  items:[{name:'Greek Yogurt',qty:3,lineTotal:17.40},{name:'Sourdough Bread',qty:1,lineTotal:6.50}], subtotal:23.90, discount:0,    gst:4.30,  total:28.20, paymentMethod:'upi',   paymentStatus:'paid',    paidAmount:28.20, balanceDue:0,     createdAt:'2025-05-17T10:32:00Z' },
  { _id:'o3',  billNumber:'SM-482108', cashier:'Priya Shah',  items:[{name:'Green Kale',qty:2,lineTotal:4.20},{name:'Cherry Tomatoes',qty:1,lineTotal:3.00}], subtotal:7.20, discount:1.40,  gst:1.30,  total:8.50,  paymentMethod:'cash',  paymentStatus:'partial', paidAmount:5.00,  balanceDue:3.50,  createdAt:'2025-05-17T11:08:00Z' },
  { _id:'o4',  billNumber:'SM-482215', cashier:'Priya Shah',  items:[{name:'Alphonso Mango',qty:2,lineTotal:16.00}], subtotal:16.00, discount:4.00, gst:2.88,  total:18.88, paymentMethod:'card',  paymentStatus:'paid',    paidAmount:18.88, balanceDue:0,     createdAt:'2025-05-17T13:44:00Z' },
  { _id:'o5',  billNumber:'SM-482310', cashier:'Amit Verma',  items:[{name:'Whole Wheat Pita',qty:3,lineTotal:8.40},{name:'Cheddar Cheese',qty:1,lineTotal:7.20}], subtotal:15.60, discount:0.80, gst:2.81, total:18.41, paymentMethod:'upi',   paymentStatus:'unpaid',  paidAmount:0,     balanceDue:18.41, createdAt:'2025-05-16T16:20:00Z' },
  { _id:'o6',  billNumber:'SM-482401', cashier:'Ravi Patel',  items:[{name:'Blueberries',qty:2,lineTotal:11.00}], subtotal:11.00, discount:1.00, gst:1.98, total:12.98,  paymentMethod:'cash',  paymentStatus:'paid',    paidAmount:12.98, balanceDue:0,     createdAt:'2025-05-16T09:05:00Z' },
  { _id:'o7',  billNumber:'SM-482508', cashier:'Amit Verma',  items:[{name:'Sourdough Bread',qty:2,lineTotal:13.00},{name:'Almond Milk',qty:2,lineTotal:6.40}], subtotal:19.40, discount:2.00, gst:3.49, total:22.89, paymentMethod:'card',  paymentStatus:'partial', paidAmount:10.00, balanceDue:12.89, createdAt:'2025-05-15T14:55:00Z' },
  { _id:'o8',  billNumber:'SM-482601', cashier:'Priya Shah',  items:[{name:'Organic Avocado',qty:5,lineTotal:22.50}], subtotal:22.50, discount:2.50, gst:4.05, total:26.55, paymentMethod:'upi',   paymentStatus:'paid',    paidAmount:26.55, balanceDue:0,     createdAt:'2025-05-14T11:30:00Z' },
  { _id:'o9',  billNumber:'SM-482700', cashier:'Ravi Patel',  items:[{name:'Greek Yogurt',qty:1,lineTotal:5.80},{name:'Blueberries',qty:1,lineTotal:5.50}], subtotal:11.30, discount:0.50, gst:2.03, total:13.33, paymentMethod:'cash',  paymentStatus:'unpaid',  paidAmount:0,     balanceDue:13.33, createdAt:'2025-05-13T08:45:00Z' },
  { _id:'o10', billNumber:'SM-482810', cashier:'Amit Verma',  items:[{name:'Alphonso Mango',qty:3,lineTotal:24.00},{name:'Green Kale',qty:2,lineTotal:4.20}], subtotal:28.20, discount:7.40, gst:5.08, total:33.28, paymentMethod:'cash',  paymentStatus:'paid',    paidAmount:33.28, balanceDue:0,     createdAt:'2025-05-12T15:20:00Z' },
];

// ── Cashiers ─────────────────────────────────────────────────
export const CASHIERS = [
  { _id:'c1', name:'Ravi Patel',  email:'ravi@supermart.com',  phone:'9876543210', isActive:true,  lastLogin:'2025-05-17T09:00:00Z', totalBills:42, totalRevenue:1240.50 },
  { _id:'c2', name:'Priya Shah',  email:'priya@supermart.com', phone:'9988776655', isActive:true,  lastLogin:'2025-05-17T10:15:00Z', totalBills:38, totalRevenue:1102.80 },
  { _id:'c3', name:'Amit Verma',  email:'amit@supermart.com',  phone:'9123456789', isActive:false, lastLogin:'2025-05-15T18:30:00Z', totalBills:19, totalRevenue:540.20  },
  { _id:'c4', name:'Neha Singh',  email:'neha@supermart.com',  phone:'8877665544', isActive:true,  lastLogin:'2025-05-16T14:00:00Z', totalBills:27, totalRevenue:820.00  },
];

// ── Report data ───────────────────────────────────────────────
export const DAILY_REVENUE = [
  { day:'Mon', revenue:320, bills:14 }, { day:'Tue', revenue:480, bills:21 },
  { day:'Wed', revenue:390, bills:17 }, { day:'Thu', revenue:560, bills:24 },
  { day:'Fri', revenue:720, bills:31 }, { day:'Sat', revenue:890, bills:38 },
  { day:'Sun', revenue:640, bills:27 },
];

export const MONTHLY_REVENUE = [
  { month:'Jan', revenue:8200 }, { month:'Feb', revenue:7100 },
  { month:'Mar', revenue:9400 }, { month:'Apr', revenue:8800 },
  { month:'May', revenue:11200 },{ month:'Jun', revenue:10500 },
  { month:'Jul', revenue:12000 },{ month:'Aug', revenue:11400 },
  { month:'Sep', revenue:9800 }, { month:'Oct', revenue:10200 },
  { month:'Nov', revenue:13500 },{ month:'Dec', revenue:15200 },
];

export const TOP_PRODUCTS = [
  { name:'Organic Avocado',  sold:142, revenue:639 },
  { name:'Greek Yogurt',     sold:118, revenue:684 },
  { name:'Alphonso Mango',   sold:96,  revenue:768 },
  { name:'Sourdough Bread',  sold:88,  revenue:572 },
  { name:'Almond Milk',      sold:74,  revenue:237 },
  { name:'Green Kale',       sold:61,  revenue:128 },
  { name:'Blueberries',      sold:55,  revenue:302 },
  { name:'Whole Wheat Pita', sold:43,  revenue:120 },
];

export const ADMIN_PASSWORD = 'admin123';