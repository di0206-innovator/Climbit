'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Download, RotateCcw } from 'lucide-react';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';
import Button from './ui/button';
import { useClimbitStore } from '../lib/store';

export default function Header() {
  const pathname = usePathname();
  const onboardingStep = useClimbitStore((state) => state.onboardingStep);

  const handleExportData = () => {
    const rawAnswers = localStorage.getItem('climbit_answers');
    if (!rawAnswers) return;
    const blob = new Blob([rawAnswers], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'climbit-my-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-3 border-black px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-[0_3px_0_0_#000000] transition-all">
      {/* Brand Logo */}
      <Link 
        href="/" 
        aria-label="Climbit Home" 
        className="flex items-center gap-2 group focus-visible:ring-3 focus-visible:ring-black rounded-lg p-1 outline-none"
      >
        <div className="h-8 w-8 rounded-xl bg-[#00CC66] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#000000] group-hover:scale-105 transition-transform">
          <Leaf className="h-4.5 w-4.5 text-slate-950 stroke-[2.5]" />
        </div>
        <span className="text-lg font-black tracking-tight text-slate-950 group-hover:text-[#00CC66] transition-colors">
          Climbit
        </span>
      </Link>

      {/* Center Navigation Links (Hidden on Onboarding Quiz) */}
      {pathname !== '/onboarding' && (
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          <Link 
            href="/dashboard" 
            className={`text-xs font-black tracking-wide uppercase hover:text-[#00CC66] transition-colors focus-visible:ring-2 focus-visible:ring-black rounded px-1.5 py-0.5 outline-none ${
              pathname === '/dashboard' ? 'text-[#00CC66]' : 'text-slate-700'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            href="/insights" 
            className={`text-xs font-black tracking-wide uppercase hover:text-[#00CC66] transition-colors focus-visible:ring-2 focus-visible:ring-black rounded px-1.5 py-0.5 outline-none ${
              pathname === '/insights' ? 'text-[#00CC66]' : 'text-slate-700'
            }`}
          >
            Methodology
          </Link>
        </nav>
      )}

      {/* Right Page Controls & Authentication */}
      <div className="flex items-center gap-3">
        {/* Dashboard Actions */}
        {pathname === '/dashboard' && (
          <div className="flex items-center gap-2">
            {/* Export (Icon on mobile, text on desktop) */}
            <Button 
              onClick={handleExportData} 
              variant="outline" 
              size="sm" 
              className="h-8.5 px-3 border-2" 
              title="Export Local Data to JSON"
              aria-label="Export Local Data to JSON"
            >
              <Download className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            {/* Retake */}
            <Button 
              href="/onboarding" 
              variant="outline" 
              size="sm" 
              className="h-8.5 px-3 border-2" 
              title="Retake Onboarding Quiz"
              aria-label="Retake Onboarding Quiz"
            >
              <RotateCcw className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Retake</span>
            </Button>
          </div>
        )}

        {pathname === '/onboarding' && (
          <span className="text-xs font-black text-slate-750 bg-white border-2 border-black px-3 py-1.5 rounded-full shadow-[1.5px_1.5px_0px_0px_#000000]">
            Question {onboardingStep + 1} of 8
          </span>
        )}

        {/* Share Page Action */}
        {pathname === '/share' && (
          <Button href="/dashboard" variant="outline" size="sm" className="h-8.5 px-3 border-2">
            Dashboard
          </Button>
        )}

        {/* Insights Page Action */}
        {pathname === '/insights' && (
          <Button href="/dashboard" variant="outline" size="sm" className="h-8.5 px-3 border-2">
            Dashboard
          </Button>
        )}

        {/* Clerk Sign In / Sign Up buttons styled in custom neo-brutalist theme */}
        <div className="flex items-center bg-white border-2 border-black h-8.5 px-3.5 rounded-xl shadow-[1.5px_1.5px_0px_0px_#000000]">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-xs font-black text-slate-950 hover:text-[#00CC66] transition-colors outline-none">
                Log In
              </button>
            </SignInButton>
            <span className="text-slate-350 mx-2 text-xs font-bold">|</span>
            <SignUpButton mode="modal">
              <button className="text-xs font-black text-[#00CC66] hover:text-[#00E572] transition-colors outline-none">
                Register
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton appearance={{ elements: { avatarBox: "h-5.5 w-5.5 border-1.5 border-black rounded-full" } }} />
          </Show>
        </div>
      </div>
    </header>
  );
}
