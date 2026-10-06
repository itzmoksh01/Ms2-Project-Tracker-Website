/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { Search, Layers, Users, Sliders, FileText, Settings, X, Calendar, Compass, Star } from 'lucide-react';
import { Project, User, DailyProgress } from '../types';

interface CommandPaletteProps {
  projects: Project[];
  employees: User[];
  progressList: DailyProgress[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectProject?: (proj: Project) => void;
  onSelectEmployee?: (emp: User) => void;
  themeMode?: 'dark' | 'light';
}

export function CommandPalette({
  projects,
  employees,
  progressList,
  activeTab,
  setActiveTab,
  onSelectProject,
  onSelectEmployee,
  themeMode = 'dark'
}: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Keyboard activation hotkey handler (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      // Close modal on Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Set focus on input upon opening
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Calculate search items
  const query = search.trim().toLowerCase();
  
  const searchItems: Array<{
    category: string;
    label: string;
    detail: string;
    icon: React.ReactNode;
    action: () => void;
  }> = [];

  // 1. Add general navigation tabs
  const tabs = [
    { id: 'dashboard', label: 'Command Cockpit', cat: 'Navigation', icon: <Compass className="h-4 w-4" /> },
    { id: 'projects', label: 'Active Projects Pipeline', cat: 'Navigation', icon: <Layers className="h-4 w-4" /> },
    { id: 'employees', label: 'Workforce Directory', cat: 'Navigation', icon: <Users className="h-4 w-4" /> },
    { id: 'progress', label: 'Daily Work Logs Repository', cat: 'Navigation', icon: <FileText className="h-4 w-4 text-[#67b2b6]" /> },
    { id: 'calendar', label: 'Master Schedules Heatmap', cat: 'Navigation', icon: <Calendar className="h-4 w-4" /> },
    { id: 'settings', label: 'Operational Control Settings', cat: 'Navigation', icon: <Settings className="h-4 w-4" /> }
  ];

  tabs.forEach(t => {
    if (t.label.toLowerCase().includes(query) || t.cat.toLowerCase().includes(query)) {
      searchItems.push({
        category: t.cat,
        label: t.label,
        detail: `Go to ${t.label} section`,
        icon: t.icon,
        action: () => {
          setActiveTab(t.id);
          setIsOpen(false);
        }
      });
    }
  });

  // 2. Add projects to index
  projects.forEach(p => {
    if (p.projectName.toLowerCase().includes(query) || p.projectCode.toLowerCase().includes(query)) {
      searchItems.push({
        category: 'Project Items',
        label: `${p.projectName} [${p.projectCode}]`,
        detail: `${p.currentStage} • Progress: ${p.currentCompletionPercent}%`,
        icon: <Layers className="h-4 w-4 text-[#FFA089]" />,
        action: () => {
          setActiveTab('projects');
          if (onSelectProject) {
            onSelectProject(p);
          }
          setIsOpen(false);
        }
      });
    }
  });

  // 3. Add employees to search
  employees.forEach(e => {
    if (e.fullName.toLowerCase().includes(query) || e.employeeId.toLowerCase().includes(query)) {
      searchItems.push({
        category: 'Staff Members',
        label: e.fullName,
        detail: `${e.employeeId} • Department: ${e.department || 'N/A'} • Role: ${e.role}`,
        icon: <Users className="h-4 w-4 text-[#38bdf8]" />,
        action: () => {
          setActiveTab('employees');
          if (onSelectEmployee) {
            onSelectEmployee(e);
          }
          setIsOpen(false);
        }
      });
    }
  });

  // Handle hot navigation key selectors inside modal
  const handleDialogKeys = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, searchItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchItems.length) % Math.max(1, searchItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchItems[selectedIndex]) {
        searchItems[selectedIndex].action();
      }
    }
  };

  if (!isOpen) {
    return (
      // Compact trigger seal floating floating
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 rounded-xl text-[11px] font-mono font-bold bg-[#67b2b6]/5 border border-[#67b2b6]/20 text-[#67b2b6] hover:bg-[#67b2b6]/15 transition-all flex items-center space-x-2 shrink-0 select-none shadow-md hover:scale-[1.01]"
        id="cmd-palette-floating-activator"
        title="Open Studio Command Center Palette (Ctrl + K)"
      >
        <Search size={11} className="animate-pulse" />
        <span className="hidden md:inline">COMMAND SEARCH</span>
        <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] font-semibold text-neutral-400">Ctrl+K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#04060a]/80 backdrop-blur-md flex items-start justify-center p-4 pt-[12vh]" id="command-backdrop-overlay">
      <div 
        ref={modalRef}
        onKeyDown={handleDialogKeys}
        className="w-full max-w-xl bg-gradient-to-b from-[#0e131f] to-[#06080d] border border-white/10 rounded-2xl shadow-2xl glass-panel-heavy overflow-hidden flex flex-col max-h-[60vh] animate-scale-up"
      >
        {/* UPPER INPUT ROW */}
        <div className="p-4 border-b border-white/5 flex items-center space-x-3.5 bg-black/20">
          <Search className="h-5 w-5 text-[#67b2b6] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search projects, employees, system logs..."
            className="w-full bg-transparent border-none text-[13px] text-white focus:outline-none focus:ring-0 placeholder-neutral-500 tracking-wide font-sans"
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 px-1.5 rounded-lg bg-white/5 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 text-[10px] items-center flex"
          >
            <X size={12} />
          </button>
        </div>

        {/* RESULTS SCROLL */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
          {searchItems.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
              <Star className="h-5 w-5 text-neutral-600 animate-pulse" />
              <p className="text-xs text-neutral-400 font-bold font-sans">No commands or files matching keyword</p>
              <p className="text-[10px] text-neutral-500 font-mono">Try searching "dashboard", "Brand", or "Madhur"</p>
            </div>
          ) : (
            // Rendered filtered choices
            Object.entries(
              searchItems.reduce((groups, item) => {
                if (!groups[item.category]) groups[item.category] = [];
                groups[item.category].push(item);
                return groups;
              }, {} as Record<string, typeof searchItems>)
            ).map(([cat, items]) => (
              <div key={cat} className="space-y-1">
                <div className="text-[9px] uppercase tracking-widest font-mono font-bold text-[#67b2b6]/70 px-2.5 pt-2">
                  {cat}
                </div>
                {items.map((item) => {
                  const itemIndex = searchItems.indexOf(item);
                  const isSelected = itemIndex === selectedIndex;

                  return (
                    <button
                      key={item.label}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`w-full text-left p-2.5 px-3 rounded-xl flex items-center justify-between text-xs transition-all border ${
                        isSelected
                          ? 'bg-[#67b2b6]/10 border-[#67b2b6]/30 text-white shadow-md shadow-[#67b2b6]/5 scale-[1.01]'
                          : 'border-transparent text-neutral-300 hover:bg-white/[0.01]'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#67b2b6]/20' : 'bg-white/5'}`}>
                          {item.icon}
                        </div>
                        <div className="leading-tight truncate">
                          <span className="font-bold block text-[11px] truncate">{item.label}</span>
                          <span className="text-[9px] text-neutral-500 block truncate mt-0.5">{item.detail}</span>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold tracking-widest flex items-center space-x-1">
                          <span>ENTER</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* CONTROLS INSTRUCTIONS BAR */}
        <div className="p-3 border-t border-white/5 bg-black/50 flex justify-between items-center text-[9px] font-mono text-neutral-400">
          <div className="flex items-center space-x-2.5">
            <span className="flex items-center"><span className="px-1 text-white py-0.5 rounded bg-neutral-800 mr-1 font-extrabold font-sans">↑↓</span> Move</span>
            <span className="flex items-center"><span className="px-1 text-white py-0.5 rounded bg-neutral-800 mr-1 font-extrabold font-sans">Enter</span> Select</span>
          </div>
          <span className="text-[#67b2b6]/85 font-extrabold uppercase">MS2 INTEGRATED PLATFORM</span>
        </div>
      </div>
    </div>
  );
}
