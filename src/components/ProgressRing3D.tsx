/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProjectHealth } from '../types';

interface ProgressRing3DProps {
  percentage: number;
  health: ProjectHealth;
  size?: number;
  strokeWidth?: number;
  animate?: boolean;
}

export function ProgressRing3D({
  percentage,
  health,
  size = 56,
  strokeWidth = 4.5,
  animate = true
}: ProgressRing3DProps) {
  const currentVal = Math.min(100, Math.max(0, percentage));
  
  // Radius calculations
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (currentVal / 100) * circumference;

  // Custom configurations based on the specified Progress Ring States
  const getHealthGradient = (state: ProjectHealth) => {
    switch (state) {
      case 'Excellent':
        return {
          from: '#10b981', // Calm emerald
          to: '#059669',
          glow: 'rgba(16, 185, 129, 0.4)',
          bg: '#10b981'
        };
      case 'On Track':
        return {
          from: '#67b2b6', // Cyan-blue
          to: '#4fa0a4',
          glow: 'rgba(103, 178, 182, 0.4)',
          bg: '#67b2b6'
        };
      case 'Slight Delay':
        return {
          from: '#f59e0b', // Amber-orange
          to: '#d97706',
          glow: 'rgba(245, 158, 11, 0.4)',
          bg: '#f59e0b'
        };
      case 'High Risk':
        return {
          from: '#f43f5e', // Red-Orange
          to: '#e11d48',
          glow: 'rgba(244, 63, 94, 0.45)',
          bg: '#f43f5e'
        };
      case 'Critical':
        return {
          from: '#ef4444', // Deep red-crimson flashing
          to: '#b91c1c',
          glow: 'rgba(239, 68, 68, 0.55)',
          bg: '#ef4444'
        };
      default:
        return {
          from: '#6b7280',
          to: '#4b5563',
          glow: 'rgba(107, 114, 128, 0.2)',
          bg: '#6b7280'
        };
    }
  };

  const scheme = getHealthGradient(health);

  return (
    <div 
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
      id={`progress-ring-3d-${health.toLowerCase()}`}
    >
      {/* 3D Drop shadow ambient glow behind ring */}
      <div 
        className={`absolute inset-[15%] rounded-full blur-[10px] transition-all duration-1000 ${
          health === 'Critical' ? 'animate-pulse' : ''
        }`}
        style={{
          backgroundColor: scheme.glow,
          boxShadow: `0 0 16px ${scheme.glow}`
        }}
      />

      {/* SVG RING SURFACE */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 relative z-10"
      >
        <defs>
          <linearGradient id={`gradient-${health}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={scheme.from} />
            <stop offset="100%" stopColor={scheme.to} />
          </linearGradient>
          <filter id={`shadow-${health}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer concentric metallic frame */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 1.5}
          fill="none"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth={1}
        />

        {/* Ring track background element */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(6, 8, 13, 0.65)"
          strokeWidth={strokeWidth}
          className="stroke-[rgba(255,255,255,0.02)]"
        />

        {/* Dynamic Glowing Filled Pathway */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${health})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-out`}
          filter={`url(#shadow-${health})`}
        />
      </svg>

      {/* Numerical labels floating perfectly in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center leading-none">
        <span className="text-[10px] font-mono font-black tracking-tighter text-white">
          {Math.round(percentage)}
          <span className="text-[7px] text-neutral-400 font-normal">%</span>
        </span>
      </div>
    </div>
  );
}
