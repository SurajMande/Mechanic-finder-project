"use client"

import { Link, useNavigate, useLocation } from "react-router-dom"
import { auth } from "../utils/auth"
import {Wrench, LogOut, User, Settings, Menu, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import toast from "react-hot-toast"

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef(null)

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState("")

  const isAuthenticated = auth.isAuthenticated()
  const userRole = auth.getUserRole()

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentUser(auth.getCurrentUser())
    }
  }, [isAuthenticated, location.pathname])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    auth.logout()
    toast.success("Logged out successfully")
    navigate("/")
    setIsProfileOpen(false)
    setIsMobileMenuOpen(false)
  }

  const isActivePath = (path) => location.pathname === path

  return (
    <nav className="sticky top-4 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div
          className="flex justify-between items-center h-16 px-4
          bg-white/70 backdrop-blur-xl
          border border-slate-200/60
          rounded-2xl shadow-lg"
        >
          {/* Logo */}
          <Link to="/" className="text-lg font-extrabold">
            <span className="text-slate-900">Mechanic</span>
            <span className="text-blue-600">Finder.</span>
          </Link>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <div className="hidden md:flex space-x-1">
              {userRole === "user" ? (
                <>
                  <NavLink to="/user/dashboard" active={isActivePath("/user/dashboard")}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/request" active={isActivePath("/request")}>
                    Request Service
                  </NavLink>
                </>
              ) : (
                <NavLink
                  to="/mechanic/dashboard"
                  active={isActivePath("/mechanic/dashboard")}
                >
                  Dashboard
                </NavLink>
              )}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Desktop – NOT authenticated */}
            {!isAuthenticated && (
              <div className="hidden md:flex gap-3">
                <Link to="/login" className="btn-ghost">Sign In</Link>
                <Link to="/signup" className="btn-primary">Get Started</Link>
              </div>
            )}

            {/* Profile Button (Desktop + Mobile when authenticated) */}
            {isAuthenticated && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen((p) => !p)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100/70"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>

                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold truncate max-w-28">
                      {currentUser || "User"}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">{userRole}</p>
                  </div>
                </button>

                {isProfileOpen && (
                  <Dropdown
                    currentUser={currentUser}
                    userRole={userRole}
                    onLogout={handleLogout}
                    navigate={navigate}
                    close={() => setIsProfileOpen(false)}
                  />
                )}
              </div>
            )}

            {/* Mobile Hamburger – ONLY if NOT authenticated */}
            {!isAuthenticated && (
              <button
                className="md:hidden p-2 rounded-xl hover:bg-slate-100/70"
                onClick={() => setIsMobileMenuOpen((p) => !p)}
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu – NOT authenticated only */}
        {!isAuthenticated && isMobileMenuOpen && (
          <div
            className="mt-3 md:hidden
            bg-white/90 backdrop-blur-xl
            rounded-2xl shadow-xl
            border border-slate-200 p-4 space-y-3"
          >
            <Link to="/login" className="btn-ghost w-full block text-center">
              Sign In
            </Link>
            <Link to="/signup" className="btn-primary w-full block text-center">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

/* =================== Helpers =================== */

const NavLink = ({ to, active, children }) => (
  <Link
    to={to}
    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
      active
        ? "bg-blue-100 text-blue-700"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
    }`}
  >
    {children}
  </Link>
)

const Dropdown = ({ currentUser, userRole, onLogout, navigate, close }) => (
  <div
    className="absolute right-0 mt-3 w-56 z-50
    bg-white/90 backdrop-blur-xl
    rounded-2xl shadow-xl
    border border-slate-200 py-2"
  >
    <div className="px-4 py-3 border-b">
      <p className="text-sm font-semibold truncate">{currentUser}</p>
    </div>

    <button
      onClick={() => {
        navigate(userRole === "mechanic" ? "/mechanic/dashboard" : "/user/dashboard")
        close()
      }}
      className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-slate-100"
    >
      <Settings className="h-4 w-4" />
      <span>Dashboard</span>
    </button>

    {userRole === "user" && (
      <button
        onClick={() => {
          navigate("/request")
          close()
        }}
        className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-slate-100"
      >
        <Wrench className="h-4 w-4 text-slate-600" />
        <span>Request Service</span>
      </button>
    )}

    <button
      onClick={onLogout}
      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
    >
      <LogOut className="h-4 w-4" />
      <span>Sign Out</span>
    </button>
  </div>
)

export default Navbar
