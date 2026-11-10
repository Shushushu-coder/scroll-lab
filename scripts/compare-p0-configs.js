/* eslint-disable */
const path = require('path');
const fs = require('fs');
const { chromium } = require('C:/Users/HP/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');

const BASE_DIR = path.resolve(__dirname, '../test-results/p0_comparison');
const DIR_A = path.join(BASE_DIR, 'config_A');
const DIR_B = path.join(BASE_DIR, 'config_B');

[DIR_A, DIR_B].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const samplePoints = [
  { p: 0.20, name: 'p020_t1_start' },
  { p: 0.22, name: 'p022_t1_early' },
  { p: 0.24, name: 'p024_t1_pre_mid' },
  { p: 0.25, name: 'p025_t1_midpoint' },
  { p: 0.26, name: 'p026_t1_post_mid' },
  { p: 0.28, name: 'p028_t1_late' },
  { p: 0.30, name: 'p030_t1_end' },

  { p: 0.47, name: 'p047_t2_early' },
  { p: 0.49, name: 'p049_t2_pre_mid' },
  { p: 0.50, name: 'p050_t2_midpoint' },
  { p: 0.51, name: 'p051_t2_post_mid' },
  { p: 0.53, name: 'p053_t2_late' },

  { p: 0.72, name: 'p072_t3_early' },
  { p: 0.74, name: 'p074_t3_pre_mid' },
  { p: 0.75, name: 'p075_t3_midpoint' },
  { p: 0.76, name: 'p076_t3_post_mid' },
  { p: 0.78, name: 'p078_t3_late' },
];

async function evaluateConfig(configKey, outDir) {
  console.log(`\n========================================`);
  console.log(`Evaluating Configuration ${configKey}...`);
  console.log(`========================================\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const url = `http://localhost:3000/?handoff=${configKey}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const geometry = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="scroll-story-container"]');
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    return {
      start: rect.top + scrollTop,
      distance: window.innerHeight * 3,
    };
  });

  const results = [];

  for (const pt of samplePoints) {
    const scrollY = geometry.start + pt.p * geometry.distance;
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(80);

    const frameData = await page.evaluate(() => {
      const getBox = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const cs = window.getComputedStyle(el);
        return {
          x: r.x, y: r.y, width: r.width, height: r.height,
          opacity: parseFloat(cs.opacity),
          filter: cs.filter,
          transform: cs.transform,
          visibility: cs.visibility,
        };
      };

      const computeOverlap = (b1, b2) => {
        if (!b1 || !b2) return { overlapArea: 0, overlapPercent: 0, ySeparation: 0 };
        const xOverlap = Math.max(0, Math.min(b1.x + b1.width, b2.x + b2.width) - Math.max(b1.x, b2.x));
        const yOverlap = Math.max(0, Math.min(b1.y + b1.height, b2.y + b2.height) - Math.max(b1.y, b2.y));
        const area = xOverlap * yOverlap;
        const minArea = Math.min(b1.width * b1.height, b2.width * b2.height);
        const center1Y = b1.y + b1.height / 2;
        const center2Y = b2.y + b2.height / 2;
        return {
          overlapArea: Math.round(area),
          overlapPercent: minArea > 0 ? (area / minArea) * 100 : 0,
          ySeparation: Math.abs(center1Y - center2Y),
        };
      };

      const scenes = [1, 2, 3, 4].map((i) => ({
        idx: i,
        content: getBox(`[data-testid="scene-content-${i}"]`),
        main: getBox(`[data-testid="scene-main-layer-${i}"]`),
        back: getBox(`[data-testid="scene-back-layer-${i}"]`),
        fg: getBox(`[data-testid="scene-fg-layer-${i}"]`),
      }));

      const overlap12 = computeOverlap(scenes[0].main, scenes[1].main);
      const overlap23 = computeOverlap(scenes[1].main, scenes[2].main);
      const overlap34 = computeOverlap(scenes[2].main, scenes[3].main);

      return { scenes, overlap12, overlap23, overlap34 };
    });

    results.push({ pt, frameData });

    const shotPath = path.join(outDir, `${pt.name}.png`);
    await page.screenshot({ path: shotPath });
  }

  await context.close();
  await browser.close();

  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(results, null, 2));
  return results;
}

async function runComparison() {
  const resA = await evaluateConfig('A', DIR_A);
  const resB = await evaluateConfig('B', DIR_B);

  console.log('\n======================================================');
  console.log('=== P0 CONFIGURATION COMPARISON SUMMARY (P=0.25 Midpoint) ===');
  console.log('======================================================');

  const a25 = resA.find(r => r.pt.p === 0.25).frameData;
  const b25 = resB.find(r => r.pt.p === 0.25).frameData;

  console.log(`Config A (Staggered Focal):`);
  console.log(`  S1 Opacity: ${a25.scenes[0].content.opacity.toFixed(2)}, Blur: ${a25.scenes[0].content.filter}`);
  console.log(`  S2 Opacity: ${a25.scenes[1].content.opacity.toFixed(2)}, Blur: ${a25.scenes[1].content.filter}`);
  console.log(`  Card Y-Separation: ${a25.overlap12.ySeparation.toFixed(1)}px`);
  console.log(`  Overlap Area: ${a25.overlap12.overlapArea}px (${a25.overlap12.overlapPercent.toFixed(1)}%)`);

  console.log(`\nConfig B (Compact Spatial Asymmetric Overlap):`);
  console.log(`  S1 Opacity: ${b25.scenes[0].content.opacity.toFixed(2)}, Blur: ${b25.scenes[0].content.filter}`);
  console.log(`  S2 Opacity: ${b25.scenes[1].content.opacity.toFixed(2)}, Blur: ${b25.scenes[1].content.filter}`);
  console.log(`  Card Y-Separation: ${b25.overlap12.ySeparation.toFixed(1)}px`);
  console.log(`  Overlap Area: ${b25.overlap12.overlapArea}px (${b25.overlap12.overlapPercent.toFixed(1)}%)`);

  console.log('\n======================================================');
  console.log('=== COMPARISON AT TRANSITION POINTS ===');
  console.log('======================================================\n');

  console.log('P(%) | Config A S1/S2 Opacities | Config B S1/S2 Opacities | Overlap B');
  console.log('----------------------------------------------------------------------');
  for (const pt of samplePoints.filter(x => x.p <= 0.30)) {
    const a = resA.find(r => r.pt.p === pt.p).frameData;
    const b = resB.find(r => r.pt.p === pt.p).frameData;
    console.log(
      `${(pt.p * 100).toFixed(1)}% | A: S1=${a.scenes[0].content.opacity.toFixed(2)} S2=${a.scenes[1].content.opacity.toFixed(2)} | B: S1=${b.scenes[0].content.opacity.toFixed(2)} S2=${b.scenes[1].content.opacity.toFixed(2)} | Overlap B=${b.overlap12.overlapPercent.toFixed(1)}% (Sep: ${b.overlap12.ySeparation.toFixed(1)}px)`
    );
  }
}

runComparison().catch(err => {
  console.error(err);
  process.exit(1);
});
