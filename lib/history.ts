import { OnboardingAnswers, FootprintHistoryEntry } from '../types';

/**
 * Generates a synthetic 6-month history for new users to seed the analytics charts.
 * Simulates a gradual improvement curve from high-impact habits toward the user's
 * current (better) profile, giving the dashboard an immediate "before & after" story.
 *
 * @param finalAnswers The user's current onboarding answers
 * @param currentFootprint The calculated monthly footprint total (kg CO₂)
 * @returns An array of 6 FootprintHistoryEntry records, one per month
 */
export function generateMockHistory(
  finalAnswers: OnboardingAnswers,
  currentFootprint: number,
): FootprintHistoryEntry[] {
  const historyEntries: FootprintHistoryEntry[] = [];
  const currentDate = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    let factor = 1.0;
    const answersDelta = { ...finalAnswers };
    if (i > 0) {
      factor = 1.0 + i * 0.12 + (Math.random() * 0.04 - 0.02);
      if (i >= 4) {
        answersDelta.commuteMode = 'personal_vehicle';
        answersDelta.dietPattern = 'meat_heavy';
        answersDelta.electricityUsageProxy = 'high';
      } else if (i >= 2) {
        answersDelta.commuteMode = 'cab';
        answersDelta.dietPattern = 'flexitarian';
        answersDelta.electricityUsageProxy = 'medium';
      }
    }

    const monthlyTotal = Math.round(currentFootprint * factor);

    historyEntries.push({
      id: `mock-hist-${dateStr}-${Math.random().toString(36).substr(2, 9)}`,
      date: dateStr,
      monthlyTotal,
      answers: answersDelta,
    });
  }
  return historyEntries;
}
