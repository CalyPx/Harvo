import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const DISTRICTS = [
  'Kathmandu','Lalitpur','Bhaktapur','Dhading','Nuwakot','Sindhupalchok',
  'Kavrepalanchok','Makwanpur','Chitwan','Pokhara','Kaski','Syangja',
  'Tanahu','Gorkha','Lamjung','Dhankuta','Morang','Sunsari','Jhapa',
  'Ilam','Kanchanpur','Kailali','Dang','Rupandehi','Palpa','Gulmi','Arghakhanchi'
];

export default function Register() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState(params.get('role') || '');
  const [form, setForm] = useState({ name: '', phone: '', password: '', district: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!role) return setError('Please select your role');
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/register', { ...form, role });
      login(data.user, data.token);
      navigate(role === 'farmer' ? '/farmer' : '/vendor');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in-up">
        <Link to="/" className="auth-back">← Back</Link>
        <div className="auth-logo">🌾 KrishiDirect</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub text-muted">Join thousands of farmers and vendors</p>

        {/* ROLE SELECTOR */}
        {!params.get('role') && (
          <div className="role-selector">
            <div className={`role-card ${role === 'farmer' ? 'active' : ''}`}
              onClick={() => setRole('farmer')}>
              <span className="role-icon">🧑‍🌾</span>
              <span className="role-label">Farmer</span>
              <span className="role-sub text-muted">Sell my produce</span>
            </div>
            <div className={`role-card ${role === 'vendor' ? 'active' : ''}`}
              onClick={() => setRole('vendor')}>
              <span className="role-icon">🏪</span>
              <span className="role-label">Vendor</span>
              <span className="role-sub text-muted">Buy fresh produce</span>
            </div>
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="label">Full Name</label>
            <input className="input" name="name" placeholder="Ram Bahadur Shrestha"
              value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="label">Phone Number</label>
            <input className="input" name="phone" type="tel"
              placeholder="98XXXXXXXX" value={form.phone}
              onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="label">District</label>
            <select className="input" name="district" value={form.district} onChange={handleChange} required>
              <option value="">Select your district</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" name="password" type="password"
              placeholder="Min 6 characters" value={form.password}
              onChange={handleChange} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : `Register as ${role || '...'}  →`}
          </button>
        </form>

        <p className="auth-footer text-muted">
          Already have an account? <Link to="/login" style={{ color: 'var(--green-light)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
