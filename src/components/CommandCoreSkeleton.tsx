/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

interface SkeletonProps {
  variant: 'login' | 'admin-hero';
}

export function CommandCoreSkeleton({ variant }: SkeletonProps) {
  const isLogin = variant === 'login';

  return (
    <div 
      className={`relative select-none flex flex-col items-center justify-center p-6 border rounded-2xl animate-pulse bg-gradient-to-b from-[#0a0e17]/80 to-[#04060a]/90 ${
        isLogin 
          ? 'w-full h-[320px] border-cyan-500/5 shadow-2xl' 
          : 'w-full h-40 border-cyan-500/[0.03]'
      }`}
      id={`command-core-skeleton-${variant}`}
    >
      {/* GLOWING AMBIENT BACKGROUND GLOW */}
      <div className="absolute inset-0 bg-radial-gradient from-cyan-500/[0.015] to-transparent pointer-events-none rounded-2xl" />

      {/* CENTRAL RING SKELETON */}
      <div className="relative flex items-center justify-center">
        {/* Shimmer ring */}
        <div className={`rounded-full border border-dashed border-cyan-500/20 animate-spin [animation-duration:12s] ${
          isLogin ? 'h-36 w-36' : 'h-24 w-24'
        }`} />
        
        {/* Core core circle */}
        <div className={`absolute rounded-full bg-slate-950/90 border border-slate-800 flex items-center justify-center shadow-lg ${
          isLogin ? 'h-16 w-16' : 'h-11 w-11'
        }`}>
          <Loader2 size={isLogin ? 18 : 14} className="animate-spin text-cyan-400 opacity-60" />
        </div>
      </div>

      <div className="mt-4 text-center space-y-1 z-10">
        <span className="text-[10px] font-mono text-neutral-400 font-bold tracking-widest uppercase block animate-pulse">
          Initializing Core Engine
        </span>
        <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-wider block">
          Loading Cinematic Assets...
        </span>
      </div>
    </div>
  );
}
