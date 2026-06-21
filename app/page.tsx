import { ArrowRight, ShieldCheck, Zap, BarChart3, Leaf } from 'lucide-react';
import Button from '../components/ui/button';
import MiniCalculator from '../components/MiniCalculator';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen neo-grid text-slate-950 selection:bg-emerald-500/30">
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative py-20 px-6 flex flex-col items-center text-center overflow-hidden border-b-3 border-black bg-white">
          <div className="max-w-4xl flex flex-col items-center relative z-10">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#00CC66]/10 border-2 border-black text-slate-950 text-xs font-extrabold mb-8 animate-fade-in shadow-[2px_2px_0px_0px_#000000]">
              <Zap className="h-4.5 w-4.5 fill-[#FFD53D] text-slate-950" />
              Next-Gen Climate Decision Engine
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-950 leading-tight mb-8">
              Stop guessing. Take the single{' '}
              <span className="bg-[#FFD53D] px-3 py-1 border-3 border-black inline-block transform -rotate-1.5 shadow-[4px_4px_0px_0px_#000000] text-slate-950">
                best climate action
              </span>{' '}
              next.
            </h1>

            <p className="text-lg md:text-xl text-slate-700 max-w-xl mb-8 font-semibold leading-relaxed">
              Understand your carbon footprint, identify high-impact lifestyle habits, and discover a personalized path ranked by carbon savings, cost, and effort.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
              <Button href="/onboarding" id="start-onboarding-hero" variant="primary" size="lg" className="w-full flex items-center gap-2">
                Find Your Best Next Action
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Interactive Mini-Calculator */}
            <MiniCalculator />
          </div>
        </section>

        {/* Marquee Ticker */}
        <div className="w-full bg-[#B288FF] border-b-3 border-black py-3 overflow-hidden flex whitespace-nowrap relative z-20">
          <div className="animate-marquee inline-block font-black text-slate-950 uppercase tracking-widest text-sm">
            🔥 5,420 kg CO₂ saved by the Climbit community this week &nbsp; • &nbsp; 🌿 142 AI Auto-Logs processed today &nbsp; • &nbsp; 🏆 Top Action: Switching to LED Bulbs &nbsp; • &nbsp; 🔥 5,420 kg CO₂ saved by the Climbit community this week &nbsp; • &nbsp; 🌿 142 AI Auto-Logs processed today &nbsp; • &nbsp; 🏆 Top Action: Switching to LED Bulbs &nbsp; • &nbsp;
          </div>
          <div className="animate-marquee inline-block font-black text-slate-950 uppercase tracking-widest text-sm" aria-hidden="true">
            🔥 5,420 kg CO₂ saved by the Climbit community this week &nbsp; • &nbsp; 🌿 142 AI Auto-Logs processed today &nbsp; • &nbsp; 🏆 Top Action: Switching to LED Bulbs &nbsp; • &nbsp; 🔥 5,420 kg CO₂ saved by the Climbit community this week &nbsp; • &nbsp; 🌿 142 AI Auto-Logs processed today &nbsp; • &nbsp; 🏆 Top Action: Switching to LED Bulbs &nbsp; • &nbsp;
          </div>
        </div>

        {/* Problem Statement */}
        <section className="py-20 px-6 max-w-6xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-950 mb-4">
              Why generic carbon calculators fail
            </h2>
            <p className="text-slate-700 font-semibold max-w-xl mx-auto">
              Carbon emissions are invisible, and standard advice is often generic, overwhelming, or expensive. Climbit is built differently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="neo-card p-6 flex flex-col gap-4">
              <div className="h-11 w-11 rounded-xl bg-[#FF5A60] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000000]">
                <BarChart3 className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-xl font-black text-slate-950">Visual Emission Breakdown</h3>
              <p className="text-slate-700 text-sm font-medium leading-relaxed">
                Most calculators give you a single abstract number. We break your footprint down visually so you see exactly what drives your impact.
              </p>
            </div>

            <div className="neo-card p-6 flex flex-col gap-4">
              <div className="h-11 w-11 rounded-xl bg-[#FFD53D] border-2 border-black flex items-center justify-center text-slate-950 shadow-[2px_2px_0px_0px_#000000]">
                <Zap className="h-5.5 w-5.5 fill-[#FFD53D]/20 text-slate-950" />
              </div>
              <h3 className="text-xl font-black text-slate-950">ROI-Driven Decision Engine</h3>
              <p className="text-slate-700 text-sm font-medium leading-relaxed">
                We rank recommendations based on estimated carbon reduction, cost to implement, difficulty level, and relevance to your lifestyle.
              </p>
            </div>

            <div className="neo-card p-6 flex flex-col gap-4">
              <div className="h-11 w-11 rounded-xl bg-[#00CC66] border-2 border-black flex items-center justify-center text-slate-950 shadow-[2px_2px_0px_0px_#000000]">
                <ShieldCheck className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-xl font-black text-slate-950">Explainable Climate Insights</h3>
              <p className="text-slate-700 text-sm font-medium leading-relaxed">
                Deterministic calculation combined with lightweight AI helper layers gives you highly tailored, clear explanations you can trust.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white border-y-3 border-black px-6">
          <div className="max-w-5xl mx-auto w-full">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-950 mb-4">
                How Climbit guides your journey
              </h2>
              <p className="text-slate-700 font-semibold max-w-xl mx-auto">
                Four simple steps to clarify and minimize your environmental impact.
              </p>
            </div>

            <div className="relative border-l-3 border-black ml-4 md:ml-32 pl-8 md:pl-12 space-y-12">
              <div className="relative">
                <div className="absolute -left-[45px] md:-left-[61px] top-0 h-8 w-8 rounded-full bg-[#FFD53D] border-3 border-black flex items-center justify-center text-xs font-black text-slate-950 shadow-[2px_2px_0px_0px_#000000]" />
                <h3 className="text-xl font-black text-slate-950 mb-2">1. The 60-Second Onboarding</h3>
                <p className="text-slate-600 max-w-2xl text-sm font-semibold leading-relaxed">
                  Answer 8 quick questions about your diet, commute style, household electricity, and delivery patterns.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[45px] md:-left-[61px] top-0 h-8 w-8 rounded-full bg-[#00CC66] border-3 border-black flex items-center justify-center text-xs font-black text-slate-950 shadow-[2px_2px_0px_0px_#000000]" />
                <h3 className="text-xl font-black text-slate-950 mb-2">2. Get Your Persona & Drivers</h3>
                <p className="text-slate-600 max-w-2xl text-sm font-semibold leading-relaxed">
                  Understand your climate persona (e.g. &ldquo;The Convenience Curator&rdquo;) and see which categories drive your monthly emissions.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[45px] md:-left-[61px] top-0 h-8 w-8 rounded-full bg-[#B288FF] border-3 border-black flex items-center justify-center text-xs font-black text-slate-950 shadow-[2px_2px_0px_0px_#000000]" />
                <h3 className="text-xl font-black text-slate-950 mb-2">3. Rank Custom Recommendations</h3>
                <p className="text-slate-600 max-w-2xl text-sm font-semibold leading-relaxed">
                  Review actions prioritized by our Return-on-Investment (ROI) formula, highlighting the highest carbon savings with the lowest effort.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[45px] md:-left-[61px] top-0 h-8 w-8 rounded-full bg-[#FF5A60] border-3 border-black flex items-center justify-center text-xs font-black text-slate-100 shadow-[2px_2px_0px_0px_#000000]" />
                <h3 className="text-xl font-black text-slate-950 mb-2">4. Simulate & Take the Challenge</h3>
                <p className="text-slate-600 max-w-2xl text-sm font-semibold leading-relaxed">
                  Simulate the environmental impact of your improvements, receive a weekly roadmap challenge, and share a badge with your network.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Callout */}
        <section className="py-20 px-6 flex flex-col items-center text-center relative max-w-4xl mx-auto w-full">
          <div className="neo-card bg-[#FAF6EE] p-8 md:p-12 w-full relative overflow-hidden flex flex-col items-center border-3 border-black shadow-[6px_6px_0px_0px_#000000]">
            <h2 className="text-3xl font-black text-slate-950 mb-4">
              Ready to find your best next step?
            </h2>
            <p className="text-slate-700 font-semibold max-w-lg mb-8 leading-relaxed">
              No sign-up required. Walk through onboarding, preview your dashboard, and generate your 30-day sprint card instantly.
            </p>

            <Button href="/onboarding" id="start-onboarding-cta" variant="primary" size="lg" className="flex items-center gap-2 px-8">
              Start Onboarding
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-3 border-black bg-white px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-700 text-xs font-bold">
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-[#00CC66]" />
          <span className="font-extrabold text-slate-950">Climbit Decision Engine</span>
        </div>
        <p className="text-center sm:text-right">
          © {new Date().getFullYear()} Climbit. Designed for transparency, accessibility, and action.
        </p>
      </footer>
    </div>
  );
}
