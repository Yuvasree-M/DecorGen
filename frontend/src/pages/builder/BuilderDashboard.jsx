import { useState, useEffect, useRef } from "react";
import { useAuth }                      from "../../context/AuthContext";
import { apiFetch, apiUpload }          from "../../services/api";
import { toast }                        from "react-toastify";

const STATUS_BADGE = {
  new:     "bg-amber-100 text-amber-700 border border-amber-300",
  replied: "bg-purple-100 text-purple-700 border border-purple-300",
  closed:  "bg-gray-100 text-gray-500 border border-gray-300",
};
const STYLES = ["modern","traditional","minimal","aesthetic","luxury","bohemian"];

const Img = ({src,alt,cls}) => (
  <img src={src} alt={alt} className={cls}
    onError={e=>{e.target.onerror=null;e.target.src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=60";}}/>
);

/* ── Inline chat inside an inquiry card ── */
function InquiryChat({ inq, onReload }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef          = useRef(null);
  const msgs            = Array.isArray(inq.messages) ? inq.messages : [];
  const closed          = inq.status === "closed";

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs.length]);

  const send = async () => {
    if (!text.trim() || busy || closed) return;
    setBusy(true);
    try {
      await apiFetch(`/api/inquiries/${inq.id}/message`, {
        method:"POST", body:JSON.stringify({ text:text.trim(), senderRole:"builder" })
      });
      setText(""); onReload();
    } catch { toast.error("Failed to send"); }
    finally { setBusy(false); }
  };

  return (
    <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
      {/* Both design images */}
      {(inq.originalImageUrl || inq.generatedImageUrl) && (
        <div className="flex gap-2">
          {inq.originalImageUrl && (
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1 text-center">Original Room</p>
              <Img src={inq.originalImageUrl} alt="Before" cls="w-full h-24 object-cover rounded-xl border border-gray-200"/>
            </div>
          )}
          {inq.generatedImageUrl && (
            <div className="flex-1">
              <p className="text-xs text-purple-600 font-semibold mb-1 text-center">AI Design</p>
              <Img src={inq.generatedImageUrl} alt="AI Design" cls="w-full h-24 object-cover rounded-xl border-2 border-purple-300"/>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {msgs.length===0 && <p className="text-xs text-center text-gray-400 py-2">No messages yet.</p>}
        {msgs.map((m,i) => {
          const mine = m.sender === "builder";
          return (
            <div key={i} className={`flex ${mine?"justify-end":"justify-start"}`}>
              <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm ${mine?"bg-blue-600 text-white rounded-br-sm":"bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                <p className="leading-snug">{m.text}</p>
                <p className={`text-xs mt-0.5 ${mine?"text-blue-200":"text-gray-400"}`}>
                  {mine?"You":inq.userName||"User"} · {m.sentAt?new Date(m.sentAt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}):""}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      {!closed ? (
        <div className="flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Reply to client... (Enter to send)"
            className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition"/>
          <button onClick={send} disabled={busy||!text.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-40">
            {busy?"…":"Send"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-center text-gray-400 bg-gray-50 rounded-xl py-2">This inquiry is closed.</p>
      )}
    </div>
  );
}

/* ── Portfolio manager tab ── */
function PortfolioTab({ profile, onProfileUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState(null);
  const fileRef                   = useRef(null);
  const portfolio                 = profile?.portfolioImages || [];

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (portfolio.length >= 12) { toast.error("Max 12 portfolio images"); return; }
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("image", file);
      const data = await apiUpload("/api/builders/my/portfolio", fd);
      onProfileUpdate({ ...profile, portfolioImages: [...portfolio, data.image] });
      toast.success("Image uploaded!");
    } catch (err) { toast.error(err.message || "Upload failed"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const handleDelete = async (publicId) => {
    if (!window.confirm("Delete this portfolio image?")) return;
    setDeleting(publicId);
    try {
      await apiFetch(`/api/builders/my/portfolio/${encodeURIComponent(publicId)}`, { method:"DELETE" });
      onProfileUpdate({ ...profile, portfolioImages: portfolio.filter(img => img.publicId !== publicId) });
      toast.success("Image deleted");
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(null); }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Portfolio Images</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add photos of your previous work — clients see these when choosing a designer. ({portfolio.length}/12 used)
          </p>
        </div>
        {portfolio.length < 12 && (
          <>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload}/>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-md shadow-purple-200">
              {uploading ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Uploading...</>
              ) : "+ Add Photo"}
            </button>
          </>
        )}
      </div>

      {portfolio.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-3">🖼️</div>
          <p className="font-semibold text-gray-600 mb-1">No portfolio photos yet</p>
          <p className="text-sm text-gray-400 mb-4">Add photos of your previous work to attract more clients</p>
          <>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload}/>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50">
              {uploading ? "Uploading..." : "Upload First Photo"}
            </button>
          </>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {portfolio.map(img => (
            <div key={img.publicId} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <Img src={img.url} alt="portfolio" cls="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
              {/* Delete overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center">
                <button onClick={() => handleDelete(img.publicId)} disabled={deleting===img.publicId}
                  className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-60 shadow-lg">
                  {deleting===img.publicId ? "Deleting…" : "🗑 Delete"}
                </button>
              </div>
            </div>
          ))}
          {portfolio.length < 12 && (
            <>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload}/>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="aspect-square border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-purple-600 transition disabled:opacity-50 text-sm font-medium">
                {uploading ? (
                  <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                ) : <><span className="text-3xl">+</span><span>Add</span></>}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Profile form ── */
function ProfileForm({ profile, onSaved }) {
  const [form, setForm] = useState({
    name: profile?.name||"", title: profile?.title||"", bio: profile?.bio||"",
    location: profile?.location||"", experience: profile?.experience||"",
    price: profile?.price||"", phone: profile?.phone||"",
    styles: profile?.styles||[],
    specialties: Array.isArray(profile?.specialties) ? profile.specialties.join(", ") : (profile?.specialties||""),
  });
  const [loading, setLoading] = useState(false);
  const set    = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const toggle = s => setForm(p=>({ ...p, styles: p.styles.includes(s)?p.styles.filter(x=>x!==s):[...p.styles,s] }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()||!form.title.trim()||!form.bio.trim()) { toast.error("Name, title and bio required"); return; }
    if (!form.styles.length) { toast.error("Select at least one style"); return; }
    setLoading(true);
    try {
      const saved = await apiFetch("/api/builders/my", {
        method:"POST",
        body: JSON.stringify({ ...form, specialties: form.specialties.split(",").map(s=>s.trim()).filter(Boolean) }),
      });
      toast.success(profile ? "Profile updated!" : "Profile created! You're now live.");
      onSaved(saved);
    } catch (err) { toast.error(err.message||"Save failed"); }
    finally { setLoading(false); }
  };

  const inp = "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition";

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        {[["name","Full Name *","e.g. Arjun Mehta"],["title","Professional Title *","e.g. Modern & Minimalist Specialist"],
          ["location","Location","e.g. Mumbai, India"],["experience","Experience","e.g. 8 years"],
          ["price","Price Range","e.g. ₹85K–₹3.5L"],["phone","Phone","e.g. 9876543210"]].map(([k,label,ph])=>(
          <div key={k}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
            <input value={form[k]} onChange={set(k)} required={label.includes("*")} placeholder={ph} className={inp}/>
          </div>
        ))}
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Bio *</label>
        <textarea value={form.bio} onChange={set("bio")} required rows={3} placeholder="Your experience, expertise and design philosophy..." className={`${inp} resize-none`}/>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Design Styles *</label>
        <div className="flex flex-wrap gap-2">
          {STYLES.map(s=>(
            <button key={s} type="button" onClick={()=>toggle(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition capitalize ${form.styles.includes(s)?"border-purple-500 bg-purple-50 text-purple-700":"border-gray-200 text-gray-500 hover:border-purple-300 bg-white"}`}>{s}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Specialties (comma separated)</label>
        <input value={form.specialties} onChange={set("specialties")} placeholder="e.g. Open floor plans, Italian marble, Smart storage" className={inp}/>
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-purple-200">
        {loading?"Saving...":(profile?"Update Profile":"Create Profile & Go Live ✓")}
      </button>
    </form>
  );
}

/* ── Main page ── */
export default function BuilderDashboard() {
  const { user, logout }             = useAuth();
  const [tab,       setTab]          = useState("inquiries");
  const [profile,   setProfile]      = useState(undefined);
  const [inquiries, setInquiries]    = useState([]);
  const [loading,   setLoading]      = useState(true);
  const [openChat,  setOpenChat]     = useState(null);

  const load = async () => {
    try {
      const [p,i] = await Promise.all([apiFetch("/api/builders/my"), apiFetch("/api/inquiries/builder")]);
      setProfile(p); setInquiries(i);
      if (!p) setTab("profile");
    } catch { toast.error("Failed to load"); setProfile(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleClose = async (id) => {
    try {
      await apiFetch(`/api/inquiries/${id}/status`, { method:"PATCH", body:JSON.stringify({status:"closed"}) });
      toast.success("Inquiry closed");
      setInquiries(prev=>prev.map(i=>i.id===id?{...i,status:"closed"}:i));
      if (openChat===id) setOpenChat(null);
    } catch { toast.error("Failed"); }
  };

  const fmtDate = ts => { if(!ts)return"—"; const d=ts._seconds?new Date(ts._seconds*1000):new Date(ts); return d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); };
  const newCount = inquiries.filter(i=>i.status==="new").length;

  const TABS = [
    { key:"inquiries", label:"Client Chats", badge: newCount||null },
    { key:"profile",   label:"My Profile" },
    { key:"portfolio", label:"Portfolio" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-sm shadow-purple-200">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" stroke="white" strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="white"/></svg>
            </div>
            <span className="font-extrabold text-gray-900 text-sm">Interior<span className="text-purple-600">AI</span></span>
          </a>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-500">Builder Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-gray-500">{user?.name||user?.email}</span>
          <span className="text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300 px-2.5 py-1 rounded-full">BUILDER</span>
          <button onClick={logout} className="text-sm text-red-500 hover:text-red-600 font-medium transition">Sign Out</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-1">Builder Dashboard 🏗️</h1>
        <p className="text-gray-500 mb-8">{profile?`Welcome back, ${profile.name}!`:"Set up your profile to start receiving client inquiries."}</p>

        {/* Status banners */}
        {!loading && !profile && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div><p className="font-bold text-amber-800">Profile not created yet</p><p className="text-amber-700 text-sm mt-0.5">Fill in your profile so clients can discover and contact you.</p></div>
          </div>
        )}
        {!loading && profile && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">{profile.avatar||profile.name?.[0]||"B"}</div>
            <div className="flex-1"><p className="font-bold text-green-800">{profile.name}</p><p className="text-green-700 text-sm">{profile.title}</p></div>
            <span className="text-xs font-bold bg-green-100 text-green-700 border border-green-300 px-2.5 py-1 rounded-full capitalize">{profile.status||"active"}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[["Total",inquiries.length,"border-purple-200 text-purple-700"],["New",newCount,"border-amber-200 text-amber-700"],["Replied",inquiries.filter(i=>i.status==="replied").length,"border-blue-200 text-blue-700"]].map(([l,v,c])=>(
            <div key={l} className={`bg-white rounded-2xl border p-5 text-center shadow-sm ${c}`}>
              <div className="text-3xl font-extrabold">{v}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{l} Inquiries</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1 w-fit mb-8">
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${tab===t.key?"bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow":"text-gray-500 hover:text-gray-800"}`}>
              {t.label}
              {t.badge && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{t.badge}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"/></div>
        ) : (
          <>
            {/* ── Inquiries ── */}
            {tab==="inquiries" && (
              <div className="space-y-4">
                {inquiries.length===0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 text-gray-400">
                    <div className="text-5xl mb-4">📬</div>
                    <p className="text-lg font-semibold text-gray-500 mb-1">No inquiries yet</p>
                    <p className="text-sm">{profile?"When users connect with you, their messages appear here.":"Create your profile first."}</p>
                    {!profile && <button onClick={()=>setTab("profile")} className="mt-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90">Create Profile →</button>}
                  </div>
                ) : inquiries.map(inq=>(
                  <div key={inq.id} className={`bg-white border rounded-2xl p-6 transition ${openChat===inq.id?"border-purple-400 shadow-md shadow-purple-100":"border-gray-200 hover:border-purple-300 hover:shadow-md hover:shadow-purple-100"}`}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900">{inq.userName||"Anonymous"}</p>
                          {inq.style&&<span className="text-xs bg-purple-100 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-full capitalize">{inq.style}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{inq.userEmail}{inq.userPhone&&` · ${inq.userPhone}`}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {inq.budget&&<span className="text-xs bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{inq.budget}</span>}
                          {inq.timeline&&<span className="text-xs bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{inq.timeline}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full capitalize ${STATUS_BADGE[inq.status]||STATUS_BADGE.new}`}>{inq.status}</span>
                        <p className="text-xs text-gray-400 mt-1">{fmtDate(inq.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {inq.status!=="closed"&&(
                        <button onClick={()=>setOpenChat(openChat===inq.id?null:inq.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${openChat===inq.id?"bg-purple-100 text-purple-700 border border-purple-200":"bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:opacity-90 shadow-sm shadow-purple-200"}`}>
                          {openChat===inq.id?"↑ Close Chat":"💬 Chat"}
                        </button>
                      )}
                      {inq.status!=="closed"&&<button onClick={()=>handleClose(inq.id)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-xl font-medium transition">Close</button>}
                      {inq.userEmail&&<a href={`mailto:${inq.userEmail}`} className="text-xs border border-gray-200 hover:border-purple-300 text-gray-500 hover:text-purple-600 px-3 py-1.5 rounded-xl font-medium transition">Email</a>}
                    </div>
                    {openChat===inq.id && <InquiryChat inq={inq} onReload={load}/>}
                  </div>
                ))}
              </div>
            )}

            {/* ── Profile ── */}
            {tab==="profile" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{profile?"Edit Your Profile":"Create Your Designer Profile"}</h2>
                <p className="text-sm text-gray-500 mb-6">{profile?"Update your info to keep your profile current.":"Once saved, your profile goes live and clients can find you."}</p>
                <ProfileForm profile={profile} onSaved={p=>{setProfile(p);setTab("portfolio");}}/>
              </div>
            )}

            {/* ── Portfolio ── */}
            {tab==="portfolio" && (
              !profile ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-400">
                  <div className="text-5xl mb-3">👤</div>
                  <p className="font-semibold text-gray-500 mb-1">Create your profile first</p>
                  <p className="text-sm">Then come back here to add portfolio photos.</p>
                  <button onClick={()=>setTab("profile")} className="mt-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90">Create Profile →</button>
                </div>
              ) : (
                <PortfolioTab profile={profile} onProfileUpdate={setProfile}/>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
