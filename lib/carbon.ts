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
  const fallbacks = getFallbackPersona(answers);

  // Calculate overall carbon grade
  let carbonGrade = 'B';
  let carbonGradeLabel = 'Eco-Conscious';
  let carbonGradeColor = '#FFD53D'; // yellow

  if (monthlyTotal <= 100) {
    carbonGrade = 'A+';
    carbonGradeLabel = 'Eco-Champion';
    carbonGradeColor = '#00CC66'; // green
  } else if (monthlyTotal <= 200) {
    carbonGrade = 'A';
    carbonGradeLabel = 'Low Footprint';
    carbonGradeColor = '#00CC66'; // green
  } else if (monthlyTotal <= 350) {
    carbonGrade = 'B';
    carbonGradeLabel = 'Eco-Conscious';
    carbonGradeColor = '#FFD53D'; // yellow
  } else if (monthlyTotal <= 500) {
    carbonGrade = 'C';
    carbonGradeLabel = 'Average Consumer';
    carbonGradeColor = '#FFD53D'; // yellow
  } else if (monthlyTotal <= 750) {
    carbonGrade = 'D';
    carbonGradeLabel = 'High Footprint';
    carbonGradeColor = '#FF7E40'; // orange
  } else {
    carbonGrade = 'F';
    carbonGradeLabel = 'Carbon Intensive';
    carbonGradeColor = '#FF5A60'; // red
  }

  // Calculate individual category grades
  const categoryGrades = categories.map(cat => {
    let grade = 'B';
    let color = '#FFD53D';
    let description = '';

    if (cat.name === 'commute') {
      if (answers.commuteMode === 'walk_cycle') {
        grade = 'A+'; color = '#00CC66'; description = 'Zero tailpipe emissions from walking or cycling.';
      } else if (answers.commuteMode === 'public_transit') {
        grade = 'A'; color = '#00CC66'; description = 'Low emissions through shared transit efficiency.';
      } else if (answers.commuteMode === 'personal_vehicle') {
        grade = 'D'; color = '#FF7E40'; description = 'High fossil fuel burn from single occupant driving.';
      } else {
        grade = 'F'; color = '#FF5A60'; description = 'Very high emissions from ride-hailing services.';
      }
    } else if (cat.name === 'diet') {
      if (answers.dietPattern === 'vegan') {
        grade = 'A+'; color = '#00CC66'; description = 'Low-carbon plant diet with minimal land impact.';
      } else if (answers.dietPattern === 'vegetarian') {
        grade = 'A'; color = '#00CC66'; description = 'Meat-free diet keeps agricultural footprint low.';
      } else if (answers.dietPattern === 'flexitarian') {
        grade = 'B'; color = '#FFD53D'; description = 'Moderate footprint from occasional meat intake.';
      } else {
        grade = 'D-'; color = '#FF7E40'; description = 'High agricultural emissions from daily meat consumption.';
      }
    } else if (cat.name === 'electricity') {
      if (answers.electricityUsageProxy === 'low') {
        grade = 'A'; color = '#00CC66'; description = 'Low power consumption from energy-conscious choices.';
      } else if (answers.electricityUsageProxy === 'medium') {
        grade = 'C'; color = '#FFD53D'; description = 'Standard consumer electricity usage.';
      } else {
        grade = 'F'; color = '#FF5A60'; description = 'Heavy appliance load burns high grid energy.';
      }
    } else if (cat.name === 'ac') {
      if (answers.acUsageProxy === 'none') {
        grade = 'A+'; color = '#00CC66'; description = 'Zero AC emissions. Relying on natural ventilation.';
      } else if (answers.acUsageProxy === 'low') {
        grade = 'A'; color = '#00CC66'; description = 'Low AC usage, restricted to short cooling periods.';
      } else if (answers.acUsageProxy === 'medium') {
        grade = 'C'; color = '#FFD53D'; description = 'AC cooling usage draws moderate grid power.';
      } else {
        grade = 'F'; color = '#FF5A60'; description = 'Heavy cooling demand from near-continuous AC use.';
      }
    } else if (cat.name === 'delivery') {
      if (answers.deliveryFrequency === 'rarely') {
        grade = 'A+'; color = '#00CC66'; description = 'Minimal delivery logistics and packaging waste.';
      } else if (answers.deliveryFrequency === 'weekly') {
        grade = 'B'; color = '#FFD53D'; description = 'Minor emissions from weekly shopping packages.';
      } else if (answers.deliveryFrequency === 'multiple_times_weekly') {
        grade = 'D'; color = '#FF7E40'; description = 'Frequent courier trips and waste are stacking up.';
      } else {
        grade = 'F'; color = '#FF5A60'; description = 'Heavy delivery vehicle and sorting center footprint.';
      }
    } else if (cat.name === 'travel') {
      if (answers.travelFrequency === 'rarely') {
        grade = 'A+'; color = '#00CC66'; description = 'Very low travel footprint, choosing train or local travel.';
      } else if (answers.travelFrequency === 'occasionally') {
        grade = 'C'; color = '#FFD53D'; description = '1-3 flights annually create a visible carbon chunk.';
      } else {
        grade = 'F'; color = '#FF5A60'; description = 'Frequent flying dominates your overall carbon profile.';
      }
    }

    return {
      name: cat.name,
      label: cat.label,
      grade,
      color,
      description,
      value: cat.value
    };
  });

  // Calculate Equivalences
  const equivalences = [
    {
      icon: '🌲',
      value: Math.round(monthlyTotal / 1.83),
      label: 'Tree absorption',
      unit: 'trees / mo',
      color: '#E8F8F0' // soft green
    },
    {
      icon: '📱',
      value: Math.round(monthlyTotal / 0.006),
      label: 'Phone charges',
      unit: 'charges',
      color: '#FFFDF5' // soft yellow
    },
    {
      icon: '🚗',
      value: Math.round(monthlyTotal / 0.17),
      label: 'Petrol car driving',
      unit: 'km equivalent',
      color: '#FFF0F5' // soft pink/red
    }
  ];

  return {
    monthlyTotal: Math.round(monthlyTotal),
    annualTotal: Math.round(annualTotal),
    categories,
    biggestDriver,
    personaTitle: fallbacks.personaTitle,
    personaSummary: fallbacks.personaSummary,
    coachTip: fallbacks.coachTip,
    coachTips: fallbacks.coachTips,
    carbonGrade,
    carbonGradeLabel,
    carbonGradeColor,
    categoryGrades,
    equivalences
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
function getFallbackPersona(answers: OnboardingAnswers) {
  let personaTitle = 'Balanced Trailblazer';
  let personaSummary = 'You maintain a balanced carbon footprint with moderate emissions across categories. Small tweaks will have a large cumulative effect.';
  let coachTips = [
    'Select one high-impact habit (like switching 2 meals to plant-based) to start your sprint.',
    'Unplug vampire appliances (chargers, consoles) when they are not actively in use.',
    'Consider walking or biking for all local trips under 2 kilometers.'
  ];

  // 1. Eco-Guardian Combo
  if (
    answers.commuteMode === 'walk_cycle' &&
    (answers.dietPattern === 'vegan' || answers.dietPattern === 'vegetarian') &&
    answers.travelFrequency === 'rarely' &&
    answers.acUsageProxy === 'none'
  ) {
    personaTitle = 'The Green Guardian';
    personaSummary = 'Your daily choices lead to an exceptionally low carbon footprint. You represent the gold standard of sustainable living.';
    coachTips = [
      'Advocate for organic composting and local solar cooperatives in your neighborhood.',
      'Share your low-impact recipes and transit methods to inspire peers and family.',
      'Participate in tree planting or native vegetation restoration programs nearby.'
    ];
  }
  // 2. Grounded Flyer Combo
  else if (
    answers.travelFrequency === 'frequently' &&
    (answers.commuteMode === 'walk_cycle' || answers.commuteMode === 'public_transit') &&
    answers.dietPattern !== 'meat_heavy'
  ) {
    personaTitle = 'The Grounded Flyer';
    personaSummary = 'While you maintain highly eco-conscious daily routines on the ground, high-frequency aviation dominates your footprint.';
    coachTips = [
      'Swap short-haul regional flights with high-speed passenger rail alternatives.',
      'Group business meetings or travel itineraries to reduce the total number of round trips.',
      'Support verified carbon removal or direct-air-capture programs for unavoidable flights.'
    ];
  }
  // 3. The Jet-Set Explorer Combo (Frequent travel + vehicle/cab commute)
  else if (
    answers.travelFrequency === 'frequently' &&
    (answers.commuteMode === 'cab' || answers.commuteMode === 'personal_vehicle')
  ) {
    personaTitle = 'The Jet-Set Explorer';
    personaSummary = 'Frequent flights make aviation the dominant component of your carbon footprint. Even if you walk to work, high-altitude emissions compound very quickly.';
    coachTips = [
      'Try replacing one domestic flight per year with a high-speed train, or bundle travel plans to avoid unnecessary flights.',
      'Transition to a hybrid/electric vehicle or utilize public transit for daily commutes.',
      'Install a programmable thermostat to optimize AC temperature when you are away.'
    ];
  }
  // 4. Power-Hungry Telecommuter Combo
  else if (
    (answers.role === 'professional' || answers.role === 'other') &&
    answers.commuteMode === 'walk_cycle' &&
    (answers.electricityUsageProxy === 'high' || answers.acUsageProxy === 'high')
  ) {
    personaTitle = 'The Power-Hungry Telecommuter';
    personaSummary = 'By working or staying at home, you save transportation emissions, but heavy appliance loads and cooling drive up home grid demand.';
    coachTips = [
      'Use smart power strips to completely cut standby power from home office gear.',
      'Set your air conditioner to 24°C instead of 18°C and use ceiling fans to circulate air.',
      'Inquire about energy audits to check wall insulation and draft seals around doors.'
    ];
  }
  // 5. Cafeteria Carnivore Combo
  else if (
    answers.role === 'student' &&
    answers.dietPattern === 'meat_heavy' &&
    (answers.livingStyle === 'hostel' || answers.livingStyle === 'independent')
  ) {
    personaTitle = 'The Cafeteria Carnivore';
    personaSummary = 'As a student living in shared quarters, your lifestyle is naturally low-consumption, but daily meat-heavy meals drive up your footprint.';
    coachTips = [
      'Advocate for and participate in "Meatless Mondays" in campus dining halls.',
      'Incorporate plant-based proteins like lentils, chickpeas, and tofu into your self-cooked meals.',
      'Reduce food waste by plating only what you know you will finish at the cafeteria.'
    ];
  }
  // 6. Convenience Enthusiast Combo
  else if (
    (answers.deliveryFrequency === 'daily' || answers.deliveryFrequency === 'multiple_times_weekly') &&
    (answers.commuteMode === 'cab' || answers.commuteMode === 'personal_vehicle')
  ) {
    personaTitle = 'The Convenience Enthusiast';
    personaSummary = 'Frequent online shopping package deliveries, food orders, and ride-hailing services create substantial logistics emissions.';
    coachTips = [
      'Consolidate e-commerce orders to single ship dates to decrease packaging and delivery runs.',
      'Walk or cycle to pick up local takeout orders directly instead of using delivery apps.',
      'Choose group ride-share options or public transit for non-urgent commutes.'
    ];
  }
  // 7. Suburban Cruiser Combo
  else if (
    answers.livingStyle === 'family_home' &&
    answers.commuteMode === 'personal_vehicle' &&
    answers.dietPattern === 'meat_heavy'
  ) {
    personaTitle = 'The Suburban Cruiser';
    personaSummary = 'Daily private vehicle commutes combined with standard household operations make transport and food your chief footprint drivers.';
    coachTips = [
      'Carpool with colleagues or neighbors to split the carbon load of daily driving.',
      'Swap private driving for public transit or commuter rails on at least two weekdays.',
      'Ensure car tires are fully inflated to improve fuel economy by up to 3%.'
    ];
  }
  // 8. High-Energy Resident Combo
  else if (
    answers.livingStyle === 'independent' &&
    answers.electricityUsageProxy === 'high' &&
    answers.acUsageProxy === 'high'
  ) {
    personaTitle = 'The High-Energy Resident';
    personaSummary = 'Your footprint is heavily driven by home utility usage. Multiple high-load appliances and intensive cooling consume high grid energy.';
    coachTips = [
      'Wash laundry loads in cold water and air-dry them instead of using a heated dryer.',
      'Upgrade to energy-star rated appliances and LED lighting throughout your home.',
      'Switch off and unplug geysers and space heaters when they are not in use.'
    ];
  }
  // 9. Mindful Scholar Combo
  else if (
    answers.role === 'student' &&
    (answers.dietPattern === 'vegan' || answers.dietPattern === 'vegetarian') &&
    (answers.commuteMode === 'walk_cycle' || answers.commuteMode === 'public_transit')
  ) {
    personaTitle = 'The Mindful Scholar';
    personaSummary = 'Your eco-conscious choices combined with low student living consumption give you an exceptionally low emission score.';
    coachTips = [
      'Help organize climate advocacy or recycling programs in your school or dorm.',
      'Buy secondhand textbooks, clothes, and furniture to reduce manufacturing footprint.',
      'Continue walking or taking transit to keep your daily travel footprint near zero.'
    ];
  }
  // 10. Climate-Control Curator Combo
  else if (
    answers.acUsageProxy === 'high' &&
    answers.electricityUsageProxy === 'high'
  ) {
    personaTitle = 'The Climate-Control Curator';
    personaSummary = 'Running your air conditioner for over 6 hours a day uses substantial grid power, making cooling your primary footprint contributor.';
    coachTips = [
      'Set a timer on your AC to turn it off at 4 AM when it is cooler outside.',
      'Keep windows shaded during peak sunshine hours to reduce passive heat buildup.',
      'Clean or replace your AC unit filters monthly to maintain peak energy efficiency.'
    ];
  }
  // 11. Delivery Curator Combo
  else if (
    answers.deliveryFrequency === 'daily' ||
    answers.deliveryFrequency === 'multiple_times_weekly'
  ) {
    personaTitle = 'The Convenience Curator';
    personaSummary = 'Frequent ordering of food and packages leads to high logistical and cardboard packaging waste emissions.';
    coachTips = [
      'Bundle your online package orders to standard delivery, avoiding express air shipping.',
      'Prepare lunch on Sundays to bypass weekly courier runs for office meals.',
      'Recycle all cardboard delivery boxes and request minimal packaging options at checkout.'
    ];
  }

  return {
    personaTitle,
    personaSummary,
    coachTip: coachTips[0],
    coachTips
  };
}
