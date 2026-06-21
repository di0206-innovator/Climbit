'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FootprintHistoryEntry } from '../types';

interface HistoryChartProps {
  history: FootprintHistoryEntry[];
}

export default function HistoryChart({ history }: HistoryChartProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Map monthly data to readable month names (e.g. "2026-05" -> "May 26")
  const data = history.map((entry) => {
    const [year, month] = entry.date.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
    const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    return {
      name: label,
      footprint: entry.monthlyTotal,
    };
  });

  if (!mounted) {
    return <div className="w-full h-[300px]" id="history-chart-wrapper" />;
  }

  return (
    <div className="w-full h-[300px]" id="history-chart-wrapper">
      <ResponsiveContainer width="99%" height="100%" minHeight={200}>
        <LineChart
          data={data}
          width={500}
          height={300}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#0f172a" fontSize={12} fontWeight={700} tickMargin={10} />
          <YAxis stroke="#0f172a" fontSize={12} fontWeight={700} tickFormatter={(val) => `${val} kg`} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '2px solid black', 
              borderRadius: '12px', 
              boxShadow: '2px 2px 0px 0px #000000', 
              fontWeight: 'bold' 
            }}
            itemStyle={{ fontWeight: 800 }}
          />
          <Legend wrapperStyle={{ fontWeight: 800, fontSize: '12px', paddingTop: '10px' }} />
          <Line 
            type="monotone" 
            dataKey="footprint" 
            name="Your Carbon History" 
            stroke="#B288FF" 
            strokeWidth={4} 
            activeDot={{ r: 8, stroke: '#000', strokeWidth: 2 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
