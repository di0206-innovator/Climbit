'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { 
  GraduationCap, Briefcase, User, Home, Building2, School, 
  Bike, Bus, Car, Carrot, Egg, Soup, Drumstick,
  Package, ShoppingBag, Truck, Zap, Train, Plane, Map,
  Wind, Snowflake, Sparkles, ArrowLeft
} from 'lucide-react';
import Button from '../../components/ui/button';
import Progress from '../../components/ui/progress';
import { OnboardingAnswers, FootprintHistoryEntry } from '../../types';
import { onboardingSchema } from '../../lib/validation/schemas';
import { calculateFootprint, rankActions, generateChallenge } from '../../lib/carbon';
import { saveUserProfile } from '../../lib/supabase';
import { useClimbitStore } from '../../lib/store';
import { generateMockHistory } from '../../lib/history';

interface QuestionOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface Question {
  key: keyof OnboardingAnswers;
  question: string;
  description: string;
  options: QuestionOption[];
}

const QUESTIONS: Question[] = [
  {
    key: 'role',
    question: 'What is your primary daily occupation?',
    description: 'This helps us understand your weekday commute routines and typical schedule.',
    options: [
      { value: 'student', label: 'Student', icon: GraduationCap, description: 'University, high school, or vocational studies.' },
      { value: 'professional', label: 'Working Professional', icon: Briefcase, description: 'Office, hybrid, or remote corporate roles.' },
      { value: 'other', label: 'Other', icon: User, description: 'Freelancer, homemaker, retired, or custom schedule.' }
    ]
  },
  {
    key: 'livingStyle',
    question: 'What is your current living arrangement?',
    description: 'Household size and structure significantly affect heating, cooling, and shared energy.',
    options: [
      { value: 'hostel', label: 'Hostel / Dormitory', icon: School, description: 'Shared student housing or boarding room.' },
      { value: 'family_home', label: 'Family Home', icon: Home, description: 'Living with parents, children, or extended family.' },
      { value: 'independent', label: 'Independent Living', icon: Building2, description: 'Living alone, with a partner, or housemates.' }
    ]
  },
  {
    key: 'commuteMode',
    question: 'How do you primarily commute to work or classes?',
    description: 'Daily transportation is typically one of the highest individual emission sources.',
    options: [
      { value: 'walk_cycle', label: 'Walk or Cycle', icon: Bike, description: 'Zero-emission muscle power. Best for local trips.' },
      { value: 'public_transit', label: 'Public Transit', icon: Bus, description: 'Metro trains, commuter rails, or local buses.' },
      { value: 'personal_vehicle', label: 'Personal Vehicle', icon: Car, description: 'Single passenger driving, motorbike, or hybrid cars.' },
      { value: 'cab', label: 'Cab or Ride-Hailing', icon: Truck, description: 'Taxis, Uber, Lyft, or similar personal ride services.' }
    ]
  },
  {
    key: 'dietPattern',
    question: 'Which option best describes your daily diet?',
    description: 'Food production (especially livestock) has a heavy carbon and land-use footprint.',
    options: [
      { value: 'vegan', label: 'Plant-Based / Vegan', icon: Carrot, description: 'Zero animal product consumption.' },
      { value: 'vegetarian', label: 'Vegetarian', icon: Egg, description: 'No meat, but includes dairy, honey, and eggs.' },
      { value: 'flexitarian', label: 'Flexitarian / Low-Meat', icon: Soup, description: 'Mostly plant-based, eating meat occasionally.' },
      { value: 'meat_heavy', label: 'Meat-Heavy', icon: Drumstick, description: 'Frequent meat consumption, including beef and pork.' }
    ]
  },
  {
    key: 'deliveryFrequency',
    question: 'How often do you order food or package deliveries?',
    description: 'Logistical sorting, single-use containers, and courier trips compound quickly.',
    options: [
      { value: 'rarely', label: 'Rarely / Never', icon: Package, description: 'Cooking at home, dining out, or picking up in person.' },
      { value: 'weekly', label: 'Weekly', icon: ShoppingBag, description: '1–2 delivery boxes or restaurant orders per week.' },
      { value: 'multiple_times_weekly', label: 'Few times a week', icon: Truck, description: '3–4 deliveries weekly. Regular ordering habit.' },
      { value: 'daily', label: 'Daily', icon: Zap, description: 'Daily food delivery or frequent e-commerce packages.' }
    ]
  },
  {
    key: 'travelFrequency',
    question: 'How often do you travel by flight or long-distance transit?',
    description: 'Aviation and long-distance travel burn significant fossil fuels.',
    options: [
      { value: 'rarely', label: 'Rarely', icon: Train, description: 'Mainly local travel, high-speed rail, or zero flights.' },
      { value: 'occasionally', label: 'Occasionally', icon: Map, description: '1–3 domestic or international flights per year.' },
      { value: 'frequently', label: 'Frequently', icon: Plane, description: 'Monthly flights for business or leisure.' }
    ]
  },
  {
    key: 'acUsageProxy',
    question: 'How much do you run your Air Conditioner?',
    description: 'Cooling units draw heavy grid electricity loads during hot seasons.',
    options: [
      { value: 'none', label: 'None / Fan only', icon: Wind, description: 'Rely on natural ventilation or simple ceiling fans.' },
      { value: 'low', label: 'Low (1–2 hrs/day)', icon: Wind, description: 'Short cooling bursts, mainly before bedtime.' },
      { value: 'medium', label: 'Medium (3–6 hrs/day)', icon: Snowflake, description: 'Consistent cooling during warm hours of the day.' },
      { value: 'high', label: 'High (6+ hrs/day)', icon: Snowflake, description: 'Nearly constant cooling active in your living area.' }
    ]
  },
  {
    key: 'electricityUsageProxy',
    question: 'What is your home electricity profile?',
    description: 'Reflects your general household appliance load and electricity spending.',
    options: [
      { value: 'low', label: 'Low / Energy-Conscious', icon: Zap, description: 'Unplugging idle gear, using energy-saver LEDs.' },
      { value: 'medium', label: 'Medium / Standard', icon: Zap, description: 'Standard consumer profile with typical active appliances.' },
      { value: 'high', label: 'High / Heavy Load', icon: Zap, description: 'Large home, high-load geysers, multiple TVs or servers.' }
    ]
  }
];

export default function Onboarding() {
  const router = useRouter();
  const { userId, getToken } = useAuth();
  const setOnboardingStep = useClimbitStore((state) => state.setOnboardingStep);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const optionsRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Sync step count with global header
  useEffect(() => {
    setOnboardingStep(currentStep);
  }, [currentStep, setOnboardingStep]);

  // Loading screen steps simulator
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    'Parsing lifestyle responses...',
    'Correlating regional agricultural lifecycle factors...',
    'Evaluating transport grid carbon intensity...',
    'Formulating personalized 30-day carbon roadmap...'
  ];

  const question = QUESTIONS[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / QUESTIONS.length) * 100);

  // Focus on the first option when step changes to support keyboard navigation
  useEffect(() => {
    if (optionsRefs.current[0]) {
      optionsRefs.current[0].focus();
    }
  }, [currentStep]);

  const handleSelect = (value: string) => {
    const updatedAnswers = { ...answers, [question.key]: value };
    setAnswers(updatedAnswers);

    // Auto-advance with a slight delay for better touch/click feedback
    setTimeout(() => {
      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleSubmit(updatedAnswers as OnboardingAnswers);
      }
    }, 150);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number, value: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(value);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (idx + 1) % question.options.length;
      optionsRefs.current[nextIdx]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (idx - 1 + question.options.length) % question.options.length;
      optionsRefs.current[prevIdx]?.focus();
    } else if (e.key === 'Backspace' && currentStep > 0) {
      e.preventDefault();
      handleBack();
    }
  };

  const handleSubmit = async (finalAnswers: OnboardingAnswers) => {
    // Validate with Zod schema
    const validation = onboardingSchema.safeParse(finalAnswers);
    if (!validation.success) {
      alert('Some inputs were invalid. Please review your answers.');
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    try {
      // Always save answers locally for immediate UX
      localStorage.setItem('climbit_answers', JSON.stringify(finalAnswers));

      const calculatedFootprint = calculateFootprint(finalAnswers);
      const ranked = rankActions(finalAnswers, calculatedFootprint);
      const generatedChallenge = generateChallenge(finalAnswers, ranked);

      // Generate history
      let currentHistory = useClimbitStore.getState().history;
      if (!currentHistory || currentHistory.length === 0) {
        currentHistory = generateMockHistory(finalAnswers, calculatedFootprint.monthlyTotal);
      } else {
        const d = new Date();
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const newEntry: FootprintHistoryEntry = {
          id: `hist-${dateStr}-${Math.random().toString(36).substr(2, 9)}`,
          date: dateStr,
          monthlyTotal: calculatedFootprint.monthlyTotal,
          answers: finalAnswers
        };
        const filtered = currentHistory.filter((h) => h.date !== dateStr);
        currentHistory = [...filtered, newEntry].sort((a, b) => a.date.localeCompare(b.date));
      }

      // Save to global store
      useClimbitStore.getState().setHistory(currentHistory);

      // If authenticated, sync to Supabase
      if (userId) {
        let token: string | null = null;
        try {
          token = await getToken({ template: 'supabase' });
        } catch (e) {
          console.warn('Clerk JWT template "supabase" not configured. Skipping Supabase sync.', e);
        }
        if (token) {
          await saveUserProfile(token, userId, {
            answers_json: finalAnswers,
            footprint_json: calculatedFootprint,
            challenge_json: generatedChallenge,
            ranked_actions_json: ranked,
            selected_actions: ranked.length > 0 ? [ranked[0].id] : [],
            history_json: currentHistory
          });
        }
      }
      
      // Keep loading on screen briefly for animated checkpoints
      await new Promise((resolve) => setTimeout(resolve, 3800));
    } catch (err) {
      console.error('Error calculating AI insights during onboarding:', err);
    } finally {
      setLoading(false);
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex flex-col min-h-screen neo-grid text-slate-950 selection:bg-emerald-500/30">
      {/* Main Flow */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-6 text-center animate-fade-in bg-white border-3 border-black p-10 rounded-3xl shadow-[5px_5px_0px_0px_#000000] max-w-md w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.04)_1.5px,transparent_1.5px)] bg-[size:16px_16px] pointer-events-none" />
            <div className="relative flex items-center justify-center">
              <div className="h-16 w-16 rounded-full border-4 border-black border-t-[#00CC66] border-r-[#B288FF] animate-spin" />
              <Sparkles className="absolute h-6 w-6 text-[#FFD53D] animate-pulse" />
            </div>
            <div className="space-y-4 relative z-10">
              <h2 className="text-xl font-black text-slate-950">Climbit Engine Running</h2>
              <div className="space-y-2">
                {loadingMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center gap-2 text-xs font-bold transition-all duration-300 ${
                      i < loadingStep 
                        ? 'text-slate-400 line-through' 
                        : i === loadingStep 
                        ? 'text-[#00CC66] scale-102 font-black' 
                        : 'text-slate-400 opacity-60'
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full border border-black ${i <= loadingStep ? 'bg-[#00CC66]' : 'bg-slate-200'}`} />
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-8">
            {/* Progress bar */}
            <div className="space-y-3">
              <Progress value={progressPercent} className="h-4" barClassName="bg-[#00CC66]" />
              <div className="flex justify-between text-[10px] text-slate-800 font-extrabold tracking-wider uppercase">
                <span>Start</span>
                <span>{progressPercent}% Complete</span>
                <span>Results</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="space-y-6">
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight leading-snug mb-2">
                  {question.question}
                </h1>
                <p className="text-sm font-semibold text-slate-700 max-w-xl">
                  {question.description}
                </p>
              </div>

              {/* Grid of Options */}
              <div className="grid md:grid-cols-3 gap-5" role="radiogroup" aria-label={question.question}>
                {question.options.map((opt, idx) => {
                  const Icon = opt.icon;
                  const isSelected = answers[question.key] === opt.value;

                  return (
                    <button
                      key={opt.value}
                      ref={(el) => {
                        optionsRefs.current[idx] = el;
                      }}
                      role="radio"
                      aria-checked={isSelected}
                      id={`opt-${question.key}-${opt.value}`}
                      onClick={() => handleSelect(opt.value)}
                      onKeyDown={(e) => handleKeyDown(e, idx, opt.value)}
                      className={`flex flex-col text-left p-5 border-3 border-black select-none outline-none transition-all duration-100 ${
                        isSelected
                          ? 'bg-[#FFD53D] translate-x-[2px] translate-y-[2px] shadow-none'
                          : 'bg-white hover:bg-slate-50 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000000] shadow-[3px_3px_0px_0px_#000000]'
                      } rounded-2xl focus-visible:ring-3 focus-visible:ring-black`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center border-2 border-black transition-colors ${
                          isSelected
                            ? 'bg-white text-slate-950'
                            : 'bg-slate-50 text-slate-800'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-extrabold text-sm text-slate-950">
                          {opt.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-bold leading-relaxed">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="flex justify-between items-center pt-6 border-t-3 border-black mt-4">
              <Button
                variant="outline"
                size="md"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
                id="onboarding-prev-btn"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="text-xs text-slate-800 font-bold bg-white border-2 border-black px-3 py-1 rounded-xl shadow-[2px_2px_0px_0px_#000000]">
                Tip: Use <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-black font-bold text-[10px]">Tab</kbd> and <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-black font-bold text-[10px]">Arrows</kbd>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
