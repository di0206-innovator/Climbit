'use client';

import { useEffect } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to an error reporting service like Sentry or Crashlytics
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-slate-950 flex flex-col font-sans relative overflow-hidden items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.05)_2px,transparent_2px)] bg-[size:24px_24px] pointer-events-none" />
      
      <div className="max-w-md w-full bg-white border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_#000000] relative z-10 text-center">
        <div className="w-20 h-20 bg-[#FF5A60] rounded-2xl border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_#000000] rotate-[-6deg]">
          <AlertOctagon className="h-10 w-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">System Error</h1>
        <p className="text-sm font-semibold text-slate-600 mb-8">
          The environment just threw an exception. We&apos;ve logged the error, but let&apos;s try getting you back on track.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => reset()}
            className="w-full bg-[#FFD53D] hover:bg-[#FFE066] text-black border-3 border-black py-4 px-6 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0px_0px_#000000]"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>
          
          <Link href="/" className="w-full bg-white hover:bg-slate-50 text-black border-3 border-black py-4 px-6 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0px_0px_#000000]">
            <Home className="h-5 w-5" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
