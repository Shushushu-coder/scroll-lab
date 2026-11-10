import styles from "./ColorCard.module.css";

export interface ColorCardProps {
  id: string;
  number: string;
  title: string;
  color: string;
  description?: string;
  tag?: string;
}

export function ColorCard({
  id,
  number,
  title,
  color,
  description,
  tag,
}: ColorCardProps) {
  return (
    <article
      id={id}
      className={styles.card}
      style={{ backgroundColor: color }}
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
