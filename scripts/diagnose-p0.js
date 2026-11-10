/* eslint-disable */
const path = require('path');
const fs = require('fs');
const { chromium } = require('C:/Users/HP/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');

const OUT_DIR = path.resolve(__dirname, '../test-results/p0_pre_fix');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function diagnose() {
  console.log('=== Step 1: P0 Ghosting Diagnosis ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const geometry = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="scroll-story-container"]');
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const start = rect.top + scrollTop;
    const distance = window.innerHeight * 3;
    return { start, distance };
  });

  const checkPoints = [
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

  console.log('Evaluating overlap and visual properties across transition points...');

  const results = [];

  for (const pt of checkPoints) {
    const scrollY = geometry.start + pt.p * geometry.distance;
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(100);

    const data = await page.evaluate(() => {
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
        if (!b1 || !b2) return { overlapArea: 0, overlapPercent: 0 };
        const xOverlap = Math.max(0, Math.min(b1.x + b1.width, b2.x + b2.width) - Math.max(b1.x, b2.x));
        const yOverlap = Math.max(0, Math.min(b1.y + b1.height, b2.y + b2.height) - Math.max(b1.y, b2.y));
        const area = xOverlap * yOverlap;
        const minArea = Math.min(b1.width * b1.height, b2.width * b2.height);
        return {
          overlapArea: Math.round(area),
          overlapPercent: minArea > 0 ? (area / minArea) * 100 : 0,
        };
      };

      const scenes = [1, 2, 3, 4].map((i) => ({
        idx: i,
        content: getBox(`[data-testid="scene-content-${i}"]`),
        card: getBox(`[data-testid="card-scrub-wrapper-${i}"]`),
      }));

      const overlap12 = computeOverlap(scenes[0].card, scenes[1].card);
      const overlap23 = computeOverlap(scenes[1].card, scenes[2].card);
      const overlap34 = computeOverlap(scenes[2].card, scenes[3].card);

      return { scenes, overlap12, overlap23, overlap34 };
    });

    results.push({ pt, data });

    const shotPath = path.join(OUT_DIR, `${pt.name}.png`);
    await page.screenshot({ path: shotPath });
  }

  // Log detailed analysis for Transition 1 (Scene 1 -> Scene 2)
  console.log('\n--- Transition 1 (Scene 1 -> Scene 2, 20% - 30%) ---');
  for (const r of results.filter(x => x.pt.p <= 0.30)) {
    const s1 = r.data.scenes[0];
    const s2 = r.data.scenes[1];
    console.log(
      `P=${(r.pt.p * 100).toFixed(1)}% | S1 Op:${s1.content.opacity.toFixed(2)} Filter:${s1.content.filter} | S2 Op:${s2.content.opacity.toFixed(2)} Filter:${s2.content.filter} | Card Overlap: ${r.data.overlap12.overlapPercent.toFixed(1)}% (Area: ${r.data.overlap12.overlapArea}px)`
    );
  }

  // Log Transition 2 (Scene 2 -> Scene 3)
  console.log('\n--- Transition 2 (Scene 2 -> Scene 3, 45% - 55%) ---');
  for (const r of results.filter(x => x.pt.p >= 0.45 && x.pt.p <= 0.55)) {
    const s2 = r.data.scenes[1];
    const s3 = r.data.scenes[2];
    console.log(
      `P=${(r.pt.p * 100).toFixed(1)}% | S2 Op:${s2.content.opacity.toFixed(2)} Filter:${s2.content.filter} | S3 Op:${s3.content.opacity.toFixed(2)} Filter:${s3.content.filter} | Card Overlap: ${r.data.overlap23.overlapPercent.toFixed(1)}% (Area: ${r.data.overlap23.overlapArea}px)`
    );
  }

  // Log Transition 3 (Scene 3 -> Scene 4)
  console.log('\n--- Transition 3 (Scene 3 -> Scene 4, 70% - 80%) ---');
  for (const r of results.filter(x => x.pt.p >= 0.70)) {
    const s3 = r.data.scenes[2];
    const s4 = r.data.scenes[3];
    console.log(
      `P=${(r.pt.p * 100).toFixed(1)}% | S3 Op:${s3.content.opacity.toFixed(2)} Filter:${s3.content.filter} | S4 Op:${s4.content.opacity.toFixed(2)} Filter:${s4.content.filter} | Card Overlap: ${r.data.overlap34.overlapPercent.toFixed(1)}% (Area: ${r.data.overlap34.overlapArea}px)`
    );
  }

  fs.writeFileSync(path.join(OUT_DIR, 'diagnosis-report.json'), JSON.stringify(results, null, 2));
  console.log('\nDiagnosis complete. Screenshots and report saved in test-results/p0_pre_fix/');

  await context.close();
  await browser.close();
}

diagnose().catch((err) => {
  console.error(err);
  process.exit(1);
});
