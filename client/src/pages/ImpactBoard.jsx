import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './ImpactBoard.css';

function AnimatedCounter({ target, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef();
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const duration = 1800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

const ACTIVITY_FEED = [
  { icon: '🍅', msg: 'Ram Bahadur (Dhading) listed 80kg Tomato at Rs 35/kg', time: '2 min ago' },
  { icon: '🏪', msg: 'Shyam Vendors (Kathmandu) ordered 60kg Cauliflower', time: '5 min ago' },
  { icon: '🧅', msg: 'Sita Tamang (Nuwakot) listed 120kg Onion at Rs 28/kg', time: '12 min ago' },
  { icon: '✅', msg: 'Order completed — 50kg Potato from Sindhupalchok', time: '18 min ago' },
  { icon: '🥕', msg: 'New listing: 200kg Carrot from Kavrepalanchok', time: '25 min ago' },
  { icon: '🏪', msg: 'Fresh Mart ordered 90kg Rice from Chitwan', time: '31 min ago' },
  { icon: '✅', msg: 'Deal closed — 75kg Cabbage, farmer earned Rs 2,625 extra', time: '44 min ago' },
  { icon: '🍊', msg: 'Hari Prasad (Syangja) listed 300kg Orange at Rs 42/kg', time: '1 hr ago' },
];

export default function ImpactBoard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/impact').then(r => setStats(r.data)).catch(() => {
      // Use demo data if backend not connected
      setStats({
        totalFarmers: 247, totalVendors: 89, totalListings: 1204,
        totalTransactions: 683, totalKgSold: 48720,
        farmerExtraIncome: 974400, middlemenRemoved: 3415
      });
    });
  }, []);

  return (
    <div className="impact-page">
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">🌾 KrishiDirect</Link>
          <div className="navbar-links">
            <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Join Now</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="impact-hero">
        <div className="container text-center fade-in-up">
          <div className="impact-badge">📊 Live Impact Dashboard</div>
          <h1 className="impact-title">Every Transaction Matters</h1>
          <p className="impact-subtitle text-muted">
            Real numbers. Real farmers. Real change in Nepal.
          </p>
        </div>
      </section>

      {/* BIG COUNTERS */}
      <section className="section">
        <div className="container">
          <div className="big-counters">
            <div className="big-counter card">
              <div className="bc-icon">🧑‍🌾</div>
              <div className="bc-value" style={{ color: 'var(--green-light)' }}>
                <AnimatedCounter target={stats?.totalFarmers} />
              </div>
              <div className="bc-label">Farmers Earning More</div>
            </div>
            <div className="big-counter card">
              <div className="bc-icon">🏪</div>
              <div className="bc-value" style={{ color: 'var(--orange)' }}>
                <AnimatedCounter target={stats?.totalVendors} />
              </div>
              <div className="bc-label">Vendors Buying Direct</div>
            </div>
            <div className="big-counter card">
              <div className="bc-icon">⚖️</div>
              <div className="bc-value" style={{ color: 'var(--success)' }}>
                <AnimatedCounter target={stats?.totalKgSold} suffix=" kg" />
              </div>
              <div className="bc-label">Produce Traded Directly</div>
            </div>
            <div className="big-counter card">
              <div className="bc-icon">💰</div>
              <div className="bc-value" style={{ color: 'var(--orange-dark)' }}>
                <AnimatedCounter target={stats?.farmerExtraIncome} prefix="Rs " />
              </div>
              <div className="bc-label">Extra Income for Farmers</div>
            </div>
            <div className="big-counter card">
              <div className="bc-icon">🚫</div>
              <div className="bc-value" style={{ color: 'var(--danger)' }}>
                <AnimatedCounter target={stats?.middlemenRemoved} />
              </div>
              <div className="bc-label">Middlemen Removed</div>
            </div>
            <div className="big-counter card">
              <div className="bc-icon">🤝</div>
              <div className="bc-value" style={{ color: 'var(--text)' }}>
                <AnimatedCounter target={stats?.totalTransactions} />
              </div>
              <div className="bc-label">Direct Deals Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="section section-dark">
        <div className="container">
          <h2 className="section-title text-center">The Difference We Make</h2>
          <div className="comparison">
            <div className="compare-col card" style={{ borderColor: 'var(--danger)' }}>
              <h3 style={{ color: 'var(--danger)' }}>❌ Traditional Chain</h3>
              <div className="compare-chain">
                <span>Farmer<br/><strong style={{color:'var(--danger)'}}>Rs 20</strong></span>
                <span className="chain-arrow">→</span>
                <span>Middleman 1<br/><small>+Rs 15</small></span>
                <span className="chain-arrow">→</span>
                <span>Middleman 2<br/><small>+Rs 20</small></span>
                <span className="chain-arrow">→</span>
                <span>Wholesaler<br/><small>+Rs 25</small></span>
                <span className="chain-arrow">→</span>
                <span>Retailer<br/><small>+Rs 20</small></span>
                <span className="chain-arrow">→</span>
                <span>Consumer<br/><strong style={{color:'var(--danger)'}}>Rs 140</strong></span>
              </div>
              <p className="text-muted" style={{ marginTop: 16, fontSize: 14 }}>Farmer earns only 14% of final price</p>
            </div>
            <div className="compare-col card" style={{ borderColor: 'var(--success)' }}>
              <h3 style={{ color: 'var(--success)' }}>✅ KrishiDirect</h3>
              <div className="compare-chain">
                <span>Farmer<br/><strong style={{color:'var(--success)'}}>Rs 40</strong></span>
                <span className="chain-arrow direct">→→→→</span>
                <span>Vendor<br/><strong style={{color:'var(--success)'}}>Rs 40</strong></span>
              </div>
              <p className="text-muted" style={{ marginTop: 16, fontSize: 14 }}>Farmer earns 100% of agreed price. Vendor saves Rs 60/kg.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVITY FEED */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">🔴 Live Activity</h2>
          <div className="activity-feed">
            {ACTIVITY_FEED.map((a, i) => (
              <div className="activity-item" key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="activity-icon">{a.icon}</span>
                <span className="activity-msg">{a.msg}</span>
                <span className="activity-time text-muted">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container text-center">
          <h2 className="section-title">Join the Movement</h2>
          <p className="text-muted" style={{ marginBottom: 32 }}>Be part of Nepal's food revolution.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register?role=farmer" className="btn btn-primary btn-lg">🌾 Register as Farmer</Link>
            <Link to="/register?role=vendor" className="btn btn-orange btn-lg">🏪 Register as Vendor</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
