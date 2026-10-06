/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { store } from '../services/store';
import { InAppNotification, User } from '../types';
import { Bell, CheckCheck, X, AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';

interface NotificationDrawerProps {
  currentUser: User;
  themeMode?: 'dark' | 'light';
}

export function NotificationDrawer({ currentUser, themeMode = 'dark' }: NotificationDrawerProps) {
  const isLight = themeMode === 'light';
  const [isOpen, setIsOpen] = useState(false);
  const [notifs, setNotifs] = useState<InAppNotification[]>(store.getNotifications(currentUser.role === 'admin' ? 'uid-ratan-admin' : currentUser.uid));

  const unreadCount = notifs.filter(n => !n.isRead).length;

  const refreshNotifs = () => {
    setNotifs(store.getNotifications(currentUser.role === 'admin' ? 'uid-ratan-admin' : currentUser.uid));
  };

  const handleMarkAllRead = () => {
    const userId = currentUser.role === 'admin' ? 'uid-ratan-admin' : currentUser.uid;
    store.markAllNotificationsAsRead(userId);
    refreshNotifs();
  };

  const handleItemRead = (id: string) => {
    store.markNotificationAsRead(id);
    refreshNotifs();
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={14} className="text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle size={14} className="text-amber-400 shrink-0" />;
      case 'error':
        return <AlertTriangle size={14} className="text-rose-400 shrink-0" />;
      default:
        return <Info size={14} className="text-[#67b2b6] shrink-0" />;
    }
  };

  return (
    <div className="relative z-50 font-sans" id="studio-notification-center">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          refreshNotifs();
        }}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10 transition-all cursor-pointer"
        title="View notifications"
        id="notif-activation-badge"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 border border-black flex items-center justify-center text-[9px] font-black text-white font-mono animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />

          {/* Drawer container */}
          <div className={`absolute right-0 mt-3 w-80 md:w-96 rounded-2xl border shadow-2xl p-4 space-y-3 ${
            isLight ? 'bg-amber-50 border-stone-200 text-stone-900' : 'bg-[#0a0e17] border-white/10 text-neutral-200'
          }`} id="notifications-drawer-content">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs font-bold font-display uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles size={12} className="text-[#67b2b6]" />
                <span>Operational Alerts</span>
              </span>
              
              <div className="flex items-center space-x-2 text-[10px] font-mono">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[#67b2b6] hover:underline cursor-pointer font-bold flex items-center space-x-1"
                  >
                    <CheckCheck size={12} />
                    <span>Mark all Read</span>
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white p-1">
                  <X size={12} />
                </button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1" id="notif-items-list">
              {notifs.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500 font-mono">
                  NO ALERTS DISPATCHED IN RETRIEVAL RADIUS
                </div>
              ) : (
                notifs.map(n => (
                  <div
                    key={n.notificationId}
                    onClick={() => handleItemRead(n.notificationId)}
                    className={`p-2.5 rounded-xl border flex items-start space-x-3 transition-all cursor-pointer ${
                      n.isRead 
                        ? 'bg-black/10 border-white/[0.02] opacity-75' 
                        : 'bg-white/5 border-white/10 hover:border-[#67b2b6]/40'
                    }`}
                  >
                    {getNotifIcon(n.type)}
                    
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold truncate block ${n.isRead ? 'text-neutral-400' : 'text-white'}`}>
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#67b2b6] shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[8px] font-mono text-neutral-500 block">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FCM Token placeholder visual comments (Requirement #17) */}
            <div className="pt-2 border-t border-white/5 text-[8px] font-mono text-neutral-500 flex flex-col space-y-1">
              <span>* PUSH NOTIFICATION SUB-SYSTEM ARCHITECTURE READY</span>
              <span>TOKEN PERSISTENCE PATH: Users/{currentUser.uid}/fcm_tokens</span>
              <span>TRIGGERS: cloud_functions/on_log_submission</span>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
