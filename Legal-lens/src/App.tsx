/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  ShieldAlert, 
  PhoneCall, 
  ChevronRight, 
  RotateCcw, 
  Globe, 
  Scale,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { useStore, Language } from './store';
import { getLegalAdvice } from './services/legalService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LANGUAGES: Language[] = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];

export default function App() {
  const { 
    language, 
    setLanguage, 
    isRecording, 
    isProcessing, 
    result, 
    startRecording, 
    stopRecording, 
    setResult, 
    reset 
  } = useStore();

  const [showLangSelector, setShowLangSelector] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API for simulation
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleProcess(text);
      };

      recognitionRef.current.onend = () => {
        if (isRecording) stopRecording();
      };
    }
  }, [isRecording]);

  const handlePanicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      stopRecording();
    } else {
      setTranscript('');
      startRecording();
      try {
        recognitionRef.current?.start();
      } catch (e) {
        // Fallback for demo if speech recognition fails/not supported
        setTimeout(() => {
          const mockQuery = "The police are detaining me without a warrant.";
          setTranscript(mockQuery);
          handleProcess(mockQuery);
        }, 3000);
      }
    }
  };

  const handleProcess = async (query: string) => {
    stopRecording();
    const advice = await getLegalAdvice(query, language);
    if (advice) {
      setResult(advice);
    } else {
      // Fallback mock for offline/error
      setResult({
        rights: [
          "Right to know grounds of arrest (Section 50, CrPC 1973)",
          "Right to consult a lawyer (Section 41D, CrPC 1973)",
          "Right to be produced before Magistrate within 24 hours (Section 57, CrPC 1973)"
        ],
        scriptedPhrase: "Officer, under Section 50 of CrPC, I have the right to know the exact grounds for my detention. Please show me the warrant or state the offense.",
        section: "Section 50, CrPC 1973"
      });
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-slate-50 flex flex-col relative overflow-hidden shadow-2xl">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-legal-red p-1.5 rounded-lg">
            <Scale className="text-white w-5 h-5" />
          </div>
          <h1 className="font-display font-bold text-xl tracking-tight text-legal-dark">LegalLens</h1>
        </div>
        <button 
          onClick={() => setShowLangSelector(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          <Globe className="w-4 h-4" />
          {language}
        </button>
      </header>

      <main className="flex-1 flex flex-col p-6 overflow-y-auto pb-32">
        <AnimatePresence mode="wait">
          {!result && !isProcessing && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-legal-dark">Emergency Co-pilot</h2>
                <p className="text-slate-500 max-w-[280px] mx-auto">
                  Press the button and speak your situation. We'll give you your rights instantly.
                </p>
              </div>

              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePanicClick}
                  className={cn(
                    "w-48 h-48 rounded-full flex flex-col items-center justify-center gap-3 transition-all duration-500 z-10 relative",
                    isRecording ? "bg-legal-red text-white" : "bg-white border-4 border-legal-red text-legal-red panic-button-glow"
                  )}
                >
                  {isRecording ? (
                    <div className="flex flex-col items-center">
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3].map(i => (
                          <motion.div
                            key={i}
                            animate={{ height: [8, 24, 8] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                            className="w-1.5 bg-white rounded-full"
                          />
                        ))}
                      </div>
                      <span className="font-bold text-lg">Listening...</span>
                    </div>
                  ) : (
                    <>
                      <Mic className="w-12 h-12" />
                      <span className="font-bold text-xl uppercase tracking-wider">Panic Button</span>
                    </>
                  )}
                </motion.button>
                
                {isRecording && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0.2 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-legal-red rounded-full -z-10"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 w-full pt-8">
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-2">
                  <ShieldAlert className="text-amber-500 w-6 h-6" />
                  <span className="text-xs font-semibold text-slate-600">Police Detention</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-2">
                  <AlertTriangle className="text-rose-500 w-6 h-6" />
                  <span className="text-xs font-semibold text-slate-600">Domestic Crisis</span>
                </div>
              </div>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center space-y-6"
            >
              <div className="w-16 h-16 border-4 border-legal-blue/20 border-t-legal-blue rounded-full animate-spin" />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-legal-dark">Analyzing Situation</h3>
                <p className="text-slate-500 italic">"{transcript || 'Identifying legal sections...'}"</p>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Rights Identified
                </div>
                <button 
                  onClick={reset}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-display font-bold text-legal-dark leading-tight">
                  Your Rights under {result.section}
                </h3>
                
                <div className="space-y-3">
                  {result.rights.map((right, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 bg-white rounded-xl border-l-4 border-legal-blue shadow-sm"
                    >
                      <p className="text-slate-700 font-medium leading-relaxed">{right}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-legal-dark rounded-2xl text-white space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-legal-red">
                  <Mic className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Say This:</span>
                </div>
                <p className="text-lg font-medium leading-snug italic">
                  "{result.scriptedPhrase}"
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 bg-legal-red text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 shadow-xl"
              >
                <PhoneCall className="w-6 h-6" />
                Call Legal Aid Lawyer
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Language Selector Modal */}
      <AnimatePresence>
        {showLangSelector && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full bg-white rounded-t-[32px] p-8 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-legal-dark">Select Language</h3>
                <button onClick={() => setShowLangSelector(false)} className="p-2 bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setShowLangSelector(false);
                    }}
                    className={cn(
                      "py-4 rounded-2xl font-semibold transition-all",
                      language === lang 
                        ? "bg-legal-blue text-white shadow-lg shadow-legal-blue/20" 
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav Simulation */}
      {!result && !isRecording && (
        <nav className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-around items-center z-10">
          <div className="flex flex-col items-center gap-1 text-legal-blue">
            <ShieldAlert className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Panic</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <Scale className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Laws</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <PhoneCall className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Helpline</span>
          </div>
        </nav>
      )}
    </div>
  );
}
