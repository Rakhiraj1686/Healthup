import React, { useRef } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(168,85,247,0.25),transparent_40%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.25),transparent_40%)]" />

      <div className="relative z-10">
        <Hero />
        <HowItWorks />
        <Features />
        <Footer />
      </div>
    </div>
  );
}

/* ================= HERO ================= */

function Hero() {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return; // disable tilt on mobile

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `rotateX(0deg) rotateY(0deg)`;
  };

  return (
    <section className="min-h-screen grid md:grid-cols-2 items-center px-6 sm:px-10 md:px-20 py-20 gap-16">

      {/* LEFT SIDE */}
      <div className="space-y-8 text-center md:text-left">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
          <span className="bg-linear-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
            Adaptive Fitness Intelligence
          </span>
        </h1>

        <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
          AI-powered workout and nutrition plans that adapt to your habits,
          fatigue levels, and real-world progress.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
          <Link
            to="/signup"
            className="px-8 sm:px-10 py-3 sm:py-4 rounded-full font-semibold bg-linear-to-r from-purple-500 to-cyan-500 hover:scale-105 transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.6)] text-sm sm:text-base"
          >
            Start Free
          </Link>

          <Link
            to="/about"
            className="px-8 sm:px-10 py-3 sm:py-4 rounded-full border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 transition-all duration-300 text-sm sm:text-base"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE – DASHBOARD */}
      <div className="relative flex justify-center items-center perspective-1000">

        {/* Glow */}
        <div className="absolute w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />

        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full max-w-sm sm:max-w-md bg-white/5 backdrop-blur-3xl border border-cyan-400/20 p-6 sm:p-8 md:p-10 rounded-3xl shadow-[0_0_40px_rgba(59,130,246,0.4)] overflow-hidden transition-transform duration-200 ease-out"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* GRID OVERLAY */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(0,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.2)_1px,transparent_1px)] bg-size-[25px_25px] sm:bg-size-[30px_30px]" />

          {/* SCANNING LINE */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-16 sm:h-24 bg-linear-to-b from-transparent via-cyan-400/30 to-transparent animate-scan" />
          </div>

          {/* CONTENT */}
          <div className="relative z-10 space-y-6 sm:space-y-8">
            <div className="flex justify-between items-center">
              <span className="text-cyan-400 font-semibold text-sm sm:text-base">
                AI Performance Scan
              </span>
              <span className="text-green-400 animate-pulse text-sm sm:text-base">
                +4.2%
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs sm:text-sm text-gray-400">
                Workout Sync
              </div>
              <div className="h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-linear-to-r from-purple-500 via-cyan-500 to-pink-500 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-2 sm:pt-4">
              <GlowStat title="Adherence" value="92%" />
              <GlowStat title="Recovery" value="Optimal" />
              <GlowStat title="Energy" value="High" />
              <GlowStat title="Goal Status" value="On Track" />
            </div>
          </div>
        </div>
      </div>

      {/* Scan Animation */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
    </section>
  );
}

function GlowStat({ title, value }) {
  return (
    <div className="bg-white/5 border border-cyan-400/20 p-3 sm:p-4 rounded-2xl text-center backdrop-blur-xl shadow-[0_0_20px_rgba(59,130,246,0.3)]">
      <div className="text-base sm:text-xl font-bold text-purple-400">
        {value}
      </div>
      <div className="text-[10px] sm:text-xs text-gray-400">
        {title}
      </div>
    </div>
  );
}

/* ================= HOW IT WORKS ================= */

function HowItWorks() {
  const steps = [
    "Profile Setup",
    "Generate Plan",
    "Track Progress",
    "Analyze",
    "Adjust",
    "AI Coach",
  ];

  return (
    <section className="py-20 sm:py-28 px-6 text-center">
      <h2 className="text-3xl sm:text-4xl font-bold mb-16 sm:mb-20 bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
        How FitAI Works
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 max-w-7xl mx-auto">
        {steps.map((step, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 p-6 sm:p-8 rounded-3xl transition-all duration-300"
          >
            {/* <div className="text-cyan-400 font-bold mb-3">{i + 1}</div> */}
            <div className="text-gray-300 text-sm sm:text-base">
              {step}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================= FEATURES ================= */

function Features() {
  const features = [
    ["Adaptive Workouts", "Plans auto-adjust using fatigue & adherence data."],
    ["Smart Diet Generator", "Macro-based personalized nutrition engine."],
    ["Habit Intelligence", "Consistency scoring & drop-off detection."],
    ["Progress Analytics", "Weight trends & measurement tracking."],
    ["Energy Monitoring", "Prevent overtraining with smart recovery."],
    ["Goal Forecast", "Predict timeline to reach your target."],
  ];

  return (
    <section className="py-20 sm:py-28 px-6">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 sm:mb-20 bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
        Core Features
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 max-w-7xl mx-auto">
        {features.map(([title, desc], i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-2xl border border-cyan-400/20 p-8 sm:p-10 rounded-3xl transition-all duration-300"
          >
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-purple-400">
              {title}
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================= FOOTER ================= */

function Footer() {
  return (
    <footer className="bg-[#030712] border-t border-cyan-400/20 mt-20">
      <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-md tracking-wide">
        © {new Date().getFullYear()} HealthUP • All Rights reserved.
      </div>
    </footer>
  );
}