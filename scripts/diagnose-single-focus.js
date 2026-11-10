/* eslint-disable */
const path = require('path');
const fs = require('fs');
const { chromium } = require('C:/Users/HP/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');

const OUT_DIR = path.resolve(__dirname, '../test-results/p0_remediation');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const geometry = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="scroll-story-container"]');
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    return { start: rect.top + scrollTop, distance: window.innerHeight * 3 };
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

  console.log('Evaluating Single-Focus Handoff across transition points...\n');

  for (const pt of checkPoints) {
    const scrollY = geometry.start + pt.p * geometry.distance;
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(100);

    const state = await page.evaluate(() => {
      const getClip = (sel) => {
        const el = document.querySelector(sel);
        return el ? window.getComputedStyle(el).clipPath : 'none';
      };
      const getOpacity = (sel) => {
        const el = document.querySelector(sel);
        return el ? parseFloat(window.getComputedStyle(el).opacity) : 0;
      };
      const getVis = (sel) => {
        const el = document.querySelector(sel);
        return el ? window.getComputedStyle(el).visibility : 'hidden';
      };
      return {
        s1CardClip: getClip('[data-testid="card-scrub-wrapper-1"]'),
        s2CardClip: getClip('[data-testid="card-scrub-wrapper-2"]'),
        s3CardClip: getClip('[data-testid="card-scrub-wrapper-3"]'),
        s4CardClip: getClip('[data-testid="card-scrub-wrapper-4"]'),
        s1NarrativeOp: getOpacity('[data-testid="scene-narrative-1"]'),
        s2NarrativeOp: getOpacity('[data-testid="scene-narrative-2"]'),
        s3NarrativeOp: getOpacity('[data-testid="scene-narrative-3"]'),
        s4NarrativeOp: getOpacity('[data-testid="scene-narrative-4"]'),
        s1ContentOp: getOpacity('[data-testid="scene-content-1"]'),
        s2ContentOp: getOpacity('[data-testid="scene-content-2"]'),
        s3ContentOp: getOpacity('[data-testid="scene-content-3"]'),
        s4ContentOp: getOpacity('[data-testid="scene-content-4"]'),
      };
    });

    const activeClip = pt.p < 0.35
      ? `S1=${state.s1CardClip}, S2=${state.s2CardClip}`
      : pt.p < 0.65
      ? `S2=${state.s2CardClip}, S3=${state.s3CardClip}`
      : `S3=${state.s3CardClip}, S4=${state.s4CardClip}`;

    console.log(
      `P=${(pt.p * 100).toFixed(1)}% | ` +
      `Active Clips: [${activeClip}] | ` +
      `Texts: [S1=${state.s1NarrativeOp.toFixed(2)}, S2=${state.s2NarrativeOp.toFixed(2)}, S3=${state.s3NarrativeOp.toFixed(2)}, S4=${state.s4NarrativeOp.toFixed(2)}]`
    );
    await page.screenshot({ path: path.join(OUT_DIR, `${pt.name}.png`) });
  }

  // Mobile Viewport Check (375x667)
  console.log('\n--- Mobile Viewport (375x667) Testing ---');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(400);

  const mGeometry = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="scroll-story-container"]');
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    return { start: rect.top + scrollTop, distance: window.innerHeight * 3 };
  });

  const mobilePoints = [
    { p: 0.22, name: 'mobile_p022_early' },
    { p: 0.24, name: 'mobile_p024_pre_mid' },
    { p: 0.25, name: 'mobile_p025_midpoint' },
    { p: 0.26, name: 'mobile_p026_post_mid' },
    { p: 0.28, name: 'mobile_p028_late' },
    { p: 0.49, name: 'mobile_p049_pre_mid' },
    { p: 0.50, name: 'mobile_p050_midpoint' },
    { p: 0.51, name: 'mobile_p051_post_mid' },
    { p: 0.74, name: 'mobile_p074_pre_mid' },
    { p: 0.75, name: 'mobile_p075_midpoint' },
    { p: 0.76, name: 'mobile_p076_post_mid' },
  ];

  for (const pt of mobilePoints) {
    const scrollY = mGeometry.start + pt.p * mGeometry.distance;
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(100);

    const mState = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const vpWidth = window.innerWidth;
      const getClip = (sel) => {
        const el = document.querySelector(sel);
        return el ? window.getComputedStyle(el).clipPath : 'none';
      };
      const getOpacity = (sel) => {
        const el = document.querySelector(sel);
        return el ? parseFloat(window.getComputedStyle(el).opacity) : 0;
      };
      return {
        hasOverflow: docWidth > vpWidth,
        docWidth,
        vpWidth,
        s1CardClip: getClip('[data-testid="card-scrub-wrapper-1"]'),
        s2CardClip: getClip('[data-testid="card-scrub-wrapper-2"]'),
        s3CardClip: getClip('[data-testid="card-scrub-wrapper-3"]'),
        s4CardClip: getClip('[data-testid="card-scrub-wrapper-4"]'),
        s1Text: getOpacity('[data-testid="scene-narrative-1"]'),
        s2Text: getOpacity('[data-testid="scene-narrative-2"]'),
        s3Text: getOpacity('[data-testid="scene-narrative-3"]'),
        s4Text: getOpacity('[data-testid="scene-narrative-4"]'),
      };
    });

    console.log(`Mobile P=${(pt.p * 100).toFixed(1)}% | Overflow: ${mState.hasOverflow} | Clips: [S1=${mState.s1CardClip}, S2=${mState.s2CardClip}, S3=${mState.s3CardClip}, S4=${mState.s4CardClip}] | Texts: [S1=${mState.s1Text.toFixed(2)}, S2=${mState.s2Text.toFixed(2)}, S3=${mState.s3Text.toFixed(2)}, S4=${mState.s4Text.toFixed(2)}]`);
    await page.screenshot({ path: path.join(OUT_DIR, `${pt.name}.png`) });
  }

  console.log('\nScreenshots saved to test-results/p0_remediation/');
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
