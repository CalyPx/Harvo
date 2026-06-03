import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import CropPicker, { CROPS } from '../components/CropPicker';
import VoiceCounter, { speakNepali } from '../components/VoiceCounter';

import './FarmerDashboard.css';

const STEPS = ['crop','unit','quantity','date','price','confirm'];

function ask(text) { setTimeout(() => speakNepali(text), 300); }

// Freshness options — shown as crop images at decreasing brightness
const FRESH_OPTIONS = [
  { days: 0, bright: 1.00, label: 'आज',    voice: 'आजै काटेको — सबैभन्दा ताजा।' },
  { days: 1, bright: 0.78, label: '१ दिन', voice: 'हिजो काटेको।' },
  { days: 2, bright: 0.58, label: '२ दिन', voice: 'दुई दिन अघि काटेको।' },
  { days: 3, bright: 0.40, label: '३ दिन', voice: 'तीन दिन अघि काटेको।' },
  { days: 4, bright: 0.26, label: '४ दिन', voice: 'चार दिन अघि काटेको।' },
  { days: 5, bright: 0.15, label: '५ दिन', voice: 'पाँच दिन अघि काटेको।' },
  { days: 7, bright: 0.08, label: '७ दिन', voice: 'एक हप्ता अघि काटेको — पुरानो।' },
];

function daysAgoDate(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [view,        setView]       = useState('home');
  const [step,        setStep]       = useState('crop');
  const [crop,        setCrop]       = useState(null);

  const [unit,        setUnit]       = useState('kg');
  const [quantity,    setQuantity]   = useState(1);
  const [harvestDays, setHarvestDays]= useState(0);   // days ago
  const [price,       setPrice]      = useState(20);
  const [kalimati,    setKalimati]   = useState(null);
  const [allRates,    setAllRates]   = useState({});
  const [myListings,  setMyListings] = useState([]);
  const [myOrders,    setMyOrders]   = useState([]);
  const [loading,     setLoading]    = useState(false);
  const [posted,      setPosted]     = useState(false);


  useEffect(() => { fetchMyData(); fetchAllRates(); }, []);

  const fetchMyData = async () => {
    try {
      const [lRes, oRes] = await Promise.all([api.get('/listings/my'), api.get('/orders/my')]);
      setMyListings(lRes.data);
      setMyOrders(oRes.data);
    } catch {}
  };

  const fetchAllRates = async () => {
    try {
      const res = await api.get('/kalimati/all');
      setAllRates(res.data || {});
    } catch {}
  };

  useEffect(() => {
    if (!crop) return;
    api.get(`/kalimati/${crop.name}`).then(r => {
      setKalimati(r.data);
      if (r.data?.available) setPrice(unit === 'quintal' ? r.data.suggestedMin * 100 : r.data.suggestedMin);
    }).catch(() => {});
  }, [crop, unit]);

  // speak() helper — inside onClick so mobile gesture requirement is met
  const speak = (msg) => setTimeout(() => speakNepali(msg), 80);

  // 8-second idle timer — reminds farmer to press green or red after inactivity
  const idleRef = useRef(null);
  const resetIdle = () => {
    clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() =>
      speakNepali('मिलेको छ भने हरियो थिच्नुहोस्। मिलेको छैन भने रातो थिच्नुहोस्।')
    , 8000);
  };
  useEffect(() => {
    if (step === 'quantity' || step === 'price') resetIdle();
    return () => clearTimeout(idleRef.current);
  }, [quantity, price, step]);

  const harvestDate  = daysAgoDate(harvestDays);
  const maxPrice     = kalimati?.available ? (unit==='quintal' ? kalimati.absoluteMax*100 : kalimati.absoluteMax) : 999999;
  const priceOverMax = kalimati?.available && price > maxPrice;

  const handlePost = async () => {
    setLoading(true);
    try {
      const priceKg = unit==='quintal' ? price/100 : price;
      await api.post('/listings', {
        crop: crop.name, cropPhoto: crop.nepali,
        unit, quantity, pricePerKg: priceKg, displayPrice: price,
        harvestDate, district: user.district,
      });
      setPosted(true);
      setView('home'); setStep('crop'); setCrop(null); setQuantity(1); setPrice(20); setKalimati(null);
      fetchMyData();
      speak('सूची सफलतापूर्वक राखियो।');
      setTimeout(() => setPosted(false), 4000);
    } catch { speak('गल्ती भयो, फेरि प्रयास गर्नुस्।'); }
    finally { setLoading(false); }
  };

  const goNext = () => setStep(STEPS[STEPS.indexOf(step)+1]);
  const goBack = () => {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i-1]); else setView('home');
  };
  const goNextSpeak = (msg) => { speak(msg); goNext(); };

  const pendingOrders = myOrders.filter(o => o.status === 'deposit_paid');
  const activeListings = myListings.filter(l => ['available','partially_sold'].includes(l.status));

  return (
    <div className="fd-page">
      {/* NAV */}
      <nav className="fd-nav">
        <div className="fd-nav-logo">Harvo</div>
        <div className="fd-nav-right">
          <span className="fd-nav-user">{user?.name}</span>
          <button className="fd-speak-btn" onClick={() => ask(`Hello ${user?.name}`)}>🔊</button>
          <button className="fd-signout-btn" onClick={() => { logout(); navigate('/'); }}>Sign Out ↗</button>
        </div>
      </nav>

      {posted && <div className="toast-success nepali">✓ सूची राखियो!</div>}

      <div className="fd-body">

        {/* ── HOME ── */}
        {view === 'home' && (
          <div className="fd-home fade-in-up">
            <div className="fd-home-grid">
            <div className="fd-greeting">
              <div className="fd-greeting-name">Hello, {user?.name}</div>
              <div className="fd-greeting-sub">{user?.district} · {activeListings.length} active listings</div>
            </div>

            {/* PENDING ORDERS */}
            {pendingOrders.length > 0 && (
              <div className="fd-alert">
              <div className="fd-alert-title">🔔 {pendingOrders.length} order{pendingOrders.length > 1 ? 's' : ''} ready!</div>
                {pendingOrders.map(o => (
                  <div key={o._id} className="fd-order-row">
                    <div>
                      <div className="nepali" style={{fontSize:17,fontWeight:700}}>{o.listing?.cropPhoto || o.listing?.crop}</div>
                      <div style={{fontSize:13,color:'var(--text-muted)'}}>{o.quantity} किलो · {o.vendor?.name} · {o.vendor?.phone}</div>
                      <div style={{fontSize:14,color:'var(--green)',fontWeight:700,marginTop:4}}>रू {o.totalAmount?.toLocaleString()} — भुक्तानी भयो</div>
                    </div>
                    <button className="btn-farmer-green" style={{width:'auto',padding:'12px 16px',fontSize:16,boxShadow:'none'}}
                      onClick={async () => { await api.patch(`/orders/${o._id}`,{status:'completed'}); fetchMyData(); ask('Order marked as shipped.'); }}>
                      Shipped ✓
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button className="btn-farmer-green fd-post-main" onClick={() => { setStep('crop'); setView('wizard'); }}>
              + Add New Listing
            </button>

            </div>{/* end fd-home-grid left */}

            {/* RIGHT COLUMN — Listings grid */}
            <div className="fd-home-right">
              <div className="fd-section-title">My Listings</div>
              {myListings.length === 0 ? (
                <div className="fd-empty">No listings yet.<br/>Click the button to get started!</div>
              ) : (
                <div className="fd-listings-grid">
                  {myListings.map(l => {
                    const cd = CROPS.find(c => c.name === l.crop);
                    return (
                      <div key={l._id} className="fd-listing-card">
                        <div className="fdl-img-wrap">
                          {cd?.img
                            ? <img src={cd.img} alt={l.crop} className="fdl-img" />
                            : <div className="fdl-img-placeholder" style={{background: cd?.fallback || '#333'}} />}
                          <span className={`fdl-badge ${l.status==='available'?'fdl-badge-green':l.status==='partially_sold'?'fdl-badge-orange':'fdl-badge-gray'}`}>
                            {l.status==='available' ? 'Available' : l.status==='partially_sold' ? 'Partial' : l.status}
                          </span>
                        </div>
                        <div className="fdl-info">
                          <div className="fdl-name nepali">{l.cropPhoto || l.crop}</div>
                          <div className="fdl-row">
                            <span className="fdl-qty">{l.quantity} kg left</span>
                            {l.originalQty > l.quantity && <span className="fdl-sold">{l.originalQty - l.quantity} sold ✓</span>}
                          </div>
                          <div className="fdl-price">Rs {l.pricePerKg}/kg</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── WIZARD ── */}
        {view === 'wizard' && (
          <div className="fd-wizard fade-in-up">
            {/* PROGRESS */}
            <div className="fd-progress">
              {STEPS.map((s,i) => (
                <div key={s} className={`fd-pdot ${STEPS.indexOf(step)>=i?'fd-pdot-done':''}`} />
              ))}
            </div>

            {/* STEP 1: CROP */}
            {step === 'crop' && (
              <div className="fd-step fd-step-crop">
                <div className="fd-step-hd">
                  <div className="fd-step-title nepali">कुन बाली?</div>
                  <button className="fd-listen" onClick={() => speak('कुन बाली बेच्नु हुन्छ? तस्बिरमा थिचेर छान्नुस्।')}>🔊</button>
                </div>
                <div style={{flex:1, overflowY:'auto', minHeight:0}}>
                  <CropPicker
                    selected={crop}
                    onSelect={c => {
                      setCrop(c);
                      speak(`${c.nepali} छानियो। किलोमा बेच्नु छ भने हरियो बटन थिच्नुस्। क्विन्टलमा बेच्नु छ भने नीलो बटन थिच्नुस्।`);
                      setStep('unit');
                    }}
                    kalimatiRates={allRates}
                  />
                </div>
              </div>
            )}



            {/* STEP 2: UNIT */}
            {step === 'unit' && (
              <div className="fd-step">
                <div className="fd-step-hd">
                  <div className="fd-step-title nepali">{crop?.nepali} — कसरी नाप्ने?</div>
                  <button className="fd-listen" onClick={() => speak(`किलोमा बेच्नु छ भने हरियो बटन थिच्नुस्। क्विन्टलमा बेच्नु छ भने नीलो बटन थिच्नुस्।`)}>🔊</button>
                </div>
                <div className="fd-unit-grid">
                  <button
                    className="fd-unit-big fd-unit-kg"
                    onClick={() => {
                      setUnit('kg'); setPrice(20);
                      speak(`किलो छानियो। अब हरियो बटन थिच्दा अंक बढ्छ र रातो बटन थिच्दा अंक घट्छ।`);
                      goNext();
                    }}
                  >
                    <div className="fd-unit-icon">kg</div>
                    <div className="fd-unit-lbl nepali">किलो</div>
                    <div className="fd-unit-sub">1 kilogram</div>
                  </button>
                  <button
                    className="fd-unit-big fd-unit-qtl"
                    onClick={() => {
                      setUnit('quintal'); setPrice(2000);
                      speak(`क्विन्टल छानियो। अब हरियो बटन थिचेर अगाडि जानुस्।`);
                      goNext();
                    }}
                  >
                    <div className="fd-unit-icon">qtl</div>
                    <div className="fd-unit-lbl nepali">क्विन्टल</div>
                    <div className="fd-unit-sub">100 kg</div>
                  </button>
                </div>
                <div className="fd-nav-btns">
                  <button className="fd-btn-back" onClick={() => { speak('पछाडि फर्कियो।'); goBack(); }}>← Back</button>
                </div>
              </div>
            )}

            {/* STEP 3: QUANTITY */}
            {step === 'quantity' && (
              <div className="fd-step fd-step-counter">
                <div className="fd-step-hd">
                  <div className="fd-step-title nepali">कति {unit==='quintal'?'क्विन्टल':'किलो'} बेच्नु छ?</div>
                  <button className="fd-listen" onClick={() => { speak(`कति ${unit==='quintal'?'क्विन्टल':'किलो'} बेच्नु छ? डाँयो हरियो बटन थिचेर बढाउनुस्, बायाँ रातो बटन थिचेर घटाउनुस्।`); resetIdle(); }}>🔊</button>
                </div>
                <VoiceCounter
                  value={quantity}
                  onChange={v => { setQuantity(v); resetIdle(); }}
                  unit={unit==='quintal'?'क्विन्टल':'किलो'}
                  min={1} max={unit==='quintal'?9999:999999}
                />
                {unit==='quintal' && <div className="fd-convert nepali">= {(quantity*100).toLocaleString()} किलो जम्मा</div>}
                <div className="fd-nav-btns">
                  <button className="fd-btn-back" onClick={() => { speak('पछाडि फर्कियो।'); goBack(); }}>← Back</button>
                  <button className="fd-btn-next" onClick={() => goNextSpeak(`ठीक छ। अब बाली कति दिन पहिले काटियेको छ सो छान्नुस्।`)}>
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: DATE — Crop image freshness picker */}
            {step === 'date' && (
              <div className="fd-step">
                <div className="fd-step-hd">
                  <div className="fd-step-title nepali">बाली कति दिन पहिले काटियो?</div>
                  <button className="fd-listen" onClick={() => speak('ताजा बालीको तस्बिर उज्यालो देखिन्छ र केही पुरानो बालीको तस्बिर कम उज्यालो देखिन सक्छ। त्यसैले तस्बिरको उज्यालोपनका आधारमा आफ्नो बाली छनोट गर्नुहोस्')}>🔊</button>
                </div>
                <div className="fd-date-hint">Brighter = fresher &nbsp;→&nbsp; Darker = older</div>
                <div className="fd-fresh-row">
                  {FRESH_OPTIONS.map(opt => (
                    <button
                      key={opt.days}
                      className={`fd-fresh-btn ${harvestDays === opt.days ? 'fd-fresh-active' : ''}`}
                      onClick={() => { setHarvestDays(opt.days); speak(opt.voice); }}
                    >
                      <div className="fd-fresh-img-wrap">
                        {crop?.img ? (
                          <img
                            src={crop.img}
                            alt=""
                            className="fd-fresh-img"
                            style={{ filter: `brightness(${opt.bright}) saturate(${Math.round(opt.bright * 120)}%)` }}
                          />
                        ) : (
                          <div className="fd-fresh-color" style={{ opacity: opt.bright }} />
                        )}
                      </div>
                      <div className="fd-fresh-label nepali">{opt.label}</div>
                      {harvestDays === opt.days && <div className="fd-fresh-check">✓</div>}
                    </button>
                  ))}
                </div>
                <div className="fd-nav-btns" style={{marginTop:12}}>
                  <button className="fd-btn-back" onClick={() => { speak('पछाडि फर्कियो।'); goBack(); }}>← Back</button>
                  <button className="fd-btn-next" onClick={() => goNextSpeak(
                    kalimati?.available
                      ? `आज कालीमाटीमा ${crop?.nepali} को मूल्य ${kalimati.kalimatiMin} देखि ${kalimati.kalimatiMax} रुपैयाँ प्रति किलो छ। सुझाव: ${unit==='quintal'?kalimati.suggestedMin*100:kalimati.suggestedMin} देखि ${unit==='quintal'?kalimati.suggestedMax*100:kalimati.suggestedMax} रुपैयाँ राख्नुस्।`
                      : 'ठीक छ। अब मूल्य राख्नुस्।'
                  )}>
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: PRICE */}
            {step === 'price' && (
              <div className="fd-step fd-step-counter">
                <div className="fd-step-hd">
                  <div className="fd-step-title nepali">मूल्य / {unit==='quintal'?'क्विन्टल':'किलो'}</div>
                  <button className="fd-listen" onClick={() => speak(
                    kalimati?.available
                      ? `आज कालीमाटीमा ${crop?.nepali} को मूल्य ${kalimati.kalimatiMin} देखि ${kalimati.kalimatiMax} रुपैयाँ प्रति किलो छ। सुझाव: ${unit==='quintal'?kalimati.suggestedMin*100:kalimati.suggestedMin} देखि ${unit==='quintal'?kalimati.suggestedMax*100:kalimati.suggestedMax} रुपैयाँ राख्नुस्।`
                      : 'मूल्य माथि र तल थिचेर सेट गर्नुस्।'
                  )}>🔊</button>
                </div>
                {kalimati?.available && (
                  <div className="fd-km-box">
                    <div className="fd-km-label nepali">आजको कालीमाटी बजार</div>
                    <div className="fd-km-range">Rs {unit==='quintal'?kalimati.kalimatiMin*100:kalimati.kalimatiMin} – Rs {unit==='quintal'?kalimati.kalimatiMax*100:kalimati.kalimatiMax}</div>
                  </div>
                )}
                <VoiceCounter
                  value={price}
                  onChange={v => { if(v<=maxPrice) { setPrice(v); resetIdle(); } }}
                  unit={`Rs / ${unit==='quintal'?'क्विन्टल':'किलो'}`}
                  min={1} max={maxPrice}
                />
                {priceOverMax && <div className="fd-price-warn nepali">⚠ मूल्य धेरै बढी — max Rs {maxPrice}</div>}
                <div className="fd-nav-btns">
                  <button className="fd-btn-back" onClick={() => { speak('पछाडि फर्कियो।'); goBack(); }}>← Back</button>
                  <button className="fd-btn-next" disabled={priceOverMax} onClick={() => goNextSpeak(`${unit === 'quintal' ? quantity + ' क्विन्टल' : quantity + ' किलो'} ${crop?.nepali}, ${price} रुपैयाँ प्रति ${unit === 'quintal' ? 'क्विन्टल' : 'किलो'}। सही छ भने हरियो बटन थिच्नुस्।`)}>Next →</button>
                </div>
              </div>
            )}

            {/* STEP 6: CONFIRM */}
            {step === 'confirm' && (
              <div className="fd-step fd-step-confirm">
                <div className="fd-step-title nepali">सही छ?</div>
                <button className="fd-listen-wide" onClick={() => speak(
                  `${unit==='quintal' ? quantity+' क्विन्टल' : quantity+' किलो'} ${crop?.nepali}, ${price} रुपैयाँ प्रति ${unit==='quintal'?'क्विन्टल':'किलो'}। सही छ भने हरियो बटन थिच्नुस्। सही छैन भने रातो बटन थिच्नुस्।`
                )}>
                  🔊 सुन्नुस्
                </button>
                <div className="fd-confirm-inner">
                  {crop?.img && <img src={crop.img} alt={crop?.nepali} className="fd-confirm-thumb" />}
                  <div className="fd-confirm-rows">
                    {[
                      ['Crop',      <span className="nepali">{crop?.nepali}</span>],
                      ['Quantity',  <span className="nepali">{quantity} {unit==='quintal'?'क्विन्टल':'किलो'}</span>],
                      ['Price',     `Rs ${price} / ${unit==='quintal'?'quintal':'kg'}`],
                      ['Harvested', harvestDays===0 ? 'Today' : `${harvestDays} days ago`],
                      ['District',  user?.district],
                    ].map(([k,v]) => (
                      <div key={k} className="fd-confirm-row">
                        <span className="fd-confirm-key">{k}</span>
                        <strong className="fd-confirm-val">{v}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="fd-nav-btns">
                  <button className="fd-btn-back" onClick={() => { speak('हेरफेर गर्नुस्।'); goBack(); }}>← Edit</button>
                  <button className="fd-btn-next" onClick={() => { speak('सूची राखिँदै छ, पर्ख्नुस्।'); handlePost(); }} disabled={loading}>
                    {loading ? 'Posting...' : '✓ Post Listing'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
