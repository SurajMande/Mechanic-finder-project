import React, { useEffect, useRef } from "react";
import { MapPin, Users, Wrench } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HowItWorks = () => {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);

  const steps = [
    {
      step: "01",
      title: "Request Service",
      description:
        "Tell us what’s wrong, share your location, and upload photos for quicker diagnosis.",
      icon: MapPin,
    },
    {
      step: "02",
      title: "Get Matched",
      description:
        "Nearby verified mechanics review your request and accept within minutes.",
      icon: Users,
    },
    {
      step: "03",
      title: "Track & Fix",
      description:
        "Track the mechanic in real-time and get your vehicle fixed professionally.",
      icon: Wrench,
    },
  ];

  useEffect(() => {
    gsap.fromTo(
      lineRef.current,
      { height: "0%" },
      {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          end: "bottom center",
          scrub: true,
        },
      }
    );

    gsap.utils.toArray(".timeline-step").forEach((step) => {
      gsap.fromTo(
        step,
        { opacity: 0.4 },
        {
          opacity: 1,
          scrollTrigger: {
            trigger: step,
            start: "top 70%",
            end: "top 50%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-28 px-6 overflow-hidden"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-indigo-50" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-5">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Get your vehicle fixed in three simple steps
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Base line */}
          <div className="absolute left-1/2 top-0 h-full w-px bg-slate-200 -translate-x-1/2 hidden md:block" />

          {/* Animated colored line */}
          <div
            ref={lineRef}
            className="absolute left-1/2 top-0 w-px bg-gradient-to-b from-indigo-600 to-blue-600 -translate-x-1/2 hidden md:block"
          />

          <div className="space-y-20">
            {steps.map((item, index) => (
              <div
                key={index}
                className={`timeline-step relative flex flex-col md:flex-row items-center ${
                  index % 2 === 0
                    ? "md:justify-start"
                    : "md:justify-end"
                }`}
              >
                {/* Card */}
                <div className="md:w-1/2 px-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm transition hover:shadow-md">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-semibold text-slate-500">
                        STEP {item.step}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-slate-900 mb-3">
                      {item.title}
                    </h3>

                    <p className="text-slate-600 leading-relaxed text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Timeline dot */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
                  <div className="w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
