/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Project } from '../types';
import { Clock, AlertTriangle, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

interface DeadlineTimeline3DProps {
  project: Project;
  themeMode?: 'dark' | 'light';
}

export function DeadlineTimeline3D({ project, themeMode = 'dark' }: DeadlineTimeline3DProps) {
  const isLight = themeMode === 'light';

  const start = new Date(project.startDate);
  const end = new Date(project.deadline);
  const today = new Date('2026-06-17T12:00:00Z'); // Project reference standard anchor today

  // Time metrics calculations
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = today.getTime() - start.getTime();

  let daysRemaining = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  let timeProgress = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;
  timeProgress = Math.min(100, Math.max(0, timeProgress));

  // Gap between current completion and expected linear progress
  const expected = Math.round(project.expectedProgressPercent || timeProgress);
  const actual = Math.round(project.currentCompletionPercent);
  const progressGap = actual - expected;

  const getGapStatus = () => {
    if (progressGap >= 5) return { text: 'Ahead of Schedule', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (progressGap >= -5) return { text: 'On Track', color: 'text-[#67b2b6]', bg: 'bg-[#67b2b6]/10 border-[#67b2b6]/20' };
    if (progressGap >= -15) return { text: 'Slight Delay', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { text: 'Critical Risk Gaps', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };
  };

  const status = getGapStatus();

  return (
    <div 
      className={`p-4 rounded-2xl border ${
        isLight ? 'bg-stone-50 border-stone-200' : 'bg-black/20 border-white/[0.03]'
      } space-y-4`} 
      id={`interactive-deadline-timeline-${project.projectId}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Clock size={14} className="text-[#67b2b6]" />
          <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Cinematic Deadline Timeline</span>
        </div>
        
        {/* Progress Gap warning / okay chip */}
        <div className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold border ${status.bg} ${status.color}`}>
          {status.text} ({progressGap > 0 ? `+${progressGap}%` : `${progressGap}%`})
        </div>
      </div>

      {/* CORE TIMELINE BAR WITH 3D SPATIAL POINTERS */}
      <div className="relative pt-6 pb-2.5 px-1 select-none">
        {/* Background track timeline */}
        <div className="h-2 w-full bg-neutral-950 rounded-full relative overflow-visible border border-white/[0.02]">
          
          {/* Linear expected progress range */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-neutral-800 rounded-l-full border-r border-white/10"
            style={{ width: `${expected}%` }}
          />

          {/* Actual completed progress linear range overlay */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#67b2b6] to-[#4fa0a4] rounded-l-full shadow-[0_0_8px_rgba(103,178,182,0.35)]"
            style={{ width: `${actual}%` }}
          />

          {/* Pointer 1: Starting Indicator */}
          <div className="absolute left-0 -top-4 -translate-x-1/2 flex flex-col items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-600" />
            <span className="text-[8px] font-mono text-neutral-500 mt-1 uppercase font-bold">Start</span>
          </div>

          {/* Pointer 2: Target Expected Day (linear projection check) */}
          <div 
            className="absolute -top-5 flex flex-col items-center -translate-x-1/2 group transition-all"
            style={{ left: `${expected}%` }}
          >
            <div className="bg-amber-500/15 border border-amber-500/30 text-amber-500 px-1.5 py-0.5 rounded text-[8px] font-mono leading-none tracking-tight shadow-md group-hover:scale-105 transition-all">
              TGT {expected}%
            </div>
            <span className="h-1.5 w-0.5 bg-amber-500 mt-0.5 shadow-[0_0_4px_#f59e0b]" />
          </div>

          {/* Pointer 3: Real Actual Progress completed pointer bubble */}
          <div 
            className="absolute -bottom-6 flex flex-col items-center -translate-x-1/2 group transition-all"
            style={{ left: `${actual}%` }}
          >
            <span className="h-1.5 w-0.5 bg-[#67b2b6] mb-0.5 shadow-[0_0_5px_#67b2b6]" />
            <div className="bg-[#67b2b6]/20 border border-[#67b2b6]/40 text-[#67b2b6] px-1.5 py-0.5 rounded text-[8px] font-mono leading-none font-bold shadow-md group-hover:scale-105 transition-all">
              ACT {actual}%
            </div>
          </div>

          {/* Pointer 4: Today Pointer line */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center -translate-x-1/2 z-10"
            style={{ left: `${timeProgress}%` }}
            title={`Today progress: ${timeProgress.toFixed(0)}% duration elapsed`}
          >
            <span className="h-5 w-1 bg-rose-500 rounded-full shadow-[0_0_6px_#f43f5e] animate-pulse" />
          </div>

          {/* Pointer 5: Ending Deadline Indicator */}
          <div className="absolute right-0 -top-4 translate-x-1/2 flex flex-col items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b]" />
            <span className="text-[8px] font-mono text-neutral-500 mt-1 uppercase font-bold">DEADLINE</span>
          </div>

        </div>
      </div>

      {/* FOOTER SCALE META INFOS */}
      <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 pt-5 border-t border-white/[0.02]">
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-[9px] text-neutral-500 uppercase block font-semibold">Start Limit</span>
            <span className="text-neutral-300 font-bold">{project.startDate}</span>
          </div>
          <ChevronRight size={10} className="text-neutral-700" />
          <div>
            <span className="text-[9px] text-neutral-500 uppercase block font-semibold">Deadline Target</span>
            <span className="text-neutral-300 font-bold">{project.deadline}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] text-neutral-500 uppercase block font-semibold">Remaining Limit</span>
          <span className={`font-black font-display text-[11px] ${daysRemaining < 7 ? 'text-rose-400 font-bold animate-pulse' : 'text-white'}`}>
            {daysRemaining} Days
          </span>
        </div>
      </div>
    </div>
  );
}
