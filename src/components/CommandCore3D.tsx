/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Activity, Layers, Users, Calendar, AlertOctagon, HelpCircle } from 'lucide-react';

interface OrbitNode {
  id: string;
  label: string;
  metric: string | number;
  status: 'active' | 'success' | 'warning' | 'danger' | 'info';
  color: string;
  icon: string;
  // Spherical projection angles
  angle: number;
  latitude: number;
  r: number;
  // Projected screen coordinates
  px: number;
  py: number;
  pz: number;
}

interface CommandCore3DProps {
  variant: 'login' | 'admin-hero';
  metrics?: {
    activeProjects: number;
    employeesCount: number;
    todayUpdates: number;
    lockedEntries: number;
    criticalRisks: number;
  };
  onNodeClick?: (sectionId: string) => void;
  studioMode?: boolean;
}

export function CommandCore3D({
  variant,
  metrics = { activeProjects: 4, employeesCount: 6, todayUpdates: 3, lockedEntries: 2, criticalRisks: 1 },
  onNodeClick,
  studioMode = true
}: CommandCore3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  
  const [hoveredNode, setHoveredNode] = useState<OrbitNode | null>(null);
  const [canvasError, setCanvasError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // 3D projections configuration (stable pre-allocated objects)
  const nodesRef = useRef<OrbitNode[]>([]);
  // Sorted nodes buffer to avoid instantiating lists every frame
  const sortedNodesRef = useRef<OrbitNode[]>([]);
  const prevHoveredIdRef = useRef<string | null>(null);

  // 1. Accessibility listener for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const onChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  // 2. Initialize orbiting nodes with metrics when metrics prop changes
  useEffect(() => {
    nodesRef.current = [
      {
        id: 'projects',
        label: 'Active Projects',
        metric: `${metrics.activeProjects} Live`,
        status: 'active',
        color: '#67b2b6', 
        icon: 'Briefcase',
        angle: 0,
        latitude: -0.2,
        r: 100,
        px: 0, py: 0, pz: 0
      },
      {
        id: 'employees',
        label: 'Studio Force',
        metric: `${metrics.employeesCount} Joined`,
        status: 'info',
        color: '#38bdf8', 
        icon: 'Users',
        angle: (Math.PI * 2) / 5,
        latitude: 0.15,
        r: 100,
        px: 0, py: 0, pz: 0
      },
      {
        id: 'progress',
        label: "Today's Logs",
        metric: `${metrics.todayUpdates} Submitted`,
        status: 'success',
        color: '#10b981', 
        icon: 'FileText',
        angle: ((Math.PI * 2) * 2) / 5,
        latitude: -0.1,
        r: 105,
        px: 0, py: 0, pz: 0
      },
      {
        id: 'calendar',
        label: 'Schedules Map',
        metric: `${metrics.lockedEntries} Locked`,
        status: 'warning',
        color: '#ffa089', 
        icon: 'Calendar',
        angle: ((Math.PI * 2) * 3) / 5,
        latitude: 0.3,
        r: 100,
        px: 0, py: 0, pz: 0
      },
      {
        id: 'analytics',
        label: 'Active Risks',
        metric: `${metrics.criticalRisks} Alert`,
        status: 'danger',
        color: '#f43f5e', 
        icon: 'AlertOctagon',
        angle: ((Math.PI * 2) * 4) / 5,
        latitude: -0.25,
        r: 95,
        px: 0, py: 0, pz: 0
      }
    ];
    // Seed sorting buffer
    sortedNodesRef.current = [...nodesRef.current];
  }, [metrics]);

  // 3. Animation and Canvas controller
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      setCanvasError(true);
      return;
    }

    let animFrameId: number;
    let isIntersecting = true;
    let isTabVisible = true;

    // Constrain resolution for ultra-high-dpi displays safely to 1.5 max
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let width = variant === 'login' ? 380 : 320;
    let height = variant === 'login' ? 380 : 220;

    // Core dynamic speed parameters (reduced speed if accessibility prefers rest)
    const baseOrbitRotationSpeed = reducedMotion ? 0.0005 : (studioMode ? 0.007 : 0.002);
    let phase = 0;
    let currentOrbitSpeed = baseOrbitRotationSpeed;

    const centerX = width / 2;
    const centerY = height / 2;

    // Mouse positions coordinates
    let mouseX = centerX;
    let mouseY = centerY;
    let dMouseX = centerX;
    let dMouseY = centerY;

    // Pre-calculate ambient background cosmic dots
    const particlesCount = variant === 'login' ? 18 : 12; // optimized count
    const bgParticles = Array.from({ length: particlesCount }).map(() => ({
      angle: Math.random() * Math.PI * 2,
      latitude: (Math.random() - 0.5) * Math.PI * 0.6,
      r: (variant === 'login' ? 55 : 35) + Math.random() * (variant === 'login' ? 95 : 65),
      size: 0.7 + Math.random() * 1.2,
      speedMultiplier: 0.15 + Math.random() * 0.6,
      color: Math.random() > 0.45 ? '#67b2b6' : '#FFA089'
    }));

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      dMouseX = e.clientX - rect.left;
      dMouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      dMouseX = canvas.width / (2 * dpr);
      dMouseY = canvas.height / (2 * dpr);
      prevHoveredIdRef.current = null;
      setHoveredNode(null);
    };

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Search matching nodes click target bounds
      const clicked = nodesRef.current.find((node) => {
        const dx = clickX - node.px;
        const dy = clickY - node.py;
        return Math.sqrt(dx * dx + dy * dy) < 22;
      });

      if (clicked && onNodeClick) {
        onNodeClick(clicked.id);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleCanvasClick);

    // Dynamic scale helper that updates sizes and handles DPR context scaling
    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rectWidth = parent.clientWidth || 320;
      const rectHeight = parent.clientHeight || (variant === 'login' ? 380 : 220);

      if (width !== rectWidth || height !== rectHeight) {
        width = rectWidth;
        height = rectHeight;

        canvas.width = rectWidth * dpr;
        canvas.height = rectHeight * dpr;
        canvas.style.width = `${rectWidth}px`;
        canvas.style.height = `${rectHeight}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        ctx.scale(dpr, dpr);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // 4. Occlusion Culling: Intersection Observer
    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(canvas);

    // 5. Visibility Culling: Tab Focus
    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let lastTime = performance.now();

    const loop = (timestamp: number = performance.now()) => {
      // Check visibility bounds to optimize processor resource use
      if (!isIntersecting || !isTabVisible) {
        animFrameId = requestAnimationFrame(loop);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Framerate independent smooth pacing adjustment
      const delta = Math.min(50, timestamp - lastTime) / 16.666;
      lastTime = timestamp;

      const dynamicCenterX = width / 2;
      const dynamicCenterY = height / 2;

      // Dampen mouse positions coordinate glide (extremely smooth factor 0.04)
      mouseX += (dMouseX - mouseX) * 0.04 * delta;
      mouseY += (dMouseY - mouseY) * 0.04 * delta;

      // Handle deceleration and triggers on Node Hover
      let targetSpeed = baseOrbitRotationSpeed;
      let foundHover: OrbitNode | null = null;

      // Optimized vector distance lookup
      for (let i = 0; i < nodesRef.current.length; i++) {
        const n = nodesRef.current[i];
        const distSq = (dMouseX - n.px) ** 2 + (dMouseY - n.py) ** 2;
        if (distSq < 576) { // 24px radius squared = 576
          foundHover = n;
          break;
        }
      }

      // Performance Optimization: Direct DOM Manipulation of tooltip positions & throttle states
      const currentHoverId = foundHover ? foundHover.id : null;
      if (currentHoverId !== prevHoveredIdRef.current) {
        prevHoveredIdRef.current = currentHoverId;
        setHoveredNode(foundHover);
      }

      if (foundHover) {
        // Drop rotational orbit speed by 85% on node hover for easy alignment selection
        targetSpeed = baseOrbitRotationSpeed * 0.15;
        // Direct absolute positioning of ref tooltips avoiding React rendering bottleneck cascades
        if (tooltipRef.current) {
          tooltipRef.current.style.left = `${foundHover.px}px`;
          tooltipRef.current.style.top = `${foundHover.py - 60}px`;
        }
      }

      // Decelerate orbit speed smoothly
      currentOrbitSpeed += (targetSpeed - currentOrbitSpeed) * 0.08 * delta;
      phase += currentOrbitSpeed * delta;

      const coreRadius = variant === 'login' ? 58 : 34;

      // Pitch/Yaw tilt factors representing 3D parallax on cursor moves
      const pitch = reducedMotion ? 0 : (mouseY - dynamicCenterY) * -0.0016;
      const yaw = phase + (reducedMotion ? 0 : (mouseX - dynamicCenterX) * 0.0016);

      // Render ambient radial glow aura behind command sphere
      if (studioMode && !reducedMotion) {
        ctx.save();
        const radialGlow = ctx.createRadialGradient(
          dynamicCenterX, dynamicCenterY, 5,
          dynamicCenterX, dynamicCenterY, variant === 'login' ? 160 : 100
        );
        radialGlow.addColorStop(0, 'rgba(103, 178, 182, 0.035)');
        radialGlow.addColorStop(0.5, 'rgba(255, 160, 137, 0.007)');
        radialGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = radialGlow;
        ctx.beginPath();
        ctx.arc(dynamicCenterX, dynamicCenterY, variant === 'login' ? 180 : 120, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw background ambient particles with trig projection
      if (!reducedMotion) {
        bgParticles.forEach((p) => {
          p.angle += currentOrbitSpeed * 0.25 * p.speedMultiplier * delta;
          const x3d = p.r * Math.cos(p.angle) * Math.cos(p.latitude);
          const y3d = p.r * Math.sin(p.latitude);
          const z3d = p.r * Math.sin(p.angle) * Math.cos(p.latitude);

          const cosP = Math.cos(pitch);
          const sinP = Math.sin(pitch);
          const yRot = y3d * cosP - z3d * sinP;
          const zRot = y3d * sinP + z3d * cosP;

          const cosY = Math.cos(yaw);
          const sinY = Math.sin(yaw);
          const xRot = x3d * cosY - zRot * sinY;
          const pz = x3d * sinY + zRot * cosY;

          const scale = 230 / (230 - pz);
          const px = dynamicCenterX + xRot * scale;
          const py = dynamicCenterY + yRot * scale;

          const size = p.size * scale;
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0.04, Math.min(0.3, (pz + 140) / 280));
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      // Projection calculations for orbit nodes
      nodesRef.current.forEach((n) => {
        n.angle += currentOrbitSpeed * delta;

        const x3d = n.r * Math.cos(n.angle) * Math.cos(n.latitude);
        const y3d = n.r * Math.sin(n.latitude);
        const z3d = n.r * Math.sin(n.angle) * Math.cos(n.latitude);

        const cosP = Math.cos(pitch);
        const sinP = Math.sin(pitch);
        const yRot = y3d * cosP - z3d * sinP;
        const zRot = y3d * sinP + z3d * cosP;

        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        const xRot = x3d * cosY - zRot * sinY;
        const pz = x3d * sinY + zRot * cosY;

        const scale = 230 / (230 - pz);
        n.px = dynamicCenterX + xRot * scale;
        
        const yOffset = variant === 'login' ? 0 : -5;
        n.py = dynamicCenterY + yRot * scale + yOffset;
        n.pz = pz;
      });

      // Sort existing node objects in the buffer by perspective depth Z coordinate
      sortedNodesRef.current.sort((a, b) => a.pz - b.pz);

      // Render Orbit Track ring
      ctx.save();
      ctx.strokeStyle = 'rgba(103, 178, 182, 0.045)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(dynamicCenterX, dynamicCenterY, variant === 'login' ? 100 : 80, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Render background nodes (Z < 0)
      for (let i = 0; i < sortedNodesRef.current.length; i++) {
        const n = sortedNodesRef.current[i];
        if (n.pz >= 0) continue;
        drawNode(ctx, n, variant, studioMode);
      }

      // Draw shiny core sphere
      drawCoreOrb(ctx, dynamicCenterX, dynamicCenterY, coreRadius, phase, studioMode, variant);

      // Render foreground closer nodes (Z >= 0)
      for (let i = 0; i < sortedNodesRef.current.length; i++) {
        const n = sortedNodesRef.current[i];
        if (n.pz < 0) continue;
        drawNode(ctx, n, variant, studioMode);
      }

      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [variant, metrics, studioMode, onNodeClick, reducedMotion]);

  // Optimized procedural 2D Node drawer
  const drawNode = (
    c: CanvasRenderingContext2D,
    node: OrbitNode,
    v: string,
    mode: boolean
  ) => {
    const scaleFactor = (140 + node.pz) / 140;
    const baseNodeRadius = v === 'login' ? 14 : 10;
    const nodeRadius = Math.max(4, baseNodeRadius * scaleFactor);

    c.save();

    // Subtle center connection matrix line
    c.beginPath();
    c.strokeStyle = `rgba(103, 178, 182, ${(scaleFactor * 0.08).toFixed(3)})`;
    c.lineWidth = 1;
    c.moveTo(c.canvas.width / (2 * (window.devicePixelRatio || 1)), c.canvas.height / (2 * (window.devicePixelRatio || 1)));
    c.lineTo(node.px, node.py);
    c.stroke();

    // Node outer glowing halo representation
    if (mode && !reducedMotion) {
      c.shadowBlur = nodeRadius * 1.5;
      c.shadowColor = node.color;
    }

    // Outer circle glass border
    c.beginPath();
    c.arc(node.px, node.py, nodeRadius, 0, Math.PI * 2);
    c.fillStyle = `rgba(6, 8, 13, 0.85)`;
    c.fill();
    c.strokeStyle = node.color;
    c.lineWidth = 1.5;
    c.stroke();

    // Inner glowing core pulse 
    const pulseRadius = nodeRadius * 0.45;
    c.beginPath();
    if (mode && !reducedMotion) {
      c.shadowBlur = pulseRadius * 2;
    }
    c.arc(node.px, node.py, pulseRadius, 0, Math.PI * 2);
    c.fillStyle = node.color;
    c.fill();

    // Letter identifier for interactive visual indexing
    if (v === 'login' && nodeRadius > 9) {
      c.shadowBlur = 0;
      c.fillStyle = 'rgba(255, 255, 255, 0.85)';
      c.font = 'bold 9px monospace';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(node.label[0], node.px, node.py);
    }

    c.restore();
  };

  const drawCoreOrb = (
    c: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    rot: number,
    mode: boolean,
    v: string
  ) => {
    c.save();

    // 1. Core outer corona shadow representation
    if (mode && !reducedMotion) {
      const glow = c.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.6);
      glow.addColorStop(0, 'rgba(103, 178, 182, 0.16)');
      glow.addColorStop(0.5, 'rgba(255, 160, 137, 0.04)');
      glow.addColorStop(1, 'rgba(103, 178, 182, 0)');
      c.fillStyle = glow;
      c.beginPath();
      c.arc(cx, cy, radius * 1.8, 0, Math.PI * 2);
      c.fill();
    }

    // 2. Metallic core gradient
    const radialGrad = c.createRadialGradient(
      cx - radius * 0.35,
      cy - radius * 0.35,
      radius * 0.05,
      cx,
      cy,
      radius
    );
    radialGrad.addColorStop(0, 'rgba(113, 189, 193, 0.85)');
    radialGrad.addColorStop(0.4, 'rgba(15, 23, 42, 0.95)');
    radialGrad.addColorStop(1, 'rgba(4, 6, 10, 1)');

    c.beginPath();
    c.arc(cx, cy, radius, 0, Math.PI * 2);
    c.fillStyle = radialGrad;
    c.fill();

    c.strokeStyle = 'rgba(103, 178, 182, 0.22)';
    c.lineWidth = 1.5;
    c.stroke();

    // 3. Grid line overlays spinning
    c.strokeStyle = 'rgba(103, 178, 182, 0.1)';
    c.lineWidth = 1;
    
    // Rotating contour arcs mapping
    for (let i = 0; i < 3; i++) {
      const ringOffset = rot + (i * Math.PI) / 3;
      c.beginPath();
      const semiWidth = radius * Math.sin(ringOffset);
      c.ellipse(cx, cy, Math.abs(semiWidth), radius, 0, 0, Math.PI * 2);
      c.stroke();
    }

    // 4. Centered titled MS2 film ticket brand plate
    c.save();
    c.translate(cx, cy);
    c.rotate(-12 * Math.PI / 180); // Exact Tilting factor
    
    const w = radius * 1.05;
    const h = radius * 0.62;
    
    if (mode && !reducedMotion) {
      c.shadowBlur = radius * 0.22;
      c.shadowColor = '#67b2b6';
    }
    
    c.strokeStyle = '#67b2b6';
    c.lineWidth = radius * 0.08;
    c.beginPath();
    const r = radius * 0.12;
    if (c.roundRect) {
      c.roundRect(-w/2, -h/2, w, h, r);
    } else {
      c.rect(-w/2, -h/2, w, h);
    }
    c.stroke();
    
    c.shadowBlur = 0;

    // Sprocket perforation columns
    c.fillStyle = 'rgba(255, 255, 255, 0.35)';
    const sprocketCount = 5;
    const sprocketW = w * 0.06;
    const sprocketH = h * 0.08;
    const spacing = w / (sprocketCount + 1);
    for (let i = 1; i <= sprocketCount; i++) {
        const xPos = -w/2 + i * spacing;
        c.fillRect(xPos - sprocketW/2, -h/2 + h * 0.06, sprocketW, sprocketH);
        c.fillRect(xPos - sprocketW/2, h/2 - h * 0.06 - sprocketH, sprocketW, sprocketH);
    }

    // Tilted brand typography
    c.fillStyle = '#FFA089'; 
    c.font = `900 ${Math.round(radius * 0.38)}px system-ui, -apple-system, sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('MS2', 0, radius * 0.04);
    
    c.restore();
    c.restore();
  };

  const getIcon = (iconName: string) => {
    const cls = "h-4 w-4 shrink-0";
    switch (iconName) {
      case 'Briefcase': return <Layers className={cls} />;
      case 'Users': return <Users className={cls} />;
      case 'FileText': return <Activity className={cls} />;
      case 'Calendar': return <Calendar className={cls} />;
      case 'AlertOctagon': return <AlertOctagon className={cls} />;
      default: return <HelpCircle className={cls} />;
    }
  };

  // Gracefully fallback visually if context/device initialization failed
  if (canvasError) {
    return (
      <div 
        className={`flex flex-col items-center justify-center p-6 border rounded-2xl select-none ${
          variant === 'login' ? 'w-64 h-64 bg-[#0a0e17]/80 border-cyan-500/10' : 'w-full h-40 bg-[#0a0e17]/40 border-cyan-500/5'
        }`}
        id="command-core-fallback"
      >
        <div className="relative flex items-center justify-center h-16 w-16 mb-3">
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-ping" />
          <div className="h-10 w-10 rounded-full bg-[#1e293b]/90 border border-[#67b2b6] flex items-center justify-center">
            <span className="text-[#FFA089] text-xs font-black font-sans leading-none">MS2</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-neutral-400 font-bold tracking-widest uppercase">
          OPERATIONAL ACTIVE CONSOLE
        </span>
        <span className="text-[9px] font-mono text-cyan-400/80 mt-1">
          {variant === 'login' ? 'STUDIO REGISTRY READY' : 'RESIZING BACKUP LOADED'}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${variant === 'login' ? 'w-full h-full min-h-[300px]' : 'w-full h-44 md:h-48'}`}
      id={`command-core-container-${variant}`}
    >
      <motion.div
        animate={(studioMode && !reducedMotion) ? {
          y: [0, -7, 0],
          rotate: [-0.3, 0.3, -0.3],
        } : { y: 0, rotate: 0 }}
        transition={{
          y: {
            duration: 6.2,
            repeat: Infinity,
            ease: "easeInOut"
          },
          rotate: {
            duration: 9.6,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="w-full h-full relative flex flex-col items-center justify-center"
      >
        <canvas
          ref={canvasRef}
          className="block cursor-pointer mx-auto max-w-full"
        />

        {/* 3D FLOATING DYNAMIC PRECISE TOOLTIP OVERLAY */}
        {hoveredNode && (
          <div
            ref={tooltipRef}
            className="absolute z-50 pointer-events-none bg-black/95 border border-white/10 rounded-2xl p-3 shadow-2xl glass-panel-heavy backdrop-blur-md animate-scale-up"
            style={{
              transform: 'translate(-50%, -50%)',
              transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-lg bg-white/5" style={{ color: hoveredNode.color }}>
                {getIcon(hoveredNode.icon)}
              </div>
              <div className="text-left leading-none">
                <span className="text-[9px] uppercase tracking-wider font-mono text-neutral-400 block font-semibold">{hoveredNode.label}</span>
                <span className="text-xs font-black text-white block mt-1 tracking-tight font-display">{hoveredNode.metric}</span>
              </div>
            </div>
            {variant === 'admin-hero' && (
              <div className="mt-1.5 border-t border-white/5 pt-1 flex items-center justify-between">
                <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest leading-none">CLICK TO FILTER VIEW</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
