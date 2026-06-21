import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ShieldAlert, BadgeInfo, Scale, Sparkles } from 'lucide-react';
import Button from '../../components/ui/button';

export const metadata: Metadata = {
  title: "Algorithm Insights | Climbit",
  description: "Detailed calculations and Return-on-Investment formulas for the Climbit decision engine.",
};

export default function Insights() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-emerald-500/30 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1 outline-none">
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
            Climbit
          </span>
        </Link>
        <Button href="/dashboard" variant="outline" size="sm">
          Dashboard
        </Button>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 mt-12 space-y-10">
        
        {/* Title */}
        <div className="space-y-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1 outline-none">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            How Climbit&apos;s Decision Engine Works
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Our recommendation ranking system is built for explainability, trust, and impact. Here is a look behind the curtain at the data and logic.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid gap-6">
          
          {/* Card 1: Deterministic Math */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/25">
              <Scale className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Deterministic Calculations, No AI Guesses</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We never use artificial intelligence to calculate your carbon footprint, score your activities, or rank your checklist. All carbon savings and ROI math is evaluated locally in pure TypeScript functions. This ensures that every recommendation is 100% reproducible and verifiable.
            </p>
          </div>

          {/* Card 2: The ROI Formula */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/25">
              <BadgeInfo className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">The Return-on-Investment (ROI) Formula</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              To answer &ldquo;What is the single best action I should take next?&rdquo;, Climbit scores every catalog action using four weighted variables:
            </p>
            <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-xs font-mono text-slate-300">
              <p className="font-bold text-emerald-400">ROI = (CarbonSavings * 0.45) + (Effort * 0.25) + (Cost * 0.20) + (Relevance * 0.10)</p>
              <ul className="list-disc pl-5 space-y-2 font-sans text-slate-400 mt-2">
                <li>
                  <strong className="text-slate-200">Carbon Savings (45% weight):</strong> Measures how much CO₂ (in kg/month) the action cuts. High-savings actions score higher.
                </li>
                <li>
                  <strong className="text-slate-200">Effort Score (25% weight):</strong> Reflects implementation friction. We prefer easy actions: <code className="font-mono text-emerald-400">low = 10 points</code>, <code className="font-mono text-slate-300">medium = 6 points</code>, <code className="font-mono text-rose-400">high = 3 points</code>.
                </li>
                <li>
                  <strong className="text-slate-200">Cost Score (20% weight):</strong> Evaluates financial barriers. Free or cheap changes are preferred: <code className="font-mono text-emerald-400">low cost = 10 points</code>, <code className="font-mono text-rose-400">medium/high cost = 6/3 points</code>.
                </li>
                <li>
                  <strong className="text-slate-200">Relevance (10% weight):</strong> Boosted up to <code className="font-mono text-emerald-400">10 points</code> if the action targets your largest footprint category.
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Database & Factors */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="h-9 w-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">How We Use Artificial Intelligence</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We leverage Gemini 1.5 Flash exclusively on the server side to improve readability. The AI translates our deterministic calculations and category metrics into a human-friendly climate persona description, custom challenge captions, and a weekly motivational tip. If the API key is not present, Climbit falls back instantly to a rule-based copy engine so your dashboard is never blank.
            </p>
          </div>

          {/* Card 4: Limitation & Scope */}
          <div className="glass-card rounded-2xl p-6 space-y-4 border-rose-500/10">
            <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-450 border border-rose-500/25">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Methodological Assumptions & Limitations</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our emissions catalog utilizes average global lifestyle metrics. Individual home grid mixes, specific car engines, or specific delivery logistics variables vary by region. We strive to provide transparent estimates rather than absolute lab metrics to make calculations low-friction and motivating.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
