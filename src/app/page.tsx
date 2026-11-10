import { ScrollStory } from "@/components/ScrollStory";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page} id="top">
      {/* Intro Section: Compact document flow prior to pinned stage */}
      <header className={styles.introSection} data-testid="intro-section">
        <div className={styles.introContent}>
          <div className={styles.badge}>Scroll Lab • Phase 3</div>
          <h1 className={styles.title}>Spatial Layering & Parallax</h1>
          <p className={styles.subtitle}>
            Multi-layer visual architecture reproducing PaintPilot-style spatial depth:
            single-focus visual handoff eliminating double contours, independent tri-layer parallax
            trajectories, unified stage navigation HUD, and seamless scroll flow.
          </p>
          <div className={styles.scrollCue}>
            <span className={styles.cueText}>Scroll to enter pinned stage</span>
            <span className={styles.cueArrow} aria-hidden="true">↓</span>
          </div>
        </div>
      </header>

      {/* Interactive 4-Scene Spatial Scroll Narrative */}
      <main>
        <ScrollStory />
      </main>

      {/* Outro Section: Tightened document flow following pinned stage release */}
      <footer className={styles.outroSection} data-testid="outro-section">
        <div className={styles.outroContent}>
          <div className={styles.badge}>Stage Complete</div>
          <h2 className={styles.outroTitle}>Document Flow Resumed</h2>
          <p className={styles.outroText}>
            The fixed stage has cleanly unpinned. Subsequent content scrolls naturally.
            Scrolling upward smoothly re-enters the pinned stage and reverses all tri-layer
            parallax motions with deterministic precision.
          </p>
          <a href="#top" className={styles.topButton}>
            ↑ Return to Top
          </a>
        </div>
      </footer>
    </div>
  );
}
