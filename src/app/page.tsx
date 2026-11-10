import { ColorCard } from "@/components/ColorCard";
import styles from "./page.module.css";

const scenes = [
  {
    id: "scene-1",
    number: "01",
    title: "Stage Inception",
    color: "#1e3a8a",
    description: "Fullscreen fixed stage synchronized with scroll position.",
    tag: "Phase 1 Placeholder",
  },
  {
    id: "scene-2",
    number: "02",
    title: "Narrative Transition",
    color: "#581c87",
    description: "Scene crossfade, blur, scale, and background color morphing.",
    tag: "Phase 2 Placeholder",
  },
  {
    id: "scene-3",
    number: "03",
    title: "Spatial Layering",
    color: "#831843",
    description: "Card depth, multi-plane parallax, and 3D perspective shifts.",
    tag: "Phase 3 Placeholder",
  },
  {
    id: "scene-4",
    number: "04",
    title: "Showcase Carousel",
    color: "#064e3b",
    description: "Horizontal showcase integration and final scroll release.",
    tag: "Phase 4 Placeholder",
  },
];

export default function Home() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Scroll Lab</h1>
        <p className={styles.subtitle}>Scroll-driven animation experiments</p>
      </header>

      <section className={styles.grid} aria-label="Scene placeholders">
        {scenes.map((scene) => (
          <ColorCard
            key={scene.id}
            id={scene.id}
            number={scene.number}
            title={scene.title}
            color={scene.color}
            description={scene.description}
            tag={scene.tag}
          />
        ))}
      </section>

      <footer className={styles.footer}>
        <p>Phase 0: Repository Bootstrap — Solid color cards only, animations pending Phase 1.</p>
      </footer>
    </main>
  );
}
