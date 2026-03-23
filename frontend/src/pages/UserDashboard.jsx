import { useState, useEffect, useRef } from "react";
import { useAuth }                      from "../context/AuthContext";
import { apiFetch }                     from "../services/api";
import { toast }                        from "react-toastify";
import GeneratorModal                   from "../components/modals/GeneratorModal";

// ── Theme tokens ──────────────────────────────────────────────────────────────
const T = {
  ink:   "#0e0e14",
  mist:  "#f4f3f8",
  line:  "#e5e3ee",
  plum:  "#6030c8",
  plum2: "#8b5cf6",
  glow:  "rgba(96,48,200,0.12)",
  sans:  "'DM Sans', sans-serif",
  serif: "'DM Serif Display', serif",
};

// ── Reusable inline-style helpers ─────────────────────────────────────────────
const chip = (bg, color, border) => ({
  display: "inline-flex", alignItems: "center",
  fontSize: 11, fontWeight: 600, padding: "2px 9px",
  borderRadius: 20, letterSpacing: ".02em",
  background: bg, color, border: `1px solid ${border}`,
});

const CHIPS = {
  style:   chip("#ede9ff", T.plum,    "#d4c8f8"),
  enhance: chip("#fef3c7", "#b45309", "#fde68a"),
  gen:     chip("#ecfdf5", "#059669", "#a7f3d0"),
};

const STATUS_STYLES = {
  new:     { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" },
  replied: { background: "#ede9ff", color: T.plum,    border: "1px solid #d4c8f8" },
  closed:  { background: "#f3f4f6", color: "#6b7280",  border: "1px solid #e5e7eb" },
};

// ── Blob downloader ───────────────────────────────────────────────────────────
async function downloadBlob(url, filename = "decorgen-design.jpg") {
  try {
    const res     = await fetch(url);
    const blob    = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href = blobUrl; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch { window.open(url, "_blank"); }
}

// ── Fallback-safe image ───────────────────────────────────────────────────────
const Img = ({ src, alt, style }) => (
  <img src={src} alt={alt} style={style}
    onError={e => {
      e.target.onerror = null;
      e.target.src = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=60";
    }}/>
);

// ── Delete confirm dialog ─────────────────────────────────────────────────────
function DeleteConfirm({ title = "Delete?", subtitle, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(10,8,20,.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "32px 28px",
        maxWidth: 380, width: "100%", textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,.25)",
      }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>🗑️</div>
        <h3 style={{ fontFamily: T.serif, fontSize: 22, color: T.ink, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 14, color: "#777", marginBottom: 24 }}>{subtitle}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: 12, borderRadius: 10, border: `1.5px solid ${T.line}`,
            background: T.mist, fontSize: 14, fontWeight: 600, cursor: "pointer",
            fontFamily: T.sans, color: "#444",
          }}>Keep It</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: 12, borderRadius: 10, border: "none",
            background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: T.sans,
          }}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Design view modal ─────────────────────────────────────────────────────────
function DesignViewModal({ design, onClose, onDelete, fmtDate }) {
  const hasOriginal  = !!design.originalImageUrl;
  const hasGenerated = !!design.generatedImageUrl;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(10,8,20,0.7)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}>
      <div style={{
        background: "#fff", borderRadius: 24, width: "100%", maxWidth: 900,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,.3)",
      }}>
        {/* Header */}
        <div style={{
          padding: "24px 28px 18px", display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", borderBottom: `1px solid ${T.line}`, marginBottom: 24,
        }}>
          <div>
            <h2 style={{ fontFamily: T.serif, fontSize: 24, color: T.ink, textTransform: "capitalize", margin: 0 }}>
              {design.roomType || "Room"} Design
            </h2>
            <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{fmtDate(design.createdAt)}</p>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: "50%", background: T.mist,
            border: `1px solid ${T.line}`, fontSize: 18, cursor: "pointer", color: "#555",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "0 28px 28px" }}>
          {/* Chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {design.style && <span style={CHIPS.style}>{design.style}</span>}
            {design.type === "enhance"
              ? <span style={CHIPS.enhance}>Enhanced</span>
              : <span style={CHIPS.gen}>Generated</span>}
          </div>

          {/* Images */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              { label: "📷 Original Room", labelBg: "#f6f5fa", labelColor: "#666", src: design.originalImageUrl, has: hasOriginal },
              { label: "✨ AI Design",     labelBg: "#ede9ff", labelColor: T.plum,  src: design.generatedImageUrl, has: hasGenerated },
            ].map(({ label, labelBg, labelColor, src, has }) => (
              <div key={label} style={{ borderRadius: 14, overflow: "hidden", border: `1.5px solid ${T.line}` }}>
                <div style={{
                  padding: "10px 14px", fontSize: 12, fontWeight: 700,
                  letterSpacing: ".05em", textTransform: "uppercase",
                  borderBottom: `1px solid ${T.line}`,
                  background: labelBg, color: labelColor,
                }}>{label}</div>
                <div style={{
                  background: "#fafafa", minHeight: 220,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {has
                    ? <Img src={src} alt={label} style={{ width: "100%", display: "block", objectFit: "contain", maxHeight: 340 }}/>
                    : <div style={{ padding: 40, textAlign: "center", color: "#ccc", fontSize: 32 }}>—</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.line}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 12,
          }}>
            <button onClick={onDelete} style={{
              fontSize: 13, fontWeight: 700, color: "#ef4444",
              background: "#fff5f5", border: "1.5px solid #fecaca",
              padding: "10px 20px", borderRadius: 10, cursor: "pointer",
              fontFamily: T.sans, display: "flex", alignItems: "center", gap: 6,
            }}>🗑️ Delete from History</button>

            {hasGenerated && (
              <button
                onClick={() => downloadBlob(design.generatedImageUrl)}
                style={{
                  fontSize: 13, fontWeight: 700, color: "#fff",
                  background: `linear-gradient(135deg, ${T.plum}, ${T.plum2})`,
                  border: "none", padding: "10px 22px", borderRadius: 10,
                  cursor: "pointer", fontFamily: T.sans,
                  boxShadow: `0 4px 12px ${T.glow}`,
                }}>↓ Download Design</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Chat thread ───────────────────────────────────────────────────────────────
function InquiryChat({ inq, onReload }) {
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
      setText(""); onReload();
    } catch { toast.error("Failed to send message"); }
    finally { setSending(false); }
  };

  const handleKeyDown = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div style={{ marginTop: 18, borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
      {/* Reference images */}
      {(inq.originalImageUrl || inq.generatedImageUrl) && (
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Original Room", cls: "orig", bg: "#f6f5fa", color: "#888", src: inq.originalImageUrl },
            { label: "✨ AI Design",  cls: "ai",   bg: "#ede9ff", color: T.plum,  src: inq.generatedImageUrl },
          ].filter(x => x.src).map(({ label, bg, color, src }) => (
            <div key={label} style={{
              flex: 1, borderRadius: 12, overflow: "hidden",
              border: `1.5px solid ${T.line}`, background: "#fafafa",
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: ".04em", padding: "7px 12px",
                borderBottom: `1px solid ${T.line}`, background: bg, color,
              }}>{label}</div>
              <Img src={src} alt={label} style={{ width: "100%", display: "block", aspectRatio: "1", objectFit: "contain" }}/>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{
        maxHeight: 240, overflowY: "auto", marginBottom: 14,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {messages.length === 0 && (
          <p style={{ textAlign: "center", fontSize: 12, color: "#bbb", padding: "16px 0" }}>No messages yet.</p>
        )}
        {messages.map((m, i) => {
          const isMe = m.sender === "user";
          return (
            <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "75%", padding: "10px 14px", borderRadius: 18,
                fontSize: 13, lineHeight: 1.45,
                background: isMe ? `linear-gradient(135deg, ${T.plum}, ${T.plum2})` : "#f0edf8",
                color: isMe ? "#fff" : T.ink,
                borderBottomRightRadius: isMe ? 4 : 18,
                borderBottomLeftRadius:  isMe ? 18 : 4,
              }}>
                <p style={{ margin: 0 }}>{m.text}</p>
                <p style={{ margin: "4px 0 0", fontSize: 10, color: isMe ? "rgba(255,255,255,.6)" : "#aaa" }}>
                  {m.senderName || (isMe ? "You" : inq.builderName)}
                  {m.sentAt ? ` · ${new Date(m.sentAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      {!isClosed ? (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            style={{
              flex: 1, background: T.mist, border: `1.5px solid ${T.line}`, borderRadius: 12,
              padding: "10px 16px", fontSize: 13, color: T.ink, outline: "none", fontFamily: T.sans,
            }}/>
          <button onClick={send} disabled={sending || !text.trim()} style={{
            background: `linear-gradient(135deg, ${T.plum}, ${T.plum2})`, color: "#fff",
            border: "none", padding: "10px 18px", borderRadius: 12, fontSize: 13,
            fontWeight: 700, cursor: "pointer", fontFamily: T.sans,
            boxShadow: `0 3px 10px ${T.glow}`, opacity: (sending || !text.trim()) ? 0.4 : 1,
          }}>{sending ? "…" : "Send"}</button>
        </div>
      ) : (
        <div style={{
          textAlign: "center", padding: 12, fontSize: 12, color: "#aaa",
          background: T.mist, borderRadius: 10, fontStyle: "italic",
        }}>This inquiry is closed. No further messages can be sent.</div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user, logout }       = useAuth();
  const [tab,         setTab]         = useState("designs");
  const [designs,     setDesigns]     = useState([]);
  const [inquiries,   setInquiries]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showGen,     setShowGen]     = useState(false);
  const [openChat,    setOpenChat]    = useState(null);
  const [viewDesign,  setViewDesign]  = useState(null);
  const [deleteTarget,setDeleteTarget]= useState(null); // { id, source: 'design'|'inquiry' }
  const [deleting,    setDeleting]    = useState(null);

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
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
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

  const handleDeleteInquiry = async (id) => {
    setDeleting(id);
    try {
      await apiFetch(`/api/inquiries/${id}`, { method: "DELETE" });
      toast.success("Chat deleted");
      setInquiries(prev => prev.filter(i => i.id !== id));
      if (openChat === id) setOpenChat(null);
    } catch { toast.error("Failed to delete chat"); }
    finally { setDeleting(null); setDeleteTarget(null); }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.source === "inquiry") handleDeleteInquiry(deleteTarget.id);
    else handleDelete(deleteTarget.id);
  };

  const newReplies = inquiries.filter(i => i.status === "replied").length;

  // ── Shared button styles ──
  const btnPrimary = {
    background: `linear-gradient(135deg, ${T.plum} 0%, ${T.plum2} 100%)`,
    color: "#fff", border: "none", padding: "12px 22px", borderRadius: 12,
    fontSize: 13, fontWeight: 700, cursor: "pointer",
    boxShadow: `0 6px 20px ${T.glow}`, fontFamily: T.sans, whiteSpace: "nowrap",
  };

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div style={{ fontFamily: T.sans, background: T.mist, minHeight: "100vh", color: T.ink }}>

        {/* ── Topbar ── */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${T.line}`, padding: "0 32px",
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: `linear-gradient(135deg, ${T.plum}, ${T.plum2})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 12px ${T.glow}`,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" stroke="white" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              </div>
              <span style={{ fontFamily: T.sans, fontWeight: 800, fontSize: 14, color: T.ink }}>
                Decor<span style={{ color: T.plum }}>Gen</span>
              </span>
            </a>
            <span style={{ color: "#ddd" }}>/</span>
            <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>My Dashboard</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: ".04em",
              background: "#ede9ff", color: T.plum, border: "1px solid #d4c8f8",
              padding: "3px 10px", borderRadius: 20,
            }}>USER</span>
            <button onClick={logout} style={{
              fontSize: 13, color: "#ef4444", fontWeight: 600,
              cursor: "pointer", border: "none", background: "none", fontFamily: T.sans,
            }}>Sign Out</button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>

          {/* Welcome */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 40, gap: 16, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontFamily: T.serif, fontSize: 38, lineHeight: 1.15, color: T.ink, margin: 0 }}>
                Hey, {user?.name?.split(" ")[0] || "Designer"} 👋
              </h1>
              <p style={{ fontSize: 14, color: "#777", marginTop: 6, fontWeight: 400 }}>
                Your AI designs and designer conversations, all in one place.
              </p>
            </div>
            <button style={btnPrimary} onClick={() => setShowGen(true)}>+ New Design</button>
          </div>

     {/* Stats */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 16,
    marginBottom: 40,
  }}
>
  {[
    { icon: "✨", label: "Generated", val: designs.filter(d => d.type === "generate").length },
    { icon: "🔧", label: "Enhanced", val: designs.filter(d => d.type === "enhance").length },
    { icon: "🤝", label: "Designer Chats", val: inquiries.length },
    { icon: "📁", label: "Total Saved", val: designs.length },
  ].map(s => (
    <div
      key={s.label}
      style={{
        background: "#fff",
        border: `1px solid ${T.line}`,
        borderRadius: 18,
        padding: "22px 20px",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all .25s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 12px 30px ${T.glow}`;
        e.currentTarget.style.border = `1px solid ${T.plum}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.border = `1px solid ${T.line}`;
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 10 }}>{s.icon}</div>

      <div
        style={{
          fontFamily: T.serif,
          fontSize: 34,
          color: T.ink,
        }}
      >
        {s.val}
      </div>

      <div
        style={{
          fontSize: 11,
          color: "#888",
          fontWeight: 600,
          letterSpacing: ".04em",
          textTransform: "uppercase",
          marginTop: 4,
        }}
      >
        {s.label}
      </div>
    </div>
  ))}
</div>

          {/* Tabs */}
          <div style={{
            display: "flex", gap: 4, background: "#ede9ff", border: `1px solid ${T.line}`,
            borderRadius: 12, padding: 4, width: "fit-content", marginBottom: 28,
          }}>
            {[["designs", "My Designs"], ["inquiries", "My Chats"]].map(([v, l]) => (
              <button key={v} onClick={() => setTab(v)} style={{
                padding: "8px 20px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                cursor: "pointer", border: "none", fontFamily: T.sans,
                display: "flex", alignItems: "center", gap: 6,
                background: tab === v ? `linear-gradient(135deg, ${T.plum}, ${T.plum2})` : "none",
                color: tab === v ? "#fff" : "#666",
                boxShadow: tab === v ? `0 2px 10px ${T.glow}` : "none",
              }}>
                {l}
                {v === "inquiries" && newReplies > 0 && (
                  <span style={{
                    background: "#ef4444", color: "#fff", fontSize: 10,
                    fontWeight: 800, padding: "2px 6px", borderRadius: 20,
                  }}>{newReplies}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div style={{
              width: 36, height: 36, border: `2.5px solid ${T.line}`,
              borderTopColor: T.plum, borderRadius: "50%",
              animation: "spin .7s linear infinite", margin: "60px auto",
            }}/>
          ) : (
            <>
              {/* ── Designs tab ── */}
              {tab === "designs" && (
                designs.length === 0 ? (
                  <div style={{
                    textAlign: "center", padding: "60px 20px", background: "#fff",
                    border: `1px solid ${T.line}`, borderRadius: 20, color: "#bbb",
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#888" }}>No designs yet</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Click "New Design" to get started</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {designs.map((d, idx) => (
                      <div key={d.id} style={{
                        background: "#fff", border: `1px solid ${T.line}`,
                        borderTop: idx === 0 ? undefined : "none",
                        borderRadius: idx === 0 && designs.length === 1 ? 16
                          : idx === 0 ? "16px 16px 0 0"
                          : idx === designs.length - 1 ? "0 0 16px 16px" : 0,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        gap: 16, padding: "16px 20px",
                      }}>
                        {/* Left */}
                        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
                          {d.generatedImageUrl ? (
                            <Img src={d.generatedImageUrl} alt={d.roomType} style={{
                              width: 52, height: 52, borderRadius: 10, objectFit: "cover",
                              flexShrink: 0, border: `2px solid ${T.line}`, background: "#f0edf8",
                            }}/>
                          ) : (
                            <div style={{
                              width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                              border: `2px solid ${T.line}`,
                              background: "linear-gradient(135deg,#ede9ff,#f4f3f8)",
                              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                            }}>🛋️</div>
                          )}
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                              <span style={{ fontSize: 15, fontWeight: 600, color: T.ink, textTransform: "capitalize" }}>
                                {d.roomType || "Room"}
                              </span>
                              {d.style && <span style={CHIPS.style}>{d.style}</span>}
                              <span style={d.type === "enhance" ? CHIPS.enhance : CHIPS.gen}>
                                {d.type === "enhance" ? "enhanced" : "generated"}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: "#aaa" }}>{fmtDate(d.createdAt)}</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          {d.generatedImageUrl && (
                            <button onClick={() => downloadBlob(d.generatedImageUrl)} style={{
                              fontSize: 12, fontWeight: 600, color: "#555",
                              background: "#f6f5fa", border: `1px solid ${T.line}`,
                              padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontFamily: T.sans,
                            }}>↓</button>
                          )}
                          <button onClick={() => setViewDesign(d)} style={{
                            fontSize: 12, fontWeight: 700, color: T.plum,
                            background: "#ede9ff", border: "1px solid #d4c8f8",
                            padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontFamily: T.sans,
                          }}>View →</button>
                          <button
                            disabled={deleting === d.id}
                            onClick={() => setDeleteTarget({ id: d.id, source: "design" })}
                            style={{
                              fontSize: 12, fontWeight: 600, color: "#ef4444",
                              background: "#fff5f5", border: "1px solid #fecaca",
                              padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontFamily: T.sans,
                              opacity: deleting === d.id ? 0.5 : 1,
                            }}>{deleting === d.id ? "…" : "Delete"}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* ── Inquiries tab ── */}
              {tab === "inquiries" && (
                inquiries.length === 0 ? (
                  <div style={{
                    textAlign: "center", padding: "60px 20px", background: "#fff",
                    border: `1px solid ${T.line}`, borderRadius: 20, color: "#bbb",
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🤝</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#888" }}>No chats yet</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Generate a design and connect with a designer!</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {inquiries.map(inq => (
                      <div key={inq.id} style={{
                        background: "#fff",
                        border: `1.5px solid ${openChat === inq.id ? T.plum : T.line}`,
                        borderRadius: 20, padding: 22,
                        boxShadow: openChat === inq.id ? `0 4px 24px ${T.glow}` : "none",
                      }}>
                        {/* Inquiry header */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>{inq.builderName}</span>
                              {inq.style && <span style={CHIPS.style}>{inq.style}</span>}
                            </div>
                            <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>{fmtDate(inq.createdAt)}</div>
                            {inq.budget && <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>Budget: {inq.budget}</div>}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
                              letterSpacing: ".04em", textTransform: "uppercase",
                              ...(STATUS_STYLES[inq.status] || STATUS_STYLES.new),
                            }}>{inq.status}</span>

                            {inq.status !== "closed" && (
                              <button
                                onClick={() => setOpenChat(openChat === inq.id ? null : inq.id)}
                                style={{
                                  fontSize: 12, fontWeight: 700, padding: "7px 16px", borderRadius: 10,
                                  cursor: "pointer", fontFamily: T.sans,
                                  border: `1.5px solid ${openChat === inq.id ? "#c4b3f0" : T.line}`,
                                  background: openChat === inq.id ? "#ede9ff" : T.mist,
                                  color: openChat === inq.id ? T.plum : "#555",
                                }}>
                                {openChat === inq.id ? "Close ↑" : "💬 Chat"}
                              </button>
                            )}

                            <button
                              disabled={deleting === inq.id}
                              onClick={() => setDeleteTarget({ id: inq.id, source: "inquiry" })}
                              style={{
                                fontSize: 12, fontWeight: 600, color: "#ef4444",
                                background: "#fff5f5", border: "1px solid #fecaca",
                                padding: "7px 12px", borderRadius: 10, cursor: "pointer",
                                fontFamily: T.sans, opacity: deleting === inq.id ? 0.5 : 1,
                              }}>{deleting === inq.id ? "…" : "Delete"}</button>
                          </div>
                        </div>

                        {/* Chat thread */}
                        {openChat === inq.id && (
                          <InquiryChat inq={inq} onReload={load}/>
                        )}

                        {/* Reply preview (when chat closed) */}
                        {openChat !== inq.id && inq.builderReply && (
                          <div style={{
                            marginTop: 14, background: "#f7f5ff",
                            border: "1px solid #e4dcf8", borderRadius: 12, padding: "12px 16px",
                          }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: T.plum, marginBottom: 3 }}>
                              Latest from {inq.builderName}:
                            </p>
                            <p style={{
                              fontSize: 13, color: "#444", margin: 0,
                              display: "-webkit-box", WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical", overflow: "hidden",
                            }}>{inq.builderReply}</p>
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

      {/* ── Design view modal ── */}
      {viewDesign && (
        <DesignViewModal
          design={viewDesign}
          fmtDate={fmtDate}
          onClose={() => setViewDesign(null)}
          onDelete={() => setDeleteTarget({ id: viewDesign.id, source: "design" })}
        />
      )}

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <DeleteConfirm
          title={deleteTarget.source === "inquiry" ? "Delete Chat?" : "Delete Design?"}
          subtitle={
            deleteTarget.source === "inquiry"
              ? "This will permanently remove this chat and all messages. This cannot be undone."
              : "This will permanently remove this design from your history. This cannot be undone."
          }
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}

      {/* ── Generator modal ── */}
      {showGen && <GeneratorModal onClose={() => { setShowGen(false); load(); }}/>}

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}