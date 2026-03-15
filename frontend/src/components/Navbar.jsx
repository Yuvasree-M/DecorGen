// import { useState, useEffect, useRef } from "react";
// import { Link, NavLink, useNavigate } from "react-router-dom";
// import { HashLink } from "react-router-hash-link";
// import { useAuth }                     from "../context/AuthContext";
// import { FaBars, FaTimes, FaUserCircle, FaArrowUp } from "react-icons/fa";

// const PUBLIC_LINKS = [
//   { label: "Home", href: "#home" },
//   { label: "About", href: "#about" },
//   { label: "How It Works", href: "#how-it-works" },
//   { label: "FAQ", href: "#faq" },
//   { label: "Contact", href: "#contact" },
// ];
// export default function Navbar({ onOpenGenerator }) {
//   const { user, isLoggedIn, role, logout } = useAuth();
//   const navigate = useNavigate();

//   const [scrolled,       setScrolled]       = useState(false);
//   const [activeSection,  setActiveSection]  = useState("home");
//   const [showScrollUp,   setShowScrollUp]   = useState(false);
//   const [mobileOpen,     setMobileOpen]     = useState(false);
//   const [profileOpen,    setProfileOpen]    = useState(false);
//   const [showLogoutModal,setShowLogoutModal]= useState(false);

//   const profileRef    = useRef(null);
//   const mobileMenuRef = useRef(null);

//   useEffect(() => {
//     const ids = PUBLIC_LINKS.map(l => l.href.replace("#",""));
//     const onScroll = () => {
//       const pos = window.scrollY + 120;
//       setScrolled(window.scrollY > 40);
//       setShowScrollUp(window.scrollY > 300);
//       for (const id of ids) {
//         const el = document.getElementById(id);
//         if (el && pos >= el.offsetTop && pos < el.offsetTop + el.offsetHeight) { setActiveSection(id); break; }
//       }
//     };
//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   useEffect(() => {
//     const h = (e) => {
//       if (profileRef.current    && !profileRef.current.contains(e.target))    setProfileOpen(false);
//       if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) setMobileOpen(false);
//     };
//     document.addEventListener("mousedown", h);
//     return () => document.removeEventListener("mousedown", h);
//   }, []);

//   const closeAll = () => { setProfileOpen(false); setMobileOpen(false); setShowLogoutModal(false); };

//   const linkCls = (id) =>
//     `transition-colors px-3 py-1 text-sm font-medium rounded ${
//       activeSection === id
//         ? "text-purple-700 font-semibold border-b-2 border-purple-600"
//         : "text-gray-600 hover:text-purple-600"
//     }`;

//   const getDashPath = () => {
//     if (role === "ADMIN")   return "/admin/dashboard";
//     if (role === "BUILDER") return "/builder/dashboard";
//     return "/dashboard";
//   };

//   const roleBadge = {
//     ADMIN:   "bg-amber-100 text-amber-700 border border-amber-300",
//     BUILDER: "bg-blue-100  text-blue-700  border border-blue-300",
//     USER:    "bg-purple-100 text-purple-700 border border-purple-300",
//   }[role] || "bg-gray-100 text-gray-600";

//   return (
//     <>
//       <nav className={`w-full fixed top-0 z-50 transition-all duration-300 ${
//         scrolled ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200" : "bg-white/80 backdrop-blur-sm"
//       }`}>
//         <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">

//           {/* Logo */}
//           <a href={isLoggedIn ? getDashPath() : "/#home"} className="flex items-center gap-2.5" onClick={closeAll}>
//             <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-md shadow-purple-200">
//               <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
//                 <path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" stroke="white" strokeWidth="2"/>
//                 <circle cx="12" cy="12" r="3" fill="white"/>
//               </svg>
//             </div>
//             <span className="text-xl font-extrabold text-gray-900 tracking-tight">
//   Decor<span className="text-purple-600">Gen</span>
// </span>
//           </a>

//           {/* Desktop nav */}
//           <div className="hidden md:flex items-center gap-1">
//             {!isLoggedIn && PUBLIC_LINKS.map(l => (
//            <HashLink
//   smooth
//   key={l.href}
//   to={`/${l.href}`}
//   className={linkCls(l.href.replace("#",""))}
// >
//   {l.label}
// </HashLink>
//             ))}
//             {isLoggedIn && role === "USER" && (
//               <>
//                 <NavLink to="/dashboard" className={({isActive})=>`px-3 py-1 text-sm font-medium rounded transition-colors ${isActive?"text-purple-700 font-semibold":"text-gray-600 hover:text-purple-600"}`}>Dashboard</NavLink>
//                 <a href="/#how-it-works" className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-purple-600 rounded transition-colors">How It Works</a>
//               </>
//             )}
//             {isLoggedIn && role === "ADMIN" && (
//               <NavLink to="/admin/dashboard" className={({isActive})=>`px-3 py-1 text-sm font-medium rounded transition-colors ${isActive?"text-purple-700 font-semibold":"text-gray-600 hover:text-purple-600"}`}>Admin Panel</NavLink>
//             )}
//             {isLoggedIn && role === "BUILDER" && (
//               <NavLink to="/builder/dashboard" className={({isActive})=>`px-3 py-1 text-sm font-medium rounded transition-colors ${isActive?"text-purple-700 font-semibold":"text-gray-600 hover:text-purple-600"}`}>Builder Panel</NavLink>
//             )}
//           </div>

//           {/* Desktop right */}
//           <div className="hidden md:flex items-center gap-3">
//             {!isLoggedIn ? (
//               <>
               
//                 <button onClick={onOpenGenerator}
//                   className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-violet-600 hover:opacity-90 text-white px-5 py-2 rounded-lg shadow-md shadow-purple-200 transition">
//                   Try Free 
//                 </button>
                
//               </>
//             ) : (
//               <>
//                 <span className="text-sm text-gray-500 hidden lg:block">{user?.name || user?.email}</span>
//                 <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${roleBadge}`}>{role}</span>
//                 <button onClick={() => setShowLogoutModal(true)}
//                   className="text-sm text-red-500 hover:text-red-600 font-medium transition">Sign Out</button>
//               </>
//             )}
//             <div className="relative" ref={profileRef}>
//               <FaUserCircle size={24} className="cursor-pointer text-purple-500 hover:text-purple-700 transition" onClick={() => setProfileOpen(!profileOpen)}/>
//               {profileOpen && (
//                 <div className="absolute right-0 mt-3 w-44 bg-white border border-gray-200 shadow-xl rounded-xl p-3 space-y-1">
//                   {!isLoggedIn ? (
//                     <>
//                       <Link to="/login"    onClick={closeAll} className="block text-sm text-gray-700 hover:text-purple-600 py-1.5 px-2 rounded hover:bg-purple-50 transition">Sign In</Link>
//                       <Link to="/register" onClick={closeAll} className="block text-sm text-gray-700 hover:text-purple-600 py-1.5 px-2 rounded hover:bg-purple-50 transition">Register</Link>
//                     </>
//                   ) : (
//                     <>
//                       <p className="text-xs text-gray-400 truncate pb-2 mb-1 border-b border-gray-100 px-2">{user?.email}</p>
//                       <Link to={getDashPath()} onClick={closeAll} className="block text-sm text-gray-700 hover:text-purple-600 py-1.5 px-2 rounded hover:bg-purple-50 transition">Dashboard</Link>
//                       <button onClick={() => { closeAll(); setShowLogoutModal(true); }} className="block w-full text-left text-sm text-red-500 hover:text-red-600 py-1.5 px-2 rounded hover:bg-red-50 transition">Sign Out</button>
//                     </>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Mobile */}
//           <div className="md:hidden flex items-center gap-3">
//             {!isLoggedIn && <button onClick={onOpenGenerator} className="text-xs font-semibold bg-gradient-to-r from-purple-600 to-violet-600 text-white px-3 py-2 rounded-lg">Try Free</button>}
//             <button onClick={() => setMobileOpen(!mobileOpen)}>
//               {mobileOpen ? <FaTimes size={22} className="text-purple-600"/> : <FaBars size={22} className="text-purple-600"/>}
//             </button>
//           </div>
//         </div>

//         {/* Mobile menu */}
//         {mobileOpen && (
//           <div ref={mobileMenuRef} className="md:hidden bg-white border-t border-gray-200 px-6 py-5 space-y-1 shadow-lg">
//             {!isLoggedIn ? (
//               <>
//                 {PUBLIC_LINKS.map(l => (
//                   <a key={l.href} href={l.href} onClick={closeAll} className="block py-2.5 text-sm font-medium text-gray-700 hover:text-purple-600 border-b border-gray-100">{l.label}</a>
//                 ))}
//                 <Link to="/login"    onClick={closeAll} className="block py-2.5 text-sm font-medium text-gray-700">Sign In</Link>
//                 <Link to="/register" onClick={closeAll} className="block py-2.5 text-sm font-semibold text-purple-600">Register Free</Link>
//               </>
//             ) : (
//               <>
//                 <p className="text-xs text-gray-400 py-1">{user?.name} · <span className={`font-bold`}>{role}</span></p>
//                 <Link to={getDashPath()} onClick={closeAll} className="block py-2.5 text-sm font-medium text-purple-600">Dashboard</Link>
//                 <button onClick={() => { setShowLogoutModal(true); setMobileOpen(false); }} className="block py-2.5 text-sm font-medium text-red-500 w-full text-left">Sign Out</button>
//               </>
//             )}
//           </div>
//         )}
//       </nav>

//       {/* Scroll top */}
//       {showScrollUp && (
//         <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}
//           className="fixed bottom-6 right-6 bg-gradient-to-br from-purple-600 to-violet-700 text-white p-3 rounded-full shadow-lg shadow-purple-300 z-50 hover:opacity-90 transition">
//           <FaArrowUp/>
//         </button>
//       )}

//       {/* Logout modal */}
//       {showLogoutModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
//           <div className="bg-white border border-gray-200 rounded-2xl p-7 w-80 text-center shadow-2xl">
//             <p className="text-gray-700 mb-6 font-medium">Are you sure you want to sign out?</p>
//             <div className="flex justify-center gap-3">
//               <button onClick={() => { logout(); setShowLogoutModal(false); navigate("/"); }}
//                 className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition">Yes, Sign Out</button>
//               <button onClick={() => setShowLogoutModal(false)}
//                 className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold text-sm transition">Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useAuth } from "../context/AuthContext";
import { FaBars, FaTimes } from "react-icons/fa";

const PUBLIC_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar({ onOpenGenerator }) {
  const { user, isLoggedIn, role, logout } = useAuth();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");

  const mobileMenuRef = useRef(null);

  const activeHash = activeSection;

  /* Navbar shadow when scrolling */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Scroll spy for active link */
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      {
        threshold: 0.6,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  /* Close mobile menu when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeAll = () => {
    setMobileOpen(false);
    setShowLogoutModal(false);
  };

  const getDashPath = () => {
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "BUILDER") return "/builder/dashboard";
    return "/dashboard";
  };

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-gray-200/95 backdrop-blur-md shadow-md border-b border-gray-300"
            : "bg-gray-100/90 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* Logo */}
          <a
            href={isLoggedIn ? getDashPath() : "/#home"}
            className="flex items-center gap-3"
            onClick={closeAll}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" stroke="white" strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="white"/></svg>
            </div>

            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              DecorGen
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {!isLoggedIn &&
              PUBLIC_LINKS.map((l) => (
                <HashLink
                  smooth
                  key={l.href}
                  to={`/${l.href}`}
                  className={`text-sm font-medium pb-1 border-b-2 transition ${
                    activeHash === l.href
                      ? "text-purple-700 border-purple-600"
                      : "text-gray-700 border-transparent hover:text-purple-600"
                  }`}
                >
                  {l.label}
                </HashLink>
              ))}

            {isLoggedIn && (
              <NavLink
                to={getDashPath()}
                className={({ isActive }) =>
                  `text-sm font-medium pb-1 border-b-2 transition ${
                    isActive
                      ? "text-purple-700 border-purple-600"
                      : "text-gray-700 border-transparent hover:text-purple-600"
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold border border-gray-400 px-4 py-2 rounded-lg text-gray-700 hover:border-purple-500 hover:text-purple-600 hover:bg-white transition"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-violet-600 text-white px-5 py-2 rounded-lg shadow-md hover:scale-105 transition"
                >
                  Get Started
                </Link>

                <button
                  onClick={onOpenGenerator}
                  className="text-sm font-semibold bg-white text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition"
                >
                  Try Free
                </button>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-600 hidden lg:block">
                  {user?.name || user?.email}
                </span>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>

          {/* Mobile Button */}
          <div className="md:hidden">
            <button onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? (
                <FaTimes size={22} className="text-purple-600" />
              ) : (
                <FaBars size={22} className="text-purple-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden bg-gray-100 border-t border-gray-300 px-6 py-5 space-y-4 shadow-lg"
          >
            {!isLoggedIn ? (
              <>
                {PUBLIC_LINKS.map((l) => (
                  <HashLink
                    smooth
                    key={l.href}
                    to={`/${l.href}`}
                    onClick={closeAll}
                    className={`block text-sm font-medium border-b-2 pb-1 ${
                      activeHash === l.href
                        ? "text-purple-700 border-purple-600"
                        : "text-gray-700 border-transparent"
                    }`}
                  >
                    {l.label}
                  </HashLink>
                ))}

                <Link
                  to="/login"
                  onClick={closeAll}
                  className="block text-center border border-gray-400 py-2 rounded-lg"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  onClick={closeAll}
                  className="block text-center bg-gradient-to-r from-purple-600 to-violet-600 text-white py-2 rounded-lg"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <NavLink
                  to={getDashPath()}
                  onClick={closeAll}
                  className={({ isActive }) =>
                    `block text-sm font-medium border-b-2 pb-1 ${
                      isActive
                        ? "text-purple-700 border-purple-600"
                        : "text-gray-700 border-transparent"
                    }`
                  }
                >
                  Dashboard
                </NavLink>

                <button
                  onClick={() => {
                    setShowLogoutModal(true);
                    setMobileOpen(false);
                  }}
                  className="block text-red-500 font-medium"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl p-7 w-80 text-center shadow-2xl">
            <p className="mb-6 font-medium">
              Are you sure you want to sign out?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  logout();
                  setShowLogoutModal(false);
                  navigate("/");
                }}
                className="bg-red-500 text-white px-5 py-2 rounded-lg"
              >
                Yes
              </button>

              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-gray-200 px-5 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}