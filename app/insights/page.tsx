import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ShieldAlert, BadgeInfo, Scale, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: "Algorithm Insights | Climbit",
  description: "Detailed calculations and Return-on-Investment formulas for the Climbit decision engine.",
};

export default function Insights() {
  return (
    <div className="min-h-screen neo-grid text-slate-950 selection:bg-emerald-500/30 pb-20">

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 mt-12 space-y-10">
        
        {/* Title */}
        <div className="space-y-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-black text-slate-700 hover:text-emerald-600 transition-colors focus-visible:ring-3 focus-visible:ring-black rounded-lg p-1 outline-none">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-950 leading-tight">
            How Climbit&apos;s Decision Engine Works
          </h1>
          <p className="text-slate-700 text-sm md:text-base font-semibold leading-relaxed">
            Our recommendation ranking system is built for explainability, trust, and impact. Here is a look behind the curtain at the data and logic.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid gap-8">
          
          {/* Card 1: Deterministic Math */}
          <div className="neo-card p-6 space-y-4">
            <div className="h-10 w-10 rounded-lg bg-[#00CC66] border-2 border-black flex items-center justify-center text-slate-950 shadow-[2px_2px_0px_0px_#000000]">
              <Scale className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-black text-slate-950">Deterministic Calculations, No AI Guesses</h2>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">
              We never use artificial intelligence to calculate your carbon footprint, score your activities, or rank your checklist. All carbon savings and ROI math is evaluated locally in pure TypeScript functions. This ensures that every recommendation is 100% reproducible and verifiable.
            </p>
          </div>

          {/* Card 2: The ROI Formula */}
          <div className="neo-card p-6 space-y-4">
            <div className="h-10 w-10 rounded-lg bg-[#FFD53D] border-2 border-black flex items-center justify-center text-slate-950 shadow-[2px_2px_0px_0px_#000000]">
              <BadgeInfo className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-black text-slate-950">The Return-on-Investment (ROI) Formula</h2>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">
              To answer &ldquo;What is the single best action I should take next?&rdquo;, Climbit scores every catalog action using four weighted variables:
            </p>
            <div className="space-y-3 bg-[#FFFDF5] p-4 rounded-xl border-3 border-black text-xs font-mono text-slate-950 shadow-[2px_2px_0px_0px_#000000]">
              <p className="font-black text-[#00CC66]">ROI = (CarbonSavings * 0.45) + (Effort * 0.25) + (Cost * 0.20) + (Relevance * 0.10)</p>
              <ul className="list-disc pl-5 space-y-2 font-sans font-semibold text-slate-700 mt-2">
                <li>
                  <strong className="text-slate-950">Carbon Savings (45% weight):</strong> Measures how much CO₂ (in kg/month) the action cuts. High-savings actions score higher.
                </li>
                <li>
                  <strong className="text-slate-950">Effort Score (25% weight):</strong> Reflects implementation friction. We prefer easy actions: <code className="font-mono text-[#00CC66] font-bold">low = 10 points</code>, <code className="font-mono text-slate-800">medium = 6 points</code>, <code className="font-mono text-[#FF5A60] font-bold">high = 3 points</code>.
                </li>
                <li>
                  <strong className="text-slate-950">Cost Score (20% weight):</strong> Evaluates financial barriers. Free or cheap changes are preferred: <code className="font-mono text-[#00CC66] font-bold">low cost = 10 points</code>, <code className="font-mono text-[#FF5A60] font-bold">medium/high cost = 6/3 points</code>.
                </li>
                <li>
                  <strong className="text-slate-950">Relevance (10% weight):</strong> Boosted up to <code className="font-mono text-[#00CC66] font-bold">10 points</code> if the action category targets your largest footprint category.
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Database & Factors */}
          <div className="neo-card p-6 space-y-4">
            <div className="h-10 w-10 rounded-lg bg-[#B288FF] border-2 border-black flex items-center justify-center text-slate-950 shadow-[2px_2px_0px_0px_#000000]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-black text-slate-950">How We Use Artificial Intelligence</h2>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">
              We leverage Gemini 1.5 Flash exclusively on the server side to improve readability. The AI translates our deterministic calculations and category metrics into a human-friendly climate persona description, custom challenge captions, and a weekly motivational tip. If the API key is not present, Climbit falls back instantly to a rule-based copy engine so your dashboard is never blank.
            </p>
          </div>

          {/* Card 4: Limitation & Scope */}
          <div className="neo-card p-6 space-y-4 bg-[#FFF0F5]">
            <div className="h-10 w-10 rounded-lg bg-[#FF5A60] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000000]">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-black text-slate-950">Methodological Assumptions & Limitations</h2>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">
              Our emissions catalog utilizes average global lifestyle metrics. Individual home grid mixes, specific car engines, or specific delivery logistics variables vary by region. We strive to provide transparent estimates rather than absolute lab metrics to make calculations low-friction and motivating.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
