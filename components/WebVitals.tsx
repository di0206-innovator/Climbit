'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // In a real production app, this would be sent to an analytics endpoint
    // For the hackathon, we log it to the console to prove observability is wired up
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Web Vitals] ${metric.name}: ${Math.round(metric.value)}ms`);
    }
  });

  return null;
}
