import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import Login            from './components/Login';
import AdminLayout      from './components/AdminLayout';
import SuperAdminLayout from './components/SuperAdminLayout';

// Cashier pages
import CashierPOS from './pages/CashierPOS';

// Admin pages
import Dashboard    from './pages/Dashboard';
import Products     from './pages/Products';
import Orders       from './pages/Orders';
import Reports      from './pages/Reports';
import Cashiers     from './pages/Cashiers';
import StockManager from './pages/Stockmanage';

// Super Admin pages
import SuperAdminDashboard    from './pages/SuperAdminDashboard';
import SuperAdminControlPanel from './pages/SuperAdminControlPanel';

// ── Route Guard ───────────────────────────────────────────────
const RouteGuard = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'superadmin') return <Navigate to="/superadmin/control-panel" replace />;
    if (user.role === 'admin')      return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/cashier/products" replace />;
  }

  return <Outlet />;
};

// ── Permission Guard (for admin sub-pages) ────────────────────
const PermGuard = ({ permKey }) => {
  const { user, hasPermission } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!hasPermission(permKey)) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root */}
          <Route path="/"      element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* ── Cashier ── */}
          <Route element={<RouteGuard allowedRoles={['cashier']} />}>
            <Route path="/cashier/products" element={<CashierPOS />} />
            <Route path="/cashier/checkout" element={<CashierPOS />} />
            <Route path="/cashier/receipt"  element={<CashierPOS />} />
          </Route>

          {/* ── Admin ── */}
          <Route element={<RouteGuard allowedRoles={['admin', 'superadmin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders"    element={<Orders />} />
              <Route path="cashiers"  element={<Cashiers />} />

              {/* Permission-gated admin pages */}
              <Route element={<PermGuard permKey="canManageProducts" />}>
                <Route path="products"         element={<Products />} />
                <Route path="stock-management" element={<StockManager />} />
              </Route>

              <Route element={<PermGuard permKey="canViewReports" />}>
                <Route path="reports" element={<Reports />} />
              </Route>
            </Route>
          </Route>

          {/* ── Super Admin ── */}
          <Route element={<RouteGuard allowedRoles={['superadmin']} />}>
            <Route path="/superadmin" element={<SuperAdminLayout />}>
              <Route index                  element={<Navigate to="control-panel" replace />} />
              <Route path="control-panel"   element={<SuperAdminControlPanel />} />
              <Route path="dashboard"       element={<SuperAdminDashboard />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
