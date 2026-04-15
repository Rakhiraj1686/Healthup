import React from "react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/signup");
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden pb-16 text-white"
      style={{
        background:
          "radial-gradient(circle at 25% 25%, rgba(168,85,247,0.22), transparent 40%), radial-gradient(circle at 75% 75%, rgba(59,130,246,0.2), transparent 42%), #030712",
      }}
    >
      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes drift {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(14px) scale(1.05); }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />

      <div className="pointer-events-none absolute -top-6 right-[8%] h-44 w-44 rounded-full bg-purple-500/30 blur-3xl md:h-64 md:w-64 animate-[drift_8s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -left-16 bottom-8 h-52 w-52 rounded-full bg-cyan-500/25 blur-3xl md:h-80 md:w-80 animate-[drift_10s_ease-in-out_infinite_reverse]" />

      <section className="relative z-10 px-6 pt-20 md:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="opacity-0 animate-[riseIn_700ms_ease_forwards]">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300 font-['Trebuchet_MS',sans-serif]">
              Built for sustainable progress
            </p>
            <h1 className="mb-6 bg-linear-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-4xl font-extrabold leading-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
              About HealthUP
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg font-['Trebuchet_MS',sans-serif]">
              HealthUP combines structured training, intelligent nutrition support,
              and practical accountability so users can improve health without
              chaos, guesswork, or burnout.
            </p>
          </div>

          <div className="opacity-0 animate-[riseIn_700ms_ease_120ms_forwards]">
            <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-6 shadow-[0_0_40px_rgba(59,130,246,0.35)] backdrop-blur-3xl sm:p-8 md:p-10">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300 font-['Trebuchet_MS',sans-serif]">
                The principle we protect
              </p>
              <h2 className="mb-4 text-2xl font-bold leading-tight text-purple-300 sm:text-3xl">
                Progress should feel strong, not punishing.
              </h2>
              <p className="mb-6 leading-relaxed text-gray-400 font-['Trebuchet_MS',sans-serif]">
                We design systems that can survive real life. Plans are precise,
                but adaptive. Users get clarity every week, not random advice.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Users", value: "1.2k+" },
                  { label: "Plans", value: "9k+" },
                  { label: "Consistency", value: "87%" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-cyan-400/20 bg-white/5 p-3 text-center backdrop-blur-xl">
                    <p className="text-xl font-semibold text-purple-400">{item.value}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-400 font-['Trebuchet_MS',sans-serif]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-16 md:px-10">
        <div className="mx-auto max-w-7xl rounded-3xl border border-cyan-400/20 bg-white/5 p-7 shadow-[0_0_30px_rgba(59,130,246,0.25)] backdrop-blur-2xl opacity-0 animate-[riseIn_700ms_ease_240ms_forwards] md:p-10">
          <h2 className="mb-4 bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            Why we built HealthUP
          </h2>
          <p className="max-w-4xl text-lg leading-relaxed text-gray-400 font-['Trebuchet_MS',sans-serif]">
            Most fitness journeys fail because tools are either too generic or too
            intense. HealthUP closes that gap with a living system that watches
            consistency, fatigue, progression, and recovery, then adjusts plans at
            the right moment.
          </p>
        </div>
      </section>

      <section className="relative z-10 px-6 py-8 md:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl opacity-0 animate-[riseIn_700ms_ease_180ms_forwards]">
            Operating pillars
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Signal over noise",
                body: "Dashboards focus on what matters now: adherence, progression, recovery, and trend shifts.",
                animation: "animate-[riseIn_700ms_ease_120ms_forwards]",
              },
              {
                title: "Adaptive planning",
                body: "Workout and nutrition plans evolve from user behavior, not static templates.",
                animation: "animate-[riseIn_700ms_ease_220ms_forwards]",
              },
              {
                title: "Long-term momentum",
                body: "We optimize for repeatable habits and steady confidence rather than short-term spikes.",
                animation: "animate-[riseIn_700ms_ease_320ms_forwards]",
              },
            ].map((pillar, index) => (
              <article
                key={pillar.title}
                className={`rounded-3xl border border-cyan-400/20 bg-white/5 p-6 opacity-0 backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_0_26px_rgba(59,130,246,0.3)] ${pillar.animation}`}
              >
                <p className="mb-4 text-xs uppercase tracking-[0.18em] text-cyan-300 font-['Trebuchet_MS',sans-serif]">
                  0{index + 1}
                </p>
                <h3 className="mb-3 text-xl font-semibold text-purple-300 sm:text-2xl">
                  {pillar.title}
                </h3>
                <p className="leading-relaxed text-gray-400 font-['Trebuchet_MS',sans-serif]">
                  {pillar.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-16 md:px-10">
        <div className="mx-auto max-w-7xl rounded-3xl border border-cyan-400/20 bg-white/5 p-8 text-center shadow-[0_0_36px_rgba(168,85,247,0.28)] backdrop-blur-2xl opacity-0 animate-[riseIn_700ms_ease_240ms_forwards] md:p-12">
          <h2 className="mb-4 bg-linear-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-4xl font-extrabold leading-tight text-transparent sm:text-5xl">
            Train with a plan that keeps up with you.
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-gray-400 font-['Trebuchet_MS',sans-serif]">
            Start your profile, set your target, and let HealthUP build structure
            around your real schedule.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              className="cursor-pointer rounded-full bg-linear-to-r from-purple-500 to-cyan-500 px-8 py-3 font-semibold text-white transition duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] font-['Trebuchet_MS',sans-serif]"
              onClick={handleNavigate}
            >
              Create Account
            </button>
            <button
              className="cursor-pointer rounded-full border border-cyan-400/30 bg-transparent px-8 py-3 font-semibold text-cyan-300 transition duration-300 hover:bg-cyan-400/10 hover:text-cyan-200 font-['Trebuchet_MS',sans-serif]"
              onClick={() => navigate("/contact")}
            >
              Talk to Team
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
