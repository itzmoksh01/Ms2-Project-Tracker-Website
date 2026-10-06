/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface DashboardGSAPConfig {
  containerRef: React.RefObject<HTMLDivElement | null>;
  activeTab?: string;
}

export function useDashboardGSAPAnimations({ containerRef, activeTab }: DashboardGSAPConfig) {
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // 1. Accessibility First: If reduced motion is requested, do not run high-motion cascades
      if (prefersReduced) {
        gsap.set(
          [
            '#admin-sidebar-nav',
            '#admin-header-title',
            '[id^="metric-card-"]',
            '[id^="dashboard-health-"]',
            '[id^="dashboard-upcoming-"]',
            '[id^="project-portfolio-card-"]',
            '[id^="proj-card-"]',
            '#dashboard-activity-feed',
            '#activity-feed-item',
            '#dashboard-charts-panel'
          ],
          { opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)' }
        );
        return;
      }

      // 2. Dashboard Initial Load/Entrance Timeline
      // Standard setup: slide/fade components on load
      const entranceTl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 0.8 },
      });

      // Subtle sidebar slide-in from left
      if (container.querySelector('#admin-sidebar-nav')) {
        entranceTl.fromTo(
          '#admin-sidebar-nav',
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }
        );
      }

      // Title/header fade down
      if (container.querySelector('#admin-header-title')) {
        entranceTl.fromTo(
          '#admin-header-title',
          { y: -15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
          '-=0.6'
        );
      }

      // Top stats cards reveal with stagger in sequential fashion
      const metricCards = container.querySelectorAll('[id^="metric-card-"]');
      if (metricCards.length > 0) {
        entranceTl.fromTo(
          metricCards,
          { opacity: 0, y: 15, scale: 0.98, filter: 'blur(4px)' },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            stagger: 0.08,
            duration: 0.75,
            ease: 'back.out(1.15)',
          },
          '-=0.5'
        );
      }

      // Secondary metrics / health cards
      const secondaryMetrics = container.querySelectorAll(
        '#dashboard-health-averages, #dashboard-upcoming-deadlines, #dashboard-critical-alerts, #progress-today-bar-display'
      );
      if (secondaryMetrics.length > 0) {
        entranceTl.fromTo(
          secondaryMetrics,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, stagger: 0.08, duration: 0.75, ease: 'power2.out' },
          '-=0.5'
        );
      }

      // Charts / analytics panel
      if (container.querySelector('#dashboard-charts-panel')) {
        entranceTl.fromTo(
          '#dashboard-charts-panel',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.85, ease: 'power2.out' },
          '-=0.4'
        );
      }

      // Heatmap calendar view reveal soft
      if (container.querySelector('#dashboard-calendar-heatmap')) {
        entranceTl.fromTo(
          '#dashboard-calendar-heatmap',
          { opacity: 0, scale: 0.99 },
          { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' },
          '-=0.5'
        );
      }

      // Activity Feed Items stagger reveal
      const feedItems = container.querySelectorAll('#activity-feed-item');
      if (feedItems.length > 0) {
        entranceTl.fromTo(
          feedItems,
          { opacity: 0, x: 15 },
          { opacity: 1, x: 0, stagger: 0.05, duration: 0.6, ease: 'power3.out' },
          '-=0.4'
        );
      }
    },
    { scope: containerRef, dependencies: [] }
  );

  // Trigger animations whenever active tab toggled
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container || !activeTab) return;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      // Animate active portfolio project card listings on tab-loaded view mount
      const activeProjectCards = container.querySelectorAll(
        '[id^="project-portfolio-card-"], [id^="proj-card-"]'
      );

      if (activeProjectCards.length > 0) {
        gsap.killTweensOf(activeProjectCards);
        gsap.fromTo(
          activeProjectCards,
          { opacity: 0, y: 20, scale: 0.97, filter: 'blur(4px)' },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            stagger: 0.05,
            duration: 0.7,
            ease: 'power3.out',
          }
        );
      }

      // Stagger items inside specific list view grids if they appear, such as reports
      const reportCards = container.querySelectorAll('[id^="report-builder-card-"]');
      if (reportCards.length > 0) {
        gsap.killTweensOf(reportCards);
        gsap.fromTo(
          reportCards,
          { opacity: 0, scale: 0.98, y: 12 },
          { opacity: 1, scale: 1, y: 0, stagger: 0.06, duration: 0.65, ease: 'power2.out' }
        );
      }
    },
    { scope: containerRef, dependencies: [activeTab] }
  );
}
