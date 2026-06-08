import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
    } else {
      navigate('/admin/dashboard');
    }
  }

  return (
    <div className="al-page">
      <motion.div
        className="al-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="al-brand">
          <span className="al-logo">ONE<span className="al-logo-dim">:</span></span>
          <span className="al-brand-sub">Admin</span>
        </div>
        <h1 className="al-title">Welcome Back</h1>
        <p className="al-sub">Sign in to manage your studio.</p>

        <form onSubmit={handleSubmit} className="al-form">
          {error && <div className="al-error">{error}</div>}
          <div className="al-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@one.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className="al-field">
            <label>Password</label>
            <div className="al-pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="al-pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="al-submit" disabled={loading || !email || !password}>
            <LogIn size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
