require('dotenv').config();
const mongoose  = require('mongoose');
const User      = require('../models/User');
const Product   = require('../models/Product');
const connectDB = require('../config/db');

// ── Expanded FMCG Products factory (24 Items) ───────────────────
const buildProducts = (adminId, storeName) => [
  // ── Category: Snacks & Confectionery ─────────────────────────
  {
    adminId,
    name: 'Classic Potato Chips', brand: 'Lay\'s', category: 'Snacks',
    subcategory: 'Chips', price: 1.50, originalPrice: 1.80,
    offer: 'BUY 2 GET 1', unit: 'pack', stock: 120,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=300',
  },
  {
    adminId,
    name: 'Pure Milk Chocolate Bar', brand: 'Cadbury Dairy Milk', category: 'Snacks',
    subcategory: 'Chocolates', price: 1.20, originalPrice: 1.20,
    unit: 'pc', stock: 150,
    image: 'https://images.unsplash.com/photo-1548907040-4d42b52125ca?auto=format&fit=crop&q=80&w=300',
  },
  {
    adminId,
    name: 'Nacho Cheese Tortilla Chips', brand: 'Doritos', category: 'Snacks',
    subcategory: 'Chips', price: 2.99, originalPrice: 3.50,
    offer: 'WEEKEND SPECIAL', unit: 'pack', stock: 95,
    image: 'https://images.unsplash.com/photo-1518047601542-79f18c655718?auto=format&fit=crop&q=80&w=300',
  },
  {
    adminId,
    name: 'Crunchy Chocolate Chip Cookies', brand: 'Good Day', category: 'Snacks',
    subcategory: 'Biscuits', price: 1.00, originalPrice: 1.25,
    unit: 'pack', stock: 140,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=300',
  },

  // ── Category: Beverages ──────────────────────────────────────
  {
    adminId,
    name: 'Sparkling Cola 1.5L', brand: 'Coca-Cola', category: 'Beverages',
    subcategory: 'Soft Drinks', price: 2.20, originalPrice: 2.50,
    offer: '10% OFF', unit: 'btl', stock: 85,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=300',
  },
  {
    adminId,
    name: 'Orange Fruit Juice 1L', brand: 'Tropicana', category: 'Beverages',
    subcategory: 'Juices', price: 3.10, originalPrice: 3.80,
    unit: 'carton', stock: 50,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=300',
  },
  {
    adminId,
    name: 'Instant Coffee Gold 100g', brand: 'Nescafé', category: 'Beverages',
    subcategory: 'Coffee', price: 6.50, originalPrice: 7.20,
    offer: 'FREE MUG', unit: 'jar', stock: 40,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300',
    gift: { name: 'Ceramic Mug', minQty: 1 },
  },
  {
    adminId,
    name: 'Premium Assam Tea 250g', brand: 'Taj Mahal', category: 'Beverages',
    subcategory: 'Tea', price: 4.20, originalPrice: 4.20,
    unit: 'pack', stock: 65,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=300',
  },

  // ── Category: Personal Care & Hygiene ─────────────────────────
  {
    adminId,
    name: 'Anti-Dandruff Shampoo', brand: 'Head & Shoulders', category: 'Personal Care',
    subcategory: 'Hair Care', price: 5.50, originalPrice: 6.20,
    unit: 'btl', stock: 45,
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=300',
    gift: { name: 'Travel Conditioner', minQty: 1 },
  },
  {
    adminId,
    name: 'Germ Protection Handwash', brand: 'Dettol', category: 'Personal Care',
    subcategory: 'Hygiene', price: 3.00, originalPrice: 3.50,
    unit: 'pump', stock: 0,
    image: 'https://images.unsplash.com/photo-1603183939384-cbca4d41b9d4?auto=format&fit=crop&q=80&w=300',
  },
  {
    adminId,
    name: 'Total Protection Toothpaste', brand: 'Colgate', category: 'Personal Care',
    subcategory: 'Dental Care', price: 2.10, originalPrice: 2.50,
    offer: 'BUY 2 GET 1', unit: 'pack', stock: 110,
    image: 'https://images.unsplash.com/photo-1559591656-e6de7d40924a?auto=format&fit=crop&q=80&w=300',
  },
  {
    adminId,
    name: 'Moisturizing Beauty Bar', brand: 'Dove', category: 'Personal Care',
    subcategory: 'Soaps', price: 1.80, originalPrice: 2.00,
    unit: 'pc', stock: 180,
    image: 'https://images.unsplash.com/photo-1607006342456-ba275cd3475f?auto=format&fit=crop&q=80&w=300',
  },

  // ── Category: Household & Home Care ───────────────────────────
  {
    adminId,
    name: 'Dishwashing Liquid 500ml', brand: 'Vim', category: 'Household Care',
    subcategory: 'Cleaners', price: 1.90, originalPrice: 2.30,
    offer: 'DAILY FRESH', unit: 'btl', stock: 60,
    image: 'https://images.unsplash.com/photo-1607006342456-ba275cd3475f?auto=format&fit=crop&q=80&w=300',
    gift: { name: 'Scrub Sponge', minQty: 2 },
  },
  {
    adminId,
    name: 'Liquid Detergent 1L', brand: 'Surf Excel', category: 'Household Care',
    subcategory: 'Laundry', price: 6.80, originalPrice: 7.50,
    offer: '15% OFF', unit: 'btl', stock: 40,
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=300',
  },
  {
    adminId,
    name: 'Citrus Floor Cleaner 1L', brand: 'Lizol', category: 'Household Care',
    subcategory: 'Cleaners', price: 3.40, originalPrice: 3.99,
    unit: 'btl', stock: 55,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300',
  },
  {
    adminId,
    name: 'Premium Toilet Roll 4-Pack', brand: 'Kleenix', category: 'Household Care',
    subcategory: 'Paper Goods', price: 2.50, originalPrice: 2.50,
    unit: 'pack', stock: 70,
    image: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&q=80&w=300',
  },

  // ── Category: Packaged & Instant Foods ────────────────────────
  {
    adminId,
    name: 'Instant Masala Noodles 4-Pack', brand: 'Maggi', category: 'Packaged Foods',
    subcategory: 'Noodles', price: 2.10, originalPrice: 2.10,
    offer: 'SUPER SAVER', unit: 'pack', stock: 200,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&q=80&w=300',
  },
  {
    adminId,
    name: 'Tomato Ketchup 500g', brand: 'Heinz', category: 'Packaged Foods',
    subcategory: 'Sauces', price: 2.80, originalPrice: 3.20,
    unit: 'btl', stock: 80,
    image: 'https://images.unsplash.com/photo-1607305387299-a3d9611cd46f?auto=format&fit=crop&q=80&w=300',
  },
  {
    adminId,
    name: 'Creamy Peanut Butter 350g', brand: 'Skippy', category: 'Packaged Foods',
    subcategory: 'Spreads', price: 4.50, originalPrice: 5.00,
    unit: 'jar', stock: 35,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=300',
  },
  {
    adminId,
    name: 'Whole Wheat Breakfast Cereal', brand: 'Kellogg\'s', category: 'Packaged Foods',
    subcategory: 'Cereals', price: 3.99, originalPrice: 4.80,
    offer: 'BUY 1 GET 20% OFF 2ND', unit: 'box', stock: 45,
    image: 'https://images.unsplash.com/photo-1521483451569-e338ff310fd4?auto=format&fit=crop&q=80&w=300',
  },

  // ── Category: Staples & Groceries ─────────────────────────────
  {
    adminId,
    name: 'Premium Basmati Rice 5kg', brand: 'India Gate', category: 'Staples',
    subcategory: 'Rice & Grains', price: 12.50, originalPrice: 15.00,
    offer: 'FESTIVE DEAL', unit: 'bag', stock: 35,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300',
  },
  {
    adminId,
    name: 'Refined Sunflower Oil 1L', brand: 'Fortune', category: 'Staples',
    subcategory: 'Edible Oils', price: 3.80, originalPrice: 4.20,
    unit: 'pouch', stock: 90,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=300',
  },

  // ── Category: Dairy & Chilled ─────────────────────────────────
  {
    adminId,
    name: 'Pasteurized Butter 500g', brand: 'Amul', category: 'Dairy',
    subcategory: 'Butter', price: 4.00, originalPrice: 4.00,
    unit: 'pack', stock: 65,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=300',
  },
  {
    adminId,
    name: 'Processed Cheese Slices 200g', brand: 'Kraft', category: 'Dairy',
    subcategory: 'Cheese', price: 2.75, originalPrice: 3.10,
    offer: 'NEW ARRIVAL', unit: 'pack', stock: 50,
    image: 'https://images.unsplash.com/photo-1528750955923-30f7e8a1d4b6?auto=format&fit=crop&q=80&w=300',
  }
];

const seed = async () => {
  await connectDB();

  await User.deleteMany({});
  await Product.deleteMany({});
  console.log('Cleared all existing data from database...\n');

  // ── Super Admin ──────────────────────────────────────────────
  const superAdmin = await User.create({
    name    : 'Super Admin',
    email   : 'superadmin@supermart.com',
    password: 'super123',
    role    : 'superadmin',
    permissions: { canViewReports: true, canChangePrices: true, canLogWastage: true, canManageProducts: true },
  });
  console.log(`✅ SuperAdmin → superadmin@supermart.com / super123`);

  // ── Admin A — "SuperMart Andheri" ────────────────────────────
  const adminA = await User.create({
    name    : 'Arjun Sharma',
    email   : 'admin@supermart.com',
    password: 'admin123',
    role    : 'admin',
    permissions: { canViewReports: true, canChangePrices: true, canLogWastage: true, canManageProducts: true },
  });
  console.log(`✅ Admin A   → admin@supermart.com / admin123  (Business: SuperMart Andheri)`);

  // ── Admin B — "SuperMart Bandra" ─────────────────────────────
  const adminB = await User.create({
    name    : 'Bina Patel',
    email   : 'admin2@supermart.com',
    password: 'admin123',
    role    : 'admin',
    permissions: { canViewReports: true, canChangePrices: true, canLogWastage: true, canManageProducts: true },
  });
  console.log(`✅ Admin B   → admin2@supermart.com / admin123  (Business: SuperMart Bandra)`);

  // ── Cashiers for Admin A ─────────────────────────────────────
  await User.create({
    name    : 'Ravi Patel',
    email   : 'ravi@supermart.com',
    password: 'cashier123',
    role    : 'cashier',
    adminId : adminA._id,
  });
  console.log(`✅ Cashier   → ravi@supermart.com / cashier123  (linked to Admin A)`);

  await User.create({
    name    : 'Priya Shah',
    email   : 'priya@supermart.com',
    password: 'cashier123',
    role    : 'cashier',
    adminId : adminA._id,
  });
  console.log(`✅ Cashier   → priya@supermart.com / cashier123  (linked to Admin A)`);

  // ── Cashiers for Admin B ─────────────────────────────────────
  await User.create({
    name    : 'Meera Joshi',
    email   : 'meera@supermart.com',
    password: 'cashier123',
    role    : 'cashier',
    adminId : adminB._id,
  });
  console.log(`✅ Cashier   → meera@supermart.com / cashier123  (linked to Admin B)`);

  // ── Products for Admin A ─────────────────────────────────────
  const prodsA = buildProducts(adminA._id, 'Andheri');
  await Product.insertMany(prodsA);
  console.log(`\n📦 ${prodsA.length} FMCG products successfully seeded for Admin A (SuperMart Andheri)`);

  // ── Products for Admin B ─────────────────────────────────────
  const prodsB = buildProducts(adminB._id, 'Bandra');
  await Product.insertMany(prodsB);
  console.log(`📦 ${prodsB.length} FMCG products successfully seeded for Admin B (SuperMart Bandra)`);

  console.log(`
╔══════════════════════════════════════════════════════╗
║               SEED COMPLETE — Login Credentials      ║
╠══════════════════════════════════════════════════════╣
║  superadmin@supermart.com  /  super123               ║
║  admin@supermart.com       /  admin123  (Business A) ║
║  admin2@supermart.com      /  admin123  (Business B) ║
║  ravi@supermart.com        /  cashier123 (→ Admin A) ║
║  priya@supermart.com       /  cashier123 (→ Admin A) ║
║  meera@supermart.com       /  cashier123 (→ Admin B) ║
╚══════════════════════════════════════════════════════╝
  `);
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed execution aborted dynamically due to failure:', err);
  process.exit(1);
});