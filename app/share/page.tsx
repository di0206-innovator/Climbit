'use client';

import React, { Suspense, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Download, Copy, Check, ArrowLeft, Share2 } from 'lucide-react';
import Button from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

function ShareCardContent() {
  const searchParams = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Read search parameters with sensible defaults
  const persona = searchParams.get('persona') || 'Eco-Conscious Voyager';
  const topAction = searchParams.get('topAction') || 'Optimise daily habits';
  const savings = searchParams.get('savings') || '120';
  const badge = searchParams.get('badge') || 'Eco-Runner';

  // Construct caption text for social sharing
  const shareCaption = `I just calculated my carbon footprint on Climbit! My climate persona is "${persona}", and my single best next action is to "${topAction}" (saving ${savings} kg CO₂ / month!). Check your carbon footprint and get ranked actions at Climbit! #sustainability #climateaction #climbit`;

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(shareCaption);
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

    // 1. Draw beautiful dark background gradient
    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(1, '#0e172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);

    // 2. Draw soft green glowing circle in bottom left
    const glowGrad = ctx.createRadialGradient(200, 450, 50, 200, 450, 400);
    glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
    glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(200, 450, 400, 0, Math.PI * 2);
    ctx.fill();

    // 3. Draw glassmorphism card frame
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 40;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.beginPath();
    ctx.roundRect(100, 80, 1000, 470, 24);
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Card border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(100, 80, 1000, 470, 24);
    ctx.stroke();

    // 4. Logo mark & Name
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(170, 150, 20, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px var(--font-geist-sans), sans-serif';
    ctx.fillText('Climbit', 210, 160);

    // Brand subtitle
    ctx.fillStyle = '#64748b';
    ctx.font = '500 16px var(--font-geist-sans), sans-serif';
    ctx.fillText('DECISION ENGINE', 340, 157);

    // 5. Draw Badge tag
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.beginPath();
    ctx.roundRect(880, 130, 140, 36, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.stroke();
    
    ctx.fillStyle = '#34d399';
    ctx.font = '800 13px var(--font-geist-sans), sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badge.toUpperCase(), 950, 153);
    ctx.textAlign = 'left'; // reset

    // 6. Draw Persona
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 18px var(--font-geist-sans), sans-serif';
    ctx.fillText('MY CLIMATE PERSONA', 170, 240);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px var(--font-geist-sans), sans-serif';
    ctx.fillText(persona, 170, 295);

    // 7. Draw Top Action
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 18px var(--font-geist-sans), sans-serif';
    ctx.fillText('MY BEST NEXT ACTION', 170, 370);

    ctx.fillStyle = '#34d399';
    ctx.font = '800 30px var(--font-geist-sans), sans-serif';
    ctx.fillText(topAction, 170, 420);

    // 8. Draw Savings
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 18px var(--font-geist-sans), sans-serif';
    ctx.fillText('ESTIMATED IMPACT REDUCTION', 170, 485);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 24px var(--font-geist-sans), sans-serif';
    ctx.fillText(`-${savings} kg CO₂ / month`, 490, 485);

    // URL tag at bottom right
    ctx.fillStyle = '#475569';
    ctx.font = '600 16px var(--font-geist-sans), sans-serif';
    ctx.fillText('climbit.vercel.app', 870, 500);

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
        <div className="text-sm font-semibold text-slate-400">
          Visual Preview (Optimised for LinkedIn screenshotting)
        </div>
        
        {/* Shareable Card Box */}
        <div 
          ref={cardRef}
          className="w-full aspect-[1.91/1] rounded-3xl p-8 relative flex flex-col justify-between overflow-hidden border border-slate-800 shadow-2xl bg-gradient-to-br from-slate-950 to-[#0e172a]"
          style={{ contentVisibility: 'auto' }}
          id="share-card-container"
        >
          {/* Decorative Glows */}
          <div className="absolute bottom-[-100px] left-[-100px] h-[300px] w-[300px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Leaf className="h-4 w-4 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">
                Climbit
              </span>
            </div>
            
            <span className="px-3 py-1 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold uppercase tracking-widest">
              {badge}
            </span>
          </div>

          <div className="space-y-4 relative z-10 my-auto">
            <div>
              <span className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase block">
                My Climate Persona
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-0.5">
                {persona}
              </h2>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase block">
                My Best Next Action
              </span>
              <h3 className="text-lg md:text-xl font-bold text-emerald-400 tracking-tight mt-0.5">
                {topAction}
              </h3>
            </div>
          </div>

          <div className="flex justify-between items-center relative z-10 border-t border-slate-900 pt-4">
            <div>
              <span className="text-[9px] text-slate-500 font-bold block uppercase">Est. Reduction</span>
              <span className="text-xs font-bold text-slate-300">-{savings} kg CO₂ / month</span>
            </div>
            <span className="text-[10px] font-bold text-slate-600">climbit.vercel.app</span>
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
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="h-4.5 w-4.5 text-emerald-400" />
              Share on LinkedIn
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Upload the downloaded image and paste this caption to share your commitment.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Caption Text Box */}
            <div className="relative">
              <textarea
                readOnly
                value={shareCaption}
                className="w-full h-40 bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 font-mono resize-none focus:outline-none focus:border-slate-700"
                id="share-caption-textarea"
              />
              <button
                onClick={copyCaption}
                className="absolute top-2.5 right-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                title="Copy caption"
                id="copy-caption-btn"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-normal">
              Sharing raises awareness and encourages colleagues to benchmark their carbon footprint.
            </p>
          </CardContent>
        </Card>

        {/* Back navigation */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1 outline-none">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#090d16] text-slate-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-b-slate-800/80 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1 outline-none">
          <span className="text-xl font-bold tracking-tight text-white">Climbit</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center py-8">
        <div className="max-w-4xl mx-auto w-full px-4 mb-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Shareable Impact Card</h1>
          <p className="text-slate-400 text-sm mt-1">Export your results and inspire others to take high-ROI climate action.</p>
        </div>

        <Suspense fallback={
          <div className="w-full max-w-4xl mx-auto px-4 mt-8 flex justify-center text-slate-400">
            <span>Loading card data...</span>
          </div>
        }>
          <ShareCardContent />
        </Suspense>
      </main>
    </div>
  );
}
