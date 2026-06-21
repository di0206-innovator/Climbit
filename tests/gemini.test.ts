import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  generateProfileSummary, 
  generateRecommendationExplanation, 
  generateObjectionHandler, 
  generateShareCaption, 
  generateWeeklyReflection 
} from '../lib/gemini';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OnboardingAnswers, FootprintResult, RecommendationResult } from '../types';

vi.mock('@google/generative-ai');

describe('gemini API utilities', () => {
  const baseAnswers: OnboardingAnswers = {
    role: 'professional',
    livingStyle: 'apartment',
    commuteMode: 'public_transit',
    dietPattern: 'vegetarian',
    electricityUsageProxy: 'low'
  };

  const baseFootprint: FootprintResult = {
    monthlyTotal: 150,
    categories: {
      commute: 20,
      diet: 50,
      electricity: 30,
      purchases: 50
    },
    biggestDriver: 'diet',
    personaTitle: 'Veggie Saver',
    personaSummary: 'Great job!',
    recommendedActions: []
  };

  const baseAction: RecommendationResult = {
    id: 'act1',
    title: 'Eat less meat',
    description: 'Switch to a plant based diet.',
    category: 'diet',
    baseCarbonSavings: 50,
    effort: 'medium',
    cost: 'low',
    upfrontCostAmount: 0,
    paybackPeriodYears: 0,
    oneTimeSavings: false
  };

  let mockGenerateContent: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'mock_api_key';
    
    mockGenerateContent = vi.fn();
    vi.mocked(GoogleGenerativeAI).mockImplementation(function() {
      return {
        getGenerativeModel: () => ({
          generateContent: mockGenerateContent
        })
      };
    } as any);
  });

  it('should return fallback profile summary if GEMINI_API_KEY is not set', async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await generateProfileSummary(baseAnswers, baseFootprint);
    expect(res.personaTitle).toBe('Veggie Saver');
    expect(res.topOpportunity).toBe('Optimize your daily routines.');
  });

  it('should successfully parse profile summary from Gemini', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          personaTitle: 'AI Generated Title',
          personaSummary: 'AI Summary',
          topOpportunity: 'AI Opportunity'
        })
      }
    });

    const res = await generateProfileSummary(baseAnswers, baseFootprint);
    expect(res.personaTitle).toBe('AI Generated Title');
    expect(res.personaSummary).toBe('AI Summary');
  });

  it('should fallback gracefully on API error for profile summary', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Failure'));

    const res = await generateProfileSummary(baseAnswers, baseFootprint);
    expect(res.personaTitle).toBe('Veggie Saver');
  });

  it('should generate recommendation explanation', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          headline: 'Wow!',
          explanation: 'Because it saves lots of CO2',
          whyItFits: 'Matches your diet'
        })
      }
    });

    const res = await generateRecommendationExplanation(baseAction, baseFootprint);
    expect(res.headline).toBe('Wow!');
    expect(res.whyItFits).toBe('Matches your diet');
  });

  it('should fallback gracefully on API error for recommendation explanation', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Failure'));
    const res = await generateRecommendationExplanation(baseAction, baseFootprint);
    expect(res.headline).toBe('A Great Choice');
  });

  it('should generate objection handler', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          fallbackAction: 'Take the bus',
          reason: 'Cheaper',
          nextBestStep: 'Check schedules'
        })
      }
    });

    const res = await generateObjectionHandler('Buy a Tesla', [baseAction], baseFootprint);
    expect(res.fallbackAction).toBe('Take the bus');
  });

  it('should generate share caption', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          caption: 'My footprint is tiny!',
          hashtags: ['#green']
        })
      }
    });

    const res = await generateShareCaption('Veggie Saver', 'Eat less meat', baseFootprint);
    expect(res.caption).toBe('My footprint is tiny!');
    expect(res.hashtags).toContain('#green');
  });

  it('should generate weekly reflection', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          summary: 'Good week',
          focusNextWeek: 'Eat beans',
          motivationLine: 'Keep going'
        })
      }
    });

    const res = await generateWeeklyReflection(baseFootprint, 1, 4);
    expect(res.summary).toBe('Good week');
  });
});
