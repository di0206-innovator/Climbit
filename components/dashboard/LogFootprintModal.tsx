'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Bike, Bus, Car, Truck, Carrot, Egg, Soup, Drumstick, Wind, Snowflake, Zap, Package, ShoppingBag, Train, Plane, Map, Info } from 'lucide-react';
import Button from '../ui/button';
import { useClimbitStore } from '../../lib/store';
import { OnboardingAnswers, FootprintHistoryEntry } from '../../types';
import { calculateFootprint } from '../../lib/carbon';

interface LogFootprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogged: (newHistory: FootprintHistoryEntry[]) => void;
}

export default function LogFootprintModal({ isOpen, onClose, onLogged }: LogFootprintModalProps) {
  const store = useClimbitStore();
  const currentAnswers = store.answers;

  const [date, setDate] = useState('');
  const [commute, setCommute] = useState<OnboardingAnswers['commuteMode']>('walk_cycle');
  const [diet, setDiet] = useState<OnboardingAnswers['dietPattern']>('vegan');
  const [ac, setAc] = useState<OnboardingAnswers['acUsageProxy']>('none');
  const [electricity, setElectricity] = useState<OnboardingAnswers['electricityUsageProxy']>('low');
  const [delivery, setDelivery] = useState<OnboardingAnswers['deliveryFrequency']>('rarely');
  const [travel, setTravel] = useState<OnboardingAnswers['travelFrequency']>('rarely');

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Load current profile settings as defaults
  useEffect(() => {
    if (isOpen) {
      // Default to current month
      const d = new Date();
      const defaultDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      setDate(defaultDate);

      if (currentAnswers) {
        setCommute(currentAnswers.commuteMode);
        setDiet(currentAnswers.dietPattern);
        setAc(currentAnswers.acUsageProxy);
        setElectricity(currentAnswers.electricityUsageProxy);
        setDelivery(currentAnswers.deliveryFrequency);
        setTravel(currentAnswers.travelFrequency);
      }
      
      // Accessibility focus trap
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen, currentAnswers]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Generate selectable months (past 12 months)
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ val, label });
    }
    return options;
  };

  const handleSave = () => {
    if (!date) {
      alert('Please select a month.');
      return;
    }

    const payloadAnswers: OnboardingAnswers = {
      role: currentAnswers?.role || 'other',
      livingStyle: currentAnswers?.livingStyle || 'independent',
      commuteMode: commute,
      dietPattern: diet,
      acUsageProxy: ac,
      electricityUsageProxy: electricity,
      deliveryFrequency: delivery,
      travelFrequency: travel,
    };

    // Calculate footprint using current carbon formulas
    const result = calculateFootprint(payloadAnswers);

    const newEntry: FootprintHistoryEntry = {
      id: `hist-${date}-${Math.random().toString(36).substr(2, 9)}`,
      date,
      monthlyTotal: result.monthlyTotal,
      answers: payloadAnswers
    };

    // Filter out previous record of same date, insert new one, sort
    const existingHistory = [...store.history];
    const filtered = existingHistory.filter((h) => h.date !== date);
    const updated = [...filtered, newEntry].sort((a, b) => a.date.localeCompare(b.date));

    store.setHistory(updated);
    onLogged(updated);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-lg bg-white border-3 border-black rounded-3xl shadow-[5px_5px_0px_0px_#000000] p-6 max-h-[90vh] overflow-y-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <h2 id="modal-title" className="text-xl font-black text-slate-950 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#B288FF]" />
            Log Monthly Footprint
          </h2>
          <button 
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1 rounded-lg border-2 border-black bg-white hover:bg-slate-100 shadow-[1px_1px_0px_0px_#000000] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none transition-all outline-none focus-visible:ring-2 focus-visible:ring-black"
            aria-label="Close modal"
          >
            <X className="h-4.5 w-4.5 text-slate-950" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 text-xs font-bold text-slate-900">
          
          {/* Select Month */}
          <div className="space-y-1.5">
            <label htmlFor="log-month" className="text-slate-950 uppercase tracking-wider text-[10px] font-black">
              Target Month
            </label>
            <select
              id="log-month"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 bg-white border-2 border-black rounded-xl font-extrabold outline-none shadow-[2px_2px_0px_0px_#000000] focus:shadow-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
            >
              {getMonthOptions().map((opt) => (
                <option key={opt.val} value={opt.val}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t-2 border-dashed border-slate-200 pt-3 space-y-4">
            <div className="p-3 bg-emerald-50/50 border border-emerald-500/30 rounded-xl text-[10px] font-bold text-emerald-800 leading-normal flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>We prefilled your answers below with your current onboarding profile. Modify only what differed during this target month.</span>
            </div>

            {/* Commute Mode */}
            <div className="space-y-1.5">
              <span id="log-commute-label" className="text-slate-950 uppercase tracking-wider text-[10px] font-black block">Commute Mode</span>
              <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-labelledby="log-commute-label">
                {[
                  { val: 'walk_cycle', label: 'Walk/Bike', icon: Bike },
                  { val: 'public_transit', label: 'Transit', icon: Bus },
                  { val: 'personal_vehicle', label: 'Car', icon: Car },
                  { val: 'cab', label: 'Cab', icon: Truck },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSel = commute === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      role="radio"
                      aria-checked={isSel}
                      onClick={() => setCommute(opt.val as OnboardingAnswers['commuteMode'])}
                      className={`p-2 border-2 border-black rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                        isSel ? 'bg-[#FFD53D] shadow-none translate-y-[1px]' : 'bg-white hover:bg-slate-50 shadow-[1.5px_1.5px_0px_0px_#000000]'
                      }`}
                    >
                      <Icon className="h-4 w-4 text-slate-950" />
                      <span className="text-[9px] font-black">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Diet Pattern */}
            <div className="space-y-1.5">
              <span id="log-diet-label" className="text-slate-950 uppercase tracking-wider text-[10px] font-black block">Diet</span>
              <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-labelledby="log-diet-label">
                {[
                  { val: 'vegan', label: 'Vegan', icon: Carrot },
                  { val: 'vegetarian', label: 'Veg', icon: Egg },
                  { val: 'flexitarian', label: 'Flexi', icon: Soup },
                  { val: 'meat_heavy', label: 'Meat', icon: Drumstick },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSel = diet === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      role="radio"
                      aria-checked={isSel}
                      onClick={() => setDiet(opt.val as OnboardingAnswers['dietPattern'])}
                      className={`p-2 border-2 border-black rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                        isSel ? 'bg-[#FFD53D] shadow-none translate-y-[1px]' : 'bg-white hover:bg-slate-50 shadow-[1.5px_1.5px_0px_0px_#000000]'
                      }`}
                    >
                      <Icon className="h-4 w-4 text-slate-950" />
                      <span className="text-[9px] font-black">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AC Usage */}
            <div className="space-y-1.5">
              <span id="log-ac-label" className="text-slate-950 uppercase tracking-wider text-[10px] font-black block">Air Conditioning</span>
              <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-labelledby="log-ac-label">
                {[
                  { val: 'none', label: 'Fan Only', icon: Wind },
                  { val: 'low', label: 'Low', icon: Wind },
                  { val: 'medium', label: 'Med', icon: Snowflake },
                  { val: 'high', label: 'High', icon: Snowflake },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSel = ac === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      role="radio"
                      aria-checked={isSel}
                      onClick={() => setAc(opt.val as OnboardingAnswers['acUsageProxy'])}
                      className={`p-2 border-2 border-black rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                        isSel ? 'bg-[#FFD53D] shadow-none translate-y-[1px]' : 'bg-white hover:bg-slate-50 shadow-[1.5px_1.5px_0px_0px_#000000]'
                      }`}
                    >
                      <Icon className="h-4 w-4 text-slate-950" />
                      <span className="text-[9px] font-black">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Electricity Usage */}
            <div className="space-y-1.5">
              <span id="log-electricity-label" className="text-slate-950 uppercase tracking-wider text-[10px] font-black block">Household Electricity</span>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="log-electricity-label">
                {[
                  { val: 'low', label: 'Low Load', icon: Zap },
                  { val: 'medium', label: 'Standard', icon: Zap },
                  { val: 'high', label: 'Heavy Load', icon: Zap },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSel = electricity === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      role="radio"
                      aria-checked={isSel}
                      onClick={() => setElectricity(opt.val as OnboardingAnswers['electricityUsageProxy'])}
                      className={`p-2 border-2 border-black rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                        isSel ? 'bg-[#FFD53D] shadow-none translate-y-[1px]' : 'bg-white hover:bg-slate-50 shadow-[1.5px_1.5px_0px_0px_#000000]'
                      }`}
                    >
                      <Icon className="h-4 w-4 text-slate-950" />
                      <span className="text-[9px] font-black">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery Frequency */}
            <div className="space-y-1.5">
              <span id="log-delivery-label" className="text-slate-950 uppercase tracking-wider text-[10px] font-black block">Food & Package Delivery</span>
              <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-labelledby="log-delivery-label">
                {[
                  { val: 'rarely', label: 'Rarely', icon: Package },
                  { val: 'weekly', label: 'Weekly', icon: ShoppingBag },
                  { val: 'multiple_times_weekly', label: '3-4/wk', icon: Truck },
                  { val: 'daily', label: 'Daily', icon: Zap },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSel = delivery === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      role="radio"
                      aria-checked={isSel}
                      onClick={() => setDelivery(opt.val as OnboardingAnswers['deliveryFrequency'])}
                      className={`p-2 border-2 border-black rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                        isSel ? 'bg-[#FFD53D] shadow-none translate-y-[1px]' : 'bg-white hover:bg-slate-50 shadow-[1.5px_1.5px_0px_0px_#000000]'
                      }`}
                    >
                      <Icon className="h-4 w-4 text-slate-950" />
                      <span className="text-[9px] font-black">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Travel Frequency */}
            <div className="space-y-1.5">
              <span id="log-travel-label" className="text-slate-950 uppercase tracking-wider text-[10px] font-black block">Long Distance Flights</span>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="log-travel-label">
                {[
                  { val: 'rarely', label: 'Rarely', icon: Train },
                  { val: 'occasionally', label: '1-3 flights/yr', icon: Map },
                  { val: 'frequently', label: 'Monthly flights', icon: Plane },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSel = travel === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      role="radio"
                      aria-checked={isSel}
                      onClick={() => setTravel(opt.val as OnboardingAnswers['travelFrequency'])}
                      className={`p-2 border-2 border-black rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                        isSel ? 'bg-[#FFD53D] shadow-none translate-y-[1px]' : 'bg-white hover:bg-slate-50 shadow-[1.5px_1.5px_0px_0px_#000000]'
                      }`}
                    >
                      <Icon className="h-4 w-4 text-slate-950" />
                      <span className="text-[9px] font-black">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 border-t-2 border-black pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose} 
            className="border-2"
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleSave} 
            className="border-2 border-black"
          >
            Calculate & Log
          </Button>
        </div>
      </div>
    </div>
  );
}
