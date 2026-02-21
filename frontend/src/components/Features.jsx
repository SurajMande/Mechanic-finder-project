import React from "react";
import { Users, Clock, Shield, Star } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Users,
      title: "Verified Mechanics",
      description:
        "Every mechanic is identity-verified, background-checked, and certified to ensure professional and trustworthy service.",
      image:
        "https://images.pexels.com/photos/3807226/pexels-photo-3807226.jpeg",
      gradient: "from-indigo-500/30 to-transparent",
    },
    {
      icon: Clock,
      title: "Fast Response Time",
      description:
        "Connect instantly with nearby mechanics using real-time availability and smart location matching.",
      image:
        "https://images.pexels.com/photos/5226497/pexels-photo-5226497.jpeg",
      gradient: "from-emerald-500/30 to-transparent",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Your data and payments are protected with enterprise-grade security and encrypted transactions.",
      image:
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1200&auto=format&fit=crop",
      gradient: "from-sky-500/30 to-transparent",
    },
    {
      icon: Star,
      title: "Quality Guaranteed",
      description:
        "Transparent ratings and verified customer reviews ensure consistently high-quality service.",
      image:
        "https://images.pexels.com/photos/7564196/pexels-photo-7564196.jpeg",
      gradient: "from-amber-500/30 to-transparent",
    },
  ];

  return (
    <section className="relative py-28 bg-gradient-to-b from-slate-50 to-white px-6 overflow-hidden">
      {/* Background blur accents */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-24 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-24">
          <span className="inline-block mb-4 text-sm font-semibold tracking-wider text-indigo-600 uppercase">
            Why MechanicFinder
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Built for Trust. Designed for Speed.
          </h2>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            MechanicFinder blends verified professionals, smart matching, and
            modern security to deliver reliable roadside assistance—anytime,
            anywhere.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-3xl border border-slate-200 bg-white/70 backdrop-blur
              overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="relative p-6">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} text-black
                  flex items-center justify-center mb-6 shadow-lg`}
                >
                  <feature.icon className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
