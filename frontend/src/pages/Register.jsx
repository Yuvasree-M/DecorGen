import { useState }         from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth }           from "../context/AuthContext";
import { FaUser, FaPhone, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

export default function Register() {
  const [form,    setForm]    = useState({ name:"", phone:"", email:"", password:"", confirm:"" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register }          = useAuth();
  const navigate              = useNavigate();
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    if (form.name.trim().length < 2)     { toast.error("Name must be at least 2 characters"); return false; }
    if (!/^\d{10}$/.test(form.phone))    { toast.error("Phone must be exactly 10 digits"); return false; }
    if (!/\S+@\S+\.\S+/.test(form.email)){ toast.error("Invalid email address"); return false; }
    if (form.password.length < 6)         { toast.error("Password must be at least 6 characters"); return false; }
    if (form.password !== form.confirm)   { toast.error("Passwords do not match"); return false; }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.email, form.password, form.name, form.phone);
      toast.success("Registration successful! Please sign in.");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      const m = { "auth/email-already-in-use":"Email already registered.", "auth/weak-password":"Password needs 6+ characters." }[err.code] || err.message;
      toast.error(m);
    } finally { setLoading(false); }
  };

  const inp = "pl-10 w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-md shadow-purple-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" stroke="white" strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="white"/></svg>
            </div>
            <span className="text-xl font-extrabold text-gray-900">Decor<span className="text-purple-600">Gen</span></span>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Create Account</h1>
         
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl shadow-purple-100/50">
          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { k:"name",  Icon:FaUser,     type:"text",  ph:"Full Name (min 2 chars)" },
              { k:"phone", Icon:FaPhone,    type:"tel",   ph:"Phone Number (10 digits)" },
              { k:"email", Icon:FaEnvelope, type:"email", ph:"Email Address" },
            ].map(({ k, Icon, type, ph }) => (
              <div key={k} className="relative">
                <Icon className="absolute top-3.5 left-3.5 text-purple-400 text-sm"/>
                <input type={type} value={form[k]} onChange={set(k)} required placeholder={ph} className={inp}/>
              </div>
            ))}

            <div className="relative"><FaLock className="absolute top-3.5 left-3.5 text-purple-400 text-sm"/>
              <input type={showPwd?"text":"password"} value={form.password} onChange={set("password")} required placeholder="Password (min 6 chars)" className={inp + " pr-10"}/>
              <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute top-3.5 right-3.5 text-gray-400 hover:text-purple-600">{showPwd?<FaEyeSlash/>:<FaEye/>}</button>
            </div>
            <div className="relative"><FaLock className="absolute top-3.5 left-3.5 text-purple-400 text-sm"/>
              <input type="password" value={form.confirm} onChange={set("confirm")} required placeholder="Confirm Password" className={inp}/>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:opacity-90 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50 shadow-lg shadow-purple-200 mt-1">
              {loading?"Creating account...":"Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">Already have an account?{" "}
            <Link to="/login" className="text-purple-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
        <p className="text-center mt-4"><Link to="/" className="text-sm text-gray-400 hover:text-purple-600 transition">← Back to Home</Link></p>
      </div>
    </div>
  );
}
