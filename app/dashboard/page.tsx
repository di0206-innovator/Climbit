'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@clerk/nextjs';
import { TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { motion } from 'framer-motion';

import { useClimbitStore } from '../../lib/store';
import { OnboardingAnswers } from '../../types';
import { calculateFootprint, rankActions, generateChallenge, simulateHabits } from '../../lib/carbon';
import { onboardingSchema } from '../../lib/validation/schemas';
import { 
  getProfileSummaryAction, 
  getRecommendationExplanationAction
} from '../actions/ai';
import { loadUserProfile, saveUserProfile } from '../../lib/supabase';

// Modular Components
import CarbonOverview from '../../components/dashboard/CarbonOverview';
import ActionRecommendations from '../../components/dashboard/ActionRecommendations';
import AILoggerPanel from '../../components/dashboard/AILoggerPanel';
import ChallengeTracker from '../../components/dashboard/ChallengeTracker';

const PredictiveChart = dynamic(() => import('../../components/PredictiveChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full flex items-center justify-center text-slate-700 text-sm font-bold">Loading predictive chart...</div>
});

export default function Dashboard() {
  const router = useRouter();
  const store = useClimbitStore();
  const { isLoaded, userId, getToken } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  // Load answers from Supabase or fallback to localStorage
  useEffect(() => {
    if (!isLoaded) return; // Wait for Clerk

    const initData = async () => {
      let rawAnswers = null;
      let usedSupabase = false;
      let token = null;

      if (userId) {
        try {
          token = await getToken({ template: 'supabase' });
          if (token) {
            const profile = await loadUserProfile(token, userId);
            if (profile && profile.answers_json) {
              rawAnswers = JSON.stringify(profile.answers_json);
              usedSupabase = true;
              
              if (profile.selected_actions) store.setSelectedActions(profile.selected_actions);
            }
          }
        } catch (e) {
          console.error("Failed to load from Supabase:", e);
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

        if (ranked.length > 0 && !usedSupabase) {
          store.setSelectedActions([ranked[0].id]);
        }

        // Automatic Migration: Save to Supabase if loaded from localStorage
        if (userId && token && !usedSupabase) {
          saveUserProfile(token, userId, {
            answers_json: validatedAnswers,
            footprint_json: calculatedFootprint,
            challenge_json: generatedChallenge,
            ranked_actions_json: ranked,
            selected_actions: ranked.length > 0 ? [ranked[0].id] : []
          });
        }

        // Trigger AI requests safely with error catch blocks
        getProfileSummaryAction(validatedAnswers)
          .then(store.setProfileSummary)
          .catch(err => console.error('Profile summary AI load failed:', err));
          
        if (ranked.length > 0) {
          getRecommendationExplanationAction(validatedAnswers, ranked[0].id)
            .then(store.setRecExplanation)
            .catch(err => console.error('Recommendation explanation AI load failed:', err));
        }
        
        setIsInitializing(false);
      } catch (e) {
        console.error('Failed to parse onboarding answers', e);
        router.push('/onboarding');
      }
    };

    initData();
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
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <CarbonOverview />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-3 border-black shadow-[4px_4px_0px_0px_#000000]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-black text-slate-950 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-[#00CC66]" />
                  Path to Net Zero
                </CardTitle>
                <CardDescription>
                  5-year projection based on your current persona and targets.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <PredictiveChart currentMonthly={store.footprint.monthlyTotal} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* MIDDLE & RIGHT COLUMNS */}
        <div className="lg:col-span-2 space-y-6">
          <ActionRecommendations />
          <AILoggerPanel />
          <ChallengeTracker />
        </div>
      </main>
    </div>
  );
}
