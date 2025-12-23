"use client"

import React from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Users, Clock, Shield, Star, Zap, MapPin, Wrench } from "lucide-react"
import { auth } from "../utils/auth"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const LandingPage = () => {
  // Redirect if already authenticated
  React.useEffect(() => {
    if (auth.isAuthenticated()) {
      const role = auth.getUserRole()
      window.location.href = role === "mechanic" ? "/mechanic/dashboard" : "/user/dashboard"
    }
  }, [])

  const features = [
    {
      icon: Users,
      title: "Verified Mechanics",
      description: "All mechanics are background-checked and certified professionals with proven expertise.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Clock,
      title: "Quick Response",
      description: "Get connected with nearby mechanics within minutes, 24/7 availability.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Shield,
      title: "Secure & Safe",
      description: "Your data and transactions are protected with enterprise-grade security.",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: Star,
      title: "Quality Service",
      description: "Rated mechanics with proven track records and verified customer reviews.",
      color: "from-amber-500 to-orange-500",
    },
  ]

  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "500+", label: "Verified Mechanics" },
    { number: "50+", label: "Cities Covered" },
    { number: "4.9", label: "Average Rating" },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-36">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">

            {/* Text */}
            <div className="lg:col-span-7 space-y-8">
              <span className="inline-block text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                On-demand vehicle repair
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight tracking-tight">
                A smarter way to
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  find trusted mechanics
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                MechanicFinder connects you with nearby, verified mechanics
                when your vehicle needs help — fast, reliable, and stress-free.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-white font-medium hover:bg-blue-700 transition"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-8 py-4 font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Visual */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-6 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-3xl blur-2xl opacity-60" />
              <div className="relative bg-white border border-slate-200 rounded-3xl shadow-xl p-5">
                <img
                  src="https://images.unsplash.com/photo-1625047509168-a7026f36de04"
                  alt="Mechanic"
                  className="rounded-2xl object-cover w-full h-[420px]"
                />
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Features Section */}
<section className="py-14 sm:py-24 bg-white px-6">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    {/* Header */}
    <div className="text-center mb-14 sm:mb-20">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-6">
        Why Choose MechanicFinder?
      </h2>
      <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
        We connect you with trusted professionals using smart technology —
        fast, reliable, and transparent.
      </p>
    </div>

    {/* Feature Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
      {features.map((feature, index) => (
        <div
          key={index}
          className="group relative bg-white border border-slate-200 
          rounded-2xl p-6 sm:p-7
          hover:-translate-y-2 hover:shadow-xl 
          transition-all duration-300"
        >
          {/* Icon */}
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl 
            bg-gradient-to-r ${feature.color}
            flex items-center justify-center mb-5
            shadow-sm group-hover:scale-110 transition-transform`}
          >
            <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>

          {/* Content */}
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
            {feature.title}
          </h3>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {feature.description}
          </p>

          {/* Hover accent */}
          <div
            className={`absolute bottom-0 left-0 h-1 w-full rounded-b-2xl 
            bg-gradient-to-r ${feature.color}
            opacity-0 group-hover:opacity-100 transition-opacity`}
          />
        </div>
      ))}
    </div>
  </div>
</section>


     {/* How It Works Section */}
<section className="py-10 sm:py-24 bg-white px-8">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    {/* Header */}
    <div className="text-center mb-14 sm:mb-18">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-5">
        How It Works
      </h2>
      <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
        Get your vehicle fixed in just three easy steps
      </p>
    </div>

    {/* Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
      {[
        {
          step: "01",
          title: "Request Service",
          description:
            "Describe your vehicle issue, share your location, and upload photos for quicker diagnosis.",
          icon: MapPin,
        },
        {
          step: "02",
          title: "Get Matched",
          description:
            "Nearby verified mechanics receive your request and respond within minutes.",
          icon: Users,
        },
        {
          step: "03",
          title: "Track & Fix",
          description:
            "Track your mechanic in real-time and get your vehicle repaired professionally.",
          icon: Wrench,
        },
      ].map((item, index) => (
        <div
          key={index}
          className="group relative bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5"
        >
          {/* Step number */}
          <div className="absolute top-4 right-4 text-xs font-bold text-slate-300 group-hover:text-blue-600 transition-colors">
            {item.step}
          </div>

          {/* Icon */}
          <div className="mb-5">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <item.icon className="h-7 w-7 text-white" />
            </div>
          </div>

          {/* Content */}
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3">
            {item.title}
          </h3>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            {item.description}
          </p>

          {/* Bottom accent */}
          <div className="mt-6 h-1 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}
    </div>
  </div>
</section>



      {/* CTA Section */}
<section className="relative py-16 sm:py-24 overflow-hidden">
  {/* Gradient background */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />

  {/* Overlay noise / depth */}
  <div className="absolute inset-0 bg-black/10" />

  {/* Floating glow shapes */}
  <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
  <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
  <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl -translate-x-1/2" />

  {/* Content */}
  <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 sm:mb-6 leading-tight">
      Ready to Get Back on the Road?
    </h2>

    <p className="text-lg sm:text-xl text-blue-100 mb-8 sm:mb-10 max-w-2xl mx-auto">
      Connect with trusted mechanics nearby and get your vehicle fixed fast —
      anytime, anywhere.
    </p>

    {/* CTA Buttons */}
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      {/* Primary CTA */}
      <Link
        to="/signup"
        className="group relative inline-flex items-center justify-center px-7 sm:px-9 py-3.5 sm:py-4 
        rounded-xl font-semibold text-blue-700 bg-white 
        shadow-[0_10px_30px_rgba(0,0,0,0.25)]
        hover:shadow-[0_15px_40px_rgba(0,0,0,0.35)]
        transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto"
      >
        <span className="relative z-10">Find a Mechanic</span>
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-white to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Secondary CTA */}
      <Link
        to="/signup"
        className="inline-flex items-center justify-center px-7 sm:px-9 py-3.5 sm:py-4 
        rounded-xl font-semibold text-white 
        border border-white/40 hover:border-white 
        hover:bg-white/10 transition-all duration-300 w-full sm:w-auto"
      >
        Join as a Mechanic
      </Link>
    </div>
  </div>
</section>


      <Footer />
    </div>
  )
}

export default LandingPage
