"use client";

import React, { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ColorCard } from "./ColorCard";
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
      "The viewport locks into a fixed stage. User scroll gestures are captured and converted into linear animation progress.",
    tag: "Phase 1: Pinned Stage",
  },
  {
    id: "scene-2",
    number: "02",
    title: "Narrative Transition",
    cardColor: "#0d9488", // Vibrant Teal
    bgColor: "#081d1a",   // Deep Teal
    accentColor: "#2dd4bf",
    description:
      "Crossing the 25% threshold seamlessly reveals the second scene while maintaining scroll scrubbing synchronization.",
    tag: "Phase 1: Scene 02",
  },
  {
    id: "scene-3",
    number: "03",
    title: "Spatial Layering",
    cardColor: "#ea580c", // Vibrant Orange
    bgColor: "#201206",   // Deep Orange
    accentColor: "#fb923c",
    description:
      "Crossing the 50% threshold advances to the third scene with continuous displacement and immediate reverse fidelity.",
    tag: "Phase 1: Scene 03",
  },
  {
    id: "scene-4",
    number: "04",
    title: "Showcase Carousel",
    cardColor: "#dc2626", // Vibrant Red
    bgColor: "#20080d",   // Deep Red
    accentColor: "#f87171",
    description:
      "Reaching 75% presents the final stage scene. Continuing scroll past 100% cleanly releases the pin into page flow.",
    tag: "Phase 1: Scene 04",
  },
];

export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const currentSceneRef = useRef<number>(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const scrollToScene = useCallback((targetIndex: number) => {
    if (!scrollTriggerRef.current) return;
    const st = scrollTriggerRef.current;
    // Map index to a progress position slightly past the threshold
    const targetProgress = targetIndex / STORY_SCENES.length + 0.02;
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

        const yShift = isDesktop ? 35 : 20;

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
              // Map progress 0..1 to scene indices 0..3:
              // 0.00 - 0.25 -> 0
              // 0.25 - 0.50 -> 1
              // 0.50 - 0.75 -> 2
              // 0.75 - 1.00 -> 3
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

        // Add scrubbed card translation for each scene within its duration slot
        STORY_SCENES.forEach((_, i) => {
          const cardEl = cardWrapperRefs.current[i];
          if (cardEl) {
            tl.fromTo(
              cardEl,
              { y: yShift, force3D: true },
              { y: -yShift, ease: "none", duration: 1, force3D: true },
              i
            );
          }
        });

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
      aria-label="Interactive 4-Scene Scroll Story"
      data-testid="scroll-story-container"
    >
      <div
        ref={stageRef}
        className={styles.pinnedStage}
        data-testid="pinned-stage"
        data-active-index={activeIndex}
      >
        <div className={styles.scenesContainer}>
          {STORY_SCENES.map((scene, index) => {
            const isActive = isReducedMotion || activeIndex === index;
            return (
              <div
                key={scene.id}
                className={`${styles.scene} ${isActive ? styles.sceneActive : ""}`}
                style={{ backgroundColor: scene.bgColor }}
                data-scene-id={scene.id}
                data-scene-index={index}
                data-testid={`scene-${index + 1}`}
                aria-hidden={!isActive}
              >
                <div className={styles.sceneInner}>
                  {/* Left Column: Visual Card */}
                  <div className={styles.cardCol}>
                    <div
                      ref={(el) => {
                        cardWrapperRefs.current[index] = el;
                      }}
                      className={styles.cardScrubWrapper}
                      data-testid={`card-scrub-wrapper-${index + 1}`}
                    >
                      <ColorCard
                        id={`card-${scene.id}`}
                        number={scene.number}
                        title={scene.title}
                        color={scene.cardColor}
                        tag={scene.tag}
                        className={styles.stageCard}
                      />
                    </div>
                  </div>

                  {/* Right Column: Narrative / Metadata */}
                  <div className={styles.narrativeCol}>
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
                          {index === 0 && "Range: 0% – 25% Scroll Progress"}
                          {index === 1 && "Range: 25% – 50% Scroll Progress"}
                          {index === 2 && "Range: 50% – 75% Scroll Progress"}
                          {index === 3 && "Range: 75% – 100% Scroll Progress"}
                        </span>
                      </div>
                      <div className={styles.scrollHint}>
                        <span>↕ Scroll to scrub animation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Persistent Stage HUD / Scene Indicator */}
        {!isReducedMotion && (
          <nav
            className={styles.sceneIndicator}
            aria-label="Scene navigation"
            data-testid="scene-indicator"
          >
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
      </div>
    </section>
  );
}
