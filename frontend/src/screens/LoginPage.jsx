"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, ArrowLeft, Wrench, Mail, Lock } from "lucide-react"
import { auth } from "../utils/auth"
import toast from "react-hot-toast"

const LoginPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      const user = await auth.login(formData.email, formData.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(user.role === "mechanic" ? "/mechanic/dashboard" : "/user/dashboard")
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 sm:left-20 w-48 sm:w-72 h-48 sm:h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6 sm:mb-8 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to home</span>
        </Link>

        {/* Login Card */}
        <div className="card-elevated fade-in">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 sm:mb-6">
              <Wrench className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-600 text-sm sm:text-base">Sign in to your MechanicFinder account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field-large pl-11"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field-large pl-11 pr-11"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-base py-3 sm:py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="spinner"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-slate-600 text-sm sm:text-base">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm text-slate-500 mb-3 sm:mb-4">Trusted by mechanics and customers worldwide</p>
          <div className="flex items-center justify-center space-x-4 sm:space-x-6 opacity-60">
            <div className="text-xs font-medium text-slate-400">10K+ Users</div>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <div className="text-xs font-medium text-slate-400">500+ Mechanics</div>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <div className="text-xs font-medium text-slate-400">4.9★ Rating</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
