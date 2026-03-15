import { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  onAuthStateChanged, signOut, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signInWithPopup, updateProfile
} from "firebase/auth";
import { auth, gProvider } from "../firebase";
import { apiFetch }        from "../services/api";

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export const AuthProvider = ({ children }) => {
  const [user,       setUser]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fb) => {
      setLoading(true);
      if (fb) {
        try {
          const data = await apiFetch("/api/auth/me");
          setUser({ uid: fb.uid, email: fb.email, ...data });
          setIsLoggedIn(true);
        } catch {
          setUser({ uid: fb.uid, email: fb.email, name: fb.displayName || "", role: "USER" });
          setIsLoggedIn(true);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login         = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
  const loginWithGoogle = ()        => signInWithPopup(auth, gProvider);
  const logout        = ()          => { signOut(auth); setIsLoggedIn(false); setUser(null); };

  // Register: name + phone only (no address)
  const register = async (email, pw, name, phone) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pw);
    if (name) await updateProfile(cred.user, { displayName: name });
    const token = await cred.user.getIdToken();
    await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, phone })
    });
    await signOut(auth); 
    return cred;
  };

  const refreshUser = async () => {
    try {
      const data = await apiFetch("/api/auth/me");
      setUser(prev => ({ ...prev, ...data }));
    } catch {}
  };

  const value = useMemo(() => ({
    user, loading, isLoggedIn, setIsLoggedIn,
    login, register, loginWithGoogle, logout, refreshUser,
    role: user?.role || "USER",
  }), [user, loading, isLoggedIn]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
