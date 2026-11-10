import { ScrollStory } from "@/components/ScrollStory";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page} id="top">
      {/* Intro Section: Normal document flow prior to pinned stage */}
      <header className={styles.introSection} data-testid="intro-section">
        <div className={styles.introContent}>
          <div className={styles.badge}>Scroll Lab • Phase 1</div>
          <h1 className={styles.title}>Pinned Stage &amp; Scroll Scrubbing</h1>
          <p className={styles.subtitle}>
            GSAP ScrollTrigger prototype reproducing a 4-scene narrative workflow:
            fullscreen stage locking, continuous scroll scrubbing, reversible state
            recovery, and natural release into document flow.
          </p>
          <div className={styles.scrollCue}>
            <span className={styles.cueText}>Scroll down to enter pinned stage</span>
            <span className={styles.cueArrow} aria-hidden="true">↓</span>
          </div>
        </div>
      </header>

      {/* Interactive 4-Scene Scroll Narrative */}
      <main>
        <ScrollStory />
      </main>

      {/* Outro Section: Normal document flow following pinned stage release */}
      <footer className={styles.outroSection} data-testid="outro-section">
        <div className={styles.outroContent}>
          <div className={styles.badge}>Stage Complete</div>
          <h2 className={styles.outroTitle}>Document Flow Resumed</h2>
          <p className={styles.outroText}>
            The fixed stage has cleanly unpinned. Subsequent content scrolls naturally.
            Scrolling up re-enters the pinned stage and reverses through all four scenes
            with deterministic precision.
          </p>
          <a href="#top" className={styles.topButton}>
            ↑ Return to Top
          </a>
        </div>
      </footer>
    </div>
  );
}
