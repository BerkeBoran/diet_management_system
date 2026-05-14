import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import userService from '../../services/userService';
import dietService from '../../services/dietService';
import chatService from '../../services/chatService';
import Icons from '../../components/landing/LandingIcons';

/* ── helpers ── */
const titleLabel = t =>
  ({ DIETICIAN: 'Diyetisyen', EXPERT_DIETICIAN: 'Uzman Diyetisyen', INTERN_DIETICIAN: 'Stajyer Diyetisyen' }[t] || t || 'Diyetisyen');

const AVATAR_COLORS = [
  'linear-gradient(135deg,#C97B5C,#8E6A55)',
  'linear-gradient(135deg,#8FA876,#4D7C0F)',
  'linear-gradient(135deg,#D4A574,#8E6A55)',
  'linear-gradient(135deg,#B8927D,#5C4738)',
  'linear-gradient(135deg,#65A30D,#2A6B2E)',
  'linear-gradient(135deg,#C97B5C,#A0523A)',
];
const COVER_COLORS = [
  'linear-gradient(135deg,#1A2516 0%,#4D7C0F 100%)',
  'linear-gradient(135deg,#5C4738 0%,#C97B5C 100%)',
  'linear-gradient(135deg,#2A3624 0%,#8FA876 100%)',
  'linear-gradient(135deg,#4A3D2A 0%,#D4A574 100%)',
  'linear-gradient(135deg,#1A2516 0%,#65A30D 100%)',
  'linear-gradient(135deg,#3F2A2A 0%,#A86B5C 100%)',
];

/* current ISO week number for rotating featured */
function isoWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - yearStart) / 86400000 - 3 + ((yearStart.getDay() + 6) % 7)) / 7);
}

/* star row */
function Stars({ value = 0, size = 13 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span style={{ display:'inline-flex', gap:1 }}>
      {[0,1,2,3,4].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i < full || (i === full && half) ? '#D4A574' : 'none'}
          stroke="#D4A574" strokeWidth="1.6">
          <polygon points="12,2 15,9 22,10 17,15 18,22 12,18 6,22 7,15 2,10 9,9"/>
        </svg>
      ))}
    </span>
  );
}

/* avatar — shows photo if available, else initials */
function Avatar({ d, size = 72, border = 4, colorIdx = 0, style: extraStyle = {} }) {
  const initials = `${d.first_name?.[0] || ''}${d.last_name?.[0] || ''}`;
  return d.profile_photo ? (
    <img src={d.profile_photo} alt={initials}
      style={{
        width: size, height: size, borderRadius: '50%', objectFit: 'cover',
        border: `${border}px solid #fff`, boxShadow: '0 4px 16px rgba(26,37,22,.12)',
        flexShrink: 0, ...extraStyle,
      }}/>
  ) : (
    <span style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: AVATAR_COLORS[colorIdx % AVATAR_COLORS.length],
      color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: 600, letterSpacing: '0.04em',
      border: `${border}px solid #fff`, boxShadow: '0 4px 16px rgba(26,37,22,.12)',
      ...extraStyle,
    }}>
      {initials}
    </span>
  );
}

export default function ClientDieticians() {
  const navigate = useNavigate();
  const [dieticians,      setDieticians]      = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [fetchError,      setFetchError]      = useState('');
  const [search,          setSearch]          = useState('');
  const [sort,            setSort]            = useState('rating');
  const [selectedId,      setSelectedId]      = useState(null);
  const [detail,          setDetail]          = useState(null);
  const [detailLoading,   setDetailLoading]   = useState(false);
  const [showModal,       setShowModal]       = useState(false);
  const [requestModal,    setRequestModal]    = useState(false);
  const [requestNote,     setRequestNote]     = useState('');
  const [requestDuration, setRequestDuration] = useState('1M');
  const [requestLoading,  setRequestLoading]  = useState(false);
  const [requestSuccess,  setRequestSuccess]  = useState('');
  const [requestError,    setRequestError]    = useState('');
  const [featuredDetail,  setFeaturedDetail]  = useState(null);

  useEffect(() => {
    userService.getDieticians()
      .then(r => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.results || []);
        setDieticians(list);
        if (list.length > 0) {
          const idx = isoWeek() % list.length;
          userService.getDieticianDetail(list[idx].id)
            .then(dr => setFeaturedDetail(dr.data))
            .catch(() => setFeaturedDetail(list[idx]));
        }
      })
      .catch(err => setFetchError(err.response?.data?.detail || err.message || 'Diyetisyenler yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  /* open detail modal */
  const openDetail = async id => {
    setSelectedId(id); setShowModal(true); setDetailLoading(true); setDetail(null);
    try { const r = await userService.getDieticianDetail(id); setDetail(r.data); } catch (_) {}
    setDetailLoading(false);
  };

  /* open request modal (can be called from card or detail modal) */
  const openRequest = (id, e) => {
    e?.stopPropagation();
    setSelectedId(id); setRequestModal(true); setRequestError(''); setRequestNote(''); setShowModal(false);
  };

  const handleSendRequest = async () => {
    setRequestError(''); setRequestLoading(true);
    try {
      await dietService.createAssignment({ dietician: selectedId, client_note: requestNote, duration: requestDuration, assignment_type: 'Dietician' });
      setRequestSuccess('Başvurunuz diyetisyene iletildi!');
      setRequestModal(false); setRequestNote('');
    } catch (err) {
      const d = err.response?.data;
      setRequestError(typeof d === 'string' ? d : d?.non_field_errors?.[0] || 'Hata oluştu.');
    } finally { setRequestLoading(false); }
  };

  const handleMessage = async id => {
    try { await chatService.getOrCreateRoom(id); navigate('/client/messages'); } catch (_) {}
  };

  /* filtered + sorted list */
  let list = dieticians;
  if (search.trim()) {
    const s = search.toLowerCase();
    list = list.filter(d =>
      `${d.first_name} ${d.last_name}`.toLowerCase().includes(s) ||
      titleLabel(d.title).toLowerCase().includes(s)
    );
  }
  if (sort === 'rating')     list = [...list].sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
  if (sort === 'price-asc')  list = [...list].sort((a, b) => (a.monthly_price || 0) - (b.monthly_price || 0));
  if (sort === 'price-desc') list = [...list].sort((a, b) => (b.monthly_price || 0) - (a.monthly_price || 0));

  const featuredDietician = dieticians.length > 0 ? dieticians[isoWeek() % dieticians.length] : null;
  const featured = featuredDetail || featuredDietician;

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:240 }}>
      <div className="spinner"/>
    </div>
  );

  return (
    <>
      <style>{DYT_CSS}</style>
      <div className="dyt-body">

        {/* ── Hero ── */}
        <div className="dyt-hero">
          <div className="dyt-hero-text">
            <span className="dyt-eyebrow"><span className="dyt-eyebrow-dot"/>Onaylı Uzmanlar</span>
            <h1 className="dyt-title">Sana uygun <em>diyetisyeni</em> bul.</h1>
            <p className="dyt-lede">Tüm diyetisyenlerimiz lisanslı ve onaylanmıştır. Profilini incele, danışan ol.</p>
          </div>
          {dieticians.length > 0 && (
            <div className="dyt-hero-stats">
              <div className="dyt-hero-stat">
                <strong>{dieticians.length}</strong>
                <span>UZMAN</span>
              </div>
              <div className="dyt-hero-stat">
                <strong>{(dieticians.reduce((s, d) => s + (d.average_rating || 0), 0) / dieticians.length).toFixed(1)}</strong>
                <span>ORT. PUAN</span>
              </div>
            </div>
          )}
        </div>

        {fetchError && <div className="alert alert-error" style={{ marginBottom:20 }}>{fetchError}</div>}
        {requestSuccess && <div className="alert alert-success" style={{ marginBottom:20 }}>{requestSuccess}</div>}

        {/* ── Haftanın Uzmanı ── */}
        {featured && !search.trim() && (
          <article className="dyt-featured">
            <div className="dyt-featured-left">
              <Avatar d={featured} size={100} border={4} colorIdx={dieticians.indexOf(featuredDietician)} style={{ flexShrink:0 }}/>
              <div className="dyt-featured-text">
                <span className="dyt-featured-badge"><Icons.Star size={11}/> HAFTANIN UZMANI</span>
                <h2 className="dyt-featured-name">
                  Dyt. {featured.first_name} <em>{featured.last_name}</em>
                </h2>
                <p className="dyt-featured-title">{titleLabel(featured.title)}</p>
                <div className="dyt-featured-rating">
                  <Stars value={featured.average_rating || 0}/>
                  <span>{featured.average_rating?.toFixed(1) || '—'}</span>
                  <span style={{ color:'var(--ink-mute)', fontSize:12 }}>({featured.review_count || 0} yorum)</span>
                </div>
                {featured.biography && (
                  <p className="dyt-featured-bio">{featured.biography}</p>
                )}
              </div>
            </div>
            <div className="dyt-featured-right">
              {featured.monthly_price && (
                <div className="dyt-featured-price">
                  <span className="dyt-featured-price-num">₺ {featured.monthly_price}</span>
                  <span className="dyt-featured-price-lbl">/ AYLIK</span>
                </div>
              )}
              <button className="dyt-featured-cta" onClick={() => openRequest(featured.id)}>
                <Icons.Heart size={14}/> Danışan Ol
              </button>
              <button className="dyt-featured-ghost" onClick={() => openDetail(featured.id)}>
                Profili Gör
              </button>
            </div>
          </article>
        )}

        {/* ── Toolbar ── */}
        <div className="dyt-toolbar">
          <div className="dyt-search">
            <Icons.Search size={15}/>
            <input
              placeholder="İsim veya uzmanlık ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="dyt-sort" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="rating">En yüksek puan</option>
            <option value="price-asc">Ücret (artan)</option>
            <option value="price-desc">Ücret (azalan)</option>
          </select>
        </div>

        {/* ── Grid ── */}
        {list.length === 0 ? (
          <div className="dyt-empty">
            <span className="dyt-empty-icon"><Icons.Search size={26}/></span>
            <span className="dyt-empty-title">Sonuç bulunamadı</span>
            <span className="dyt-empty-sub">Aramanızla eşleşen diyetisyen yok.</span>
          </div>
        ) : (
          <div className="dyt-grid">
            {list.map((d, i) => (
              <motion.article key={d.id} className="dyt-card"
                whileHover={{ y: -4, boxShadow: '0 24px 60px -20px rgba(26,37,22,.18)' }}
                onClick={() => openDetail(d.id)}>
                <div className="dyt-card-body">
                  {/* avatar */}
                  <Avatar d={d} size={72} border={4} colorIdx={i}/>
                  {/* name + title */}
                  <div className="dyt-card-head">
                    <div className="dyt-card-name">Dyt. {d.first_name} {d.last_name}</div>
                    <div className="dyt-card-spec">{titleLabel(d.title).toUpperCase()}</div>
                  </div>
                  {/* rating */}
                  <div className="dyt-card-rating">
                    <Stars value={d.average_rating || 0}/>
                    <span className="dyt-card-rating-num">{(d.average_rating || 0).toFixed(1)}</span>
                    <span className="dyt-card-rating-count">({d.review_count || 0})</span>
                  </div>
                  {/* bio (available after backend adds biography to list serializer) */}
                  {d.biography && (
                    <p className="dyt-card-bio">{d.biography}</p>
                  )}
                  {/* footer */}
                  <div className="dyt-card-foot">
                    {d.monthly_price ? (
                      <div className="dyt-card-price">
                        <span className="dyt-card-price-num">₺ {d.monthly_price}</span>
                        <span className="dyt-card-price-lbl">/ AYLIK</span>
                      </div>
                    ) : <div style={{ flex:1 }}/>}
                    <button className="dyt-cta-btn"
                      onClick={e => openRequest(d.id, e)}>
                      Danışan Ol
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* ── Detail Modal ── */}
        <AnimatePresence>
          {showModal && (
            <motion.div className="dyt-overlay"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setShowModal(false)}>
              <motion.div className="dyt-modal"
                initial={{ scale:0.92, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.92, y:20 }}
                onClick={e => e.stopPropagation()}>
                <button className="dyt-modal-close" onClick={() => setShowModal(false)}>✕</button>
                {detailLoading ? (
                  <div style={{ textAlign:'center', padding:60 }}><div className="spinner" style={{ margin:'0 auto' }}/></div>
                ) : detail ? (
                  <>
                    <div className="dyt-modal-cover" style={{ background: COVER_COLORS[dieticians.findIndex(x => x.id === detail.id) % COVER_COLORS.length] }}>
                      <Avatar d={detail} size={80} border={4}
                        colorIdx={dieticians.findIndex(x => x.id === detail.id)}
                        style={{ position:'absolute', bottom:-40, left:28 }}/>
                    </div>
                    <div className="dyt-modal-body">
                      <h2 className="dyt-modal-name">Dyt. {detail.first_name} {detail.last_name}</h2>
                      <div className="dyt-modal-spec">{titleLabel(detail.title)}</div>
                      <div className="dyt-card-rating" style={{ marginTop:6 }}>
                        <Stars value={detail.average_rating || 0}/>
                        <span className="dyt-card-rating-num">{(detail.average_rating || 0).toFixed(1)}</span>
                        <span className="dyt-card-rating-count">({detail.review_count || 0} yorum)</span>
                      </div>
                      {detail.biography && (
                        <p className="dyt-modal-bio">{detail.biography}</p>
                      )}
                      {detail.reviews?.length > 0 && (
                        <div className="dyt-modal-reviews">
                          <div className="dyt-modal-reviews-title">Yorumlar</div>
                          {detail.reviews.slice(0, 3).map(r => (
                            <div key={r.id} className="dyt-modal-review">
                              <div className="dyt-modal-review-name">{r.client_name}</div>
                              <Stars value={r.raiting || 0} size={11}/>
                              <p className="dyt-modal-review-text">{r.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="dyt-modal-actions">
                        <button className="dyt-cta-btn" style={{ flex:1, justifyContent:'center' }}
                          onClick={() => openRequest(detail.id)}>
                          Danışan Ol
                        </button>
                        <button className="dyt-ghost-btn" style={{ flex:1, justifyContent:'center' }}
                          onClick={() => handleMessage(detail.id)}>
                          Mesaj Gönder
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Request Modal ── */}
        <AnimatePresence>
          {requestModal && (
            <motion.div className="dyt-overlay"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ zIndex:201 }}
              onClick={() => setRequestModal(false)}>
              <motion.div className="dyt-modal" style={{ maxWidth:420 }}
                initial={{ scale:0.92 }} animate={{ scale:1 }} exit={{ scale:0.92 }}
                onClick={e => e.stopPropagation()}>
                <button className="dyt-modal-close" onClick={() => setRequestModal(false)}>✕</button>
                <div style={{ padding:'32px 28px 28px' }}>
                  <h3 style={{ fontFamily:'var(--serif)', fontSize:24, color:'var(--ink)', marginBottom:20, fontWeight:400 }}>Danışmanlık Talebi</h3>
                  {requestError && <div className="alert alert-error" style={{ marginBottom:14 }}>{requestError}</div>}
                  <div className="form-group" style={{ marginBottom:14 }}>
                    <label className="form-label">Danışmanlık Süresi</label>
                    <select className="form-select" value={requestDuration} onChange={e => setRequestDuration(e.target.value)}>
                      <option value="1M">1 Ay</option>
                      <option value="3M">3 Ay</option>
                      <option value="6M">6 Ay</option>
                      <option value="12M">12 Ay</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom:20 }}>
                    <label className="form-label">Notunuz (isteğe bağlı)</label>
                    <textarea className="form-input" rows={3}
                      placeholder="Hedeflerinizi ve beklentilerinizi yazın..."
                      value={requestNote} onChange={e => setRequestNote(e.target.value)}
                      style={{ resize:'vertical' }}/>
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button className="dyt-ghost-btn" style={{ flex:1, justifyContent:'center' }} onClick={() => setRequestModal(false)}>İptal</button>
                    <button className="dyt-cta-btn" style={{ flex:2, justifyContent:'center' }} onClick={handleSendRequest} disabled={requestLoading}>
                      {requestLoading ? <span className="spinner-sm"/> : 'Talep Gönder'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

const DYT_CSS = `
  .dyt-body { padding:32px 36px 80px; max-width:1280px; --r-sm:10px; --r-md:16px; --r-lg:24px; --r-pill:999px; }

  /* Hero */
  .dyt-hero { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:28px; flex-wrap:wrap; }
  .dyt-hero-text { display:flex; flex-direction:column; gap:10px; max-width:720px; }
  .dyt-eyebrow { display:inline-flex; align-items:center; gap:8px; font-family:var(--mono); font-size:11px; text-transform:uppercase; letter-spacing:0.14em; color:var(--accent-deep); }
  .dyt-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); }
  .dyt-title { font-family:var(--serif); font-size:clamp(40px,4.4vw,60px); line-height:1.02; letter-spacing:-0.025em; color:var(--ink); margin-top:4px; font-weight:400; }
  .dyt-title em { font-style:italic; color:var(--accent-deep); }
  .dyt-lede { font-size:15px; color:var(--ink-soft); line-height:1.55; max-width:540px; }
  .dyt-hero-stats { display:flex; gap:24px; padding:16px 22px; background:#fff; border:1px solid var(--line); border-radius:var(--r-md); flex-shrink:0; }
  .dyt-hero-stat { display:flex; flex-direction:column; gap:2px; }
  .dyt-hero-stat strong { font-size:24px; font-family:var(--serif); color:var(--ink); letter-spacing:-0.015em; line-height:1; }
  .dyt-hero-stat span { font-size:11px; color:var(--ink-mute); font-family:var(--mono); letter-spacing:0.06em; }

  /* Featured */
  .dyt-featured {
    background:linear-gradient(135deg,#1A2516 0%,#2A3624 100%);
    border-radius:var(--r-lg); padding:28px 32px;
    margin-bottom:24px;
    display:flex; align-items:center; gap:28px; justify-content:space-between; flex-wrap:wrap;
    position:relative; overflow:hidden;
  }
  .dyt-featured::before { content:""; position:absolute; right:-80px; top:-80px; width:280px; height:280px; border-radius:50%; background:radial-gradient(circle,rgba(101,163,13,0.35),transparent 70%); pointer-events:none; }
  .dyt-featured-left { display:flex; align-items:center; gap:20px; flex:1; min-width:0; position:relative; z-index:1; }
  .dyt-featured-text { display:flex; flex-direction:column; gap:6px; min-width:0; }
  .dyt-featured-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 10px; border-radius:var(--r-pill); background:rgba(101,163,13,0.18); color:var(--accent); font-family:var(--mono); font-size:10px; letter-spacing:0.12em; align-self:flex-start; }
  .dyt-featured-name { font-size:clamp(22px,2.8vw,32px); font-family:var(--serif); color:#FBFAF5; line-height:1.05; letter-spacing:-0.02em; font-weight:400; }
  .dyt-featured-name em { font-style:italic; color:var(--accent); }
  .dyt-featured-title { font-size:12px; color:rgba(251,250,245,0.6); font-family:var(--mono); letter-spacing:0.08em; }
  .dyt-featured-rating { display:flex; align-items:center; gap:8px; font-size:13px; color:#FBFAF5; }
  .dyt-featured-bio { font-size:13px; color:rgba(251,250,245,0.7); line-height:1.55; max-width:480px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .dyt-featured-right { display:flex; flex-direction:column; gap:10px; align-items:flex-start; flex-shrink:0; position:relative; z-index:1; }
  .dyt-featured-price { display:flex; flex-direction:column; gap:2px; }
  .dyt-featured-price-num { font-size:22px; font-family:var(--serif); color:#FBFAF5; letter-spacing:-0.01em; }
  .dyt-featured-price-lbl { font-size:10px; color:rgba(251,250,245,0.5); font-family:var(--mono); letter-spacing:0.08em; }
  .dyt-featured-cta { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; border-radius:var(--r-pill); background:var(--accent); color:#fff; font-size:14px; font-weight:600; border:none; cursor:pointer; transition:all .25s; white-space:nowrap; }
  .dyt-featured-cta:hover { background:var(--accent-deep); transform:translateY(-1px); }
  .dyt-featured-ghost { display:inline-flex; align-items:center; justify-content:center; padding:10px 20px; border-radius:var(--r-pill); background:rgba(255,255,255,0.08); color:#FBFAF5; font-size:13px; font-weight:500; border:1px solid rgba(255,255,255,0.14); cursor:pointer; transition:all .2s; white-space:nowrap; }
  .dyt-featured-ghost:hover { background:rgba(255,255,255,0.14); }

  /* Toolbar */
  .dyt-toolbar { display:grid; grid-template-columns:1fr auto; gap:12px; background:#fff; border:1px solid var(--line); border-radius:var(--r-lg); padding:14px 18px; margin-bottom:20px; align-items:center; }
  .dyt-search { display:flex; align-items:center; gap:10px; padding:8px 14px; border-radius:var(--r-pill); background:var(--bg-warm); transition:all .2s; }
  .dyt-search:focus-within { background:#fff; box-shadow:0 0 0 1px var(--accent),0 0 0 4px rgba(101,163,13,0.1); }
  .dyt-search svg { color:var(--ink-mute); flex-shrink:0; }
  .dyt-search input { flex:1; background:transparent; border:0; outline:0; font-family:var(--sans); font-size:14px; color:var(--ink); }
  .dyt-search input::placeholder { color:var(--ink-mute); }
  .dyt-sort { padding:9px 14px; border-radius:var(--r-pill); background:var(--bg-warm); border:1px solid var(--line); font-size:13px; font-weight:500; color:var(--ink-soft); cursor:pointer; outline:none; }

  /* Grid */
  .dyt-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .dyt-card { background:#fff; border:1px solid var(--line); border-radius:var(--r-lg); overflow:hidden; display:flex; flex-direction:column; cursor:pointer; transition:border-color .2s; }
  .dyt-card-body { padding:24px; display:flex; flex-direction:column; gap:12px; flex:1; }
  .dyt-card-head { display:flex; flex-direction:column; gap:3px; }
  .dyt-card-name { font-size:20px; font-family:var(--serif); color:var(--ink); letter-spacing:-0.015em; line-height:1.1; font-weight:400; }
  .dyt-card-spec { font-size:11px; color:var(--accent-deep); font-weight:600; font-family:var(--mono); letter-spacing:0.06em; }
  .dyt-card-rating { display:flex; align-items:center; gap:6px; font-size:13px; }
  .dyt-card-rating-num { font-weight:600; color:var(--ink); }
  .dyt-card-rating-count { color:var(--ink-mute); font-family:var(--mono); font-size:11px; }
  .dyt-card-bio { font-size:13px; color:var(--ink-soft); line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .dyt-card-foot { display:flex; align-items:center; gap:8px; margin-top:auto; padding-top:8px; border-top:1px solid var(--line-soft); }
  .dyt-card-price { display:flex; flex-direction:column; gap:0; flex:1; }
  .dyt-card-price-num { font-size:17px; font-family:var(--serif); color:var(--ink); letter-spacing:-0.01em; line-height:1; }
  .dyt-card-price-lbl { font-size:10px; color:var(--ink-mute); font-family:var(--mono); letter-spacing:0.04em; }

  /* Buttons */
  .dyt-cta-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 16px; border-radius:var(--r-pill); background:var(--ink); color:#FBFAF5; font-size:13px; font-weight:600; border:none; cursor:pointer; transition:all .2s; white-space:nowrap; }
  .dyt-cta-btn:hover { background:var(--accent-deep); }
  .dyt-cta-btn:disabled { opacity:.5; cursor:not-allowed; }
  .dyt-ghost-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 16px; border-radius:var(--r-pill); background:transparent; color:var(--ink-soft); font-size:13px; font-weight:500; border:1px solid var(--line); cursor:pointer; transition:all .2s; white-space:nowrap; }
  .dyt-ghost-btn:hover { border-color:var(--ink-soft); color:var(--ink); background:var(--bg-warm); }

  /* Empty */
  .dyt-empty { background:var(--bg-warm); border:1px dashed var(--line); border-radius:var(--r-lg); padding:60px 24px; display:flex; flex-direction:column; align-items:center; gap:12px; text-align:center; }
  .dyt-empty-icon { width:64px; height:64px; border-radius:50%; background:#fff; border:1px solid var(--line); color:var(--ink-mute); display:inline-flex; align-items:center; justify-content:center; }
  .dyt-empty-title { font-size:20px; font-family:var(--serif); color:var(--ink); font-weight:400; }
  .dyt-empty-sub { font-size:13px; color:var(--ink-mute); max-width:340px; line-height:1.5; }

  /* Overlay + Modal */
  .dyt-overlay { position:fixed; inset:0; background:rgba(14,31,14,0.6); backdrop-filter:blur(4px); z-index:200; display:flex; align-items:center; justify-content:center; padding:24px; }
  .dyt-modal { background:#fff; border-radius:var(--r-lg); width:100%; max-width:520px; max-height:88vh; overflow-y:auto; box-shadow:0 24px 60px -20px rgba(26,37,22,.25); position:relative; }
  .dyt-modal-close { position:absolute; top:14px; right:16px; background:rgba(247,238,216,0.9); border:none; border-radius:8px; padding:6px 10px; cursor:pointer; font-size:14px; color:var(--ink-soft); z-index:2; transition:all .2s; }
  .dyt-modal-close:hover { background:var(--parchment-dark); color:var(--ink); }
  .dyt-modal-cover { height:100px; position:relative; border-radius:var(--r-lg) var(--r-lg) 0 0; overflow:hidden; }
  .dyt-modal-body { padding:52px 28px 28px; display:flex; flex-direction:column; gap:12px; }
  .dyt-modal-name { font-family:var(--serif); font-size:26px; color:var(--ink); letter-spacing:-0.015em; font-weight:400; }
  .dyt-modal-spec { font-size:13px; color:var(--accent-deep); font-weight:600; font-family:var(--mono); }
  .dyt-modal-bio { font-size:14px; color:var(--ink-soft); line-height:1.65; background:var(--bg-warm); border-radius:12px; padding:14px 16px; }
  .dyt-modal-reviews { display:flex; flex-direction:column; gap:8px; }
  .dyt-modal-reviews-title { font-size:12px; font-weight:700; color:var(--ink); font-family:var(--mono); letter-spacing:0.08em; text-transform:uppercase; }
  .dyt-modal-review { background:var(--bg-warm); border-radius:10px; padding:10px 14px; display:flex; flex-direction:column; gap:4px; }
  .dyt-modal-review-name { font-size:12px; font-weight:600; color:var(--accent-deep); }
  .dyt-modal-review-text { font-size:13px; color:var(--ink-soft); line-height:1.5; margin:4px 0 0; }
  .dyt-modal-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:6px; }

  @media (max-width:1100px) { .dyt-grid { grid-template-columns:repeat(2,1fr); } .dyt-toolbar { grid-template-columns:1fr; } .dyt-featured { flex-direction:column; } }
  @media (max-width:760px) { .dyt-body { padding:20px; } .dyt-grid { grid-template-columns:1fr; } }
`;
