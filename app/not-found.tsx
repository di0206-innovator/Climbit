import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] text-slate-950 flex flex-col font-sans relative overflow-hidden items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.05)_2px,transparent_2px)] bg-[size:24px_24px] pointer-events-none" />
      
      <div className="max-w-md w-full bg-white border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_#000000] relative z-10 text-center">
        <div className="w-20 h-20 bg-[#9333EA] rounded-2xl border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_#000000] rotate-[6deg]">
          <Compass className="h-10 w-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">404</h1>
        <p className="text-sm font-semibold text-slate-600 mb-8">
          This path doesn&apos;t exist. You&apos;ve wandered off the trail.
        </p>

        <Link href="/" className="w-full bg-[#00CC66] hover:bg-[#00E673] text-black border-3 border-black py-4 px-6 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0px_0px_#000000]">
          <ArrowLeft className="h-5 w-5" />
          Back to Safety
        </Link>
      </div>
    </div>
  );
}
