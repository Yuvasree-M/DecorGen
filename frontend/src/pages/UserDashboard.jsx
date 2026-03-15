import { useState, useEffect, useRef } from "react";
import { useAuth }                      from "../context/AuthContext";
import { apiFetch }                     from "../services/api";
import { toast }                        from "react-toastify";
import GeneratorModal                   from "../components/modals/GeneratorModal";

const STATUS_BADGE = {
  new:     "bg-amber-100 text-amber-700 border border-amber-300",
  replied: "bg-purple-100 text-purple-700 border border-purple-300",
  closed:  "bg-gray-100 text-gray-500 border border-gray-300",
};

/* fallback image */
const Img = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className}
    onError={e => {
      e.target.onerror = null;
      e.target.src = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=60";
    }}/>
);

function Stat({ icon, label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md hover:shadow-purple-100 transition">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-3xl font-extrabold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
    </div>
  );
}

/* ── Chat thread inside an inquiry card ── */
function InquiryChat({ inq, onClose, onReload }) {
  const { user } = useAuth();
  const [text,    setText]    = useState("");
  const [sending, setSending] = useState(false);
  const endRef                = useRef(null);

  const messages = Array.isArray(inq.messages) ? inq.messages : [];
  const isClosed = inq.status === "closed";

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = async () => {
    if (!text.trim() || sending || isClosed) return;
    setSending(true);
    try {
      await apiFetch(`/api/inquiries/${inq.id}/message`, {
        method: "POST",
        body: JSON.stringify({ text: text.trim(), senderRole: "user" }),
      });
      setText("");
      onReload();
    } catch { toast.error("Failed to send message"); }
    finally { setSending(false); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      {/* Design images */}
      {(inq.originalImageUrl || inq.generatedImageUrl) && (
        <div className="flex gap-2 mb-4">
          {inq.originalImageUrl && (
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1 text-center">Before</p>
              <Img src={inq.originalImageUrl} alt="Before"
                className="w-full h-24 object-cover rounded-xl border border-gray-200"/>
            </div>
          )}
          {inq.generatedImageUrl && (
            <div className="flex-1">
              <p className="text-xs text-purple-600 font-semibold mb-1 text-center">AI Design</p>
              <Img src={inq.generatedImageUrl} alt="AI Design"
                className="w-full h-24 object-cover rounded-xl border-2 border-purple-200"/>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1 mb-3">
        {messages.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">No messages yet.</p>
        )}
        {messages.map((m, i) => {
          const isMe = m.sender === "user";
          return (
            <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                isMe
                  ? "bg-purple-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}>
                <p className="leading-snug">{m.text}</p>
                <p className={`text-xs mt-1 ${isMe ? "text-purple-200" : "text-gray-400"}`}>
                  {m.senderName || (isMe ? "You" : inq.builderName)} · {m.sentAt ? new Date(m.sentAt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) : ""}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      {!isClosed ? (
        <div className="flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition"/>
          <button onClick={send} disabled={sending || !text.trim()}
            className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-40 shadow-sm shadow-purple-200">
            {sending ? "..." : "Send"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-center text-gray-400 py-2 bg-gray-50 rounded-xl">
          This inquiry is closed. No further messages can be sent.
        </p>
      )}
    </div>
  );
}

/* ── Main UserDashboard ── */
export default function UserDashboard() {
  const { user, logout }           = useAuth();
  const [tab,       setTab]        = useState("designs");
  const [designs,   setDesigns]    = useState([]);
  const [inquiries, setInquiries]  = useState([]);
  const [loading,   setLoading]    = useState(true);
  const [showGen,   setShowGen]    = useState(false);
  const [openChat,  setOpenChat]   = useState(null); // inquiry id with open chat

  const load = async () => {
    setLoading(true);
    try {
      const [d, i] = await Promise.all([
        apiFetch("/api/designs/my"),
        apiFetch("/api/inquiries/my"),
      ]);
      setDesigns(d);
      setInquiries(i);
    } catch { toast.error("Failed to load dashboard"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const fmtDate = ts => {
    if (!ts) return "";
    const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const newReplies = inquiries.filter(i => i.status === "replied").length;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">

        {/* Topbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-sm shadow-purple-200">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" stroke="white" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              </div>
              <span className="font-extrabold text-gray-900 text-sm">Decor<span className="text-purple-600">Gen</span></span>
            </a>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-medium text-gray-500">My Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-500">{user?.name || user?.email}</span>
            <span className="text-xs font-bold bg-purple-100 text-purple-700 border border-purple-300 px-2.5 py-1 rounded-full">USER</span>
            <button onClick={logout} className="text-sm text-red-500 hover:text-red-600 font-medium transition">Sign Out</button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">

          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">
                Welcome, {user?.name?.split(" ")[0] || "Designer"} 👋
              </h1>
              <p className="text-gray-500 mt-1">Your AI designs and designer conversations</p>
            </div>
            <button onClick={() => setShowGen(true)}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:opacity-90 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-purple-200 transition">
              + New Design
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <Stat icon="✨" label="Designs Generated" value={designs.filter(d => d.type === "generate").length}/>
            <Stat icon="🔧" label="Enhancements"       value={designs.filter(d => d.type === "enhance").length}/>
            <Stat icon="🤝" label="Designer Chats"     value={inquiries.length}/>
            <Stat icon="📁" label="Total Saved"         value={designs.length}/>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1 w-fit mb-8">
            {[["designs", "My Designs"], ["inquiries", "My Chats"]].map(([v, l]) => (
              <button key={v} onClick={() => setTab(v)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                  tab === v ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow" : "text-gray-500 hover:text-gray-800"
                }`}>
                {l}
                {v === "inquiries" && newReplies > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{newReplies}</span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : (
            <>
              {/* ── Designs grid ── */}
              {tab === "designs" && (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {designs.map(d => (
                    <div key={d.id}
                      className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100 transition">
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                        <Img src={d.generatedImageUrl} alt={d.style || "design"}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-gray-900 capitalize">
                            {d.type === "enhance" ? "Enhanced" : d.style || "Custom"}
                          </span>
                          {d.roomType && (
                            <span className="text-xs bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full capitalize">
                              {d.roomType}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{fmtDate(d.createdAt)}</p>
                        <a href={d.generatedImageUrl} download target="_blank" rel="noopener noreferrer"
                          className="mt-3 block text-center text-xs bg-gray-100 hover:bg-purple-600 hover:text-white border border-gray-200 text-gray-700 py-2 rounded-lg font-semibold transition">
                          ↓ Download
                        </a>
                      </div>
                    </div>
                  ))}

                  {/* New design CTA card */}
                  <button onClick={() => setShowGen(true)}
                    className="bg-white border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 rounded-2xl flex flex-col items-center justify-center gap-2 transition group min-h-[220px]">
                    <span className="text-4xl text-gray-300 group-hover:text-purple-500 transition">+</span>
                    <span className="text-sm font-semibold text-gray-400 group-hover:text-purple-600 transition">New Design</span>
                  </button>

                  {designs.length === 0 && (
                    <div className="col-span-full text-center py-14 text-gray-400">
                      <div className="text-5xl mb-3">✨</div>
                      <p className="text-sm">No designs yet — create your first one!</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Inquiries / Chats ── */}
              {tab === "inquiries" && (
                <div className="space-y-4">
                  {inquiries.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
                      <div className="text-4xl mb-3">🤝</div>
                      <p className="text-sm font-medium">No chats yet.</p>
                      <p className="text-xs mt-1">Generate a design and connect with a designer!</p>
                    </div>
                  ) : (
                    inquiries.map(inq => (
                      <div key={inq.id}
                        className={`bg-white border rounded-2xl p-5 transition ${
                          openChat === inq.id ? "border-purple-400 shadow-md shadow-purple-100" : "border-gray-200 hover:border-purple-300"
                        }`}>
                        {/* Inquiry header */}
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-gray-900">{inq.builderName}</p>
                              {inq.style && (
                                <span className="text-xs bg-purple-100 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-full capitalize">
                                  {inq.style}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{fmtDate(inq.createdAt)}</p>
                            {inq.budget && <p className="text-xs text-gray-500 mt-0.5">Budget: {inq.budget}</p>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${STATUS_BADGE[inq.status] || STATUS_BADGE.new}`}>
                              {inq.status}
                            </span>
                            {inq.status !== "closed" && (
                              <button
                                onClick={() => setOpenChat(openChat === inq.id ? null : inq.id)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                                  openChat === inq.id
                                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                                    : "bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-700 border border-gray-200"
                                }`}>
                                {openChat === inq.id ? "Close Chat ↑" : "💬 Open Chat"}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Chat thread (expandable) */}
                        {openChat === inq.id && (
                          <InquiryChat inq={inq} onClose={() => setOpenChat(null)} onReload={load}/>
                        )}

                        {/* Latest reply preview (when chat is closed) */}
                        {openChat !== inq.id && inq.builderReply && (
                          <div className="mt-3 bg-purple-50 border border-purple-100 rounded-xl p-3">
                            <p className="text-xs font-semibold text-purple-700 mb-0.5">Latest reply from {inq.builderName}:</p>
                            <p className="text-xs text-gray-700 line-clamp-2">{inq.builderReply}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showGen && <GeneratorModal onClose={() => { setShowGen(false); load(); }}/>}
    </>
  );
}
