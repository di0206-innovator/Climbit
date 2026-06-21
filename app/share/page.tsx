'use client';

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Download, Copy, Check, ArrowLeft, Share2 } from 'lucide-react';
import Button from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { getShareCaptionAction } from '../actions/ai';
import type { ShareCaption } from '../../lib/gemini';
import { OnboardingAnswers } from '../../types';
import { onboardingSchema } from '../../lib/validation/schemas';

function ShareCardContent() {
  const searchParams = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  const [shareData, setShareData] = useState<ShareCaption | null>(null);

  // Read search parameters with sensible defaults
  const persona = searchParams.get('persona') || 'Eco-Conscious Voyager';
  const topAction = searchParams.get('topAction') || 'Optimise daily habits';
  const savings = searchParams.get('savings') || '120';
  const badge = searchParams.get('badge') || 'Eco-Runner';
  const grade = searchParams.get('grade') || 'B';
  const gradeColor = searchParams.get('gradeColor') || '#FFD53D';

  useEffect(() => {
    const rawAnswers = localStorage.getItem('climbit_answers');
    if (rawAnswers) {
      try {
        const parsedAnswers = JSON.parse(rawAnswers);
        const validation = onboardingSchema.safeParse(parsedAnswers);
        if (!validation.success) {
          console.error('Invalid onboarding answers on share page:', validation.error);
          return;
        }
        const validatedAnswers = validation.data as OnboardingAnswers;
        getShareCaptionAction(validatedAnswers, persona, topAction)
          .then(setShareData)
          .catch(console.error);
      } catch (e) {
        console.error('Failed to parse answers for share caption', e);
      }
    }
  }, [persona, topAction]);

  const displayCaption = shareData 
    ? `${shareData.caption}\n\n${shareData.hashtags.join(' ')}` 
    : 'Generating optimized caption...';

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(displayCaption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy caption', err);
    }
  };

  const downloadPng = () => {
    setDownloading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630; // standard LinkedIn OG ratio (1.91:1)
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setDownloading(false);
      return;
    }

    // 1. Draw beautiful cream background
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(0, 0, 1200, 630);

    // 2. Draw subtle dots grid pattern
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let x = 12; x < 1200; x += 24) {
      for (let y = 12; y < 630; y += 24) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Draw solid black shadow card frame offset
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(100 + 8, 80 + 8, 1000, 470, 24);
    ctx.fill();

    // Draw white card body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(100, 80, 1000, 470, 24);
    ctx.fill();

    // Draw card border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(100, 80, 1000, 470, 24);
    ctx.stroke();

    // 4. Logo mark & Name
    ctx.fillStyle = '#00CC66';
    ctx.beginPath();
    ctx.arc(170, 150, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(170, 150, 20, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#000000';
    ctx.font = '900 32px var(--font-geist-sans), sans-serif';
    ctx.fillText('Climbit', 210, 160);

    // Brand subtitle
    ctx.fillStyle = '#4b5563'; // gray-600
    ctx.font = '800 14px var(--font-geist-sans), sans-serif';
    ctx.fillText('DECISION ENGINE', 340, 157);

    // 5. Draw Badge tag
    ctx.fillStyle = '#FFD53D';
    ctx.beginPath();
    ctx.roundRect(850, 125, 170, 38, 19);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(850, 125, 170, 38, 19);
    ctx.stroke();
    
    ctx.fillStyle = '#000000';
    ctx.font = '900 13px var(--font-geist-sans), sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badge.toUpperCase(), 935, 149);
    ctx.textAlign = 'left'; // reset

    // 6. Draw Persona
    ctx.fillStyle = '#4b5563'; // gray-600
    ctx.font = '800 16px var(--font-geist-sans), sans-serif';
    ctx.fillText('MY CLIMATE PERSONA', 170, 240);

    ctx.fillStyle = '#000000';
    ctx.font = '900 48px var(--font-geist-sans), sans-serif';
    ctx.fillText(persona, 170, 295);

    // 7. Draw Top Action
    ctx.fillStyle = '#4b5563'; // gray-600
    ctx.font = '800 16px var(--font-geist-sans), sans-serif';
    ctx.fillText('MY BEST NEXT ACTION', 170, 370);

    ctx.fillStyle = '#00CC66';
    ctx.font = '900 30px var(--font-geist-sans), sans-serif';
    ctx.fillText(topAction, 170, 420);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeText(topAction, 170, 420);

    // 8. Draw Savings
    ctx.fillStyle = '#4b5563'; // gray-600
    ctx.font = '800 16px var(--font-geist-sans), sans-serif';
    ctx.fillText('ESTIMATED IMPACT REDUCTION', 170, 485);

    ctx.fillStyle = '#000000';
    ctx.font = '950 24px var(--font-geist-sans), sans-serif';
    ctx.fillText(`-${savings} kg CO₂ / month`, 490, 485);

    // Draw Carbon Grade stamp on canvas
    ctx.save();
    ctx.translate(900, 320);
    ctx.rotate(6 * Math.PI / 180);
    ctx.fillStyle = gradeColor;
    ctx.beginPath();
    ctx.roundRect(-80, -35, 160, 70, 12);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-80, -35, 160, 70, 12);
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = '900 22px var(--font-geist-sans), sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GRADE', 0, -5);
    ctx.font = '950 26px var(--font-geist-sans), sans-serif';
    ctx.fillText(grade, 0, 22);
    ctx.restore();

    // URL tag at bottom right
    ctx.fillStyle = '#000000';
    ctx.font = '900 16px var(--font-geist-sans), sans-serif';
    ctx.fillText('climbit.vercel.app', 850, 500);

    // Save/trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `climbit-${persona.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = dataUrl;
    link.click();
    
    setDownloading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8 items-start">
      
      {/* LEFT: Visual Card Preview */}
      <div className="flex-1 w-full space-y-4">
        <div className="text-sm font-black text-slate-800">
          Visual Preview (Optimised for LinkedIn screenshotting)
        </div>
        
        {/* Shareable Card Box */}
        <div 
          ref={cardRef}
          className="w-full aspect-[1.91/1] rounded-3xl p-8 relative flex flex-col justify-between overflow-hidden border-3 border-black shadow-[6px_6px_0px_0px_#000000] bg-[#FFFDF5]"
          style={{ contentVisibility: 'auto' }}
          id="share-card-container"
        >
          {/* Subtle dot pattern inside card */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          
          <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#00CC66] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#000000]">
                  <Leaf className="h-4 w-4 text-slate-950 stroke-[2.5]" />
                </div>
                <span className="text-base font-black text-slate-950 tracking-tight">
                  Climbit
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Carbon Grade Stamp Badge */}
                <div 
                  className="border-2 border-black font-black uppercase text-center px-2.5 py-0.5 rotate-[6deg] shadow-[1.5px_1.5px_0px_0px_#000000] text-[10px]"
                  style={{ backgroundColor: gradeColor }}
                >
                  Grade {grade}
                </div>
                <span className="px-3.5 py-1 rounded-full bg-[#FFD53D] text-slate-950 border-2 border-black text-[9px] font-black uppercase tracking-widest shadow-[1.5px_1.5px_0px_0px_#000000]">
                  {badge}
                </span>
              </div>
          </div>

          <div className="space-y-4 relative z-10 my-auto">
            <div>
              <span className="text-[10px] text-slate-650 font-black tracking-wider uppercase block">
                My Climate Persona
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight mt-0.5">
                {persona}
              </h2>
            </div>

            <div>
              <span className="text-[10px] text-slate-655 font-black tracking-wider uppercase block">
                My Best Next Action
              </span>
              <h3 className="text-lg md:text-xl font-black text-[#00CC66] tracking-tight mt-0.5" style={{ WebkitTextStroke: '1px black' }}>
                {topAction}
              </h3>
            </div>
          </div>

          <div className="flex justify-between items-center relative z-10 border-t-2 border-black pt-4">
            <div>
              <span className="text-[9px] text-slate-500 font-black block uppercase">Est. Reduction</span>
              <span className="text-xs font-black text-slate-850">-{savings} kg CO₂ / month</span>
            </div>
            <span className="text-[10px] font-black text-slate-950">climbit.vercel.app</span>
          </div>
        </div>

        {/* Action button */}
        <Button 
          variant="secondary" 
          onClick={downloadPng} 
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2"
          id="download-png-btn"
        >
          <Download className="h-4 w-4" />
          {downloading ? 'Generating PNG...' : 'Download Card Image (PNG)'}
        </Button>
      </div>

      {/* RIGHT: Captions & Links */}
      <div className="w-full md:w-80 space-y-6">
        <Card id="share-info-card">
          <CardHeader>
            <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
              <Share2 className="h-4.5 w-4.5 text-[#00CC66]" />
              Share on LinkedIn
            </CardTitle>
            <CardDescription>
              Upload the downloaded image and paste this caption to share your commitment.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Caption Text Box */}
            <div className="relative">
              <textarea
                readOnly
                value={displayCaption}
                className="w-full h-40 bg-white border-2 border-black rounded-xl p-3.5 text-xs text-slate-900 font-mono resize-none focus:outline-none focus:border-black"
                id="share-caption-textarea"
              />
              <button
                onClick={copyCaption}
                className="absolute top-2.5 right-2.5 p-2 rounded-lg bg-white border-2 border-black hover:bg-slate-50 text-slate-900 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-black"
                title="Copy caption"
                id="copy-caption-btn"
                disabled={!shareData}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            
            <p className="text-[11px] text-slate-600 font-bold leading-normal">
              Sharing raises awareness and encourages colleagues to benchmark their carbon footprint.
            </p>
          </CardContent>
        </Card>

        {/* Back navigation */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-black text-slate-700 hover:text-emerald-600 transition-colors focus-visible:ring-3 focus-visible:ring-black rounded-lg p-1 outline-none">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <div className="flex flex-col min-h-screen neo-grid text-slate-950 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b-3 border-black px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 focus-visible:ring-3 focus-visible:ring-black rounded-lg p-1 outline-none">
          <span className="text-xl font-black tracking-tight text-slate-950">Climbit</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center py-8">
        <div className="max-w-4xl mx-auto w-full px-4 mb-4">
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">Your Shareable Impact Card</h1>
          <p className="text-slate-700 text-sm font-semibold mt-1">Export your results and inspire others to take high-ROI climate action.</p>
        </div>

        <Suspense fallback={
          <div className="w-full max-w-4xl mx-auto px-4 mt-8 flex justify-center text-slate-700 font-bold">
            <span>Loading card data...</span>
          </div>
        }>
          <ShareCardContent />
        </Suspense>
      </main>
    </div>
  );
}
