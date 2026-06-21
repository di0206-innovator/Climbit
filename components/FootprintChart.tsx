'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FootprintCategory } from '../types';

interface FootprintChartProps {
  categories: FootprintCategory[];
}

export default function FootprintChart({ categories }: FootprintChartProps) {
  // Sort categories by emission value descending for better visual structure
  const data = [...categories]
    .sort((a, b) => b.value - a.value)
    .map((c) => ({
      name: c.label,
      value: Math.round(c.value),
    }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { payload: { name: string }; value: number }[];
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass px-3.5 py-2.5 rounded-xl border border-slate-700/80 text-xs shadow-xl">
          <p className="font-bold text-white mb-1">{payload[0].payload.name}</p>
          <p className="text-emerald-400 font-semibold">
            {payload[0].value} kg CO2 / month
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[260px] md:h-[300px]" role="img" aria-label="Carbon footprint emission breakdown chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
        >
          <XAxis
            type="number"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.05)', radius: 8 }} />
          <Bar
            dataKey="value"
            radius={[0, 8, 8, 0]}
            maxBarSize={20}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? 'url(#activeGrad)' : 'url(#defaultGrad)'}
              />
            ))}
          </Bar>
          <defs>
            <linearGradient id="activeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="defaultGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.7} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
