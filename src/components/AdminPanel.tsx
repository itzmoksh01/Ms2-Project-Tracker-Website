/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, Suspense, lazy } from 'react';
import { useDashboardGSAPAnimations } from '../hooks/useDashboardGSAPAnimations';
import { store, TODAY_DATE_STR } from '../services/store';
import { User, Project, DailyProgress, ProjectStage, ProjectPriority } from '../types';
import {
  Users,
  Briefcase,
  Plus,
  Calendar,
  Layers,
  FileSpreadsheet,
  TrendingUp,
  Settings,
  UserPlus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Search,
  ArrowRight,
  LogOut,
  Sliders,
  FileText,
  Clock,
  Trash2,
  Lock,
  Download,
  ShieldCheck,
  Compass,
  Cpu,
  MonitorCheck,
  Sun,
  Moon,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
  Loader2
} from 'lucide-react';
import MS2Logo from './MS2Logo';
import { CompletionProgressCompareChart, StageDistributionChart, ConsistencyHeatmap } from './DashboardCharts';
import { RiskRadar } from './RiskRadar';
import { ProductionPipeline } from './ProductionPipeline';
import { WeeklySummary } from './WeeklySummary';
import { ReportBuilder } from './ReportBuilder';
import { AdminPrivateNotes } from './AdminPrivateNotes';
import { NotificationDrawer } from './NotificationDrawer';
import { CinematicBackground } from './CinematicBackground';
import { CommandCoreErrorBoundary } from './CommandCoreErrorBoundary';
import { CommandCoreSkeleton } from './CommandCoreSkeleton';
import { MisuChatbot } from './MisuChatbot';

const CommandCore3D = lazy(() => import('./CommandCore3D').then(m => ({ default: m.CommandCore3D })));
import { CommandPalette } from './CommandPalette';
import { DeadlineTimeline3D } from './DeadlineTimeline3D';

interface AdminPanelProps {
  adminUser: User;
  onLogout: () => void;
  themeMode?: 'dark' | 'light';
  setThemeMode?: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
  studioMode?: boolean;
  setStudioMode?: (enabled: boolean) => void;
}

export default function AdminPanel({ 
  adminUser, 
  onLogout, 
  themeMode = 'dark', 
  setThemeMode,
  studioMode = true,
  setStudioMode
}: AdminPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  useDashboardGSAPAnimations({ containerRef, activeTab });
  const [clientMode, setClientMode] = useState<boolean>(false);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<User | null>(null);
  const [employees, setEmployees] = useState<User[]>(store.getUsers().filter(u => u.role === 'employee'));
  const [projects, setProjects] = useState<Project[]>(store.getProjects());
  const [progressList, setProgressList] = useState<DailyProgress[]>(store.getDailyProgress());
  const [logs] = useState(store.getLogs());

  // Form states
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpUsername, setNewEmpUsername] = useState('');
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('');
  const [newEmpDesig, setNewEmpDesig] = useState('');
  const [empFormError, setEmpFormError] = useState('');
  const [empFormSuccess, setEmpFormSuccess] = useState('');

  const [newProjName, setNewProjName] = useState('');
  const [newProjClient, setNewProjClient] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjStart, setNewProjStart] = useState('2026-06-15');
  const [newProjDeadline, setNewProjDeadline] = useState('2026-06-30');
  const [newProjPriority, setNewProjPriority] = useState<ProjectPriority>('Medium');
  const [projFormError, setProjFormError] = useState('');
  const [projFormSuccess, setProjFormSuccess] = useState('');

  // Form submission loading states
  const [isSubmittingEmp, setIsSubmittingEmp] = useState(false);
  const [isSubmittingProj, setIsSubmittingProj] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsFormSuccess, setSettingsFormSuccess] = useState('');

  // Project select for Assignment
  const [selectedProjId, setSelectedProjId] = useState<string>(projects[0]?.projectId || '');

  // Progress list filters
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterEmp, setFilterEmp] = useState<string>('');
  const [filterProj, setFilterProj] = useState<string>('');
  const [filterStage, setFilterStage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Employee Profile View Modal
  const [selectedEmp, setSelectedEmp] = useState<User | null>(null);

  // Settings state
  const [settings, setSettings] = useState(store.getSettings());

  // Refresher helper for data
  const refreshData = () => {
    setEmployees(store.getUsers().filter(u => u.role === 'employee'));
    setProjects(store.getProjects());
    setProgressList(store.getDailyProgress());
  };

  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setEmployees(store.getUsers().filter(u => u.role === 'employee'));
      setProjects(store.getProjects());
      setProgressList(store.getDailyProgress());
      setSettings(store.getSettings());
    });
    return unsubscribe;
  }, []);

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingEmp) return;
    setEmpFormError('');
    setEmpFormSuccess('');

    if (!newEmpName || !newEmpEmail || !newEmpUsername || !newEmpId) {
      setEmpFormError('Full Name, Email, Username and Employee ID are required.');
      return;
    }

    // Check duplicate username or ID
    const alreadyExists = store.getUsers().some(u => 
      u.username.toLowerCase() === newEmpUsername.toLowerCase() || 
      u.employeeId.toLowerCase() === newEmpId.toLowerCase()
    );

    if (alreadyExists) {
      setEmpFormError('An employee with this Username or Employee ID already exists.');
      return;
    }

    setIsSubmittingEmp(true);
    // Simulate premium operational roundtrip database sync
    await new Promise((resolve) => setTimeout(resolve, 1000));

    store.createUser({
      fullName: newEmpName,
      email: newEmpEmail,
      username: newEmpUsername,
      employeeId: newEmpId,
      department: newEmpDept,
      designation: newEmpDesig,
      role: 'employee',
    });

    setIsSubmittingEmp(false);
    setEmpFormSuccess(`Employee account for '${newEmpName}' created successfully! Default login password is: ${newEmpId}`);
    
    // Clear Form
    setNewEmpName('');
    setNewEmpEmail('');
    setNewEmpUsername('');
    setNewEmpId('');
    setNewEmpDept('');
    setNewEmpDesig('');
    refreshData();
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingProj) return;
    setProjFormError('');
    setProjFormSuccess('');

    if (!newProjName || !newProjStart || !newProjDeadline || !newProjDesc) {
      setProjFormError('Project Name, Start Date, Deadline and Description are required.');
      return;
    }

    setIsSubmittingProj(true);
    // Simulate premium operational roundtrip database sync
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const created = store.createProject({
      projectName: newProjName,
      clientName: newProjClient,
      description: newProjDesc,
      startDate: newProjStart,
      deadline: newProjDeadline,
      priority: newProjPriority,
    });

    setIsSubmittingProj(false);
    setProjFormSuccess(`Project '${newProjName}' configured successfully under identity code: ${created.projectCode}`);
    
    // Clear form
    setNewProjName('');
    setNewProjClient('');
    setNewProjDesc('');
    setNewProjStart('2026-06-15');
    setNewProjDeadline('2026-06-30');
    setNewProjPriority('Medium');
    refreshData();
    if (!selectedProjId) {
      setSelectedProjId(created.projectId);
    }
  };

  const handleDeleteEmployee = (uid: string) => {
    if (window.confirm('Are you absolutely sure you want to PERMANENTLY delete this employee account? This action is irreversible and removes all their project assignments.')) {
      store.deleteUser(uid);
      if (selectedEmp?.uid === uid) {
        setSelectedEmp(null);
      }
      refreshData();
    }
  };

  const handleToggleEmployeeStatus = (uid: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    store.updateUserStatus(uid, nextStatus);
    refreshData();
    if (selectedEmp && selectedEmp.uid === uid) {
      setSelectedEmp({ ...selectedEmp, status: nextStatus });
    }
  };

  const handleUpdateAssignment = (employeeUid: string, assign: boolean) => {
    if (!selectedProjId) return;
    const project = projects.find(p => p.projectId === selectedProjId);
    if (!project) return;

    let currentAssignees = [...project.assignedEmployeeIds];
    if (assign) {
      if (!currentAssignees.includes(employeeUid)) {
        currentAssignees.push(employeeUid);
      }
    } else {
      currentAssignees = currentAssignees.filter(id => id !== employeeUid);
    }

    store.assignEmployeesToProject(selectedProjId, currentAssignees);
    refreshData();
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingSettings) return;
    setSettingsFormSuccess('');

    setIsSavingSettings(true);
    // Simulate secure network transaction delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    store.updateSettings(settings);
    setIsSavingSettings(false);
    setSettingsFormSuccess('Studio Operational configurations committed successfully to file storage.');
  };

  // -------------------------------------------------------------
  // MASTER METRICS CALCULATOR
  // -------------------------------------------------------------
  const todaySubmissions = progressList.filter(p => p.date === TODAY_DATE_STR);
  const activeProjects = projects.filter(p => p.status === 'Active');
  const completedProjects = projects.filter(p => p.currentStage === 'Complete');
  const inProgressProjects = projects.filter(p => p.currentStage === 'In Progress' || p.currentStage === 'Final Stage');
  const delayedProjects = projects.filter(p => p.healthStatus === 'Slight Delay' || p.healthStatus === 'High Risk' || p.healthStatus === 'Critical');

  const employeesWhoUpdatedToday = employees.filter(emp => 
    todaySubmissions.some(sub => sub.employeeUid === emp.uid)
  );
  const employeesMissingUpdatesToday = employees.filter(emp => 
    emp.status === 'active' &&
    !todaySubmissions.some(sub => sub.employeeUid === emp.uid) &&
    projects.some(p => p.status === 'Active' && p.assignedEmployeeIds.includes(emp.uid))
  );

  const healthScores = projects.map(p => {
    switch (p.healthStatus) {
      case 'Excellent': return 100;
      case 'On Track': return 85;
      case 'Slight Delay': return 65;
      case 'High Risk': return 40;
      case 'Critical': return 15;
    }
  });
  const avgHealthScore = healthScores.length ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length) : 100;

  // -------------------------------------------------------------
  // DATE PARSING FOR DEADLINES
  // -------------------------------------------------------------
  const getRemainingDays = (deadlineStr: string) => {
    const today = new Date(TODAY_DATE_STR).getTime();
    const deadline = new Date(deadlineStr).getTime();
    if (isNaN(deadline)) return 7;
    const diff = deadline - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const upcomingDeadlines = projects.filter(p => p.status === 'Active' && getRemainingDays(p.deadline) <= 18);

  return (
    <div ref={containerRef} className={`min-h-screen ${themeMode === 'light' ? 'bg-[#f4f5f6] text-stone-900' : 'bg-[#04060a] text-[#f4f4f5]'} flex flex-col md:flex-row font-sans command-grid relative overflow-hidden select-none`} id="admin-workspace-layout">
      
      {/* BACKGROUND CINEMATIC LIGHT PATTERNS */}
      <CinematicBackground studioMode={studioMode} />

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="w-full md:w-68 bg-[#070b12]/95 border-b md:border-b-0 md:border-r border-white/[0.04] flex flex-col shrink-0 z-20 backdrop-blur-md" id="admin-sidebar-nav">
        
        {/* UPPER BRAND SEALS */}
        <div className="p-5 border-b border-white/[0.04] flex items-center space-x-3.5 bg-black/10">
          <div className="p-1.5 bg-neutral-900 border border-white/5 rounded-xl">
            <MS2Logo className="w-8 h-auto" variant="icon" />
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-white block text-sm font-display">MS2 COMMAND</span>
            <span className="text-[9px] font-mono text-[#67b2b6] tracking-widest uppercase font-semibold">Studio Admin</span>
          </div>
        </div>

        {/* PROFILE CHIP ROW */}
        <div className="p-4 mx-4 mt-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center space-x-3 shadow-md">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FFA089] to-[#ee8d74] text-neutral-950 font-black flex items-center justify-center text-sm shadow-[0_2px_10px_rgba(255,160,137,0.3)]">
            A
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-white block truncate tracking-wide">{adminUser.fullName}</span>
            <span className="text-[9px] font-mono text-neutral-400 block truncate">{adminUser.employeeId}</span>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 rounded-xl bg-black/40 border border-white/[0.05] text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all shadow-sm animate-pulse-glow"
            title="Secure Logout"
          >
            <LogOut size={13} />
          </button>
        </div>

        {/* NAVIGATION MENUS */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-[9px] font-mono font-bold tracking-widest text-neutral-500 uppercase px-3 py-1 pb-2">
            Operations Center
          </div>
          
          {[
            { id: 'dashboard', label: 'Command Cockpit', icon: <Layers size={15} /> },
            { id: 'employees', label: 'Employees Directory', icon: <Users size={15} /> },
            { id: 'add-employee', label: 'Create Employee Account', icon: <UserPlus size={15} /> },
            { id: 'projects', label: 'Active Projects', icon: <Briefcase size={15} /> },
            { id: 'add-project', label: 'Configure Project', icon: <Plus size={15} /> },
            { id: 'assign', label: 'Assign Employees', icon: <Sliders size={15} /> },
            { id: 'progress', label: 'Daily Work Logs', icon: <FileText size={15} /> },
            { id: 'calendar', label: 'Schedules Calendar', icon: <Calendar size={15} /> },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setEmpFormError('');
                  setEmpFormSuccess('');
                  setProjFormError('');
                  setProjFormSuccess('');
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

          <div className="text-[9px] font-mono font-bold tracking-widest text-neutral-500 uppercase px-3 py-1 pt-5 pb-2">
            Intelligence & Reports
          </div>

          {[
            { id: 'reports', label: 'Executive Summaries', icon: <FileSpreadsheet size={15} /> },
            { id: 'analytics', label: 'Global Analytics', icon: <TrendingUp size={15} /> },
            { id: 'settings', label: 'Operational Control', icon: <Settings size={15} /> },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setEmpFormError('');
                  setEmpFormSuccess('');
                  setProjFormError('');
                  setProjFormSuccess('');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  isActive
                    ? 'bg-[#FFA089]/10 text-white border-[#FFA089]/20 shadow-[0_4px_15px_rgba(255,160,137,0.05)]'
                    : 'text-neutral-400 hover:text-neutral-200 border-transparent hover:bg-white/[0.02]'
                }`}
                id={`sidemenu-${item.id}`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? 'text-[#FFA089]' : 'text-neutral-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFA089] shadow-[0_0_8px_#FFA089]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* FOOTER METRIC BANNER */}
        <div className="p-4 border-t border-white/[0.04] bg-black/40 text-center text-[10px] font-mono text-neutral-500 tracking-wider">
          <span className="text-[#67b2b6]/70 uppercase">COMMAND PORTAL • {TODAY_DATE_STR}</span>
        </div>
      </aside>

      {/* CORE FRAMEWORK STAGE */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6 z-10" id="admin-main-stage">
        
        {/* UPPER VIEW HEADER */}
        <header className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b pb-5 p-4 rounded-2xl border ${
          themeMode === 'light' 
            ? 'bg-stone-100/50 border-stone-200' 
            : 'bg-gradient-to-b from-black/20 to-transparent border-white/[0.02]'
        }`} id="admin-header-title">
          <div>
            <span className="text-[10px] font-mono text-[#67b2b6] uppercase tracking-widest font-extrabold">STUDIO INTEL-FLOW REEVALUATION</span>
            <h1 className={`text-xl md:text-2xl font-black tracking-tight capitalize leading-none mt-1.5 font-display flex items-center space-x-2 ${
              themeMode === 'light' ? 'text-stone-900' : 'text-white'
            }`}>
              <Cpu size={18} className="text-[#67b2b6] shrink-0" />
              <span>{activeTab.replace('-', ' ')}</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1.5">
              Refined Entertainment Studio Project Command Center • Secure Admin Matrix
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* CLIENT PRESENTATION MODE TOGGLE */}
            <button
              onClick={() => {
                setClientMode(!clientMode);
                store.addNotification(
                  'uid-ratan-admin',
                  `Client Mode ${!clientMode ? 'Enabled' : 'Disabled'}`,
                  `Presenter safeguards have been updated. Internal notes and confidential audit logs are now ${!clientMode ? 'concealed' : 'visible'}.`,
                  'info'
                );
              }}
              className={`px-3 py-2 rounded-xl text-[10px] font-mono font-bold border transition-all flex items-center space-x-2 cursor-pointer ${
                clientMode
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                  : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              id="client-safe-toggle"
              title="Toggle Hide Private Internal Data"
            >
              {clientMode ? <EyeOff size={11} /> : <Eye size={11} />}
              <span>{clientMode ? 'CLIENT VIEW ACTIVE' : 'INTERNAL ADMIN MODE'}</span>
            </button>

            {/* QUICK COMMAND PALETTE CONTROLLER */}
            <CommandPalette 
              projects={projects}
              employees={employees}
              progressList={progressList}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onSelectProject={setSelectedProjectForDetail}
              onSelectEmployee={setSelectedEmployeeForDetail}
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

            {/* NOTIFICATION DRAWER CLIENT */}
            <NotificationDrawer currentUser={adminUser} themeMode={themeMode} />

            <div className="hidden sm:flex items-center space-x-3 bg-black/40 px-4 py-2 rounded-xl border border-white/[0.04] text-xs shadow-md shrink-0">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-[10px] font-mono text-neutral-300 tracking-widest font-bold">SYSTEM ACTIVE</span>
            </div>
          </div>
        </header>

        {/* ============================================================= */}
        {/* TABS CONTROLLERS */}
        {/* ============================================================= */}

        {/* 1. COMMAND CENTER (DASHBOARD) SCREEN */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in" id="dashboard-tab-view">
            
            {/* 3D ADMIN COMMAND CENTER HERO BANNER */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0e131f]/60 to-[#06080d]/80 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6 select-none" id="command-center-3d-hero">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-[#67b2b6]/5 blur-[60px] pointer-events-none" />
              
              <div className="flex-1 space-y-3.5 text-left z-10">
                <span className="text-[10px] font-mono text-[#67b2b6] uppercase tracking-widest font-extrabold block">
                  Interactive Studio Command Suite
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white leading-none font-display">
                  Operational Intel Command Cockpit
                </h2>
                <p className="text-[11px] text-neutral-450 leading-relaxed max-w-md font-sans">
                  Welcome to operations, Ratan. Hover above the floating nodes in the 3D rotating command core to inspect real-time database loads, or click any node to immediately navigate to its respective module.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/[0.04] text-[10px] font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-neutral-300">CORE STATUS: ACTIVE</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/[0.04] text-[10px] font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-neutral-300">STUDIO ACCEL: {studioMode ? 'HIGH-3D' : 'REST'}</span>
                  </div>
                </div>
              </div>

              {/* 3D ROTATING INTERACTIVE CORE SPHERE WRAPPER */}
              <div className="w-full md:w-80 h-36 md:h-44 shrink-0 flex items-center justify-center relative select-none">
                <CommandCoreErrorBoundary variant="admin-hero">
                  <Suspense fallback={<CommandCoreSkeleton variant="admin-hero" />}>
                    <CommandCore3D 
                      variant="admin-hero"
                      metrics={{
                        activeProjects: activeProjects.length,
                        employeesCount: employees.length,
                        todayUpdates: todaySubmissions.length,
                        lockedEntries: progressList.filter(p => p.isLocked).length,
                        criticalRisks: projects.filter(p => p.healthStatus === 'Critical' || p.healthStatus === 'High Risk').length
                      }}
                      onNodeClick={(nodeId) => {
                        if (nodeId) {
                          setActiveTab(nodeId);
                        }
                      }}
                      studioMode={studioMode}
                    />
                  </Suspense>
                </CommandCoreErrorBoundary>
              </div>
            </div>

            {/* MINI METRICS bento grids */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Studio Employees', val: employees.length, sub: 'Active force', accent: 'border-l-sky-500 bg-[#38bdf8]/5' },
                { label: 'Active Projects', val: activeProjects.length, sub: 'Under production', accent: 'border-l-indigo-500 bg-[#818cf8]/5' },
                { label: 'Completed Deliveries', val: completedProjects.length, sub: '100% stage reached', accent: 'border-l-emerald-500 bg-[#10b981]/5' },
                { label: 'Updates Confirmed', val: todaySubmissions.length, sub: `${employeesWhoUpdatedToday.length} of ${employees.length} posted`, accent: 'border-l-[#FFA089] bg-[#FFA089]/5' },
                { label: 'Delays / At Risk', val: delayedProjects.length, sub: 'Behind schedule', accent: 'border-l-rose-500 bg-[#f43f5e]/5' },
              ].map((m, id) => (
                <div key={id} className={`glass-panel-heavy p-4 rounded-2xl border border-white/[0.03] border-l-4 ${m.accent} shadow-md`} id={`metric-card-${id}`}>
                  <span className="text-[10px] font-mono text-neutral-400 block tracking-widest uppercase font-bold">{m.label}</span>
                  <span className="text-2xl font-black text-white block mt-1.5 tracking-tight font-display">{m.val}</span>
                  <span className="text-[10px] text-neutral-500 font-mono mt-1 block leading-none">{m.sub}</span>
                </div>
              ))}
            </div>

            {/* SECONDARY METRICS: Studio Health details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel p-4.5 rounded-2xl flex items-center justify-between border border-white/[0.02]" id="dashboard-health-averages">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 tracking-wider block uppercase font-bold">Average Studio Health</span>
                  <span className="text-xl font-black text-emerald-400 mt-1.5 block font-display">{avgHealthScore}%</span>
                  <span className="text-[9px] font-mono text-neutral-500 block mt-1 tracking-wider uppercase">High efficiency</span>
                </div>
                <div className="h-11 w-11 rounded-xl border border-emerald-500/25 bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-md ring-4 ring-emerald-500/5">
                  <ShieldCheck size={20} />
                </div>
              </div>

              <div className="glass-panel p-4.5 rounded-2xl flex items-center justify-between border border-white/[0.02]" id="dashboard-upcoming-deadlines">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 tracking-wider block uppercase font-bold">Next Deadlines Watch</span>
                  <span className="text-xl font-black text-amber-400 mt-1.5 block font-display">{upcomingDeadlines.length} Projects</span>
                  <span className="text-[9px] font-mono text-neutral-500 block mt-1 tracking-wider uppercase">Next 10-18 days</span>
                </div>
                <div className="h-11 w-11 rounded-xl border border-amber-500/25 bg-amber-500/10 flex items-center justify-center text-amber-400 shadow-md ring-4 ring-amber-500/5">
                  <Clock size={20} />
                </div>
              </div>

              <div className="glass-panel p-4.5 rounded-2xl flex items-center justify-between border border-white/[0.02]" id="dashboard-pending-today">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 tracking-wider block uppercase font-bold">Updates Pending Today</span>
                  <span className={`text-xl font-black mt-1.5 block font-display ${employeesMissingUpdatesToday.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {employeesMissingUpdatesToday.length}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-500 block mt-1 tracking-wider uppercase">Missing log submissions</span>
                </div>
                <div className="h-11 w-11 rounded-xl border border-rose-500/25 bg-rose-500/10 flex items-center justify-center text-rose-400 shadow-md ring-4 ring-rose-500/5">
                  <Flame size={20} />
                </div>
              </div>

              <div className="glass-panel p-4.5 rounded-2xl flex items-center justify-between border border-white/[0.02]" id="dashboard-stage-distribution">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 tracking-wider block uppercase font-bold">In-Production Stage</span>
                  <span className="text-xl font-black text-indigo-400 mt-1.5 block font-display">{inProgressProjects.length} Projects</span>
                  <span className="text-[9px] font-mono text-neutral-500 block mt-1 tracking-wider uppercase">Edit/Mix/Post</span>
                </div>
                <div className="h-11 w-11 rounded-xl border border-indigo-500/25 bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-md ring-4 ring-indigo-500/5">
                  <Sliders size={20} />
                </div>
              </div>
            </div>

            {/* MS2 DYNAMIC PRODUCTION PIPELINE CONTROL BOARD */}
            <ProductionPipeline 
              projects={projects} 
              allEmployees={store.getUsers()} 
              onProjectClick={(proj) => setSelectedProjectForDetail(proj)} 
              themeMode={themeMode} 
            />

            {/* SMART PROJECT ALGORITHMIC RISK RADAR */}
            <RiskRadar projects={projects} themeMode={themeMode} />

            {/* AI WEEKLY INTEL COMPILER SECTION */}
            <WeeklySummary 
              projects={projects} 
              employees={employees} 
              progressList={progressList} 
              themeMode={themeMode} 
            />

            {/* MAIN SECTIONS: Command centers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* TODAY COMMAND CENTER (WHO HAS SUBMITTED / NOT SUBMITTED) */}
              <div className="lg:col-span-2 glass-panel border border-white/[0.04] p-5 rounded-3xl space-y-4" id="today-submission-checklist">
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-3.5">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 size={16} className="text-[#67b2b6] shrink-0" />
                    <span className="text-xs font-bold tracking-tight text-white font-display">
                      Today's Log Tracker Checklist
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-neutral-500 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">DATE: {TODAY_DATE_STR}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* COMPLETED SUBMISSIONS */}
                  <div className="space-y-3" id="submitted-list-section">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#67b2b6] uppercase block">
                      Submitted ({employeesWhoUpdatedToday.length})
                    </span>
                    {employeesWhoUpdatedToday.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-white/[0.04] bg-neutral-950/20 rounded-2xl text-neutral-500 text-[11px] font-mono">
                        No submissions logged today yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {employeesWhoUpdatedToday.map(emp => {
                          const sub = todaySubmissions.find(s => s.employeeUid === emp.uid);
                          return (
                            <div key={emp.uid} className="bg-black/35 border border-emerald-500/10 p-2.5 rounded-xl flex items-center justify-between text-xs" id={`today-sub-${emp.uid}`}>
                              <div className="flex items-center space-x-2.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                                <span className="font-semibold text-white">{emp.fullName}</span>
                              </div>
                              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 px-2 py-0.5 rounded-lg font-bold">
                                {sub?.selectedStage}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* MISSING SUBMISSIONS */}
                  <div className="space-y-3" id="missing-list-section">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-rose-400 uppercase block">
                      Pending submissions today ({employeesMissingUpdatesToday.length})
                    </span>
                    {employeesMissingUpdatesToday.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-[#10b981]/15 bg-[#10b981]/5 rounded-2xl text-emerald-400 text-[11px] flex items-center justify-center space-x-2 font-mono">
                        <CheckCircle2 size={14} className="text-emerald-400 animate-bounce" />
                        <span>All active personnel recorded!</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {employeesMissingUpdatesToday.map(emp => (
                          <div key={emp.uid} className="bg-gradient-to-r from-rose-950/10 to-transparent border border-rose-500/10 p-2.5 rounded-xl flex items-center justify-between text-xs" id={`today-missing-${emp.uid}`}>
                            <div className="flex items-center space-x-2.5">
                              <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e] animate-pulse" />
                              <span className="font-semibold text-neutral-200">{emp.fullName}</span>
                            </div>
                            <span className="text-[9px] font-mono text-rose-400 bg-rose-500/5 border border-rose-500/15 px-2 py-0.5 rounded-lg font-bold">
                              PENDING Log
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* STAGE RATIOS CHART */}
              <div className="glass-panel border border-white/[0.04] p-5 rounded-3xl space-y-4" id="dashboard-stage-charts">
                <div className="border-b border-white/[0.04] pb-3.5">
                  <span className="text-xs font-bold text-white block font-display">Project Stage Split</span>
                  <span className="text-[9px] text-neutral-400 font-mono block mt-0.5">Ratio of active portfolio</span>
                </div>
                <StageDistributionChart projects={projects} />
              </div>

            </div>

            {/* DUAL GRID: Expected vs Current, Recent submissions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* COMPARATIVE ANALYSIS PROGRESS */}
              <div className="lg:col-span-2 glass-panel border border-white/[0.04] p-5 rounded-3xl space-y-4" id="dashboard-comparisons">
                <div className="border-b border-white/[0.04] pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block font-display">Target Deliverable Vs Actual Milestone</span>
                    <span className="text-[9px] text-neutral-400 font-mono block mt-0.5 font-sans">Linear progression timeline metric evaluation</span>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.8 rounded-lg bg-[#FFA089]/10 border border-[#FFA089]/20 text-[#FFA089] font-bold">
                    SYSTEM AUTO CALCULATIONS
                  </span>
                </div>
                <CompletionProgressCompareChart projects={projects} />
              </div>

              {/* RECENT SUBMITTED WORK LOGS CARDS */}
              <div className="glass-panel border border-white/[0.04] p-5 rounded-3xl space-y-4" id="recent-logs-section">
                <div className="border-b border-white/[0.04] pb-3.5">
                  <span className="text-xs font-bold text-white block font-display">Recent Log Submissions</span>
                  <span className="text-[9px] text-neutral-400 font-mono block mt-0.5 font-sans">Latest submitted entries by creative force</span>
                </div>
                
                {progressList.length === 0 ? (
                  <div className="text-center py-12 text-xs text-neutral-500 font-mono h-[280px] flex items-center justify-center border border-dashed border-white/[0.03] rounded-2xl bg-black/5">
                    No active daily logs registered.
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
                    {progressList.slice(0, 5).map((log) => (
                      <div key={log.progressId} className="border-b border-white/[0.03] pb-3 last:border-0 last:pb-0 text-xs" id={`recent-${log.progressId}`}>
                        <div className="flex items-center justify-between font-mono text-[9px] text-neutral-500">
                          <span>{log.date}</span>
                          <span className="text-[#FFA089] truncate max-w-[120px] font-semibold">{log.projectName}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1.5">
                          <span className="font-extrabold text-white">{log.employeeName}</span>
                          <span className="text-neutral-400 font-bold font-mono text-[9px] bg-white/[0.04] border border-white/[0.05] px-1.5 py-0.2 rounded-lg">
                            {log.employeeId}
                          </span>
                        </div>
                        <p className="text-neutral-300 mt-2 line-clamp-2 text-[11px] italic bg-black/15 p-2 rounded-lg leading-relaxed border border-white/[0.02]">
                          "{log.workSummary}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* 2. EMPLOYEES DIRECTORY SCR */}
        {activeTab === 'employees' && (
          <div className="space-y-6 animate-fade-in" id="employees-tab-view">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* EMPLOYEES LIST CARDS */}
              <div className="lg:col-span-2 space-y-4" id="employees-grid-list">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono tracking-widest text-[#67b2b6] uppercase font-extrabold">
                    Operational Workforce Registry ({employees.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {employees.map((emp) => {
                    const assigned = projects.filter(p => p.assignedEmployeeIds.includes(emp.uid));
                    const isMissingToday = employeesMissingUpdatesToday.some(e => e.uid === emp.uid);

                    return (
                      <div
                        key={emp.uid}
                        onClick={() => setSelectedEmp(emp)}
                        className={`glass-panel-interactive p-5 rounded-2xl cursor-pointer relative overflow-hidden ${
                          selectedEmp?.uid === emp.uid ? 'border-[#67b2b6] bg-black/40 ring-1 ring-[#67b2b6]' : ''
                        }`}
                        id={`emp-card-${emp.uid}`}
                      >
                        {/* Status tag */}
                        <div className="absolute top-4 right-4 flex items-center space-x-1.5">
                          <span className={`h-2 w-2 rounded-full ${emp.status === 'active' ? 'bg-emerald-400 animate-pulse-glow shadow-[0_0_8px_#10b981]' : 'bg-neutral-600'}`} />
                          <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest">{emp.status}</span>
                        </div>

                        <span className="text-[9px] font-mono text-neutral-500 block font-bold">{emp.employeeId}</span>
                        <h3 className="text-base font-extrabold text-white mt-1.5 font-display">{emp.fullName}</h3>
                        <p className="text-xs text-[#FFA089] mt-0.5 font-semibold tracking-wide">{emp.designation}</p>
                        
                        <div className="mt-4 pt-4 border-t border-white/[0.04] grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[9px] font-mono text-neutral-500 block uppercase font-bold">Department</span>
                            <span className="text-neutral-300 font-extrabold truncate block mt-0.5">{emp.department || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-neutral-500 block uppercase font-bold">My Scopes</span>
                            <span className="text-[#67b2b6] font-black block mt-0.5">{assigned.length} Projects</span>
                          </div>
                        </div>

                        {isMissingToday && (
                          <div className="mt-4 px-3 py-1.5 bg-rose-500/5 border border-rose-500/10 rounded-xl text-[10px] text-rose-400 font-mono text-center flex items-center justify-center space-x-1.5 animate-pulse">
                            <AlertTriangle size={11} />
                            <span>Action log submission outstanding today</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DETAILED DRILLDOWN PROFILE VIEW */}
              <div className="glass-panel border border-white/[0.04] p-5 rounded-3xl space-y-5 h-fit lg:sticky lg:top-8 shadow-xl" id="employee-detail-drilldown">
                {selectedEmp ? (
                  <div className="space-y-5" id="emp-drilldown-active">
                    <div className="text-center pb-4.5 border-b border-white/[0.04]">
                      <div className="h-14 w-14 rounded-xl bg-[#67b2b6]/10 border border-[#67b2b6]/30 text-[#67b2b6] text-xl font-black flex items-center justify-center mx-auto shadow-inner">
                        {selectedEmp.fullName.charAt(0)}
                      </div>
                      <h3 className="text-lg font-black text-white mt-3.5 leading-none font-display">{selectedEmp.fullName}</h3>
                      <span className="text-xs font-mono text-neutral-400 block mt-1.5">{selectedEmp.employeeId}</span>
                      <p className="text-xs text-[#FFA089] mt-1 italic font-semibold">{selectedEmp.designation}</p>
                    </div>

                    {/* Meta stats */}
                    <div className="space-y-3 text-xs">
                      <div className="bg-black/25 p-2 rounded-xl border border-white/[0.01]">
                        <span className="text-neutral-500 text-[9px] font-mono font-bold uppercase block">Contact Email</span>
                        <span className="text-neutral-200 mt-0.5 block font-semibold">{selectedEmp.email}</span>
                      </div>
                      <div className="bg-black/25 p-2 rounded-xl border border-white/[0.01]">
                        <span className="text-neutral-500 text-[9px] font-mono font-bold uppercase block">Portal Username</span>
                        <span className="text-neutral-200 mt-0.5 block font-mono font-semibold">{selectedEmp.username}</span>
                      </div>
                      <div className="bg-black/25 p-2 rounded-xl border border-white/[0.01]">
                        <span className="text-neutral-500 text-[9px] font-mono font-bold uppercase block">Associated Department</span>
                        <span className="text-neutral-300 mt-0.5 block font-semibold">{selectedEmp.department || 'N/A'}</span>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-neutral-500 text-[9px] font-mono font-bold uppercase block">Active Assignments</span>
                        <div className="space-y-1.5" id="drilldown-assigned-scopes">
                          {projects.filter(p => p.assignedEmployeeIds.includes(selectedEmp.uid)).map(p => (
                            <div key={p.projectId} className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/[0.03]">
                              <span className="text-white font-bold truncate max-w-[130px] font-display text-[11px]">{p.projectName}</span>
                              <span className="text-[10px] font-mono font-bold text-[#67b2b6]">{p.currentStage}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* CONFORMANCE SCORING */}
                    <div className="space-y-1.5 pt-1.5">
                      <span className="text-[9px] font-mono font-bold text-neutral-400 block uppercase">
                        Work Submission Consistency (Trailing 14d)
                      </span>
                      <ConsistencyHeatmap progressList={progressList.filter(p => p.employeeUid === selectedEmp.uid)} daysCount={14} />
                    </div>

                    {/* RISK MANAGEMENT CONTROLS */}
                    <div className="pt-4 border-t border-white/[0.04] flex flex-col gap-2.5" id="drilldown-controls-actions">
                      <button
                        onClick={() => setSelectedEmployeeForDetail(selectedEmp)}
                        className="w-full bg-[#67b2b6]/10 hover:bg-[#67b2b6]/20 border border-[#67b2b6]/35 text-[#67b2b6] text-xs py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
                      >
                        <UserCheck size={13} />
                        <span>Show Deep Conformance & Notes</span>
                      </button>

                      <button
                        onClick={() => handleToggleEmployeeStatus(selectedEmp.uid, selectedEmp.status)}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs border transition-all text-center flex items-center justify-center space-x-2 cursor-pointer ${
                          selectedEmp.status === 'active'
                            ? 'bg-amber-500/5 hover:bg-amber-500/15 border-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/5 hover:bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        <AlertTriangle size={13} />
                        <span>{selectedEmp.status === 'active' ? 'Deactivate Employee Scope' : 'Reactivate Employee'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteEmployee(selectedEmp.uid)}
                        className="w-full bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 text-xs py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Delete Employee Record</span>
                      </button>

                      <p className="text-[9px] text-center text-neutral-500 font-mono tracking-tight leading-none mt-1">
                        Authorization passcode resets automatically to Employee ID reference.
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-20 text-neutral-500 space-y-3" id="emp-drilldown-empty">
                    <Users size={32} className="mx-auto text-neutral-700 animate-pulse" />
                    <div>
                      <span className="text-xs font-semibold text-neutral-400 block">Select Employee Profile</span>
                      <span className="text-[10px] text-neutral-500 mt-1 block leading-relaxed max-w-[220px] mx-auto">Click any card on the directory stage to audit operational logs, heatmaps, and credentials constraints.</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* 3. CREATE EMPLOYEE SCR */}
        {activeTab === 'add-employee' && (
          <div className="max-w-xl mx-auto glass-panel border border-white/[0.04] p-6 md:p-8 rounded-3xl space-y-6 shadow-xl relative" id="add-employee-tab-view">
            <div className="border-b border-white/[0.04] pb-4">
              <span className="text-[9px] font-mono text-[#67b2b6] tracking-widest font-bold block uppercase">
                Studio Credentials Control
              </span>
              <h2 className="text-lg font-black text-white mt-1 font-display">Authenticate New Employee Account</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Establish official domain authorization records and ID indices.
              </p>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4" id="add-employee-form">
              {empFormError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-mono flex items-center space-x-2">
                  <XCircle size={14} />
                  <span>{empFormError}</span>
                </div>
              )}

              {empFormSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium space-y-1.5" id="emp-form-success">
                  <div className="flex items-center space-x-2 font-bold font-mono text-white">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>USER IDENTIFICATION SECURED</span>
                  </div>
                  <p className="text-neutral-300 font-mono text-[11px] leading-relaxed">
                    {empFormSuccess}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newEmpName}
                    onChange={(e) => {
                      setNewEmpName(e.target.value);
                      if (!newEmpUsername) {
                        setNewEmpUsername(e.target.value.replace(/\s+/g, ''));
                      }
                      if (!newEmpId) {
                        setNewEmpId('MS2-EMP-' + Math.floor(100 + Math.random() * 900));
                      }
                    }}
                    placeholder="e.g. Abhishek"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#67b2b6]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#67b2b6] uppercase font-bold tracking-wider">Employee ID (Visual Code) *</label>
                  <input
                    type="text"
                    required
                    value={newEmpId}
                    onChange={(e) => setNewEmpId(e.target.value)}
                    placeholder="e.g. MS2-EMP-007"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#67b2b6] font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Portal Username *</label>
                  <input
                    type="text"
                    required
                    value={newEmpUsername}
                    onChange={(e) => setNewEmpUsername(e.target.value)}
                    placeholder="e.g. Abhishek007"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#67b2b6] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={newEmpEmail}
                    onChange={(e) => setNewEmpEmail(e.target.value)}
                    placeholder="e.g. abhi@ms2.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#67b2b6] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Designation / Role Title</label>
                  <input
                    type="text"
                    value={newEmpDesig}
                    onChange={(e) => setNewEmpDesig(e.target.value)}
                    placeholder="e.g. Lead Colorist"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#67b2b6]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Team Department</label>
                  <input
                    type="text"
                    value={newEmpDept}
                    onChange={(e) => setNewEmpDept(e.target.value)}
                    placeholder="e.g. Creative Design"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#67b2b6]"
                  />
                </div>
              </div>

              <div className="p-4 bg-orange-500/[0.03] border border-orange-500/15 rounded-2xl text-[10.5px] text-neutral-400 leading-relaxed font-mono">
                <span className="font-bold flex items-center space-x-1.5 mb-1 text-[#FFA089]">
                  <AlertTriangle size={12} />
                  <span>Credential Auto-Provisioning Invariant</span>
                </span>
                The passcodes for initial employees correspond directly to their visible <strong>Employee ID</strong>. They can log in immediately after you register them.
              </div>

              <button
                type="submit"
                disabled={isSubmittingEmp}
                className="w-full bg-gradient-to-r from-[#67b2b6] to-[#4fa0a4] text-neutral-900 font-extrabold py-3.5 rounded-xl hover:opacity-95 transition-all text-xs tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-[#67b2b6]/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                {isSubmittingEmp ? (
                  <Loader2 size={15} className="animate-spin text-neutral-900" />
                ) : (
                  <Plus size={15} />
                )}
                <span>{isSubmittingEmp ? 'DATABASE ARCHIVING...' : 'CONFIRM WORKER ACCOUNT IN GENERAL DATABASE'}</span>
              </button>
            </form>
          </div>
        )}

        {/* 4. ACTIVE PROJECTS SCR */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-fade-in" id="projects-tab-view">
            <span className="text-xs font-mono tracking-widest text-[#FFA089] uppercase font-bold block">
              Production Portfolio ({projects.length} Active Codes)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => {
                const assignedWorkers = employees.filter(e => p.assignedEmployeeIds.includes(e.uid));
                const daysLeft = getRemainingDays(p.deadline);

                return (
                  <div key={p.projectId} className="glass-panel-heavy rounded-3xl p-5 shadow-lg space-y-4 relative overflow-hidden" id={`project-portfolio-card-${p.projectId}`}>
                    
                    {/* Urgency light */}
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border border-white/[0.04] ${
                        p.priority === 'Critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        p.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-sky-500/5 text-sky-400 border-sky-500/10'
                      }`}>
                        {p.priority}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-neutral-500 block font-bold">{p.projectCode}</span>
                      <h3 className="text-base font-extrabold text-white mt-1.5 leading-snug tracking-tight font-display line-clamp-1">{p.projectName}</h3>
                      <p className="text-[11px] font-bold text-[#67b2b6] mt-0.5 uppercase tracking-wider">{p.clientName || 'Direct'}</p>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed italic h-12 line-clamp-2 bg-black/25 p-3 rounded-xl border border-white/[0.02]">
                      "{p.description}"
                    </p>

                    {/* Progress details */}
                    <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-400 text-[11px]">Milestone Progress</span>
                        <span className="font-mono text-white font-bold">{p.currentCompletionPercent}%</span>
                      </div>
                      
                      {/* Master progress visual */}
                      <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-[#67b2b6] to-[#4fa0a4] rounded-full shadow-[0_0_8px_rgba(103,178,182,0.4)]"
                          style={{ width: `${p.currentCompletionPercent}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[9px] font-mono text-neutral-500 pt-0.5">
                        <span>Expected Progress: {p.expectedProgressPercent}%</span>
                        <span className="text-[#FFA089]">Stage: {p.currentStage}</span>
                      </div>
                    </div>

                    {/* Assignment & Countdowns */}
                    <div className="pt-3.5 border-t border-white/[0.04] flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase block font-bold">Assignees ({assignedWorkers.length})</span>
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {assignedWorkers.length === 0 ? (
                            <span className="text-[10px] text-rose-400 block font-mono font-semibold">STANDBY (0)</span>
                          ) : (
                            assignedWorkers.map(w => (
                              <div
                                key={w.uid}
                                className="h-6 w-6 rounded-lg bg-zinc-900 border border-neutral-950 text-white font-extrabold text-[9px] flex items-center justify-center shadow-md cursor-pointer hover:border-[#67b2b6] transition-all"
                                title={`${w.fullName} (${w.designation})`}
                              >
                                {w.fullName.charAt(0)}
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase block font-bold">Target Date</span>
                        <span className={`text-xs font-mono font-bold block mt-0.5 ${daysLeft <= 10 && p.currentStage !== 'Complete' ? 'text-rose-400 font-bold animate-pulse' : 'text-neutral-300'}`}>
                          {p.deadline} ({daysLeft}d left)
                        </span>
                      </div>
                    </div>

                    {/* Stage status indicator badge */}
                    <div className="mt-3.5 flex items-center justify-between text-xs pt-2.5 border-t border-white/[0.04]">
                      <div className="flex items-center space-x-1.5">
                        <span className="h-2 w-2 rounded-full shadow-md animate-pulse" style={{ backgroundColor: 
                          p.currentStage === 'Early Stage' ? '#38bdf8' :
                          p.currentStage === 'In Progress' ? '#818cf8' :
                          p.currentStage === 'Final Stage' ? '#f59e0b' : '#10b981'
                        }} />
                        <span className="text-neutral-300 font-bold font-mono text-[11px] uppercase tracking-wide">{p.currentStage}</span>
                      </div>

                      <span className={`text-[10px] px-2.5 py-0.5 rounded-lg font-bold font-mono border ${
                        p.healthStatus === 'Excellent' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20' :
                        p.healthStatus === 'On Track' ? 'bg-sky-950/20 text-sky-400 border border-sky-500/20' :
                        p.healthStatus === 'Slight Delay' ? 'bg-amber-950/20 text-amber-500/20 border-amber-500/10' :
                        'bg-rose-950/20 text-rose-400 border border-rose-500/20'
                      }`}>
                        Health: {p.healthStatus}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. ADD PROJECT SCR */}
        {activeTab === 'add-project' && (
          <div className="max-w-xl mx-auto glass-panel border border-white/[0.04] p-6 md:p-8 rounded-3xl space-y-6 shadow-xl relative" id="add-project-tab-view">
            <div className="border-b border-white/[0.04] pb-4">
              <span className="text-[9px] font-mono text-[#FFA089] tracking-widest font-bold block uppercase">
                Studio Creative Inventory
              </span>
              <h2 className="text-lg font-black text-white mt-1 font-display">Configure New Production Project</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Enter client deliverables schedules and core target boundaries.
              </p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4" id="add-project-form">
              {projFormError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-mono flex items-center space-x-2">
                  <XCircle size={14} />
                  <span>{projFormError}</span>
                </div>
              )}

              {projFormSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium space-y-1.5" id="proj-form-success">
                  <div className="flex items-center space-x-2 font-bold font-mono text-white">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>PROJECT IDENTITY CONFIGURED</span>
                  </div>
                  <p className="text-neutral-300 font-mono text-[11px] leading-relaxed">
                    {projFormSuccess}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Project Name *</label>
                <input
                  type="text"
                  required
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Brand Film Campaign"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FFA089]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Client Name Label Identifier</label>
                <input
                  type="text"
                  value={newProjClient}
                  onChange={(e) => setNewProjClient(e.target.value)}
                  placeholder="e.g. Paramount Labels"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FFA089]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Scope of Work description *</label>
                <textarea
                  required
                  rows={4}
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Highlight core postproduction milestones, edit locks, color deadlines..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#FFA089] resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newProjStart}
                    onChange={(e) => setNewProjStart(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FFA089] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Deadline Date *</label>
                  <input
                    type="date"
                    required
                    value={newProjDeadline}
                    onChange={(e) => setNewProjDeadline(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FFA089] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Project Delivery Urgency Urgencies *</label>
                <select
                  value={newProjPriority}
                  onChange={(e) => setNewProjPriority(e.target.value as ProjectPriority)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FFA089]"
                >
                  <option value="Low">Low - Postponable</option>
                  <option value="Medium">Medium - Standard Schedule</option>
                  <option value="High">High - Studio Priority</option>
                  <option value="Critical">Critical - Immediate Command (Penalty clause-linked)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmittingProj}
                className="w-full bg-gradient-to-r from-[#FFA089] to-[#ee8d74] text-neutral-900 font-extrabold py-3.5 rounded-xl hover:opacity-95 transition-all text-xs tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-[#FFA089]/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                {isSubmittingProj ? (
                  <Loader2 size={15} className="animate-spin text-neutral-900" />
                ) : (
                  <Plus size={15} />
                )}
                <span>{isSubmittingProj ? 'LAUNCHING SECURE REGISTRY...' : 'LAUNCH PROJECT CODE AND REGISTER TIMELINE'}</span>
              </button>
            </form>
          </div>
        )}

        {/* 6. ASSIGN EMPLOYEES SCR */}
        {activeTab === 'assign' && (
          <div className="space-y-6 animate-fade-in" id="assign-tab-view">
            <div className="glass-panel border border-white/[0.04] p-5 rounded-3xl max-w-2xl mx-auto space-y-4 shadow-xl" id="project-assignment-center">
              <div>
                <span className="text-[9px] font-mono text-[#67b2b6] tracking-widest font-bold block uppercase">
                  Studio Operations Dispatch
                </span>
                <h2 className="text-lg font-black text-white mt-1 font-display">Resource Assignment Matrix</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Bind or remove qualified employees from active project scopes.
                </p>
              </div>

              {/* Select target project */}
              <div className="space-y-1.5 pt-3">
                <label className="text-[10px] font-mono text-neutral-450 uppercase font-bold block tracking-wider">Target Project Scope</label>
                <select
                  value={selectedProjId}
                  onChange={(e) => setSelectedProjId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#67b2b6] font-mono"
                >
                  {projects.map(p => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.projectCode} — {p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected project details card */}
              {selectedProjId && (
                (() => {
                  const targetProj = projects.find(p => p.projectId === selectedProjId);
                  if (!targetProj) return null;

                  return (
                    <div className="space-y-4" id="selected-assignment-details">
                      <div className="bg-black/40 p-3.5 rounded-xl border border-white/[0.03] flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold">Scope of Work:</span>
                          <p className="text-xs text-neutral-300 mt-1 pb-1 font-sans leading-relaxed italic">
                            "{targetProj.description}"
                          </p>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono font-bold uppercase shrink-0">
                          {targetProj.currentStage}
                        </span>
                      </div>

                      {/* Employee checklists */}
                      <span className="text-[10px] font-mono tracking-widest text-[#FFA089] block pt-2 border-t border-white/[0.04] uppercase font-bold">
                        Staff Assignment Mapping
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="assignment-matrix-checklist">
                        {employees.map(emp => {
                          const isAssigned = targetProj.assignedEmployeeIds.includes(emp.uid);

                          return (
                            <div
                              key={emp.uid}
                              onClick={() => handleUpdateAssignment(emp.uid, !isAssigned)}
                              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                isAssigned
                                  ? 'bg-[#67b2b6]/10 border-[#67b2b6]/35 shadow-sm'
                                  : 'bg-black/40 border-white/5 hover:border-white/15'
                              }`}
                              id={`assignee-toggle-${emp.uid}`}
                            >
                              <div>
                                <span className="font-extrabold block text-xs text-white">{emp.fullName}</span>
                                <span className="text-[9px] font-mono text-neutral-400 mt-0.5 block">{emp.designation}</span>
                              </div>

                              <span className={`text-[9px] font-mono px-2 py-0.8 rounded-lg font-extrabold tracking-wider ${
                                isAssigned ? 'bg-[#67b2b6] text-black shadow-md' : 'bg-neutral-800 text-neutral-400'
                              }`}>
                                {isAssigned ? 'ACTIVE' : 'STANDBY'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()
              )}

            </div>
          </div>
        )}

        {/* 7. DAILY PROGRESS (LIST VIEWS & FILTERED CARDS) */}
        {activeTab === 'progress' && (
          <div className="space-y-6 animate-fade-in" id="progress-tab-view">
            
            {/* Filter bars */}
            <div className="glass-panel border border-white/[0.04] p-4.5 rounded-2xl grid grid-cols-1 sm:grid-cols-5 gap-3.5 shadow-md" id="progress-filter-panel">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold tracking-widest block">Filter Date</span>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#67b2b6] font-mono"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold tracking-widest block">Filter Employee</span>
                <select
                  value={filterEmp}
                  onChange={(e) => setFilterEmp(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#67b2b6]"
                >
                  <option value="">All personnel</option>
                  {employees.map(e => <option key={e.uid} value={e.uid}>{e.fullName}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold tracking-widest block">Filter Project</span>
                <select
                  value={filterProj}
                  onChange={(e) => setFilterProj(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#67b2b6]"
                >
                  <option value="">All active portfolio</option>
                  {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold tracking-widest block">Filter Stage</span>
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#67b2b6]"
                >
                  <option value="">All active stages</option>
                  <option value="Early Stage">Early Stage</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Final Stage">Final Stage</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold tracking-widest block">Keyword search</span>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter summary/notes..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 pl-8 text-xs text-white focus:outline-none focus:border-[#67b2b6]"
                  />
                  <Search size={12} className="absolute left-2.5 top-3.5 text-neutral-400" />
                </div>
              </div>
            </div>

            {/* Submissions results list */}
            {(() => {
              const filteredList = progressList.filter(log => {
                if (filterDate && log.date !== filterDate) return false;
                if (filterEmp && log.employeeUid !== filterEmp) return false;
                if (filterProj && log.projectId !== filterProj) return false;
                if (filterStage && log.selectedStage !== filterStage) return false;
                if (searchQuery) {
                  const match = log.workSummary.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                (log.notes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                log.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                log.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
                  if (!match) return false;
                }
                return true;
              });

              return (
                <div className="space-y-4" id="filtered-progress-results">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-mono tracking-widest text-[#FFA089] uppercase font-bold">
                      Progress Database Entries ({filteredList.length})
                    </span>
                    {(filterDate || filterEmp || filterProj || filterStage || searchQuery) && (
                      <button
                        onClick={() => {
                          setFilterDate('');
                          setFilterEmp('');
                          setFilterProj('');
                          setFilterStage('');
                          setSearchQuery('');
                        }}
                        className="text-[10px] font-mono text-[#67b2b6] font-bold uppercase border-b border-[#67b2b6]/40 hover:border-[#67b2b6] cursor-pointer"
                      >
                        Reset Operational Filters
                      </button>
                    )}
                  </div>

                  {filteredList.length === 0 ? (
                    <div className="text-center py-20 bg-black/25 border border-dashed border-white/[0.04] rounded-2xl text-neutral-400 text-xs font-mono">
                      No progressive submission entries matched your selection criteria.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredList.map((log) => (
                        <div key={log.progressId} className="glass-panel rounded-2xl p-5 space-y-3.5 shadow-md relative overflow-hidden h-fit" id={`log-card-${log.progressId}`}>
                          
                          {/* Locked Badge */}
                          <div className="absolute top-4 right-4 flex items-center space-x-1.5 border border-emerald-500/10 bg-emerald-500/5 px-2.5 py-0.8 rounded-lg text-[9px] font-mono text-emerald-400 font-extrabold shadow-sm">
                            <Lock size={9} />
                            <span>IMMUTABLE COMMIT LOCKED</span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.04] pb-3">
                            <div className="flex items-center space-x-3.5">
                              <div className="h-9 w-9 bg-neutral-900 border border-white/5 rounded-xl text-[#FFA089] font-black text-sm flex items-center justify-center shadow-inner">
                                {log.employeeName.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-white font-display leading-tight">{log.employeeName}</h4>
                                <span className="text-[10px] font-mono text-neutral-400 block mt-1 font-semibold">{log.employeeId} • Logged: <strong className="text-white font-bold">{log.date}</strong></span>
                              </div>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-neutral-500 uppercase block sm:text-right font-bold">Project Scope</span>
                              <span className="text-xs font-bold text-white sm:text-right block font-display mt-0.5">{log.projectName}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[9px] font-mono text-neutral-500 uppercase block leading-none font-bold">Activity Summary:</span>
                            <p className="text-xs text-neutral-300 leading-relaxed italic bg-black/35 p-3.5 rounded-xl border border-white/[0.02]">
                              "{log.workSummary}"
                            </p>
                          </div>

                          {log.notes && (
                            <div className="text-xs">
                              <span className="text-[9px] font-mono text-neutral-500 uppercase block mb-1 font-bold">Feedback / Request comments:</span>
                              <span className="text-neutral-400 block text-[11px] bg-white/[0.01] p-2 rounded-lg border border-white/[0.03] italic">"{log.notes}"</span>
                            </div>
                          )}

                          <div className="pt-2.5 flex flex-wrap items-center justify-between gap-4 text-xs select-none border-t border-white/[0.03]">
                            <div className="flex items-center space-x-4">
                              <span className="font-mono text-[10px] text-neutral-300 bg-white/[0.03] px-2.5 py-0.5 rounded-lg border border-white/[0.04]">
                                Stage: <strong className="text-white font-bold">{log.selectedStage}</strong>
                              </span>
                              <span className="font-mono text-[10px] text-neutral-400">
                                Completion: <strong className="text-[#67b2b6] font-bold">{log.autoCompletionPercent}%</strong>
                              </span>
                            </div>

                            <span className={`text-[10px] font-mono font-extrabold uppercase ${
                              log.healthStatus === 'Excellent' || log.healthStatus === 'On Track' ? 'text-emerald-400' : 'text-rose-400 animate-pulse'
                            }`}>
                              System Health: {log.healthStatus}
                            </span>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        )}

        {/* 8. CALENDAR VIEW PAGE */}
        {activeTab === 'calendar' && (
          <div className="max-w-2xl mx-auto glass-panel border border-white/[0.04] p-6 md:p-8 rounded-3xl space-y-6 shadow-xl relative animate-fade-in" id="calendar-tab-view">
            <div className="border-b border-white/[0.04] pb-4 text-center">
              <span className="text-[9px] font-mono text-[#67b2b6] tracking-widest font-bold block uppercase">
                Active studio calendar tracking-map
              </span>
              <h2 className="text-lg font-black text-white mt-1 font-display">Workforce Progress Master Tracker</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Interactive sequence ledger of daily progress logs across all active departments.
              </p>
            </div>

            <ConsistencyHeatmap progressList={progressList} daysCount={28} />
          </div>
        )}

        {/* 9. EXECUTIVE REPORTS SCREEN */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-fade-in" id="reports-tab-view">
            <ReportBuilder 
              projects={projects} 
              employees={employees} 
              progressList={progressList} 
              themeMode={themeMode} 
            />
          </div>
        )}

        {/* 10. GLOBAL ADVANCED ANALYTICS PAGE */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in" id="analytics-tab-view">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* STAGE METRICS DETAILED BAR CHARTS */}
              <div className="glass-panel border border-white/[0.04] p-5 rounded-3xl space-y-4 shadow-lg" id="adv-analytics-projects">
                <div className="border-b border-white/[0.04] pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase font-mono font-display">Comparative Progress Maps</h3>
                    <span className="text-[9px] text-neutral-400 font-mono block mt-1">Tracking alignment deviation</span>
                  </div>
                </div>
                <CompletionProgressCompareChart projects={projects} />
              </div>

              {/* SYSTEM AUDITING LOGS OVERVIEWS */}
              <div className="glass-panel border border-white/[0.04] p-5 rounded-3xl space-y-4 shadow-lg" id="adv-analytics-logs">
                <div className="border-b border-white/[0.04] pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase font-mono font-display">System Action Ledger</h3>
                    <span className="text-[9px] text-neutral-400 font-mono block mt-1">Immutable administrative access records</span>
                  </div>
                  <span className="text-[9px] font-mono bg-white/[0.03] px-2.5 py-0.5 rounded-lg border border-white/[0.05] text-[#67b2b6] font-bold">SECURE CHANNEL</span>
                </div>

                <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                  {logs.length === 0 ? (
                    <span className="text-neutral-500 font-mono text-[10px] block py-6 text-center">No transactional entries recorded.</span>
                  ) : (
                    logs.map((log) => (
                      <div key={log.logId} className="border-b border-white/[0.02] pb-3 last:border-0 last:pb-0 font-mono text-[10px] text-neutral-300" id={`audit-log-${log.logId}`}>
                        <div className="flex justify-between items-center text-neutral-500 text-[9px]">
                          <span className="font-bold">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <span className="uppercase text-[#67b2b6] font-bold tracking-wider">{log.targetType}</span>
                        </div>
                        <p className="text-neutral-200 mt-1.5 leading-relaxed bg-black/25 p-2 rounded-lg border border-white/[0.01]">
                          Administrative registry {log.username} checked/created: <strong className="text-[#FFA089] font-semibold">{log.action}</strong>
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 11. STATE CONTROL SETTINGS PANEL */}
        {activeTab === 'settings' && (
          <div className="max-w-xl mx-auto glass-panel border border-white/[0.04] p-6 md:p-8 rounded-3xl space-y-6 shadow-xl relative animate-fade-in" id="settings-tab-view">
            <div className="border-b border-white/[0.04] pb-4">
              <span className="text-[9px] font-mono text-[#67b2b6] tracking-widest font-bold block uppercase">
                System Global Settings
              </span>
              <h2 className="text-lg font-black text-white mt-1 font-display">Operational Control Panel</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Establish company parameters and constraints.
              </p>
            </div>

            <form onSubmit={handleUpdateSettings} className="space-y-5" id="settings-ops-form">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider block">Company Registry Name</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#67b2b6]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider block">Preferred Interface Theme Tone</label>
                <select
                  value={settings.themeMode}
                  onChange={(e) => {
                    const nextTheme = e.target.value as 'dark' | 'light';
                    setSettings({ ...settings, themeMode: nextTheme });
                    document.body.className = nextTheme === 'light' ? 'bg-zinc-100 text-neutral-900' : 'bg-[#04060a] text-neutral-100';
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#67b2b6]"
                >
                  <option value="dark">Cinematic Command Dark (Mandated)</option>
                  <option value="light">Refined Enterprise Light (Alternative)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider block">Default Reminder Cutoff Indicator</label>
                <input
                  type="time"
                  value={settings.defaultReminderTime}
                  onChange={(e) => setSettings({ ...settings, defaultReminderTime: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#67b2b6] font-mono"
                />
              </div>

              <div className="p-4 bg-zinc-950/80 border border-white/[0.04] rounded-2xl flex items-center justify-between shadow-inner" id="settings-locked-stages-checkbox">
                <div>
                  <span className="text-xs font-bold text-white block font-display">Enforce Immutable Progression Locks</span>
                  <p className="text-[10px] text-neutral-450 mt-1 max-w-[280px] font-mono leading-relaxed font-semibold">
                    Personnel cannot modify logged daily updates once registered in the post database.
                  </p>
                </div>
                <div className="h-6 w-11 bg-[#67b2b6] rounded-full flex items-center justify-end px-1.2 cursor-not-allowed shadow-inner">
                  <span className="h-4.5 w-4.5 bg-neutral-950 rounded-md shadow-md animate-pulse" />
                </div>
              </div>

              {/* STUDIO CINEMATIC MODE TOGGLE SWITCH */}
              <div 
                onClick={() => {
                  if (setStudioMode) {
                    const flip = !studioMode;
                    setStudioMode(flip);
                    store.setStudioMode(flip);
                  }
                }}
                className="p-4 bg-zinc-950/80 border border-white/[0.04] rounded-2xl flex items-center justify-between shadow-md cursor-pointer hover:border-[#67b2b6]/30 transition-all select-none" id="settings-studio-mode-toggle"
              >
                <div>
                  <span className="text-xs font-bold text-white block font-display flex items-center space-x-1.5">
                    <Sparkles size={13} className="text-[#67b2b6] animate-pulse" />
                    <span>Enable Live Studio Mode (3D Motion)</span>
                  </span>
                  <p className="text-[10px] text-neutral-450 mt-1 max-w-[280px] font-mono leading-relaxed">
                    Activates beautiful 3D rotating Command Core, glowing particle drift, dynamic progress rings and timeline layers. Disable for legacy hardware.
                  </p>
                </div>
                <div className={`h-6 w-11 rounded-full p-1 transition-all flex items-center shadow-inner ${
                  studioMode ? 'bg-[#67b2b6]' : 'bg-neutral-800'
                }`}>
                  <div className={`h-4.5 w-4.5 bg-[#06080d] rounded-full shadow transition-all ${
                    studioMode ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {settingsFormSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium space-y-1.5 animate-fade-in">
                  <div className="flex items-center space-x-2 font-bold font-mono text-white">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>SYSTEM PRESETS APPLIED</span>
                  </div>
                  <p className="text-neutral-300 font-mono text-[10px] leading-relaxed">
                    {settingsFormSuccess}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingSettings}
                className="w-full bg-gradient-to-r from-[#67b2b6] to-[#4fa0a4] text-neutral-900 font-extrabold py-3.5 rounded-xl hover:opacity-95 transition-all text-xs tracking-wider flex items-center justify-center space-x-2.5 shadow-lg shadow-[#67b2b6]/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed select-none mt-2"
              >
                {isSavingSettings ? (
                  <Loader2 size={15} className="animate-spin text-neutral-900" />
                ) : null}
                <span>{isSavingSettings ? 'COMMITTING OPERATIONAL SPECIFICATIONS...' : 'COMMIT OPERATIONS LAWS TO CONFIG FILE'}</span>
              </button>
            </form>
          </div>
        )}

      </main>

      {/* PROJECT DETAIL COMMAND PAGE MODAL (Feature #12) */}
      {selectedProjectForDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`w-full max-w-3xl rounded-3xl border p-6 md:p-8 space-y-6 ${
            themeMode === 'light' ? 'bg-amber-50 border-stone-200 text-stone-900' : 'bg-[#0a0e17] border-white/10 text-neutral-200'
          }`}>
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#67b2b6] uppercase tracking-widest font-bold">PROJECT COMMAND CENTER LEVEL 3</span>
                <h2 className="text-xl font-black font-display text-white mt-1">{selectedProjectForDetail.projectName}</h2>
                <span className="text-xs text-neutral-400 font-mono">CODE ID: {selectedProjectForDetail.projectCode}</span>
              </div>
              <button
                onClick={() => setSelectedProjectForDetail(null)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono font-bold cursor-pointer"
              >
                DISMISS ESC
              </button>
            </div>

            {/* Timeline & Risk Intelligence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-3">
                <span className="text-[10px] font-mono text-neutral-500 block uppercase">Timeline & Deadlines</span>
                <div className="flex justify-between text-xs">
                  <span>Start Date</span>
                  <span className="font-mono text-neutral-300">{selectedProjectForDetail.startDate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Studio Deadline</span>
                  <span className="font-mono text-[#FFA089] font-bold">{selectedProjectForDetail.deadline}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Priority Risk Threat</span>
                  <span className="font-bold text-rose-400 font-mono uppercase">{selectedProjectForDetail.priority}</span>
                </div>
              </div>

              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-3">
                <span className="text-[10px] font-mono text-neutral-500 block uppercase">Progression Vectors</span>
                <div className="flex justify-between text-xs">
                  <span>Required Progress Rate</span>
                  <span className="font-mono">{selectedProjectForDetail.expectedProgressPercent}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Actual Complete Logs</span>
                  <span className="font-mono text-[#67b2b6] font-extrabold">{selectedProjectForDetail.currentCompletionPercent}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>System Health Quotient</span>
                  <span className="font-mono text-emerald-400 uppercase font-bold">{selectedProjectForDetail.healthStatus}</span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE DEADLINE TIMELINE VECTOR */}
            <div className="p-4 rounded-2xl bg-neutral-950/40 border border-white/[0.03]" id="project-detail-3d-timeline-wrapper">
              <span className="text-[10px] font-mono text-neutral-500 block uppercase mb-4">Studio 3D Progression Vector Timeline</span>
              <DeadlineTimeline3D project={selectedProjectForDetail} />
            </div>

            {/* Progress Log Timeline for Project */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-white block font-display">Workforce Progress History ({progressList.filter(l => l.projectId === selectedProjectForDetail.projectId).length} logs)</span>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {progressList.filter(l => l.projectId === selectedProjectForDetail.projectId).map(log => (
                  <div key={log.progressId} className="p-3 bg-black/25 border border-white/5 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <strong className="text-neutral-200">{log.employeeName}</strong>
                      <p className="text-[11px] text-neutral-400 leading-relaxed italic mt-1 font-mono">
                        "{log.workSummary}"
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-500 ml-4 shrink-0">{log.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin private notes block - HIDDEN IN CLIENT MODE */}
            {!clientMode ? (
              <AdminPrivateNotes type="projects" targetId={selectedProjectForDetail.projectId} themeMode={themeMode} />
            ) : (
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[10px] font-mono text-amber-500 text-center uppercase tracking-wide">
                * Presented client mode active: confidential administrative comments concealed
              </div>
            )}
          </div>
        </div>
      )}

      {/* EMPLOYEE DETAIL COMMAND PAGE MODAL (Feature #13) */}
      {selectedEmployeeForDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`w-full max-w-3xl rounded-3xl border p-6 md:p-8 space-y-6 ${
            themeMode === 'light' ? 'bg-amber-50 border-stone-200 ' : 'bg-[#0a0e17] border-white/10 '
          }`}>
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-[#67b2b6]/10 border border-[#67b2b6]/35 text-[#67b2b6] text-xl font-bold flex items-center justify-center">
                  {selectedEmployeeForDetail.fullName.charAt(0)}
                </div>
                <div>
                  <span className="text-[9px] font-mono text-neutral-400 tracking-wider block">STUDIO CREATIVE RESOURCES</span>
                  <h2 className="text-lg font-black font-display text-white leading-none mt-1">{selectedEmployeeForDetail.fullName}</h2>
                  <span className="text-xs text-neutral-500 font-mono mt-1 block">{selectedEmployeeForDetail.employeeId}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployeeForDetail(null)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono font-bold cursor-pointer text-white"
              >
                DISMISS ESC
              </button>
            </div>

            {/* Resource details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-3">
                <span className="text-[10px] font-mono text-neutral-500 block uppercase">Department & Role</span>
                <div className="flex justify-between">
                  <span>Scope Track</span>
                  <span className="font-semibold text-neutral-300">{selectedEmployeeForDetail.department}</span>
                </div>
                <div className="flex justify-between">
                  <span>Designation</span>
                  <span className="font-semibold text-white">{selectedEmployeeForDetail.designation}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mail Client</span>
                  <span className="font-mono text-neutral-400">{selectedEmployeeForDetail.email}</span>
                </div>
              </div>

              {/* Consistency Scoring Feature #5 */}
              {(() => {
                const scoreCard = store.getEmployeeConsistencyScore(selectedEmployeeForDetail.uid);
                return (
                  <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-3">
                    <span className="text-[10px] font-mono text-neutral-500 block">Consistency Evaluation score</span>
                    <div className="flex justify-between">
                      <span>Trailing Score Rank</span>
                      <span className={`font-mono uppercase font-bold text-xs ${
                        scoreCard.score === 'Excellent' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>{scoreCard.score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Regularity Rate</span>
                      <strong className="text-white">{scoreCard.regularityRate}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Missed Sessions (7d)</span>
                      <span className="text-rose-400 font-bold font-mono">{scoreCard.missedCount} days</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Submission Heatmap */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-neutral-500 block">CONFORMANCE MATRIX (TRAILING 28 DAYS)</span>
              <ConsistencyHeatmap progressList={progressList.filter(p => p.employeeUid === selectedEmployeeForDetail.uid)} daysCount={28} />
            </div>

            {/* Project List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white block">Active Assigned Project Scopes</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {projects.filter(p => p.assignedEmployeeIds.includes(selectedEmployeeForDetail.uid)).map(p => (
                  <div key={p.projectId} className="p-3 bg-black/25 border border-white/5 rounded-xl flex justify-between items-center">
                    <span className="font-bold text-white">{p.projectName}</span>
                    <span className="text-[10.5px] font-mono text-neutral-500">{p.currentStage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Private Notes for Employee - HIDDEN IN CLIENT MODE */}
            {!clientMode ? (
              <AdminPrivateNotes type="employees" targetId={selectedEmployeeForDetail.uid} themeMode={themeMode} />
            ) : (
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[10px] font-mono text-amber-500 text-center uppercase tracking-wide">
                * Presented client mode active: confidential administrative comments concealed
              </div>
            )}
          </div>
        </div>
      )}

      {/* Misu Operations GPT Chatbot */}
      <MisuChatbot 
        projects={projects} 
        employees={employees} 
        progressList={progressList} 
        themeMode={themeMode} 
      />

    </div>
  );
}
