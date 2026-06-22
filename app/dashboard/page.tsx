'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@clerk/nextjs';
import { TrendingDown, Calendar, Plus, Trash2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { motion } from 'framer-motion';

import { useClimbitStore } from '../../lib/store';
import { OnboardingAnswers, FootprintHistoryEntry } from '../../types';
import { calculateFootprint, rankActions, generateChallenge, simulateHabits } from '../../lib/carbon';
import { onboardingSchema } from '../../lib/validation/schemas';
import { 
  getProfileSummaryAction, 
  getRecommendationExplanationAction
} from '../actions/ai';
import { loadUserProfile, saveUserProfile } from '../../lib/supabase';
import { generateMockHistory } from '../../lib/history';

// Modular Components
import CarbonOverview from '../../components/dashboard/CarbonOverview';
import ActionRecommendations from '../../components/dashboard/ActionRecommendations';
import AILoggerPanel from '../../components/dashboard/AILoggerPanel';
import ChallengeTracker from '../../components/dashboard/ChallengeTracker';
import Button from '../../components/ui/button';
import LogFootprintModal from '../../components/dashboard/LogFootprintModal';

const PredictiveChart = dynamic(() => import('../../components/PredictiveChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full flex items-center justify-center text-slate-700 text-sm font-bold">Loading predictive chart...</div>
});

const HistoryChart = dynamic(() => import('../../components/HistoryChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full flex items-center justify-center text-slate-700 text-sm font-bold">Loading history chart...</div>
});

export default function Dashboard() {
  const router = useRouter();
  const store = useClimbitStore();
  const { isLoaded, userId, getToken } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<'projection' | 'history'>('projection');
  const [isLogOpen, setIsLogOpen] = useState(false);

  // Load answers from Supabase or fallback to localStorage
  useEffect(() => {
    let active = true;

    // Timeout fallback if Clerk takes too long to load (prevents loader freeze)
    const fallbackTimeout = setTimeout(() => {
      if (active && !isLoaded) {
        console.warn("Clerk load timed out. Falling back to local mode.");
        runInitData(false);
      }
    }, 2000);

    const runInitData = async (clerkLoaded: boolean) => {
      let rawAnswers = null;
      let usedSupabase = false;
      let token = null;

      if (clerkLoaded && userId) {
        try {
          token = await getToken({ template: 'supabase' });
          if (token) {
            const profile = await loadUserProfile(token, userId);
            if (profile && profile.answers_json) {
              rawAnswers = JSON.stringify(profile.answers_json);
              usedSupabase = true;
              
              if (profile.selected_actions) store.setSelectedActions(profile.selected_actions);
              if (profile.history_json) store.setHistory(profile.history_json);
            }
          }
        } catch {
          // Token fetch failed, likely because 'supabase' template is not configured.
          // Silently ignore to prevent console errors.
        }
      }

      // Fallback to local storage
      if (!rawAnswers) {
        rawAnswers = localStorage.getItem('climbit_answers');
      }

      if (!rawAnswers) {
        router.push('/onboarding');
        return;
      }

      try {
        const parsedAnswers = JSON.parse(rawAnswers);
        const validation = onboardingSchema.safeParse(parsedAnswers);
        if (!validation.success) {
          router.push('/onboarding');
          return;
        }

        const validatedAnswers = validation.data as OnboardingAnswers;
        const calculatedFootprint = calculateFootprint(validatedAnswers);
        const ranked = rankActions(validatedAnswers, calculatedFootprint);
        const generatedChallenge = generateChallenge(validatedAnswers, ranked);

        store.setCoreData(validatedAnswers, calculatedFootprint, ranked, generatedChallenge);

        let currentHistory = store.history;
        if (!currentHistory || currentHistory.length === 0) {
          currentHistory = generateMockHistory(validatedAnswers, calculatedFootprint.monthlyTotal);
          store.setHistory(currentHistory);
        }

        if (ranked.length > 0 && !usedSupabase) {
          store.setSelectedActions([ranked[0].id]);
        }

        // Automatic Migration: Save to Supabase if loaded from localStorage
        if (clerkLoaded && userId && token && !usedSupabase) {
          saveUserProfile(token, userId, {
            answers_json: validatedAnswers,
            footprint_json: calculatedFootprint,
            challenge_json: generatedChallenge,
            ranked_actions_json: ranked,
            selected_actions: ranked.length > 0 ? [ranked[0].id] : [],
            history_json: currentHistory
          });
        }

        // Trigger AI requests safely if authenticated to avoid Clerk 500 errors
        if (clerkLoaded && userId) {
          getProfileSummaryAction(validatedAnswers)
            .then(store.setProfileSummary)
            .catch(err => console.error('Profile summary AI load failed:', err));
            
          if (ranked.length > 0) {
            getRecommendationExplanationAction(validatedAnswers, ranked[0].id)
              .then(store.setRecExplanation)
              .catch(err => console.error('Recommendation explanation AI load failed:', err));
          }
        }
        
        setIsInitializing(false);
      } catch (e) {
        console.error('Failed to parse onboarding answers', e);
        router.push('/onboarding');
      }
    };

    if (isLoaded) {
      clearTimeout(fallbackTimeout);
      runInitData(true);
    }

    return () => {
      active = false;
      clearTimeout(fallbackTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, isLoaded, userId]);

  // Recalculate simulation results whenever checked actions change
  useEffect(() => {
    if (store.footprint) {
      const sim = simulateHabits(store.footprint, store.selectedActions);
      store.setSimulation(sim);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.selectedActions, store.footprint]);

  const handleLogged = async (newHistory: FootprintHistoryEntry[]) => {
    if (userId) {
      try {
        const token = await getToken({ template: 'supabase' });
        if (token) {
          await saveUserProfile(token, userId, {
            answers_json: store.answers,
            footprint_json: store.footprint,
            challenge_json: store.challenge,
            ranked_actions_json: store.rankedActions,
            selected_actions: store.selectedActions,
            history_json: newHistory
          });
        }
      } catch {
        // Token fetch failed, silently ignore
      }
    }
  };

  const handleDeleteHistory = async (id: string) => {
    const updatedHistory = store.history.filter((h) => h.id !== id);
    store.setHistory(updatedHistory);
    await handleLogged(updatedHistory);
  };

  if (isInitializing || !store.answers || !store.footprint || !store.challenge || !store.simulation) {
    return (
      <div className="min-h-screen neo-grid flex items-center justify-center text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-black border-t-[#00CC66] rounded-full animate-spin" />
          <span className="font-extrabold text-sm">Building dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen neo-grid text-slate-950 selection:bg-emerald-500/30 pb-20">
      <main className="max-w-6xl mx-auto px-4 mt-8 grid lg:grid-cols-3 gap-8">
      
      <LogFootprintModal 
        isOpen={isLogOpen} 
        onClose={() => setIsLogOpen(false)} 
        onLogged={handleLogged} 
      />
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CarbonOverview />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-3 border-black shadow-[4px_4px_0px_0px_#000000]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-black text-slate-950 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-[#00CC66]" />
                    Analytics & Goals
                  </CardTitle>
                  <div className="flex border-2 border-black rounded-lg overflow-hidden text-[10px] font-black shrink-0">
                    <button
                      id="tab-projection-btn"
                      onClick={() => setActiveTab('projection')}
                      className={`px-2 py-0.5 border-r-2 border-black transition-colors ${
                        activeTab === 'projection' ? 'bg-[#FFD53D]' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      Projection
                    </button>
                    <button
                      id="tab-history-btn"
                      onClick={() => setActiveTab('history')}
                      className={`px-2 py-0.5 transition-colors ${
                        activeTab === 'history' ? 'bg-[#B288FF]' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      History
                    </button>
                  </div>
                </div>
                <CardDescription>
                  {activeTab === 'projection' 
                    ? '5-year projection based on your current persona and targets.' 
                    : 'Historical carbon progression and logged calculations.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 space-y-4">
                {activeTab === 'projection' ? (
                  <PredictiveChart currentMonthly={store.footprint.monthlyTotal} />
                ) : (
                  <div className="space-y-4">
                    <HistoryChart history={store.history} />
                    
                    {/* History Analytics Summary */}
                    {store.history.length >= 2 ? (
                      (() => {
                        const baseline = store.history[0].monthlyTotal;
                        const latest = store.history[store.history.length - 1].monthlyTotal;
                        const pctChange = Math.round(((latest - baseline) / baseline) * 100);
                        const isReduction = pctChange < 0;
                        return (
                          <div className="p-3 bg-slate-50 border-2 border-black rounded-xl flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold block">Overall Growth</span>
                              <div className="flex items-center gap-1 mt-0.5">
                                {isReduction ? (
                                  <TrendingDown className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <TrendingUp className="h-4 w-4 text-rose-500" />
                                )}
                                <span className={`text-xs font-black ${isReduction ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {isReduction ? '' : '+'}{pctChange}% ({latest - baseline} kg)
                                </span>
                              </div>
                            </div>
                            <Button
                              id="log-entry-btn"
                              onClick={() => setIsLogOpen(true)}
                              variant="primary"
                              size="sm"
                              className="h-8 border-2 border-black text-[9px] font-black px-2.5 shrink-0"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Log Entry
                            </Button>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex justify-end">
                        <Button
                          id="log-entry-btn"
                          onClick={() => setIsLogOpen(true)}
                          variant="primary"
                          size="sm"
                          className="h-8 border-2 border-black text-[9px] font-black px-2.5"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Log Entry
                        </Button>
                      </div>
                    )}

                    {/* Logged Entries List */}
                    <div className="space-y-2 border-t-2 border-dashed border-slate-200 pt-3">
                      <span className="text-[10px] uppercase tracking-wider text-slate-950 font-black block">Logged Months</span>
                      <div className="max-h-[150px] overflow-y-auto space-y-1.5 pr-1">
                        {store.history.slice().reverse().map((entry) => {
                          const [year, month] = entry.date.split('-');
                          const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
                          const dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                          return (
                            <div key={entry.id} className="flex items-center justify-between border border-black p-2 bg-white rounded-lg text-xs font-bold shadow-[1px_1px_0px_0px_#000000]">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                <span>{dateStr}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-extrabold text-slate-900">{entry.monthlyTotal} kg</span>
                                <button
                                  onClick={() => handleDeleteHistory(entry.id)}
                                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-all"
                                  aria-label={`Delete entry for ${dateStr}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* MIDDLE & RIGHT COLUMNS */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <ActionRecommendations />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <AILoggerPanel />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <ChallengeTracker />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
