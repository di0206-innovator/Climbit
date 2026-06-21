import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useClimbitStore } from '../../lib/store';
import { getWeeklyReflectionAction } from '../../app/actions/ai';
import { motion } from 'framer-motion';

export default function ChallengeTracker() {
  const store = useClimbitStore();
  const { challenge, completedMilestones, weeklyReflection, footprint, answers } = store;
  const [isReflecting, setIsReflecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Automatically fetch on first load if it doesn't exist
  useEffect(() => {
    if (answers && footprint && !weeklyReflection && !isReflecting) {
      handleFetchReflection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, footprint, weeklyReflection]);

  const handleFetchReflection = async () => {
    if (!answers || !footprint) return;
    setIsReflecting(true);
    setErrorMsg(null);
    try {
      const ref = await getWeeklyReflectionAction(answers, completedMilestones.length, 4);
      store.setWeeklyReflection(ref);
    } catch (err: unknown) {
      console.error('Failed to load weekly reflection:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(message.includes('Rate limit') ? 'Rate limit reached. Please wait a minute.' : 'AI Coach is busy. Try again soon.');
    } finally {
      setIsReflecting(false);
    }
  };

  if (!challenge || !footprint) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="space-y-6"
    >
      {/* Coach's Action Plan */}
      <Card className="bg-[#EBF4FF] border-3 border-black shadow-[4px_4px_0px_0px_#000000]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-black text-slate-950 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#B288FF] fill-[#B288FF]/20" />
            Coach&apos;s Action Plan
          </CardTitle>
          <CardDescription>
            Tailored recommendations based on your answer combinations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-2">
          {(footprint.coachTips || [footprint.coachTip]).map((tip, idx) => (
            <div key={idx} className="flex gap-2.5 items-start bg-white border-2 border-black p-3 rounded-xl text-xs text-slate-800 font-semibold shadow-[2px_2px_0px_0px_#000000]">
              <span className="h-5 w-5 rounded-full bg-[#B288FF] text-slate-950 border-2 border-black flex items-center justify-center font-black text-[10px] shrink-0">
                {idx + 1}
              </span>
              <p className="leading-relaxed">
                {tip}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 30-Day Sprint Challenge Board */}
      <Card id="challenge-board-card" className="overflow-hidden bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000000]">
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
              // Active week is the first incomplete week
              const isActive = !isDone && (completedMilestones.length + 1 === ms.week || (completedMilestones.length === 0 && ms.week === 1));

              return (
                <button
                  key={ms.week}
                  id={`milestone-week-${ms.week}`}
                  onClick={() => store.toggleMilestone(ms.week)}
                  aria-pressed={isDone}
                  className={`text-left p-4 rounded-xl border-2 transition-all flex gap-3 outline-none ${
                    isDone
                      ? 'bg-blue-50 border-black translate-x-[2px] translate-y-[2px] shadow-none'
                      : isActive
                      ? 'bg-white border-blue-600 ring-2 ring-blue-400/50 shadow-[0_0_10px_rgba(37,99,235,0.2)] animate-pulse'
                      : 'bg-white border-black hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000000] shadow-[2px_2px_0px_0px_#000000]'
                  } focus-visible:ring-3 focus-visible:ring-black`}
                >
                  <div className="mt-0.5">
                    <CheckCircle2 className={`h-5 w-5 shrink-0 ${
                      isDone ? 'text-blue-600 fill-blue-600/10' : isActive ? 'text-blue-400' : 'text-slate-400'
                    }`} />
                  </div>
                  <div className="space-y-1">
                    <span className={`text-xs font-black block ${
                      isDone ? 'text-blue-800 line-through decoration-blue-600/50' : isActive ? 'text-blue-600 font-extrabold' : 'text-slate-950'
                    }`}>
                      {ms.title} {isActive && <span className="ml-1.5 text-[8px] bg-blue-100 text-blue-650 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Active</span>}
                    </span>
                    <p className="text-[11px] text-slate-700 font-semibold leading-normal">
                      {ms.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 p-4 bg-[#EBF4FF] border-2 border-black rounded-xl space-y-3 shadow-[2px_2px_0px_0px_#000000]">
            <div className="flex items-center justify-between">
              <h4 className="text-slate-950 font-black text-xs flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#B288FF]" />
                AI Coach Weekly Reflection
              </h4>
              <button
                onClick={handleFetchReflection}
                disabled={isReflecting}
                aria-label="Refresh weekly AI feedback"
                className="bg-white hover:bg-slate-50 border-2 border-black px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-3 w-3 ${isReflecting ? 'animate-spin' : ''}`} />
                {isReflecting ? 'Thinking...' : 'Get Reflection'}
              </button>
            </div>

            {isReflecting ? (
              <div className="space-y-2.5 py-1">
                <div className="h-3 bg-slate-200 border border-slate-350 rounded w-full animate-pulse" />
                <div className="h-3 bg-slate-200 border border-slate-350 rounded w-11/12 animate-pulse" />
                <div className="h-3 bg-slate-200 border border-slate-350 rounded w-3/4 animate-pulse" />
              </div>
            ) : errorMsg ? (
              <p className="text-red-650 text-xs font-bold">{errorMsg}</p>
            ) : weeklyReflection ? (
              <div className="space-y-2.5">
                <p className="text-slate-800 text-xs font-semibold leading-relaxed">
                  {weeklyReflection.summary}
                </p>
                <p className="text-slate-800 text-xs font-semibold">
                  <strong className="text-slate-950 font-extrabold">Focus Next Week:</strong> {weeklyReflection.focusNextWeek}
                </p>
                <p className="text-slate-650 text-xs italic font-bold border-l-2 border-[#B288FF] pl-2">
                  &quot;{weeklyReflection.motivationLine}&quot;
                </p>
              </div>
            ) : (
              <p className="text-slate-600 text-xs font-semibold">
                Mark your milestones and click &quot;Get Reflection&quot; to receive personalized feedback from your AI coach.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
