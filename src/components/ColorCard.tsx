import { forwardRef } from "react";
import styles from "./ColorCard.module.css";

export interface ColorCardProps {
  id: string;
  number: string;
  title: string;
  color: string;
  description?: string;
  tag?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ColorCard = forwardRef<HTMLElement, ColorCardProps>(
  function ColorCard(
    { id, number, title, color, description, tag, className, style },
    ref
  ) {
    return (
      <article
        ref={ref}
        id={id}
        className={`${styles.card} ${className || ""}`}
        style={{ backgroundColor: color, ...style }}
        data-testid="color-card"
      >
        <div className={styles.header}>
          <span className={styles.number}>{number}</span>
          <h2 className={styles.title}>{title}</h2>
        </div>
        {description && <p className={styles.description}>{description}</p>}
        {tag && <span className={styles.badge}>{tag}</span>}
      </article>
    );
  }
);
