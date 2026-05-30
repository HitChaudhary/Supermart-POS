import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, Edit2, Trash2, X, Check,
  Power, Eye, EyeOff, RefreshCw, AlertTriangle,
} from 'lucide-react';

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const EMPTY = { name: '', email: '', phone: '', password: '' };

// ── Cashier Modal ─────────────────────────────────────────────
const CashierModal = ({ cashier, onSave, onClose, loading }) => {
  const isEdit = !!cashier;
  const [form,     setForm]     = useState(
    isEdit ? { name: cashier.name, email: cashier.email, phone: cashier.phone || '', password: '' } : EMPTY
  );
  const [errors,   setErrors]   = useState({});
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!isEdit && !form.password.trim()) e.password = 'Required for new cashier';
    if (form.password && form.password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    onSave(payload);
  };

  const Field = ({ label, k, type = 'text', placeholder = '', disabled = false }) => (
    <div>
      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">{label}</label>
      {k === 'password' ? (
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            value={form[k]}
            onChange={e => set(k, e.target.value)}
            placeholder={placeholder}
            className={`w-full h-10 pl-3 pr-10 rounded-xl bg-white/5 border text-[13px] text-white outline-none transition-all
              ${errors[k] ? 'border-red-500/60' : 'border-white/8 focus:border-emerald-500/60 focus:bg-white/8'}`}
          />
          <button type="button" onClick={() => setShowPass(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      ) : (
        <input
          type={type}
          value={form[k]}
          onChange={e => set(k, e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-10 px-3 rounded-xl bg-white/5 border text-[13px] text-white outline-none transition-all
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${errors[k] ? 'border-red-500/60' : 'border-white/8 focus:border-emerald-500/60 focus:bg-white/8'}`}
        />
      )}
      {errors[k] && <p className="text-[10px] text-red-400 mt-1">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111115] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-[16px] font-black text-white">{isEdit ? 'Edit Cashier' : 'Add Cashier'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400">
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <Field label="Full Name"  k="name"     placeholder="e.g. Priya Shah"           />
          <Field label="Email"      k="email"    type="email" placeholder="priya@supermart.com" disabled={isEdit} />
          <Field label="Phone"      k="phone"    placeholder="9876543210"                />
          <Field label={isEdit ? 'New Password (leave blank to keep)' : 'Password'} k="password" placeholder="Min 6 characters" />
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-[13px] font-bold">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-black transition-colors disabled:opacity-60">
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <Check size={15} />}
            {isEdit ? 'Save Changes' : 'Add Cashier'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Delete Confirm Modal ──────────────────────────────────────
const DeleteModal = ({ cashier, onConfirm, onClose, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="bg-[#111115] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl">
      <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center mb-4">
        <Trash2 size={20} className="text-red-400" />
      </div>
      <h3 className="text-[16px] font-black text-white mb-1">Delete Cashier?</h3>
      <p className="text-[13px] text-zinc-500 mb-1">
        Remove <span className="text-white font-bold">{cashier.name}</span> permanently?
      </p>
      <p className="text-[11px] text-orange-400/70 mb-5">Note: cashiers with existing orders cannot be deleted.</p>
      <div className="flex gap-3">
        <button onClick={onClose}
          className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-[13px] font-bold">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[13px] font-black flex items-center justify-center gap-2">
          {loading ? <RefreshCw size={13} className="animate-spin" /> : null}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Main ─────────────────────────────────────────────────────
export default function Cashiers() {
  const [cashiers,     setCashiers]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');
  const [modal,        setModal]        = useState(null); // null | 'add' | cashier-object
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCashiers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/cashiers');
      setCashiers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cashiers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCashiers(); }, []);

  // CREATE
  const handleCreate = async (form) => {
    setSaving(true);
    try {
      const { data } = await axios.post('/api/cashiers', form);
      setCashiers(prev => [data, ...prev]);
      setModal(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add cashier');
    } finally {
      setSaving(false);
    }
  };

  // UPDATE
  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      const { data } = await axios.put(`/api/cashiers/${modal._id}`, form);
      setCashiers(prev => prev.map(c => c._id === data._id ? { ...c, ...data } : c));
      setModal(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update cashier');
    } finally {
      setSaving(false);
    }
  };

  // TOGGLE ACTIVE
  const handleToggle = async (cashier) => {
    try {
      const { data } = await axios.patch(`/api/cashiers/${cashier._id}/toggle`);
      setCashiers(prev => prev.map(c => c._id === data._id ? { ...c, isActive: data.isActive } : c));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle cashier');
    }
  };

  // DELETE
  const handleDelete = async () => {
    setSaving(true);
    try {
      await axios.delete(`/api/cashiers/${deleteTarget._id}`);
      setCashiers(prev => prev.filter(c => c._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete cashier with existing orders.');
    } finally {
      setSaving(false);
    }
  };

  const active   = cashiers.filter(c => c.isActive).length;
  const inactive = cashiers.filter(c => !c.isActive).length;

  return (
    <div className="space-y-5">

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Cashiers', value: cashiers.length, color: 'text-white'        },
          { label: 'Active',         value: active,          color: 'text-emerald-400'  },
          { label: 'Inactive',       value: inactive,        color: 'text-zinc-500'     },
        ].map(s => (
          <div key={s.label} className="bg-[#111115] border border-white/5 rounded-xl px-4 py-3">
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <button onClick={fetchCashiers}
          className="h-9 w-9 rounded-xl bg-white/5 border border-white/5 text-zinc-500 hover:text-white flex items-center justify-center">
          <RefreshCw size={13} />
        </button>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-black transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus size={15} /> Add Cashier
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[12px] text-zinc-600">Loading cashiers...</p>
        </div>
      ) : cashiers.length === 0 ? (
        <div className="text-center py-12 text-zinc-600 text-sm">No cashiers found. Add one to get started.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cashiers.map(c => (
            <div key={c._id}
              className={`bg-[#111115] border rounded-2xl p-5 transition-all duration-200
                ${c.isActive ? 'border-white/5 hover:border-emerald-500/20' : 'border-white/5 opacity-60'}`}>

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-[16px]">
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-white leading-tight">{c.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                      <span className={`text-[10px] font-bold ${c.isActive ? 'text-emerald-400' : 'text-zinc-600'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => setModal(c)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-zinc-200 flex items-center justify-center transition-colors">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => handleToggle(c)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
                      ${c.isActive
                        ? 'bg-emerald-500/10 hover:bg-red-500/15 text-emerald-400 hover:text-red-400'
                        : 'bg-white/5 hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400'}`}>
                    <Power size={12} />
                  </button>
                  <button onClick={() => setDeleteTarget(c)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/15 text-zinc-500 hover:text-red-400 flex items-center justify-center transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1 mb-4">
                <p className="text-[11px] text-zinc-500 truncate">{c.email}</p>
                {c.phone && <p className="text-[11px] text-zinc-600">{c.phone}</p>}
                <p className="text-[10px] text-zinc-700">Last login: {fmtDate(c.lastLogin)}</p>
              </div>

              {/* POS Only Badge */}
              <div className="pt-3 border-t border-white/5">
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-lg font-bold">
                  POS Access Only
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {(modal === 'add' || (modal && modal._id)) && (
        <CashierModal
          cashier={modal === 'add' ? null : modal}
          onSave={modal === 'add' ? handleCreate : handleUpdate}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          cashier={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={saving}
        />
      )}
    </div>
  );
}
