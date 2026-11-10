import React, { forwardRef } from "react";
import styles from "./SceneVisual.module.css";

export interface SceneVisualProps {
  sceneIndex: number;
  number: string;
  title: string;
  cardColor: string;
  accentColor: string;
  tag: string;
  backRef?: (el: HTMLDivElement | null) => void;
  mainRef?: (el: HTMLDivElement | null) => void;
  fgRef?: (el: HTMLDivElement | null) => void;
}

export const SceneVisual = forwardRef<HTMLDivElement, SceneVisualProps>(
  function SceneVisual(
    { sceneIndex, number, title, cardColor, accentColor, tag, backRef, mainRef, fgRef },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={styles.visualStage}
        data-testid={`scene-visual-${sceneIndex + 1}`}
      >
        {/* Layer 1: BackLayer — Low-contrast spatial depth reference */}
        <div
          ref={backRef}
          className={`${styles.layer} ${styles.backLayer}`}
          data-testid={`scene-back-layer-${sceneIndex + 1}`}
          aria-hidden="true"
        >
          <div
            className={styles.backGridPlate}
            style={{ borderColor: `${accentColor}25` }}
          >
            <div
              className={styles.backGridDashes}
              style={{
                backgroundImage: `radial-gradient(circle, ${accentColor}30 1px, transparent 1px)`,
              }}
            />
            <div
              className={styles.backDepthBadge}
              style={{ color: `${accentColor}88`, borderColor: `${accentColor}33` }}
            >
              PLANE -Z // DEPTH 0.{sceneIndex + 1}
            </div>
            {sceneIndex === 0 && (
              <div
                className={styles.backCornerBracket}
                style={{ borderColor: `${accentColor}44` }}
              />
            )}
            {sceneIndex === 1 && (
              <div
                className={styles.backRuler}
                style={{ borderColor: `${accentColor}33` }}
              />
            )}
            {sceneIndex === 2 && (
              <div
                className={styles.backConcentric}
                style={{ borderColor: `${accentColor}33` }}
              />
            )}
            {sceneIndex === 3 && (
              <div
                className={styles.backHorizon}
                style={{ borderColor: `${accentColor}33` }}
              />
            )}
          </div>
        </div>

        {/* Layer 2: MainLayer — Primary visual focus & UI canvas */}
        <div
          ref={mainRef}
          className={`${styles.layer} ${styles.mainLayer}`}
          data-testid={`scene-main-layer-${sceneIndex + 1}`}
        >
          <article
            className={styles.mainCard}
            style={{
              backgroundColor: cardColor,
              boxShadow: `0 16px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.12)`,
            }}
          >
            {/* Mock Window / App Top Bar */}
            <div className={styles.cardTopBar}>
              <div className={styles.windowControls}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
              <span className={styles.stageBreadcrumb}>{tag}</span>
              <span className={styles.cardNumber}>{number}</span>
            </div>

            {/* Card Main Body */}
            <div className={styles.cardBody}>
              <div className={styles.cardHeader}>
                <span className={styles.sceneSub}>{`SCENE ${number}`}</span>
                <h3 className={styles.cardHeading}>{title}</h3>
              </div>

              {/* Scene-specific layout representation */}
              {sceneIndex === 0 && (
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
              )}

              {sceneIndex === 1 && (
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
              )}

              {sceneIndex === 2 && (
                <div className={styles.scene03Preview}>
                  <div className={styles.layerDepthStack}>
                    <div className={styles.depthLayer3}>L3 : FOREGROUND</div>
                    <div className={styles.depthLayer2}>L2 : PRIMARY CANVAS</div>
                    <div className={styles.depthLayer1}>L1 : SPATIAL BACKDROP</div>
                  </div>
                </div>
              )}

              {sceneIndex === 3 && (
                <div className={styles.scene04Preview}>
                  <div className={styles.deckPreviewRow}>
                    <div className={styles.deckItemActive}>01</div>
                    <div className={styles.deckItem}>02</div>
                    <div className={styles.deckItem}>03</div>
                    <div className={styles.deckItemNext}>04</div>
                  </div>
                  <span className={styles.carouselLeadText}>
                    STAGE EXIT PRELUDE → PHASE 4 CAROUSEL
                  </span>
                </div>
              )}
            </div>

            {/* Bottom metadata footer */}
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
          data-testid={`scene-fg-layer-${sceneIndex + 1}`}
        >
          {sceneIndex === 0 && (
            <>
              <div
                className={`${styles.floatingChip} ${styles.chipTopRight}`}
                style={{ borderColor: `${accentColor}55` }}
              >
                <span
                  className={styles.chipIndicator}
                  style={{ backgroundColor: accentColor }}
                />
                <span className={styles.chipText}>L3: Scrubbed Parallax</span>
              </div>
              <div
                className={`${styles.floatingChip} ${styles.chipBottomLeft}`}
                style={{ borderColor: `${accentColor}55` }}
              >
                <span className={styles.chipBadge}>FPS</span>
                <span className={styles.chipText}>Continuous GPU Flow</span>
              </div>
            </>
          )}

          {sceneIndex === 1 && (
            <>
              <div
                className={`${styles.floatingChip} ${styles.chipTopRight}`}
                style={{ borderColor: `${accentColor}55` }}
              >
                <span
                  className={styles.chipIndicator}
                  style={{ backgroundColor: accentColor }}
                />
                <span className={styles.chipText}>Dual-Panel Inspector</span>
              </div>
              <div
                className={`${styles.floatingChip} ${styles.chipBottomLeft}`}
                style={{ borderColor: `${accentColor}55` }}
              >
                <span className={styles.chipBadge}>SYNC</span>
                <span className={styles.chipText}>Decoupled Ambient Glow</span>
              </div>
            </>
          )}

          {sceneIndex === 2 && (
            <>
              <div
                className={`${styles.floatingChip} ${styles.chipTopRight}`}
                style={{ borderColor: `${accentColor}55` }}
              >
                <span
                  className={styles.chipIndicator}
                  style={{ backgroundColor: accentColor }}
                />
                <span className={styles.chipText}>Z-Delta +28px Parallax</span>
              </div>
              <div
                className={`${styles.floatingChip} ${styles.chipBottomLeft}`}
                style={{ borderColor: `${accentColor}55` }}
              >
                <span className={styles.chipBadge}>3D</span>
                <span className={styles.chipText}>Tri-Layer Depth Orbit</span>
              </div>
            </>
          )}

          {sceneIndex === 3 && (
            <>
              <div
                className={`${styles.floatingChip} ${styles.chipTopRight}`}
                style={{ borderColor: `${accentColor}55` }}
              >
                <span
                  className={styles.chipIndicator}
                  style={{ backgroundColor: accentColor }}
                />
                <span className={styles.chipText}>Deck Prelude [01/04]</span>
              </div>
              <div
                className={`${styles.floatingChip} ${styles.chipBottomLeft}`}
                style={{ borderColor: `${accentColor}55` }}
              >
                <span className={styles.chipBadge}>EXIT</span>
                <span className={styles.chipText}>Clean Pin Release</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);
