// app/actions/vision.ts
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { getUserId } from '../../lib/auth';
import { rateLimit } from '../../lib/rate-limit';

export interface VisionExtractionResult {
  extractedText: string;
  inferredCarbonImpact: number; // in kg CO2
  category: string;
  confidence: number;
}

export async function extractCarbonFromImage(base64Image: string, mimeType: string): Promise<VisionExtractionResult> {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  if (!rateLimit(userId)) throw new Error('Rate limit exceeded');

  // Input validation — enforce max payload size (~10MB base64) to prevent abuse
  const MAX_BASE64_LENGTH = 10 * 1024 * 1024;
  const base64Validation = z.string().min(1).max(MAX_BASE64_LENGTH).safeParse(base64Image);
  const mimeTypeValidation = z.string().regex(/^image\/(png|jpeg|jpg|webp|gif)$/).safeParse(mimeType);
  if (!base64Validation.success || !mimeTypeValidation.success) {
    throw new Error('Invalid image data or format.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: 'application/json' } });

  const prompt = `
You are an expert AI assistant for a climate footprint calculator.
Analyze this image (which could be a utility bill, a gas station receipt, a grocery receipt, or a transit ticket).
Extract the relevant usage data (e.g., kWh of electricity, gallons/liters of fuel, flight distance, or meat weight).
Calculate a rough estimate of the carbon footprint associated with this purchase/bill in kg CO2.
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
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      }
    ]);

    const jsonText = result.response.text();
    return JSON.parse(jsonText) as VisionExtractionResult;
  } catch (error) {
    console.error('Vision extraction error:', error);
    throw new Error('Failed to analyze the image.');
  }
}
