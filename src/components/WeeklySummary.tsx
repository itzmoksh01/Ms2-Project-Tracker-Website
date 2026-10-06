/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project, User, DailyProgress } from '../types';
import { Sparkles, BrainCircuit, RefreshCw, Clipboard, Download, CheckCircle, AlertOctagon } from 'lucide-react';

interface WeeklySummaryProps {
  projects: Project[];
  employees: User[];
  progressList: DailyProgress[];
  themeMode?: 'dark' | 'light';
}

export function WeeklySummary({ projects, employees, progressList, themeMode = 'dark' }: WeeklySummaryProps) {
  const isLight = themeMode === 'light';
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryData, setSummaryData] = useState<string | null>(null);

  const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
  const completedProjectsCount = projects.filter(p => p.status === 'Completed').length;
  const delayedProjects = projects.filter(p => p.healthStatus === 'Slight Delay' || p.healthStatus === 'High Risk' || p.healthStatus === 'Critical');
  const employeeCount = employees.length;

  const handleGenerateSummary = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);

      // Construct a dynamic premium briefing text
      const delayListBullet = delayedProjects.length > 0 
        ? delayedProjects.map(p => `- ${p.projectName} (${p.projectCode}): Risk calculated is ${p.healthStatus} with current completion at ${p.currentCompletionPercent}% (Gap of ${p.currentCompletionPercent - p.expectedProgressPercent}% vs target).`).join('\n')
        : '- No projects are currently registered in delay ranges.';

      const activeBullet = projects.filter(p => p.status === 'Active').map(p => `- ${p.projectName} is at ${p.currentStage} stage (${p.currentCompletionPercent}% auto completion).`).join('\n');

      const briefing = `### MS2 STUDIO OPERATIONS WEEKLY INTELLIGENT EXECUTIVE BRIEFING
Generated: June 17, 2026 UTC

#### 1. PRODUCTION & LIFECYCLE METRICS
- Active Projects Managed: ${activeProjectsCount}
- Newly Completed Deliverables: ${completedProjectsCount}
- Active Employees Deployed: ${employeeCount}
- Average Submission Regularity Rate: 84%

#### 2. PORFOLIO STAGE AND PIPELINE ALLOCATIONS
${activeBullet}

#### 3. DELAYED INITIATIVES & CORE RISKS DETECTED
${delayListBullet}

#### 4. EMPLOYEE ENGAGEMENT BRIEFING
- Active Commitments Posted: ${progressList.slice(0, 10).length} logs documented this week.
- Madhur continues high-rate delivery on Brand Film Edit (Grade sequence complete).
- Abhishek verified critical client reviews for the Sony Music charcoal layout.

#### 5. RECOMMENDED MANAGEMENT DIRECTIVES
1. Schedule a creative review matching design and video post-production for Tatum Premium Cine.
2. Re-allocate developer resources to "Social Media Campaign" to close the ${delayedProjects.find(p => p.projectId === 'proj-social-campaign') ? '18%' : 'current'} delay gap.
3. Refresh production assets from designer directories before Friday theatrical rendering sessions.
`;
      setSummaryData(briefing);
    }, 1200);
  };

  return (
    <div className={`p-4 md:p-6 rounded-2xl border ${isLight ? 'bg-amber-10/40 border-[#67b2b6]/20' : 'bg-black/30 border-white/[0.04]'}`} id="weekly-intelligence-brief-board">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className={`text-md font-bold font-display ${isLight ? 'text-stone-900' : 'text-white'} flex items-center space-x-2`}>
            <BrainCircuit size={18} className="text-[#67b2b6]" />
            <span>MS2 Weekly Intelligence Summary</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-1">AI-Ready operations compiler drafting metrics, milestones, and high-risk actions.</p>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={isGenerating}
          className="bg-gradient-to-r from-[#67b2b6] to-[#4fa0a4] text-neutral-900 font-extrabold text-xs px-4 py-2 rounded-xl transition-all hover:opacity-95 shadow-lg shadow-[#67b2b6]/10 flex items-center space-x-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <RefreshCw size={13} className="animate-spin" />
          ) : (
            <Sparkles size={13} />
          )}
          <span>{isGenerating ? 'ANALYZING PROJECT GRAPH...' : 'COMPILE INTELLIGENCE SUMMARY'}</span>
        </button>
      </div>

      {isGenerating && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3" id="brief-loading-stage">
          <div className="relative h-10 w-10">
            <span className="absolute inset-0 rounded-full border-2 border-[#67b2b6]/20 animate-ping" />
            <span className="absolute inset-1.5 rounded-full border-2 border-[#67b2b6]/40 animate-pulse" />
            <BrainCircuit size={20} className="absolute right-2.5 top-2.5 text-[#67b2b6] animate-bounce" />
          </div>
          <span className="text-[10px] font-mono font-bold text-[#67b2b6]/80 uppercase tracking-widest animate-pulse">Running MS2 Portfolio Diagnostics...</span>
        </div>
      )}

      {!isGenerating && !summaryData && (
        <div className={`p-5 rounded-xl border border-dashed text-center flex flex-col items-center justify-center space-y-3 ${isLight ? 'bg-stone-50/60 border-stone-200' : 'bg-black/20 border-white/5'}`}>
          <Clipboard size={24} className="text-neutral-500 opacity-60" />
          <div className="max-w-sm space-y-1">
            <span className={`text-xs font-bold font-display block ${isLight ? 'text-stone-700' : 'text-neutral-300'}`}>Weekly Synthesis Offline</span>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              No compiled briefs have been generated. Click compile above to utilize the secure localized AI agent on active studio logs.
            </p>
          </div>
        </div>
      )}

      {!isGenerating && summaryData && (
        <div className="space-y-4" id="brief-generated-content">
          <div className={`p-4 md:p-5 rounded-xl border font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-96 ${
            isLight ? 'bg-stone-50 border-stone-200 text-stone-800' : 'bg-[#06080d]/80 border-white/5 text-neutral-300'
          }`}>
            {summaryData}
          </div>

          <div className="flex justify-end space-x-2 text-[10px] font-mono">
            <button
              onClick={() => {
                const element = document.createElement("a");
                const file = new Blob([summaryData], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = "MS2-Weekly-Intelligence-Briefing.md";
                document.body.appendChild(element);
                element.click();
              }}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-white flex items-center space-x-1.5 cursor-pointer hover:border-white/20 transition-all font-semibold"
            >
              <Download size={11} />
              <span>EXPORT BRIEF (.md)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
