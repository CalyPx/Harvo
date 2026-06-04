import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { CROPS } from '../components/CropPicker';
import OrderModal from '../components/OrderModal';
import './ListingDetail.css';

export default function ListingDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing,  setListing]  = useState(null);
  const [kalimati, setKalimati] = useState(null);
  const [ordering, setOrdering] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(r => { setListing(r.data); return api.get(`/kalimati/${r.data.crop}`); })
      .then(r => setKalimati(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="ld-loading">Loading...</div>;
  if (error || !listing) return (
    <div className="ld-loading">
      <div style={{fontSize:40}}>⚠️</div>
      <div>Could not load this listing.</div>
      <button className="ld-back" style={{position:'static'}} onClick={() => navigate(-1)}>← Go Back</button>
    </div>
  );

  const crop     = CROPS.find(c => c.name === listing.crop);
  const km       = kalimati;
  const savings  = km?.available ? Math.round(km.kalimatiAvg - listing.pricePerKg) : null;
  const harvestAge = listing.harvestDate
    ? Math.floor((Date.now() - new Date(listing.harvestDate)) / 86400000) : null;

  const freshColor = harvestAge === null ? 'gray' : harvestAge <= 2 ? 'green' : harvestAge <= 5 ? 'orange' : 'red';

  return (
    <div className="ld-page">
      <div className="ld-container">

        {/* BACK */}
        <button className="ld-back" onClick={() => navigate(-1)}>← Back</button>

        {/* HERO IMAGE — contained */}
        <div className="ld-img-wrap">
          {crop?.img
            ? <img src={crop.img} alt={listing.crop} className="ld-img" />
            : <div className="ld-img-fallback" style={{background: crop?.fallback || '#1a2e1a'}}>{listing.crop[0]}</div>}
          {savings > 0 && <div className="ld-save-badge">Save Rs {savings}/kg vs market</div>}
        </div>

        <div className="ld-body">

          {/* NAME + PRICE */}
          <div className="ld-top">
            <div>
              <div className="ld-crop-nep nepali">{crop?.nepali || listing.crop}</div>
              <div className="ld-crop-en">{listing.crop}</div>
            </div>
            <div className="ld-price-block">
              <div className="ld-price">Rs {listing.pricePerKg}</div>
              <div className="ld-per">/kg</div>
            </div>
          </div>

          {/* MARKET COMPARISON */}
          {km?.available && (
            <div className="ld-market">
              <div className="ld-market-title">Kalimati Wholesale Rate</div>
              <div className="ld-market-row">
                <span>Today's Avg</span>
                <strong>Rs {km.kalimatiAvg}/kg</strong>
              </div>
              <div className="ld-market-row">
                <span>Range</span>
                <strong>Rs {km.kalimatiMin} – {km.kalimatiMax}</strong>
              </div>
              {savings > 0 && (
                <div className="ld-market-row" style={{marginTop:4, paddingTop:10, borderTop:'1px dashed rgba(255,255,255,0.08)'}}>
                  <span style={{fontWeight:700}}>Your Savings</span>
                  <strong className="ld-save-val">Rs {savings} / kg</strong>
                </div>
              )}
            </div>
          )}

          {/* DETAILS GRID */}
          <div className="ld-details-grid">
            <div className="ld-detail-item">
              <div className="ld-detail-icon">📦</div>
              <div>
                <div className="ld-detail-label">Quantity</div>
                <div className="ld-detail-val">{listing.quantity} kg</div>
              </div>
            </div>
            <div className="ld-detail-item">
              <div className="ld-detail-icon">📍</div>
              <div>
                <div className="ld-detail-label">Origin</div>
                <div className="ld-detail-val">{listing.farmer?.district || listing.district || 'Unknown'}</div>
              </div>
            </div>
          </div>

          {/* FRESHNESS */}
          <div className={`ld-detail-item ld-fresh-${freshColor}`} style={{flexDirection:'column', alignItems:'stretch', gap:12}}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <div className="ld-detail-icon">🌱</div>
              <div>
                <div className="ld-detail-label">Freshness</div>
                <div className="ld-detail-val">
                  {harvestAge === 0 ? 'Harvested today' : harvestAge === 1 ? 'Harvested yesterday' : harvestAge ? `Harvested ${harvestAge} days ago` : 'Date unknown'}
                </div>
              </div>
            </div>
            {harvestAge !== null && (
              <div className="ld-fresh-bar-wrap">
                <div className="ld-fresh-bar-label">
                  <span>Farm Fresh</span>
                  <span className={`ld-fresh-tag fresh-${freshColor}`}>
                    {freshColor === 'green' ? 'Excellent' : freshColor === 'orange' ? 'Good' : 'Needs quick sale'}
                  </span>
                </div>
                <div className="ld-fresh-track">
                  <div className="ld-fresh-fill" style={{
                    width: freshColor==='green'?'90%':freshColor==='orange'?'50%':'15%',
                    background: freshColor==='green'?'#BBFF4B':freshColor==='orange'?'#F97316':'#EF4444'
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* ORDER BUTTON */}
          {user?.role === 'vendor' && listing.status !== 'sold' && (
            <button className="ld-order-btn" onClick={() => setOrdering(true)}>
              Order Now
            </button>
          )}

        </div>
      </div>

      {ordering && (
        <OrderModal listing={listing} onClose={() => setOrdering(false)} />
      )}
    </div>
  );
}
