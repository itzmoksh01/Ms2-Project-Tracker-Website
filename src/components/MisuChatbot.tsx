/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  MessageSquare, 
  ChevronDown, 
  Loader2,
  Trash2,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  Volume2,
  VolumeX,
  Play,
  RotateCcw
} from 'lucide-react';
import { Project, User, DailyProgress } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface MisuChatbotProps {
  projects: Project[];
  employees: User[];
  progressList: DailyProgress[];
  themeMode?: 'light' | 'dark';
}

/**
 * Interactive 3D Hologram Mesh rendering engine
 * Formulates a rotating double-layer 3D mathematical particle sphere in realtime
 * Reacts to mouse pointer coordinates for interactive hover-tilt and accelerates when processing!
 */
function Hologram3D({ isThinking, isSpeaking }: { isThinking: boolean; isSpeaking: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Monitor coordinate boundaries relative to browser window
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseRef.current.targetX = x * 2.5;
      mouseRef.current.targetY = y * 2.5;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angleX = 0;
    let angleY = 0;

    // Build the 3D Sphere Points
    const points: { x: number; y: number; z: number; colorType: number }[] = [];
    const numPoints = 120;
    
    for (let i = 0; i < numPoints; i++) {
      // Golden Spiral distribution on a 3D Sphere surface
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      
      const r = 35; // base radius
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      points.push({ x, y, z, colorType: i % 3 });
    }

    const render = () => {
      // Clear with soft trails for dynamic holographic glow
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dampen mouse response smoothly
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;

      // Base rotation speeds, speed up if thinking or speaking
      const deltaSpeed = isThinking ? 0.05 : isSpeaking ? 0.025 : 0.008;
      angleX += deltaSpeed + mouseRef.current.y * 0.01;
      angleY += deltaSpeed * 1.5 + mouseRef.current.x * 0.01;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const focalLength = 100;

      // Draw horizontal orbital guide ring
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 38, 12, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(103, 178, 182, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Render connected lines occasionally to give a network grid feel
      ctx.strokeStyle = 'rgba(103, 178, 182, 0.06)';
      ctx.lineWidth = 0.5;
      
      // Plot and Project Points
      const projected = points.map(p => {
        // Rotate around Y axis
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.x * sinY + p.z * cosY;

        // Rotate around X axis
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        // Add a breathing pulse effect
        const breathMultiplier = 1 + (isThinking ? Math.sin(Date.now() * 0.01) * 0.15 : Math.sin(Date.now() * 0.003) * 0.05);
        x1 *= breathMultiplier;
        y2 *= breathMultiplier;
        z2 *= breathMultiplier;

        // Perspective Projection calculation
        const scale = focalLength / (focalLength + z2 + 80);
        const px = centerX + x1 * scale * 1.2;
        const py = centerY + y2 * scale * 1.2;

        return { px, py, scale, z: z2 };
      });

      // Render dots
      projected.forEach((p, idx) => {
        // Hide points thrown behind clipping plane
        if (p.scale <= 0) return;

        // Size adapts to 3D depth scale
        const radius = Math.max(0.6, p.scale * 2.2);
        
        ctx.beginPath();
        ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
        
        // Dynamic holographic gradient coloring based on depth and state
        const depthAlpha = Math.min(1, Math.max(0.15, (p.z + 40) / 80));
        let color = `rgba(103, 178, 182, ${depthAlpha * (isThinking ? 1 : 0.75)})`;
        if (idx % 4 === 0) {
          color = `rgba(255, 160, 137, ${depthAlpha * (isThinking ? 0.9 : 0.65)})`; // MS2 Coral Accent dot
        }
        
        ctx.fillStyle = color;
        ctx.fill();

        // Connect closely matched points to create digital constellation mesh
        if (idx < projected.length - 1 && idx % 7 === 0) {
          ctx.beginPath();
          ctx.moveTo(p.px, p.py);
          ctx.lineTo(projected[idx + 1].px, projected[idx + 1].py);
          ctx.stroke();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isThinking, isSpeaking]);

  return (
    <div className="relative w-20 h-20 flex items-center justify-center border border-white/[0.05] rounded-full overflow-hidden bg-black/40 shadow-inner">
      <canvas ref={canvasRef} width={80} height={80} className="w-20 h-20 block cursor-grab active:cursor-grabbing" />
      {/* Dynamic central AI core hub */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-300 ${
        isThinking 
          ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24] scale-110' 
          : isSpeaking 
            ? 'bg-[#67b2b6] shadow-[0_0_10px_#67b2b6] scale-105 animate-pulse' 
            : 'bg-[#67b2b6]/40 shadow-none scale-100'
      }`} />
    </div>
  );
}

export function MisuChatbot({ projects, employees, progressList, themeMode = 'dark' }: MisuChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      text: 'Good day, Commander! (•◡•) MS2 AI tracker reporting for duty! I have synchronized with the MS2 databases. Ask me anything about project delays, employee workloads, or workspace status!',
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Audio state tracking
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [activeSpeechLang, setActiveSpeechLang] = useState<'en' | 'hi' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto Scroll mechanism
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // focus input with slight delay to avoid layout interruption
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, messages]);

  // Clean speaking state if user closes the chat
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    // Stop speaking because new answers are arriving
    stopSpeaking();

    try {
      // Assemble data context corresponding to projects, employees, and latest progress updates
      const trackingContext = {
        totalProjectsCount: projects.length,
        totalEmployeesCount: employees.length,
        todayDate: '2026-06-17', // matching predefined local date system
        activeProjects: projects.map(p => ({
          code: p.projectCode,
          name: p.projectName,
          status: p.status,
          priority: p.priority,
          health: p.healthStatus,
          completionPercent: p.currentCompletionPercent,
          deadline: p.deadline,
          assignedCount: p.assignedEmployeeIds.length
        })),
        employees: employees.map(e => ({
          name: e.fullName,
          uid: e.uid,
          empId: e.employeeId,
          designation: e.designation,
          department: e.department
        })),
        recentLogs: progressList.slice(0, 12).map(l => ({
          employee: l.employeeName,
          project: l.projectName,
          date: l.date,
          stage: l.selectedStage,
          summary: l.workSummary,
          health: l.healthStatus
        }))
      };

      // Call our secure Express rest API route
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, text: m.text })),
          context: trackingContext
        })
      });

      if (!response.ok) {
        throw new Error('MS2 AI server communication error. Please check backend.');
      }

      const resData = await response.json();
      
      const assistantMsg: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        text: resData.text || 'Ah, the telemetry got interrupted! (◕‸◕) Double-check server keys!',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          role: 'assistant',
          text: `Oopsie! (◕‸◕) I had a small glitch. Make sure the GEMINI_API_KEY is configured in your Settings secrets! Error details: ${err.message || 'Server inaccessible'}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe getters to protect against security exceptions when accessing voice browser APIs in Sandboxed iFrames
  const getSpeechSynthesis = (): SpeechSynthesis | null => {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        return window.speechSynthesis;
      }
    } catch (err) {
      console.warn('speechSynthesis is not accessible in this environment:', err);
    }
    return null;
  };

  const getSpeechUtteranceClass = () => {
    try {
      if (typeof window !== 'undefined' && window.SpeechSynthesisUtterance) {
        return window.SpeechSynthesisUtterance;
      }
    } catch (err) {
      console.warn('SpeechSynthesisUtterance is not accessible in this environment:', err);
    }
    return null;
  };

  const hasSpeechSupport = useMemo(() => {
    return getSpeechSynthesis() !== null && getSpeechUtteranceClass() !== null;
  }, []);

  /**
   * Safe Text to Speech Speaker Subsystem
   * Dynamically filters out asterisks, markdown, and emoticons so standard speechSynthesis voice sounds super professional.
   */
  const speakMessage = (msgId: string, text: string, lang: 'en' | 'hi') => {
    const synth = getSpeechSynthesis();
    const UtteranceClass = getSpeechUtteranceClass();

    if (!synth || !UtteranceClass) {
      console.warn('SpeechSynthesis is not supported or is blocked in this environment.');
      return;
    }

    // If we're already speaking this language on this message, cancel and stop.
    if (currentlySpeakingId === msgId && activeSpeechLang === lang) {
      stopSpeaking();
      return;
    }

    try {
      // Cancel existing speech first
      synth.cancel();

      // Clean text: strip markdown asterisks and general emoticons
      let cleanText = text
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Strip bold marks
        .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '') // Strip emojis
        // Strip common cute emoticons (•◡•), (◕‸◕), (o^.^o), (◕‿◕✿) etc
        .replace(/\s*[＼(]+[^-^•◕o3✿]+[)^／✿]+\s*/g, ' ')
        .replace(/\(•◡•\)/g, '')
        .replace(/\(◕‸◕\)/g, '')
        .replace(/\(o\^.\^o\)/g, '')
        .replace(/\(◕‿◕✿\)/g, '')
        .replace(/\(\^-\^\*\)/g, '')
        .replace(/\(\*——\*\)/g, '')
        .replace(/ Commander!/g, ' Boss!')
        .trim();

      const utterance = new UtteranceClass(cleanText);

      if (lang === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-US';
      }

      // Bind correct voice profile
      try {
        const voices = synth.getVoices();
        let matchedVoice;
        
        if (lang === 'hi') {
          // Find native Hindi standard voice
          matchedVoice = voices.find(v => v.lang.toLowerCase().includes('hi-in') || v.lang.toLowerCase().startsWith('hi'));
        } else {
          // Find smooth English standard/natural voice
          matchedVoice = voices.find(v => v.lang.toLowerCase().includes('en-us') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Zira')));
        }

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      } catch (voiceErr) {
        console.warn('Voice enumeration failed safely:', voiceErr);
      }

      // Adjust speed and pitch for conversational crispness
      utterance.rate = lang === 'hi' ? 0.95 : 1.05;
      utterance.pitch = 1.0;

      // Track speech lifecycle events
      utterance.onstart = () => {
        setCurrentlySpeakingId(msgId);
        setActiveSpeechLang(lang);
      };

      utterance.onend = () => {
        setCurrentlySpeakingId(null);
        setActiveSpeechLang(null);
      };

      utterance.onerror = (event) => {
        console.warn('SpeechSynthesis error:', event);
        setCurrentlySpeakingId(null);
        setActiveSpeechLang(null);
      };

      // Begin Speech synthesis vocal tracks
      synth.speak(utterance);
    } catch (err) {
      console.error('Failed to trigger speech synthesis:', err);
    }
  };

  const stopSpeaking = () => {
    const synth = getSpeechSynthesis();
    if (synth) {
      try {
        synth.cancel();
      } catch (err) {
        console.warn('speechSynthesis.cancel() failed:', err);
      }
    }
    setCurrentlySpeakingId(null);
    setActiveSpeechLang(null);
  };

  const handleShortcutClick = (shortcutText: string) => {
    handleSendMessage(shortcutText);
  };

  const clearChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: 'new-welcome',
        role: 'assistant',
        text: 'Terminal pipeline flushed! (◕‿◕✿) MS2 AI command grids reset. What project stats are you looking to scan next, Commander?',
        timestamp: new Date()
      }
    ]);
  };

  // Pre-formatted text parser to handle bold formatting markers "**text**" in clean JSX
  const formatMessageText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-[#67b2b6] tracking-wide">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-45 font-sans" id="ms2-ai-assistant-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.93, filter: 'blur(15px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0in)' }}
            exit={{ opacity: 0, y: 25, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 24, stiffness: 180 }}
            className={`w-96 h-[570px] rounded-2xl flex flex-col shadow-2xl overflow-hidden glass-panel border ${
              themeMode === 'light' 
                ? 'bg-stone-50/98 border-stone-200 text-stone-900' 
                : 'bg-[#090e18]/96 border-white/[0.06] text-white shadow-[#67b2b6]/5'
            }`}
            id="ms2-chat-widget"
          >
            {/* Widget Header with Cybernetic Glow & amazing 3D particle canvas animation */}
            <div className="p-4 border-b border-white/[0.04] bg-black/45 relative overflow-hidden flex flex-col">
              
              {/* Overlay grid lines / high tech vibe */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(103,178,182,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(103,178,182,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

              {/* Header Content with side-aligned 3D Hologram animation */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3">
                  {/* Hologram interactive 3D orb widget */}
                  <Hologram3D isThinking={isLoading} isSpeaking={currentlySpeakingId !== null} />
                  
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-[12px] font-black uppercase tracking-widest font-mono text-white">MS2 AI ORACLE</h3>
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-550/20 px-1 font-semibold rounded font-mono animate-pulse">ACTIVE</span>
                    </div>
                    <p className="text-[9px] text-neutral-400 font-mono tracking-tight leading-none mt-1">Cognitive Pipeline Assistant</p>
                    <p className="text-[8px] text-[#67b2b6]/70 font-mono uppercase tracking-widest mt-1">Voice & 3D Interactive Core</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={clearChat}
                    title="Clear Conversation"
                    className="p-1.5 hover:bg-white/5 text-neutral-500 hover:text-red-400 transition-all rounded-lg"
                  >
                    <Trash2 size={13} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/5 text-neutral-500 hover:text-white transition-all rounded-lg"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                const isThisSpeaking = currentlySpeakingId === msg.id;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}`}
                  >
                    {isAssistant ? (
                      <div className="w-7 h-7 shrink-0 bg-gradient-to-tr from-[#67b2b6] to-cyan-800 rounded-lg flex items-center justify-center text-white text-[11px] font-black font-mono shadow-[0_0_8px_rgba(103,178,182,0.2)]">
                        AI
                      </div>
                    ) : (
                      <div className="w-7 h-7 shrink-0 bg-gradient-to-tr from-[#FFA089] to-red-600 rounded-lg flex items-center justify-center text-black text-[11px] font-black font-mono">
                        AD
                      </div>
                    )}
                    
                    <div className="space-y-1.5 max-w-[80%]">
                      <div className={`p-3 rounded-2xl leading-relaxed font-sans text-[11.5px] relative ${
                        isAssistant
                          ? (themeMode === 'light' 
                             ? 'bg-stone-100 border border-stone-250 text-stone-800 shadow-sm' 
                             : 'bg-[#121a2c]/80 border border-white/[0.04] text-neutral-200 shadow-inner')
                          : 'bg-[#67b2b6] text-slate-950 font-medium shadow-[0_3px_10px_rgba(103,178,182,0.15)]'
                      }`}>
                        {formatMessageText(msg.text)}

                        {/* Interactive Speech Waves & language selection for assistant messages */}
                        {isAssistant && !msg.id.includes('error') && (
                          <div className="mt-2 text-[10px] pt-1.5 border-t border-white/[0.04] flex items-center justify-between gap-1">
                            {/* Speaking wave notification badge */}
                            <div className="flex items-center space-x-1 text-neutral-400">
                              {isThisSpeaking ? (
                                <div className="flex items-center space-x-0.7 h-3 px-1">
                                  <span className="w-0.5 bg-[#67b2b6] h-2.5 animate-bounce" style={{ animationDelay: '0.1s' }} />
                                  <span className="w-0.5 bg-[#67b2b6] h-1.5 animate-bounce" style={{ animationDelay: '0.3s' }} />
                                  <span className="w-0.5 bg-[#67b2b6] h-3 animate-bounce" style={{ animationDelay: '0.5s' }} />
                                  <span className="text-[8px] text-[#67b2b6] font-mono ml-1 uppercase">{activeSpeechLang} Vocalizer</span>
                                </div>
                              ) : (
                                <span className="text-[8.5px] font-mono uppercase text-neutral-500 flex items-center gap-1">
                                  <Volume2 size={10} /> Voice Readback
                                </span>
                              )}
                            </div>
                            
                            {/* Multilingual Voice Buttons */}
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => speakMessage(msg.id, msg.text, 'en')}
                                className={`px-2 py-0.5 text-[8px] font-black uppercase font-mono rounded border transition-all ${
                                  isThisSpeaking && activeSpeechLang === 'en'
                                    ? 'bg-[#67b2b6]/20 border-[#67b2b6] text-[#67b2b6] animate-pulse'
                                    : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-neutral-400 hover:text-white'
                                }`}
                              >
                                {isThisSpeaking && activeSpeechLang === 'en' ? 'STOP' : 'En Voice'}
                              </button>
                              <button
                                type="button"
                                onClick={() => speakMessage(msg.id, msg.text, 'hi')}
                                className={`px-2 py-0.5 text-[8px] font-black uppercase font-mono rounded border transition-all ${
                                  isThisSpeaking && activeSpeechLang === 'hi'
                                    ? 'bg-[#FFA089]/20 border-[#FFA089] text-[#FFA089] animate-pulse'
                                    : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-neutral-400 hover:text-white'
                                }`}
                              >
                                {isThisSpeaking && activeSpeechLang === 'hi' ? 'STOP' : 'Hi Voice'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <span className="text-[8px] font-mono text-neutral-500 block px-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Server Processing / Model Thinking Waiter */}
              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 shrink-0 bg-gradient-to-tr from-[#67b2b6] to-cyan-800 rounded-lg flex items-center justify-center text-white text-[11px] font-black font-mono animate-bounce">
                    AI
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/[0.02] rounded-2xl flex items-center space-x-2 text-neutral-400 font-mono text-[10px]">
                    <Loader2 size={12} className="animate-spin text-[#67b2b6]" />
                    <span>MS2 AI is decoding tracker data...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick-Scan Suggestions Row */}
            <div className="px-4 py-2 border-t border-white/[0.03] bg-black/10 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none select-none">
              <button
                onClick={() => handleShortcutClick('Give me a brief overall summary of the project pipeline health.')}
                className="px-2.5 py-1 text-[9px] font-mono border border-white/[0.04] hover:bg-[#67b2b6]/15 hover:border-[#67b2b6]/35 text-[#67b2b6] rounded-md transition-all shrink-0 cursor-pointer"
              >
                📊 Overall Summary
              </button>
              <button
                onClick={() => handleShortcutClick('Which projects are delayed, or have critical health warnings?')}
                className="px-2.5 py-1 text-[9px] font-mono border border-white/[0.04] hover:bg-amber-500/15 hover:border-amber-500/35 text-amber-400 rounded-md transition-all shrink-0 cursor-pointer"
              >
                🚨 Delays?
              </button>
              <button
                onClick={() => handleShortcutClick('Can you tell me about employee project allocations and workloads?')}
                className="px-2.5 py-1 text-[9px] font-mono border border-white/[0.04] hover:bg-[#FFA089]/15 hover:border-[#FFA089]/35 text-[#FFA089] rounded-md transition-all shrink-0 cursor-pointer"
              >
                👥 Workloads
              </button>
            </div>

            {/* Message Input Controls */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputVal);
              }}
              className="p-3 bg-black/45 border-t border-white/[0.04] flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask MS2 AI to inspect status..."
                disabled={isLoading}
                className="flex-1 bg-white/[0.02] hover:bg-white/[0.04] font-sans border border-white/[0.05] focus:border-[#67b2b6]/40 p-2.5 rounded-xl text-[11px] focus:outline-none transition-all placeholder:text-neutral-500 text-white"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="p-2.5 bg-[#67b2b6] text-black font-semibold rounded-xl hover:bg-cyan-300 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer"
              >
                <Send size={12} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating 3D Toggle Bubble with beautiful cursor hover animations & cute expression label */}
      <motion.button
        style={{ perspective: 1000 }}
        whileHover={{ 
          scale: 1.06,
          rotateX: 10,
          rotateY: -10,
          boxShadow: '0 0 25px rgba(103,178,182,0.35)'
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-gradient-to-tr from-[#0b101c] to-[#121c32] p-4 rounded-2xl shadow-xl border border-[#67b2b6]/25 text-[#67b2b6] transition-all flex items-center gap-2 cursor-pointer group"
        id="ms2-ai-bubble-activator"
      >
        <div className="relative">
          <Bot size={18} className="group-hover:animate-bounce" />
          <div className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </div>
        <span className="text-[10px] uppercase font-mono tracking-widest font-black leading-none hidden md:inline-block pr-1">MS2 AI</span>
        
        {/* Cute expression popup overlay */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#67b2b6] text-[#070b12] text-[9px] font-black font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-md">
          (•◡•)
        </div>
      </motion.button>
    </div>
  );
}
