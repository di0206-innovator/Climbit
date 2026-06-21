'use client';

import React, { useState } from 'react';
import { Car, Bike, Train, Zap, Lightbulb, Plug, Sparkles, AlertCircle } from 'lucide-react';

const COMMUTE_MODES = [
  { id: 'walk_cycle', label: 'Walk / Cycle', val: 0, icon: Bike, desc: 'Zero emissions' },
  { id: 'public_transit', label: 'Transit', val: 35, icon: Train, desc: 'Shared efficiency' },
  { id: 'personal_vehicle', label: 'Drive Car', val: 180, icon: Car, desc: 'Fossil fuel burn' },
];

const ELECTRICITY_PATTERNS = [
  { id: 'low', label: 'Low', val: 60, icon: Plug, desc: 'Energy efficient' },
  { id: 'medium', label: 'Medium', val: 130, icon: Lightbulb, desc: 'Average usage' },
  { id: 'high', label: 'High', val: 260, icon: Zap, desc: 'Heavy appliance load' },
];

export default function MiniCalculator() {
  const [commute, setCommute] = useState('personal_vehicle');
  const [electricity, setElectricity] = useState('high');

  const commuteVal = COMMUTE_MODES.find(c => c.id === commute)?.val ?? 0;
  const electricityVal = ELECTRICITY_PATTERNS.find(e => e.id === electricity)?.val ?? 0;

  // Add baseline average for other categories
  const otherVal = 140; // diet (85) + AC (25) + delivery (18) + travel (12)
  const monthlyTotal = commuteVal + electricityVal + otherVal;
  const annualTotal = monthlyTotal * 12;

  // Determine mock grade
  let grade = 'B';
  let gradeColor = '#FFD53D'; // yellow
  let tip = 'Consider swapping 2 driving commutes with public transit.';

  if (monthlyTotal <= 250) {
    grade = 'A';
    gradeColor = '#00CC66'; // green
    tip = 'Fantastic baseline! Try reducing home appliance standby power next.';
  } else if (monthlyTotal <= 400) {
    grade = 'B';
    gradeColor = '#FFD53D';
    tip = 'Good! Upgrading to energy-efficient appliances will drop your footprint.';
  } else {
    grade = 'D';
    gradeColor = '#FF5A60'; // red/pink
    tip = 'Swap to renewable energy tariffs and turn off idle electronics.';
  }

  return (
    <div className="w-full max-w-4xl grid md:grid-cols-12 gap-8 items-stretch mt-12 text-slate-950">
      
      {/* LEFT: Inputs */}
      <div className="md:col-span-7 bg-white border-3 border-black p-6 rounded-3xl shadow-[5px_5px_0px_0px_#000000] flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-xl font-black text-slate-950 mb-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#FFD53D] fill-[#FFD53D]/25" />
            Emissions Simulator
          </h3>
          <p className="text-xs text-slate-700 font-bold mb-6">
            Adjust your primary commute and electrical appliance usage to see the impact instantly.
          </p>

          {/* Commute Selector */}
          <div className="space-y-3 mb-6">
            <span className="text-xs font-black uppercase tracking-wider text-slate-750 block">
              1. Daily Transportation Mode
            </span>
            <div className="grid grid-cols-3 gap-3">
              {COMMUTE_MODES.map(m => {
                const Icon = m.icon;
                const isSelected = commute === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setCommute(m.id)}
                    className={`p-3 border-2 border-black rounded-xl text-left flex flex-col justify-between transition-all outline-none ${
                      isSelected 
                        ? 'bg-[#FFD53D] shadow-none translate-x-[1.5px] translate-y-[1.5px]' 
                        : 'bg-white hover:bg-slate-50 shadow-[2px_2px_0px_0px_#000000] hover:translate-y-[-1px]'
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-2" />
                    <div>
                      <span className="text-xs font-extrabold block">{m.label}</span>
                      <span className="text-[9px] text-slate-600 font-semibold leading-none">{m.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Electricity Selector */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-750 block">
              2. Home Electrical Usage
            </span>
            <div className="grid grid-cols-3 gap-3">
              {ELECTRICITY_PATTERNS.map(e => {
                const Icon = e.icon;
                const isSelected = electricity === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => setElectricity(e.id)}
                    className={`p-3 border-2 border-black rounded-xl text-left flex flex-col justify-between transition-all outline-none ${
                      isSelected 
                        ? 'bg-[#00CC66] shadow-none translate-x-[1.5px] translate-y-[1.5px]' 
                        : 'bg-white hover:bg-slate-50 shadow-[2px_2px_0px_0px_#000000] hover:translate-y-[-1px]'
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-2" />
                    <div>
                      <span className="text-xs font-extrabold block">{e.label}</span>
                      <span className="text-[9px] text-slate-600 font-semibold leading-none">{e.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-[#FFFDF5] border-2 border-black p-3 rounded-xl">
          <AlertCircle className="h-4.5 w-4.5 text-[#B288FF] shrink-0 mt-0.5" />
          <span className="text-[10px] text-slate-600 font-bold leading-normal">
            Calculations include standard grid heating and baseline delivery footprints. Retake full onboarding for full 8-point accuracy.
          </span>
        </div>
      </div>

      {/* RIGHT: Visual Calculation Card */}
      <div className="md:col-span-5 flex flex-col justify-between bg-[#00CC66] border-3 border-black p-6 rounded-3xl shadow-[5px_5px_0px_0px_#000000] relative overflow-hidden text-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.06)_1.5px,transparent_1.5px)] bg-[size:16px_16px] pointer-events-none" />
        
        <div className="flex justify-between items-start relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">
            SIMULATION BILL
          </span>
          <div 
            className="border-2 border-black font-black uppercase text-center px-3 py-1 rotate-[6deg] shadow-[2.5px_2.5px_0px_0px_#000000] text-sm"
            style={{ backgroundColor: gradeColor }}
          >
            GRADE {grade}
          </div>
        </div>

        <div className="my-8 relative z-10">
          <span className="text-5xl md:text-6xl font-black block tracking-tight">
            {monthlyTotal}
          </span>
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block mt-1">
            kg CO₂ / month
          </span>
          <span className="text-xs font-semibold text-slate-900 block mt-2">
            Approx. <span className="font-black">{(annualTotal / 1000).toFixed(1)} metric tonnes</span> annually.
          </span>
        </div>

        <div className="bg-white border-2 border-black p-3 rounded-xl shadow-[2.5px_2.5px_0px_0px_#000000] relative z-10 space-y-1">
          <span className="text-[9px] text-slate-500 font-black block uppercase tracking-wider">
            RECOMMENDED STRATEGY
          </span>
          <p className="text-[11px] text-slate-950 font-bold leading-normal">
            {tip}
          </p>
        </div>
      </div>

    </div>
  );
}
