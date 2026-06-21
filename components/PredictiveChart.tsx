'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PredictiveChartProps {
  currentMonthly: number;
}

export default function PredictiveChart({ currentMonthly }: PredictiveChartProps) {
  // Generate simple projection data based on current footprint.
  const data = [
    { year: new Date().getFullYear(), projected: currentMonthly * 12, target: currentMonthly * 12 },
    { year: new Date().getFullYear() + 1, projected: Math.round(currentMonthly * 12 * 0.9), target: Math.round(currentMonthly * 12 * 0.8) },
    { year: new Date().getFullYear() + 2, projected: Math.round(currentMonthly * 12 * 0.85), target: Math.round(currentMonthly * 12 * 0.6) },
    { year: new Date().getFullYear() + 3, projected: Math.round(currentMonthly * 12 * 0.75), target: Math.round(currentMonthly * 12 * 0.4) },
    { year: new Date().getFullYear() + 4, projected: Math.round(currentMonthly * 12 * 0.7), target: Math.round(currentMonthly * 12 * 0.2) },
    { year: new Date().getFullYear() + 5, projected: Math.round(currentMonthly * 12 * 0.65), target: 0 },
  ];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="year" stroke="#0f172a" fontSize={12} fontWeight={700} tickMargin={10} />
          <YAxis stroke="#0f172a" fontSize={12} fontWeight={700} tickFormatter={(val) => `${val} kg`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '2px solid black', borderRadius: '12px', boxShadow: '2px 2px 0px 0px #000000', fontWeight: 'bold' }}
            itemStyle={{ fontWeight: 800 }}
          />
          <Legend wrapperStyle={{ fontWeight: 800, fontSize: '12px', paddingTop: '10px' }} />
          <Line type="monotone" dataKey="projected" name="Your Trajectory" stroke="#FF5A60" strokeWidth={4} activeDot={{ r: 8, stroke: '#000', strokeWidth: 2 }} />
          <Line type="monotone" dataKey="target" name="Net Zero Target" stroke="#00CC66" strokeWidth={4} strokeDasharray="5 5" activeDot={{ r: 8, stroke: '#000', strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
