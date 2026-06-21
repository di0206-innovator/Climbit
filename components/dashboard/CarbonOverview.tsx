import React from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, Info, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useClimbitStore } from '../../lib/store';
import { motion } from 'framer-motion';
import Button from '../ui/button';

const FootprintChart = dynamic(() => import('../FootprintChart'), {
  ssr: false,
  loading: () => <div className="h-[260px] w-full flex items-center justify-center text-slate-700 text-sm font-bold">Loading footprint chart...</div>
});

export default function CarbonOverview() {
  const footprint = useClimbitStore((state) => state.footprint);
  const profileSummary = useClimbitStore((state) => state.profileSummary);
  const rankedActions = useClimbitStore((state) => state.rankedActions);
  const simulation = useClimbitStore((state) => state.simulation);
  const challenge = useClimbitStore((state) => state.challenge);

  if (!footprint) return null;

  // Build sharing parameters
  const shareParams = new URLSearchParams({
    persona: profileSummary?.personaTitle || footprint.personaTitle || 'Eco-Conscious Voyager',
    topAction: rankedActions[0]?.title || '',
    savings: (simulation?.monthlyReduction || rankedActions[0]?.baseCarbonSavings || 0).toString(),
    badge: challenge?.badge || 'Eco-Runner',
    grade: footprint.carbonGrade,
    gradeColor: footprint.carbonGradeColor
  }).toString();

  // Carbon Grade Ring math
  const maxFootprintValue = 1000;
  const percentage = Math.min(100, Math.round((footprint.monthlyTotal / maxFootprintValue) * 100));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-[#E8F8F0] to-white border-3 border-black shadow-[4px_4px_0px_0px_#000000]">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <CardHeader className="pb-2 relative flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardDescription className="text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
              Estimated Footprint
            </CardDescription>
            <CardTitle className="text-4xl md:text-5xl font-black text-slate-950 flex items-baseline gap-1.5 mt-1">
              {footprint.monthlyTotal}
              <span className="text-xs font-bold text-slate-700 tracking-normal">kg CO₂ / month</span>
            </CardTitle>
          </div>

          {/* Animated SVG Grade Ring */}
          <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
            <svg className="h-full w-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-slate-200"
                strokeWidth="6"
                fill="transparent"
              />
              <motion.circle
                cx="40"
                cy="40"
                r={radius}
                stroke={footprint.carbonGradeColor}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-black text-slate-950 leading-none">{footprint.carbonGrade}</span>
              <span className="text-[7px] font-black text-slate-500 tracking-wide uppercase leading-none mt-0.5">Grade</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border-2 border-black shadow-[2px_2px_0px_0px_#000000] space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-[#FFD53D] fill-[#FFD53D]/25 stroke-[2]" />
              <span className="text-xs font-black text-slate-950 uppercase tracking-wide">
                Persona: {profileSummary ? profileSummary.personaTitle : (footprint.personaTitle || 'Loading...')}
              </span>
            </div>
            <p className="text-xs text-slate-750 font-semibold leading-relaxed">
              {profileSummary ? profileSummary.personaSummary : (footprint.personaSummary || 'Analyzing your footprint...')}
            </p>
          </div>

          {/* Share climate trading card CTA */}
          <Button 
            href={`/share?${shareParams}`} 
            variant="primary" 
            size="sm" 
            id="go-share-btn"
            className="w-full mt-2 flex items-center justify-center gap-1.5 border-2 border-black"
            aria-label="Share your carbon footprint results"
          >
            <Share2 className="h-4 w-4" />
            Share Climate Trading Card
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-[#FFFDF5] border-3 border-black shadow-[4px_4px_0px_0px_#000000]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-black text-slate-950 flex items-center gap-2">
            Climate Report Card
          </CardTitle>
          <CardDescription>
            Detailed breakdown of grades by lifestyle category.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {footprint.categoryGrades.map((cg) => (
            <div key={cg.name} className="flex items-center justify-between border-2 border-black p-2.5 bg-white shadow-[2px_2px_0px_0px_#000000] rounded-xl gap-3 hover:-translate-y-0.5 transition-transform">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-slate-950 uppercase tracking-wide">{cg.label}</span>
                  <span className="text-[10px] text-slate-500 font-bold">({cg.value} kg/mo)</span>
                </div>
                <p className="text-[10px] text-slate-700 leading-normal font-semibold truncate md:whitespace-normal">
                  {cg.description}
                </p>
              </div>
              <div 
                className="h-8 w-8 border-2 border-black rounded-lg flex items-center justify-center font-black text-xs text-slate-950 shrink-0 shadow-[1px_1px_0px_0px_#000000]"
                style={{ backgroundColor: cg.color }}
              >
                {cg.grade}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-black text-slate-950 flex items-center gap-2">
            Emission Breakdown
          </CardTitle>
          <CardDescription>
            Visualizing which lifestyle habits drive the highest emissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <FootprintChart categories={footprint.categories} />
        </CardContent>
      </Card>

      <Card className="bg-[#FFFDF5] border-3 border-black shadow-[4px_4px_0px_0px_#000000]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-black text-slate-950">
            Your Global Impact
          </CardTitle>
          <CardDescription>
            Emissions in everyday equivalent terms.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 pt-2">
          {footprint.equivalences.map((eq) => (
            <div key={eq.label} className="flex items-center gap-3 border-2 border-black p-3 rounded-xl bg-white shadow-[2px_2px_0px_0px_#000000]">
              <div className="text-2xl h-10 w-10 flex items-center justify-center rounded-lg border-2 border-black shrink-0" style={{ backgroundColor: eq.color }}>
                {eq.icon}
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-black block uppercase tracking-wider">{eq.label}</span>
                <span className="text-sm font-black text-slate-950">{eq.value} {eq.unit}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {profileSummary && (
        <Card className="bg-[#FFF0F5] border-3 border-black shadow-[4px_4px_0px_0px_#000000]">
          <CardHeader className="pb-2 flex flex-row items-center gap-2.5 space-y-0">
            <div className="h-8 w-8 rounded-lg bg-[#FF5A60] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000000]">
              <Info className="h-4.5 w-4.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black text-slate-950">Top Opportunity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-800 font-bold leading-relaxed italic">
              &ldquo;{profileSummary.topOpportunity}&rdquo;
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
