'use server';

import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { rateLimit } from '../../lib/rate-limit';
import { OnboardingAnswers } from '../../types';
import { calculateFootprint, rankActions } from '../../lib/carbon';
import { onboardingSchema } from '../../lib/validation/schemas';
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

async function getUserId(): Promise<string> {
  if (!process.env.CLERK_SECRET_KEY) {
    return 'mock-user-123';
  }
  const { userId } = await auth();
  return userId || '';
}

export async function getProfileSummaryAction(answers: OnboardingAnswers): Promise<ProfileSummary> {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  if (!rateLimit(userId)) throw new Error('Rate limit exceeded');

  // Input validation
  const validation = onboardingSchema.safeParse(answers);
  if (!validation.success) throw new Error('Invalid input data');
  
  const footprint = calculateFootprint(validation.data);
  return generateProfileSummary(validation.data, footprint);
}

export async function getRecommendationExplanationAction(answers: OnboardingAnswers, actionId: string): Promise<RecommendationExplanation> {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  if (!rateLimit(userId)) throw new Error('Rate limit exceeded');

  // Input validation
  const validation = onboardingSchema.safeParse(answers);
  const actionIdValidation = z.string().min(1).safeParse(actionId);
  if (!validation.success || !actionIdValidation.success) throw new Error('Invalid input data');

  const footprint = calculateFootprint(validation.data);
  const ranked = rankActions(validation.data, footprint);
  const targetAction = ranked.find(a => a.id === actionIdValidation.data) || ranked[0];
  if (!targetAction) throw new Error('Action not found');
  
  return generateRecommendationExplanation(targetAction, footprint);
}

export async function getObjectionHandlerAction(answers: OnboardingAnswers, rejectedActionId: string): Promise<ObjectionHandler> {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  if (!rateLimit(userId)) throw new Error('Rate limit exceeded');

  // Input validation
  const validation = onboardingSchema.safeParse(answers);
  const rejectedActionIdValidation = z.string().min(1).safeParse(rejectedActionId);
  if (!validation.success || !rejectedActionIdValidation.success) throw new Error('Invalid input data');

  const footprint = calculateFootprint(validation.data);
  const ranked = rankActions(validation.data, footprint);
  
  const rejectedAction = ranked.find(a => a.id === rejectedActionIdValidation.data) || ranked[0];
  const alternativeActions = ranked.filter(a => a.id !== rejectedActionIdValidation.data);

  return generateObjectionHandler(rejectedAction?.title || 'Unknown Action', alternativeActions, footprint);
}

export async function getShareCaptionAction(answers: OnboardingAnswers, personaTitle: string, topActionTitle: string): Promise<ShareCaption> {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  if (!rateLimit(userId)) throw new Error('Rate limit exceeded');

  // Input validation
  const validation = onboardingSchema.safeParse(answers);
  const personaValidation = z.string().min(1).safeParse(personaTitle);
  const actionValidation = z.string().min(1).safeParse(topActionTitle);
  if (!validation.success || !personaValidation.success || !actionValidation.success) throw new Error('Invalid input data');

  const footprint = calculateFootprint(validation.data);
  return generateShareCaption(personaValidation.data, actionValidation.data, footprint);
}

export async function getWeeklyReflectionAction(answers: OnboardingAnswers, completedMilestones: number, totalMilestones: number): Promise<WeeklyReflection> {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  if (!rateLimit(userId)) throw new Error('Rate limit exceeded');

  // Input validation
  const validation = onboardingSchema.safeParse(answers);
  const completedValidation = z.number().min(0).max(10).safeParse(completedMilestones);
  const totalValidation = z.number().min(1).safeParse(totalMilestones);
  if (!validation.success || !completedValidation.success || !totalValidation.success) throw new Error('Invalid input data');

  const footprint = calculateFootprint(validation.data);
  return generateWeeklyReflection(footprint, completedValidation.data, totalValidation.data);
}
