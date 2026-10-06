/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface CinematicBackgroundProps {
  studioMode?: boolean;
}

export function CinematicBackground({ studioMode = true }: CinematicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const orb1Ref = useRef<HTMLDivElement | null>(null);
  const orb2Ref = useRef<HTMLDivElement | null>(null);
  const orb3Ref = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    if (!studioMode) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Smooth random drifting of cinematic studio warm/cool spot orbs
    gsap.to(orb1Ref.current, {
      x: '10vw',
      y: '12vh',
      scale: 1.15,
      duration: 18,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    gsap.to(orb2Ref.current, {
      x: '-12vw',
      y: '-8vh',
      scale: 0.9,
      duration: 24,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    gsap.to(orb3Ref.current, {
      x: '14vw',
      y: '-15vh',
      duration: 21,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, [studioMode]);

  useEffect(() => {
    if (!studioMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class representing slowly drifting, out-of-focus studio particles (cinematic dust)
    class Particle {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      opacity: number;
      maxOpacity: number;
      pulseSpeed: number;
      pulseDir: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Make some tiny film grains, and some large ambient glows
        this.radius = Math.random() < 0.85 ? Math.random() * 2 + 0.5 : Math.random() * 12 + 6;
        this.vx = (Math.random() - 0.5) * 0.12; // slow slow motion
        this.vy = (Math.random() - 0.5) * 0.12 - 0.05; // upward tendency
        this.maxOpacity = Math.random() * 0.25 + 0.05;
        this.opacity = Math.random() * this.maxOpacity;
        this.pulseSpeed = Math.random() * 0.003 + 0.001;
        this.pulseDir = Math.random() > 0.5 ? 1 : -1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Pulse opacity slightly
        this.opacity += this.pulseDir * this.pulseSpeed;
        if (this.opacity > this.maxOpacity) {
          this.opacity = this.maxOpacity;
          this.pulseDir = -1;
        } else if (this.opacity < 0.01) {
          this.opacity = 0.01;
          this.pulseDir = 1;
        }

        // Warp boundaries
        if (this.x < -20) this.x = width + 20;
        if (this.x > width + 20) this.x = -20;
        if (this.y < -20) this.y = height + 20;
        if (this.y > height + 20) this.y = -20;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Large background dust has a soft gradient blur effect
        if (this.radius > 5) {
          const grad = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
          grad.addColorStop(0, `rgba(103, 178, 182, ${this.opacity})`);
          grad.addColorStop(0.3, `rgba(103, 178, 182, ${this.opacity * 0.5})`);
          grad.addColorStop(1, 'rgba(103, 178, 182, 0)');
          c.fillStyle = grad;
        } else {
          // Small particles represent dust specs catching studio spotlight beams
          c.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.8})`;
        }
        
        c.fill();
        c.restore();
      }
    }

    const particles: Particle[] = Array.from({ length: 45 }, () => new Particle());

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse interactive ambient spotlight offset
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Dampen mouse movement for extra-smooth motion
      mouseX += (targetMouseX - mouseX) * 0.02;
      mouseY += (targetMouseY - mouseY) * 0.02;

      // Draw subtle secondary spotlight focusing around mouse pointer
      ctx.save();
      const spotlightRadius = Math.max(width, height) * 0.5;
      const gradient = ctx.createRadialGradient(
        mouseX,
        mouseY,
        10,
        mouseX,
        mouseY,
        spotlightRadius
      );
      gradient.addColorStop(0, 'rgba(103, 178, 182, 0.035)');
      gradient.addColorStop(0.4, 'rgba(255, 160, 137, 0.015)');
      gradient.addColorStop(1, 'rgba(6, 8, 13, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // Render the particles
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [studioMode]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" id="cinematic-background-matrix">
      {/* 1. LAYER 1: BASE COLOURED STUDIO CANVAS */}
      <div className={`absolute inset-0 bg-[#04060a] transition-all duration-700`} />

      {/* 2. LAYER 2: INTERACTIVE BACKDROP GRADIENT MESH */}
      {studioMode ? (
        <div className="absolute inset-0 opacity-[0.25] mix-blend-screen scale-110">
          <div ref={orb1Ref} className="absolute top-[10%] left-[25%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-[#67b2b6] to-cyan-900/40 blur-[130px] animate-pulse-glow" style={{ animationDuration: '24s' }} />
          <div ref={orb2Ref} className="absolute bottom-[15%] right-[15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#FFA089] to-red-950/20 blur-[150px] animate-pulse-glow" style={{ animationDuration: '32s', animationDelay: '3s' }} />
          <div ref={orb3Ref} className="absolute top-[40%] right-[30%] w-[35vw] h-[35vw] rounded-full bg-violet-900/10 blur-[120px] animate-pulse-glow" style={{ animationDuration: '18s', animationDelay: '1s' }} />
        </div>
      ) : (
        // Simple light/dark mode backup static grids/gradients
        <div className="absolute inset-0 opacity-[0.08]" style={{
          background: 'radial-gradient(circle at 30% 20%, #67b2b6 0%, transparent 50%), radial-gradient(circle at 80% 80%, #FFA089 0%, transparent 60%)'
        }} />
      )}

      {/* 3. LAYER 3: LIVE PARTICLE CANVAS */}
      {studioMode && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-80"
        />
      )}

      {/* 4. LAYER 4: DETAILED OPERATIONAL GRID */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:50px_50px] opacity-[0.25]"
        style={{
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)'
        }}
      />

      {/* 5. LAYER 5: ANALOG FILM FILM-GRAIN SILKTEXTURE */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay bg-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0%200%20200%20200'%20xmlns='http://www.w3.org/200/svg'%3E%3Cfilter%20id='noiseFilter'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='3'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}
