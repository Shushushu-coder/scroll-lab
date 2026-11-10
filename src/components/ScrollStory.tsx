"use client";

import React, { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SceneVisual } from "./SceneVisual";
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
      "A single-focus visual handoff eliminates double-contour ghosting. Split workspace panels shift with decoupled parallax timing.",
    tag: "Phase 3: Single-Focus Handoff",
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
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sceneContentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const narrativeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const backLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mainLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fgLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bgLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
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
        // BackLayer: ±12px Y, ±6px X, 0.99–1.01 scale
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

        // 1. Initial State Baseline at t = 0
        bgLayerRefs.current.forEach((el, i) => {
          if (el) {
            tl.set(el, { autoAlpha: i === 0 ? 1 : 0 }, 0);
          }
        });

        sceneContentRefs.current.forEach((el, i) => {
          if (el) {
            tl.set(el, { autoAlpha: i === 0 ? 1 : 0, y: 0, filter: "none" }, 0);
          }
        });

        cardWrapperRefs.current.forEach((el, i) => {
          if (el) {
            tl.set(
              el,
              { clipPath: i === 0 ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" },
              0
            );
          }
        });

        narrativeRefs.current.forEach((el, i) => {
          if (el) {
            tl.set(
              el,
              { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : textYShift },
              0
            );
          }
        });

        // 2. Decoupled Ambient Background Layer Transitions
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

        // 3. Single-Focus Scene Handoff (Shared Visual Viewport Mask + Decoupled Staggered Text)
        const sc0 = sceneContentRefs.current[0];
        const sc1 = sceneContentRefs.current[1];
        const sc2 = sceneContentRefs.current[2];
        const sc3 = sceneContentRefs.current[3];

        const cw1 = cardWrapperRefs.current[1];
        const cw2 = cardWrapperRefs.current[2];
        const cw3 = cardWrapperRefs.current[3];

        const nr0 = narrativeRefs.current[0];
        const nr1 = narrativeRefs.current[1];
        const nr2 = narrativeRefs.current[2];
        const nr3 = narrativeRefs.current[3];

        // ================================================================
        // Transition 1: Scene 0 -> Scene 1 (Purple -> Teal, Midpoint: 25.0%)
        // ================================================================
        // Container Lifecycle: sc1 activates at 21.5, sc0 deactivates at 28.5
        if (sc1) tl.set(sc1, { autoAlpha: 1 }, 21.5);
        if (sc0) tl.set(sc0, { autoAlpha: 0 }, 28.5);

        // Narrative: Staggered handoff (sc0 text fades out [21.5, 24.2], sc1 text fades in [25.8, 28.5])
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

        // Visual Viewport: Single-Focus Masked Reveal [22.5, 27.5]
        if (cw1) {
          tl.fromTo(
            cw1,
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", ease: "power1.inOut", duration: 5.0 },
            22.5
          );
        }

        // ================================================================
        // Transition 2: Scene 1 -> Scene 2 (Teal -> Orange, Midpoint: 50.0%)
        // ================================================================
        // Container Lifecycle: sc2 activates at 46.5, sc1 deactivates at 53.5
        if (sc2) tl.set(sc2, { autoAlpha: 1 }, 46.5);
        if (sc1) tl.set(sc1, { autoAlpha: 0 }, 53.5);

        // Narrative: Staggered handoff (sc1 text fades out [46.5, 49.2], sc2 text fades in [50.8, 53.5])
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

        // Visual Viewport: Single-Focus Masked Reveal [47.5, 52.5]
        if (cw2) {
          tl.fromTo(
            cw2,
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", ease: "power1.inOut", duration: 5.0 },
            47.5
          );
        }

        // ================================================================
        // Transition 3: Scene 2 -> Scene 3 (Orange -> Red, Midpoint: 75.0%)
        // ================================================================
        // Container Lifecycle: sc3 activates at 71.5, sc2 deactivates at 78.5
        if (sc3) tl.set(sc3, { autoAlpha: 1 }, 71.5);
        if (sc2) tl.set(sc2, { autoAlpha: 0 }, 78.5);

        // Narrative: Staggered handoff (sc2 text fades out [71.5, 74.2], sc3 text fades in [75.8, 78.5])
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

        // Visual Viewport: Single-Focus Masked Reveal [72.5, 77.5]
        if (cw3) {
          tl.fromTo(
            cw3,
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", ease: "power1.inOut", duration: 5.0 },
            72.5
          );
        }

        // 4. Independent Spatial Parallax Mapping (BackLayer, MainLayer, ForegroundLayer)
        // Scene 0: Active range [0, 25]
        if (backLayerRefs.current[0]) {
          tl.fromTo(backLayerRefs.current[0], { y: backY, x: -backX, scale: 0.99, force3D: true }, { y: -backY, x: backX, scale: 1.01, ease: "none", duration: 25, force3D: true }, 0);
        }
        if (mainLayerRefs.current[0]) {
          tl.fromTo(mainLayerRefs.current[0], { y: mainY, x: 0, scale: 0.99, force3D: true }, { y: -mainY, x: 0, scale: 1.02, ease: "none", duration: 25, force3D: true }, 0);
        }
        if (fgLayerRefs.current[0]) {
          tl.fromTo(fgLayerRefs.current[0], { y: fgY, x: fgX, scale: 0.98, force3D: true }, { y: -fgY, x: -fgX, scale: 1.03, ease: "none", duration: 25, force3D: true }, 0);
        }

        // Scene 1: Active range [23, 50]
        if (backLayerRefs.current[1]) {
          tl.fromTo(backLayerRefs.current[1], { y: backY, x: backX, scale: 0.99, force3D: true }, { y: -backY, x: -backX, scale: 1.01, ease: "none", duration: 27, force3D: true }, 23);
        }
        if (mainLayerRefs.current[1]) {
          tl.fromTo(mainLayerRefs.current[1], { y: mainY, x: -mainX, scale: 0.99, force3D: true }, { y: -mainY, x: mainX, scale: 1.02, ease: "none", duration: 27, force3D: true }, 23);
        }
        if (fgLayerRefs.current[1]) {
          tl.fromTo(fgLayerRefs.current[1], { y: fgY, x: -fgX, scale: 0.98, force3D: true }, { y: -fgY, x: fgX, scale: 1.03, ease: "none", duration: 27, force3D: true }, 23);
        }

        // Scene 2: Active range [48, 75]
        if (backLayerRefs.current[2]) {
          tl.fromTo(backLayerRefs.current[2], { y: backY, x: -backX, scale: 0.99, force3D: true }, { y: -backY, x: backX, scale: 1.01, ease: "none", duration: 27, force3D: true }, 48);
        }
        if (mainLayerRefs.current[2]) {
          tl.fromTo(mainLayerRefs.current[2], { y: mainY, x: 0, scale: 0.99, force3D: true }, { y: -mainY, x: 0, scale: 1.02, ease: "none", duration: 27, force3D: true }, 48);
        }
        if (fgLayerRefs.current[2]) {
          tl.fromTo(fgLayerRefs.current[2], { y: fgY, x: fgX, scale: 0.97, force3D: true }, { y: -fgY, x: -fgX, scale: 1.04, ease: "none", duration: 27, force3D: true }, 48);
        }

        // Scene 3: Active range [73, 100]
        if (backLayerRefs.current[3]) {
          tl.fromTo(backLayerRefs.current[3], { y: backY, x: backX, scale: 0.99, force3D: true }, { y: -backY, x: -backX, scale: 1.01, ease: "none", duration: 27, force3D: true }, 73);
        }
        if (mainLayerRefs.current[3]) {
          tl.fromTo(mainLayerRefs.current[3], { y: mainY, x: 0, scale: 0.99, force3D: true }, { y: -mainY, x: 0, scale: 1.02, ease: "none", duration: 27, force3D: true }, 73);
        }
        if (fgLayerRefs.current[3]) {
          tl.fromTo(fgLayerRefs.current[3], { y: fgY, x: -fgX, scale: 0.98, force3D: true }, { y: -fgY, x: fgX, scale: 1.03, ease: "none", duration: 27, force3D: true }, 73);
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

        {/* Continuous Scenes Container */}
        <div className={styles.scenesContainer}>
          {STORY_SCENES.map((scene, index) => {
            const isActive = isReducedMotion || activeIndex === index;
            return (
              <div
                key={scene.id}
                ref={(el) => {
                  sceneRefs.current[index] = el;
                }}
                className={styles.scene}
                style={isReducedMotion ? { backgroundColor: scene.bgColor } : undefined}
                data-scene-id={scene.id}
                data-scene-index={index}
                data-testid={`scene-${index + 1}`}
                aria-hidden={!isActive && !isReducedMotion}
                inert={!isActive && !isReducedMotion}
              >
                {/* Scene Content wrapper: GSAP animates autoAlpha, subtle directional y, and minimal blur */}
                <div
                  ref={(el) => {
                    sceneContentRefs.current[index] = el;
                  }}
                  className={styles.sceneContent}
                  data-testid={`scene-content-${index + 1}`}
                >
                  <div className={styles.sceneInner}>
                    {/* Left Column: Spatial Multi-Layer SceneVisual */}
                    <div className={styles.cardCol}>
                      <div
                        ref={(el) => {
                          cardWrapperRefs.current[index] = el;
                        }}
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
                          backRef={(el) => {
                            backLayerRefs.current[index] = el;
                          }}
                          mainRef={(el) => {
                            mainLayerRefs.current[index] = el;
                          }}
                          fgRef={(el) => {
                            fgLayerRefs.current[index] = el;
                          }}
                        />
                      </div>
                    </div>

                    {/* Right Column: Narrative / Metadata */}
                    <div
                      ref={(el) => {
                        narrativeRefs.current[index] = el;
                      }}
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

                      <div className={styles.sceneStatus}>
                        <div className={styles.statusRow}>
                          <span
                            className={styles.statusDot}
                            style={{ backgroundColor: scene.accentColor }}
                          />
                          <span className={styles.statusText}>
                            {index === 0 && "Plateau: 0%–21% • Transition: 21.5%–28.5%"}
                            {index === 1 && "Plateau: 32%–46% • Transition: 46.5%–53.5%"}
                            {index === 2 && "Plateau: 57%–71% • Transition: 71.5%–78.5%"}
                            {index === 3 && "Plateau: 82%–100% • Release past 100%"}
                          </span>
                        </div>
                        <div className={styles.scrollHint}>
                          <span>↕ Scrub to inspect tri-layer spatial parallax</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
