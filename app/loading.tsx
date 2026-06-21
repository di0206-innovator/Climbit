import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-slate-950 flex flex-col font-sans relative overflow-hidden items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.05)_2px,transparent_2px)] bg-[size:24px_24px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-[#9333EA] animate-spin mb-4" />
        <span className="text-sm font-black uppercase tracking-widest text-slate-800">
          Loading Environment...
        </span>
      </div>
    </div>
  );
}
