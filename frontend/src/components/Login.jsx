  import React, { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { useAuth } from '../context/AuthContext';
  import { Store, Shield } from 'lucide-react';

  export default function Login() {
    const { login }   = useAuth();
    const navigate    = useNavigate();

    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [error,    setError]    = useState('');
    const [loading,  setLoading]  = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        const userData = await login(email, password);

        if (userData.role === 'superadmin') {
          navigate('/superadmin/control-panel');
        } else if (userData.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/cashier/products');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4">
        <div className="w-full max-w-md space-y-8">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <Store size={28} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-black text-white tracking-tight">
                Super<span className="text-emerald-500">Mart</span>
              </h1>
              <p className="text-sm text-zinc-500 mt-1">Sign in to access your panel</p>
            </div>
          </div>

          {/* Card */}
          <div className="bg-[#111115] border border-white/5 rounded-2xl p-8 shadow-2xl">

            {error && (
              <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full h-11 rounded-xl border border-white/8 bg-white/5 px-4 text-white text-sm placeholder-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:bg-white/8 transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full h-11 rounded-xl border border-white/8 bg-white/5 px-4 text-white text-sm placeholder-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:bg-white/8 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Role hints */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { role: 'Super Admin', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
              { role: 'Admin',       color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { role: 'Cashier',     color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
            ].map(({ role, color, bg }) => (
              <div key={role} className={`rounded-xl border px-2 py-2 ${bg}`}>
                <p className={`text-[11px] font-black ${color}`}>{role}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }
