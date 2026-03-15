import { useState, useEffect } from "react";
import { Link }                from "react-router-dom";
import { useAuth }             from "../context/AuthContext";
import { apiFetch }            from "../services/api";
import { toast }               from "react-toastify";

/* ── Login-required popup shown when guest clicks Contact ── */
function LoginRequired({ onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center animate-scaleIn">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Sign in to Connect</h3>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Please sign in to send an inquiry and connect with our verified interior designers.
        </p>
        <div className="flex gap-3">
          <Link to="/login" onClick={onClose}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition shadow-md shadow-purple-200">
            Sign In
          </Link>
          <Link to="/register" onClick={onClose}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-sm transition">
            Register Free
          </Link>
        </div>
        <button onClick={onClose} className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition">
          Continue browsing
        </button>
      </div>
    </div>
  );
}

/* ── Builder card with portfolio viewer ── */
function BuilderCard({ b, selected, onSelect }) {
  const [showPortfolio, setShowPortfolio] = useState(false);
  const initials  = b.avatar || (b.name||"B").split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
  const portfolio = b.portfolioImages || [];

  return (
    <div className={`rounded-2xl border-2 transition-all ${selected?.id===b.id?"border-purple-500 bg-purple-50":"border-gray-200 hover:border-purple-300 bg-white"}`}>
      {/* Card header — click to select */}
      <div className="p-4 cursor-pointer" onClick={() => onSelect(b)}>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0 text-sm"
            style={{ background: b.color || "#7c3aed" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1 flex-wrap">
              <p className="font-bold text-gray-900 text-sm">{b.name}</p>
              {b.rating && <span className="text-xs text-amber-500 font-bold">★ {Number(b.rating).toFixed(1)}</span>}
            </div>
            <p className="text-xs text-purple-600 font-semibold mt-0.5">{b.title}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{b.bio}</p>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
              {b.location  && <span>📍 {b.location}</span>}
              {b.experience && <span>· {b.experience}</span>}
            </div>
            {b.price && <p className="text-xs font-semibold text-purple-600 mt-1">{b.price}</p>}
          </div>
        </div>
        {selected?.id===b.id && b.specialties?.length>0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-1.5">
            {b.specialties.map(s=>(
              <span key={s} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg border border-purple-200">{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Portfolio toggle */}
      {portfolio.length > 0 && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-2">
          <button
            onClick={e => { e.stopPropagation(); setShowPortfolio(v => !v); }}
            className="text-xs text-purple-600 font-semibold hover:underline flex items-center gap-1">
            {showPortfolio ? "▲ Hide" : "▼ View"} portfolio ({portfolio.length} photo{portfolio.length!==1?"s":""})
          </button>
          {showPortfolio && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {portfolio.map((img, i) => (
                <img key={i} src={img.url} alt={`work ${i+1}`}
                  className="w-full h-20 object-cover rounded-xl border border-gray-200"
                  onError={e=>{e.target.onerror=null;e.target.src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=200&q=60";}}/>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Inquiry form ── */
function InquiryForm({ builder, originalImage, generatedImage, onClose }) {
  const { user } = useAuth();
  const [form,    setForm]    = useState({ name:user?.name||"", email:user?.email||"", phone:user?.phone||"", budget:"", timeline:"", message:"" });
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const inp = "w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition";

  const submit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) { toast.error("Please write a message"); return; }
    setSending(true);
    try {
      await apiFetch("/api/inquiries", {
        method: "POST",
        body: JSON.stringify({
          builderId: builder.id, builderName: builder.name, style: builder.styles?.[0]||"",
          userEmail: form.email, userName: form.name, userPhone: form.phone,
          budget: form.budget, timeline: form.timeline, message: form.message,
          originalImageUrl: originalImage||"", generatedImageUrl: generatedImage||"",
        }),
      });
      setSent(true);
      toast.success(`Inquiry sent to ${builder.name}!`);
    } catch { toast.error("Failed to send inquiry."); }
    finally { setSending(false); }
  };

  if (sent) return (
    <div className="text-center py-10">
      <div className="text-5xl mb-4">🎉</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Inquiry Sent!</h3>
      <p className="text-gray-500 text-sm mb-1"><strong className="text-purple-600">{builder.name}</strong> will contact you within 24 hours.</p>
      <button onClick={onClose} className="mt-5 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90">Done</button>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 text-sm" style={{background:builder.color||"#7c3aed"}}>
          {builder.avatar||builder.name?.[0]||"B"}
        </div>
        <div className="flex-1">
          <p className="text-gray-900 font-bold text-sm">{builder.name}</p>
          <p className="text-gray-500 text-xs">{builder.title}</p>
        </div>
      </div>

      {(originalImage||generatedImage) && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Your design (shared with builder)</p>
          <div className="flex gap-2">
            {originalImage && (
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1 text-center">Before</p>
                <img src={originalImage} alt="Before" className="w-full h-24 object-cover rounded-xl border border-gray-200" onError={e=>{e.target.style.display="none";}}/>
              </div>
            )}
            {generatedImage && (
              <div className="flex-1">
                <p className="text-xs text-purple-600 font-semibold mb-1 text-center">AI Design</p>
                <img src={generatedImage} alt="AI Design" className="w-full h-24 object-cover rounded-xl border-2 border-purple-300" onError={e=>{e.target.style.display="none";}}/>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Your Name"  value={form.name}  onChange={set("name")}  required className={`${inp} col-span-2`}/>
        <input type="email" placeholder="Email"  value={form.email}  onChange={set("email")}  required className={inp}/>
        <input type="tel"   placeholder="Phone"  value={form.phone}  onChange={set("phone")}  className={inp}/>
        <select value={form.budget} onChange={set("budget")} required className={inp}>
          <option value="">Budget range</option>
          <option>Under ₹50,000</option><option>₹50K – ₹1.5L</option><option>₹1.5L – ₹5L</option><option>₹5L – ₹15L</option><option>Above ₹15L</option>
        </select>
        <select value={form.timeline} onChange={set("timeline")} required className={inp}>
          <option value="">Timeline</option>
          <option>ASAP</option><option>1–3 months</option><option>3–6 months</option><option>6+ months</option>
        </select>
      </div>
      <textarea value={form.message} onChange={set("message")} rows={3} required
        placeholder="Describe your project — rooms, requirements, what you love about this design..."
        className={`${inp} resize-none`}/>
      <button type="submit" disabled={sending}
        className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-60 shadow-lg shadow-purple-200">
        {sending?"Sending...":`Send Inquiry to ${builder.name} →`}
      </button>
    </form>
  );
}

/* ── Main export ── */
export default function BuilderModal({ style, originalImage, generatedImage, onClose }) {
  const { isLoggedIn }              = useAuth();
  const [builders,   setBuilders]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [showLogin,  setShowLogin]  = useState(false);

  useEffect(() => {
    apiFetch("/api/builders")
      .then(data => {
        const matched = style ? data.filter(b=>b.styles?.includes(style)) : data;
        const rest    = style ? data.filter(b=>!b.styles?.includes(style)) : [];
        setBuilders([...matched, ...rest]);
      })
      .catch(() => toast.error("Failed to load builders"))
      .finally(() => setLoading(false));
  }, [style]);

  const handleContactClick = () => {
    if (!isLoggedIn) { setShowLogin(true); return; }
    setShowForm(true);
  };

  if (showLogin) return <LoginRequired onClose={() => { setShowLogin(false); onClose(); }}/>;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white border border-gray-200 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto animate-scaleIn">

        <div className="sticky top-0 bg-white border-b border-gray-200 px-7 py-5 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{showForm?"Send Inquiry":"Connect with a Designer"}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {loading?"Loading...":showForm?`Contacting ${selected?.name}`:`${builders.length} designer${builders.length!==1?"s":""} available`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showForm && <button onClick={()=>setShowForm(false)} className="text-xs text-purple-600 font-semibold hover:underline">← Back</button>}
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-purple-100 flex items-center justify-center text-gray-500 hover:text-purple-600 text-sm transition">✕</button>
          </div>
        </div>

        <div className="px-7 py-6">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"/></div>
          ) : !showForm ? (
            <>
              {builders.length===0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm font-medium">No designers available yet.</p>
                  <p className="text-xs mt-1">Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-3 mb-5">
                  {style && builders.some(b=>b.styles?.includes(style)) && (
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Best matches for "{style}" style</p>
                  )}
                  {builders.map(b => <BuilderCard key={b.id} b={b} selected={selected} onSelect={setSelected}/>)}
                </div>
              )}
              {selected && (
                <button onClick={handleContactClick}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition shadow-lg shadow-purple-200">
                  {isLoggedIn ? `Contact ${selected.name} →` : `🔒 Sign in to Contact ${selected.name}`}
                </button>
              )}
            </>
          ) : (
            <InquiryForm builder={selected} originalImage={originalImage} generatedImage={generatedImage} onClose={onClose}/>
          )}
        </div>
      </div>
    </div>
  );
}
