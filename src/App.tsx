/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { User } from './types';
import { store } from './services/store';
import { auth } from './services/firebase';
import MS2Logo from './components/MS2Logo';
import AdminPanel from './components/AdminPanel';
import EmployeePanel from './components/EmployeePanel';
import { CinematicBackground } from './components/CinematicBackground';
import { CommandCoreErrorBoundary } from './components/CommandCoreErrorBoundary';
import { CommandCoreSkeleton } from './components/CommandCoreSkeleton';
import { useLoginGSAPAnimations } from './hooks/useLoginGSAPAnimations';

const CommandCore3D = lazy(() => import('./components/CommandCore3D').then(m => ({ default: m.CommandCore3D })));
import {
  ShieldAlert,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Briefcase,
  PlaySquare,
  Sparkles,
  ExternalLink,
  Info,
  HelpCircle,
  X
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  
  // Theme control state
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  // Studio Mode control state
  const [studioMode, setStudioMode] = useState(store.getStudioMode());

  // Sandbox Mode state
  const [isSandbox, setIsSandbox] = useState(store.getSandboxMode());

  // Fast demo selection tool to speed up client testing
  const [showDemoAssistant, setShowDemoAssistant] = useState(true);

  // GSAP Animation Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const logoWrapperRef = useRef<HTMLDivElement | null>(null);
  const brandingCardRef = useRef<HTMLDivElement | null>(null);
  const loginCardRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const demoAssistantRef = useRef<HTMLDivElement | null>(null);

  const { triggerErrorShake, triggerSuccessExit } = useLoginGSAPAnimations({
    container: containerRef,
    logo: logoWrapperRef,
    brandingCard: brandingCardRef,
    loginCard: loginCardRef,
    title: titleRef,
    subtitle: subtitleRef,
    form: formRef,
    submitButton: submitButtonRef,
    demoAssistant: demoAssistantRef,
  });

  // Check if session persisted and handle reactive synchronizations
  useEffect(() => {
    const saved = localStorage.getItem('ms2_active_session');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        // Refresh session from local users registry
        const activeUser = store.getUsers().find(x => x.uid === u.uid);
        if (activeUser && activeUser.status === 'active') {
          setCurrentUser(activeUser);
        }
      } catch (e) {
        localStorage.removeItem('ms2_active_session');
      }
    }

    // Subscribe to store updates to capture sandbox flips and state synchronization
    const unsub = store.subscribe(() => {
      setIsSandbox(store.getSandboxMode());
      setStudioMode(store.getStudioMode());
    });
    return unsub;
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!usernameInput.trim() || !passwordInput) {
      setLoginError('Username/Email and Password are required.');
      triggerErrorShake('login-input-card');
      return;
    }

    try {
      const authResult = await store.authenticateUser(usernameInput.trim(), passwordInput);
      if (authResult.success && authResult.user) {
        triggerSuccessExit(() => {
          setCurrentUser(authResult.user);
          localStorage.setItem('ms2_active_session', JSON.stringify(authResult.user));
        });
      } else {
        setLoginError(authResult.error || 'Authentication rejected.');
        triggerErrorShake('login-input-card');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Error occurred during login.');
      triggerErrorShake('login-input-card');
    }
  };

  const handleSecureLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ms2_active_session');
    store.stopFirebaseSync();
    import('firebase/auth').then(({ signOut }) => signOut(auth));
    setUsernameInput('');
    setPasswordInput('');
  };

  const handleDemoQuickFill = (userType: 'admin' | 'madhur' | 'abhishek' | 'krishna') => {
    setLoginError('');
    if (userType === 'admin') {
      setUsernameInput('Ratan');
      setPasswordInput('RatanMs2Admin');
    } else if (userType === 'madhur') {
      setUsernameInput('Madhur');
      setPasswordInput('MS2-EMP-465');
    } else if (userType === 'abhishek') {
      setUsernameInput('Abhishek');
      setPasswordInput('MS2-EMP-007');
    } else if (userType === 'krishna') {
      setUsernameInput('Krishna');
      setPasswordInput('MS2-EMP-420');
    }
  };

  // Route screen depending on authenticated role
  if (currentUser) {
    if (currentUser.role === 'admin') {
      return (
        <AdminPanel
          adminUser={currentUser}
          onLogout={handleSecureLogout}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          studioMode={studioMode}
          setStudioMode={setStudioMode}
        />
      );
    } else {
      return (
        <EmployeePanel
          employeeUser={currentUser}
          onLogout={handleSecureLogout}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          studioMode={studioMode}
          setStudioMode={setStudioMode}
        />
      );
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#06080d] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none" id="login-screen-surface">
      
      {/* BACKGROUND CINEMATIC LIGHT PATTERNS */}
      <CinematicBackground studioMode={studioMode} />

      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-stretch justify-center gap-6 relative z-10" id="login-layout-wrapper">
        
        {/* VIEW 1: LEFT DESCRIPTIVE BANNER (THE STUDIO BRANDING) */}
        <div ref={brandingCardRef} className="flex-1 hidden lg:flex flex-col justify-between p-10 bg-[#0a0e17]/40 border border-white/5 rounded-3xl backdrop-blur-md relative" id="branding-description-card">
          <div className="space-y-6">
            <div ref={logoWrapperRef} className="flex items-center space-x-3.5">
              <MS2Logo className="w-12 h-auto" variant="icon" />
              <div>
                <span className="font-bold tracking-tight text-white block text-sm">MS2 ENTERTAINMENT</span>
                <span className="text-[10px] font-mono text-[#67b2b6] tracking-widest uppercase">OPERATIONS HUB</span>
              </div>
            </div>

            <div className="space-y-4 pt-10">
              <h2 ref={titleRef} className="text-3xl font-black text-white tracking-tight leading-tight">
                Studio Project <br />
                <span className="text-[#FFA089] bg-gradient-to-r from-[#FFA089] to-[#ee8d74] bg-clip-text text-transparent">Command Center</span>
              </h2>
              <p ref={subtitleRef} className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                A premium, high-end post-production, entertainment, operations workspace. Securely orchestrate editor logs, designer assets, and team timelines.
              </p>
            </div>
          </div>

          {/* SPINNING 3D COMMAND CORE COMPONENT IN SIGN-IN MATRIX BACKGROUND */}
          <div className="my-2 select-none h-40 flex items-center justify-center">
            <CommandCoreErrorBoundary variant="login">
              <Suspense fallback={<CommandCoreSkeleton variant="login" />}>
                <CommandCore3D variant="login" studioMode={studioMode} />
              </Suspense>
            </CommandCoreErrorBoundary>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center space-x-3.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Real-Time Auto-Calculations Active</span>
              </div>
              {/* STUDIO LIGHTS CHIP TOGGLER */}
              <button 
                onClick={() => {
                  const flip = !studioMode;
                  setStudioMode(flip);
                  store.setStudioMode(flip);
                }}
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border transition-all ${
                  studioMode 
                    ? 'bg-[#67b2b6]/10 border-[#67b2b6]/30 text-[#67b2b6]' 
                    : 'bg-white/5 border-white/5 text-neutral-500'
                }`}
              >
                STUDIO MOTION: {studioMode ? 'HIGH-3D' : 'REST'}
              </button>
            </div>
            <p className="text-[10px] font-mono text-neutral-500">
              MS2 Project Tracker • Version 2.1.0 • Developed by Abhishek Goswami
            </p>
          </div>
        </div>

        {/* VIEW 2: LOGIN FORM BOX */}
        <div ref={loginCardRef} className="w-full lg:w-[460px] bg-[#0a0e17] border border-white/5 rounded-3xl p-6 md:p-10 flex flex-col justify-between shadow-2xl space-y-6" id="login-input-card">
          
          <div className="space-y-5">
            {/* Minimal logo for mobile */}
            <div className="flex lg:hidden items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <MS2Logo className="w-9 h-auto" variant="icon" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">MS2</span>
              </div>
              <span className="text-[9px] font-mono text-neutral-500">Studio tracker</span>
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-none">Authentication Vault</h3>
              <p className="text-xs text-neutral-400 mt-1.5 font-medium">Verify your organizational credentials to enter.</p>
            </div>

            <form ref={formRef} onSubmit={handleLoginSubmit} className="space-y-4" id="portal-login-form">
              {isSandbox && (
                <div className="p-3 bg-[#67b2b6]/10 border border-[#67b2b6]/25 rounded-xl flex items-center justify-between text-[#67b2b6] text-[11px] font-sans">
                  <div className="flex items-center space-x-2">
                    <Sparkles size={13} className="animate-pulse" />
                    <span className="font-semibold">Offline Sandbox Mode Active</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      store.setSandboxMode(false);
                      setLoginError('');
                    }}
                    className="text-[10px] font-mono underline hover:text-white"
                  >
                    Use Live Firebase
                  </button>
                </div>
              )}

              {loginError === 'firebase-unconfigured' ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl space-y-3" id="login-error-alert">
                  <div className="flex items-start space-x-2 text-amber-400">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold">Firebase Auth Provider Disabled</p>
                      <p className="text-[11px] leading-relaxed text-neutral-300">
                        Email/Password login is not enabled in your Firebase project console yet.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 space-y-1.5">
                    <p className="text-[9px] uppercase font-mono tracking-wider text-amber-500/90 font-bold">To Enable it In Firebase Console:</p>
                    <ol className="text-[10px] text-neutral-400 list-decimal list-inside space-y-1 font-sans">
                      <li>Open <span className="text-white">Firebase Console</span></li>
                      <li>Go to <span className="text-white">Authentication &gt; Sign-in method</span></li>
                      <li>Click <span className="text-white">Add provider</span>, select <span className="text-white">Email/Password</span>, toggle <span className="text-[#67b2b6] font-semibold">Enable</span>, and save.</li>
                    </ol>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5">
                    <p className="text-[10px] text-neutral-400 leading-normal">
                      Or bypass integration issues and use the local offline sandbox simulator immediately:
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        store.setSandboxMode(true);
                        setLoginError('');
                      }}
                      className="w-full bg-amber-500/25 hover:bg-amber-500/35 text-amber-300 border border-amber-500/40 font-bold py-2 px-3 rounded-lg text-[11px] tracking-wide flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <PlaySquare size={12} />
                      <span>LAUNCH LOCAL SANDBOX SIMULATOR</span>
                    </button>
                  </div>
                </div>
              ) : loginError ? (
                <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-xs font-mono flex items-center space-x-2" id="login-error-alert">
                  <ShieldAlert size={14} />
                  <span>{loginError}</span>
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-semibold block">Username or Email</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. Ratan or Madhur"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#67b2b6] tracking-wide transition-all duration-300 focus:shadow-[0_0_12px_rgba(103,178,182,0.15)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-semibold block">Credential Password</label>
                  <span className="text-[10px] text-neutral-500 font-mono tracking-tighter">Matches employee ID/Admin Key</span>
                </div>
                
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#67b2b6] font-mono tracking-widest transition-all duration-300 focus:shadow-[0_0_12px_rgba(103,178,182,0.15)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-white transition-all"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-[10px] font-mono text-neutral-450 hover:text-[#67b2b6] transition-colors focus:outline-none uppercase tracking-wider flex items-center space-x-1"
                  >
                    <HelpCircle size={11} className="opacity-70" />
                    <span>Forgot Password?</span>
                  </button>
                </div>
              </div>

              <button
                ref={submitButtonRef}
                type="submit"
                className="w-full bg-gradient-to-r from-[#67b2b6] to-[#4fa0a4] text-neutral-900 font-bold py-3 px-4 rounded-xl hover:shadow-[0_0_20px_rgba(103,178,182,0.35)] transition-all text-xs tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-[#67b2b6]/15 hover:scale-[1.01]"
              >
                <Unlock size={13} />
                <span>CONFIRM PASSWORD AND ENTER</span>
              </button>
            </form>
          </div>

          {/* DEMO ACCOUNTS ASSISTANT INJECTOR */}
          {showDemoAssistant && (
            <div ref={demoAssistantRef} className="p-3.5 bg-[#67b2b6]/5 border border-[#67b2b6]/10 rounded-2xl space-y-2.5" id="testing-accounts-panel">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300">
                <span className="flex items-center space-x-1.5 text-[#67b2b6]">
                  <Sparkles size={12} />
                  <span>Portal Quick Test Assistant</span>
                </span>
                <span className="text-[9px] font-mono text-neutral-500">Fast Auto-Fill</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <button
                  onClick={() => handleDemoQuickFill('admin')}
                  className="bg-black/40 hover:bg-black/70 p-2 rounded-lg border border-white/5 hover:border-white/15 transition-all text-left group"
                >
                  <span className="font-semibold text-white block group-hover:text-[#FFA089]">1. Admin Ratan</span>
                  <span className="text-neutral-500 font-mono text-[9px]">Full Control panel</span>
                </button>

                <button
                  onClick={() => handleDemoQuickFill('madhur')}
                  className="bg-black/40 hover:bg-black/70 p-2 rounded-lg border border-white/5 hover:border-white/15 transition-all text-left group"
                >
                  <span className="font-semibold text-white block group-hover:text-[#67b2b6]">2. Editor Madhur</span>
                  <span className="text-neutral-500 font-mono text-[9px]">Post-Production view</span>
                </button>

                <button
                  onClick={() => handleDemoQuickFill('abhishek')}
                  className="bg-black/40 hover:bg-black/70 p-2 rounded-lg border border-white/5 hover:border-white/15 transition-all text-left group"
                >
                  <span className="font-semibold text-white block group-hover:text-[#67b2b6]">3. Designer Abhi</span>
                  <span className="text-neutral-500 font-mono text-[9px]">Creative Design view</span>
                </button>

                <button
                  onClick={() => handleDemoQuickFill('krishna')}
                  className="bg-black/40 hover:bg-black/70 p-2 rounded-lg border border-white/5 hover:border-white/15 transition-all text-left group"
                >
                  <span className="font-semibold text-white block group-hover:text-[#67b2b6]">4. Producer Krishna</span>
                  <span className="text-neutral-500 font-mono text-[9px]">Filming & Audio view</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" id="forgot-password-modal">
          <div className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative p-6 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#67b2b6]/10 rounded-lg text-[#67b2b6]">
                  <HelpCircle size={18} />
                </div>
                <div>
                  <h3 className="text-white text-xs font-black uppercase tracking-wider font-mono">Password Recovery Help</h3>
                  <p className="text-[9px] text-neutral-400 font-mono tracking-tighter">Enterprise Post-Production System</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-neutral-500 hover:text-white transition-all p-1.5 hover:bg-white/5 rounded-lg"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs font-sans text-neutral-300 leading-relaxed">
              <p>
                Credentials and access logs are audited and secured behind the <span className="text-[#67b2b6] font-semibold font-mono">MS2 Portal Security System</span>. Self-service password recovery is restricted to protect media assets.
              </p>
              
              {/* Alert Warning */}
              <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1.5 text-neutral-450 text-[11px] leading-relaxed">
                <div className="flex items-center space-x-1.5 text-amber-500 font-bold uppercase tracking-wider text-[10px] font-mono">
                  <ShieldAlert size={12} />
                  <span>Security Protocol</span>
                </div>
                <p>
                  To request password recovery or credentials reset, please contact the primary network administrator with your registered details.
                </p>
              </div>

              {/* Administrative Contacts */}
              <div className="p-4 bg-black/30 border border-white/5 rounded-xl space-y-2">
                <span className="text-[9px] uppercase font-mono tracking-widest text-[#FFA089] font-bold block">Contact Information</span>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">System Admin:</span>
                    <span className="text-[#67b2b6] font-mono">admin@ms2-studios.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">IT Hotline:</span>
                    <span className="text-white font-mono">Ext. 402 / Secure-Line</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Service Hours:</span>
                    <span className="text-neutral-400">08:00 - 18:00 UTC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(false)}
              className="w-full bg-[#67b2b6]/15 hover:bg-[#67b2b6]/25 border border-[#67b2b6]/20 hover:border-[#67b2b6]/45 text-[#67b2b6] font-bold py-2.5 px-4 rounded-xl transition-all text-xs tracking-wider uppercase font-mono flex items-center justify-center space-x-2"
            >
              <span>UNDERSTOOD & DISMISS</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
