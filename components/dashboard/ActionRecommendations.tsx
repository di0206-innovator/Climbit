import React from 'react';
import { HelpCircle, XCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import Button from '../ui/button';
import Progress from '../ui/progress';
import { useClimbitStore } from '../../lib/store';
import { getObjectionHandlerAction } from '../../app/actions/ai';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActionRecommendations() {
  const store = useClimbitStore();
  const { 
    rankedActions, 
    selectedActions, 
    simulation, 
    footprint,
    recExplanation,
    objection,
    isHandlingObjection,
    answers
  } = store;

  if (rankedActions.length === 0 || !simulation || !footprint || !answers) return null;

  const topAction = rankedActions[0];

  const handleObjection = async () => {
    store.setIsHandlingObjection(true);
    try {
      const result = await getObjectionHandlerAction(answers, topAction.id);
      store.setObjection(result);
    } catch (err) {
      console.error("Objection handle failed", err);
    }
    store.setIsHandlingObjection(false);
  };

  const toggleAction = (id: string) => {
    const newSelection = selectedActions.includes(id) 
      ? selectedActions.filter((x) => x !== id) 
      : [...selectedActions, id];
    store.setSelectedActions(newSelection);
  };

  const resetSimulator = () => {
    store.setSelectedActions([topAction.id]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-6"
    >
      <Card id="hero-recommendation-card" className="bg-[#FFFDF5] border-3 border-black shadow-[4px_4px_0px_0px_#000000] relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00CC66] text-slate-950 border-2 border-black text-[9px] font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_#000000]">
              Top Recommended Action
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-855 text-xs font-extrabold">ROI Score: {topAction.roiScore}/100</span>
          </div>
          <CardTitle className="text-2xl font-black text-slate-950 leading-tight">
            {topAction.title}
          </CardTitle>
          <CardDescription>
            {topAction.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <div className="text-center md:text-left">
              <span className="text-[9px] text-slate-500 font-black block uppercase">Est. Saving</span>
              <span className="text-sm font-black text-[#00CC66]">-{topAction.baseCarbonSavings} kg CO₂/mo</span>
            </div>
            <div className="text-center md:text-left">
              <span className="text-[9px] text-slate-500 font-black block uppercase">Money saved</span>
              <span className="text-sm font-black text-[#00CC66]">${topAction.baseMoneySavings}/mo</span>
            </div>
            <div className="text-center md:text-left">
              <span className="text-[9px] text-slate-500 font-black block uppercase">Effort</span>
              <span className="text-sm font-black text-slate-900 capitalize">{topAction.effort}</span>
            </div>
            <div className="text-center md:text-left">
              <span className="text-[9px] text-slate-500 font-black block uppercase">Confidence</span>
              <span className="text-sm font-black text-slate-900">{Math.round(topAction.confidence * 100)}%</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {recExplanation ? (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex gap-2.5 items-start bg-white border-2 border-black p-3.5 rounded-xl text-xs text-slate-800 font-semibold leading-relaxed shadow-[2px_2px_0px_0px_#000000]"
              >
                <HelpCircle className="h-4.5 w-4.5 text-[#00CC66] shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-950 block mb-0.5">{recExplanation.headline}</span>
                  {recExplanation.explanation} {recExplanation.whyItFits}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="loading"
                exit={{ opacity: 0 }}
                className="text-xs text-slate-500 animate-pulse font-bold"
              >
                Generating explanation...
              </motion.div>
            )}
          </AnimatePresence>

          {!objection ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleObjection}
              disabled={isHandlingObjection}
              aria-label="I cannot do this action, give me an alternative"
              className="mt-2 text-xs border-2 border-black"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              {isHandlingObjection ? 'Checking alternatives...' : "I can't do this"}
            </Button>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-[#FFEEDD] border-2 border-black rounded-xl space-y-2 shadow-[2px_2px_0px_0px_#000000]"
            >
              <h4 className="text-slate-950 font-black text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#FF5A60]" />
                Alternative Action: {objection.fallbackAction}
              </h4>
              <p className="text-slate-800 text-xs font-semibold">
                <strong>Why?</strong> {objection.reason}
              </p>
              <p className="text-slate-600 text-xs italic font-bold">
                <strong>Next Step:</strong> {objection.nextBestStep}
              </p>
            </motion.div>
          )}

        </CardContent>

        <CardFooter className="bg-white border-t-3 border-black flex items-center justify-between py-4">
          <span className="text-xs text-slate-650 font-bold">
            Toggle to simulate carbon reduction below.
          </span>
          <label 
            className="flex items-center gap-2.5 cursor-pointer select-none"
            htmlFor={`check-${topAction.id}`}
          >
            <input
              type="checkbox"
              id={`check-${topAction.id}`}
              checked={selectedActions.includes(topAction.id)}
              onChange={() => toggleAction(topAction.id)}
              className="h-5 w-5 rounded border-2 border-black text-[#00CC66] focus:ring-black bg-white outline-none cursor-pointer"
            />
            <span className="text-xs font-black text-slate-900">Include in simulation</span>
          </label>
        </CardFooter>
      </Card>

      <Card id="habit-simulator-card">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg font-black text-slate-950 flex items-center gap-2">
              Habit Simulator
            </CardTitle>
            <CardDescription>
              Select and apply actions to see how your footprint improves.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetSimulator}
            className="h-8 px-2 text-slate-600 hover:text-slate-900 border-none shadow-none active:translate-x-0 active:translate-y-0"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border-2 border-black p-4 rounded-2xl text-center shadow-[3px_3px_0px_0px_#000000]">
              <span className="text-[9px] text-slate-500 font-black block uppercase mb-1">New Footprint</span>
              <span className="text-2xl font-black text-slate-950">{simulation.newFootprint}</span>
              <span className="text-[9px] text-slate-650 block font-bold mt-0.5">kg CO₂/mo</span>
            </div>
            <div className="bg-white border-2 border-black p-4 rounded-2xl text-center shadow-[3px_3px_0px_0px_#000000]">
              <span className="text-[9px] text-slate-500 font-black block uppercase mb-1">Savings</span>
              <span className="text-2xl font-black text-[#00CC66]">-{simulation.monthlyReduction}</span>
              <span className="text-[9px] text-slate-650 block font-bold mt-0.5">kg CO₂/mo</span>
            </div>
            <div className="bg-white border-2 border-black p-4 rounded-2xl text-center shadow-[3px_3px_0px_0px_#000000]">
              <span className="text-[9px] text-slate-500 font-black block uppercase mb-1">Money Saved</span>
              <span className="text-2xl font-black text-[#00CC66]">${simulation.moneySaved}</span>
              <span className="text-[9px] text-slate-650 block font-bold mt-0.5">/ month</span>
            </div>
          </div>

          {/* Interactive Checklist of All Recommended Actions */}
          <div className="space-y-2 border-2 border-black p-3.5 rounded-2xl bg-white shadow-[2px_2px_0px_0px_#000000]">
            <span className="text-[10px] font-black uppercase text-slate-500 block mb-2">
              Action Plan Customizer
            </span>
            <div className="h-56 overflow-y-auto pr-1 space-y-2 text-xs divide-y-2 divide-slate-100 scrollbar-thin">
              {rankedActions.map((action) => {
                const isSelected = selectedActions.includes(action.id);
                return (
                  <div 
                    key={action.id} 
                    onClick={() => toggleAction(action.id)}
                    className={`flex items-center justify-between py-2 px-2.5 rounded-lg cursor-pointer transition-all hover:bg-slate-50 ${
                      isSelected ? 'bg-emerald-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <input
                        type="checkbox"
                        id={`checklist-${action.id}`}
                        checked={isSelected}
                        onChange={() => {}} // toggled by div click
                        className="h-4.5 w-4.5 rounded border-2 border-black text-[#00CC66] focus:ring-black bg-white cursor-pointer"
                      />
                      <div className="min-w-0">
                        <span className="font-extrabold text-slate-900 block truncate">
                          {action.title}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">
                          Effort: {action.effort} • Cost: {action.cost}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-[#00CC66] shrink-0">
                      -{action.baseCarbonSavings} kg/mo
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-black text-slate-800">
                <span>Original Footprint</span>
                <span>{simulation.originalFootprint} kg CO₂</span>
              </div>
              <Progress value={100} barClassName="bg-slate-400" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-black text-slate-800">
                <span>Improved Footprint</span>
                <span className="text-[#00CC66]">{simulation.newFootprint} kg CO₂ (-{simulation.monthlyReduction} kg)</span>
              </div>
              <Progress 
                value={Math.max(15, Math.round((simulation.newFootprint / footprint.monthlyTotal) * 100))} 
                barClassName="bg-[#00CC66]" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-3 border-black">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black text-slate-950 flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-[#00CC66]" />
            Algorithmic Explainability
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-750 font-semibold space-y-3 leading-relaxed">
          <p>
            Climbit does not use AI for core math, scores, or rankings. All outputs are computed using transparent, deterministic formulas. Learn more details in the{' '}
            <Link href="/insights" className="text-emerald-600 underline hover:text-[#00CC66] font-black outline-none focus-visible:ring-1 focus-visible:ring-black rounded-sm">
              Explainability Panel
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
