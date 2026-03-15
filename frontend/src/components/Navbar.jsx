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