import Link from 'next/link';
import { Leaf, ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import Button from '../components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#090d16] text-slate-100 selection:bg-emerald-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1 outline-none">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Leaf className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
            Climbit
          </span>
        </Link>
        <Button href="/onboarding" id="start-onboarding-header" variant="secondary" size="sm">
          Get Started
        </Button>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative py-20 px-6 flex flex-col items-center text-center overflow-hidden border-b border-slate-900">
          {/* Background decorative glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 h-[250px] w-[250px] rounded-full bg-teal-500/10 blur-[60px] pointer-events-none" />

          <div className="max-w-3xl flex flex-col items-center relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 animate-fade-in">
              <Zap className="h-3.5 w-3.5 fill-emerald-400/20" />
              Next-Gen Climate Decision Engine
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
              Stop guessing. Take the single{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                best climate action
              </span>{' '}
              next.
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-xl mb-10 leading-relaxed">
              Understand your carbon footprint, identify high-impact habits, and get a personalized path ranked by carbon savings, cost, and effort.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
              <Button href="/onboarding" id="start-onboarding-hero" variant="primary" size="lg" className="w-full sm:w-auto flex items-center gap-2">
                Find Your Best Next Action
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="py-16 px-6 max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4">
              Why generic carbon calculators fail
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Carbon emissions are invisible, and standard advice is often generic, overwhelming, or expensive. Climbit is built differently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/25">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Visual Emission Source Breakdown</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Most calculators give you a single abstract number. We break your footprint down visually so you see exactly what drives your impact.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/25">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">ROI-Driven Decision Engine</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                We rank recommendations based on estimated carbon reduction, cost to implement, difficulty level, and relevance to your lifestyle.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/25">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Explainable Climate Insights</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Deterministic calculation combined with lightweight AI helper layers gives you highly tailored, clear explanations you can trust.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-[#0c1220] border-y border-slate-900 px-6">
          <div className="max-w-5xl mx-auto w-full">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4">
                How Climbit guides your journey
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Four simple steps to clarify and minimize your environmental impact.
              </p>
            </div>

            <div className="relative border-l border-slate-800 ml-4 md:ml-32 pl-8 md:pl-12 space-y-12">
              <div className="relative">
                <div className="absolute -left-[41px] md:-left-[57px] top-0 h-6 w-6 rounded-full bg-emerald-600 border-4 border-[#0c1220] flex items-center justify-center text-xs font-bold text-slate-100" />
                <h3 className="text-xl font-bold text-white mb-2">1. The 60-Second Onboarding</h3>
                <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                  Answer 8 quick questions about your diet, commute style, household electricity, and delivery patterns.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[41px] md:-left-[57px] top-0 h-6 w-6 rounded-full bg-emerald-600 border-4 border-[#0c1220] flex items-center justify-center text-xs font-bold text-slate-100" />
                <h3 className="text-xl font-bold text-white mb-2">2. Get Your Persona & Drivers</h3>
                <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                  Understand your climate persona (e.g. &ldquo;The Convenience Curator&rdquo;) and see which categories drive your monthly emissions.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[41px] md:-left-[57px] top-0 h-6 w-6 rounded-full bg-emerald-600 border-4 border-[#0c1220] flex items-center justify-center text-xs font-bold text-slate-100" />
                <h3 className="text-xl font-bold text-white mb-2">3. Rank Custom Recommendations</h3>
                <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                  Review actions prioritized by our Return-on-Investment (ROI) formula, highlighting the highest carbon savings with the lowest effort.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[41px] md:-left-[57px] top-0 h-6 w-6 rounded-full bg-emerald-600 border-4 border-[#0c1220] flex items-center justify-center text-xs font-bold text-slate-100" />
                <h3 className="text-xl font-bold text-white mb-2">4. Simulate & Take the Challenge</h3>
                <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                  Simulate the environmental impact of your improvements, receive a weekly roadmap challenge, and share a badge with your network.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Callout */}
        <section className="py-20 px-6 flex flex-col items-center text-center relative max-w-4xl mx-auto w-full">
          <div className="glass-card rounded-3xl p-8 md:p-12 w-full relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
            
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Ready to find your best next step?
            </h2>
            <p className="text-slate-400 max-w-lg mb-8 leading-relaxed">
              No sign-up required. Walk through onboarding, preview your dashboard, and generate your 30-day sprint card instantly.
            </p>

            <Button href="/onboarding" id="start-onboarding-cta" variant="primary" size="lg" className="flex items-center gap-2 px-8">
              Start Onboarding
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060a11] px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-emerald-500" />
          <span className="font-semibold text-slate-400">Climbit Decision Engine</span>
        </div>
        <p className="text-center sm:text-right">
          © {new Date().getFullYear()} Climbit. Designed for transparency, accessibility, and action.
        </p>
      </footer>
    </div>
  );
}
