'use server';

import { OnboardingAnswers } from '../../types';
import { calculateFootprint, rankActions } from '../../lib/carbon';
import { generateAIInsights, AIInsights } from '../../lib/gemini';

export async function getAIInsightsAction(answers: OnboardingAnswers): Promise<AIInsights> {
  const footprint = calculateFootprint(answers);
  const ranked = rankActions(answers, footprint);
  const topActionTitle = ranked[0]?.title || 'Optimise habits';

  return generateAIInsights(answers, footprint, topActionTitle);
}
