import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../admin.css';

import { API_BASE_URL } from '../config.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ── All logic preserved exactly ───────────────────────────────────────── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Login failed. Invalid credentials.');
      }
      localStorage.setItem('adminToken', data.data.token || 'admin-session-token');
      localStorage.setItem('adminUser', JSON.stringify(data.data.user));
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('admin@rsportscafe.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="admin-root min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="admin-orb admin-orb-lavender" />
      <div className="admin-orb admin-orb-mint" />
      <div className="admin-orb admin-orb-blue" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="glass-modal w-full max-w-md p-8 md:p-10 relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.2">
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
                <path d="M13 13l4 4" />
              </svg>
            </div>
            <span className="font-sans font-bold text-[15px] tracking-[0.08em] text-[#1a1a2e] group-hover:text-violet-700 transition-colors">
              R SPORTS &amp; CAFE
            </span>
          </Link>

          <h1 className="font-sans font-bold text-[28px] tracking-tight text-[#1a1a2e] mb-1">
            Admin Portal
          </h1>
          <p className="text-[12px] font-medium tracking-[0.18em] uppercase text-violet-500">
            Executive Concierge Access
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-xl text-[13px] text-center"
            style={{ background: 'rgba(254,226,226,0.75)', border: '1px solid rgba(252,165,165,0.45)', color: '#991b1b' }}
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-[#6b7280] mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@rsportscafe.com"
              className="glass-input"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-[#6b7280] mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-violet-500 hover:text-violet-700 uppercase tracking-wider transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.015 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="glass-btn-primary w-full justify-center py-3.5 text-[13px] tracking-[0.06em] rounded-xl mt-2"
            style={{ borderRadius: 14 }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Authenticating…
              </span>
            ) : 'Access Dashboard'}
          </motion.button>
        </form>

        {/* Demo fill */}
        <div className="mt-6 pt-5 text-center" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          <button
            onClick={handleDemoFill}
            className="text-[11px] font-medium text-violet-500 hover:text-violet-700 tracking-wide uppercase underline underline-offset-4 transition-colors"
          >
            ✨ Auto-fill Demo Admin Credentials
          </button>
        </div>
      </motion.div>
    </div>
  );
}
