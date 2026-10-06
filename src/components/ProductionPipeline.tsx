/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Project, ProjectStage, User } from '../types';
import { Calendar, Layers, Clock, ShieldAlert, BadgeHelp, CheckCircle2 } from 'lucide-react';

interface ProductionPipelineProps {
  projects: Project[];
  allEmployees?: User[];
  onProjectClick?: (project: Project) => void;
  themeMode?: 'dark' | 'light';
}

const STAGES: ProjectStage[] = ['Early Stage', 'In Progress', 'Final Stage', 'Complete'];

export function ProductionPipeline({
  projects,
  allEmployees = [],
  onProjectClick,
  themeMode = 'dark'
}: ProductionPipelineProps) {
  const isLight = themeMode === 'light';

  // Group projects by Stage
  const groupedProjects = STAGES.reduce((acc, stage) => {
    acc[stage] = projects.filter(p => p.currentStage === stage);
    return acc;
  }, {} as Record<ProjectStage, Project[]>);

  const getStageHeaderStyle = (stage: ProjectStage) => {
    switch (stage) {
      case 'Early Stage':
        return 'border-sky-500/20 text-sky-400 bg-sky-500/5';
      case 'In Progress':
        return 'border-[#67b2b6]/20 text-[#67b2b6] bg-[#67b2b6]/5';
      case 'Final Stage':
        return 'border-amber-500/20 text-amber-400 bg-amber-500/5';
      case 'Complete':
        return 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5';
    }
  };

  const getHealthBadgeStyle = (health: string) => {
    switch (health) {
      case 'Excellent':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'On Track':
        return 'text-[#67b2b6] bg-[#67b2b6]/10 border-[#67b2b6]/20';
      case 'Slight Delay':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'High Risk':
      case 'Critical':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20';
    }
  };

  return (
    <div className="space-y-4" id="ms2-pipeline-system">
      <div>
        <h3 className={`text-md font-bold font-display ${isLight ? 'text-stone-900' : 'text-white'}`}>MS2 Production Pipeline View</h3>
        <p className="text-xs text-neutral-400 mt-1">Cinematic studio operations columns sorted by direct production completion.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start" id="pipeline-stages-grid">
        {STAGES.map(stage => {
          const stageProjects = groupedProjects[stage] || [];

          return (
            <div
              key={stage}
              className={`rounded-2xl border p-4 flex flex-col min-h-[300px] ${
                isLight ? 'bg-stone-50 border-stone-200' : 'bg-[#0a0e17]/60 border-white/[0.04]'
              }`}
              id={`pipeline-column-${stage.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {/* Column Header */}
              <div className={`p-2.5 rounded-xl border text-[11px] font-mono font-bold flex items-center justify-between uppercase tracking-wider mb-4 ${getStageHeaderStyle(stage)}`}>
                <div className="flex items-center space-x-2">
                  <Layers size={12} />
                  <span>{stage}</span>
                </div>
                <span className="h-5 px-1.5 flex items-center justify-center rounded-lg bg-black/25 text-white">
                  {stageProjects.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto" id={`pipeline-list-${stage.replace(/\s+/g, '-').toLowerCase()}`}>
                {stageProjects.length === 0 ? (
                  <div className="h-24 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl text-[10px] text-neutral-500 font-mono">
                    <Clock size={14} className="mb-1 opacity-55" />
                    <span>VACANT SLOT</span>
                  </div>
                ) : (
                  stageProjects.map(proj => {
                    // Match assigned employees
                    const matchedAssigned = allEmployees.filter(emp =>
                      proj.assignedEmployeeIds.includes(emp.uid)
                    );

                    return (
                      <div
                        key={proj.projectId}
                        onClick={() => onProjectClick?.(proj)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isLight 
                            ? 'bg-white border-stone-200 hover:border-[#67b2b6] shadow-sm' 
                            : 'bg-black/40 border-white/[0.03] hover:border-white/10 hover:scale-[1.02]'
                        }`}
                        id={`pipeline-card-${proj.projectId}`}
                        title="Click to view details"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={`text-[11px] font-bold font-display ${isLight ? 'text-stone-900' : 'text-white'}`}>
                            {proj.projectName}
                          </span>
                        </div>

                        {/* Progress slider bar representation */}
                        <div className="space-y-1 mb-2.5">
                          <div className="flex justify-between items-center text-[9px] font-mono text-neutral-400">
                            <span>Completion</span>
                            <span className="font-bold text-white">{proj.currentCompletionPercent}%</span>
                          </div>
                          <div className="h-1 w-full bg-neutral-950 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#67b2b6] rounded-full"
                              style={{ width: `${proj.currentCompletionPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Assigned Employees */}
                        <div className="flex items-center gap-1 flex-wrap mb-2.5" id={`assigned-employees-avatars-${proj.projectId}`}>
                          {matchedAssigned.length === 0 ? (
                            <span className="text-[9px] font-mono text-neutral-500 italic">Unassigned</span>
                          ) : (
                            matchedAssigned.map(emp => (
                              <span
                                key={emp.uid}
                                className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-neutral-300"
                                title={emp.fullName}
                              >
                                {emp.fullName.split(' ')[0]}
                              </span>
                            ))
                          )}
                        </div>

                        {/* Back data info */}
                        <div className="pt-2 border-t border-white/[0.03] flex items-center justify-between text-[9px] font-mono">
                          <span className="text-neutral-500 flex items-center space-x-1">
                            <Calendar size={10} />
                            <span>{proj.deadline.split('-').slice(1).join('/')}</span>
                          </span>
                          <span className={`px-1.5 py-0.5 rounded border ${getHealthBadgeStyle(proj.healthStatus)}`}>
                            {proj.healthStatus}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
