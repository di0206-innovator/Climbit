export interface OnboardingAnswers {
  role: 'student' | 'professional' | 'other';
  livingStyle: 'hostel' | 'family_home' | 'independent';
  commuteMode: 'walk_cycle' | 'public_transit' | 'personal_vehicle' | 'cab';
  dietPattern: 'vegan' | 'vegetarian' | 'flexitarian' | 'meat_heavy';
  deliveryFrequency: 'rarely' | 'weekly' | 'multiple_times_weekly' | 'daily';
  travelFrequency: 'rarely' | 'occasionally' | 'frequently';
  acUsageProxy: 'none' | 'low' | 'medium' | 'high';
  electricityUsageProxy: 'low' | 'medium' | 'high';
}

export interface FootprintCategory {
  name: 'commute' | 'diet' | 'electricity' | 'ac' | 'delivery' | 'travel';
  label: string; // e.g. "Commute", "Diet"
  value: number; // in kg CO2 per month
  percentage: number; // percentage of total
  description: string;
  estimationNote: string;
}

export interface FootprintResult {
  monthlyTotal: number; // kg CO2
  annualTotal: number; // kg CO2
  categories: FootprintCategory[];
  biggestDriver: 'commute' | 'diet' | 'electricity' | 'ac' | 'delivery' | 'travel';
  personaTitle: string;
  personaSummary: string;
  coachTip: string;
  coachTips: string[];
  carbonGrade: string;
  carbonGradeLabel: string;
  carbonGradeColor: string;
  equivalences: Array<{
    icon: string;
    value: number;
    label: string;
    unit: string;
    color: string;
  }>;
  categoryGrades: Array<{
    name: 'commute' | 'diet' | 'electricity' | 'ac' | 'delivery' | 'travel';
    label: string;
    grade: string;
    color: string;
    description: string;
    value: number;
  }>;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: 'commute' | 'diet' | 'electricity' | 'ac' | 'delivery' | 'travel';
  baseCarbonSavings: number; // kg CO2 / month
  baseMoneySavings: number; // $ / month
  effort: 'low' | 'medium' | 'high';
  cost: 'low' | 'medium' | 'high';
  confidence: number; // 0.0 - 1.0
  whyItMatters: string;
  lifestyleTags: string[];
}

export interface RecommendationResult extends ActionItem {
  roiScore: number;
  relevanceReason: string;
}

export interface SimulatorResult {
  originalFootprint: number;
  newFootprint: number;
  monthlyReduction: number;
  annualReduction: number;
  moneySaved: number;
}

export interface ChallengeMilestone {
  week: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface ChallengeResult {
  title: string;
  description: string;
  milestones: ChallengeMilestone[];
  badge: string;
}

export interface FootprintHistoryEntry {
  id: string;
  date: string; // "YYYY-MM"
  monthlyTotal: number;
  answers: OnboardingAnswers;
}

