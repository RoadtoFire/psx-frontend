import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-slate-200 overflow-x-hidden">
      <style>{`
        .fade-in { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .fade-in.visible { opacity: 1; transform: translateY(0); }
        .fade-in-delay-1 { transition-delay: 0.1s; }
        .fade-in-delay-2 { transition-delay: 0.2s; }
        .fade-in-delay-3 { transition-delay: 0.3s; }
        .fade-in-delay-4 { transition-delay: 0.4s; }
        .fade-in-delay-5 { transition-delay: 0.5s; }
        .radial-glow {
          background:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(5,150,105,0.18) 0%, transparent 60%),
            #030712;
        }
        .glow-bg::before {
          content: '';
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 800px; height: 600px;
          background: radial-gradient(ellipse, rgba(5,150,105,0.12) 0%, transparent 65%);
          pointer-events: none;
        }
        .feature-card { transition: border-color 0.2s, transform 0.2s; }
        .feature-card:hover { border-color: rgb(55,65,81) !important; transform: translateY(-2px); }
        .feature-card:hover .feature-icon-wrap { background: rgba(5,150,105,0.15); }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
      `}</style>

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center text-white font-semibold text-base">
            A
          </div>
          <span className="text-lg font-medium text-slate-100">
            Amanat <span className="text-emerald-400 text-sm">| امانت</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-slate-400 text-sm hover:text-slate-200 transition-colors hidden sm:block"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-brand hover:bg-brand-hover text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="radial-glow relative text-center px-6 pt-20 pb-16 glow-bg">
        <div className="fade-in">
          <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/40 text-emerald-400 text-xs px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-dot"></span>
            Built for Pakistani investors
          </div>
        </div>

        <h1 className="fade-in fade-in-delay-1 text-4xl sm:text-5xl font-medium leading-tight text-slate-100 mb-5 max-w-2xl mx-auto">
          Invest in PSX with{" "}
          <span className="text-emerald-400">clarity and conscience</span>
        </h1>

        <p className="fade-in fade-in-delay-2 text-slate-400 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Track your portfolio, calculate dividends, and stay Shariah-compliant
          — all in one place. Built specifically for the Pakistan Stock Exchange.
        </p>

        <div className="fade-in fade-in-delay-3 flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => navigate("/register")}
            className="bg-brand hover:bg-brand-hover text-white px-7 py-3 rounded-xl text-base font-medium transition-colors"
          >
            Start tracking free
          </button>
          <button
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-transparent text-slate-200 px-7 py-3 rounded-xl text-base border border-white/20 hover:border-white/40 transition-colors"
          >
            See how it works
          </button>
        </div>

        {/* Stats strip */}
        <div className="fade-in fade-in-delay-4 mt-12 max-w-2xl mx-auto grid grid-cols-3 border border-gray-800 rounded-2xl overflow-hidden">
          {[
            { num: "285", label: "Shariah stocks" },
            { num: "340K+", label: "Price records" },
            { num: "100%", label: "PSX coverage" },
          ].map((stat, i) => (
            <div
              key={i}
              className={`py-5 px-4 text-center bg-gray-900 ${
                i < 2 ? "border-r border-gray-800" : ""
              }`}
            >
              <div className="text-2xl font-medium text-emerald-400">
                {stat.num}
              </div>
              <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="fade-in text-center text-emerald-500 text-xs tracking-widest uppercase mb-3">
          Features
        </p>
        <h2 className="fade-in fade-in-delay-1 text-center text-3xl font-medium text-slate-100 mb-3">
          Everything you need to invest smarter
        </h2>
        <p className="fade-in fade-in-delay-2 text-center text-slate-500 text-sm mb-10 max-w-md mx-auto">
          From real-time prices to automatic purification — Amanat handles the
          math so you don't have to.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: "📈",
              title: "Live PSX prices",
              desc: "Real-time stock prices scraped directly from the Pakistan Stock Exchange, updated throughout the trading day.",
              delay: 0,
            },
            {
              icon: "💰",
              title: "Dividend tracking",
              desc: "Automatic dividend calculations with tax deductions included. Know exactly what you'll receive — before and after tax.",
              delay: 1,
            },
            {
              icon: "🌙",
              title: "Shariah compliance",
              desc: "Every stock screened against all 6 KMI criteria. Invest with confidence knowing your portfolio stays halal.",
              delay: 2,
            },
            {
              icon: "✦",
              title: "Auto purification",
              desc: "Purification amounts calculated automatically from Al-Meezan's semi-annual KMI reports. Giving made effortless.",
              delay: 3,
            },
            {
              icon: "📱",
              title: "Mobile first",
              desc: "Designed for your phone. Install as a PWA and track your portfolio anytime, anywhere — no app store needed.",
              delay: 4,
            },
            {
              icon: "📚",
              title: "Learn as you invest",
              desc: "Built-in educational content explains Shariah investing basics and stock market fundamentals in plain Urdu and English.",
              delay: 5,
            },
          ].map((f, i) => (
            <div
              key={i}
              className={`fade-in fade-in-delay-${Math.min(f.delay, 5)} feature-card bg-gray-900 border border-gray-800 rounded-2xl p-6`}
            >
              <div className="feature-icon-wrap w-11 h-11 bg-emerald-600/10 rounded-xl flex items-center justify-center text-lg mb-4 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-base font-medium text-slate-200 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Video Demo */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <p className="fade-in text-center text-emerald-500 text-xs tracking-widest uppercase mb-3">
          See it in action
        </p>
        <h2 className="fade-in fade-in-delay-1 text-center text-3xl font-medium text-slate-100 mb-3">
          Watch how it works
        </h2>
        <p className="fade-in fade-in-delay-2 text-center text-slate-500 text-sm mb-8">
          A quick walkthrough of the full app experience.
        </p>
        <div className="fade-in fade-in-delay-3 rounded-2xl overflow-hidden border border-gray-800" style={{ aspectRatio: '16/9' }}>
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/kNPkZpyQyFk"
            title="Amanat App Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      {/* Shariah Section */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="fade-in bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col sm:flex-row gap-8 items-center">
          <div className="flex-1">
            <h2 className="text-2xl font-medium text-slate-100 mb-3">
              What makes a stock Shariah compliant?
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Amanat uses the KMI All Shares Islamic Index developed by PSX and
              Meezan Bank. A stock must pass all 6 criteria to be included.
            </p>
            <div className="flex flex-col gap-2">
              {[
                "Halal core business",
                "Debt ratio under 37%",
                "Non-compliant investments under 33%",
                "Non-compliant income under 5%",
                "Illiquid assets over 25%",
                "Market price above net liquid assets",
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                  {c}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center min-w-[160px]">
            <div className="text-5xl font-medium text-emerald-400">285</div>
            <div className="text-emerald-300 text-sm mt-1">compliant stocks</div>
            <div className="text-slate-500 text-xs mt-1">reviewed every 6 months</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 pb-16">
        <p className="fade-in text-center text-emerald-500 text-xs tracking-widest uppercase mb-3">
          How it works
        </p>
        <h2 className="fade-in fade-in-delay-1 text-center text-3xl font-medium text-slate-100 mb-3">
          Up and running in minutes
        </h2>
        <p className="fade-in fade-in-delay-2 text-center text-slate-500 text-sm mb-10">
          No complex setup. Just sign up and start tracking.
        </p>

        <div className="max-w-lg mx-auto flex flex-col gap-0">
          {[
            {
              num: "1",
              title: "Create your free account",
              desc: "Sign up with your email in under a minute. No credit card required.",
            },
            {
              num: "2",
              title: "Add your holdings",
              desc: "Search from 285 Shariah-compliant PSX stocks and add them with your buy price and quantity.",
            },
            {
              num: "3",
              title: "Track, earn & purify",
              desc: "Watch your portfolio update in real time. Dividends and purification amounts are calculated automatically.",
            },
          ].map((step, i) => (
            <div key={i} className="fade-in">
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-medium text-emerald-400 flex-shrink-0">
                    {step.num}
                  </div>
                  {i < 2 && (
                    <div className="w-px h-8 bg-gray-800 mt-1"></div>
                  )}
                </div>
                <div className="pb-6">
                  <h4 className="text-base font-medium text-slate-200 mb-1">
                    {step.title}
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="fade-in max-w-xl mx-auto text-center bg-gray-900 border border-gray-800 rounded-2xl p-10">
          <h2 className="text-3xl font-medium text-slate-100 mb-3">
            Start investing with intention
          </h2>
          <p className="text-slate-500 text-sm mb-7 leading-relaxed max-w-sm mx-auto">
            Join Pakistani investors already using Amanat to build a halal
            portfolio with confidence.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-xl text-base font-medium transition-colors"
          >
            Create free account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-5 px-6 text-center text-gray-600 text-xs">
        Built for Pakistan, with{" "}
        <span className="text-emerald-400">امانت</span> — Amanat PSX &copy;{" "}
        {new Date().getFullYear()}
      </footer>
    </div>
  );
}