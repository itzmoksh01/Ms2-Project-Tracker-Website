/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Project, DailyProgress, ProjectStage } from '../types';

// Helper to determine stage color
const getStageColor = (stage: ProjectStage) => {
  switch (stage) {
    case 'Early Stage':
      return '#38bdf8'; // Subtle blue/cyan
    case 'In Progress':
      return '#818cf8'; // Purple/indigo
    case 'Final Stage':
      return '#fbbf24'; // Amber/gold
    case 'Complete':
      return '#34d399'; // Emerald/success
  }
};

interface CompareChartProps {
  projects: Project[];
}

export function CompletionProgressCompareChart({ projects }: CompareChartProps) {
  if (!projects.length) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-neutral-500 font-mono">
        NO ACTIVE PORTFOLIO ASSIGNMENTS LOCATED
      </div>
    );
  }

  return (
    <div className="space-y-4" id="expected-vs-actual-chart">
      {projects.map((proj) => {
        const actual = proj.currentCompletionPercent;
        const expected = proj.expectedProgressPercent;
        const health = proj.healthStatus;

        // Health Status Theme
        let healthColor = 'text-[#67b2b6] border-[#67b2b6]/20 bg-[#67b2b6]/5';
        if (health === 'Excellent') healthColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
        if (health === 'On Track') healthColor = 'text-[#67b2b6] border-[#67b2b6]/20 bg-[#67b2b6]/5';
        if (health === 'Slight Delay') healthColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
        if (health === 'High Risk' || health === 'Critical') healthColor = 'text-rose-400 border-rose-500/20 bg-rose-500/5';

        return (
          <div 
            key={proj.projectId} 
            className="p-3.5 rounded-xl bg-black/30 border border-white/[0.03] shadow-md hover:border-white/[0.08] transition-all space-y-3" 
            id={`comparison-${proj.projectId}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-white tracking-tight font-display">{proj.projectName}</span>
                <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">{proj.projectCode}</span>
              </div>
              
              <div className="flex flex-col items-end space-y-1">
                <span className={`px-2 py-0.5 rounded border text-[9px] font-mono font-medium ${healthColor}`}>
                  {health}
                </span>
              </div>
            </div>

            {/* Premium Progress Bar Wrapper */}
            <div className="space-y-1.5">
              <div className="relative h-2.5 w-full rounded-full bg-neutral-950 overflow-hidden border border-white/5 shadow-inner">
                {/* Expected progress limit backdrop */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#FFA089]/5 to-[#FFA089]/20 border-r-2 border-[#FFA089] z-10 transition-all duration-700 ease-out"
                  style={{ width: `${expected}%` }}
                  title={`Expected: ${expected}%`}
                />

                {/* Actual completed progress */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#67b2b6] to-[#4fa0a4] rounded-full shadow-[0_0_12px_rgba(103,178,182,0.6)] transition-all duration-700 ease-out"
                  style={{ width: `${actual}%` }}
                  title={`Actual: ${actual}%`}
                />
              </div>

              {/* Progress Labels with custom formatting */}
              <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                <span className="flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFA089]" />
                  <span>Target: <strong className="text-white font-semibold">{expected}%</strong></span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#67b2b6] animate-pulse" />
                  <span>Current Actual: <strong className="text-[#67b2b6] font-bold">{actual}%</strong></span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface StageDistributionProps {
  projects: Project[];
}

export function StageDistributionChart({ projects }: StageDistributionProps) {
  const counts: Record<ProjectStage, number> = {
    'Early Stage': 0,
    'In Progress': 0,
    'Final Stage': 0,
    'Complete': 0
  };

  projects.forEach((p) => {
    if (counts[p.currentStage] !== undefined) {
      counts[p.currentStage]++;
    }
  });

  const total = projects.length || 1;
  const stages: { label: ProjectStage; count: number; percentage: number; color: string }[] = [
    { label: 'Early Stage', count: counts['Early Stage'], percentage: (counts['Early Stage'] / total) * 100, color: '#38bdf8' },
    { label: 'In Progress', count: counts['In Progress'], percentage: (counts['In Progress'] / total) * 100, color: '#818cf8' },
    { label: 'Final Stage', count: counts['Final Stage'], percentage: (counts['Final Stage'] / total) * 100, color: '#f59e0b' },
    { label: 'Complete', count: counts['Complete'], percentage: (counts['Complete'] / total) * 100, color: '#10b981' }
  ];

  return (
    <div className="p-4 rounded-xl bg-black/20 border border-white/[0.02] space-y-4" id="stage-distribution-grid">
      {/* Horizontal horizontal segment bar */}
      <div className="flex h-3 w-full rounded-full bg-neutral-950 overflow-hidden border border-white/5 p-0.5">
        {stages.map((stg) => {
          if (stg.count === 0) return null;
          return (
            <div
              key={stg.label}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-700"
              style={{
                width: `${stg.percentage}%`,
                backgroundColor: stg.color,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 0 10px ${stg.color}33`
              }}
              title={`${stg.label}: ${stg.count} project(s) (${Math.round(stg.percentage)}%)`}
            />
          );
        })}
      </div>

      {/* Grid distribution keys */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {stages.map((stg) => (
          <div key={stg.label} className="p-2.5 rounded-lg bg-black/40 border border-white/[0.02] hover:border-white/5 transition-all flex items-center space-x-2.5" id={`legend-${stg.label}`}>
            <span className="h-3 w-1.5 rounded-full shrink-0" style={{ backgroundColor: stg.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 font-medium text-[11px] truncate">{stg.label}</span>
                <span className="font-mono text-white text-[11px] font-bold ml-2">{stg.count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { CalendarHeatmap3D } from './CalendarHeatmap3D';

interface ConsistencyProps {
  progressList: DailyProgress[];
  daysCount?: number;
}

export function ConsistencyHeatmap({ progressList, daysCount = 28 }: ConsistencyProps) {
  return (
    <div className="p-4 rounded-3xl bg-black/40 border border-white/[0.04] space-y-3.5 shadow-xl relative" id="consistency-calendar-heatmap">
      <CalendarHeatmap3D progressList={progressList} daysCount={daysCount} />
    </div>
  );
}
