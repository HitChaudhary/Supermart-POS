require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes    = require('./routes/authroutes');
const productRoutes = require('./routes/productroutes');
const orderRoutes   = require('./routes/orderroutes');
const cashierRoutes = require('./routes/cashierroutes');
const reportRoutes  = require('./routes/reportroutes');
const uploadRoutes  = require('./routes/uploadroutes');
const userRoutes    = require('./routes/userRoutes');   // super-admin control panel

const app = express();
connectDB();

app.use(cors({
  origin     : process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods    : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/',           (_, res) => res.send('SuperMart API Running...'));
app.get('/api/health', (_, res) => res.status(200).json({ status: 'OK', time: new Date() }));

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/cashiers', cashierRoutes);
app.use('/api/reports',  reportRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/users',    userRoutes);   // ← super-admin tier

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));