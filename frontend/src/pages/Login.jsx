import { useState, useEffect } from "react";
import { Link, useNavigate }   from "react-router-dom";
import { useAuth }             from "../context/AuthContext";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const { login, loginWithGoogle, isLoggedIn, role, setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn || !loggedIn) return;
    if (role === "ADMIN")   navigate("/admin/dashboard",   { replace: true });
    else if (role === "BUILDER") navigate("/builder/dashboard", { replace: true });
    else                    navigate("/dashboard",          { replace: true });
  }, [isLoggedIn, role, loggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { toast.error("Please fill all fields"); return; }
    setLoading(true);
    try {
      await login(email.trim(), password.trim());
      setIsLoggedIn(true); setLoggedIn(true);
    } catch (err) {
      const m = { "auth/invalid-credential":"Incorrect email or password.", "auth/user-not-found":"No account found.", "auth/wrong-password":"Incorrect password." }[err.code] || err.message;
      toast.error(m);
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try { await loginWithGoogle(); setIsLoggedIn(true); setLoggedIn(true); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const inp = "pl-10 w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-md shadow-purple-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" stroke="white" strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="white"/></svg>
            </div>
            <span className="text-xl font-extrabold text-gray-900">Decor<span className="text-purple-600">Gen</span></span>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to access your designs</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl shadow-purple-100/50">
          <button onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 text-sm font-medium text-gray-700 hover:border-purple-400 hover:bg-purple-50 transition mb-5 disabled:opacity-50">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <div className="flex items-center gap-3 mb-5"><div className="flex-1 h-px bg-gray-200"/><span className="text-xs text-gray-400">or</span><div className="flex-1 h-px bg-gray-200"/></div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative"><FaEnvelope className="absolute top-3.5 left-3.5 text-purple-400 text-sm"/>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="Email address" className={inp}/>
            </div>
            <div className="relative"><FaLock className="absolute top-3.5 left-3.5 text-purple-400 text-sm"/>
              <input type={showPwd?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Password" className={inp + " pr-10"}/>
              <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute top-3.5 right-3.5 text-gray-400 hover:text-purple-600">{showPwd?<FaEyeSlash/>:<FaEye/>}</button>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:opacity-90 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50 shadow-lg shadow-purple-200">
              {loading?"Signing in...":"Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">Don't have an account?{" "}
            <Link to="/register" className="text-purple-600 font-semibold hover:underline">Register free</Link>
          </p>
        </div>
        <p className="text-center mt-4"><Link to="/" className="text-sm text-gray-400 hover:text-purple-600 transition">← Back to Home</Link></p>
      </div>
    </div>
  );
}
