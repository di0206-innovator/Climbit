// app/actions/voice.ts
'use server';

import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserId } from '../../lib/auth';
import { rateLimit } from '../../lib/rate-limit';

export interface VoiceExtractionResult {
  extractedText: string;
  inferredCarbonImpact: number; // in kg CO2
  category: string;
  confidence: number;
}

export async function extractCarbonFromVoice(transcript: string): Promise<VoiceExtractionResult> {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  if (!rateLimit(userId)) throw new Error('Rate limit exceeded');

  // Input validation — enforce max length to prevent abuse
  const transcriptValidation = z.string().min(1).max(500).safeParse(transcript);
  if (!transcriptValidation.success) {
    throw new Error('Invalid voice transcript input.');
  }

  const sanitizedTranscript = transcriptValidation.data;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: 'application/json' } });

  const systemPrompt = `
You are an expert AI assistant for a climate footprint calculator.
Analyze the user's speech transcript provided below.
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
    const result = await model.generateContent([
      systemPrompt,
      `User transcript: ${sanitizedTranscript}`
    ]);
    const jsonText = result.response.text();
    return JSON.parse(jsonText) as VoiceExtractionResult;
  } catch (error) {
    console.error('Voice extraction error:', error);
    throw new Error('Failed to analyze the voice transcript.');
  }
}
