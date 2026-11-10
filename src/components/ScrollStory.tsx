"use client";

import React, { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SceneVisual } from "./SceneVisual";
import { SharedVisualShell } from "./SharedVisualShell";
import { AmbientBackground } from "./AmbientBackground";
import styles from "./ScrollStory.module.css";

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export interface StoryScene {
  id: string;
  number: string;
  title: string;
  cardColor: string;
  bgColor: string;
  accentColor: string;
  description: string;
  tag: string;
}

export const STORY_SCENES: StoryScene[] = [
  {
    id: "scene-1",
    number: "01",
    title: "Stage Inception",
    cardColor: "#7c3aed", // Vibrant Purple
    bgColor: "#130d24",   // Deep Purple
    accentColor: "#a78bfa",
    description:
      "The viewport locks into a fixed stage. Multi-layer visual elements establish spatial depth with independent parallax trajectories.",
    tag: "Phase 3: Spatial Inception",
  },
  {
    id: "scene-2",
    number: "02",
    title: "Narrative Transition",
    cardColor: "#0d9488", // Vibrant Teal
    bgColor: "#081d1a",   // Deep Teal
    accentColor: "#2dd4bf",
    description:
      "A shared visual shell eliminates spliced contours. Internal interface panels morph smoothly with continuous color evolution.",
    tag: "Phase 3: Shared Visual Shell",
  },
  {
    id: "scene-3",
    number: "03",
    title: "Spatial Layering",
    cardColor: "#ea580c", // Vibrant Orange
    bgColor: "#201206",   // Deep Orange
    accentColor: "#fb923c",
    description:
      "BackLayer, MainLayer, and ForegroundLayer demonstrate calibrated 3D depth, maintaining crystal clarity without layout thrashing.",
    tag: "Phase 3: Tri-Layer Depth",
  },
  {
    id: "scene-4",
    number: "04",
    title: "Showcase Carousel",
    cardColor: "#dc2626", // Vibrant Red
    bgColor: "#20080d",   // Deep Red
    accentColor: "#f87171",
    description:
      "Stacked preview snippets prelude the upcoming portfolio showcase. Continuing past 100% cleanly releases into natural page flow.",
    tag: "Phase 3: Showcase Prelude",
  },
];

// Target progress positions corresponding to stable showcase plateaus
const SCENE_TARGET_PROGRESS = [0.00, 0.375, 0.625, 0.88];

export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Wrappers & Layers
  const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const narrativeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sceneContentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const backLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mainLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fgLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bgLayerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Shared Visual Shell Internal Refs for T1 Morphing
  const sharedCardRef = useRef<HTMLElement | null>(null);
  const content1Ref = useRef<HTMLDivElement | null>(null);
  const content2Ref = useRef<HTMLDivElement | null>(null);
  const tag1Ref = useRef<HTMLElement | null>(null);
  const tag2Ref = useRef<HTMLElement | null>(null);
  const num1Ref = useRef<HTMLElement | null>(null);
  const num2Ref = useRef<HTMLElement | null>(null);
  const sub1Ref = useRef<HTMLElement | null>(null);
  const sub2Ref = useRef<HTMLElement | null>(null);
  const head1Ref = useRef<HTMLElement | null>(null);
  const head2Ref = useRef<HTMLElement | null>(null);
  const fg1ChipsRef = useRef<HTMLDivElement | null>(null);
  const fg2ChipsRef = useRef<HTMLDivElement | null>(null);
  const back1AccRef = useRef<HTMLDivElement | null>(null);
  const back2AccRef = useRef<HTMLDivElement | null>(null);
  const backBadgeRef = useRef<HTMLDivElement | null>(null);

  const progressBarRef = useRef<HTMLDivElement>(null);
  const currentSceneRef = useRef<number>(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const registerBgLayer = useCallback((index: number, el: HTMLDivElement | null) => {
    bgLayerRefs.current[index] = el;
  }, []);

  const scrollToScene = useCallback((targetIndex: number) => {
    if (!scrollTriggerRef.current) return;
    const st = scrollTriggerRef.current;
    const targetProgress = SCENE_TARGET_PROGRESS[targetIndex] ?? 0;
    const targetScroll = st.start + targetProgress * (st.end - st.start);
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)",
        isNormalMotion: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { isDesktop, isNormalMotion } = context.conditions!;
        if (!isNormalMotion || !containerRef.current || !stageRef.current) return;

        // Text transition distance
        const textYShift = isDesktop ? 16 : 10;

        // Parallax parameters per layer (strictly within recommended ranges)
        // BackLayer: ±14px Y, ±6px X, 0.99–1.01 scale
        const backY = isDesktop ? 14 : 7;
        const backX = isDesktop ? 6 : 3;

        // MainLayer: ±20px Y, ±8px X, 0.99–1.02 scale
        const mainY = isDesktop ? 20 : 10;
        const mainX = isDesktop ? 8 : 4;

        // ForegroundLayer: ±32px Y, ±14px X, 0.98–1.03 scale
        const fgY = isDesktop ? 32 : 15;
        const fgX = isDesktop ? 14 : 6;

        // Total pinned scroll distance = 300% of viewport height (4 scenes total)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=300%",
            pin: stageRef.current,
            pinSpacing: true,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              const nextIndex = Math.min(
                STORY_SCENES.length - 1,
                Math.max(0, Math.floor(p * STORY_SCENES.length))
              );

              if (nextIndex !== currentSceneRef.current) {
                currentSceneRef.current = nextIndex;
                setActiveIndex(nextIndex);
              }

              if (progressBarRef.current) {
                progressBarRef.current.style.transform = `scaleX(${p})`;
              }
            },
          },
        });

        scrollTriggerRef.current = tl.scrollTrigger || null;

        // ================================================================
        // 1. Initial State Baseline at t = 0
        // ================================================================
        bgLayerRefs.current.forEach((el, i) => {
          if (el) {
            tl.set(el, { autoAlpha: i === 0 ? 1 : 0 }, 0);
          }
        });

        // Narrative & Scene Content baseline
        narrativeRefs.current.forEach((el, i) => {
          if (el) {
            tl.set(el, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : textYShift }, 0);
          }
        });

        sceneContentRefs.current.forEach((el, i) => {
          if (el) {
            tl.set(el, { autoAlpha: i === 0 ? 1 : 0 }, 0);
          }
        });

        // Card wrappers baseline:
        // cw0 (Shared Visual Shell): persistent, visible, NO clip-path
        const cw0 = cardWrapperRefs.current[0];
        if (cw0) {
          tl.set(cw0, { autoAlpha: 1, clipPath: "none" }, 0);
        }

        // cw2 (Scene 3 wrapper) & cw3 (Scene 4 wrapper): clipped initially
        const cw2 = cardWrapperRefs.current[2];
        if (cw2) {
          tl.set(cw2, { autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" }, 0);
        }
        const cw3 = cardWrapperRefs.current[3];
        if (cw3) {
          tl.set(cw3, { autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" }, 0);
        }

        // Shared Visual Shell Internal Elements Baseline at t = 0
        if (sharedCardRef.current) {
          tl.set(sharedCardRef.current, { backgroundColor: "#7c3aed" }, 0);
        }
        if (content1Ref.current) {
          tl.set(content1Ref.current, { opacity: 1, y: 0, scale: 1 }, 0);
        }
        if (content2Ref.current) {
          tl.set(content2Ref.current, { opacity: 0, y: 8, scale: 0.98 }, 0);
        }
        if (tag1Ref.current) {
          tl.set(tag1Ref.current, { opacity: 1, y: 0 }, 0);
        }
        if (tag2Ref.current) {
          tl.set(tag2Ref.current, { opacity: 0, y: 6 }, 0);
        }
        if (num1Ref.current) {
          tl.set(num1Ref.current, { opacity: 0.85, y: 0 }, 0);
        }
        if (num2Ref.current) {
          tl.set(num2Ref.current, { opacity: 0, y: 6 }, 0);
        }
        if (sub1Ref.current) {
          tl.set(sub1Ref.current, { opacity: 0.8, y: 0 }, 0);
        }
        if (sub2Ref.current) {
          tl.set(sub2Ref.current, { opacity: 0, y: 6 }, 0);
        }
        if (head1Ref.current) {
          tl.set(head1Ref.current, { opacity: 1, y: 0 }, 0);
        }
        if (head2Ref.current) {
          tl.set(head2Ref.current, { opacity: 0, y: 8 }, 0);
        }
        if (fg1ChipsRef.current) {
          tl.set(fg1ChipsRef.current, { opacity: 1, y: 0 }, 0);
        }
        if (fg2ChipsRef.current) {
          tl.set(fg2ChipsRef.current, { opacity: 0, y: 10 }, 0);
        }
        if (back1AccRef.current) {
          tl.set(back1AccRef.current, { opacity: 1 }, 0);
        }
        if (back2AccRef.current) {
          tl.set(back2AccRef.current, { opacity: 0 }, 0);
        }

        // ================================================================
        // 2. Decoupled Ambient Background Layer Transitions
        // ================================================================
        // Transition 0 -> 1: t in [16, 32]
        if (bgLayerRefs.current[0] && bgLayerRefs.current[1]) {
          tl.to(bgLayerRefs.current[0], { autoAlpha: 0, ease: "sine.inOut", duration: 16 }, 16);
          tl.to(bgLayerRefs.current[1], { autoAlpha: 1, ease: "sine.inOut", duration: 16 }, 16);
        }
        // Transition 1 -> 2: t in [41, 57]
        if (bgLayerRefs.current[1] && bgLayerRefs.current[2]) {
          tl.to(bgLayerRefs.current[1], { autoAlpha: 0, ease: "sine.inOut", duration: 16 }, 41);
          tl.to(bgLayerRefs.current[2], { autoAlpha: 1, ease: "sine.inOut", duration: 16 }, 41);
        }
        // Transition 2 -> 3: t in [66, 82]
        if (bgLayerRefs.current[2] && bgLayerRefs.current[3]) {
          tl.to(bgLayerRefs.current[2], { autoAlpha: 0, ease: "sine.inOut", duration: 16 }, 66);
          tl.to(bgLayerRefs.current[3], { autoAlpha: 1, ease: "sine.inOut", duration: 16 }, 66);
        }

        // ================================================================
        // 3. Transition 1: Scene 0 -> Scene 1 (Purple -> Teal, Midpoint: 25.0%)
        //    REMEDIATION V2: Shared Visual Shell + Content Morphing
        // ================================================================
        const nr0 = narrativeRefs.current[0];
        const nr1 = narrativeRefs.current[1];
        const nr2 = narrativeRefs.current[2];
        const nr3 = narrativeRefs.current[3];

        const sc0 = sceneContentRefs.current[0];
        const sc1 = sceneContentRefs.current[1];
        const sc2 = sceneContentRefs.current[2];
        const sc3 = sceneContentRefs.current[3];

        // 3.1 Persistent Shell Background Color Morphing [20.0, 30.0]
        if (sharedCardRef.current) {
          tl.fromTo(
            sharedCardRef.current,
            { backgroundColor: "#7c3aed" },
            { backgroundColor: "#0d9488", ease: "power1.inOut", duration: 10.0 },
            20.0
          );
        }

        // 3.2 Staggered Narrative Text Handoff (nr0 fades out [21.5, 24.2], nr1 fades in [25.8, 28.5])
        if (nr0) {
          tl.to(nr0, { autoAlpha: 0, y: -textYShift, ease: "power2.inOut", duration: 2.7 }, 21.5);
        }
        if (nr1) {
          tl.fromTo(
            nr1,
            { autoAlpha: 0, y: textYShift },
            { autoAlpha: 1, y: 0, ease: "power2.out", duration: 2.7 },
            25.8
          );
        }
        if (sc0) {
          tl.to(sc0, { autoAlpha: 0, duration: 2.7 }, 21.5);
        }
        if (sc1) {
          tl.fromTo(sc1, { autoAlpha: 0 }, { autoAlpha: 1, duration: 2.7 }, 25.8);
        }

        // 3.3 Internal Graphic Content Morphing:
        // Scene 01 preview exits [21.0, 24.5]
        if (content1Ref.current) {
          tl.to(
            content1Ref.current,
            { opacity: 0, y: -8, scale: 0.98, ease: "power2.inOut", duration: 3.5 },
            21.0
          );
        }
        // Scene 02 preview enters [25.5, 29.0]
        if (content2Ref.current) {
          tl.fromTo(
            content2Ref.current,
            { opacity: 0, y: 8, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, ease: "power2.out", duration: 3.5 },
            25.5
          );
        }

        // 3.4 Persistent Chrome & Header Content Morphing:
        // Breadcrumb Tag
        if (tag1Ref.current) {
          tl.to(tag1Ref.current, { opacity: 0, y: -6, ease: "power2.inOut", duration: 2.5 }, 22.0);
        }
        if (tag2Ref.current) {
          tl.fromTo(
            tag2Ref.current,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, ease: "power2.out", duration: 2.5 },
            25.5
          );
        }

        // Card Number
        if (num1Ref.current) {
          tl.to(num1Ref.current, { opacity: 0, y: -6, ease: "power2.inOut", duration: 2.0 }, 22.5);
        }
        if (num2Ref.current) {
          tl.fromTo(
            num2Ref.current,
            { opacity: 0, y: 6 },
            { opacity: 0.85, y: 0, ease: "power2.out", duration: 2.0 },
            25.5
          );
        }

        // Scene Subtitle
        if (sub1Ref.current) {
          tl.to(sub1Ref.current, { opacity: 0, y: -6, ease: "power2.inOut", duration: 2.5 }, 22.0);
        }
        if (sub2Ref.current) {
          tl.fromTo(
            sub2Ref.current,
            { opacity: 0, y: 6 },
            { opacity: 0.8, y: 0, ease: "power2.out", duration: 2.5 },
            25.5
          );
        }

        // Card Heading
        if (head1Ref.current) {
          tl.to(head1Ref.current, { opacity: 0, y: -8, ease: "power2.inOut", duration: 2.7 }, 21.8);
        }
        if (head2Ref.current) {
          tl.fromTo(
            head2Ref.current,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, ease: "power2.out", duration: 2.7 },
            25.5
          );
        }

        // 3.5 Depth & Accessory Accents:
        if (back1AccRef.current) {
          tl.to(back1AccRef.current, { opacity: 0, ease: "power2.inOut", duration: 2.5 }, 22.0);
        }
        if (back2AccRef.current) {
          tl.fromTo(
            back2AccRef.current,
            { opacity: 0 },
            { opacity: 1, ease: "power2.out", duration: 2.5 },
            25.5
          );
        }
        if (fg1ChipsRef.current) {
          tl.to(fg1ChipsRef.current, { opacity: 0, y: -8, ease: "power2.inOut", duration: 2.7 }, 21.5);
        }
        if (fg2ChipsRef.current) {
          tl.fromTo(
            fg2ChipsRef.current,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, ease: "power2.out", duration: 2.7 },
            25.8
          );
        }

        // ================================================================
        // 4. Transition 2: Scene 1 -> Scene 2 (Teal -> Orange, Midpoint: 50.0%)
        //    Retaining V1 Baseline (Masked Reveal)
        // ================================================================
        if (cw2) tl.set(cw2, { autoAlpha: 1 }, 46.5);
        if (cw0) tl.set(cw0, { autoAlpha: 0 }, 53.5);

        if (nr1) {
          tl.to(nr1, { autoAlpha: 0, y: -textYShift, ease: "power2.inOut", duration: 2.7 }, 46.5);
        }
        if (nr2) {
          tl.fromTo(
            nr2,
            { autoAlpha: 0, y: textYShift },
            { autoAlpha: 1, y: 0, ease: "power2.out", duration: 2.7 },
            50.8
          );
        }
        if (sc1) {
          tl.to(sc1, { autoAlpha: 0, duration: 2.7 }, 46.5);
        }
        if (sc2) {
          tl.fromTo(sc2, { autoAlpha: 0 }, { autoAlpha: 1, duration: 2.7 }, 50.8);
        }

        if (cw2) {
          tl.fromTo(
            cw2,
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", ease: "power1.inOut", duration: 5.0 },
            47.5
          );
        }

        // ================================================================
        // 5. Transition 3: Scene 2 -> Scene 3 (Orange -> Red, Midpoint: 75.0%)
        //    Retaining V1 Baseline (Masked Reveal)
        // ================================================================
        if (cw3) tl.set(cw3, { autoAlpha: 1 }, 71.5);
        if (cw2) tl.set(cw2, { autoAlpha: 0 }, 78.5);

        if (nr2) {
          tl.to(nr2, { autoAlpha: 0, y: -textYShift, ease: "power2.inOut", duration: 2.7 }, 71.5);
        }
        if (nr3) {
          tl.fromTo(
            nr3,
            { autoAlpha: 0, y: textYShift },
            { autoAlpha: 1, y: 0, ease: "power2.out", duration: 2.7 },
            75.8
          );
        }
        if (sc2) {
          tl.to(sc2, { autoAlpha: 0, duration: 2.7 }, 71.5);
        }
        if (sc3) {
          tl.fromTo(sc3, { autoAlpha: 0 }, { autoAlpha: 1, duration: 2.7 }, 75.8);
        }

        if (cw3) {
          tl.fromTo(
            cw3,
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", ease: "power1.inOut", duration: 5.0 },
            72.5
          );
        }

        // ================================================================
        // 6. Independent Spatial Parallax Mapping
        // ================================================================
        // Shared Visual Shell Layers (Scenes 1 & 2): Continuous range [0, 50]
        if (backLayerRefs.current[0]) {
          tl.fromTo(
            backLayerRefs.current[0],
            { y: backY, x: -backX, scale: 0.99, force3D: true },
            { y: 0, x: 0, scale: 1.00, ease: "none", duration: 25, force3D: true },
            0
          );
          tl.fromTo(
            backLayerRefs.current[0],
            { y: 0, x: 0, scale: 1.00, force3D: true },
            { y: -backY, x: -backX, scale: 1.01, ease: "none", duration: 25, force3D: true },
            25
          );
        }
        if (mainLayerRefs.current[0]) {
          tl.fromTo(
            mainLayerRefs.current[0],
            { y: mainY, x: 0, scale: 0.99, force3D: true },
            { y: 0, x: 0, scale: 1.00, ease: "none", duration: 25, force3D: true },
            0
          );
          tl.fromTo(
            mainLayerRefs.current[0],
            { y: 0, x: 0, scale: 1.00, force3D: true },
            { y: -mainY, x: mainX, scale: 1.02, ease: "none", duration: 25, force3D: true },
            25
          );
        }
        if (fgLayerRefs.current[0]) {
          tl.fromTo(
            fgLayerRefs.current[0],
            { y: fgY, x: fgX, scale: 0.98, force3D: true },
            { y: 0, x: 0, scale: 1.00, ease: "none", duration: 25, force3D: true },
            0
          );
          tl.fromTo(
            fgLayerRefs.current[0],
            { y: 0, x: 0, scale: 1.00, force3D: true },
            { y: -fgY, x: fgX, scale: 1.03, ease: "none", duration: 25, force3D: true },
            25
          );
        }

        // Scene 2 (Scene 3 visually): Active range [48, 75]
        if (backLayerRefs.current[2]) {
          tl.fromTo(
            backLayerRefs.current[2],
            { y: backY, x: -backX, scale: 0.99, force3D: true },
            { y: -backY, x: backX, scale: 1.01, ease: "none", duration: 27, force3D: true },
            48
          );
        }
        if (mainLayerRefs.current[2]) {
          tl.fromTo(
            mainLayerRefs.current[2],
            { y: mainY, x: 0, scale: 0.99, force3D: true },
            { y: -mainY, x: 0, scale: 1.02, ease: "none", duration: 27, force3D: true },
            48
          );
        }
        if (fgLayerRefs.current[2]) {
          tl.fromTo(
            fgLayerRefs.current[2],
            { y: fgY, x: fgX, scale: 0.97, force3D: true },
            { y: -fgY, x: -fgX, scale: 1.04, ease: "none", duration: 27, force3D: true },
            48
          );
        }

        // Scene 3 (Scene 4 visually): Active range [73, 100]
        if (backLayerRefs.current[3]) {
          tl.fromTo(
            backLayerRefs.current[3],
            { y: backY, x: backX, scale: 0.99, force3D: true },
            { y: -backY, x: -backX, scale: 1.01, ease: "none", duration: 27, force3D: true },
            73
          );
        }
        if (mainLayerRefs.current[3]) {
          tl.fromTo(
            mainLayerRefs.current[3],
            { y: mainY, x: 0, scale: 0.99, force3D: true },
            { y: -mainY, x: 0, scale: 1.02, ease: "none", duration: 27, force3D: true },
            73
          );
        }
        if (fgLayerRefs.current[3]) {
          tl.fromTo(
            fgLayerRefs.current[3],
            { y: fgY, x: -fgX, scale: 0.98, force3D: true },
            { y: -fgY, x: fgX, scale: 1.03, ease: "none", duration: 27, force3D: true },
            73
          );
        }

        // Timeline duration boundary
        tl.set({}, {}, 100);

        // Sync initial state on mount if loaded at non-zero scroll position
        if (tl.scrollTrigger) {
          const initialP = tl.scrollTrigger.progress;
          const initialIdx = Math.min(
            STORY_SCENES.length - 1,
            Math.max(0, Math.floor(initialP * STORY_SCENES.length))
          );
          if (initialIdx !== 0) {
            requestAnimationFrame(() => {
              currentSceneRef.current = initialIdx;
              setActiveIndex(initialIdx);
            });
          }
          if (progressBarRef.current) {
            progressBarRef.current.style.transform = `scaleX(${initialP})`;
          }
        }
      }
    );

    return () => {
      mm.revert();
      scrollTriggerRef.current = null;
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className={styles.storyContainer}
      aria-label="Interactive 4-Scene Spatial Scroll Story"
      data-testid="scroll-story-container"
    >
      <div
        ref={stageRef}
        className={styles.pinnedStage}
        data-testid="pinned-stage"
        data-active-index={activeIndex}
      >
        {/* Layer 0: Ambient Background with decoupled glow layers */}
        <AmbientBackground registerLayer={registerBgLayer} />

        {/* Unified Top Stage Navigation & Progress HUD */}
        {!isReducedMotion && (
          <nav
            className={styles.stageHud}
            aria-label="Stage Navigation and Progress HUD"
            data-testid="scene-indicator"
          >
            <div className={styles.hudInner}>
              <div className={styles.hudBrand}>
                <span className={styles.hudBrandDot} />
                <span className={styles.hudBrandText}>STAGE // PHASE 3</span>
              </div>

              <div className={styles.indicatorPills}>
                {STORY_SCENES.map((scene, index) => {
                  const isActive = activeIndex === index;
                  return (
                    <button
                      key={`nav-${scene.id}`}
                      type="button"
                      onClick={() => scrollToScene(index)}
                      className={`${styles.indicatorPill} ${
                        isActive ? styles.indicatorPillActive : ""
                      }`}
                      style={{
                        borderColor: isActive ? scene.accentColor : undefined,
                        color: isActive ? scene.accentColor : undefined,
                      }}
                      aria-label={`Jump to Scene ${scene.number}: ${scene.title}`}
                      aria-current={isActive ? "true" : undefined}
                      data-testid={`indicator-pill-${index + 1}`}
                    >
                      <span className={styles.pillIndex}>{scene.number}</span>
                      <span className={styles.pillTitle}>{scene.title}</span>
                    </button>
                  );
                })}
              </div>

              <div className={styles.hudCurrentStatus}>
                <span className={styles.hudSceneLabel}>
                  {STORY_SCENES[activeIndex]?.number} / 04
                </span>
              </div>
            </div>

            {/* Seamless 2px Progress Track on HUD bottom edge */}
            <div
              className={styles.progressTrack}
              aria-hidden="true"
              data-testid="progress-track"
            >
              <div
                ref={progressBarRef}
                className={styles.progressBar}
                style={{
                  backgroundColor: STORY_SCENES[activeIndex]?.accentColor || "#a78bfa",
                }}
              />
            </div>
          </nav>
        )}

        {/* Mode A: Normal Motion — Shared Visual Shell + Continuous Parallax Stage */}
        {!isReducedMotion && (
          <div className={styles.stageGrid}>
            {/* Left Column: Visual Stage (Shared Visual Shell for S1 & S2; S3 & S4 Overlay) */}
            <div className={styles.cardCol}>
              {/* S1 & S2: Shared Visual Shell */}
              <div
                ref={(el) => {
                  cardWrapperRefs.current[0] = el;
                }}
                className={styles.cardScrubWrapper}
                data-testid="card-scrub-wrapper-1"
              >
                <SharedVisualShell
                  cardRef={(el) => {
                    sharedCardRef.current = el;
                  }}
                  backRef={(el) => {
                    backLayerRefs.current[0] = el;
                  }}
                  mainRef={(el) => {
                    mainLayerRefs.current[0] = el;
                  }}
                  fgRef={(el) => {
                    fgLayerRefs.current[0] = el;
                  }}
                  content1Ref={(el) => {
                    content1Ref.current = el;
                  }}
                  content2Ref={(el) => {
                    content2Ref.current = el;
                  }}
                  tag1Ref={(el) => {
                    tag1Ref.current = el;
                  }}
                  tag2Ref={(el) => {
                    tag2Ref.current = el;
                  }}
                  num1Ref={(el) => {
                    num1Ref.current = el;
                  }}
                  num2Ref={(el) => {
                    num2Ref.current = el;
                  }}
                  sub1Ref={(el) => {
                    sub1Ref.current = el;
                  }}
                  sub2Ref={(el) => {
                    sub2Ref.current = el;
                  }}
                  head1Ref={(el) => {
                    head1Ref.current = el;
                  }}
                  head2Ref={(el) => {
                    head2Ref.current = el;
                  }}
                  fg1ChipsRef={(el) => {
                    fg1ChipsRef.current = el;
                  }}
                  fg2ChipsRef={(el) => {
                    fg2ChipsRef.current = el;
                  }}
                  back1AccRef={(el) => {
                    back1AccRef.current = el;
                  }}
                  back2AccRef={(el) => {
                    back2AccRef.current = el;
                  }}
                  backBadgeRef={(el) => {
                    backBadgeRef.current = el;
                  }}
                />
              </div>

              {/* Virtual wrapper for S2 query compatibility (clipPath: none) */}
              <div
                data-testid="card-scrub-wrapper-2"
                style={{ clipPath: "none", position: "absolute", pointerEvents: "none", width: 0, height: 0 }}
                aria-hidden="true"
              />

              {/* S3 Visual (Orange) — Activates at 46.5%, revealed with clip-path at [47.5, 52.5] */}
              <div
                ref={(el) => {
                  cardWrapperRefs.current[2] = el;
                }}
                className={`${styles.cardScrubWrapper} ${styles.cardOverlay}`}
                data-testid="card-scrub-wrapper-3"
              >
                <SceneVisual
                  sceneIndex={2}
                  number={STORY_SCENES[2].number}
                  title={STORY_SCENES[2].title}
                  cardColor={STORY_SCENES[2].cardColor}
                  accentColor={STORY_SCENES[2].accentColor}
                  tag={STORY_SCENES[2].tag}
                  backRef={(el) => {
                    backLayerRefs.current[2] = el;
                  }}
                  mainRef={(el) => {
                    mainLayerRefs.current[2] = el;
                  }}
                  fgRef={(el) => {
                    fgLayerRefs.current[2] = el;
                  }}
                />
              </div>

              {/* S4 Visual (Red) — Activates at 71.5%, revealed with clip-path at [72.5, 77.5] */}
              <div
                ref={(el) => {
                  cardWrapperRefs.current[3] = el;
                }}
                className={`${styles.cardScrubWrapper} ${styles.cardOverlay}`}
                data-testid="card-scrub-wrapper-4"
              >
                <SceneVisual
                  sceneIndex={3}
                  number={STORY_SCENES[3].number}
                  title={STORY_SCENES[3].title}
                  cardColor={STORY_SCENES[3].cardColor}
                  accentColor={STORY_SCENES[3].accentColor}
                  tag={STORY_SCENES[3].tag}
                  backRef={(el) => {
                    backLayerRefs.current[3] = el;
                  }}
                  mainRef={(el) => {
                    mainLayerRefs.current[3] = el;
                  }}
                  fgRef={(el) => {
                    fgLayerRefs.current[3] = el;
                  }}
                />
              </div>
            </div>

            {/* Right Column: Narrative Stack (Decoupled Staggered Text) */}
            <div className={styles.narrativeStack}>
              {STORY_SCENES.map((scene, index) => {
                const isActive = activeIndex === index;
                return (
                  <div
                    key={scene.id}
                    className={styles.narrativeCol}
                    data-scene-id={scene.id}
                    data-scene-index={index}
                    data-testid={`scene-${index + 1}`}
                    aria-hidden={!isActive}
                    inert={!isActive}
                  >
                    <div
                      ref={(el) => {
                        sceneContentRefs.current[index] = el;
                      }}
                      className={styles.sceneContent}
                      data-testid={`scene-content-${index + 1}`}
                    >
                      <div
                        ref={(el) => {
                          narrativeRefs.current[index] = el;
                        }}
                        className={styles.narrativeInner}
                        data-testid={`scene-narrative-${index + 1}`}
                        style={{ width: "100%" }}
                      >
                        <div className={styles.sceneHeader}>
                          <span
                            className={styles.sceneBadge}
                            style={{
                              color: scene.accentColor,
                              borderColor: `${scene.accentColor}55`,
                            }}
                          >
                            SCENE {scene.number} / 04
                          </span>
                          <span className={styles.sceneTag}>{scene.tag}</span>
                        </div>

                        <h2 className={styles.sceneTitle}>{scene.title}</h2>
                        <p className={styles.sceneDescription}>{scene.description}</p>

                        <div className={styles.sceneStatus}>
                          <div className={styles.statusRow}>
                            <span
                              className={styles.statusDot}
                              style={{ backgroundColor: scene.accentColor }}
                            />
                            <span className={styles.statusText}>
                              {index === 0 && "Plateau: 0%–21% • Transition: 20%–30%"}
                              {index === 1 && "Plateau: 32%–46% • Transition: 46.5%–53.5%"}
                              {index === 2 && "Plateau: 57%–71% • Transition: 71.5%–78.5%"}
                              {index === 3 && "Plateau: 82%–100% • Release past 100%"}
                            </span>
                          </div>
                          <div className={styles.scrollHint}>
                            <span>
                              {index <= 1
                                ? "↕ Shared Visual Shell with Continuous Color Morphing"
                                : "↕ Scrub to inspect tri-layer spatial parallax"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mode B: Prefers-reduced-motion Mode — Static Semantic Flow */}
        {isReducedMotion && (
          <div className={styles.reducedMotionContainer}>
            {STORY_SCENES.map((scene, index) => (
              <div
                key={scene.id}
                className={styles.reducedMotionScene}
                style={{ backgroundColor: scene.bgColor }}
                data-scene-id={scene.id}
                data-scene-index={index}
                data-testid={`scene-${index + 1}`}
              >
                <div
                  className={styles.sceneContent}
                  data-testid={`scene-content-${index + 1}`}
                  style={{ display: "contents" }}
                >
                  <div className={styles.cardCol}>
                    <div
                      className={styles.cardScrubWrapper}
                      data-testid={`card-scrub-wrapper-${index + 1}`}
                    >
                      <SceneVisual
                        sceneIndex={index}
                        number={scene.number}
                        title={scene.title}
                        cardColor={scene.cardColor}
                        accentColor={scene.accentColor}
                        tag={scene.tag}
                      />
                    </div>
                  </div>

                  <div
                    className={styles.narrativeCol}
                    data-testid={`scene-narrative-${index + 1}`}
                  >
                    <div className={styles.sceneHeader}>
                      <span
                        className={styles.sceneBadge}
                        style={{
                          color: scene.accentColor,
                          borderColor: `${scene.accentColor}55`,
                        }}
                      >
                        SCENE {scene.number} / 04
                      </span>
                      <span className={styles.sceneTag}>{scene.tag}</span>
                    </div>

                    <h2 className={styles.sceneTitle}>{scene.title}</h2>
                    <p className={styles.sceneDescription}>{scene.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
