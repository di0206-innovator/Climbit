import { GoogleGenerativeAI } from '@google/generative-ai';
import { OnboardingAnswers, FootprintResult } from '../types';

export interface AIInsights {
  personaTitle: string;
  personaSummary: string;
  coachTip: string;
  challengeTitle: string;
  challengeDescription: string;
  shareCaption: string;
}

export async function generateAIInsights(
  answers: OnboardingAnswers,
  footprint: FootprintResult,
  topActionTitle: string
): Promise<AIInsights> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback: If no API key, return the deterministic local estimations
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not set. Using rule-based fallback insights.');
    return getFallbackInsights(footprint, topActionTitle);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the standard and fast model gemini-1.5-flash
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const categoriesBreakdown = footprint.categories
      .map((c) => `${c.label}: ${c.value} kg CO2/month (${c.percentage}%)`)
      .join(', ');

    const prompt = `
You are a supportive, smart, and motivating climate coach app.
Analyze this user profile and deterministic carbon footprint calculations:
- Role: ${answers.role}
- Living Style: ${answers.livingStyle}
- Commute Mode: ${answers.commuteMode}
- Diet Pattern: ${answers.dietPattern}
- Home Electricity: ${answers.electricityUsageProxy}
- AC usage: ${answers.acUsageProxy}
- Deliveries: ${answers.deliveryFrequency}
- Flight Travel: ${answers.travelFrequency}
- Total Carbon Footprint: ${footprint.monthlyTotal} kg CO2/month (${footprint.annualTotal} kg CO2/year)
- Top Emission Category: ${footprint.biggestDriver}
- Category Breakdown: ${categoriesBreakdown}
- Top Recommended Action ROI-wise: "${topActionTitle}"

Generate:
1. "personaTitle": A short, catchy climate persona title (e.g. "The Jet-Set Foodie", "The Conscious Commuter", "The Convenience Curator"). Do not exceed 4 words.
2. "personaSummary": A brief, 2-sentence summary of their lifestyle footprint drivers. Friendly, non-judgmental.
3. "coachTip": A single actionable, practical tip for their daily life based on their largest emission drivers.
4. "challengeTitle": A fun title for a 30-day sustainability challenge (e.g., "The Commuter Challenge").
5. "challengeDescription": A brief 1-sentence motivation for the 30-day challenge.
6. "shareCaption": A short, punchy caption optimized for sharing on LinkedIn (e.g. "Just found my biggest carbon driver using Climbit! My best next action is swapping cabs for transit. Try it out! #Climbit").

Output MUST be a valid JSON object matching this schema exactly:
{
  "personaTitle": "string",
  "personaSummary": "string",
  "coachTip": "string",
  "challengeTitle": "string",
  "challengeDescription": "string",
  "shareCaption": "string"
}
Do not include markdown code block formatting in your JSON string (like \`\`\`json). Just the raw JSON object.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Safely parse JSON
    const parsed = JSON.parse(text) as AIInsights;

    // Sanitize check: Ensure fields exist and are strings
    if (
      parsed.personaTitle &&
      parsed.personaSummary &&
      parsed.coachTip &&
      parsed.challengeTitle &&
      parsed.challengeDescription &&
      parsed.shareCaption
    ) {
      return parsed;
    }

    throw new Error('AI response did not match the expected schema.');
  } catch (error) {
    console.error('Failed to generate AI insights:', error);
    return getFallbackInsights(footprint, topActionTitle);
  }
}

function getFallbackInsights(footprint: FootprintResult, topActionTitle: string): AIInsights {
  // Leverage existing local computations in the footprint result
  return {
    personaTitle: footprint.personaTitle,
    personaSummary: footprint.personaSummary,
    coachTip: footprint.coachTip,
    challengeTitle: 'Your 30-Day Climbit Challenge',
    challengeDescription: 'A custom roadmap to lower your carbon emissions step-by-step.',
    shareCaption: `I just calculated my carbon footprint on Climbit! My persona is "${footprint.personaTitle}", and my single best next action is to "${topActionTitle}". Check your carbon footprint and get ranked actions at Climbit! #sustainability #climateaction`,
  };
}
