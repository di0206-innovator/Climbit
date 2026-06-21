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
  loading: () => <div className="h-[260px] w-full flex items-center justify-center text-slate-700 text-sm font-bold">Loading footprint chart...</div>
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
      <div className="min-h-screen neo-grid flex items-center justify-center text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-black border-t-[#00CC66] rounded-full animate-spin" />
          <span className="font-extrabold text-sm">Building dashboard...</span>
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
    <div className="min-h-screen neo-grid text-slate-950 selection:bg-emerald-500/30 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b-3 border-black px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group focus-visible:ring-3 focus-visible:ring-black rounded-lg p-1 outline-none">
          <div className="h-8 w-8 rounded-lg bg-[#00CC66] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] group-hover:scale-105 transition-transform">
            <Leaf className="h-4.5 w-4.5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-950 group-hover:text-emerald-600 transition-colors">
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
          
          <Card className="relative overflow-hidden bg-[#E8F8F0] border-3 border-black shadow-[4px_4px_0px_0px_#000000]" id="footprint-profile-card">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
                Estimated Footprint
              </CardDescription>
              <CardTitle className="text-4xl md:text-5xl font-black text-slate-950 flex items-baseline gap-1.5 mt-1">
                {footprint.monthlyTotal}
                <span className="text-xs font-bold text-slate-700 tracking-normal">kg CO₂ / month</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm font-semibold text-slate-700">
                Equivalent to approx <span className="text-slate-950 font-black">{footprint.annualTotal} kg</span> of carbon emissions annually.
              </div>
              
              <div className="p-4 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-[#FFD53D] fill-[#FFD53D]/25 stroke-[2]" />
                  <span className="text-xs font-black text-slate-950 uppercase tracking-wide">
                    Persona: {profileSummary ? profileSummary.personaTitle : 'Loading...'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  {profileSummary ? profileSummary.personaSummary : 'Analyzing your footprint...'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card id="breakdown-chart-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-black text-slate-950 flex items-center gap-2">
                Emission Breakdown
              </CardTitle>
              <CardDescription>
                Visualizing which lifestyle habits drive the highest emissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <FootprintChart categories={footprint.categories} />
            </CardContent>
          </Card>

          {profileSummary && (
            <Card className="bg-[#FFF0F5] border-3 border-black shadow-[4px_4px_0px_0px_#000000]" id="opportunity-card">
              <CardHeader className="pb-2 flex flex-row items-center gap-2.5 space-y-0">
                <div className="h-8 w-8 rounded-lg bg-[#FF5A60] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000000]">
                  <Info className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-black text-slate-950">Top Opportunity</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-800 font-bold leading-relaxed italic">
                  &ldquo;{profileSummary.topOpportunity}&rdquo;
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* MIDDLE & RIGHT COLUMNS */}
        <div className="lg:col-span-2 space-y-6">

          <Card className="bg-[#FFFDF5] border-3 border-black shadow-[4px_4px_0px_0px_#000000] relative overflow-hidden" id="hero-recommendation-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#00CC66] text-slate-950 border-2 border-black text-[9px] font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_#000000]">
                  Top Recommended Action
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-slate-855 text-xs font-extrabold">ROI Score: {topAction.roiScore}/100</span>
              </div>
              <CardTitle className="text-2xl font-black text-slate-950 leading-tight">
                {topAction.title}
              </CardTitle>
              <CardDescription>
                {topAction.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                <div className="text-center md:text-left">
                  <span className="text-[9px] text-slate-500 font-black block uppercase">Est. Saving</span>
                  <span className="text-sm font-black text-[#00CC66]">-{topAction.baseCarbonSavings} kg CO₂/mo</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-[9px] text-slate-500 font-black block uppercase">Money saved</span>
                  <span className="text-sm font-black text-[#00CC66]">${topAction.baseMoneySavings}/mo</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-[9px] text-slate-500 font-black block uppercase">Effort</span>
                  <span className="text-sm font-black text-slate-900 capitalize">{topAction.effort}</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-[9px] text-slate-500 font-black block uppercase">Confidence</span>
                  <span className="text-sm font-black text-slate-900">{Math.round(topAction.confidence * 100)}%</span>
                </div>
              </div>

              {recExplanation ? (
                <div className="flex gap-2.5 items-start bg-white border-2 border-black p-3.5 rounded-xl text-xs text-slate-800 font-semibold leading-relaxed shadow-[2px_2px_0px_0px_#000000]">
                  <HelpCircle className="h-4.5 w-4.5 text-[#00CC66] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-slate-950 block mb-0.5">{recExplanation.headline}</span>
                    {recExplanation.explanation} {recExplanation.whyItFits}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 animate-pulse font-bold">Generating explanation...</div>
              )}

              {/* Objection Handler Section */}
              {!objection ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleObjection}
                  disabled={isHandlingObjection}
                  className="mt-2 text-xs border-2 border-black"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  {isHandlingObjection ? 'Checking alternatives...' : "I can't do this"}
                </Button>
              ) : (
                <div className="mt-4 p-4 bg-[#FFEEDD] border-2 border-black rounded-xl space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <h4 className="text-slate-950 font-black text-sm flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#FF5A60]" />
                    Alternative Action: {objection.fallbackAction}
                  </h4>
                  <p className="text-slate-800 text-xs font-semibold">
                    <strong>Why?</strong> {objection.reason}
                  </p>
                  <p className="text-slate-600 text-xs italic font-bold">
                    <strong>Next Step:</strong> {objection.nextBestStep}
                  </p>
                </div>
              )}

            </CardContent>

            <CardFooter className="bg-white border-t-3 border-black flex items-center justify-between py-4">
              <span className="text-xs text-slate-650 font-bold">
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
                  className="h-5 w-5 rounded border-2 border-black text-[#00CC66] focus:ring-black bg-white outline-none cursor-pointer"
                />
                <span className="text-xs font-black text-slate-900">Include in simulation</span>
              </label>
            </CardFooter>
          </Card>

          <Card id="habit-simulator-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-black text-slate-950 flex items-center gap-2">
                  Habit Simulator
                </CardTitle>
                <CardDescription>
                  Select and apply actions to see how your footprint improves.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSimulator}
                className="h-8 px-2 text-slate-600 hover:text-slate-900 border-none shadow-none active:translate-x-0 active:translate-y-0"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border-2 border-black p-4 rounded-2xl text-center shadow-[3px_3px_0px_0px_#000000]">
                  <span className="text-[9px] text-slate-500 font-black block uppercase mb-1">New Footprint</span>
                  <span className="text-2xl font-black text-slate-950">{simulation.newFootprint}</span>
                  <span className="text-[9px] text-slate-650 block font-bold mt-0.5">kg CO₂/mo</span>
                </div>
                <div className="bg-white border-2 border-black p-4 rounded-2xl text-center shadow-[3px_3px_0px_0px_#000000]">
                  <span className="text-[9px] text-slate-500 font-black block uppercase mb-1">Savings</span>
                  <span className="text-2xl font-black text-[#00CC66]">-{simulation.monthlyReduction}</span>
                  <span className="text-[9px] text-slate-650 block font-bold mt-0.5">kg CO₂/mo</span>
                </div>
                <div className="bg-white border-2 border-black p-4 rounded-2xl text-center shadow-[3px_3px_0px_0px_#000000]">
                  <span className="text-[9px] text-slate-500 font-black block uppercase mb-1">Money Saved</span>
                  <span className="text-2xl font-black text-[#00CC66]">${simulation.moneySaved}</span>
                  <span className="text-[9px] text-slate-650 block font-bold mt-0.5">/ month</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-black text-slate-800">
                    <span>Original Footprint</span>
                    <span>{simulation.originalFootprint} kg CO₂</span>
                  </div>
                  <Progress value={100} barClassName="bg-slate-400" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-black text-slate-800">
                    <span>Improved Footprint</span>
                    <span className="text-[#00CC66]">{simulation.newFootprint} kg CO₂ (-{simulation.monthlyReduction} kg)</span>
                  </div>
                  <Progress 
                    value={Math.max(15, Math.round((simulation.newFootprint / footprint.monthlyTotal) * 100))} 
                    barClassName="bg-[#00CC66]" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 30-Day Sprint Challenge Board */}
          <Card className="overflow-hidden" id="challenge-board-card">
            <div className="p-6 bg-[#EBF4FF] border-b-3 border-black flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-black text-slate-950 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#B288FF]" />
                  Your 30-Day Sprint
                </CardTitle>
                <CardDescription>
                  {challenge.description}
                </CardDescription>
              </div>
              <div className="text-right shrink-0 bg-white border-2 border-black px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_#000000]">
                <span className="text-2xl font-black text-slate-950">
                  {completedMilestones.length}/4
                </span>
                <span className="text-[8px] text-slate-500 block font-black uppercase tracking-wider">Weeks Done</span>
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
                      className={`text-left p-4 rounded-xl border-2 border-black transition-all flex gap-3 outline-none ${
                        isDone
                          ? 'bg-[#EBF4FF] translate-x-[2px] translate-y-[2px] shadow-none'
                          : 'bg-white hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000000] shadow-[2px_2px_0px_0px_#000000]'
                      } focus-visible:ring-3 focus-visible:ring-black`}
                    >
                      <div className="mt-0.5">
                        <CheckCircle2 className={`h-5 w-5 shrink-0 ${
                          isDone ? 'text-blue-600 fill-blue-600/10' : 'text-slate-400'
                        }`} />
                      </div>
                      <div className="space-y-1">
                        <span className={`text-xs font-black block ${
                          isDone ? 'text-blue-750 line-through decoration-blue-600/50' : 'text-slate-950'
                        }`}>
                          {ms.title}
                        </span>
                        <p className="text-[11px] text-slate-700 font-semibold leading-normal">
                          {ms.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {weeklyReflection && (
                <div className="mt-4 p-4 bg-[#EBF4FF] border-2 border-black rounded-xl space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <h4 className="text-slate-950 font-black text-sm">Weekly Reflection</h4>
                  <p className="text-slate-800 text-xs font-semibold">
                    {weeklyReflection.summary}
                  </p>
                  <p className="text-slate-800 text-xs font-semibold">
                    <strong>Focus Next Week:</strong> {weeklyReflection.focusNextWeek}
                  </p>
                  <p className="text-slate-650 text-xs italic font-bold">
                    &quot;{weeklyReflection.motivationLine}&quot;
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-3 border-black" id="explainability-panel-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black text-slate-950 flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-[#00CC66]" />
                Algorithmic Explainability
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-750 font-semibold space-y-3 leading-relaxed">
              <p>
                Climbit does not use AI for core math, scores, or rankings. All outputs are computed using transparent, deterministic formulas. Learn more details in the{' '}
                <Link href="/insights" className="text-emerald-600 underline hover:text-[#00CC66] font-black outline-none focus-visible:ring-1 focus-visible:ring-black rounded-sm">
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
