import React from "react";
import styles from "./SharedVisualShell.module.css";

export interface SharedVisualShellProps {
  cardRef?: (el: HTMLElement | null) => void;
  backRef?: (el: HTMLDivElement | null) => void;
  mainRef?: (el: HTMLDivElement | null) => void;
  fgRef?: (el: HTMLDivElement | null) => void;
  content1Ref?: (el: HTMLDivElement | null) => void;
  content2Ref?: (el: HTMLDivElement | null) => void;
  tag1Ref?: (el: HTMLElement | null) => void;
  tag2Ref?: (el: HTMLElement | null) => void;
  num1Ref?: (el: HTMLElement | null) => void;
  num2Ref?: (el: HTMLElement | null) => void;
  sub1Ref?: (el: HTMLElement | null) => void;
  sub2Ref?: (el: HTMLElement | null) => void;
  head1Ref?: (el: HTMLElement | null) => void;
  head2Ref?: (el: HTMLElement | null) => void;
  fg1ChipsRef?: (el: HTMLDivElement | null) => void;
  fg2ChipsRef?: (el: HTMLDivElement | null) => void;
  back1AccRef?: (el: HTMLDivElement | null) => void;
  back2AccRef?: (el: HTMLDivElement | null) => void;
  backBadgeRef?: (el: HTMLDivElement | null) => void;
}

export function SharedVisualShell({
  cardRef,
  backRef,
  mainRef,
  fgRef,
  content1Ref,
  content2Ref,
  tag1Ref,
  tag2Ref,
  num1Ref,
  num2Ref,
  sub1Ref,
  sub2Ref,
  head1Ref,
  head2Ref,
  fg1ChipsRef,
  fg2ChipsRef,
  back1AccRef,
  back2AccRef,
  backBadgeRef,
}: SharedVisualShellProps) {
  return (
    <div
      className={styles.visualStage}
      data-testid="shared-visual-shell-stage"
    >
      {/* Layer 1: BackLayer — Spatial Depth Reference */}
      <div
        ref={backRef}
        className={`${styles.layer} ${styles.backLayer}`}
        data-testid="scene-back-layer-1"
        aria-hidden="true"
      >
        <div data-testid="scene-back-layer-2" style={{ position: "absolute", pointerEvents: "none", width: 0, height: 0 }} aria-hidden="true" />
        <div className={styles.backGridPlate}>
          <div className={styles.backGridDashes} />
          <div
            ref={backBadgeRef}
            className={styles.backDepthBadge}
          >
            PLANE -Z // DEPTH 0.1
          </div>
          <div
            ref={back1AccRef}
            className={styles.backCornerBracket}
          />
          <div
            ref={back2AccRef}
            className={styles.backRuler}
            style={{ opacity: 0 }}
          />
        </div>
      </div>

      {/* Layer 2: MainLayer — Persistent Shared Visual Shell */}
      <div
        ref={mainRef}
        className={`${styles.layer} ${styles.mainLayer}`}
        data-testid="scene-main-layer-1"
      >
        <div data-testid="scene-main-layer-2" style={{ position: "absolute", pointerEvents: "none", width: 0, height: 0 }} aria-hidden="true" />
        <article
          ref={cardRef}
          className={styles.mainCard}
          data-testid="shared-visual-shell"
          style={{
            backgroundColor: "#7c3aed",
          }}
        >
          {/* Persistent Top Bar (Window Chrome) */}
          <div className={styles.cardTopBar}>
            <div className={styles.windowControls}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>

            <div className={styles.breadcrumbWrapper}>
              <span ref={tag1Ref} className={styles.stageBreadcrumb}>
                Phase 3: Spatial Inception
              </span>
              <span
                ref={tag2Ref}
                className={styles.stageBreadcrumb}
                style={{ opacity: 0 }}
              >
                Phase 3: Shared Shell Handoff
              </span>
            </div>

            <div className={styles.cardNumberWrapper}>
              <span ref={num1Ref} className={styles.cardNumber}>
                01
              </span>
              <span
                ref={num2Ref}
                className={styles.cardNumber}
                style={{ opacity: 0 }}
              >
                02
              </span>
            </div>
          </div>

          {/* Card Body & Morphing Internal Elements */}
          <div className={styles.cardBody}>
            <div className={styles.cardHeader}>
              <div className={styles.subWrapper}>
                <span ref={sub1Ref} className={styles.sceneSub}>
                  SCENE 01
                </span>
                <span
                  ref={sub2Ref}
                  className={styles.sceneSub}
                  style={{ opacity: 0 }}
                >
                  SCENE 02
                </span>
              </div>
              <div className={styles.headingWrapper}>
                <h3 ref={head1Ref} className={styles.cardHeading}>
                  Stage Inception
                </h3>
                <h3
                  ref={head2Ref}
                  className={styles.cardHeading}
                  style={{ opacity: 0 }}
                >
                  Narrative Transition
                </h3>
              </div>
            </div>

            {/* Content Region for Staggered Scene Previews */}
            <div className={styles.contentRegion} data-testid="shell-content-region">
              {/* Outgoing Scene 01 Graphic Content */}
              <div
                ref={content1Ref}
                className={styles.contentPane}
                data-testid="shell-content-1"
              >
                <div className={styles.scene01Preview}>
                  <div className={styles.mockViewportFrame}>
                    <div className={styles.mockCrosshair} />
                    <span className={styles.previewTag}>PINNED VIEWPORT LOCK</span>
                  </div>
                  <div className={styles.mockWaveform}>
                    <span className={styles.waveBar} />
                    <span className={styles.waveBar} />
                    <span className={styles.waveBar} />
                    <span className={styles.waveBar} />
                  </div>
                </div>
              </div>

              {/* Incoming Scene 02 Graphic Content */}
              <div
                ref={content2Ref}
                className={styles.contentPane}
                data-testid="shell-content-2"
                style={{ opacity: 0 }}
              >
                <div className={styles.scene02Preview}>
                  <div className={styles.splitLeft}>
                    <span className={styles.splitHeader}>ORIGIN</span>
                    <div className={styles.splitBlock} />
                  </div>
                  <div className={styles.splitDivider} />
                  <div className={styles.splitRight}>
                    <span className={styles.splitHeader}>TARGET</span>
                    <div className={styles.splitBlockActive} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Persistent Layout Anchors: Footer */}
          <div className={styles.cardFooter}>
            <span className={styles.layerRole}>FOCAL LAYER: MAIN</span>
            <span className={styles.coordStamp}>PERSPECTIVE: 1000PX</span>
          </div>
        </article>
      </div>

      {/* Layer 3: ForegroundLayer — Independent floating accessory chips */}
      <div
        ref={fgRef}
        className={`${styles.layer} ${styles.foregroundLayer}`}
        data-testid="scene-fg-layer-1"
      >
        <div data-testid="scene-fg-layer-2" style={{ position: "absolute", pointerEvents: "none", width: 0, height: 0 }} aria-hidden="true" />
        <div ref={fg1ChipsRef} className={styles.chipsGroup}>
          <div
            className={`${styles.floatingChip} ${styles.chipTopRight}`}
            style={{ borderColor: "#a78bfa55" }}
          >
            <span
              className={styles.chipIndicator}
              style={{ backgroundColor: "#a78bfa" }}
            />
            <span className={styles.chipText}>L3: Scrubbed Parallax</span>
          </div>
          <div
            className={`${styles.floatingChip} ${styles.chipBottomLeft}`}
            style={{ borderColor: "#a78bfa55" }}
          >
            <span className={styles.chipBadge}>FPS</span>
            <span className={styles.chipText}>Continuous GPU Flow</span>
          </div>
        </div>

        <div ref={fg2ChipsRef} className={styles.chipsGroup} style={{ opacity: 0 }}>
          <div
            className={`${styles.floatingChip} ${styles.chipTopRight}`}
            style={{ borderColor: "#2dd4bf55" }}
          >
            <span
              className={styles.chipIndicator}
              style={{ backgroundColor: "#2dd4bf" }}
            />
            <span className={styles.chipText}>Dual-Panel Inspector</span>
          </div>
          <div
            className={`${styles.floatingChip} ${styles.chipBottomLeft}`}
            style={{ borderColor: "#2dd4bf55" }}
          >
            <span className={styles.chipBadge}>SYNC</span>
            <span className={styles.chipText}>Decoupled Ambient Glow</span>
          </div>
        </div>
      </div>
    </div>
  );
}
