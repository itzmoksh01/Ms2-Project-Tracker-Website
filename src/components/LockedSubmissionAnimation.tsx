/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Lock, ShieldCheck, Check, Sparkles, Calendar, Layers, Activity } from 'lucide-react';

interface LockedSubmissionAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  details: {
    projectName: string;
    date: string;
    stage: string;
    percentage: number;
    timestamp: string;
  } | null;
}

export function LockedSubmissionAnimation({
  isOpen,
  onClose,
  details
}: LockedSubmissionAnimationProps) {
  const [stage, setStage] = useState<number>(0); // 0 = idle, 1 = entrance, 2 = lock closing, 3 = stamped, 4 = finished

  useEffect(() => {
    if (isOpen && details) {
      setStage(1);
      
      // Step 2: Lock Closes
      const timer1 = setTimeout(() => {
        setStage(2);
      }, 700);

      // Step 3: Stamp applied with sound pulse visual
      const timer2 = setTimeout(() => {
        setStage(3);
      }, 1500);

      // Auto close or clear after reasonable reading duration
      const timer3 = setTimeout(() => {
        setStage(4);
      }, 4200);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setStage(0);
    }
  }, [isOpen, details]);

  if (!isOpen || !details) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-[#04060a]/95 backdrop-blur-lg flex items-center justify-center p-4">
      {/* Dynamic ambient glowing backing */}
      <div className="absolute top-[30%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/10 blur-[130px]" />
      <div className="absolute bottom-[30%] right-[30%] w-[35vw] h-[35vw] rounded-full bg-[#67b2b6]/10 blur-[130px]" />

      <div className="w-full max-w-md bg-gradient-to-b from-[#0e131f] to-[#06080d] border border-white/10 rounded-3xl p-6 shadow-2.5xl text-center space-y-6 relative overflow-hidden glass-panel-heavy">
        
        {/* UPPER STATUS LOGO HEADER */}
        <div className="space-y-1.5 z-10 relative">
          <span className="text-[9px] font-mono text-[#67b2b6] tracking-widest font-black uppercase flex items-center justify-center space-x-1">
            <Sparkles size={10} className="text-[#67b2b6] animate-pulse" />
            <span>STUDIO LOG VERIFICATION LOGIC</span>
          </span>
          <h2 className="text-md font-black text-white font-display uppercase tracking-wide">SECURE COGNITIVE DEPLOYED</h2>
        </div>

        {/* 3D FLOATING LOCK VISUAL AREA */}
        <div className="h-32 flex items-center justify-center relative">
          {/* Pulsing ring visual */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`h-24 w-24 rounded-full border border-[#67b2b6]/20 transition-all duration-1000 ${
              stage >= 2 ? 'scale-[1.15] opacity-0' : 'scale-50 opacity-100'
            }`} />
            <span className={`h-16 w-16 rounded-full bg-emerald-500/5 border border-emerald-500/20 transition-all duration-1000 ${
              stage >= 3 ? 'scale-[1.3] opacity-0' : 'scale-70 opacity-100'
            }`} />
          </div>

          <div className="relative z-10 transition-all duration-700">
            {stage === 1 ? (
              // Open lock state
              <div className="animate-bounce">
                <span className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center transform -rotate-12 transition-all">
                  <Lock size={30} className="text-[#ffa089]" />
                </span>
              </div>
            ) : stage === 2 ? (
              // Closing anim phase
              <div className="scale-110 duration-200">
                <span className="h-20 w-20 bg-[#67b2b6]/20 border-2 border-[#67b2b6] rounded-2xl flex items-center justify-center shadow-[0_0_24px_rgba(103,178,182,0.4)]">
                  <Lock size={36} className="text-white animate-pulse" />
                </span>
              </div>
            ) : (
              // Secure Stamped Lock Finished
              <div className="scale-100 transition-all ease-out duration-300">
                <span className="h-20 w-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                  <ShieldCheck size={36} className="text-white" />
                </span>
              </div>
            )}
          </div>

          {/* LARGE RED STAMP LAYER */}
          <div 
            className={`absolute z-30 transform rotate-12 transition-all duration-500 ${
              stage >= 3 
                ? 'scale-100 rotate-[-12deg] opacity-100' 
                : 'scale-[2.5] opacity-0'
            }`}
          >
            <div className="px-5 py-1.5 border-4 border-emerald-500 text-emerald-500 font-mono font-black text-xs tracking-widest rounded-xl bg-neutral-950/90 shadow-2xl flex items-center space-x-1.5 uppercase select-none">
              <Check size={12} className="stroke-[4px]" />
              <span>COMMITMENT LOCKED</span>
            </div>
          </div>
        </div>

        {/* DELIVERABLE SLATE DESCRIPTION */}
        <div className="bg-black/40 border border-white/5 p-4 rounded-2xl text-left space-y-2.5 z-10 relative">
          <div className="border-b border-white/5 pb-2 text-center">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-semibold">Active Ledger Details</span>
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] font-mono">
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">Project Item</span>
              <span className="text-white font-bold block truncate">{details.projectName}</span>
            </div>
            
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">Schedule Date</span>
              <span className="text-white font-bold block">{details.date}</span>
            </div>

            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">Target Stage</span>
              <span className="text-white font-bold block">{details.stage}</span>
            </div>

            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">Completion Percent</span>
              <span className="text-[#67b2b6] font-bold block">{details.percentage}%</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.03] flex items-center justify-between text-[8px] font-mono text-neutral-500">
            <span>TIMESTAMP: {details.timestamp}</span>
            <span className="text-emerald-400 font-bold uppercase">TRANSACTION LOCKED</span>
          </div>
        </div>

        {/* SUB-TEXT MESSAGE */}
        <div className="space-y-1 z-10 relative">
          <p className="text-xs text-neutral-300 font-sans tracking-wide">
            Your progress report has been securely synchronized with central operations databases.
          </p>
          <span className="text-[10px] font-mono text-amber-500 uppercase block font-semibold tracking-wide">
            🔐 ASSET IS LOCKED CONFORMS AND PREVENTS RETROACTIVE CHANGES
          </span>
        </div>

        {/* ACTION FINISH DISMISS CONTAINER */}
        <button
          onClick={onClose}
          className="w-full bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white font-mono font-bold py-2 px-3 rounded-xl text-[10px] tracking-wide transition-all cursor-pointer select-none"
        >
          DISMISS TRANSACTION LOG
        </button>

      </div>
    </div>
  );
}
