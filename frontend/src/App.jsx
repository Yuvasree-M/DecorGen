import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider, useAuth } from "./context/AuthContext";

const Loader = () => (
  <div className="flex items-center justify-center h-screen bg-violet-50">
    <div className="text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg shadow-purple-200">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" stroke="white" strokeWidth="2"/>
          <circle cx="12" cy="12" r="3" fill="white"/>
        </svg>
      </div>
      <p className="text-sm text-purple-600 font-medium">Loading DecorGen...</p>
    </div>
  </div>
);

const Home             = React.lazy(() => import("./pages/Home"));
const Login            = React.lazy(() => import("./pages/Login"));
const Register         = React.lazy(() => import("./pages/Register"));
const UserDashboard    = React.lazy(() => import("./pages/UserDashboard"));
const AdminDashboard   = React.lazy(() => import("./pages/admin/AdminDashboard"));
const BuilderDashboard = React.lazy(() => import("./pages/builder/BuilderDashboard"));

const ProtectedRoute = ({ children, roles }) => {
  const { isLoggedIn, loading, role } = useAuth();
  if (loading) return <Loader />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) {
    // wrong role — redirect to their correct dashboard
    if (role === "ADMIN")   return <Navigate to="/admin/dashboard"   replace />;
    if (role === "BUILDER") return <Navigate to="/builder/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const HomeRedirect = () => {
  const { isLoggedIn, role, loading } = useAuth();
  if (loading) return <Loader />;
  if (isLoggedIn) {
    if (role === "ADMIN")   return <Navigate to="/admin/dashboard"   replace />;
    if (role === "BUILDER") return <Navigate to="/builder/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <Home />;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/"         element={<HomeRedirect />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={
            <ProtectedRoute roles={["USER"]}><UserDashboard /></ProtectedRoute>
          }/>
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>
          }/>
          <Route path="/builder/dashboard" element={
            <ProtectedRoute roles={["BUILDER"]}><BuilderDashboard /></ProtectedRoute>
          }/>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ToastContainer position="top-center" autoClose={3000} theme="light" />
    </BrowserRouter>
  );
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}
