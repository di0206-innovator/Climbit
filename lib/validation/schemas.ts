import { z } from 'zod';

export const onboardingSchema = z.object({
  role: z.enum(['student', 'professional', 'other']),
  livingStyle: z.enum(['hostel', 'family_home', 'independent']),
  commuteMode: z.enum(['walk_cycle', 'public_transit', 'personal_vehicle', 'cab']),
  dietPattern: z.enum(['vegan', 'vegetarian', 'flexitarian', 'meat_heavy']),
  deliveryFrequency: z.enum(['rarely', 'weekly', 'multiple_times_weekly', 'daily']),
  travelFrequency: z.enum(['rarely', 'occasionally', 'frequently']),
  acUsageProxy: z.enum(['none', 'low', 'medium', 'high']),
  electricityUsageProxy: z.enum(['low', 'medium', 'high']),
});
