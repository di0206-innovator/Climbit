'use server';

import { OnboardingAnswers } from '../../types';
import { calculateFootprint, rankActions } from '../../lib/carbon';
import { 
  generateProfileSummary, 
  generateRecommendationExplanation, 
  generateObjectionHandler, 
  generateShareCaption, 
  generateWeeklyReflection,
  ProfileSummary,
  RecommendationExplanation,
  ObjectionHandler,
  ShareCaption,
  WeeklyReflection
} from '../../lib/gemini';

export async function getProfileSummaryAction(answers: OnboardingAnswers): Promise<ProfileSummary> {
  const footprint = calculateFootprint(answers);
  return generateProfileSummary(answers, footprint);
}

export async function getRecommendationExplanationAction(answers: OnboardingAnswers, actionId: string): Promise<RecommendationExplanation> {
  const footprint = calculateFootprint(answers);
  const ranked = rankActions(answers, footprint);
  const targetAction = ranked.find(a => a.id === actionId) || ranked[0];
  if (!targetAction) throw new Error('Action not found');
  
  return generateRecommendationExplanation(targetAction, footprint);
}

export async function getObjectionHandlerAction(answers: OnboardingAnswers, rejectedActionId: string): Promise<ObjectionHandler> {
  const footprint = calculateFootprint(answers);
  const ranked = rankActions(answers, footprint);
  
  const rejectedAction = ranked.find(a => a.id === rejectedActionId) || ranked[0];
  const alternativeActions = ranked.filter(a => a.id !== rejectedActionId);

  return generateObjectionHandler(rejectedAction?.title || 'Unknown Action', alternativeActions, footprint);
}

export async function getShareCaptionAction(answers: OnboardingAnswers, personaTitle: string, topActionTitle: string): Promise<ShareCaption> {
  const footprint = calculateFootprint(answers);
  return generateShareCaption(personaTitle, topActionTitle, footprint);
}

export async function getWeeklyReflectionAction(answers: OnboardingAnswers, completedMilestones: number, totalMilestones: number): Promise<WeeklyReflection> {
  const footprint = calculateFootprint(answers);
  return generateWeeklyReflection(footprint, completedMilestones, totalMilestones);
}
