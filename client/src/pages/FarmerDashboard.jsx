import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import CropPicker from '../components/CropPicker';
import VoiceCounter from '../components/VoiceCounter';
import './FarmerDashboard.css';

const STEPS = ['crop', 'quantity', 'price', 'confirm'];

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]         = useState('home');   // 'home' | 'crop' | 'quantity' | 'price' | 'confirm'
  const [crop, setCrop]         = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice]       = useState(20);
  const [myListings, setMyListings] = useState([]);
  const [myOrders, setMyOrders]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [posted, setPosted]     = useState(false);

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    try {
      const [lRes, oRes] = await Promise.all([
        api.get('/listings/my'),
        api.get('/orders/my')
      ]);
      setMyListings(lRes.data);
      setMyOrders(oRes.data);
    } catch (e) {}
  };

  const handlePost = async () => {
    setLoading(true);
    try {
      await api.post('/listings', {
        crop: crop.name,
        cropPhoto: crop.emoji,
        quantity,
        pricePerKg: price,
        district: user.district,
      });
      setPosted(true);
      setStep('home');
      setCrop(null); setQuantity(1); setPrice(20);
      fetchMyData();
      setTimeout(() => setPosted(false), 3000);
    } catch (e) {
      alert('Failed to post. Try again.');
    } finally { setLoading(false); }
  };

  const confirmOrder = async (orderId) => {
    await api.patch(`/orders/${orderId}`, { status: 'confirmed' });
    fetchMyData();
  };

  const completeOrder = async (orderId, listingId) => {
    await api.patch(`/orders/${orderId}`, { status: 'completed' });
    fetchMyData();
  };

  const handleLogout = () => { logout(); navigate('/'); };

  // --- CONFIRM VOICE READBACK ---
  const speakConfirm = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = `Tapai le bharnu bhayeko cha: ${quantity} ke jee ${crop?.name}, ek kilo ko ${price} rupiya. Thik cha bhane hariyo button thichnu hos.`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ne-NP'; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    if (step === 'confirm' && crop) speakConfirm();
  }, [step]);

  return (
    <div className="farmer-page">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">🌾 KrishiDirect</div>
        <nav className="sidebar-nav">
          <button className={`sidebar-link ${step === 'home' ? 'active' : ''}`} onClick={() => setStep('home')}>
            🏠 My Dashboard
          </button>
          <button className="sidebar-link" onClick={() => setStep('crop')}>
            ➕ Post Produce
          </button>
          <Link to="/impact" className="sidebar-link">📊 Impact Board</Link>
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-avatar">🧑‍🌾</div>
          <div>
            <div className="sidebar-name">{user?.name}</div>
            <div className="sidebar-district text-muted">{user?.district}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ marginTop: 12 }}>Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="farmer-main">

        {/* SUCCESS TOAST */}
        {posted && (
          <div className="toast-success">✅ Listing posted! Vendors are being notified.</div>
        )}

        {/* ── HOME ── */}
        {step === 'home' && (
          <div className="fade-in-up">
            <div className="page-header">
              <div>
                <h1>Namaste, {user?.name}! 🙏</h1>
                <p className="text-muted">Manage your produce listings and orders</p>
              </div>
              <button className="btn btn-primary" onClick={() => setStep('crop')}>
                ➕ Post New Produce
              </button>
            </div>

            {/* QUICK STATS */}
            <div className="quick-stats">
              <div className="quick-stat card">
                <div className="qs-num" style={{ color: 'var(--green-light)' }}>{myListings.filter(l => l.status === 'available').length}</div>
                <div className="qs-label text-muted">Active Listings</div>
              </div>
              <div className="quick-stat card">
                <div className="qs-num" style={{ color: 'var(--orange)' }}>{myOrders.filter(o => o.status === 'pending').length}</div>
                <div className="qs-label text-muted">Pending Orders</div>
              </div>
              <div className="quick-stat card">
                <div className="qs-num" style={{ color: 'var(--success)' }}>{myOrders.filter(o => o.status === 'completed').length}</div>
                <div className="qs-label text-muted">Completed Sales</div>
              </div>
              <div className="quick-stat card">
                <div className="qs-num" style={{ color: 'var(--text)' }}>
                  Rs {myOrders.filter(o => o.status === 'completed').reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}
                </div>
                <div className="qs-label text-muted">Total Earned</div>
              </div>
            </div>

            {/* PENDING ORDERS */}
            {myOrders.filter(o => o.status === 'pending').length > 0 && (
              <div className="section-block">
                <h2 className="block-title">🔔 New Orders (Action Required)</h2>
                <div className="orders-list">
                  {myOrders.filter(o => o.status === 'pending').map(o => (
                    <div className="order-card card" key={o._id}>
                      <div className="order-info">
                        <div className="order-crop">{o.listing?.cropPhoto} {o.listing?.crop}</div>
                        <div className="text-muted">{o.quantity} kg · Rs {o.agreedPrice}/kg</div>
                        <div className="text-muted">Vendor: <strong style={{ color: 'var(--text)' }}>{o.vendor?.name}</strong> · {o.vendor?.phone}</div>
                        <div className="order-total">Total: Rs {o.totalAmount.toLocaleString()}</div>
                      </div>
                      <div className="order-actions">
                        <button className="btn btn-success btn-sm" onClick={() => confirmOrder(o._id)}>✅ Confirm</button>
                        <button className="btn btn-danger btn-sm" onClick={() => completeOrder(o._id)}>📦 Mark Delivered</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MY LISTINGS */}
            <div className="section-block">
              <h2 className="block-title">My Listings</h2>
              {myListings.length === 0
                ? <div className="empty-state">No listings yet. Post your first produce! 🌱</div>
                : (
                  <div className="listings-grid">
                    {myListings.map(l => (
                      <div className="listing-card card" key={l._id}>
                        <div className="listing-emoji">{l.cropPhoto}</div>
                        <div className="listing-crop">{l.crop}</div>
                        <div className="listing-details text-muted">{l.quantity} kg · Rs {l.pricePerKg}/kg</div>
                        <div className="listing-district text-muted">📍 {l.district}</div>
                        <span className={`badge ${l.status === 'available' ? 'badge-green' : l.status === 'ordered' ? 'badge-orange' : 'badge-red'}`}>
                          {l.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </div>
        )}

        {/* ── STEP 1: PICK CROP ── */}
        {step === 'crop' && (
          <div className="wizard fade-in-up">
            <div className="wizard-header">
              <button className="btn btn-ghost btn-sm" onClick={() => setStep('home')}>← Back</button>
              <div className="wizard-steps">
                {['Crop','Quantity','Price','Confirm'].map((s, i) => (
                  <div key={s} className={`wstep ${STEPS.indexOf(step) >= i ? 'done' : ''}`}>{s}</div>
                ))}
              </div>
            </div>
            <h2 className="wizard-title">Kun baali bechna chahanu huncha?<br/><span className="text-muted" style={{fontSize:'16px'}}>Which crop do you want to sell?</span></h2>
            <CropPicker selected={crop} onSelect={(c) => { setCrop(c); setStep('quantity'); }} />
          </div>
        )}

        {/* ── STEP 2: QUANTITY ── */}
        {step === 'quantity' && (
          <div className="wizard fade-in-up">
            <div className="wizard-header">
              <button className="btn btn-ghost btn-sm" onClick={() => setStep('crop')}>← Back</button>
              <div className="wizard-steps">
                {['Crop','Quantity','Price','Confirm'].map((s, i) => (
                  <div key={s} className={`wstep ${STEPS.indexOf(step) >= i ? 'done' : ''}`}>{s}</div>
                ))}
              </div>
            </div>
            <h2 className="wizard-title">{crop?.emoji} {crop?.name} — Kati kilo?<br/><span className="text-muted" style={{fontSize:'16px'}}>How many kilograms?</span></h2>
            <VoiceCounter value={quantity} onChange={setQuantity} unit="kg" min={1} max={9999} lang="ne-NP" />
            <button className="btn btn-primary btn-lg" style={{ marginTop: 32 }} onClick={() => setStep('price')}>
              Next: Set Price →
            </button>
          </div>
        )}

        {/* ── STEP 3: PRICE ── */}
        {step === 'price' && (
          <div className="wizard fade-in-up">
            <div className="wizard-header">
              <button className="btn btn-ghost btn-sm" onClick={() => setStep('quantity')}>← Back</button>
              <div className="wizard-steps">
                {['Crop','Quantity','Price','Confirm'].map((s, i) => (
                  <div key={s} className={`wstep ${STEPS.indexOf(step) >= i ? 'done' : ''}`}>{s}</div>
                ))}
              </div>
            </div>
            <h2 className="wizard-title">{crop?.emoji} {crop?.name} — Kati rupiya per kilo?<br/><span className="text-muted" style={{fontSize:'16px'}}>Price per kg in NPR?</span></h2>
            <VoiceCounter value={price} onChange={setPrice} unit="Rs/kg" min={1} max={9999} lang="ne-NP" />
            <div className="price-hint card" style={{ marginTop: 24 }}>
              <p>💡 <strong>Tip:</strong> Traditional middlemen pay you around <strong>Rs 20–30/kg</strong>. Set your own fair price directly!</p>
            </div>
            <button className="btn btn-primary btn-lg" style={{ marginTop: 24 }} onClick={() => setStep('confirm')}>
              Next: Confirm →
            </button>
          </div>
        )}

        {/* ── STEP 4: CONFIRM ── */}
        {step === 'confirm' && (
          <div className="wizard fade-in-up">
            <div className="wizard-header">
              <button className="btn btn-ghost btn-sm" onClick={() => setStep('price')}>← Back</button>
              <div className="wizard-steps">
                {['Crop','Quantity','Price','Confirm'].map((s, i) => (
                  <div key={s} className={`wstep ${STEPS.indexOf(step) >= i ? 'done' : ''}`}>{s}</div>
                ))}
              </div>
            </div>
            <h2 className="wizard-title">Confirm Your Listing</h2>

            <div className="confirm-card card">
              <div className="confirm-emoji">{crop?.emoji}</div>
              <div className="confirm-details">
                <div className="confirm-row"><span className="text-muted">Crop</span><strong>{crop?.name}</strong></div>
                <div className="confirm-row"><span className="text-muted">Quantity</span><strong>{quantity} kg</strong></div>
                <div className="confirm-row"><span className="text-muted">Price</span><strong>Rs {price}/kg</strong></div>
                <div className="confirm-row"><span className="text-muted">Total Value</span><strong style={{ color: 'var(--success)' }}>Rs {(quantity * price).toLocaleString()}</strong></div>
                <div className="confirm-row"><span className="text-muted">District</span><strong>{user?.district}</strong></div>
              </div>
            </div>

            <button className="btn btn-outline" style={{ marginTop: 16, width: '100%' }} onClick={speakConfirm}>
              🔊 Listen in Nepali Again
            </button>

            <div className="confirm-buttons">
              <button className="btn btn-danger btn-lg" style={{ flex: 1 }} onClick={() => setStep('crop')}>
                ❌ Cancel
              </button>
              <button className="btn btn-success btn-lg" style={{ flex: 1 }} onClick={handlePost} disabled={loading}>
                {loading ? 'Posting...' : '✅ Post Listing'}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
