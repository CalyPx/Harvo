import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';
import './Landing.css';

const CROPS = ['🍅','🥦','🥕','🌽','🍠','🥔','🍋','🍊','🥭','🧅','🧄','🫑'];

const STATS = [
  { value: '30–40%', label: 'produce lost to middlemen & post-harvest waste', color: 'var(--orange)' },
  { value: 'Rs 20', label: 'farmer earns per kg of tomato', color: 'var(--danger)' },
  { value: 'Rs 140', label: 'consumer pays for same tomato in Kathmandu', color: 'var(--text-muted)' },
  { value: '7', label: 'layers of middlemen between farm and plate', color: 'var(--orange-dark)' },
];

export default function Landing() {
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    api.get('/impact').then(r => setImpact(r.data)).catch(() => {});
  }, []);

  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <span className="navbar-logo">🌾 KrishiDirect</span>
          <div className="navbar-links">
            <Link to="/impact">Impact</Link>
            <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-crops" aria-hidden="true">
          {CROPS.map((c, i) => (
            <span key={i} className="floating-crop" style={{ '--delay': `${i * 0.4}s`, '--x': `${(i * 8.3) % 100}%` }}>{c}</span>
          ))}
        </div>
        <div className="container hero-content fade-in-up">
          <div className="hero-badge">🇳🇵 Made for Nepal</div>
          <h1 className="hero-title">
            किसानबाट सिधै<br />
            <span className="highlight">Farm to Vendor. Direct.</span>
          </h1>
          <p className="hero-sub">
            A farmer in Dhading earns <strong>Rs 20/kg</strong> while Kathmandu pays <strong>Rs 140/kg</strong>.
            Five middlemen take the rest. KrishiDirect cuts them all out.
          </p>
          <div className="hero-cta">
            <Link to="/register?role=farmer" className="btn btn-primary btn-lg">🌾 I'm a Farmer</Link>
            <Link to="/register?role=vendor" className="btn btn-orange btn-lg">🏪 I'm a Vendor</Link>
          </div>
          <p className="hero-note">Free to join · No commission · Phone number login</p>
        </div>
      </section>

      {/* PROBLEM STATS */}
      <section className="section">
        <div className="container">
          <h2 className="section-title text-center">The Problem We're Solving</h2>
          <p className="section-sub text-center text-muted">Real data. Real Nepal. Real injustice.</p>
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div className="stat-card card" key={i} style={{ '--i': i }}>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section section-dark">
        <div className="container">
          <h2 className="section-title text-center">How It Works</h2>
          <div className="how-grid">
            <div className="how-step">
              <div className="how-icon">🧑‍🌾</div>
              <div className="how-num">01</div>
              <h3>Farmer Lists Produce</h3>
              <p className="text-muted">Tap a crop photo, set quantity with +/− buttons. Nepali voice confirms your listing before submitting.</p>
            </div>
            <div className="how-arrow">→</div>
            <div className="how-step">
              <div className="how-icon">📲</div>
              <div className="how-num">02</div>
              <h3>Vendor Gets Notified</h3>
              <p className="text-muted">Vendors in Kathmandu see fresh listings on a live map. Filter by crop, district, price.</p>
            </div>
            <div className="how-arrow">→</div>
            <div className="how-step">
              <div className="how-icon">🤝</div>
              <div className="how-num">03</div>
              <h3>Direct Deal. No Middleman.</h3>
              <p className="text-muted">Vendor places order. Farmer confirms. Both get each other's number. Farmer earns 2× more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT COUNTERS */}
      <section className="section">
        <div className="container">
          <h2 className="section-title text-center">Live Impact</h2>
          <div className="impact-grid">
            <div className="impact-card card">
              <div className="impact-number" style={{ color: 'var(--success)' }}>
                {impact ? impact.totalFarmers : '—'}
              </div>
              <div className="impact-label">Farmers Registered</div>
            </div>
            <div className="impact-card card">
              <div className="impact-number" style={{ color: 'var(--orange)' }}>
                {impact ? impact.totalKgSold + ' kg' : '—'}
              </div>
              <div className="impact-label">Produce Sold Directly</div>
            </div>
            <div className="impact-card card">
              <div className="impact-number" style={{ color: 'var(--green-light)' }}>
                {impact ? `Rs ${impact.farmerExtraIncome.toLocaleString()}` : '—'}
              </div>
              <div className="impact-label">Extra Income for Farmers</div>
            </div>
            <div className="impact-card card">
              <div className="impact-number" style={{ color: 'var(--danger)' }}>
                {impact ? impact.middlemenRemoved : '—'}
              </div>
              <div className="impact-label">Middlemen Removed</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="section cta-section">
        <div className="container text-center">
          <h2 className="section-title">Ready to Join?</h2>
          <p className="text-muted" style={{ marginBottom: 32 }}>Free. Simple. Built for Nepal.</p>
          <div className="hero-cta">
            <Link to="/register?role=farmer" className="btn btn-primary btn-lg">Start as Farmer</Link>
            <Link to="/register?role=vendor" className="btn btn-orange btn-lg">Start as Vendor</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container text-center text-muted">
          <p>🌾 KrishiDirect — किसानबाट सिधै · Built for Nepal 🇳🇵</p>
        </div>
      </footer>
    </div>
  );
}
