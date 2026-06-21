import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OnboardingAnswers, FootprintResult, RecommendationResult, ChallengeResult, SimulatorResult } from '../types';
import type { ProfileSummary, RecommendationExplanation, ObjectionHandler, WeeklyReflection } from '../lib/gemini';
import { type VisionExtractionResult } from '../app/actions/vision';
import { type VoiceExtractionResult } from '../app/actions/voice';

interface ClimbitState {
  answers: OnboardingAnswers | null;
  footprint: FootprintResult | null;
  rankedActions: RecommendationResult[];
  challenge: ChallengeResult | null;
  selectedActions: string[];
  simulation: SimulatorResult | null;
  completedMilestones: number[];
  
  profileSummary: ProfileSummary | null;
  recExplanation: RecommendationExplanation | null;
  objection: ObjectionHandler | null;
  weeklyReflection: WeeklyReflection | null;
  
  isHandlingObjection: boolean;
  
  isScanning: boolean;
  scanResult: VisionExtractionResult | null;
  scanError: string | null;
  
  isListening: boolean;
  voiceResult: VoiceExtractionResult | null;
  voiceError: string | null;

  onboardingStep: number;
  setOnboardingStep: (step: number) => void;

  setCoreData: (answers: OnboardingAnswers, footprint: FootprintResult, ranked: RecommendationResult[], challenge: ChallengeResult) => void;
  setSelectedActions: (actions: string[]) => void;
  setSimulation: (simulation: SimulatorResult) => void;
  toggleMilestone: (week: number) => void;
  
  setProfileSummary: (summary: ProfileSummary) => void;
  setRecExplanation: (exp: RecommendationExplanation) => void;
  setObjection: (obj: ObjectionHandler | null) => void;
  setWeeklyReflection: (ref: WeeklyReflection) => void;
  setIsHandlingObjection: (val: boolean) => void;
  
  setVisionState: (state: Partial<{ isScanning: boolean, scanResult: VisionExtractionResult | null, scanError: string | null }>) => void;
  setVoiceState: (state: Partial<{ isListening: boolean, voiceResult: VoiceExtractionResult | null, voiceError: string | null }>) => void;
}

export const useClimbitStore = create<ClimbitState>()(
  persist(
    (set) => ({
      answers: null,
      footprint: null,
      rankedActions: [],
      challenge: null,
      selectedActions: [],
      simulation: null,
      completedMilestones: [],
      
      profileSummary: null,
      recExplanation: null,
      objection: null,
      weeklyReflection: null,
      
      isHandlingObjection: false,
      
      isScanning: false,
      scanResult: null,
      scanError: null,
      
      isListening: false,
      voiceResult: null,
      voiceError: null,

      onboardingStep: 0,
      setOnboardingStep: (step) => set({ onboardingStep: step }),

      setCoreData: (answers, footprint, ranked, challenge) => set({ answers, footprint, rankedActions: ranked, challenge }),
      setSelectedActions: (actions) => set({ selectedActions: actions }),
      setSimulation: (simulation) => set({ simulation }),
      toggleMilestone: (week) => set((state) => {
        const isDone = !state.completedMilestones.includes(week);
        return {
          completedMilestones: isDone 
            ? [...state.completedMilestones, week] 
            : state.completedMilestones.filter((m) => m !== week)
        };
      }),
      
      setProfileSummary: (summary) => set({ profileSummary: summary }),
      setRecExplanation: (exp) => set({ recExplanation: exp }),
      setObjection: (obj) => set({ objection: obj }),
      setWeeklyReflection: (ref) => set({ weeklyReflection: ref }),
      setIsHandlingObjection: (val) => set({ isHandlingObjection: val }),
      
      setVisionState: (updates) => set((state) => ({ ...state, ...updates })),
      setVoiceState: (updates) => set((state) => ({ ...state, ...updates })),
    }),
    {
      name: 'climbit-storage',
      partialize: (state) => ({
        answers: state.answers,
        footprint: state.footprint,
        rankedActions: state.rankedActions,
        challenge: state.challenge,
        selectedActions: state.selectedActions,
        simulation: state.simulation,
        completedMilestones: state.completedMilestones,
        profileSummary: state.profileSummary,
        onboardingStep: state.onboardingStep,
      }),
    }
  )
);
