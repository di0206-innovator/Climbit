// app/actions/voice.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { rateLimit } from '../../lib/rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface VoiceExtractionResult {
  extractedText: string;
  inferredCarbonImpact: number; // in kg CO2
  category: string;
  confidence: number;
}

async function getUserId(): Promise<string> {
  if (!process.env.CLERK_SECRET_KEY) {
    return 'mock-user-123';
  }
  const { userId } = await auth();
  return userId || '';
}

export async function extractCarbonFromVoice(transcript: string): Promise<VoiceExtractionResult> {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  if (!rateLimit(userId)) throw new Error('Rate limit exceeded');

  // Input validation
  const transcriptValidation = z.string().min(1).safeParse(transcript);
  if (!transcriptValidation.success) {
    throw new Error('Invalid voice transcript input.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: 'application/json' } });

  const prompt = `
You are an expert AI assistant for a climate footprint calculator.
Analyze this user's speech transcript: "${transcript}".
Extract the relevant action or consumption data (e.g., "I drove 20 miles", "I ate a burger").
Calculate a rough estimate of the carbon footprint associated with this action in kg CO2.
Also identify the category (e.g., "Electricity", "Transport", "Diet", "Shopping").

Output MUST be a valid JSON object matching this schema exactly:
{
  "extractedText": "string",
  "inferredCarbonImpact": number,
  "category": "string",
  "confidence": number
}
  `;

  try {
    const result = await model.generateContent(prompt);
    const jsonText = result.response.text();
    return JSON.parse(jsonText) as VoiceExtractionResult;
  } catch (error) {
    console.error('Voice extraction error:', error);
    throw new Error('Failed to analyze the voice transcript.');
  }
}
