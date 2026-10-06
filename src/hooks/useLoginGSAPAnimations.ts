/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface LoginAnimationRefs {
  container: React.RefObject<HTMLDivElement | null>;
  logo: React.RefObject<HTMLDivElement | null>;
  brandingCard: React.RefObject<HTMLDivElement | null>;
  loginCard: React.RefObject<HTMLDivElement | null>;
  title: React.RefObject<HTMLHeadingElement | null>;
  subtitle: React.RefObject<HTMLParagraphElement | null>;
  form: React.RefObject<HTMLFormElement | null>;
  submitButton: React.RefObject<HTMLButtonElement | null>;
  demoAssistant: React.RefObject<HTMLDivElement | null>;
}

export function useLoginGSAPAnimations({
  container,
  logo,
  brandingCard,
  loginCard,
  title,
  subtitle,
  form,
  submitButton,
  demoAssistant,
}: LoginAnimationRefs) {
  const timelineRef = useRef<any>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // 1. Initial State Settings for smooth layout
      if (prefersReduced) {
        // Reduced Motion mode applies simple soft transitions
        const simpleTl = gsap.timeline();
        simpleTl.fromTo(container.current, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' });
        return;
      }

      // Hide elements initially to prevent layout-flashes / shifts
      const elementsToHide = [
        logo.current,
        brandingCard.current,
        loginCard.current,
        title.current,
        subtitle.current,
        submitButton.current,
        demoAssistant.current,
      ].filter(Boolean);

      if (elementsToHide.length > 0) {
        gsap.set(elementsToHide, { opacity: 0 });
      }

      // Select fields and other inner components within form
      const formChildren = form.current ? form.current.querySelectorAll('.space-y-1\\.5, .p-3') : [];
      if (formChildren.length > 0) {
        gsap.set(formChildren, { opacity: 0, y: 15 });
      }

      // 2. High-End Master Entrance Sequence Timeline
      const timeline = gsap.timeline({
        defaults: { ease: 'power4.out', duration: 1.2 }
      });
      timelineRef.current = timeline;

      // a. Start with subtle backdrop fade in
      timeline.fromTo(
        container.current,
        { backgroundColor: 'rgba(4, 6, 10, 1)' },
        { backgroundColor: '#06080d', duration: 1, ease: 'sine.out' }
      );

      // b. MS2 Logo reveals first with scale, opacity, and subtle teal/red glow sweep
      if (logo.current) {
        timeline.fromTo(
          logo.current,
          { opacity: 0, scale: 0.8 },
          { 
            opacity: 1, 
            scale: 1, 
            duration: 1.4, 
            ease: 'expo.out' 
          },
          '-=0.4'
        );
      }

      // c. Lateral glass panels entry from opposite directions
      if (brandingCard.current) {
        timeline.fromTo(
          brandingCard.current,
          { opacity: 0, x: -45, scale: 0.98, filter: 'blur(8px)' },
          { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power4.out' },
          '-=0.9'
        );
      }

      if (loginCard.current) {
        timeline.fromTo(
          loginCard.current,
          { opacity: 0, x: 45, scale: 0.98, filter: 'blur(8px)' },
          { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power4.out' },
          '-=1.3'
        );
      }

      // d. High-end staggered title and subtitle reveals inside left card
      if (title.current) {
        timeline.fromTo(
          title.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' },
          '-=1.0'
        );
      }
      if (subtitle.current) {
        timeline.fromTo(
          subtitle.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
          '-=0.8'
        );
      }

      // e. Form inputs stagger in cleanly
      if (formChildren.length > 0) {
        timeline.to(
          formChildren,
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.7'
        );
      }

      // f. Login main submit button slide/fade
      if (submitButton.current) {
        timeline.fromTo(
          submitButton.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
          '-=0.5'
        );
      }

      // g. Demo assistant stagger
      if (demoAssistant.current) {
        timeline.fromTo(
          demoAssistant.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.4'
        );
      }

      // 3. Ambient movement parallax on mousemove for cinematic depth
      const onMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const moveX = (clientX - centerX) / centerX; // val between -1 and 1
        const moveY = (clientY - centerY) / centerY;

        // Animate elements slightly with power dampening
        if (brandingCard.current) {
          gsap.to(brandingCard.current, {
            x: moveX * 8, // subtle limit
            y: moveY * 5,
            rotationY: moveX * 1.5,
            rotationX: -moveY * 1.5,
            transformPerspective: 1000,
            duration: 0.8,
            ease: 'power1.out',
          });
        }
        if (loginCard.current) {
          gsap.to(loginCard.current, {
            x: moveX * -8,
            y: moveY * -5,
            rotationY: moveX * -1.5,
            rotationX: -moveY * -1.5,
            transformPerspective: 1000,
            duration: 0.8,
            ease: 'power1.out',
          });
        }
      };

      window.addEventListener('mousemove', onMouseMove);

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
      };
    },
    { scope: container }
  );

  // Trigger smooth login card shake and red glowing aura on authentication error
  const triggerErrorShake = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      // Just a red quick highlight
      gsap.fromTo(el, { borderColor: 'rgba(239, 68, 68, 0.2)' }, { borderColor: '#ef4444', duration: 0.4, yoyo: true, repeat: 1 });
      return;
    }

    const shakeTimeline = gsap.timeline();
    // Soft organic shake, premium, not game-like
    shakeTimeline.to(el, { x: -8, duration: 0.08, ease: 'sine.inOut' });
    shakeTimeline.to(el, { x: 6, duration: 0.08, ease: 'sine.inOut' });
    shakeTimeline.to(el, { x: -5, duration: 0.08, ease: 'sine.inOut' });
    shakeTimeline.to(el, { x: 3, duration: 0.08, ease: 'sine.inOut' });
    shakeTimeline.to(el, { x: 0, duration: 0.08, ease: 'sine.inOut' });

    // Premium subtle red highlight pulse on failure
    gsap.fromTo(
      el,
      { boxShadow: '0 0 0px rgba(244, 63, 94, 0)' },
      {
        boxShadow: '0 0 25px rgba(244, 63, 94, 0.35)',
        borderColor: '#f43f5e',
        duration: 0.4,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      }
    );
  };

  // Trigger scale exit on successful verification transition
  const triggerSuccessExit = (callback: () => void) => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      gsap.to(container.current, {
        opacity: 0,
        duration: 0.4,
        onComplete: callback,
      });
      return;
    }

    const activeCards = [brandingCard.current, loginCard.current].filter(Boolean);
    gsap.killTweensOf(activeCards);

    const exitTl = gsap.timeline({ onComplete: callback });
    if (brandingCard.current) {
      exitTl.to(brandingCard.current, {
        opacity: 0,
        scale: 0.95,
        y: -20,
        filter: 'blur(10px)',
        duration: 0.65,
        ease: 'power3.in',
      }, 0);
    }

    if (loginCard.current) {
      exitTl.to(loginCard.current, {
        opacity: 0,
        scale: 0.95,
        y: 20,
        filter: 'blur(10px)',
        duration: 0.65,
        ease: 'power3.in',
      }, 0);
    }
  };

  return { triggerErrorShake, triggerSuccessExit };
}
