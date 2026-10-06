/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DailyProgress, Project, User } from '../types';
import { Lock, FileText, Check, AlertCircle, AlertTriangle, Calendar, Star, X, Info } from 'lucide-react';
import { store } from '../services/store';

interface CalendarHeatmap3DProps {
  progressList: DailyProgress[];
  daysCount?: number;
  projects?: Project[];
  employees?: User[];
  viewMode?: 'admin' | 'employee';
}

export function CalendarHeatmap3D({
  progressList,
  daysCount = 28,
  projects = [],
  employees = [],
  viewMode
}: CalendarHeatmap3DProps) {
  const [selectedDay, setSelectedDay] = useState<any | null>(null);

  // In case projects/employees aren't passed, fetch them from the store securely
  const activeProjects = projects.length > 0 ? projects : store.getProjects();
  const activeEmployees = employees.length > 0 ? employees : store.getUsers();

  // Inferred viewMode if not passed directly
  let savedUser: any = null;
  try {
    const saved = localStorage.getItem('ms2_active_session');
    if (saved) savedUser = JSON.parse(saved);
  } catch (e) {}

  const computedMode = viewMode || (savedUser?.role === 'admin' ? 'admin' : 'employee');
  const currentUserUid = savedUser?.uid;

  // Generate sequence of dates ending today (June 17, 2026)
  const items = Array.from({ length: daysCount }).map((_, i) => {
    const d = new Date('2026-06-17T12:00:00Z');
    d.setDate(d.getDate() - (daysCount - 1 - i));
    const dateStr = d.toISOString().split('T')[0];

    // Submissions for this date
    const dayProgress = progressList.filter(p => p.date === dateStr);
    const hasSubmitted = dayProgress.length > 0;
    
    // Check locked submissions (specifically for employees own logs)
    const hasLocked = dayProgress.some(p => p.isLocked);

    // Filter project deadlines matching this day
    const matchingDeadlines = activeProjects.filter(p => p.deadline === dateStr && p.status !== 'Archived');
    // Completed projects matching this day
    const matchingCompleted = activeProjects.filter(p => p.deadline === dateStr && p.currentStage === 'Complete');

    // Missing submissions checker for admin
    const missingEmployees: User[] = [];
    if (computedMode === 'admin' && hasSubmitted) {
      // Find employees who did NOT submit today
      const submitters = new Set(dayProgress.map(p => p.employeeUid));
      activeEmployees.forEach(emp => {
        if (emp.role !== 'admin' && emp.status === 'active' && !submitters.has(emp.uid)) {
          missingEmployees.push(emp);
        }
      });
    }

    return {
      date: dateStr,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      submissions: dayProgress,
      hasSubmitted,
      hasLocked,
      deadlines: matchingDeadlines,
      completedProjects: matchingCompleted,
      missingEmployees,
      isToday: dateStr === '2026-06-17'
    };
  });

  return (
    <div className="space-y-4 font-sans" id="calendar-heatmap-3d">
      <div className="grid grid-cols-7 gap-2.5 justify-items-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, ix) => (
          <span key={ix} className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-widest mb-1.5">
            {day}
          </span>
        ))}

        {items.map((item, idx) => {
          let bgStyle = 'bg-neutral-950/80 border-white/[0.03] text-neutral-500 hover:border-white/15 hover:bg-neutral-900';
          let glowColor = '';
          const hasDeadlines = item.deadlines.length > 0;
          const isCompleted = item.completedProjects.length > 0;

          // Compute color and glow based on stages & health
          if (item.hasSubmitted) {
            const hasCritical = item.submissions.some(s => s.healthStatus === 'Critical' || s.healthStatus === 'High Risk');
            const hasComplete = item.submissions.some(s => s.selectedStage === 'Complete');

            if (hasCritical) {
              bgStyle = 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-bold hover:bg-rose-500/25';
              glowColor = 'rgba(244, 63, 94, 0.4)';
            } else if (hasComplete) {
              bgStyle = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold hover:bg-emerald-500/25';
              glowColor = 'rgba(16, 185, 129, 0.4)';
            } else {
              bgStyle = 'bg-[#67b2b6]/15 border-[#67b2b6]/40 text-[#67b2b6] font-bold hover:bg-[#67b2b6]/25';
              glowColor = 'rgba(103, 178, 182, 0.4)';
            }
          }

          // Special deadlines markers overwrites
          const hasGoldDeadline = hasDeadlines && !isCompleted;

          return (
            <div
              key={idx}
              onClick={() => setSelectedDay(item)}
              className={`h-11 w-11 rounded-xl border flex flex-col items-center justify-center relative cursor-pointer tracking-wider text-[11px] font-mono transition-all duration-300 hover:scale-110 active:scale-95 ${bgStyle}`}
              style={{
                boxShadow: glowColor ? `0 0 14px ${glowColor}, inset 0 0 10px ${glowColor}` : 'none'
              }}
              id={`calendar-tile-${item.date}`}
            >
              {/* Day label */}
              <span className={item.hasSubmitted ? 'text-white' : 'text-neutral-500 font-medium'}>
                {item.dayNum}
              </span>

              {/* FLOATING INDICATORS OVERLAYS */}
              
              {/* 1. Gold deadlines marker */}
              {hasGoldDeadline && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-amber-500 rounded-full border-2 border-[#06080d] animate-pulse shadow-[0_0_8px_#f59e0b]" title="Project Deadline" />
              )}

              {/* 2. Green completion marker */}
              {isCompleted && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-[#06080d] shadow-[0_0_8px_#10b981]" title="Project Finished" />
              )}

              {/* 3. Missing update indicator (Admin only) with a tiny red warning dot */}
              {computedMode === 'admin' && !item.hasSubmitted && (
                <span className="absolute -bottom-1 h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping" />
              )}

              {/* 4. Locked log check icon for employees */}
              {computedMode === 'employee' && item.hasLocked && (
                <span className="absolute bottom-1 text-[8px] text-white/50">
                  <Lock size={8} />
                </span>
              )}

              {/* 5. Today pending animated pulse */}
              {computedMode === 'employee' && item.isToday && !item.hasSubmitted && (
                <span className="absolute inset-0 border border-cyan-500 rounded-xl animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* DETAIL DRAWER / POP-UP ENTRY OVERLAY */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-[#0e131f] to-[#06080d] border border-white/10 rounded-3xl p-6 shadow-2.5xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2.5">
                <Calendar className="text-[#67b2b6] h-5 w-5" />
                <div className="text-left font-display">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-black block">Log Report Detail</span>
                  <span className="text-sm font-bold text-white">{selectedDay.date}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1 px-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X size={12} />
              </button>
            </div>

            {/* DETAIL ITEMS CONTENT */}
            <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1 scrollbar-thin">
              
              {/* Render submitted logs */}
              {selectedDay.submissions.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono font-bold tracking-widest text-[#67b2b6] uppercase">Workflow Updates ({selectedDay.submissions.length})</h4>
                  {selectedDay.submissions.map((sub: DailyProgress, idx: number) => (
                    <div key={idx} className="p-3 bg-black/40 border border-white/5 rounded-2xl space-y-2 relative">
                      {sub.isLocked && (
                        <div className="absolute right-3 top-3 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center space-x-1.5">
                          <Lock size={9} />
                          <span>LOCKED</span>
                        </div>
                      )}
                      
                      <div className="text-left">
                        <span className="text-[10px] font-bold text-white block">{sub.employeeName}</span>
                        <span className="text-[9px] font-mono text-neutral-400 block mt-0.5">{sub.projectName} • {sub.selectedStage}</span>
                      </div>

                      <p className="text-[11px] text-neutral-300 leading-relaxed bg-[#06080d]/60 p-2 rounded-lg font-sans">
                        {sub.workSummary}
                      </p>

                      {sub.notes && (
                        <div className="text-[10px] text-neutral-400 italic bg-amber-500/5 px-2 py-1 borders border-l-2 border-[#ffa089]">
                          Notes: {sub.notes}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1">
                        <span>Submitted: {new Date(sub.submittedAt).toLocaleTimeString()}</span>
                        <span className="font-bold text-[#67b2b6]">Completion: {sub.autoCompletionPercent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border border-dashed border-white/5 rounded-2xl text-center flex flex-col items-center justify-center space-y-2">
                  <Info className="h-5 w-5 text-neutral-600 animate-pulse" />
                  <span className="text-[11px] font-bold text-neutral-400 block font-display">No progress entries submitted</span>
                </div>
              )}

              {/* Render matching deadlines */}
              {selectedDay.deadlines.length > 0 && (
                <div className="space-y-2.5 pt-3 border-t border-white/5">
                  <h4 className="text-[10px] font-mono font-bold tracking-widest text-amber-500 uppercase">Impending Deadlines ({selectedDay.deadlines.length})</h4>
                  {selectedDay.deadlines.map((p: Project) => (
                    <div key={p.projectId} className="p-3 bg-amber-500/5 border border-amber-500/25 rounded-2xl flex items-center justify-between text-left">
                      <div>
                        <span className="text-[11px] font-bold text-amber-300 block">{p.projectName}</span>
                        <span className="text-[9px] font-mono text-neutral-400 block mt-0.5">Code: {p.projectCode} • Stage: {p.currentStage}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        {p.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Render missing logs check for admin */}
              {computedMode === 'admin' && selectedDay.missingEmployees.length > 0 && (
                <div className="space-y-2.5 pt-3 border-t border-white/5 text-left">
                  <h4 className="text-[10px] font-mono font-black tracking-widest text-[#ffa089] uppercase">Missing Daily Logs ({selectedDay.missingEmployees.length})</h4>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {selectedDay.missingEmployees.map((emp: User) => (
                      <div key={emp.uid} className="bg-rose-500/5 border border-rose-500/15 p-2 rounded-xl flex items-center justify-between">
                        <span className="text-neutral-300 font-medium truncate pr-1">{emp.fullName}</span>
                        <span className="text-[9px] text-rose-400 shrink-0 font-mono font-semibold">{emp.employeeId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="w-full bg-[#67b2b6] hover:bg-[#4fa0a4] text-neutral-900 font-extrabold py-2.5 rounded-xl text-xs tracking-wider transition-all"
            >
              CLOSE PREVIEW
            </button>
          </div>
        </div>
      )}

      {/* HEATMAP LEGEND COLOR KEYS */}
      <div className="flex flex-wrap items-center justify-end gap-x-3.5 gap-y-1.5 text-[9px] text-neutral-500 font-mono pt-3 border-t border-white/[0.03]">
        <span className="flex items-center space-x-1.5">
          <span className="h-2.5 w-2.5 rounded bg-neutral-950 border border-white/[0.02]" />
          <span>Rest / Idle</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="h-2.5 w-2.5 rounded bg-[#67b2b6]/15 border border-[#67b2b6]/40 shadow-[0_0_6px_rgba(103,178,182,0.2)]" />
          <span>Post Log</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="h-2.5 w-2.5 rounded bg-emerald-500/15 border border-emerald-500/40 shadow-[0_0_6px_rgba(16,185,129,0.2)]" />
          <span>Stage Complete</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="h-2.5 w-2.5 rounded bg-amber-500/15 border border-amber-500/40 shadow-[0_0_6px_rgba(245,158,11,0.2)]" />
          <span>Project Deadline</span>
        </span>
      </div>
    </div>
  );
}
