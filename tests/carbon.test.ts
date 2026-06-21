import { describe, it, expect } from 'vitest';
import { calculateFootprint, rankActions, simulateHabits, generateChallenge } from '../lib/carbon';
import { OnboardingAnswers } from '../types';

describe('Carbon footprint calculations', () => {
  const lowImpactUser: OnboardingAnswers = {
    role: 'student',
    livingStyle: 'hostel',
    commuteMode: 'walk_cycle',
    dietPattern: 'vegan',
    deliveryFrequency: 'rarely',
    travelFrequency: 'rarely',
    acUsageProxy: 'none',
    electricityUsageProxy: 'low',
  };

  const highImpactUser: OnboardingAnswers = {
    role: 'professional',
    livingStyle: 'independent',
    commuteMode: 'cab',
    dietPattern: 'meat_heavy',
    deliveryFrequency: 'daily',
    travelFrequency: 'frequently',
    acUsageProxy: 'high',
    electricityUsageProxy: 'high',
  };

  it('correctly calculates total footprint for a low-impact user', () => {
    const result = calculateFootprint(lowImpactUser);
    
    // Expected values: commute (0) + diet (55) + electricity (60) + ac (0) + delivery (5) + travel (12) = 132 kg CO2/month
    expect(result.monthlyTotal).toBe(132);
    expect(result.annualTotal).toBe(132 * 12);
    expect(result.biggestDriver).toBe('electricity'); // 60 is the max
    expect(result.personaTitle).toBe('The Green Guardian');
  });

  it('correctly calculates total footprint for a high-impact user', () => {
    const result = calculateFootprint(highImpactUser);
    
    // Expected values: commute (260) + diet (270) + electricity (260) + ac (160) + delivery (90) + travel (260) = 1300 kg CO2/month
    expect(result.monthlyTotal).toBe(1300);
    expect(result.annualTotal).toBe(1300 * 12);
    expect(result.biggestDriver).toBe('diet'); // 270 is the max
    expect(result.personaTitle).toBe('The Jet-Set Explorer'); // Travel frequent overrides
  });

  it('verifies category percentages sum up to approximately 100%', () => {
    const result = calculateFootprint(highImpactUser);
    const percentageSum = result.categories.reduce((acc, cat) => acc + cat.percentage, 0);
    expect(percentageSum).toBeGreaterThanOrEqual(98);
    expect(percentageSum).toBeLessThanOrEqual(102);
  });
});

describe('Action ranking engine', () => {
  const userAnswers: OnboardingAnswers = {
    role: 'professional',
    livingStyle: 'independent',
    commuteMode: 'cab',
    dietPattern: 'meat_heavy',
    deliveryFrequency: 'daily',
    travelFrequency: 'frequently',
    acUsageProxy: 'high',
    electricityUsageProxy: 'high',
  };

  it('ranks actions and returns a sorted array', () => {
    const footprint = calculateFootprint(userAnswers);
    const ranked = rankActions(userAnswers, footprint);
    
    expect(ranked.length).toBeGreaterThan(0);
    
    // The top ranked items should have high ROI scores
    expect(ranked[0].roiScore).toBeGreaterThanOrEqual(ranked[ranked.length - 1].roiScore);
    
    // The top recommendation should correspond to one of the user's high impact categories
    const topAction = ranked[0];
    expect(['diet', 'commute', 'travel', 'electricity']).toContain(topAction.category);
  });
});

describe('Habit simulation math', () => {
  const userAnswers: OnboardingAnswers = {
    role: 'professional',
    livingStyle: 'independent',
    commuteMode: 'cab',
    dietPattern: 'meat_heavy',
    deliveryFrequency: 'daily',
    travelFrequency: 'frequently',
    acUsageProxy: 'high',
    electricityUsageProxy: 'high',
  };

  it('correctly simulates reduction when selecting top actions', () => {
    const footprint = calculateFootprint(userAnswers);
    const ranked = rankActions(userAnswers, footprint);
    
    // Choose top 2 actions
    const selectedIds = [ranked[0].id, ranked[1].id];
    const simulation = simulateHabits(footprint, selectedIds);
    
    expect(simulation.originalFootprint).toBe(1300);
    expect(simulation.newFootprint).toBeLessThan(1300);
    expect(simulation.monthlyReduction).toBe(1300 - simulation.newFootprint);
    expect(simulation.annualReduction).toBe(simulation.monthlyReduction * 12);
    expect(simulation.moneySaved).toBeGreaterThan(0);
  });
});

describe('Challenge generation', () => {
  const userAnswers: OnboardingAnswers = {
    role: 'student',
    livingStyle: 'hostel',
    commuteMode: 'walk_cycle',
    dietPattern: 'vegan',
    deliveryFrequency: 'rarely',
    travelFrequency: 'rarely',
    acUsageProxy: 'none',
    electricityUsageProxy: 'low',
  };

  it('generates a 4-week challenge roadmap', () => {
    const footprint = calculateFootprint(userAnswers);
    const ranked = rankActions(userAnswers, footprint);
    const challenge = generateChallenge(userAnswers, ranked);
    
    expect(challenge.milestones.length).toBe(4);
    expect(challenge.milestones[0].week).toBe(1);
    expect(challenge.milestones[3].week).toBe(4);
  });
});
