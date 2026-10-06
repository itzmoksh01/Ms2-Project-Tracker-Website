/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useDashboardGSAPAnimations } from '../hooks/useDashboardGSAPAnimations';
import { store, TODAY_DATE_STR } from '../services/store';
import { User, Project, DailyProgress, ProjectStage } from '../types';
import {
  Briefcase,
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  ArrowRight,
  LogOut,
  Send,
  Lock,
  Plus,
  Compass,
  Database,
  Layers3,
  ExternalLink,
  Milestone,
  Sun,
  Moon,
  Sparkles,
  Loader2
} from 'lucide-react';
import MS2Logo from './MS2Logo';
import { ConsistencyHeatmap } from './DashboardCharts';
import { NotificationDrawer } from './NotificationDrawer';
import { CinematicBackground } from './CinematicBackground';
import { CommandPalette } from './CommandPalette';
import { LockedSubmissionAnimation } from './LockedSubmissionAnimation';

interface EmployeePanelProps {
  employeeUser: User;
  onLogout: () => void;
  themeMode?: 'dark' | 'light';
  setThemeMode?: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
  studioMode?: boolean;
  setStudioMode?: (enabled: boolean) => void;
}

export default function EmployeePanel({ 
  employeeUser, 
  onLogout,
  themeMode = 'dark',
  setThemeMode,
  studioMode = true,
  setStudioMode
}: EmployeePanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  useDashboardGSAPAnimations({ containerRef, activeTab });
  const [submissionDetails, setSubmissionDetails] = useState<any | null>(null);
  const [myProjects, setMyProjects] = useState<Project[]>(store.getEmployeeProjects(employeeUser.uid));
  const [myHistory, setMyHistory] = useState<DailyProgress[]>(
    store.getDailyProgress().filter(p => p.employeeUid === employeeUser.uid)
  );

  // Submission form states
  const [selectedProjectId, setSelectedProjectId] = useState<string>(myProjects[0]?.projectId || '');
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_DATE_STR);
  const [selectedStage, setSelectedStage] = useState<ProjectStage>('In Progress');
  const [workSummary, setWorkSummary] = useState('');
  const [optionalNotes, setOptionalNotes] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshData = () => {
    setMyProjects(store.getEmployeeProjects(employeeUser.uid));
    setMyHistory(store.getDailyProgress().filter(p => p.employeeUid === employeeUser.uid));
  };

  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setMyProjects(store.getEmployeeProjects(employeeUser.uid));
      setMyHistory(store.getDailyProgress().filter(p => p.employeeUid === employeeUser.uid));
    });
    return unsubscribe;
  }, [employeeUser.uid]);

  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError('');
    setSubmitSuccess('');

    if (!selectedProjectId) {
      setSubmitError('Please configure an active assigned project to log progress.');
      return;
    }

    if (!workSummary.trim()) {
      setSubmitError('Work Summary is required and cannot be empty.');
      return;
    }

    // Validation: future dates check
    const todayNum = new Date(TODAY_DATE_STR).getTime();
    const inputNum = new Date(selectedDate).getTime();
    if (inputNum > todayNum) {
      setSubmitError('Submission of future date progress logs is forbidden by administration guidelines.');
      return;
    }

    setIsSubmitting(true);
    // Simulate real-time secure database consensus sync roundtrip to prevent double-commits
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // Attempt Submission
    const result = store.submitDailyProgress({
      employeeUid: employeeUser.uid,
      projectId: selectedProjectId,
      date: selectedDate,
      selectedStage,
      workSummary: workSummary.trim(),
      notes: optionalNotes.trim()
    });

    setIsSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error || 'Duplicate submission detected.');
      return;
    }

    setSubmitSuccess(`Your daily progress log has been successfully stored and locked into the studio database for date ${selectedDate}.`);
    
    // Set 3D Locked stamp overlay details
    const targetProj = myProjects.find(p => p.projectId === selectedProjectId);
    setSubmissionDetails({
      projectName: targetProj ? targetProj.projectName : 'Studio Project Update',
      date: selectedDate,
      stage: selectedStage,
      percentage: targetProj ? targetProj.currentCompletionPercent : 50,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Clear forms
    setWorkSummary('');
    setOptionalNotes('');
    refreshData();
  };

  // Find remaining days to project deadline
  const getRemainingDays = (deadlineStr: string) => {
    const today = new Date(TODAY_DATE_STR).getTime();
    const deadline = new Date(deadlineStr).getTime();
    if (isNaN(deadline)) return 7;
    const diff = deadline - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Check which assigned projects have not been updated today yet.
  const projectsRequiresUpdatesToday = myProjects.filter(p => 
    !myHistory.some(h => h.projectId === p.projectId && h.date === TODAY_DATE_STR)
  );

  return (
    <div ref={containerRef} className={`min-h-screen ${themeMode === 'light' ? 'bg-[#f4f5f6] text-stone-900' : 'bg-[#04060a] text-neutral-100'} flex flex-col md:flex-row font-sans command-grid relative overflow-hidden select-none`} id="employee-workspace-layout">
      
      {/* BACKGROUND CINEMATIC LIGHT PATTERNS */}
      <CinematicBackground studioMode={studioMode} />

      {/* SUCCESS SUBMISSION CINEMATIC LOCK ANIMATION */}
      <LockedSubmissionAnimation 
        isOpen={submissionDetails !== null} 
        onClose={() => setSubmissionDetails(null)} 
        details={submissionDetails} 
      />

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="w-full md:w-68 bg-[#070b12]/95 border-b md:border-b-0 md:border-r border-white/[0.04] flex flex-col shrink-0 z-20 backdrop-blur-md" id="admin-sidebar-nav">
        
        {/* UPPER BRAND SEALS */}
        <div className="p-5 border-b border-white/[0.04] flex items-center space-x-3.5 bg-black/10">
          <div className="p-1.5 bg-neutral-900 border border-white/5 rounded-xl">
            <MS2Logo className="w-8 h-auto" variant="icon" />
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-white block text-sm font-display">MS2 STUDIO DESK</span>
            <span className="text-[9px] font-mono text-[#FFA089] tracking-widest uppercase font-semibold">Team Member</span>
          </div>
        </div>

        {/* PROFILE CHIP ROW */}
        <div className="p-4 mx-4 mt-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center space-x-3 shadow-md hover:border-[#67b2b6]/20 transition-all">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#67b2b6] to-[#4fa0a4] text-neutral-950 font-black flex items-center justify-center text-sm shadow-[0_2px_10px_rgba(103,178,183,0.3)]">
            {employeeUser.fullName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-white block truncate tracking-wide">{employeeUser.fullName}</span>
            <span className="text-[9px] font-mono text-neutral-400 block truncate">{employeeUser.employeeId}</span>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 rounded-xl bg-black/40 border border-white/[0.05] text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all shadow-sm"
            title="Disconnect Profile"
            id="btn-logout"
          >
            <LogOut size={13} />
          </button>
        </div>

        {/* NAVIGATION MENUS */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-[9px] font-mono font-bold tracking-widest text-neutral-500 uppercase px-3 py-1 pb-2">
            Workspace Shell
          </div>

          {[
            { id: 'dashboard', label: 'My Studio Dashboard', icon: <Layers3 size={15} /> },
            { id: 'submit-log', label: 'Submit Daily Progress', icon: <Plus size={15} /> },
            { id: 'my-projects', label: 'Assigned Projects', icon: <Briefcase size={15} /> },
            { id: 'calendar', label: 'My Log Calendar', icon: <Calendar size={15} /> },
            { id: 'history', label: 'Work History Logs', icon: <FileText size={15} /> },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSubmitError('');
                  setSubmitSuccess('');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  isActive
                    ? 'bg-[#67b2b6]/10 text-white border-[#67b2b6]/20 shadow-[0_4px_15px_rgba(103,178,182,0.05)]'
                    : 'text-neutral-400 hover:text-neutral-200 border-transparent hover:bg-white/[0.02]'
                }`}
                id={`sidemenu-${item.id}`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? 'text-[#67b2b6]' : 'text-neutral-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#67b2b6] shadow-[0_0_8px_#67b2b6]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* METRICS COUNTDOWN FOOTER */}
        <div className="p-4 border-t border-white/[0.04] bg-black/40 text-center text-[10px] font-mono text-neutral-500 tracking-wider">
          <span className="text-[#67b2b6]/70">SESSION VERIFIED • {TODAY_DATE_STR}</span>
        </div>
      </aside>

      {/* CORE DISPLAY STAGE */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto w-full space-y-6 z-10" id="employee-main-stage">
        
        {/* UPPER GREETINGS PANEL */}
        <header className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b pb-5 p-4 rounded-2xl border ${
          themeMode === 'light' 
            ? 'bg-stone-100/50 border-stone-200' 
            : 'bg-gradient-to-b from-black/20 to-transparent border-white/[0.02]'
        }`} id="admin-header-title">
          <div>
            <span className="text-[10px] font-mono text-[#FFA089] uppercase tracking-widest font-bold">OPERATIONS REGISTRY TERMINAL</span>
            <h1 className={`text-xl md:text-2xl font-black tracking-tight flex items-center space-x-2 leading-none mt-1.5 font-display ${
              themeMode === 'light' ? 'text-stone-900' : 'text-white'
            }`}>
              <span>{employeeUser.fullName}</span>
              <span className="text-[9px] font-mono text-[#67b2b6] bg-[#67b2b6]/15 px-2.5 py-1 rounded-lg border border-[#67b2b6]/20 font-semibold tracking-wide shadow-sm">
                {employeeUser.employeeId}
              </span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1.5 font-sans">
              <span className="text-neutral-300 font-medium">{employeeUser.designation}</span> • {employeeUser.department} Team
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* QUICK COMMAND PALETTE CONTROLLER */}
            <CommandPalette 
              projects={myProjects}
              employees={[]} // employees search ignored or restricted in employee view
              progressList={myHistory}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onSelectProject={(proj) => {
                if (proj) {
                  setSelectedProjectId(proj.projectId);
                  setActiveTab('dashboard');
                }
              }}
              onSelectEmployee={() => {}}
              themeMode={themeMode}
            />

            {/* QUICK STUDIO MODE LIVE LIGHTS TOGGLER */}
            <button
              onClick={() => {
                if (setStudioMode) {
                  const flip = !studioMode;
                  setStudioMode(flip);
                  store.setStudioMode(flip);
                }
              }}
              className={`p-2 rounded-xl border cursor-pointer transition-all ${
                studioMode
                  ? 'bg-[#67b2b6]/10 border-[#67b2b6]/30 text-[#67b2b6] shadow-[0_0_8px_rgba(103,178,182,0.2)]'
                  : 'bg-white/5 border-white/5 text-neutral-500 hover:text-neutral-350 hover:bg-white/10'
              }`}
              id="header-studio-lights-toggle"
              title="Toggle Live Studio Mode (3D Motion Systems)"
            >
              <Sparkles size={14} className={studioMode ? 'animate-pulse' : ''} />
            </button>

            {/* LIGHT/DARK THEME TOGGLE */}
            <button
              onClick={() => {
                if (setThemeMode) {
                  const newTheme = themeMode === 'light' ? 'dark' : 'light';
                  setThemeMode(newTheme);
                  localStorage.setItem('ms2_theme', newTheme);
                }
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#67b2b6] border border-white/5 hover:border-white/10 transition-all cursor-pointer"
              id="theme-mode-toggle"
              title="Toggle Premium Theme"
            >
              {themeMode === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>

            {/* NOTIFICATION DRAWER FOR EMPLOYEE */}
            <NotificationDrawer currentUser={employeeUser} themeMode={themeMode} />

            <div className="flex items-center space-x-3 bg-black/40 px-4 py-2 rounded-xl border border-white/[0.04] text-xs shadow-md">
              <Clock size={14} className="text-[#FFA089] animate-pulse" />
              <span className="font-mono text-neutral-300 tracking-wider">STUDY DATE: <strong className="text-white font-bold">{TODAY_DATE_STR}</strong></span>
            </div>
          </div>
        </header>

        {/* ============================================================= */}
        {/* TABS VIEW CONTROLLERS */}
        {/* ============================================================= */}

        {/* 1. EMPLOYEE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in" id="employee-dashboard-tab">
            
            {/* PENDING NOTIFICATION BANNER */}
            {projectsRequiresUpdatesToday.length > 0 ? (
              <div className="p-4 bg-gradient-to-r from-amber-500/10 to-[#FFA089]/5 border border-amber-500/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[#FFA089]/5 shadow-lg" id="pending-work-logs-alert">
                <div className="flex items-start space-x-3.5">
                  <span className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20 shadow-inner">
                    <AlertTriangle size={20} className="animate-pulse" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">Pending Progression Logs ({projectsRequiresUpdatesToday.length})</h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5 max-w-2xl leading-relaxed">
                      Administration specifies that daily work logs are required for tracking project health. You have <strong>{projectsRequiresUpdatesToday.length} assigned projects</strong> needing logs for today (<span className="font-mono text-amber-400">{TODAY_DATE_STR}</span>).
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (projectsRequiresUpdatesToday[0]) {
                      setSelectedProjectId(projectsRequiresUpdatesToday[0].projectId);
                    }
                    setActiveTab('submit-log');
                  }}
                  className="bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center space-x-2 shrink-0 shadow-[0_4px_12px_rgba(245,158,11,0.25)] hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <span>Submit Today's Logs</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ) : (
              <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/20 rounded-2xl flex items-center space-x-3.5 shadow-md" id="all-logs-completed-note">
                <span className="h-9 w-9 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">Daily Operational Commits Secured</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    High workspace compliance detected. All records have been preserved and locked into the studio database.
                  </p>
                </div>
              </div>
            )}

            {/* TWO COLUMN GRID: My projects vs Profile consistency */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ASSIGNED PORTFOLIO PANEL */}
              <div className="lg:col-span-2 space-y-4" id="employee-dashboard-portfolio">
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-xs font-mono text-[#67b2b6] uppercase font-bold tracking-widest flex items-center space-x-2">
                    <Database size={13} />
                    <span>My Production Scopes ({myProjects.length})</span>
                  </span>
                </div>

                {myProjects.length === 0 ? (
                  <div className="p-16 text-center border border-dashed border-white/[0.05] rounded-2xl text-neutral-500 bg-black/20 text-xs font-mono">
                    No active production schedules assigned to your card at present.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myProjects.map(proj => {
                      const daysLeft = getRemainingDays(proj.deadline);
                      const hasSubmittedToday = myHistory.some(sub => sub.projectId === proj.projectId && sub.date === TODAY_DATE_STR);

                      return (
                        <div key={proj.projectId} className="glass-panel-interactive rounded-2xl p-5 space-y-4 relative overflow-hidden" id={`proj-card-${proj.projectId}`}>
                          
                          {/* Top Tagging Row */}
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.04]">{proj.projectCode}</span>
                            <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-mono font-extrabold uppercase border ${
                              proj.priority === 'Critical' 
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-neutral-900 shadow-md' 
                                : 'bg-neutral-900/60 text-neutral-400 border-white/[0.02]'
                            }`}>
                              {proj.priority}
                            </span>
                          </div>

                          {/* Brand Info */}
                          <div>
                            <h3 className="text-sm font-bold text-white leading-snug tracking-tight font-display line-clamp-1">{proj.projectName}</h3>
                            <span className="text-[10px] text-[#FFA089] block font-bold uppercase tracking-wider mt-0.5">{proj.clientName || 'Direct Studio'}</span>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-[11px] font-medium text-neutral-300">
                              <span>Milestone Progress</span>
                              <span className="font-mono text-[#67b2b6] font-bold">{proj.currentCompletionPercent}%</span>
                            </div>
                            
                            <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                              <div
                                className="h-full bg-gradient-to-r from-[#67b2b6] to-[#4fa0a4] rounded-full shadow-[0_0_8px_rgba(103,178,183,0.3)] transition-all duration-700"
                                style={{ width: `${proj.currentCompletionPercent}%` }}
                              />
                            </div>

                            <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500 pt-0.5">
                              <span>Target: {proj.expectedProgressPercent}%</span>
                              <span className="text-[#67b2b6]">Health: {proj.healthStatus}</span>
                            </div>
                          </div>

                          {/* Days Remaining Countdown in custom footer */}
                          <div className="pt-3.5 border-t border-white/[0.04] flex items-center justify-between text-xs">
                            <div className="font-mono text-neutral-400 font-semibold flex items-center space-x-1.5">
                              <Clock size={12} className="text-neutral-500" />
                              <span className={daysLeft <= 7 ? 'text-rose-400 font-bold' : ''}>{daysLeft}d left</span>
                            </div>

                            {hasSubmittedToday ? (
                              <div className="flex items-center space-x-1 border border-emerald-500/15 bg-emerald-500/10 px-2.5 py-1 rounded-lg text-[9px] text-emerald-400 font-extrabold font-mono tracking-wider shadow-sm">
                                <Lock size={9} />
                                <span>SECURED</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedProjectId(proj.projectId);
                                  setSelectedStage(proj.currentStage);
                                  setActiveTab('submit-log');
                                }}
                                className="bg-[#67b2b6] hover:bg-[#52a1a5] text-neutral-950 font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-all tracking-wider shadow-[0_2px_8px_rgba(103,178,182,0.2)] hover:scale-105 active:scale-95 cursor-pointer"
                              >
                                PROMPT LOG
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* PERSONAL HISTORY TIMELINE & consistency */}
              <div className="bg-[#070b12]/90 border border-white/[0.04] p-5 rounded-3xl space-y-5 h-fit shadow-lg backdrop-blur-md" id="personal-consistency-bento">
                <div className="border-b border-white/[0.04] pb-2.5">
                  <span className="text-xs font-mono text-[#FFA089] uppercase font-bold tracking-widest block">
                    Submission Map
                  </span>
                  <span className="text-[9px] text-neutral-400 block font-mono mt-0.5">Your trailing 14-days commitment track</span>
                </div>

                <ConsistencyHeatmap progressList={myHistory} daysCount={14} />

                {/* HISTORICAL QUICK FEED CARDS */}
                <div className="space-y-3 pt-4 border-t border-white/[0.04]">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 tracking-wider uppercase block">
                    Latest committed activity
                  </span>

                  {myHistory.length === 0 ? (
                    <span className="text-[10px] font-mono text-neutral-500 block italic">No logs recorded this session.</span>
                  ) : (
                    myHistory.slice(0, 3).map(hist => (
                      <div key={hist.progressId} className="bg-black/30 p-3 rounded-xl border border-white/[0.02] hover:border-white/[0.04] transition-all text-xs text-neutral-300" id={`recent-committed-${hist.progressId}`}>
                        <div className="flex justify-between items-center font-mono text-[9px] text-neutral-500 mb-1.5">
                          <span>{hist.date}</span>
                          <span className="text-[#67b2b6] truncate max-w-[130px] font-semibold">{hist.projectName}</span>
                        </div>
                        <p className="line-clamp-2 leading-relaxed italic text-neutral-400 text-[11px]">
                          "{hist.workSummary}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 2. SUBMIT PROGRESS LOGS */}
        {activeTab === 'submit-log' && (
          <div className="max-w-xl mx-auto bg-[#070b12] border border-white/[0.04] p-6 md:p-8 rounded-3xl space-y-6 shadow-xl relative" id="submit-daily-log-view">
            
            <div className="border-b border-white/[0.04] pb-4">
              <span className="text-[9px] font-mono text-[#67b2b6] tracking-widest font-bold block uppercase">
                Director Progression Log
              </span>
              <h2 className="text-lg font-black text-white mt-1 font-display">Log Daily Production Progress</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Progression metrics are stored securely and lock automatically upon register-commit.
              </p>
            </div>

            <form onSubmit={handleProgressSubmit} className="space-y-5" id="progress-submission-card">
              
              {submitError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-mono flex items-center space-x-2.5">
                  <XCircle size={15} />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium space-y-2" id="submit-success-prompt">
                  <div className="flex items-center space-x-2 font-bold font-mono text-white">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>DATABASE COMMIT SECURED</span>
                  </div>
                  <p className="text-neutral-300 font-mono text-[11px] leading-relaxed">
                    {submitSuccess}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* SELECT DATE */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold block tracking-wider">Activity Log Date *</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSubmitError('');
                      setSubmitSuccess('');
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#67b2b6] focus:ring-1 focus:ring-[#67b2b6]/20 font-mono"
                  />
                </div>

                {/* SELECT ASSIGNED PROJECT */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold block tracking-wider">Select Assigned Scope *</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      setSelectedProjectId(e.target.value);
                      const matched = myProjects.find(p => p.projectId === e.target.value);
                      if (matched) {
                        setSelectedStage(matched.currentStage);
                      }
                      setSubmitError('');
                      setSubmitSuccess('');
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#67b2b6] focus:ring-1 focus:ring-[#67b2b6]/20 font-mono"
                  >
                    {myProjects.length === 0 ? (
                      <option value="">No Active Assignments</option>
                    ) : (
                      myProjects.map(p => (
                        <option key={p.projectId} value={p.projectId}>
                          {p.projectCode} — {p.projectName}
                        </option>
                      ))
                    )}
                  </select>
                </div>

              </div>

              {/* CHOOSE PROJECT STAGE */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block tracking-wider">Current Operations Stage *</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="stage-visual-radios">
                  {[
                    { val: 'Early Stage', label: 'Early Stage', desc: 'Auto Calc: 20%', color: 'border-l-sky-400' },
                    { val: 'In Progress', label: 'In Progress', desc: 'Auto Calc: 55%', color: 'border-l-indigo-400' },
                    { val: 'Final Stage', label: 'Final Stage', desc: 'Auto Calc: 85%', color: 'border-l-amber-400' },
                    { val: 'Complete', label: 'Complete', desc: 'Auto Calc: 100%', color: 'border-l-emerald-400' }
                  ].map((st) => (
                    <div
                      key={st.val}
                      onClick={() => setSelectedStage(st.val as ProjectStage)}
                      className={`p-3 rounded-xl border cursor-pointer border-l-4 transition-all ${st.color} ${
                        selectedStage === st.val
                          ? 'bg-[#67b2b6]/10 border-white/15 text-white shadow-md'
                          : 'bg-black/35 border-white/[0.04] hover:border-white/10 hover:bg-black/50'
                      }`}
                      id={`stage-radio-${st.val}`}
                    >
                      <span className="text-[11px] block text-white font-bold leading-tight">{st.label}</span>
                      <span className="text-[9px] font-mono text-neutral-400 mt-1 block">{st.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WORK SUMMARY TEXT BOX */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold block tracking-wider">Today's Work Summary (English, Hindi, Hinglish) *</label>
                <textarea
                  required
                  rows={4}
                  value={workSummary}
                  onChange={(e) => setWorkSummary(e.target.value)}
                  placeholder="e.g., Completed audio grading, synced final clips, added Hinglish logs and tags, rendered out production references..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#67b2b6] focus:ring-1 focus:ring-[#67b2b6]/20 resize-none leading-relaxed"
                />
              </div>

              {/* OPTIONAL NOTES */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold block tracking-wider">Director / Client Feedback Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={optionalNotes}
                  onChange={(e) => setOptionalNotes(e.target.value)}
                  placeholder="Review references tatapremium_v1, request assets..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#67b2b6] focus:ring-1 focus:ring-[#67b2b6]/20 resize-none leading-relaxed"
                />
              </div>

              <div className="p-4 bg-yellow-500/[0.03] border border-yellow-500/15 rounded-2xl text-[10.5px] text-neutral-400 leading-relaxed font-mono" id="progress-submission-terms text">
                <span className="text-white font-bold flex items-center space-x-1.5 mb-1.5 text-[11px]">
                  <Lock size={12} className="text-[#FFA089]" />
                  <span>Submission Compliance Terms</span>
                </span>
                Submission locks progress data into the database. You will not have access to edit or delete this commit subsequently. It is instantly evaluated against milestones.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#67b2b6] to-[#4fa0a4] text-neutral-900 font-extrabold py-3.5 rounded-xl hover:opacity-95 transition-all text-xs tracking-wider flex items-center justify-center space-x-2.5 shadow-lg shadow-[#67b2b6]/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin text-neutral-900" />
                ) : (
                  <Send size={14} />
                )}
                <span>{isSubmitting ? 'SECURE DATABASE COMMITTING...' : 'COMMIT PROGRESS LOG'}</span>
              </button>

            </form>
          </div>
        )}

        {/* 3. ASSIGNED PROJECTS SCREEN */}
        {activeTab === 'my-projects' && (
          <div className="space-y-6 animate-fade-in" id="my-projects-tab">
            
            <div className="border-b border-white/[0.04] pb-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-mono tracking-widest text-[#FFA089] uppercase font-bold">
                  Assigned Production Schedules
                </span>
                <p className="text-xs text-neutral-400 mt-1">Full detailed overview of active studio scopes assigned to your credential card.</p>
              </div>
              <span className="text-xs font-mono font-bold bg-[#67b2b6]/15 text-[#67b2b6] px-2.5 py-1 rounded-lg border border-[#67b2b6]/25">
                {myProjects.length} Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProjects.map((p) => {
                const daysLeft = getRemainingDays(p.deadline);
                const hasSubmittedToday = myHistory.some(sub => sub.projectId === p.projectId && sub.date === TODAY_DATE_STR);

                return (
                  <div key={p.projectId} className="glass-panel-heavy rounded-2xl p-5 shadow-lg space-y-4 hover:border-[#67b2b6]/15 transition-all" id={`portfolio-${p.projectId}`}>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.02] px-2 py-0.5 rounded border border-white/[0.04]">{p.projectCode}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${
                        p.priority === 'Critical' ? 'bg-rose-950/20 text-rose-400 border-rose-500/20' : 'bg-neutral-900/40 text-neutral-400 border-white/[0.02]'
                      }`}>
                        {p.priority}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-white tracking-tight leading-tight font-display">{p.projectName}</h3>
                      <p className="text-xs text-[#67b2b6] mt-0.5 font-bold uppercase tracking-wider">{p.clientName || 'Direct'}</p>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed italic line-clamp-3 bg-black/25 p-3 rounded-xl border border-white/[0.02]">
                      "{p.description}"
                    </p>

                    <div className="space-y-2.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-neutral-400 text-[11px]">Milestone Progression</span>
                        <span className="font-mono text-white font-bold">{p.currentCompletionPercent}%</span>
                      </div>
                      
                      <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-[#67b2b6] to-[#4fa0a4] rounded-full"
                          style={{ width: `${p.currentCompletionPercent}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[9px] font-mono text-neutral-500">
                        <span>Expected Progress: {p.expectedProgressPercent}%</span>
                        <span>Health: {p.healthStatus}</span>
                      </div>
                    </div>

                    <div className="pt-3.5 border-t border-white/[0.04] flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-neutral-400">
                        Deadline: {p.deadline}
                      </span>
                      <span className="font-bold text-[#FFA089] font-mono">
                        {daysLeft} days left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. MY CALENDAR SCR */}
        {activeTab === 'calendar' && (
          <div className="max-w-xl mx-auto bg-[#070b12] border border-white/[0.04] p-6 md:p-8 rounded-3xl space-y-6 shadow-xl" id="personal-calendar-tab">
            <div className="border-b border-white/[0.04] pb-4 text-center">
              <span className="text-[10px] font-mono text-[#67b2b6] tracking-widest font-bold block uppercase">
                Interactive Schedule Tracking-Map
              </span>
              <h2 className="text-lg font-black text-white mt-1 font-display">My Commitment Calendar</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Visual high-resolution track of your progress logs submitted on trailing dates.
              </p>
            </div>

            <ConsistencyHeatmap progressList={myHistory} daysCount={28} />
          </div>
        )}

        {/* 5. HISTORY SCR */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fade-in" id="personal-history-tab">
            
            <div className="border-b border-white/[0.04] pb-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-mono tracking-widest text-[#FFA089] uppercase font-bold block">
                  Historical Production Log Commits
                </span>
                <p className="text-xs text-neutral-400 mt-1">Secure transactional ledger representing locked project progress reports.</p>
              </div>
              <span className="text-xs font-mono font-bold bg-[#FFA089]/15 text-[#FFA089] px-2.5 py-1 rounded-lg border border-[#FFA089]/25">
                {myHistory.length} Saved
              </span>
            </div>

            {myHistory.length === 0 ? (
              <div className="p-24 text-center bg-[#070b12] border border-white/[0.04] rounded-2xl text-neutral-400 text-xs font-mono">
                No history entries recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {myHistory.map(hist => (
                  <div key={hist.progressId} className="bg-[#070b12]/90 border border-white/[0.04] p-5 rounded-2xl space-y-3.5 relative shadow-md hover:border-[#67b2b6]/15 transition-all" id={`hist-entry-${hist.progressId}`}>
                    <div className="absolute top-4 right-4 text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-0.8 rounded-lg tracking-wider">
                      AUTO LOCKED
                    </div>

                    <div className="border-b border-white/[0.04] pb-2">
                      <span className="text-[10px] font-mono text-neutral-400 font-medium block">Date committed: {hist.date}</span>
                      <h4 className="text-sm font-extrabold text-white mt-1.5 font-display flex items-center space-x-1.5">
                        <Milestone size={12} className="text-[#67b2b6]" />
                        <span>{hist.projectName}</span>
                      </h4>
                    </div>

                    <p className="text-xs text-neutral-200 italic leading-relaxed bg-black/40 p-3.5 rounded-xl border border-white/[0.02]">
                      "{hist.workSummary}"
                    </p>

                    {hist.notes && (
                      <div className="text-[11px] bg-white/[0.02] p-3 rounded-lg text-neutral-400 italic border border-white/[0.02]">
                        <span className="text-white font-semibold font-sans mb-1 block not-italic text-[10px] uppercase tracking-wider">Feedback Notes / Requests: </span>"{hist.notes}"
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] font-mono text-neutral-500 pt-1.5 gap-2">
                      <span>Committed Stage: <strong className="text-neutral-300 font-semibold">{hist.selectedStage}</strong></span>
                      <span>Progress Evaluated: <strong className="text-white font-bold">{hist.autoCompletionPercent}%</strong></span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  );
}
