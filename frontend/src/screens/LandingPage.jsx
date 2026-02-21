"use client"

import React from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { auth } from "../utils/auth"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import FeaturesSection from "../components/Features"
import HowItWorksTimeline from "../components/HowItWorks"

const LandingPage = () => {
  // Redirect if already authenticated
  React.useEffect(() => {
    if (auth.isAuthenticated()) {
      const role = auth.getUserRole()
      window.location.href = role === "mechanic" ? "/mechanic/dashboard" : "/user/dashboard"
    }
  }, [])



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

    <FeaturesSection />
    <HowItWorksTimeline/>



 {/* Premium CTA */}
<section className="py-24 bg-slate-50">
  <div className="max-w-7xl mx-auto px-6">
    <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-16 sm:px-16 sm:py-24 shadow-2xl">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20">
        <div className="aspect-square h-96 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600" />
      </div>
      <div className="absolute bottom-0 left-0 translate-y-24 -translate-x-24 blur-3xl opacity-10">
        <div className="aspect-square h-80 rounded-full bg-blue-500" />
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <div className="z-10">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium tracking-wider text-blue-400 uppercase bg-blue-400/10 rounded-full border border-blue-400/20">
            Available 24/7
          </span>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] mb-8">
            Stuck on the road? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              We’ve got you.
            </span>
          </h2>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-lg leading-relaxed">
            Connect with verified local mechanics in seconds. Experience 
            <span className="text-slate-200"> transparent pricing</span> and 
            <span className="text-slate-200"> real-time tracking</span> when it matters most.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/signup"
              className="group inline-flex items-center justify-center px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-600/25 active:scale-95"
            >
              Find a mechanic
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 hover:text-white transition-all duration-300 active:scale-95"
            >
              Join as a mechanic
            </Link>
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative group lg:ml-auto w-full max-w-md lg:max-w-none">
          {/* Image Frame with Glass Effect */}
          <div className="relative z-10 overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
            <img
              src="https://images.pexels.com/photos/6078/road-man-broken-car-6078.jpg"
              alt="Mechanic assisting roadside vehicle"
              className="w-full h-[400px] object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60" />
          </div>

          {/* Floating Badge */}
          <div className="absolute -bottom-6 -left-6 z-20 bg-white p-4 rounded-2xl shadow-xl hidden sm:flex items-center gap-4 animate-bounce-slow">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
           
          </div>
        </div>

      </div>
    </div>
  </div>
</section>


      <Footer />
    </div>
  )
}

export default LandingPage
