import React from "react";
import styles from "./AmbientBackground.module.css";

export interface AmbientBackgroundProps {
  registerLayer: (index: number, el: HTMLDivElement | null) => void;
}

export function AmbientBackground({ registerLayer }: AmbientBackgroundProps) {
  return (
    <div
      className={styles.ambientBackground}
      aria-hidden="true"
      data-testid="ambient-background"
    >
      <div
        ref={(el) => registerLayer(0, el)}
        className={`${styles.bgLayer} ${styles.bgPurple}`}
        data-layer-index={0}
        data-testid="ambient-bg-layer-1"
      />
      <div
        ref={(el) => registerLayer(1, el)}
        className={`${styles.bgLayer} ${styles.bgTeal}`}
        data-layer-index={1}
        data-testid="ambient-bg-layer-2"
      />
      <div
        ref={(el) => registerLayer(2, el)}
        className={`${styles.bgLayer} ${styles.bgOrange}`}
        data-layer-index={2}
        data-testid="ambient-bg-layer-3"
      />
      <div
        ref={(el) => registerLayer(3, el)}
        className={`${styles.bgLayer} ${styles.bgRed}`}
        data-layer-index={3}
        data-testid="ambient-bg-layer-4"
      />
    </div>
  );
}
