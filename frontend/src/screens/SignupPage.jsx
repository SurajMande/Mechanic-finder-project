"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, ArrowLeft, Wrench, Mail, Lock, User, Phone, Briefcase, Clock } from "lucide-react"
import { auth } from "../utils/auth"
import toast from "react-hot-toast"

const SignupPage = () => {
  const navigate = useNavigate()
  const [userType, setUserType] = useState("user")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience: "",
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

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    if (userType === "mechanic" && (!formData.specialization || !formData.experience)) {
      toast.error("Please fill in specialization and experience")
      return
    }

    setLoading(true)

    try {
      if (userType === "mechanic") {
        await auth.registerMechanic(formData)
        toast.success("Mechanic account created successfully!")
        navigate("/mechanic/dashboard")
      } else {
        await auth.registerUser(formData)
        toast.success("Account created successfully!")
        navigate("/user/dashboard")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.")
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

        {/* Signup Card */}
        <div className="card-elevated fade-in">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 sm:mb-6">
              <Wrench className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
            <p className="text-slate-600 text-sm sm:text-base">Join MechanicFinder today</p>
          </div>

          {/* User Type Selection */}
          <div className="mb-6 sm:mb-8">
            <p className="text-sm font-semibold text-slate-700 mb-3 sm:mb-4">I want to:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType("user")}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                  userType === "user"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <User className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2" />
                <div className="text-xs sm:text-sm font-medium">Find Mechanics</div>
              </button>
              <button
                type="button"
                onClick={() => setUserType("mechanic")}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                  userType === "mechanic"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <Wrench className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2" />
                <div className="text-xs sm:text-sm font-medium">Offer Services</div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field-large pl-11"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Email Address *</label>
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

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-field-large pl-11"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field-large pl-11 pr-11"
                  placeholder="Create a password"
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
              <p className="text-xs text-slate-500">Must be at least 6 characters</p>
            </div>

            {/* Mechanic-specific fields */}
            {userType === "mechanic" && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Specialization *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="input-field-large pl-11 appearance-none"
                      required
                    >
                      <option value="">Select your specialization</option>
                      <option value="Engine Repair">Engine Repair</option>
                      <option value="Brake Service">Brake Service</option>
                      <option value="Transmission">Transmission</option>
                      <option value="Electrical">Electrical</option>
                      <option value="AC Repair">AC Repair</option>
                      <option value="General Maintenance">General Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Years of Experience *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="input-field-large pl-11"
                      placeholder="Years of experience"
                      min="0"
                      max="50"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-base py-3 sm:py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="spinner"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                `Create ${userType === "mechanic" ? "Mechanic" : "User"} Account`
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-slate-600 text-sm sm:text-base">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm text-slate-500 mb-3 sm:mb-4">Join thousands of satisfied users</p>
          <div className="flex items-center justify-center space-x-4 sm:space-x-6 opacity-60">
            <div className="text-xs font-medium text-slate-400">Secure & Safe</div>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <div className="text-xs font-medium text-slate-400">24/7 Support</div>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <div className="text-xs font-medium text-slate-400">Verified Network</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
