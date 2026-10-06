/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MS2LogoProps {
  className?: string; // Standard ClassName for positioning inside sidebar/login cards
  variant?: 'full' | 'icon'; // Show full logo with "ENTERTAINMENT" label or icon only
}

export default function MS2Logo({ className = 'w-48 h-auto', variant = 'full' }: MS2LogoProps) {
  return (
    <div className={`select-none ${className}`} id="ms2-brand-logo">
      <svg
        viewBox="0 0 600 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Tilting Group: Handles the filmstrip border and MS2 initials */}
        {/* Tilted to match standard movie-stamp angles */}
        <g transform="rotate(-12, 300, 200)">
          {/* Main Rounded Filmstrip Rect */}
          <rect
            x="70"
            y="70"
            width="460"
            height="260"
            rx="50"
            fill="none"
            stroke="#67b2b6" /* Beautiful teal base matching official site */
            strokeWidth="38"
          />

          {/* Sprocket Holes (The classic film reel gaps) along Top Border */}
          <g fill="white">
            <rect x="98" y="78" width="16" height="12" rx="2" />
            <rect x="134" y="78" width="16" height="12" rx="2" />
            <rect x="170" y="78" width="16" height="12" rx="2" />
            <rect x="206" y="78" width="16" height="12" rx="2" />
            <rect x="242" y="78" width="16" height="12" rx="2" />
            <rect x="278" y="78" width="16" height="12" rx="2" />
            <rect x="314" y="78" width="16" height="12" rx="2" />
            <rect x="350" y="78" width="16" height="12" rx="2" />
            <rect x="386" y="78" width="16" height="12" rx="2" />
            <rect x="422" y="78" width="16" height="12" rx="2" />
            <rect x="458" y="78" width="16" height="12" rx="2" />
            <rect x="494" y="78" width="16" height="12" rx="2" />
          </g>

          {/* Sprocket Holes along Bottom Border */}
          <g fill="white">
            <rect x="98" y="310" width="16" height="12" rx="2" />
            <rect x="134" y="310" width="16" height="12" rx="2" />
            <rect x="170" y="310" width="16" height="12" rx="2" />
            <rect x="206" y="310" width="16" height="12" rx="2" />
            <rect x="242" y="310" width="16" height="12" rx="2" />
            <rect x="278" y="310" width="16" height="12" rx="2" />
            <rect x="314" y="310" width="16" height="12" rx="2" />
            <rect x="350" y="310" width="16" height="12" rx="2" />
            <rect x="386" y="310" width="16" height="12" rx="2" />
            <rect x="422" y="310" width="16" height="12" rx="2" />
            <rect x="458" y="310" width="16" height="12" rx="2" />
            <rect x="494" y="310" width="16" height="12" rx="2" />
          </g>

          {/* The MS2 Bold Initials inside the Tilted Frame - official peach/salmon */}
          <text
            x="300"
            y="235"
            fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
            fontWeight="900"
            fontSize="148"
            fill="#FFA089" /* Soft, vibrant peach/salmon matching Image 1 exactly */
            textAnchor="middle"
            letterSpacing="-4"
            style={{ textTransform: 'uppercase' }}
          >
            MS2
          </text>
        </g>

        {/* ENTERTAINMENT Label - Always parallel to the horizontal line, NEVER tilted */}
        {variant === 'full' && (
          <text
            x="300"
            y="410"
            fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
            fontWeight="700"
            fontSize="32"
            fill="#FFA089"
            textAnchor="middle"
            letterSpacing="18"
            style={{ textTransform: 'uppercase' }}
          >
            ENTERTAINMENT
          </text>
        )}
      </svg>
    </div>
  );
}
