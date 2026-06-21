import { describe, it, expect } from 'vitest';
import { generateMockHistory } from '../lib/history';
import { OnboardingAnswers } from '../types';

describe('history utilities', () => {
  const baseAnswers: OnboardingAnswers = {
    role: 'professional',
    livingStyle: 'independent',
    commuteMode: 'public_transit',
    dietPattern: 'vegetarian',
    deliveryFrequency: 'rarely',
    travelFrequency: 'rarely',
    acUsageProxy: 'none',
    electricityUsageProxy: 'low'
  };

  it('should generate 6 months of mock history', () => {
    const history = generateMockHistory(baseAnswers, 100);
    expect(history.length).toBe(6);
  });

  it('should have the correct date formatting for entries', () => {
    const history = generateMockHistory(baseAnswers, 100);
    const currentDate = new Date();
    const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    expect(history[5].date).toBe(currentMonthStr);
  });

  it('should simulate worse footprint in the past (factor > 1)', () => {
    const history = generateMockHistory(baseAnswers, 100);
    // Oldest entry (5 months ago) should have highest carbon total
    expect(history[0].monthlyTotal).toBeGreaterThan(history[5].monthlyTotal);
  });

  it('should manipulate answers delta to simulate worse habits in the past', () => {
    const history = generateMockHistory(baseAnswers, 100);
    
    // 5 months ago
    expect(history[0].answers.commuteMode).toBe('personal_vehicle');
    expect(history[0].answers.dietPattern).toBe('meat_heavy');
    expect(history[0].answers.electricityUsageProxy).toBe('high');

    // Recent (current month)
    expect(history[5].answers.commuteMode).toBe('public_transit');
    expect(history[5].answers.dietPattern).toBe('vegetarian');
    expect(history[5].answers.electricityUsageProxy).toBe('low');
  });
});
