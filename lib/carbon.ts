import { OnboardingAnswers, FootprintResult, FootprintCategory, RecommendationResult, SimulatorResult, ChallengeResult } from '../types';
import { ACTIONS_CATALOG } from '../data/actions';

// Base emissions in kg CO2 per month
export const COMMUTE_EMISSIONS = {
  walk_cycle: 0,
  public_transit: 35,
  personal_vehicle: 180,
  cab: 260,
};

export const DIET_EMISSIONS = {
  vegan: 55,
  vegetarian: 85,
  flexitarian: 145,
  meat_heavy: 270,
};

export const ELECTRICITY_EMISSIONS = {
  low: 60,
  medium: 130,
  high: 260,
};

export const AC_EMISSIONS = {
  none: 0,
  low: 25,
  medium: 75,
  high: 160,
};

export const DELIVERY_EMISSIONS = {
  rarely: 5,
  weekly: 18,
  multiple_times_weekly: 45,
  daily: 90,
};

export const TRAVEL_EMISSIONS = {
  rarely: 12,
  occasionally: 85,
  frequently: 260,
};

export function calculateFootprint(answers: OnboardingAnswers): FootprintResult {
  const commuteVal = COMMUTE_EMISSIONS[answers.commuteMode];
  const dietVal = DIET_EMISSIONS[answers.dietPattern];
  const electricityVal = ELECTRICITY_EMISSIONS[answers.electricityUsageProxy];
  const acVal = AC_EMISSIONS[answers.acUsageProxy];
  const deliveryVal = DELIVERY_EMISSIONS[answers.deliveryFrequency];
  const travelVal = TRAVEL_EMISSIONS[answers.travelFrequency];

  const monthlyTotal = commuteVal + dietVal + electricityVal + acVal + deliveryVal + travelVal;
  const annualTotal = monthlyTotal * 12;

  const categories: FootprintCategory[] = [
    {
      name: 'commute',
      label: 'Commute',
      value: commuteVal,
      percentage: Math.round((commuteVal / (monthlyTotal || 1)) * 100),
      description: getCommuteDesc(answers.commuteMode),
      estimationNote: 'Based on average fuel efficiency and transit occupancy metrics.',
    },
    {
      name: 'diet',
      label: 'Diet',
      value: dietVal,
      percentage: Math.round((dietVal / (monthlyTotal || 1)) * 100),
      description: getDietDesc(answers.dietPattern),
      estimationNote: 'Calculated using global lifecycle agricultural impact databases.',
    },
    {
      name: 'electricity',
      label: 'Home Electricity',
      value: electricityVal,
      percentage: Math.round((electricityVal / (monthlyTotal || 1)) * 100),
      description: getElectricityDesc(answers.electricityUsageProxy),
      estimationNote: 'Computed from local grid emission intensity standards.',
    },
    {
      name: 'ac',
      label: 'Air Conditioning',
      value: acVal,
      percentage: Math.round((acVal / (monthlyTotal || 1)) * 100),
      description: getACDesc(answers.acUsageProxy),
      estimationNote: 'Based on average energy consumption of standard 1.5-ton AC units.',
    },
    {
      name: 'delivery',
      label: 'Deliveries',
      value: deliveryVal,
      percentage: Math.round((deliveryVal / (monthlyTotal || 1)) * 100),
      description: getDeliveryDesc(answers.deliveryFrequency),
      estimationNote: 'Includes packaging manufacturing and short-mile courier logistics.',
    },
    {
      name: 'travel',
      label: 'Travel & Flights',
      value: travelVal,
      percentage: Math.round((travelVal / (monthlyTotal || 1)) * 100),
      description: getTravelDesc(answers.travelFrequency),
      estimationNote: 'Determined using standard aviation fuel burn factors per passenger km.',
    },
  ];

  // Find the category with maximum emissions
  let biggestDriver: FootprintCategory['name'] = 'commute';
  let maxVal = -1;
  categories.forEach((cat) => {
    if (cat.value > maxVal) {
      maxVal = cat.value;
      biggestDriver = cat.name;
    }
  });

  // Local fallback persona definitions
  const fallbacks = getFallbackPersona(answers, biggestDriver);

  return {
    monthlyTotal: Math.round(monthlyTotal),
    annualTotal: Math.round(annualTotal),
    categories,
    biggestDriver,
    personaTitle: fallbacks.personaTitle,
    personaSummary: fallbacks.personaSummary,
    coachTip: fallbacks.coachTip,
  };
}

export function rankActions(
  answers: OnboardingAnswers,
  footprint: FootprintResult
): RecommendationResult[] {
  // Find highest footprint driver and second highest
  const sortedCategories = [...footprint.categories].sort((a, b) => b.value - a.value);
  const primaryDriver = sortedCategories[0]?.name;
  const secondaryDriver = sortedCategories[1]?.name;

  // Max carbon savings in catalog is 160
  const maxSavings = 160;

  const ranked = ACTIONS_CATALOG.map((action) => {
    // 1. Carbon Savings Score (0-10)
    const carbonScore = (action.baseCarbonSavings / maxSavings) * 10;

    // 2. Effort Score (0-10) - We prefer low effort
    let effortScore = 3;
    if (action.effort === 'low') effortScore = 10;
    else if (action.effort === 'medium') effortScore = 6;

    // 3. Cost Score (0-10) - We prefer low cost to implement
    let costScore = 3;
    if (action.cost === 'low') costScore = 10;
    else if (action.cost === 'medium') costScore = 6;

    // 4. Lifestyle & Category Relevance Score (0-10)
    let relevanceScore = 4;
    let relevanceReason = 'This is a solid carbon reduction habit.';

    if (action.category === primaryDriver) {
      relevanceScore = 10;
      relevanceReason = `Directly targets your largest footprint category: ${primaryDriver}.`;
    } else if (action.category === secondaryDriver) {
      relevanceScore = 8;
      relevanceReason = `Addresses your second highest footprint category: ${secondaryDriver}.`;
    } else {
      const hasLifestyleTag = action.lifestyleTags.some(
        (tag) => tag === answers.role || tag === answers.livingStyle
      );
      if (hasLifestyleTag) {
        relevanceScore = 6;
        relevanceReason = `Highly relevant to your living style (${answers.livingStyle}) or role (${answers.role}).`;
      }
    }

    // ROI Formula: 45% Carbon Savings, 25% Effort, 20% Cost, 10% Relevance
    const rawRoi = (carbonScore * 0.45) + (effortScore * 0.25) + (costScore * 0.20) + (relevanceScore * 0.10);
    
    // Scale by action confidence and multiply by 10 to get a clean score out of 100
    const roiScore = Math.round(rawRoi * action.confidence * 10);

    return {
      ...action,
      roiScore,
      relevanceReason,
    };
  });

  // Sort by ROI score descending
  return ranked.sort((a, b) => b.roiScore - a.roiScore);
}

export function simulateHabits(
  footprint: FootprintResult,
  activeActionIds: string[]
): SimulatorResult {
  let monthlyReduction = 0;
  let moneySaved = 0;

  activeActionIds.forEach((id) => {
    const action = ACTIONS_CATALOG.find((a) => a.id === id);
    if (action) {
      // Find corresponding category emission to caps
      const cat = footprint.categories.find((c) => c.name === action.category);
      if (cat) {
        // Savings cannot exceed the actual category emission value
        const actualSavings = Math.min(action.baseCarbonSavings, cat.value);
        monthlyReduction += actualSavings;
      } else {
        monthlyReduction += action.baseCarbonSavings;
      }
      moneySaved += action.baseMoneySavings;
    }
  });

  const originalFootprint = footprint.monthlyTotal;
  const newFootprint = Math.max(0, originalFootprint - monthlyReduction);

  return {
    originalFootprint,
    newFootprint: Math.round(newFootprint),
    monthlyReduction: Math.round(monthlyReduction),
    annualReduction: Math.round(monthlyReduction * 12),
    moneySaved: Math.round(moneySaved),
  };
}

export function generateChallenge(answers: OnboardingAnswers, topActions: RecommendationResult[]): ChallengeResult {
  // Grab top 4 unique actions to make a 4-week challenge
  const selectedActions = topActions.slice(0, 4);
  
  // Ensure we have at least 4 items
  while (selectedActions.length < 4 && ACTIONS_CATALOG.length > selectedActions.length) {
    const fallback = ACTIONS_CATALOG.find(a => !selectedActions.some(s => s.id === a.id));
    if (fallback) {
      selectedActions.push({
        ...fallback,
        roiScore: 50,
        relevanceReason: 'Fallback milestone action.'
      });
    } else {
      break;
    }
  }

  const milestones = selectedActions.map((action, idx) => ({
    week: idx + 1,
    title: `Week ${idx + 1}: ${action.title}`,
    description: `Commit to doing: "${action.description}". Saves approx ${action.baseCarbonSavings} kg CO2 this month!`,
    completed: false,
  }));

  return {
    title: 'Your Personalised 30-Day Climbit Sprint',
    description: 'A structured roadmap designed to lower your carbon footprint with minimal disruption to your daily life.',
    milestones,
    badge: 'Eco-Runner',
  };
}

// Helpers for explanations
function getCommuteDesc(val: OnboardingAnswers['commuteMode']): string {
  switch (val) {
    case 'walk_cycle':
      return 'Zero-tailpipe transit. You have a very low transport footprint.';
    case 'public_transit':
      return 'Shared public transit. Highly efficient compared to private driving.';
    case 'personal_vehicle':
      return 'Daily personal driving. High fuel burn leads to substantial carbon emissions.';
    case 'cab':
      return 'Regular ride-hailing. Higher emissions due to single occupancy and driver transit times.';
  }
}

function getDietDesc(val: OnboardingAnswers['dietPattern']): string {
  switch (val) {
    case 'vegan':
      return 'Plant-based diet. Low agricultural emissions and low land-use impact.';
    case 'vegetarian':
      return 'Meat-free diet. Moderate emissions from dairy farming and processing.';
    case 'flexitarian':
      return 'Occasional meat consumption. Slightly elevated emissions due to red meat poultry products.';
    case 'meat_heavy':
      return 'Daily meat consumption. Highest agricultural impact due to intensive livestock rearing.';
  }
}

function getElectricityDesc(val: OnboardingAnswers['electricityUsageProxy']): string {
  switch (val) {
    case 'low':
      return 'Energy-conscious household. You likely use LED lights and turn off standby devices.';
    case 'medium':
      return 'Typical electricity profile. Standard appliance usage and power consumption.';
    case 'high':
      return 'High-consuming household. Likely multiple large devices, active geysers, or larger layouts.';
  }
}

function getACDesc(val: OnboardingAnswers['acUsageProxy']): string {
  switch (val) {
    case 'none':
      return 'No AC usage. You rely entirely on ceiling fans or natural ventilation.';
    case 'low':
      return 'Restrained AC use (1–2 hours daily). Minimal seasonal cooling load.';
    case 'medium':
      return 'Moderate AC use (3–6 hours daily). Regular cooling requirements.';
    case 'high':
      return 'Continuous AC use (6+ hours daily). Significant cooling-grid demand.';
  }
}

function getDeliveryDesc(val: OnboardingAnswers['deliveryFrequency']): string {
  switch (val) {
    case 'rarely':
      return 'Home cooking or dining in. Almost no delivery logistics footprint.';
    case 'weekly':
      return 'Occasional ordering. Minor carbon contribution from delivery vehicles.';
    case 'multiple_times_weekly':
      return 'Regular deliveries. Couriers and food packaging footprint are starting to stack up.';
    case 'daily':
      return 'High-frequency ordering. Packaging waste and delivery transit drive up logistics emissions.';
  }
}

function getTravelDesc(val: OnboardingAnswers['travelFrequency']): string {
  switch (val) {
    case 'rarely':
      return 'Trains or local transit. Extremely low aviation emissions.';
    case 'occasionally':
      return '1–3 flights annually. Air travel represents a visible chunk of your footprint.';
    case 'frequently':
      return 'Frequent flying. High altitude emissions dominate your profile.';
  }
}

// Fallback Persona Generator
function getFallbackPersona(answers: OnboardingAnswers, biggestDriver: string) {
  let personaTitle = 'Balanced Trailblazer';
  let personaSummary = 'You maintain a balanced carbon footprint with moderate emissions across categories. Small tweaks will have a large cumulative effect.';
  let coachTip = 'Focus on the easiest transition first. Swapping just one commute or diet habit will compound quickly.';

  if (answers.travelFrequency === 'frequently') {
    personaTitle = 'The Jet-Set Explorer';
    personaSummary = 'Frequent flights make aviation the dominant component of your carbon footprint. Even if you walk to work, high-altitude emissions compound very quickly.';
    coachTip = 'Try replacing one domestic flight per year with a high-speed train, or bundle travel plans to avoid unnecessary flights.';
  } else if (biggestDriver === 'commute' && (answers.commuteMode === 'cab' || answers.commuteMode === 'personal_vehicle')) {
    personaTitle = 'The Road Warrior';
    personaSummary = 'Your primary carbon driver is daily private transit. High fuel usage during rush hour creates significant vehicle tailpipe emissions.';
    coachTip = 'Consider swapping 2 cab trips per week with the metro or public transit to immediately shave off 30% of your travel emissions.';
  } else if (biggestDriver === 'diet' && answers.dietPattern === 'meat_heavy') {
    personaTitle = 'The Carnivore Connoisseur';
    personaSummary = 'Daily meat consumption, particularly beef and lamb, drives high methane and agricultural land-use carbon scores in your profile.';
    coachTip = 'Try adopting one plant-based day per week. It is a delicious way to save money and cut diet emissions by 15%.';
  } else if (biggestDriver === 'ac' && answers.acUsageProxy === 'high') {
    personaTitle = 'The Cool-Comfort Seeker';
    personaSummary = 'Running your air conditioner for over 6 hours a day uses substantial grid power, making cooling your primary footprint contributor.';
    coachTip = 'Set a timer on your AC to turn it off at 4 AM when it is cooler outside, or run it at 24°C rather than 18°C.';
  } else if (answers.deliveryFrequency === 'daily' || answers.deliveryFrequency === 'multiple_times_weekly') {
    personaTitle = 'The Convenience Curator';
    personaSummary = 'Frequent ordering of food and packages leads to high logistical and cardboard footprint packaging emissions.';
    coachTip = 'Bundle your online package orders to standard delivery, and prep lunch on Sundays to bypass weekly courier runs.';
  } else if (answers.commuteMode === 'walk_cycle' && answers.dietPattern === 'vegan' && answers.acUsageProxy === 'none') {
    personaTitle = 'The Green Guardian';
    personaSummary = 'Your choices lead to an exceptionally low footprint. You are already living a highly sustainable, low-carbon lifestyle!';
    coachTip = 'Share your methods! Help others by advocating for public transit or plant-based meals in your workplace or school.';
  }

  return { personaTitle, personaSummary, coachTip };
}
