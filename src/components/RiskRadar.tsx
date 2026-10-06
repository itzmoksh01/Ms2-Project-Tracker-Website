/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Project, ProjectHealth, ProjectStage } from '../types';
import { ShieldAlert, Play, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export type RiskLevel = 'Safe' | 'Watch' | 'Slight Delay' | 'High Risk' | 'Critical';

export function calculateProjectRisk(project: Project): RiskLevel {
  const actual = project.currentCompletionPercent;
  const expected = project.expectedProgressPercent;
  const diff = actual - expected;

  // Days remaining
  const deadlineTime = new Date(project.deadline).getTime();
  const todayTime = new Date('2026-06-17').getTime();
  const daysLeft = Math.ceil((deadlineTime - todayTime) / (1000 * 60 * 60 * 24));

  if (project.status === 'Completed') return 'Safe';

  let risk: RiskLevel = 'Safe';

  if (diff < -30 || project.healthStatus === 'Critical') {
    risk = 'Critical';
  } else if (diff < -15 || project.healthStatus === 'High Risk' || (daysLeft <= 3 && actual < 80)) {
    risk = 'High Risk';
  } else if (diff < -5 || project.healthStatus === 'Slight Delay') {
    risk = 'Slight Delay';
  } else if (diff < 5 || daysLeft <= 7) {
    risk = 'Watch';
  } else {
    risk = 'Safe';
  }

  // Elevate risk for Critical priority projects slightly
  if (project.priority === 'Critical' && risk === 'Safe') {
    risk = 'Watch';
  } else if (project.priority === 'Critical' && risk === 'Watch') {
    risk = 'Slight Delay';
  }

  return risk;
}

interface RiskRadarProps {
  projects: Project[];
  themeMode?: 'dark' | 'light';
}

export function RiskRadar({ projects, themeMode = 'dark' }: RiskRadarProps) {
  const isLight = themeMode === 'light';

  const categorized = projects.map(p => ({
    project: p,
    riskLevel: calculateProjectRisk(p),
  }));

  const counts = {
    Critical: categorized.filter(x => x.riskLevel === 'Critical').length,
    'High Risk': categorized.filter(x => x.riskLevel === 'High Risk').length,
    'Slight Delay': categorized.filter(x => x.riskLevel === 'Slight Delay').length,
    Watch: categorized.filter(x => x.riskLevel === 'Watch').length,
    Safe: categorized.filter(x => x.riskLevel === 'Safe').length,
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'Critical':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
      case 'High Risk':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'Slight Delay':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'Watch':
        return 'text-[#67b2b6] bg-[#67b2b6]/10 border-[#67b2b6]/30';
      case 'Safe':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'Critical':
        return <ShieldAlert size={14} className="text-rose-500" />;
      case 'High Risk':
        return <AlertTriangle size={14} className="text-orange-500" />;
      case 'Slight Delay':
        return <AlertTriangle size={14} className="text-yellow-500" />;
      case 'Watch':
        return <Play size={14} className="text-[#67b2b6] rotate-90" />;
      case 'Safe':
        return <ShieldCheck size={14} className="text-emerald-500" />;
    }
  };

  return (
    <div className={`p-4 md:p-6 rounded-2xl border ${isLight ? 'bg-amber-50/40 border-[#67b2b6]/20' : 'bg-black/40 border-white/[0.04]'}`} id="risk-radar-card">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className={`text-md font-bold font-display ${isLight ? 'text-stone-900' : 'text-white'}`}>Smart Project Risk Radar</h3>
          <p className="text-xs text-neutral-400 mt-1">Algorithmic risk evaluation mapping progress constraints and studio deadlines.</p>
        </div>
        
        {/* Risk Badges */}
        <div className="flex flex-wrap gap-2 text-[10px] font-mono">
          {Object.entries(counts).map(([level, count]) => (
            <span
              key={level}
              className={`px-2.5 py-1 rounded-full border flex items-center space-x-1.5 font-bold ${getRiskColor(level as RiskLevel)}`}
            >
              <span>{level}:</span>
              <strong className={isLight ? 'text-stone-900' : 'text-white'}>{count}</strong>
            </span>
          ))}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500 font-mono">
          NO DIRECTIVE PROJECTS CAPTURED FOR RISK RUNTIME
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="risk-radar-grid">
          {categorized.map(({ project, riskLevel }) => {
            const actual = project.currentCompletionPercent;
            const expected = project.expectedProgressPercent;
            const diff = actual - expected;

            const deadlineTime = new Date(project.deadline).getTime();
            const todayTime = new Date('2026-06-17').getTime();
            const daysLeft = Math.ceil((deadlineTime - todayTime) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={project.projectId}
                className={`p-4 rounded-xl border transition-all hover:scale-[1.01] ${
                  isLight 
                    ? 'bg-white border-stone-200 shadow-sm hover:border-[#67b2b6]/40' 
                    : 'bg-black/30 border-white/[0.03] hover:border-white/10'
                }`}
                id={`risk-project-${project.projectId}`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h4 className={`text-xs font-bold font-display truncate ${isLight ? 'text-stone-900' : 'text-white'}`}>
                      {project.projectName}
                    </h4>
                    <span className="text-[10px] font-mono text-neutral-500 tracking-wider">
                      {project.projectCode}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-mono font-bold flex items-center space-x-1 uppercase ${getRiskColor(riskLevel)}`}>
                    {getRiskIcon(riskLevel)}
                    <span>{riskLevel}</span>
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400 line-clamp-2 min-h-[32px] mt-1.5 leading-relaxed">
                  {project.description}
                </p>

                <div className="mt-4 pt-3.5 border-t border-white/5 space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-neutral-500">Days Left</span>
                    <span className={`font-semibold ${daysLeft <= 3 ? 'text-rose-500 font-bold' : isLight ? 'text-stone-900' : 'text-white'}`}>
                      {daysLeft} days
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-neutral-500">Progress Gap</span>
                    <span className={`font-bold ${diff < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {diff > 0 ? `+${diff}% Ahead` : `${diff}% Delayed`}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500">
                      <span>Progression (Act vs Exp)</span>
                      <span>{actual}% / {expected}%</span>
                    </div>
                    {/* Tiny visual progress bar matching theme */}
                    <div className="h-1.5 w-full rounded bg-neutral-950 overflow-hidden relative border border-white/5">
                      <div
                        className="absolute h-full left-0 bg-[#FFA089]/30"
                        style={{ width: `${expected}%` }}
                      />
                      <div
                        className="absolute h-full left-0 bg-[#67b2b6]"
                        style={{ width: `${actual}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
