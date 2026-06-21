'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Leaf, Info, Sparkles, CheckCircle2, Trophy, Share2, HelpCircle, 
  RotateCcw, ShieldCheck, XCircle
} from 'lucide-react';
import Button from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import Progress from '../../components/ui/progress';
import { OnboardingAnswers, FootprintResult, RecommendationResult, ChallengeResult, SimulatorResult } from '../../types';
import { calculateFootprint, rankActions, simulateHabits, generateChallenge } from '../../lib/carbon';
import { 
  getProfileSummaryAction, 
  getRecommendationExplanationAction, 
  getObjectionHandlerAction,
  getWeeklyReflectionAction
} from '../actions/ai';
import type { ProfileSummary, RecommendationExplanation, ObjectionHandler, WeeklyReflection } from '../../lib/gemini';
import { onboardingSchema } from '../../lib/validation/schemas';

// Load chart dynamically to bypass Next.js SSR hydration warnings on SVG graphs
const FootprintChart = dynamic(() => import('../../components/FootprintChart'), {
  ssr: false,
  loading: () => <div className="h-[260px] w-full flex items-center justify-center text-slate-500 text-sm">Loading footprint chart...</div>
});

export default function Dashboard() {
  const router = useRouter();
  const [answers, setAnswers] = useState<OnboardingAnswers | null>(null);
  const [footprint, setFootprint] = useState<FootprintResult | null>(null);
  const [rankedActions, setRankedActions] = useState<RecommendationResult[]>([]);
  const [challenge, setChallenge] = useState<ChallengeResult | null>(null);
  
  // Simulator State
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [simulation, setSimulation] = useState<SimulatorResult | null>(null);
  
  // Challenge Checklist State
  const [completedMilestones, setCompletedMilestones] = useState<number[]>([]);

  // AI States
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [recExplanation, setRecExplanation] = useState<RecommendationExplanation | null>(null);
  const [objection, setObjection] = useState<ObjectionHandler | null>(null);
  const [weeklyReflection, setWeeklyReflection] = useState<WeeklyReflection | null>(null);
  const [isHandlingObjection, setIsHandlingObjection] = useState(false);

  // Load answers from localStorage on client mount
  useEffect(() => {
    const rawAnswers = localStorage.getItem('climbit_answers');
    if (!rawAnswers) {
      router.push('/onboarding');
      return;
    }

    try {
      const parsedAnswers = JSON.parse(rawAnswers);
      const validation = onboardingSchema.safeParse(parsedAnswers);
      if (!validation.success) {
        console.error('Onboarding answers failed validation:', validation.error);
        router.push('/onboarding');
        return;
      }

      const validatedAnswers = validation.data as OnboardingAnswers;
      setAnswers(validatedAnswers);

      const calculatedFootprint = calculateFootprint(validatedAnswers);
      const ranked = rankActions(validatedAnswers, calculatedFootprint);
      const generatedChallenge = generateChallenge(validatedAnswers, ranked);

      setFootprint(calculatedFootprint);
      setRankedActions(ranked);
      setChallenge(generatedChallenge);

      if (ranked.length > 0) {
        setSelectedActions([ranked[0].id]);
      }

      // Trigger AI requests safely with error catch blocks
      getProfileSummaryAction(validatedAnswers)
        .then(setProfileSummary)
        .catch(err => console.error('Profile summary AI load failed:', err));
        
      if (ranked.length > 0) {
        getRecommendationExplanationAction(validatedAnswers, ranked[0].id)
          .then(setRecExplanation)
          .catch(err => console.error('Recommendation explanation AI load failed:', err));
      }
    } catch (e) {
      console.error('Failed to parse onboarding answers from localStorage', e);
      router.push('/onboarding');
    }
  }, [router]);

  // Recalculate simulation results whenever checked actions change
  useEffect(() => {
    if (footprint) {
      const sim = simulateHabits(footprint, selectedActions);
      setSimulation(sim);
    }
  }, [selectedActions, footprint]);

  // Recalculate Weekly Reflection when milestones change
  useEffect(() => {
    if (answers && footprint) {
      getWeeklyReflectionAction(answers, completedMilestones.length, 4)
        .then(setWeeklyReflection)
        .catch(err => console.error('Weekly reflection AI load failed:', err));
    }
  }, [completedMilestones, answers, footprint]);

  if (!answers || !footprint || !simulation || !challenge) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin" />
          <span>Building dashboard...</span>
        </div>
      </div>
    );
  }

  const topAction = rankedActions[0];

  const toggleAction = (id: string) => {
    setSelectedActions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleMilestone = (week: number) => {
    setCompletedMilestones((prev) =>
      prev.includes(week) ? prev.filter((w) => w !== week) : [...prev, week]
    );
  };

  const resetSimulator = () => {
    setSelectedActions([topAction.id]);
  };

  const handleObjection = async () => {
    setIsHandlingObjection(true);
    try {
      const result = await getObjectionHandlerAction(answers, topAction.id);
      setObjection(result);
    } catch (err) {
      console.error("Objection handle failed", err);
    }
    setIsHandlingObjection(false);
  };

  const shareParams = new URLSearchParams({
    persona: profileSummary?.personaTitle || footprint.personaTitle,
    topAction: topAction.title,
    savings: (simulation.monthlyReduction || topAction.baseCarbonSavings).toString(),
    badge: challenge.badge
  }).toString();

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-emerald-500/30 pb-20">
      <header className="sticky top-0 z-50 glass border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1 outline-none">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Leaf className="h-4.5 w-4.5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
            Climbit
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          <Button href="/onboarding" variant="outline" size="sm" id="restart-onboarding-btn">
            Retake Quiz
          </Button>
          <Button href={`/share?${shareParams}`} variant="primary" size="sm" className="flex items-center gap-1.5" id="go-share-btn">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          
          <Card className="relative overflow-hidden border-emerald-500/20" id="footprint-profile-card">
            <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Estimated Footprint
              </CardDescription>
              <CardTitle className="text-4xl md:text-5xl font-black text-white flex items-baseline gap-1.5 mt-1">
                {footprint.monthlyTotal}
                <span className="text-xs font-normal text-slate-400 tracking-normal">kg CO₂ / month</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-400">
                Equivalent to approx <span className="text-white font-bold">{footprint.annualTotal} kg</span> of carbon emissions annually.
              </div>
              
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/15 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wide">
                    Persona: {profileSummary ? profileSummary.personaTitle : 'Loading...'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {profileSummary ? profileSummary.personaSummary : 'Analyzing your footprint...'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card id="breakdown-chart-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                Emission Breakdown
              </CardTitle>
              <CardDescription className="text-slate-400">
                Visualizing which lifestyle habits drive the highest emissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <FootprintChart categories={footprint.categories} />
            </CardContent>
          </Card>

          {profileSummary && (
            <Card className="border-indigo-500/10" id="opportunity-card">
              <CardHeader className="pb-2 flex flex-row items-center gap-2.5 space-y-0">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/25">
                  <Info className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-white">Top Opportunity</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &ldquo;{profileSummary.topOpportunity}&rdquo;
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* MIDDLE & RIGHT COLUMNS */}
        <div className="lg:col-span-2 space-y-6">

          <Card className="border-emerald-500/30 bg-gradient-to-br from-slate-900 to-[#0e172a] shadow-lg shadow-emerald-950/5 relative overflow-hidden" id="hero-recommendation-card">
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 text-[10px] font-extrabold uppercase tracking-wider">
                  Top Recommended Action
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-slate-400 text-xs font-semibold">ROI Score: {topAction.roiScore}/100</span>
              </div>
              <CardTitle className="text-2xl font-black text-white leading-tight">
                {topAction.title}
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm mt-1">
                {topAction.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div className="text-center md:text-left">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Est. Saving</span>
                  <span className="text-sm font-extrabold text-emerald-400">-{topAction.baseCarbonSavings} kg CO₂/mo</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Money saved</span>
                  <span className="text-sm font-extrabold text-emerald-400">${topAction.baseMoneySavings}/mo</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Effort</span>
                  <span className="text-sm font-extrabold text-slate-200 capitalize">{topAction.effort}</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Confidence</span>
                  <span className="text-sm font-extrabold text-slate-200">{Math.round(topAction.confidence * 100)}%</span>
                </div>
              </div>

              {recExplanation ? (
                <div className="flex gap-2.5 items-start bg-emerald-950/15 border border-emerald-500/10 p-3.5 rounded-xl text-xs text-slate-300 leading-relaxed">
                  <HelpCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block mb-0.5">{recExplanation.headline}</span>
                    {recExplanation.explanation} {recExplanation.whyItFits}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 animate-pulse">Generating explanation...</div>
              )}

              {/* Objection Handler Section */}
              {!objection ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleObjection}
                  disabled={isHandlingObjection}
                  className="mt-2 text-xs border-slate-800 hover:bg-slate-800"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  {isHandlingObjection ? 'Checking alternatives...' : "I can't do this"}
                </Button>
              ) : (
                <div className="mt-4 p-4 bg-orange-950/20 border border-orange-500/20 rounded-xl space-y-2">
                  <h4 className="text-orange-400 font-bold text-sm flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Alternative Action: {objection.fallbackAction}
                  </h4>
                  <p className="text-slate-300 text-xs">
                    <strong>Why?</strong> {objection.reason}
                  </p>
                  <p className="text-slate-400 text-xs italic">
                    <strong>Next Step:</strong> {objection.nextBestStep}
                  </p>
                </div>
              )}

            </CardContent>

            <CardFooter className="bg-slate-950/20 border-t border-slate-850 flex items-center justify-between py-4">
              <span className="text-xs text-slate-400">
                Toggle to simulate carbon reduction below.
              </span>
              <label 
                className="flex items-center gap-2.5 cursor-pointer select-none"
                htmlFor={`check-${topAction.id}`}
              >
                <input
                  type="checkbox"
                  id={`check-${topAction.id}`}
                  checked={selectedActions.includes(topAction.id)}
                  onChange={() => toggleAction(topAction.id)}
                  className="h-4.5 w-4.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900 outline-none cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-200">Include in simulation</span>
              </label>
            </CardFooter>
          </Card>

          <Card className="border-teal-500/10" id="habit-simulator-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  Habit Simulator
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Select and apply actions to see how your footprint improves.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSimulator}
                className="h-8 px-2 text-slate-400 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase mb-1">New Footprint</span>
                  <span className="text-2xl font-black text-white">{simulation.newFootprint}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">kg CO₂/mo</span>
                </div>
                <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase mb-1">Savings</span>
                  <span className="text-2xl font-black text-emerald-400">-{simulation.monthlyReduction}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">kg CO₂/mo</span>
                </div>
                <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase mb-1">Money Saved</span>
                  <span className="text-2xl font-black text-emerald-400">${simulation.moneySaved}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">/ month</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>Original Footprint</span>
                    <span className="text-slate-200">{simulation.originalFootprint} kg CO₂</span>
                  </div>
                  <Progress value={100} barClassName="bg-slate-700" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>Improved Footprint</span>
                    <span className="text-emerald-400">{simulation.newFootprint} kg CO₂ (-{simulation.monthlyReduction} kg)</span>
                  </div>
                  <Progress 
                    value={Math.max(15, Math.round((simulation.newFootprint / footprint.monthlyTotal) * 100))} 
                    barClassName="bg-gradient-to-r from-emerald-500 to-teal-400" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 30-Day Sprint Challenge Board */}
          <Card className="border-indigo-500/10 overflow-hidden" id="challenge-board-card">
            <div className="p-6 bg-gradient-to-r from-[#0d1222] to-[#0f172a] border-b border-slate-850 flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-indigo-400" />
                  Your 30-Day Sprint
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  {challenge.description}
                </CardDescription>
              </div>
              <div className="text-right shrink-0">
                <span className="text-2xl font-black text-indigo-400">
                  {completedMilestones.length}/4
                </span>
                <span className="text-[10px] text-slate-500 block font-bold uppercase uppercase tracking-wider">Weeks Done</span>
              </div>
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {challenge.milestones.map((ms) => {
                  const isDone = completedMilestones.includes(ms.week);
                  return (
                    <button
                      key={ms.week}
                      id={`milestone-week-${ms.week}`}
                      onClick={() => toggleMilestone(ms.week)}
                      className={`text-left p-4 rounded-xl border transition-all flex gap-3 outline-none ${
                        isDone
                          ? 'bg-indigo-950/15 border-indigo-500/30'
                          : 'bg-[#0f1627]/40 border-slate-800/80 hover:border-slate-700/80'
                      } focus-visible:ring-2 focus-visible:ring-indigo-500`}
                    >
                      <div className="mt-0.5">
                        <CheckCircle2 className={`h-4.5 w-4.5 shrink-0 ${
                          isDone ? 'text-indigo-400 fill-indigo-400/10' : 'text-slate-600'
                        }`} />
                      </div>
                      <div className="space-y-1">
                        <span className={`text-xs font-bold block ${
                          isDone ? 'text-indigo-400 line-through decoration-indigo-500/50' : 'text-slate-200'
                        }`}>
                          {ms.title}
                        </span>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          {ms.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {weeklyReflection && (
                <div className="mt-4 p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-2">
                  <h4 className="text-indigo-400 font-bold text-sm">Weekly Reflection</h4>
                  <p className="text-slate-300 text-xs">
                    {weeklyReflection.summary}
                  </p>
                  <p className="text-slate-300 text-xs">
                    <strong>Focus Next Week:</strong> {weeklyReflection.focusNextWeek}
                  </p>
                  <p className="text-slate-400 text-xs italic">
                    &quot;{weeklyReflection.motivationLine}&quot;
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-800/60" id="explainability-panel-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                Algorithmic Explainability
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-3 leading-relaxed">
              <p>
                Climbit does not use AI for core math, scores, or rankings. All outputs are computed using transparent, deterministic formulas. Learn more details in the{' '}
                <Link href="/insights" className="text-emerald-450 underline hover:text-emerald-300 font-semibold outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-sm">
                  Explainability Panel
                </Link>
                .
              </p>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
