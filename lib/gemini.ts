import { GoogleGenerativeAI } from '@google/generative-ai';
import { OnboardingAnswers, FootprintResult, RecommendationResult } from '../types';

export interface ProfileSummary {
  personaTitle: string;
  personaSummary: string;
  topOpportunity: string;
}

export interface RecommendationExplanation {
  headline: string;
  explanation: string;
  whyItFits: string;
}

export interface ObjectionHandler {
  fallbackAction: string;
  reason: string;
  nextBestStep: string;
}

export interface ShareCaption {
  caption: string;
  hashtags: string[];
}

export interface WeeklyReflection {
  summary: string;
  focusNextWeek: string;
  motivationLine: string;
}

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash-latest',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });
}

export async function generateProfileSummary(
  answers: OnboardingAnswers,
  footprint: FootprintResult
): Promise<ProfileSummary> {
  const model = getModel();
  if (!model) {
    return {
      personaTitle: footprint.personaTitle || 'Eco-Conscious Voyager',
      personaSummary: footprint.personaSummary || 'Your footprint suggests you care, but have areas to optimize.',
      topOpportunity: 'Optimize your daily routines.',
    };
  }

  const prompt = `
You are a supportive climate coach app.
Analyze this user profile and deterministic footprint:
- Role: ${answers.role}
- Living Style: ${answers.livingStyle}
- Commute Mode: ${answers.commuteMode}
- Diet Pattern: ${answers.dietPattern}
- Total Footprint: ${footprint.monthlyTotal} kg CO2/month
- Top Category: ${footprint.biggestDriver}

Generate a short, human-readable climate persona summary.
1. personaTitle: A catchy climate persona title.
2. personaSummary: 2-sentence summary of their lifestyle footprint drivers. Friendly, non-judgmental.
3. topOpportunity: 1-sentence on their biggest opportunity to reduce emissions.

Output MUST be a valid JSON object matching this schema exactly:
{
  "personaTitle": "string",
  "personaSummary": "string",
  "topOpportunity": "string"
}
`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as ProfileSummary;
  } catch (e) {
    console.error('generateProfileSummary error:', e);
    return {
      personaTitle: footprint.personaTitle || 'Eco-Conscious Voyager',
      personaSummary: footprint.personaSummary || 'Your footprint suggests you care, but have areas to optimize.',
      topOpportunity: 'Optimize your daily routines.',
    };
  }
}

export async function generateRecommendationExplanation(
  action: RecommendationResult,
  footprint: FootprintResult
): Promise<RecommendationExplanation> {
  const model = getModel();
  if (!model) {
    return {
      headline: 'A Great Choice',
      explanation: 'This action has high ROI based on our math.',
      whyItFits: 'It directly targets your top emission categories.',
    };
  }

  const prompt = `
You are a supportive climate coach app.
The user's top recommended action is:
- Title: ${action.title}
- Description: ${action.description}
- Effort: ${action.effort}
- Cost: ${action.cost}
- Carbon Savings: ${action.baseCarbonSavings} kg CO2/mo
- Their Top Footprint Driver: ${footprint.biggestDriver}

Explain why this recommendation was chosen in simple language. Mention impact, effort, cost, and relevance.
Output MUST be a valid JSON object matching this schema exactly:
{
  "headline": "string",
  "explanation": "string",
  "whyItFits": "string"
}
`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as RecommendationExplanation;
  } catch (e) {
    console.error('generateRecommendationExplanation error:', e);
    return {
      headline: 'A Great Choice',
      explanation: 'This action has high ROI based on our math.',
      whyItFits: 'It directly targets your top emission categories.',
    };
  }
}

export async function generateObjectionHandler(
  rejectedActionTitle: string,
  alternativeActions: RecommendationResult[],
  footprint: FootprintResult
): Promise<ObjectionHandler> {
  const model = getModel();
  if (!model) {
    return {
      fallbackAction: alternativeActions[0]?.title || 'Try something else.',
      reason: 'It requires different effort and cost profiles.',
      nextBestStep: 'Check the rest of your recommended actions list.',
    };
  }

  const alternativesContext = alternativeActions.slice(0, 3).map(a => 
    `- ${a.title} (Savings: ${a.baseCarbonSavings} kg CO2/mo, Cost: ${a.cost}, Effort: ${a.effort})`
  ).join('\n');

  const prompt = `
You are a supportive climate coach app.
The user said the recommendation "${rejectedActionTitle}" is not practical for them.
Their top emission driver is: ${footprint.biggestDriver}

Suggest the next best alternative from these available actions:
${alternativesContext}

Output MUST be a valid JSON object matching this schema exactly:
{
  "fallbackAction": "string",
  "reason": "string",
  "nextBestStep": "string"
}
`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as ObjectionHandler;
  } catch (e) {
    console.error('generateObjectionHandler error:', e);
    return {
      fallbackAction: alternativeActions[0]?.title || 'Try something else.',
      reason: 'It requires different effort and cost profiles.',
      nextBestStep: 'Check the rest of your recommended actions list.',
    };
  }
}

export async function generateShareCaption(
  persona: string,
  topActionTitle: string,
  footprint: FootprintResult
): Promise<ShareCaption> {
  const model = getModel();
  if (!model) {
    return {
      caption: `I just calculated my carbon footprint on Climbit! My persona is "${persona}", and my single best next action is to "${topActionTitle}". Check your carbon footprint and get ranked actions at Climbit!`,
      hashtags: ['#sustainability', '#climateaction', '#climbit'],
    };
  }

  const prompt = `
Generate a concise public-friendly LinkedIn caption based on the user's result:
- Persona: ${persona}
- Top Action: ${topActionTitle}
- Total Footprint: ${footprint.monthlyTotal} kg CO2/month

Output MUST be a valid JSON object matching this schema exactly:
{
  "caption": "string",
  "hashtags": ["string"]
}
`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as ShareCaption;
  } catch (e) {
    console.error('generateShareCaption error:', e);
    return {
      caption: `I just calculated my carbon footprint on Climbit! My persona is "${persona}", and my single best next action is to "${topActionTitle}". Check your carbon footprint and get ranked actions at Climbit!`,
      hashtags: ['#sustainability', '#climateaction', '#climbit'],
    };
  }
}

export async function generateWeeklyReflection(
  footprint: FootprintResult,
  completedActionCount: number,
  totalSprintWeeks: number
): Promise<WeeklyReflection> {
  const model = getModel();
  if (!model) {
    return {
      summary: 'You are making progress!',
      focusNextWeek: 'Keep up the momentum.',
      motivationLine: 'Every small step counts towards a greener future.',
    };
  }

  const prompt = `
Generate a short weekly progress note based on the user's footprint and actions.
- Footprint: ${footprint.monthlyTotal} kg CO2/month
- Top Emission Driver: ${footprint.biggestDriver}
- Progress: Completed ${completedActionCount} out of ${totalSprintWeeks} milestones.

Output MUST be a valid JSON object matching this schema exactly:
{
  "summary": "string",
  "focusNextWeek": "string",
  "motivationLine": "string"
}
`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as WeeklyReflection;
  } catch (e) {
    console.error('generateWeeklyReflection error:', e);
    return {
      summary: 'You are making progress!',
      focusNextWeek: 'Keep up the momentum.',
      motivationLine: 'Every small step counts towards a greener future.',
    };
  }
}
