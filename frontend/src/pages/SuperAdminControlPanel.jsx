import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, Plus, Edit2, Trash2, X, Check,
  Power, Eye, EyeOff, Search, Shield,
  ToggleLeft, ToggleRight, Crown, RefreshCw,
  AlertTriangle, ChevronDown, Building2,
} from 'lucide-react';

const PERM_LABELS = {
  canViewReports   : 'View Reports',
  canChangePrices  : 'Change Prices',
  canLogWastage    : 'Log Wastage',
  canManageProducts: 'Manage Products',
};

const RoleBadge = ({ role }) => {
  const cfg = {
    superadmin: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
    admin      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    cashier    : 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  }[role] || 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg}`}>
      {role}
    </span>
  );
};

// ── Create / Edit User Modal ──────────────────────────────────
const UserModal = ({ user: editUser, admins, onSave, onClose, loading }) => {
  const isEdit = !!editUser;
  const [form, setForm] = useState(
    isEdit ? {
      name           : editUser.name,
      email          : editUser.email,
      phone          : editUser.phone || '',
      password       : '',
      role           : editUser.role,
      isActive       : editUser.isActive,
      assignToAdminId: editUser.adminId || '',
      permissions    : { ...editUser.permissions },
    } : {
      name           : '',
      email          : '',
      phone          : '',
      password       : '',
      role           : 'admin',
      isActive       : true,
      assignToAdminId: '',
      permissions    : { canViewReports: true, canChangePrices: true, canLogWastage: true, canManageProducts: true },
    }
  );
  const [errors,   setErrors]   = useState({});
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => {
    setErrors(e => ({ ...e, [k]: '' }));
    if (k === 'role') {
      setForm(f => ({
        ...f, role: v,
        permissions: v === 'cashier'
          ? { canViewReports: false, canChangePrices: false, canLogWastage: true, canManageProducts: false }
          : { canViewReports: true,  canChangePrices: true,  canLogWastage: true, canManageProducts: true  },
      }));
    } else {
      setForm(f => ({ ...f, [k]: v }));
    }
  };

  const togglePerm = (key) => {
    if (form.role === 'cashier') return;
    setForm(f => ({ ...f, permissions: { ...f.permissions, [key]: !f.permissions[key] } }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!isEdit && !form.password.trim()) e.password = 'Required';
    if (form.password && form.password.length < 6) e.password = 'Min 6 characters';
    if (!isEdit && form.role === 'cashier' && !form.assignToAdminId) e.assignToAdminId = 'Select an admin business';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    onSave(payload);
  };

  const isCashier = form.role === 'cashier';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#111115] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#111115] z-10">
          <h2 className="text-[16px] font-black text-white flex items-center gap-2">
            <Shield size={16} className="text-purple-400" />
            {isEdit ? 'Edit User' : 'Create New User'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Name + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Raj Mehta"
                className={`w-full h-10 px-3 rounded-xl bg-white/5 border text-[13px] text-white outline-none transition-all
                  ${errors.name ? 'border-red-500/60' : 'border-white/8 focus:border-purple-500/60 focus:bg-white/8'}`} />
              {errors.name && <p className="text-[10px] text-red-400 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210"
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/8 focus:border-purple-500/60 text-[13px] text-white outline-none transition-all focus:bg-white/8" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Email Address</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="user@supermart.com" disabled={isEdit}
              className={`w-full h-10 px-3 rounded-xl bg-white/5 border text-[13px] text-white outline-none transition-all
                ${isEdit ? 'opacity-50 cursor-not-allowed' : ''}
                ${errors.email ? 'border-red-500/60' : 'border-white/8 focus:border-purple-500/60 focus:bg-white/8'}`} />
            {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              {isEdit ? 'New Password (leave blank to keep)' : 'Password'}
            </label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => set('password', e.target.value)} placeholder="Min 6 characters"
                className={`w-full h-10 pl-3 pr-10 rounded-xl bg-white/5 border text-[13px] text-white outline-none transition-all
                  ${errors.password ? 'border-red-500/60' : 'border-white/8 focus:border-purple-500/60 focus:bg-white/8'}`} />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-red-400 mt-1">{errors.password}</p>}
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Role</label>
              <div className="relative">
                <select value={form.role} onChange={e => set('role', e.target.value)}
                  disabled={isEdit}
                  className={`w-full h-10 pl-3 pr-8 rounded-xl bg-white/5 border border-white/8 focus:border-purple-500/60 text-[13px] text-white outline-none appearance-none ${isEdit ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <option value="admin"   className="bg-[#111115]">Admin (New Business)</option>
                  <option value="cashier" className="bg-[#111115]">Cashier</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Status</label>
              <button type="button" onClick={() => set('isActive', !form.isActive)}
                className={`w-full h-10 px-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 transition-all
                  ${form.isActive ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-red-500/10 border-red-500/25 text-red-400'}`}>
                {form.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                {form.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>

          {/* Assign to Admin — only for cashier creation */}
          {!isEdit && isCashier && (
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 size={11} /> Assign to Admin Business
              </label>
              <div className="relative">
                <select value={form.assignToAdminId} onChange={e => set('assignToAdminId', e.target.value)}
                  className={`w-full h-10 pl-3 pr-8 rounded-xl bg-white/5 border text-[13px] text-white outline-none appearance-none
                    ${errors.assignToAdminId ? 'border-red-500/60' : 'border-white/8 focus:border-purple-500/60'}`}>
                  <option value="" className="bg-[#111115]">— Select admin —</option>
                  {admins.map(a => (
                    <option key={a._id} value={a._id} className="bg-[#111115]">{a.name} ({a.email})</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
              {errors.assignToAdminId && <p className="text-[10px] text-red-400 mt-1">{errors.assignToAdminId}</p>}
              <p className="text-[10px] text-zinc-600 mt-1.5">
                This cashier will only see products, orders and data from the selected admin's business.
              </p>
            </div>
          )}

          {/* Permissions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Permissions</label>
              {isCashier && (
                <span className="text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full font-bold">
                  Cashier has no admin permissions
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PERM_LABELS).map(([key, label]) => {
                const active = form.permissions?.[key];
                return (
                  <button key={key} type="button" onClick={() => togglePerm(key)} disabled={isCashier}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[12px] font-semibold text-left transition-all
                      ${isCashier ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      ${active ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-white/3 border-white/8 text-zinc-500 hover:border-white/15'}`}>
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0
                      ${active ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'}`}>
                      {active && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-[13px] font-bold">Cancel</button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-black transition-colors disabled:opacity-60">
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            {isEdit ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Delete Confirm ────────────────────────────────────────────
const DeleteModal = ({ user, onConfirm, onClose, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
    <div className="bg-[#111115] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl">
      <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center mb-4">
        <Trash2 size={20} className="text-red-400" />
      </div>
      <h3 className="text-[16px] font-black text-white mb-1">Delete User?</h3>
      <p className="text-[13px] text-zinc-500 mb-5">
        Permanently remove <span className="text-white font-bold">{user.name}</span>? This cannot be undone.
      </p>
      {user.role === 'admin' && (
        <p className="text-[11px] text-orange-400 bg-orange-500/10 border border-orange-500/15 rounded-xl px-3 py-2 mb-4">
          ⚠️ Deleting an admin will orphan their products and orders.
        </p>
      )}
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-[13px] font-bold">Cancel</button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[13px] font-black flex items-center justify-center gap-2">
          {loading ? <RefreshCw size={13} className="animate-spin" /> : null} Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────
export default function SuperAdminControlPanel() {
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('all');
  const [modal,        setModal]        = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchUsers = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await axios.get('/api/users/control-panel');
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const admins = users.filter(u => u.role === 'admin');

  // Find admin name for a cashier
  const getAdminName = (adminId) => {
    if (!adminId) return null;
    return admins.find(a => a._id === adminId?.toString?.() || a._id === adminId)?.name || 'Unknown Admin';
  };

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      const { data } = await axios.post('/api/users/create', form);
      setUsers(prev => [data, ...prev]);
      setModal(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      const { data } = await axios.patch('/api/users/modify-access', {
        userId     : modal._id,
        role       : form.role,
        isActive   : form.isActive,
        permissions: form.permissions,
      });
      setUsers(prev => prev.map(u => u._id === data._id ? { ...u, ...data } : u));
      setModal(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const { data } = await axios.patch('/api/users/modify-access', { userId: user._id, isActive: !user.isActive });
      setUsers(prev => prev.map(u => u._id === data._id ? { ...u, ...data } : u));
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await axios.delete(`/api/users/${deleteTarget._id}`);
      setUsers(prev => prev.filter(u => u._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    total     : users.length,
    superadmin: users.filter(u => u.role === 'superadmin').length,
    admin     : users.filter(u => u.role === 'admin').length,
    cashier   : users.filter(u => u.role === 'cashier').length,
    active    : users.filter(u => u.isActive).length,
  };

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Users',  value: counts.total,      color: 'text-white'       },
          { label: 'Super Admins', value: counts.superadmin, color: 'text-purple-400'  },
          { label: 'Admins',       value: counts.admin,      color: 'text-emerald-400' },
          { label: 'Cashiers',     value: counts.cashier,    color: 'text-blue-400'    },
          { label: 'Active',       value: counts.active,     color: 'text-zinc-300'    },
        ].map(s => (
          <div key={s.label} className="bg-[#111115] border border-white/5 rounded-xl px-4 py-3">
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-600">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Multi-business notice */}
      <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3 flex items-start gap-3">
        <Building2 size={15} className="text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[12px] font-bold text-blue-300">Multi-Business Data Isolation</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Each Admin manages their own independent business. Products, orders, stock, reports and cashiers are 100% isolated between admins. Cashiers are linked to one admin and can only see that admin's data.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..."
              className="w-52 h-9 pl-8 pr-3 rounded-xl bg-white/5 border border-white/8 text-[13px] text-white placeholder-zinc-600 outline-none focus:border-purple-500/50" />
          </div>
          {['all', 'superadmin', 'admin', 'cashier'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`h-9 px-3 rounded-xl text-[12px] font-bold transition-all capitalize
                ${roleFilter === r
                  ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                  : 'bg-white/5 border border-white/5 text-zinc-500 hover:text-zinc-300'}`}>
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
          <button onClick={fetchUsers} className="h-9 w-9 rounded-xl bg-white/5 border border-white/5 text-zinc-500 hover:text-white flex items-center justify-center">
            <RefreshCw size={13} />
          </button>
        </div>
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-black transition-all shadow-lg shadow-purple-500/20">
          <Plus size={15} /> Create User
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-[#111115] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
          <Users size={15} className="text-purple-400" />
          <h3 className="font-black text-[14px] text-white">All System Users</h3>
          <span className="ml-auto text-[11px] text-zinc-600">{filtered.length} of {users.length}</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[12px] text-zinc-600">Loading users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['User', 'Role', 'Business', 'Permissions', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-black text-zinc-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[3%]">
                {filtered.map(u => (
                  <tr key={u._id} className={`hover:bg-white/[1.5%] transition-colors ${!u.isActive ? 'opacity-50' : ''}`}>

                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[13px]
                          ${u.role === 'superadmin' ? 'bg-purple-500/20 text-purple-400' :
                            u.role === 'admin' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {u.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-white flex items-center gap-1.5">
                            {u.name}
                            {u.role === 'superadmin' && <Crown size={11} className="text-purple-400" />}
                          </p>
                          <p className="text-[11px] text-zinc-600">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>

                    {/* Business column */}
                    <td className="px-5 py-3.5">
                      {u.role === 'superadmin' ? (
                        <span className="text-[11px] text-purple-400 font-bold">All Businesses</span>
                      ) : u.role === 'admin' ? (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <Building2 size={11} /> Own Business
                        </span>
                      ) : u.adminId ? (
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <Building2 size={11} /> {getAdminName(u.adminId)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-red-400 font-bold">⚠ Unlinked</span>
                      )}
                    </td>

                    {/* Permissions */}
                    <td className="px-5 py-3.5">
                      {u.role === 'cashier' ? (
                        <span className="text-[11px] text-zinc-700 italic">POS only</span>
                      ) : u.role === 'superadmin' ? (
                        <span className="text-[11px] text-purple-400 font-bold">Full Access</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(PERM_LABELS).map(([key, label]) =>
                            u.permissions?.[key] ? (
                              <span key={key} className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md font-semibold">{label}</span>
                            ) : null
                          )}
                          {!Object.values(u.permissions || {}).some(Boolean) && (
                            <span className="text-[11px] text-zinc-700 italic">No permissions</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border
                        ${u.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      {u.role === 'superadmin' ? (
                        <span className="text-[10px] text-zinc-700 italic">Protected</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setModal(u)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-purple-500/20 text-zinc-500 hover:text-purple-400 flex items-center justify-center transition-colors">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleToggleActive(u)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
                              ${u.isActive
                                ? 'bg-emerald-500/10 hover:bg-red-500/15 text-emerald-400 hover:text-red-400'
                                : 'bg-white/5 hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400'}`}>
                            <Power size={12} />
                          </button>
                          <button onClick={() => setDeleteTarget(u)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/15 text-zinc-500 hover:text-red-400 flex items-center justify-center transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {(modal === 'create' || (modal && modal._id)) && (
        <UserModal
          user={modal === 'create' ? null : modal}
          admins={admins}
          onSave={modal === 'create' ? handleCreate : handleEdit}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}
      {deleteTarget && (
        <DeleteModal user={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} loading={saving} />
      )}
    </div>
  );
}
