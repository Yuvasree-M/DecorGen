import { useState, useEffect } from "react";
import { useAuth }             from "../../context/AuthContext";
import { apiFetch }            from "../../services/api";
import { toast }               from "react-toastify";

const ROLE_BADGE   = { ADMIN:"bg-amber-100 text-amber-700 border border-amber-300", BUILDER:"bg-blue-100 text-blue-700 border border-blue-300", USER:"bg-purple-100 text-purple-700 border border-purple-300" };
const STATUS_BADGE = { new:"bg-amber-100 text-amber-700 border border-amber-300", replied:"bg-purple-100 text-purple-700 border border-purple-300", closed:"bg-gray-100 text-gray-500 border border-gray-300", active:"bg-green-100 text-green-700 border border-green-300", inactive:"bg-gray-100 text-gray-500 border border-gray-300", pending:"bg-amber-100 text-amber-700 border border-amber-300" };

const Img = ({src,alt,cls}) => (
  <img src={src} alt={alt} className={cls}
    onError={e=>{e.target.onerror=null;e.target.src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=300&q=60";}}/>
);

function Stat({title,value,color}) {
  const c = {purple:"border-purple-200 bg-purple-50 text-purple-700",amber:"border-amber-200 bg-amber-50 text-amber-700",blue:"border-blue-200 bg-blue-50 text-blue-700",green:"border-green-200 bg-green-50 text-green-700"}[color]||"border-gray-200 bg-white text-gray-700";
  return <div className={`rounded-2xl border p-6 text-center shadow-sm ${c}`}><p className="text-xs font-medium text-gray-500 mb-1">{title}</p><h2 className="text-3xl font-extrabold">{value}</h2></div>;
}

/* ── Designs modal for a single user ── */
function UserDesignsModal({ group, onClose }) {
  const fmtDate = ts => { if(!ts)return"—"; const d=ts._seconds?new Date(ts._seconds*1000):new Date(ts); return d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-7 py-5 flex items-center justify-between rounded-t-3xl">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{group.userName}'s Designs</h3>
            <p className="text-xs text-gray-500 mt-0.5">{group.userEmail} · {group.designCount} design{group.designCount!==1?"s":""}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition">✕</button>
        </div>
        <div className="p-6 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {group.designs.map(d=>(
            <div key={d.id} className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden hover:border-purple-300 hover:shadow-md hover:shadow-purple-100 transition group">
              <div className="aspect-[4/3] overflow-hidden">
                <Img src={d.generatedImageUrl} alt={d.style||"design"} cls="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 capitalize">{d.type==="enhance"?"Enhanced":d.style||"Custom"}</span>
                  {d.roomType&&<span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full capitalize">{d.roomType}</span>}
                </div>
                <p className="text-xs text-gray-400 mt-1">{fmtDate(d.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout }         = useAuth();
  const [tab,        setTab]     = useState("users");
  const [users,      setUsers]   = useState([]);
  const [designGrps, setDesGrps] = useState([]);
  const [inquiries,  setInqs]    = useState([]);
  const [builders,   setBldrs]   = useState([]);
  const [loading,    setLoading] = useState(true);
  const [roleUpd,    setRoleUpd] = useState(null);
  const [viewUser,   setViewUser]= useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [u,dg,i,b] = await Promise.all([
        apiFetch("/api/users"),
        apiFetch("/api/builders/designs-by-user"),
        apiFetch("/api/inquiries/all"),
        apiFetch("/api/builders/all"),
      ]);
      setUsers(u); setDesGrps(dg); setInqs(i); setBldrs(b);
    } catch { toast.error("Failed to load admin data"); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const changeRole = async (uid, role) => {
    setRoleUpd(uid);
    try {
      await apiFetch(`/api/users/${uid}/role`,{method:"PATCH",body:JSON.stringify({role})});
      toast.success("Role updated to "+role);
      setUsers(prev=>prev.map(u=>u.id===uid?{...u,role}:u));
    } catch { toast.error("Failed"); }
    finally { setRoleUpd(null); }
  };

  const closeInquiry = async (id) => {
    try {
      await apiFetch(`/api/inquiries/${id}/status`,{method:"PATCH",body:JSON.stringify({status:"closed"})});
      toast.success("Inquiry closed");
      setInqs(prev=>prev.map(i=>i.id===id?{...i,status:"closed"}:i));
    } catch { toast.error("Failed"); }
  };

  const updateBuilderStatus = async (id, status) => {
    try {
      await apiFetch(`/api/builders/${id}/status`,{method:"PATCH",body:JSON.stringify({status})});
      toast.success("Builder status updated");
      setBldrs(prev=>prev.map(b=>b.id===id?{...b,status}:b));
    } catch { toast.error("Failed"); }
  };

  const fmtDate = ts => { if(!ts)return"—"; const d=ts._seconds?new Date(ts._seconds*1000):new Date(ts); return d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); };
  const totalDesigns = designGrps.reduce((s,g)=>s+g.designCount,0);
  const newInqs      = inquiries.filter(i=>i.status==="new").length;
  const TH = "px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wide";
  const TD = "px-4 py-3 text-sm";

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-violet-50">
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
            <span className="text-sm font-medium text-gray-500">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-500">{user?.email}</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-700 border border-amber-300 px-2.5 py-1 rounded-full">ADMIN</span>
            <button onClick={logout} className="text-sm text-red-500 hover:text-red-600 font-medium">Sign Out</button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-1">Admin Dashboard</h1>
          <p className="text-gray-500 mb-10">Manage users, builders, designs and inquiries</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            <Stat title="Total Users" value={users.length}     color="purple"/>
            <Stat title="Admins"      value={users.filter(u=>u.role==="ADMIN").length} color="amber"/>
            <Stat title="Builders"    value={users.filter(u=>u.role==="BUILDER").length} color="blue"/>
            <Stat title="Designs"     value={totalDesigns}     color="purple"/>
            <Stat title="Inquiries"   value={inquiries.length} color="green"/>
          </div>

          {newInqs>0&&(
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-center gap-3">
              <span className="text-xl">🔔</span>
              <p className="text-amber-800 font-medium text-sm"><strong>{newInqs}</strong> new unread {newInqs===1?"inquiry":"inquiries"} waiting.</p>
              <button onClick={()=>setTab("inquiries")} className="ml-auto text-xs font-semibold text-amber-700 hover:underline">View →</button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1 w-fit mb-8">
            {[["users","👥 Users"],["builders","🏗️ Builders"],["designs","✨ Designs"],["inquiries","🤝 Inquiries"]].map(([v,l])=>(
              <button key={v} onClick={()=>setTab(v)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab===v?"bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow":"text-gray-500 hover:text-gray-800"}`}>{l}</button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"/></div>
          ) : (
            <>
              {/* ── USERS ── */}
              {tab==="users"&&(
                <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-200">
                      <tr>{["Name","Email","Phone","Role","Joined","Change Role"].map(h=><th key={h} className={TH}>{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map(u=>(
                        <tr key={u.id} className="hover:bg-purple-50/30 transition">
                          <td className={`${TD} font-semibold text-gray-900`}>{u.name||"—"}</td>
                          <td className={`${TD} text-gray-600`}>{u.email}</td>
                          <td className={`${TD} text-gray-500`}>{u.phone||"—"}</td>
                          <td className={TD}><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ROLE_BADGE[u.role]||ROLE_BADGE.USER}`}>{u.role}</span></td>
                          <td className={`${TD} text-xs text-gray-400`}>{fmtDate(u.createdAt)}</td>
                          <td className={TD}>
                            <select value={u.role} onChange={e=>changeRole(u.id,e.target.value)} disabled={roleUpd===u.id}
                              className="bg-white border border-gray-300 text-gray-800 text-xs rounded-lg px-2 py-1.5 focus:border-purple-500 focus:outline-none disabled:opacity-50 cursor-pointer">
                              <option value="USER">USER</option><option value="BUILDER">BUILDER</option><option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!users.length&&<p className="text-center text-gray-400 py-10 text-sm">No users yet.</p>}
                </div>
              )}

              {/* ── BUILDERS ── */}
              {tab==="builders"&&(
                <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-200">
                      <tr>{["Name","Title","Location","Styles","Portfolio","Rating","Status","Action"].map(h=><th key={h} className={TH}>{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {builders.map(b=>(
                        <tr key={b.id} className="hover:bg-purple-50/30 transition">
                          <td className={`${TD} font-semibold text-gray-900`}>{b.name}</td>
                          <td className={`${TD} text-gray-600 text-xs`}>{b.title}</td>
                          <td className={`${TD} text-gray-500 text-xs`}>{b.location||"—"}</td>
                          <td className={TD}><div className="flex flex-wrap gap-1">{(b.styles||[]).slice(0,3).map(s=><span key={s} className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded capitalize">{s}</span>)}</div></td>
                          <td className={`${TD} text-gray-500 text-xs`}>{(b.portfolioImages||[]).length} photo{(b.portfolioImages||[]).length!==1?"s":""}</td>
                          <td className={`${TD} text-amber-600 font-semibold text-xs`}>★{b.rating||"5.0"}</td>
                          <td className={TD}><span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[b.status]||STATUS_BADGE.active}`}>{b.status||"active"}</span></td>
                          <td className={TD}>
                            <select value={b.status||"active"} onChange={e=>updateBuilderStatus(b.id,e.target.value)}
                              className="bg-white border border-gray-300 text-gray-800 text-xs rounded-lg px-2 py-1.5 focus:border-purple-500 focus:outline-none cursor-pointer">
                              <option value="active">Active</option><option value="inactive">Inactive</option><option value="pending">Pending</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!builders.length&&<p className="text-center text-gray-400 py-10 text-sm">No builders yet.</p>}
                </div>
              )}

              {/* ── DESIGNS BY USER ── */}
              {tab==="designs"&&(
                <div>
                  <p className="text-sm text-gray-500 mb-4">Click "View Designs" to see a user's generated images.</p>
                  {!designGrps.length ? (
                    <p className="text-center text-gray-400 py-10 text-sm">No designs yet.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                      <table className="min-w-full bg-white">
                        <thead className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-200">
                          <tr>{["User","Email","Designs","Preview","Action"].map(h=><th key={h} className={TH}>{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {designGrps.map(g=>(
                            <tr key={g.userId} className="hover:bg-purple-50/30 transition">
                              <td className={`${TD} font-semibold text-gray-900`}>{g.userName}</td>
                              <td className={`${TD} text-gray-500 text-xs`}>{g.userEmail||"—"}</td>
                              <td className={TD}><span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{g.designCount}</span></td>
                              <td className={TD}>
                                <div className="flex gap-1 items-center">
                                  {g.designs.slice(0,3).map(d=>(
                                    <Img key={d.id} src={d.generatedImageUrl} alt="" cls="w-9 h-9 object-cover rounded-lg border border-gray-200"/>
                                  ))}
                                  {g.designCount>3&&<span className="w-9 h-9 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-500 font-bold">+{g.designCount-3}</span>}
                                </div>
                              </td>
                              <td className={TD}>
                                <button onClick={()=>setViewUser(g)}
                                  className="text-xs bg-purple-100 hover:bg-purple-600 hover:text-white text-purple-700 border border-purple-200 px-3 py-1.5 rounded-xl transition font-semibold">
                                  View Designs →
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── INQUIRIES ── */}
              {tab==="inquiries"&&(
                <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-200">
                      <tr>{["User","Designer","Style","Budget","Status","Date","Action"].map(h=><th key={h} className={TH}>{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {inquiries.map(inq=>(
                        <tr key={inq.id} className="hover:bg-purple-50/30 transition">
                          <td className={`${TD} font-medium text-gray-900`}>{inq.userName||inq.userEmail||"Guest"}</td>
                          <td className={`${TD} text-gray-600`}>{inq.builderName||"—"}</td>
                          <td className={`${TD} text-xs text-gray-500 capitalize`}>{inq.style||"—"}</td>
                          <td className={`${TD} text-xs text-gray-500`}>{inq.budget||"—"}</td>
                          <td className={TD}><span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[inq.status]||STATUS_BADGE.new}`}>{inq.status}</span></td>
                          <td className={`${TD} text-xs text-gray-400`}>{fmtDate(inq.createdAt)}</td>
                          <td className={TD}>
                            {inq.status!=="closed"&&<button onClick={()=>closeInquiry(inq.id)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-lg transition">Close</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!inquiries.length&&<p className="text-center text-gray-400 py-10 text-sm">No inquiries yet.</p>}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {viewUser && <UserDesignsModal group={viewUser} onClose={()=>setViewUser(null)}/>}
    </>
  );
}
