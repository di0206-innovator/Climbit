import React, { useRef, useEffect } from 'react';
import { Camera, UploadCloud, Mic } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useClimbitStore } from '../../lib/store';
import { extractCarbonFromImage } from '../../app/actions/vision';
import { extractCarbonFromVoice } from '../../app/actions/voice';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

// Web Speech API Types
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionEvent extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}
interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognition };
    webkitSpeechRecognition?: { new (): SpeechRecognition };
  }
}

export default function AILoggerPanel() {
  const store = useClimbitStore();
  const { isScanning, scanResult, scanError, isListening, voiceResult, voiceError } = store;
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Cleanup on unmount to prevent memory leaks if active
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    store.setVisionState({ isScanning: true, scanResult: null, scanError: null });

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
          const result = await extractCarbonFromImage(base64String, file.type);
          store.setVisionState({ scanResult: result, isScanning: false });
          confetti({ particleCount: 50, spread: 60, colors: ['#9333EA', '#00CC66'] });
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Failed to analyze image with AI.';
          store.setVisionState({ scanError: errMsg, isScanning: false });
        }
      };
      reader.readAsDataURL(file);
    } catch {
      store.setVisionState({ scanError: 'Failed to read file.', isScanning: false });
    }
  };

  const startVoiceLogging = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      store.setVoiceState({ voiceError: "Your browser doesn't support speech recognition." });
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      store.setVoiceState({ isListening: true, voiceResult: null, voiceError: null });
    };

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      store.setVoiceState({ isListening: false });
      const transcript = event.results[0][0].transcript;
      try {
        const result = await extractCarbonFromVoice(transcript);
        store.setVoiceState({ voiceResult: result });
        confetti({ particleCount: 50, spread: 60, colors: ['#9333EA', '#00CC66'] });
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Failed to analyze voice with AI.';
        store.setVoiceState({ voiceError: errMsg });
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      store.setVoiceState({ isListening: false, voiceError: `Error occurred: ${event.error}` });
    };

    recognition.start();
  };

  const currentResult = scanResult || voiceResult;
  const currentError = scanError || voiceError;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="bg-[#F3E8FF] border-3 border-black shadow-[4px_4px_0px_0px_#000000]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-black text-slate-950 flex items-center gap-2">
            <Camera className="h-5 w-5 text-[#9333EA]" />
            AI Auto-Logger
          </CardTitle>
          <CardDescription>
            Snap a photo of a bill/receipt, or just tap the mic and tell us what you did.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          {/* Self-contained micro-animations */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scannerSweep {
              0% { top: 0%; }
              50% { top: 100%; }
              100% { top: 0%; }
            }
            @keyframes soundWave {
              0%, 100% { transform: scaleY(0.4); }
              50% { transform: scaleY(1.3); }
            }
            .animate-sweep {
              animation: scannerSweep 2s linear infinite;
            }
            .wave-bar {
              animation: soundWave 1.2s ease-in-out infinite;
              transform-origin: center;
            }
          `}} />

          <div className="grid grid-cols-2 gap-3">
            <div className="relative border-2 border-dashed border-black rounded-xl p-4 bg-white text-center hover:bg-slate-50 transition-colors flex flex-col items-center justify-center overflow-hidden">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isScanning}
                aria-label="Upload image of bill or receipt"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <UploadCloud className="h-6 w-6 text-slate-400 mb-1" />
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                {isScanning ? 'Scanning...' : 'Upload Image'}
              </span>
              
              {/* Green laser scanning line */}
              {isScanning && (
                <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-[#00CC66] shadow-[0_0_8px_#00CC66] animate-sweep" />
                </div>
              )}
            </div>

            <button 
              onClick={startVoiceLogging}
              disabled={isListening}
              aria-label="Log an action with your voice"
              className={`relative overflow-hidden border-2 border-black rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center outline-none focus-visible:ring-3 focus-visible:ring-black ${isListening ? 'bg-[#FF5A60] text-white shadow-none translate-y-[2px]' : 'bg-[#FFD53D] hover:bg-[#FFE066] shadow-[2px_2px_0px_0px_#000000] text-slate-950 hover:translate-y-[-1px]'}`}
            >
              {isListening ? (
                <div className="flex flex-col items-center">
                  {/* Waveform bars */}
                  <div className="flex gap-1 items-center justify-center h-6 mb-1">
                    <div className="w-1 h-5 bg-white rounded-full wave-bar" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-5 bg-white rounded-full wave-bar" style={{ animationDelay: '0.3s' }} />
                    <div className="w-1 h-5 bg-white rounded-full wave-bar" style={{ animationDelay: '0.5s' }} />
                    <div className="w-1 h-5 bg-white rounded-full wave-bar" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Recording</span>
                </div>
              ) : (
                <>
                  <Mic className="h-6 w-6 mb-1 text-slate-950" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-950">Voice Log</span>
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {currentError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-red-100 border-2 border-red-500 rounded-xl text-red-700 text-xs font-bold overflow-hidden" 
                role="alert"
              >
                {currentError}
              </motion.div>
            )}

            {currentResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_#000000] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-500">Scan Complete</span>
                  <span className="text-[10px] font-black uppercase bg-[#00CC66] text-black px-2 py-0.5 rounded-full border border-black">
                    {Math.round(currentResult.confidence * 100)}% Match
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-950">{currentResult.category}</h4>
                  <p className="text-xs text-slate-700 font-semibold">{currentResult.extractedText}</p>
                </div>
                <div className="bg-[#FFEEDD] p-3 rounded-lg border-2 border-black flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase">Est. Footprint</span>
                  <span className="text-lg font-black text-[#FF5A60]">+{currentResult.inferredCarbonImpact} kg</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
