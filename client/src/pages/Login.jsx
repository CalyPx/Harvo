import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate(data.user.role === 'farmer' ? '/farmer' : '/vendor');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in-up">
        <Link to="/" className="auth-back">← Back</Link>
        <div className="auth-logo">🌾 KrishiDirect</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub text-muted">Login with your phone number</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="label">Phone Number</label>
            <input className="input" name="phone" type="tel"
              placeholder="98XXXXXXXX" value={form.phone}
              onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" name="password" type="password"
              placeholder="••••••••" value={form.password}
              onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <p className="auth-footer text-muted">
          No account? <Link to="/register" style={{ color: 'var(--green-light)' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
