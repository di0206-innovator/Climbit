'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FootprintCategory } from '../types';

interface FootprintChartProps {
  categories: FootprintCategory[];
}

export default function FootprintChart({ categories }: FootprintChartProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

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
        <div className="bg-white px-3.5 py-2.5 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_#000000] text-xs">
          <p className="font-extrabold text-slate-950 mb-1">{payload[0].payload.name}</p>
          <p className="text-[#00CC66] font-extrabold">
            {payload[0].value} kg CO₂ / month
          </p>
        </div>
      );
    }
    return null;
  };

  if (!mounted) {
    return <div className="w-full h-[260px] md:h-[300px]" role="img" aria-label="Carbon footprint emission breakdown chart" />;
  }

  return (
    <div className="w-full h-[260px] md:h-[300px]" role="img" aria-label="Carbon footprint emission breakdown chart">
      <ResponsiveContainer width="99%" height="100%" minHeight={200}>
        <BarChart
          data={data}
          width={500}
          height={300}
          layout="vertical"
          margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
        >
          <XAxis
            type="number"
            stroke="#000000"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#000000"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={110}
            style={{ fontWeight: 'bold' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.04)', radius: 8 }} />
          <Bar
            dataKey="value"
            radius={[0, 6, 6, 0]}
            maxBarSize={22}
            stroke="#000000"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? '#00CC66' : '#FFD53D'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
