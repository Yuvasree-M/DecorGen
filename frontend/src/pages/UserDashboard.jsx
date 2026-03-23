// import { useState, useEffect, useRef } from "react";
// import { useAuth }                      from "../context/AuthContext";
// import { apiFetch }                     from "../services/api";
// import { toast }                        from "react-toastify";
// import GeneratorModal                   from "../components/modals/GeneratorModal";

// const STATUS_BADGE = {
//   new:     "bg-amber-100 text-amber-700 border border-amber-300",
//   replied: "bg-purple-100 text-purple-700 border border-purple-300",
//   closed:  "bg-gray-100 text-gray-500 border border-gray-300",
// };

// /* fallback image */
// const Img = ({ src, alt, className }) => (
//   <img src={src} alt={alt} className={className}
//     onError={e => {
//       e.target.onerror = null;
//       e.target.src = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=60";
//     }}/>
// );

// function Stat({ icon, label, value }) {
//   return (
//     <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md hover:shadow-purple-100 transition">
//       <div className="text-2xl mb-2">{icon}</div>
//       <div className="text-3xl font-extrabold text-gray-900">{value}</div>
//       <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
//     </div>
//   );
// }

// /* ── Chat thread inside an inquiry card ── */
// function InquiryChat({ inq, onClose, onReload }) {
//   const { user } = useAuth();
//   const [text,    setText]    = useState("");
//   const [sending, setSending] = useState(false);
//   const endRef                = useRef(null);

//   const messages = Array.isArray(inq.messages) ? inq.messages : [];
//   const isClosed = inq.status === "closed";

//   useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

//   const send = async () => {
//     if (!text.trim() || sending || isClosed) return;
//     setSending(true);
//     try {
//       await apiFetch(`/api/inquiries/${inq.id}/message`, {
//         method: "POST",
//         body: JSON.stringify({ text: text.trim(), senderRole: "user" }),
//       });
//       setText("");
//       onReload();
//     } catch { toast.error("Failed to send message"); }
//     finally { setSending(false); }
//   };

//   const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

//   return (
//     <div className="mt-4 border-t border-gray-100 pt-4">
//       {/* Design images */}
//       {(inq.originalImageUrl || inq.generatedImageUrl) && (
//   <div className="flex gap-2">
    
//     {inq.originalImageUrl && (
//       <div className="flex-1">
//         <p className="text-xs text-gray-400 mb-1 text-center">Original Room</p>

//         <div className="aspect-square w-full flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
//           <Img
//             src={inq.originalImageUrl}
//             alt="Before"
//             cls="w-full h-full object-contain"
//           />
//         </div>

//       </div>
//     )}

//     {inq.generatedImageUrl && (
//       <div className="flex-1">
//         <p className="text-xs text-purple-600 font-semibold mb-1 text-center">
//           AI Design
//         </p>

//         <div className="aspect-square w-full flex items-center justify-center rounded-xl border-2 border-purple-300 bg-gray-50">
//           <Img
//             src={inq.generatedImageUrl}
//             alt="AI Design"
//             cls="w-full h-full object-contain"
//           />
//         </div>

//       </div>
//     )}

//   </div>
// )}

//       {/* Messages */}
//       <div className="space-y-2 max-h-56 overflow-y-auto pr-1 mb-3">
//         {messages.length === 0 && (
//           <p className="text-xs text-gray-400 text-center py-2">No messages yet.</p>
//         )}
//         {messages.map((m, i) => {
//           const isMe = m.sender === "user";
//           return (
//             <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
//               <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
//                 isMe
//                   ? "bg-purple-600 text-white rounded-br-sm"
//                   : "bg-gray-100 text-gray-800 rounded-bl-sm"
//               }`}>
//                 <p className="leading-snug">{m.text}</p>
//                 <p className={`text-xs mt-1 ${isMe ? "text-purple-200" : "text-gray-400"}`}>
//                   {m.senderName || (isMe ? "You" : inq.builderName)} · {m.sentAt ? new Date(m.sentAt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) : ""}
//                 </p>
//               </div>
//             </div>
//           );
//         })}
//         <div ref={endRef}/>
//       </div>

//       {/* Input */}
//       {!isClosed ? (
//         <div className="flex gap-2">
//           <input value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown}
//             placeholder="Type a message... (Enter to send)"
//             className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition"/>
//           <button onClick={send} disabled={sending || !text.trim()}
//             className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-40 shadow-sm shadow-purple-200">
//             {sending ? "..." : "Send"}
//           </button>
//         </div>
//       ) : (
//         <p className="text-xs text-center text-gray-400 py-2 bg-gray-50 rounded-xl">
//           This inquiry is closed. No further messages can be sent.
//         </p>
//       )}
//     </div>
//   );
// }

// /* ── Main UserDashboard ── */
// export default function UserDashboard() {
//   const { user, logout }           = useAuth();
//   const [tab,       setTab]        = useState("designs");
//   const [designs,   setDesigns]    = useState([]);
//   const [inquiries, setInquiries]  = useState([]);
//   const [loading,   setLoading]    = useState(true);
//   const [showGen,   setShowGen]    = useState(false);
//   const [openChat,  setOpenChat]   = useState(null); // inquiry id with open chat

//   const load = async () => {
//     setLoading(true);
//     try {
//       const [d, i] = await Promise.all([
//         apiFetch("/api/designs/my"),
//         apiFetch("/api/inquiries/my"),
//       ]);
//       setDesigns(d);
//       setInquiries(i);
//     } catch { toast.error("Failed to load dashboard"); }
//     finally { setLoading(false); }
//   };

//   useEffect(() => { load(); }, []);

//   const fmtDate = ts => {
//     if (!ts) return "";
//     const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
//     return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
//   };

//   const newReplies = inquiries.filter(i => i.status === "replied").length;

//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">

//         {/* Topbar */}
//         <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
//           <div className="flex items-center gap-3">
//             <a href="/" className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-sm shadow-purple-200">
//                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
//                   <path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" stroke="white" strokeWidth="2"/>
//                   <circle cx="12" cy="12" r="3" fill="white"/>
//                 </svg>
//               </div>
//               <span className="font-extrabold text-gray-900 text-sm">Decor<span className="text-purple-600">Gen</span></span>
//             </a>
//             <span className="text-gray-300">/</span>
//             <span className="text-sm font-medium text-gray-500">My Dashboard</span>
//           </div>
//           <div className="flex items-center gap-3">
//             <span className="hidden sm:block text-sm text-gray-500">{user?.name || user?.email}</span>
//             <span className="text-xs font-bold bg-purple-100 text-purple-700 border border-purple-300 px-2.5 py-1 rounded-full">USER</span>
//             <button onClick={logout} className="text-sm text-red-500 hover:text-red-600 font-medium transition">Sign Out</button>
//           </div>
//         </div>

//         <div className="max-w-6xl mx-auto px-6 py-10">

//           {/* Header */}
//           <div className="flex items-start justify-between mb-10">
//             <div>
//               <h1 className="text-4xl font-extrabold text-gray-900">
//                 Welcome, {user?.name?.split(" ")[0] || "Designer"} 👋
//               </h1>
//               <p className="text-gray-500 mt-1">Your AI designs and designer conversations</p>
//             </div>
//             <button onClick={() => setShowGen(true)}
//               className="bg-gradient-to-r from-purple-600 to-violet-600 hover:opacity-90 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-purple-200 transition">
//               + New Design
//             </button>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
//             <Stat icon="✨" label="Designs Generated" value={designs.filter(d => d.type === "generate").length}/>
//             <Stat icon="🔧" label="Enhancements"       value={designs.filter(d => d.type === "enhance").length}/>
//             <Stat icon="🤝" label="Designer Chats"     value={inquiries.length}/>
//             <Stat icon="📁" label="Total Saved"         value={designs.length}/>
//           </div>

//           {/* Tabs */}
//           <div className="flex gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1 w-fit mb-8">
//             {[["designs", "My Designs"], ["inquiries", "My Chats"]].map(([v, l]) => (
//               <button key={v} onClick={() => setTab(v)}
//                 className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
//                   tab === v ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow" : "text-gray-500 hover:text-gray-800"
//                 }`}>
//                 {l}
//                 {v === "inquiries" && newReplies > 0 && (
//                   <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{newReplies}</span>
//                 )}
//               </button>
//             ))}
//           </div>

//           {loading ? (
//             <div className="flex justify-center py-16">
//               <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"/>
//             </div>
//           ) : (
//             <>
//               {/* ── Designs grid ── */}
//               {tab === "designs" && (
//   <div className="space-y-3">

//     {designs.map((d, i) => (
//       <div
//         key={d.id}
//         className="bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-purple-400 transition flex items-center justify-between"
//       >
//         <div className="flex items-center gap-4">

//           {/* timeline dot */}
//           <div className="flex flex-col items-center">
//             <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
//             {i !== designs.length - 1 && (
//               <div className="w-px h-10 bg-gray-200" />
//             )}
//           </div>

//           <div>
//             <div className="flex items-center gap-2 flex-wrap">

//               <span className="font-semibold text-gray-900 capitalize">
//                 {d.roomType || "Room"}
//               </span>

//               {d.style && (
//                 <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full capitalize">
//                   {d.style}
//                 </span>
//               )}

//               {d.type === "enhance" && (
//                 <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
//                   enhanced
//                 </span>
//               )}
//             </div>

//             <p className="text-xs text-gray-400 mt-1">
//               {fmtDate(d.createdAt)}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">

//           <a
//             href={d.generatedImageUrl}
//             target="_blank"
//             className="text-xs text-gray-500 hover:text-purple-600 font-medium"
//           >
//             Download
//           </a>

//           <span className="text-purple-600 font-semibold text-sm">
//             View →
//           </span>

//         </div>
//       </div>
//     ))}

//     {designs.length === 0 && (
//       <div className="text-center py-16 text-gray-400">
//         No designs yet
//       </div>
//     )}

//   </div>
// )}
//               {/* ── Inquiries / Chats ── */}
//               {tab === "inquiries" && (
//                 <div className="space-y-4">
//                   {inquiries.length === 0 ? (
//                     <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
//                       <div className="text-4xl mb-3">🤝</div>
//                       <p className="text-sm font-medium">No chats yet.</p>
//                       <p className="text-xs mt-1">Generate a design and connect with a designer!</p>
//                     </div>
//                   ) : (
//                     inquiries.map(inq => (
//                       <div key={inq.id}
//                         className={`bg-white border rounded-2xl p-5 transition ${
//                           openChat === inq.id ? "border-purple-400 shadow-md shadow-purple-100" : "border-gray-200 hover:border-purple-300"
//                         }`}>
//                         {/* Inquiry header */}
//                         <div className="flex items-start justify-between gap-3 flex-wrap">
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2 flex-wrap">
//                               <p className="font-bold text-gray-900">{inq.builderName}</p>
//                               {inq.style && (
//                                 <span className="text-xs bg-purple-100 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-full capitalize">
//                                   {inq.style}
//                                 </span>
//                               )}
//                             </div>
//                             <p className="text-xs text-gray-400 mt-0.5">{fmtDate(inq.createdAt)}</p>
//                             {inq.budget && <p className="text-xs text-gray-500 mt-0.5">Budget: {inq.budget}</p>}
//                           </div>
//                           <div className="flex items-center gap-2 shrink-0">
//                             <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${STATUS_BADGE[inq.status] || STATUS_BADGE.new}`}>
//                               {inq.status}
//                             </span>
//                             {inq.status !== "closed" && (
//                               <button
//                                 onClick={() => setOpenChat(openChat === inq.id ? null : inq.id)}
//                                 className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
//                                   openChat === inq.id
//                                     ? "bg-purple-100 text-purple-700 border border-purple-200"
//                                     : "bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-700 border border-gray-200"
//                                 }`}>
//                                 {openChat === inq.id ? "Close Chat ↑" : "💬 Open Chat"}
//                               </button>
//                             )}
//                           </div>
//                         </div>

//                         {/* Chat thread (expandable) */}
//                         {openChat === inq.id && (
//                           <InquiryChat inq={inq} onClose={() => setOpenChat(null)} onReload={load}/>
//                         )}

//                         {/* Latest reply preview (when chat is closed) */}
//                         {openChat !== inq.id && inq.builderReply && (
//                           <div className="mt-3 bg-purple-50 border border-purple-100 rounded-xl p-3">
//                             <p className="text-xs font-semibold text-purple-700 mb-0.5">Latest reply from {inq.builderName}:</p>
//                             <p className="text-xs text-gray-700 line-clamp-2">{inq.builderReply}</p>
//                           </div>
//                         )}
//                       </div>
//                     ))
//                   )}
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {showGen && <GeneratorModal onClose={() => { setShowGen(false); load(); }}/>}
//     </>
//   );
// }
import { useState, useEffect, useRef } from "react";
import { useAuth }                      from "../context/AuthContext";
import { apiFetch }                     from "../services/api";
import { toast }                        from "react-toastify";
import GeneratorModal                   from "../components/modals/GeneratorModal";

/* ── Design tokens ── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --ink:    #0e0e14;
    --mist:   #f4f3f8;
    --line:   #e5e3ee;
    --plum:   #6030c8;
    --plum2:  #8b5cf6;
    --glow:   rgba(96,48,200,0.12);
    --card-r: 18px;
    --sans:   'DM Sans', sans-serif;
    --serif:  'DM Serif Display', serif;
  }

  .ud-root { font-family: var(--sans); background: var(--mist); min-height: 100vh; color: var(--ink); }
  .ud-root *, .ud-root *::before, .ud-root *::after { box-sizing: border-box; }

  /* topbar */
  .ud-topbar {
    position: sticky; top: 0; z-index: 50;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--line);
    padding: 0 32px;
    height: 60px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .ud-logo-mark {
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg, var(--plum), var(--plum2));
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px var(--glow);
  }
  .ud-logo-text { font-family: var(--sans); font-weight: 800; font-size: 14px; color: var(--ink); }
  .ud-logo-text span { color: var(--plum); }
  .ud-breadcrumb { font-size: 13px; color: #888; font-weight: 500; }
  .ud-signout { font-size: 13px; color: #ef4444; font-weight: 600; cursor: pointer; border: none; background: none; }
  .ud-signout:hover { color: #dc2626; }
  .ud-badge-user {
    font-size: 11px; font-weight: 700; letter-spacing: .04em;
    background: #ede9ff; color: var(--plum); border: 1px solid #d4c8f8;
    padding: 3px 10px; border-radius: 20px;
  }

  /* layout */
  .ud-body { max-width: 1100px; margin: 0 auto; padding: 48px 24px 80px; }

  /* welcome */
  .ud-welcome-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 40px; gap: 16px; flex-wrap: wrap; }
  .ud-welcome-title { font-family: var(--serif); font-size: 38px; line-height: 1.15; color: var(--ink); }
  .ud-welcome-sub { font-size: 14px; color: #777; margin-top: 6px; font-weight: 400; }
  .ud-new-btn {
    background: linear-gradient(135deg, var(--plum) 0%, var(--plum2) 100%);
    color: #fff; border: none; padding: 12px 22px; border-radius: 12px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    box-shadow: 0 6px 20px var(--glow); transition: transform .15s, box-shadow .15s;
    white-space: nowrap; font-family: var(--sans);
  }
  .ud-new-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px var(--glow); }

  /* stats */
  .ud-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 40px; }
  @media(max-width:640px){ .ud-stats { grid-template-columns: repeat(2,1fr); } }
  .ud-stat {
    background: #fff; border: 1px solid var(--line); border-radius: var(--card-r);
    padding: 22px 20px; transition: border-color .2s, box-shadow .2s;
    position: relative; overflow: hidden;
  }
  .ud-stat::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--glow) 0%, transparent 60%);
    opacity: 0; transition: opacity .2s;
  }
  .ud-stat:hover::before { opacity: 1; }
  .ud-stat:hover { border-color: #c4b3f0; box-shadow: 0 4px 20px var(--glow); }
  .ud-stat-icon { font-size: 22px; margin-bottom: 10px; }
  .ud-stat-val { font-family: var(--serif); font-size: 34px; color: var(--ink); }
  .ud-stat-lbl { font-size: 11px; color: #888; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; margin-top: 4px; }

  /* tabs */
  .ud-tabs { display: flex; gap: 4px; background: #ede9ff; border: 1px solid var(--line); border-radius: 12px; padding: 4px; width: fit-content; margin-bottom: 28px; }
  .ud-tab {
    padding: 8px 20px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer;
    border: none; background: none; color: #666; transition: all .15s; font-family: var(--sans);
    display: flex; align-items: center; gap: 6px;
  }
  .ud-tab.active { background: linear-gradient(135deg, var(--plum), var(--plum2)); color: #fff; box-shadow: 0 2px 10px var(--glow); }
  .ud-tab:not(.active):hover { color: var(--plum); background: rgba(255,255,255,.5); }
  .ud-notif { background: #ef4444; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 20px; }

  /* spinner */
  .ud-spin { width: 36px; height: 36px; border: 2.5px solid #e5e3ee; border-top-color: var(--plum); border-radius: 50%; animation: spin .7s linear infinite; margin: 60px auto; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── DESIGNS LIST ── */
  .ud-design-list { display: flex; flex-direction: column; gap: 0; }
  .ud-design-item {
    background: #fff; border: 1px solid var(--line);
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    padding: 16px 20px; transition: border-color .2s, box-shadow .15s;
    cursor: default;
  }
  .ud-design-item:first-child { border-radius: 16px 16px 0 0; }
  .ud-design-item:last-child  { border-radius: 0 0 16px 16px; }
  .ud-design-item:only-child  { border-radius: 16px; }
  .ud-design-item + .ud-design-item { border-top: none; }
  .ud-design-item:hover { border-color: #c4b3f0; box-shadow: 0 2px 12px var(--glow); z-index: 1; position: relative; }

  .ud-design-left { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0; }
  .ud-design-thumb {
    width: 52px; height: 52px; border-radius: 10px; object-fit: cover; flex-shrink: 0;
    border: 2px solid var(--line); background: #f0edf8;
  }
  .ud-design-thumb-placeholder {
    width: 52px; height: 52px; border-radius: 10px; flex-shrink: 0;
    border: 2px solid var(--line); background: linear-gradient(135deg,#ede9ff,#f4f3f8);
    display: flex; align-items: center; justify-content: center; font-size: 20px;
  }
  .ud-design-name { font-size: 15px; font-weight: 600; color: var(--ink); text-transform: capitalize; }
  .ud-chip { display: inline-flex; align-items: center; font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 20px; letter-spacing: .02em; }
  .ud-chip-style  { background: #ede9ff; color: var(--plum); border: 1px solid #d4c8f8; }
  .ud-chip-enhance{ background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
  .ud-chip-gen    { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
  .ud-design-date { font-size: 12px; color: #aaa; margin-top: 3px; }

  .ud-design-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .ud-btn-view {
    font-size: 12px; font-weight: 700; color: var(--plum);
    background: #ede9ff; border: 1px solid #d4c8f8; padding: 6px 14px; border-radius: 8px;
    cursor: pointer; transition: background .15s; font-family: var(--sans);
  }
  .ud-btn-view:hover { background: #ddd5f8; }
  .ud-btn-delete {
    font-size: 12px; font-weight: 600; color: #ef4444;
    background: #fff5f5; border: 1px solid #fecaca; padding: 6px 12px; border-radius: 8px;
    cursor: pointer; transition: background .15s; font-family: var(--sans);
  }
  .ud-btn-delete:hover { background: #fee2e2; }
  .ud-btn-dload {
    font-size: 12px; font-weight: 600; color: #555;
    background: #f6f5fa; border: 1px solid var(--line); padding: 6px 12px; border-radius: 8px;
    text-decoration: none; transition: background .15s;
  }
  .ud-btn-dload:hover { background: #edeaf5; color: var(--plum); }

  /* ── VIEW MODAL ── */
  .ud-modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(10,8,20,0.7); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: fadeIn .2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .ud-modal {
    background: #fff; border-radius: 24px; width: 100%; max-width: 900px;
    max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 80px rgba(0,0,0,.3);
    animation: slideUp .25s ease;
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .ud-modal-header {
    padding: 24px 28px 0;
    display: flex; align-items: flex-start; justify-content: space-between;
    border-bottom: 1px solid var(--line); padding-bottom: 18px; margin-bottom: 24px;
  }
  .ud-modal-title { font-family: var(--serif); font-size: 24px; color: var(--ink); }
  .ud-modal-sub { font-size: 13px; color: #888; margin-top: 4px; }
  .ud-modal-close {
    width: 34px; height: 34px; border-radius: 50%; background: var(--mist);
    border: 1px solid var(--line); font-size: 18px; cursor: pointer; color: #555;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    transition: background .15s;
  }
  .ud-modal-close:hover { background: #ede9ff; color: var(--plum); }
  .ud-modal-body { padding: 0 28px 28px; }
  .ud-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media(max-width:600px){ .ud-modal-grid { grid-template-columns: 1fr; } }
  .ud-img-card { border-radius: 14px; overflow: hidden; border: 1.5px solid var(--line); }
  .ud-img-label {
    padding: 10px 14px; font-size: 12px; font-weight: 700; letter-spacing: .05em;
    text-transform: uppercase; border-bottom: 1px solid var(--line);
  }
  .ud-img-label.original  { background: #f6f5fa; color: #666; }
  .ud-img-label.generated { background: #ede9ff; color: var(--plum); }
  .ud-img-wrap { background: #fafafa; min-height: 220px; display: flex; align-items: center; justify-content: center; }
  .ud-img-wrap img { width: 100%; display: block; object-fit: contain; max-height: 340px; }
  .ud-img-empty { padding: 40px; text-align: center; color: #ccc; font-size: 32px; }
  .ud-modal-meta { margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap; }
  .ud-meta-chip { font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 8px; }
  .ud-modal-footer { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .ud-btn-delete-lg {
    font-size: 13px; font-weight: 700; color: #ef4444;
    background: #fff5f5; border: 1.5px solid #fecaca; padding: 10px 20px; border-radius: 10px;
    cursor: pointer; transition: all .15s; font-family: var(--sans);
    display: flex; align-items: center; gap: 6px;
  }
  .ud-btn-delete-lg:hover { background: #fee2e2; border-color: #ef4444; }
  .ud-btn-dload-lg {
    font-size: 13px; font-weight: 700; color: #fff;
    background: linear-gradient(135deg, var(--plum), var(--plum2));
    border: none; padding: 10px 22px; border-radius: 10px;
    cursor: pointer; transition: opacity .15s; font-family: var(--sans);
    text-decoration: none; box-shadow: 0 4px 12px var(--glow);
  }
  .ud-btn-dload-lg:hover { opacity: .87; }

  /* ── INQUIRIES ── */
  .ud-inq-list { display: flex; flex-direction: column; gap: 14px; }
  .ud-inq-card {
    background: #fff; border: 1.5px solid var(--line); border-radius: 20px;
    padding: 22px; transition: border-color .2s, box-shadow .2s;
  }
  .ud-inq-card.open { border-color: var(--plum); box-shadow: 0 4px 24px var(--glow); }
  .ud-inq-card:not(.open):hover { border-color: #c4b3f0; }
  .ud-inq-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .ud-inq-name { font-size: 16px; font-weight: 700; color: var(--ink); }
  .ud-inq-date { font-size: 12px; color: #aaa; margin-top: 3px; }
  .ud-inq-budget{ font-size: 12px; color: #777; margin-top: 2px; }
  .ud-status {
    font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px;
    letter-spacing: .04em; text-transform: uppercase;
  }
  .ud-status-new      { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
  .ud-status-replied  { background: #ede9ff; color: var(--plum); border: 1px solid #d4c8f8; }
  .ud-status-closed   { background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb; }
  .ud-btn-chat {
    font-size: 12px; font-weight: 700; padding: 7px 16px; border-radius: 10px;
    cursor: pointer; border: 1.5px solid var(--line); transition: all .15s; font-family: var(--sans);
    background: var(--mist); color: #555;
  }
  .ud-btn-chat:hover, .ud-btn-chat.active { background: #ede9ff; color: var(--plum); border-color: #c4b3f0; }

  .ud-reply-preview {
    margin-top: 14px; background: #f7f5ff; border: 1px solid #e4dcf8; border-radius: 12px; padding: 12px 16px;
  }
  .ud-reply-from { font-size: 11px; font-weight: 700; color: var(--plum); margin-bottom: 3px; }
  .ud-reply-text { font-size: 13px; color: #444; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  /* chat thread */
  .ud-chat-thread { margin-top: 18px; border-top: 1px solid var(--line); padding-top: 18px; }
  .ud-chat-images { display: flex; gap: 12px; margin-bottom: 16px; }
  .ud-chat-img-wrap {
    flex: 1; border-radius: 12px; overflow: hidden;
    border: 1.5px solid var(--line); background: #fafafa;
  }
  .ud-chat-img-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; padding: 7px 12px; border-bottom: 1px solid var(--line); }
  .ud-chat-img-label.orig { background: #f6f5fa; color: #888; }
  .ud-chat-img-label.ai   { background: #ede9ff; color: var(--plum); }
  .ud-chat-img-wrap img { width: 100%; display: block; aspect-ratio: 1; object-fit: contain; }
  .ud-messages { max-height: 240px; overflow-y: auto; space-y: 8px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 8px; }
  .ud-msg-bubble {
    max-width: 75%; padding: 10px 14px; border-radius: 18px; font-size: 13px; line-height: 1.45;
  }
  .ud-msg-me   { align-self: flex-end; background: linear-gradient(135deg, var(--plum), var(--plum2)); color: #fff; border-bottom-right-radius: 4px; }
  .ud-msg-them { align-self: flex-start; background: #f0edf8; color: var(--ink); border-bottom-left-radius: 4px; }
  .ud-msg-time { font-size: 10px; margin-top: 4px; }
  .ud-msg-time.me   { color: rgba(255,255,255,.6); }
  .ud-msg-time.them { color: #aaa; }
  .ud-chat-input { display: flex; gap: 8px; }
  .ud-chat-input input {
    flex: 1; background: var(--mist); border: 1.5px solid var(--line); border-radius: 12px;
    padding: 10px 16px; font-size: 13px; color: var(--ink); outline: none; font-family: var(--sans);
    transition: border-color .15s;
  }
  .ud-chat-input input:focus { border-color: var(--plum); box-shadow: 0 0 0 3px var(--glow); }
  .ud-chat-send {
    background: linear-gradient(135deg, var(--plum), var(--plum2)); color: #fff;
    border: none; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 700;
    cursor: pointer; transition: opacity .15s; font-family: var(--sans);
    box-shadow: 0 3px 10px var(--glow);
  }
  .ud-chat-send:disabled { opacity: .4; cursor: not-allowed; }
  .ud-chat-closed {
    text-align: center; padding: 12px; font-size: 12px; color: #aaa;
    background: var(--mist); border-radius: 10px; font-style: italic;
  }

  /* empty states */
  .ud-empty {
    text-align: center; padding: 60px 20px; background: #fff;
    border: 1px solid var(--line); border-radius: 20px; color: #bbb;
  }
  .ud-empty-icon { font-size: 40px; margin-bottom: 12px; }
  .ud-empty-title { font-size: 15px; font-weight: 600; color: #888; }
  .ud-empty-sub { font-size: 13px; margin-top: 4px; }

  /* delete confirm */
  .ud-confirm-overlay {
    position: fixed; inset: 0; z-index: 300;
    background: rgba(10,8,20,.6); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .ud-confirm-box {
    background: #fff; border-radius: 20px; padding: 32px 28px; max-width: 380px; width: 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,.25); animation: slideUp .2s ease;
    text-align: center;
  }
  .ud-confirm-icon { font-size: 40px; margin-bottom: 14px; }
  .ud-confirm-title { font-family: var(--serif); font-size: 22px; color: var(--ink); margin-bottom: 8px; }
  .ud-confirm-sub { font-size: 14px; color: #777; margin-bottom: 24px; }
  .ud-confirm-btns { display: flex; gap: 10px; }
  .ud-confirm-cancel { flex: 1; padding: 12px; border-radius: 10px; border: 1.5px solid var(--line); background: var(--mist); font-size: 14px; font-weight: 600; cursor: pointer; font-family: var(--sans); color: #444; }
  .ud-confirm-ok { flex: 1; padding: 12px; border-radius: 10px; border: none; background: #ef4444; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: var(--sans); }
  .ud-confirm-ok:hover { background: #dc2626; }
`;

const STATUS_CLS = {
  new:     "ud-status ud-status-new",
  replied: "ud-status ud-status-replied",
  closed:  "ud-status ud-status-closed",
};

/* ── Fallback-safe image ── */
const Img = ({ src, alt, className, style }) => (
  <img src={src} alt={alt} className={className} style={style}
    onError={e => {
      e.target.onerror = null;
      e.target.src = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=60";
    }}/>
);

/* ── Confirm delete dialog ── */
function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div className="ud-confirm-overlay">
      <div className="ud-confirm-box">
        <div className="ud-confirm-icon">🗑️</div>
        <h3 className="ud-confirm-title">Delete Design?</h3>
        <p className="ud-confirm-sub">This will permanently remove this design from your history. This cannot be undone.</p>
        <div className="ud-confirm-btns">
          <button className="ud-confirm-cancel" onClick={onCancel}>Keep It</button>
          <button className="ud-confirm-ok" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── Design view modal ── */
function DesignViewModal({ design, onClose, onDelete, fmtDate }) {
  const hasOriginal   = !!design.originalImageUrl;
  const hasGenerated  = !!design.generatedImageUrl;

  return (
    <div className="ud-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ud-modal">
        <div className="ud-modal-header">
          <div>
            <h2 className="ud-modal-title" style={{textTransform:'capitalize'}}>
              {design.roomType || "Room"} Design
            </h2>
            <p className="ud-modal-sub">{fmtDate(design.createdAt)}</p>
          </div>
          <button className="ud-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="ud-modal-body">
          {/* meta chips */}
          <div className="ud-modal-meta" style={{marginBottom:20}}>
            {design.style && <span className="ud-meta-chip ud-chip-style">{design.style}</span>}
            {design.type === "enhance"
              ? <span className="ud-meta-chip ud-chip-enhance">Enhanced</span>
              : <span className="ud-meta-chip ud-chip-gen">Generated</span>}
          </div>

          {/* images */}
          <div className="ud-modal-grid">
            {/* Original / Before */}
            <div className="ud-img-card">
              <div className="ud-img-label original">📷 Original Room</div>
              <div className="ud-img-wrap">
                {hasOriginal
                  ? <Img src={design.originalImageUrl} alt="Original Room"/>
                  : <div className="ud-img-empty">No original image</div>}
              </div>
            </div>

            {/* AI / After */}
            <div className="ud-img-card">
              <div className="ud-img-label generated">✨ AI Design</div>
              <div className="ud-img-wrap">
                {hasGenerated
                  ? <Img src={design.generatedImageUrl} alt="AI Design"/>
                  : <div className="ud-img-empty">No output yet</div>}
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="ud-modal-footer">
            <button className="ud-btn-delete-lg" onClick={onDelete}>
              🗑️ Delete from History
            </button>
            {hasGenerated && (
              <button className="ud-btn-dload-lg" onClick={async () => {
                try {
                  const res = await fetch(design.generatedImageUrl);
                  const blob = await res.blob();
                  const blobUrl = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = blobUrl;
                  a.download = "decorgen-design.jpg";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(blobUrl);
                } catch { window.open(design.generatedImageUrl, "_blank"); }
              }}>
                ↓ Download Design
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Chat thread ── */
function InquiryChat({ inq, onClose, onReload }) {
  const [text,    setText]    = useState("");
  const [sending, setSending] = useState(false);
  const endRef                = useRef(null);
  const messages  = Array.isArray(inq.messages) ? inq.messages : [];
  const isClosed  = inq.status === "closed";

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = async () => {
    if (!text.trim() || sending || isClosed) return;
    setSending(true);
    try {
      await apiFetch(`/api/inquiries/${inq.id}/message`, {
        method: "POST",
        body: JSON.stringify({ text: text.trim(), senderRole: "user" }),
      });
      setText(""); onReload();
    } catch { toast.error("Failed to send message"); }
    finally { setSending(false); }
  };

  const handleKeyDown = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div className="ud-chat-thread">
      {(inq.originalImageUrl || inq.generatedImageUrl) && (
        <div className="ud-chat-images">
          {inq.originalImageUrl && (
            <div className="ud-chat-img-wrap">
              <div className="ud-chat-img-label orig">Original Room</div>
              <Img src={inq.originalImageUrl} alt="Before"/>
            </div>
          )}
          {inq.generatedImageUrl && (
            <div className="ud-chat-img-wrap">
              <div className="ud-chat-img-label ai">✨ AI Design</div>
              <Img src={inq.generatedImageUrl} alt="AI Design"/>
            </div>
          )}
        </div>
      )}

      <div className="ud-messages">
        {messages.length === 0 && (
          <p style={{textAlign:'center',fontSize:12,color:'#bbb',padding:'16px 0'}}>No messages yet.</p>
        )}
        {messages.map((m, i) => {
          const isMe = m.sender === "user";
          return (
            <div key={i} style={{display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start'}}>
              <div className={`ud-msg-bubble ${isMe ? 'ud-msg-me' : 'ud-msg-them'}`}>
                <p>{m.text}</p>
                <p className={`ud-msg-time ${isMe ? 'me' : 'them'}`}>
                  {m.senderName || (isMe ? "You" : inq.builderName)}
                  {m.sentAt ? ` · ${new Date(m.sentAt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}` : ""}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef}/>
      </div>

      {!isClosed ? (
        <div className="ud-chat-input">
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"/>
          <button className="ud-chat-send" onClick={send} disabled={sending || !text.trim()}>
            {sending ? "…" : "Send"}
          </button>
        </div>
      ) : (
        <div className="ud-chat-closed">This inquiry is closed. No further messages can be sent.</div>
      )}
    </div>
  );
}

/* ── Main ── */
export default function UserDashboard() {
  const { user, logout }          = useAuth();
  const [tab,       setTab]       = useState("designs");
  const [designs,   setDesigns]   = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showGen,   setShowGen]   = useState(false);
  const [openChat,  setOpenChat]  = useState(null);
  const [viewDesign,setViewDesign]= useState(null);  // design to preview
  const [deleteTarget,setDeleteTarget] = useState(null); // {id, source: 'modal'|'inline'}
  const [deleting,  setDeleting]  = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [d, i] = await Promise.all([
        apiFetch("/api/designs/my"),
        apiFetch("/api/inquiries/my"),
      ]);
      setDesigns(d); setInquiries(i);
    } catch { toast.error("Failed to load dashboard"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const fmtDate = ts => {
    if (!ts) return "";
    const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    return d.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await apiFetch(`/api/designs/${id}`, { method: "DELETE" });
      toast.success("Design deleted");
      setDesigns(prev => prev.filter(d => d.id !== id));
      if (viewDesign?.id === id) setViewDesign(null);
    } catch { toast.error("Failed to delete design"); }
    finally { setDeleting(null); setDeleteTarget(null); }
  };

  const newReplies = inquiries.filter(i => i.status === "replied").length;

  return (
    <>
      <style>{css}</style>
      <div className="ud-root">

        {/* Topbar */}
        <div className="ud-topbar">
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <a href="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none'}}>
              <div className="ud-logo-mark">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" stroke="white" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              </div>
              <span className="ud-logo-text">Decor<span>Gen</span></span>
            </a>
            <span style={{color:'#ddd'}}>/</span>
            <span className="ud-breadcrumb">My Dashboard</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:13,color:'#666',display:'none'}} className="sm-show">{user?.name || user?.email}</span>
            <span className="ud-badge-user">USER</span>
            <button className="ud-signout" onClick={logout}>Sign Out</button>
          </div>
        </div>

        <div className="ud-body">

          {/* Welcome */}
          <div className="ud-welcome-row">
            <div>
              <h1 className="ud-welcome-title">
                Hey, {user?.name?.split(" ")[0] || "Designer"} 👋
              </h1>
              <p className="ud-welcome-sub">Your AI designs and designer conversations, all in one place.</p>
            </div>
            <button className="ud-new-btn" onClick={() => setShowGen(true)}>+ New Design</button>
          </div>

          {/* Stats */}
          <div className="ud-stats">
            {[
              { icon:"✨", label:"Generated",  val: designs.filter(d=>d.type==="generate").length },
              { icon:"🔧", label:"Enhanced",   val: designs.filter(d=>d.type==="enhance").length },
              { icon:"🤝", label:"Designer Chats", val: inquiries.length },
              { icon:"📁", label:"Total Saved", val: designs.length },
            ].map(s => (
              <div key={s.label} className="ud-stat">
                <div className="ud-stat-icon">{s.icon}</div>
                <div className="ud-stat-val">{s.val}</div>
                <div className="ud-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="ud-tabs">
            {[["designs","My Designs"],["inquiries","My Chats"]].map(([v,l]) => (
              <button key={v} onClick={() => setTab(v)} className={`ud-tab ${tab===v?"active":""}`}>
                {l}
                {v==="inquiries" && newReplies > 0 && <span className="ud-notif">{newReplies}</span>}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? <div className="ud-spin"/> : (
            <>
              {/* ── Designs ── */}
              {tab === "designs" && (
                designs.length === 0
                  ? (
                    <div className="ud-empty">
                      <div className="ud-empty-icon">✨</div>
                      <div className="ud-empty-title">No designs yet</div>
                      <div className="ud-empty-sub">Click "New Design" to get started</div>
                    </div>
                  ) : (
                    <div className="ud-design-list">
                      {designs.map(d => (
                        <div key={d.id} className="ud-design-item">
                          <div className="ud-design-left">
                            {d.generatedImageUrl
                              ? <Img src={d.generatedImageUrl} alt={d.roomType} className="ud-design-thumb"/>
                              : <div className="ud-design-thumb-placeholder">🛋️</div>
                            }
                            <div>
                              <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap',marginBottom:4}}>
                                <span className="ud-design-name">{d.roomType || "Room"}</span>
                                {d.style && <span className="ud-chip ud-chip-style">{d.style}</span>}
                                {d.type === "enhance"
                                  ? <span className="ud-chip ud-chip-enhance">enhanced</span>
                                  : <span className="ud-chip ud-chip-gen">generated</span>}
                              </div>
                              <div className="ud-design-date">{fmtDate(d.createdAt)}</div>
                            </div>
                          </div>

                          <div className="ud-design-actions">
                            {d.generatedImageUrl && (
                             <button className="ud-btn-dload" onClick={async () => {
                              try {
                                const res = await fetch(d.generatedImageUrl);
                                const blob = await res.blob();
                                const blobUrl = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = blobUrl; a.download = "decorgen-design.jpg";
                                document.body.appendChild(a); a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(blobUrl);
                              } catch { window.open(d.generatedImageUrl, "_blank"); }
                            }}>↓</button>
                            )}
                            <button className="ud-btn-view" onClick={() => setViewDesign(d)}>View →</button>
                            <button className="ud-btn-delete"
                              disabled={deleting === d.id}
                              onClick={() => setDeleteTarget({id: d.id, source: 'inline'})}>
                              {deleting === d.id ? "…" : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
              )}

              {/* ── Inquiries ── */}
              {tab === "inquiries" && (
                inquiries.length === 0
                  ? (
                    <div className="ud-empty">
                      <div className="ud-empty-icon">🤝</div>
                      <div className="ud-empty-title">No chats yet</div>
                      <div className="ud-empty-sub">Generate a design and connect with a designer!</div>
                    </div>
                  ) : (
                    <div className="ud-inq-list">
                      {inquiries.map(inq => (
                        <div key={inq.id} className={`ud-inq-card ${openChat === inq.id ? "open" : ""}`}>
                          <div className="ud-inq-header">
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                                <span className="ud-inq-name">{inq.builderName}</span>
                                {inq.style && <span className="ud-chip ud-chip-style">{inq.style}</span>}
                              </div>
                              <div className="ud-inq-date">{fmtDate(inq.createdAt)}</div>
                              {inq.budget && <div className="ud-inq-budget">Budget: {inq.budget}</div>}
                            </div>
                            <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                              <span className={STATUS_CLS[inq.status] || STATUS_CLS.new}>{inq.status}</span>
                              {inq.status !== "closed" && (
                                <button
                                  className={`ud-btn-chat ${openChat === inq.id ? "active" : ""}`}
                                  onClick={() => setOpenChat(openChat === inq.id ? null : inq.id)}>
                                  {openChat === inq.id ? "Close ↑" : "💬 Chat"}
                                </button>
                              )}
                            </div>
                          </div>

                          {openChat === inq.id && (
                            <InquiryChat inq={inq} onClose={() => setOpenChat(null)} onReload={load}/>
                          )}

                          {openChat !== inq.id && inq.builderReply && (
                            <div className="ud-reply-preview">
                              <p className="ud-reply-from">Latest from {inq.builderName}:</p>
                              <p className="ud-reply-text">{inq.builderReply}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
              )}
            </>
          )}
        </div>
      </div>

      {/* ── View modal ── */}
      {viewDesign && (
        <DesignViewModal
          design={viewDesign}
          fmtDate={fmtDate}
          onClose={() => setViewDesign(null)}
          onDelete={() => setDeleteTarget({ id: viewDesign.id, source: 'modal' })}
        />
      )}

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <DeleteConfirm
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.id)}
        />
      )}

      {showGen && <GeneratorModal onClose={() => { setShowGen(false); load(); }}/>}
    </>
  );
}