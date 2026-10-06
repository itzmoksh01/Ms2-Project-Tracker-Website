/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { Bookmark, Clipboard, Save, CheckCircle } from 'lucide-react';

interface AdminPrivateNotesProps {
  type: 'projects' | 'employees' | 'progress';
  targetId: string;
  themeMode?: 'dark' | 'light';
}

export function AdminPrivateNotes({ type, targetId, themeMode = 'dark' }: AdminPrivateNotesProps) {
  const isLight = themeMode === 'light';
  const [noteText, setNoteText] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const notesData = store.getAdminNotes();
    const existingNote = notesData[type]?.[targetId] || '';
    setNoteText(existingNote);
  }, [type, targetId]);

  const handleSave = () => {
    store.saveAdminNote(type, targetId, noteText);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 1500);
  };

  return (
    <div className={`p-4 rounded-xl border ${isLight ? 'bg-amber-50/50 border-stone-200 shadow-sm' : 'bg-black/35 border-white/[0.03]'} space-y-2.5`} id={`admin-notes-${type}-${targetId}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#FFA089] uppercase tracking-widest font-extrabold flex items-center space-x-1">
          <Bookmark size={11} className="text-[#FFA089]" />
          <span>ADMIN PRIVATE NOTE</span>
        </span>
        <span className="text-[8px] font-mono text-neutral-500 font-bold uppercase tracking-wide">SECURE COVERS (ADMIN EYE ONLY)</span>
      </div>

      <div className="space-y-2">
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Log internal assessments, project follow-ups, employee performance parameters or compliance marks..."
          className="w-full bg-neutral-950 border border-white/5 rounded-lg p-2.5 text-xs text-neutral-300 focus:outline-none focus:border-[#67b2b6] leading-relaxed min-h-[64px]"
          rows={2}
        />

        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-neutral-500 font-semibold">Employees cannot read these logs</span>
          
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-lg bg-[#67b2b6] text-neutral-950 font-black transition-all hover:bg-[#52a1a5] hover:scale-105 active:scale-95 flex items-center space-x-1 cursor-pointer shadow-sm"
          >
            {success ? (
              <CheckCircle size={10} className="text-neutral-950" />
            ) : (
              <Save size={10} className="text-neutral-950" />
            )}
            <span>{success ? 'SAVED' : 'SAVE NOTE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
