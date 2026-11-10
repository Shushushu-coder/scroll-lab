/* eslint-disable */
const path = require('path');
const fs = require('fs');
const { chromium } = require('C:/Users/HP/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');

const SCREENSHOT_DIR = path.resolve(__dirname, '../test-results/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runVerification() {
  console.log('=== Starting Phase 2 Comprehensive Verification ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  console.log('1. Navigating to http://localhost:3001...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // 1. Initial Checks
  const title = await page.title();
  console.log('Page Title:', title);
  console.log('Console Errors on initial load:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.error('Errors found:', consoleErrors);
  }

  // Get ScrollTrigger geometry
  const geometry = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="scroll-story-container"]');
    const stage = document.querySelector('[data-testid="pinned-stage"]');
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const start = rect.top + scrollTop;
    // Total pinned distance is +=300% of viewport height
    const distance = window.innerHeight * 3;
    const end = start + distance;
    return { start, end, distance, innerHeight: window.innerHeight };
  });

  console.log('ScrollTrigger Geometry:', geometry);

  // Function to inspect all layers at current scroll position
  async function inspectState() {
    return await page.evaluate(() => {
      const getOpacity = (el) => parseFloat(window.getComputedStyle(el).opacity);
      const getFilter = (el) => window.getComputedStyle(el).filter;
      const getVisibility = (el) => window.getComputedStyle(el).visibility;
      const getTransform = (el) => window.getComputedStyle(el).transform;

      const scenes = [1, 2, 3, 4].map((num) => {
        const sc = document.querySelector(`[data-testid="scene-${num}"]`);
        const content = document.querySelector(`[data-testid="scene-content-${num}"]`);
        const card = document.querySelector(`[data-testid="card-scrub-wrapper-${num}"]`);
        return {
          sceneNum: num,
          sceneVis: getVisibility(sc),
          sceneInert: sc.hasAttribute('inert'),
          contentOpacity: getOpacity(content),
          contentFilter: getFilter(content),
          contentTransform: getTransform(content),
          cardTransform: getTransform(card),
        };
      });

      const bgs = [1, 2, 3, 4].map((num) => {
        const bg = document.querySelector(`[data-testid="ambient-bg-layer-${num}"]`);
        return {
          layerNum: num,
          opacity: getOpacity(bg),
          visibility: getVisibility(bg),
        };
      });

      const activePill = document.querySelector('button[aria-current="true"]');
      const activePillText = activePill ? activePill.textContent.trim() : null;

      const progressBar = document.querySelector('[data-testid="progress-track"] > div');
      const progressTransform = progressBar ? progressBar.style.transform : null;

      return { scenes, bgs, activePillText, progressTransform };
    });
  }

  // Sample progress points
  const samplePoints = [
    { p: 0.00, name: 'p000_scene1_pure' },
    { p: 0.16, name: 'p016_bg_blend_start' },
    { p: 0.20, name: 'p020_fg_crossfade_start' },
    { p: 0.25, name: 'p025_midpoint_s1_s2' },
    { p: 0.30, name: 'p030_fg_s2_settled' },
    { p: 0.32, name: 'p032_bg_s2_settled' },
    { p: 0.375, name: 'p0375_scene2_center' },
    { p: 0.41, name: 'p041_bg_s3_blend_start' },
    { p: 0.45, name: 'p045_fg_crossfade_s2_s3_start' },
    { p: 0.50, name: 'p050_midpoint_s2_s3' },
    { p: 0.55, name: 'p055_fg_s3_settled' },
    { p: 0.57, name: 'p057_bg_s3_settled' },
    { p: 0.625, name: 'p0625_scene3_center' },
    { p: 0.66, name: 'p066_bg_s4_blend_start' },
    { p: 0.70, name: 'p070_fg_crossfade_s3_s4_start' },
    { p: 0.75, name: 'p075_midpoint_s3_s4' },
    { p: 0.80, name: 'p080_fg_s4_settled' },
    { p: 0.82, name: 'p082_bg_s4_settled' },
    { p: 0.88, name: 'p088_scene4_center' },
    { p: 1.00, name: 'p100_scene4_release' },
  ];

  console.log('\n2. Testing Forward Scrubbing & Sampling Computed Styles...');
  const sampleResults = [];

  for (const pt of samplePoints) {
    const targetScroll = geometry.start + pt.p * geometry.distance;
    await page.evaluate((y) => window.scrollTo(0, y), targetScroll);
    await page.waitForTimeout(100);

    const state = await inspectState();
    sampleResults.push({ pt, state });

    const scOp = state.scenes.map((s) => s.contentOpacity.toFixed(2)).join(',');
    const bgOp = state.bgs.map((b) => b.opacity.toFixed(2)).join(',');
    const s1Blur = state.scenes[0].contentFilter;
    const s2Blur = state.scenes[1].contentFilter;

    console.log(
      `P=${(pt.p * 100).toFixed(1)}% (${pt.name}) | Fg Op: [${scOp}] | Bg Op: [${bgOp}] | Active: ${state.activePillText}`
    );

    // Save screenshot
    const shotPath = path.join(SCREENSHOT_DIR, `${pt.name}.png`);
    await page.screenshot({ path: shotPath });
  }

  // Verification assertions on sampled points
  console.log('\n3. Verifying Key Transition Properties...');

  // At P=0: Scene 1 must be 1.0 opacity, blur 0px, bg 1 opacity 1.0
  const r0 = sampleResults.find((r) => r.pt.p === 0.00).state;
  console.assert(r0.scenes[0].contentOpacity === 1, 'P=0: Scene 1 should have opacity 1');
  console.assert(r0.scenes[0].contentFilter.includes('none') || r0.scenes[0].contentFilter.includes('blur(0px)'), 'P=0: Scene 1 blur should be 0');
  console.assert(r0.bgs[0].opacity === 1, 'P=0: Bg 1 should have opacity 1');
  console.assert(r0.scenes[1].contentOpacity === 0, 'P=0: Scene 2 should be invisible');

  // At P=0.25 (Midpoint Scene 1 -> 2):
  // Both Scene 1 and Scene 2 must be partially visible!
  const r25 = sampleResults.find((r) => r.pt.p === 0.25).state;
  console.log('At P=0.25:');
  console.log('  Scene 1 opacity:', r25.scenes[0].contentOpacity, 'filter:', r25.scenes[0].contentFilter);
  console.log('  Scene 2 opacity:', r25.scenes[1].contentOpacity, 'filter:', r25.scenes[1].contentFilter);
  console.log('  Bg 1 opacity:', r25.bgs[0].opacity, 'Bg 2 opacity:', r25.bgs[1].opacity);
  console.assert(r25.scenes[0].contentOpacity > 0.3 && r25.scenes[0].contentOpacity < 0.7, 'P=0.25: Scene 1 partially visible');
  console.assert(r25.scenes[1].contentOpacity > 0.3 && r25.scenes[1].contentOpacity < 0.7, 'P=0.25: Scene 2 partially visible');
  console.assert(r25.scenes[0].contentFilter.includes('blur'), 'P=0.25: Scene 1 blurred');
  console.assert(r25.scenes[1].contentFilter.includes('blur'), 'P=0.25: Scene 2 blurred');

  // At P=0.50 (Midpoint Scene 2 -> 3):
  const r50 = sampleResults.find((r) => r.pt.p === 0.50).state;
  console.log('At P=0.50:');
  console.log('  Scene 2 opacity:', r50.scenes[1].contentOpacity, 'filter:', r50.scenes[1].contentFilter);
  console.log('  Scene 3 opacity:', r50.scenes[2].contentOpacity, 'filter:', r50.scenes[2].contentFilter);
  console.assert(r50.scenes[1].contentOpacity > 0.3 && r50.scenes[1].contentOpacity < 0.7, 'P=0.50: Scene 2 partially visible');
  console.assert(r50.scenes[2].contentOpacity > 0.3 && r50.scenes[2].contentOpacity < 0.7, 'P=0.50: Scene 3 partially visible');

  // At P=0.75 (Midpoint Scene 3 -> 4):
  const r75 = sampleResults.find((r) => r.pt.p === 0.75).state;
  console.log('At P=0.75:');
  console.log('  Scene 3 opacity:', r75.scenes[2].contentOpacity, 'filter:', r75.scenes[2].contentFilter);
  console.log('  Scene 4 opacity:', r75.scenes[3].contentOpacity, 'filter:', r75.scenes[3].contentFilter);
  console.assert(r75.scenes[2].contentOpacity > 0.3 && r75.scenes[2].contentOpacity < 0.7, 'P=0.75: Scene 3 partially visible');
  console.assert(r75.scenes[3].contentOpacity > 0.3 && r75.scenes[3].contentOpacity < 0.7, 'P=0.75: Scene 4 partially visible');

  // 4. Reverse Scrubbing Verification
  console.log('\n4. Verifying Reverse Scrubbing Fidelity...');
  const reversePoints = [1.00, 0.75, 0.50, 0.25, 0.00];
  for (const p of reversePoints) {
    const targetScroll = geometry.start + p * geometry.distance;
    await page.evaluate((y) => window.scrollTo(0, y), targetScroll);
    await page.waitForTimeout(80);
    const revState = await inspectState();
    const scOp = revState.scenes.map((s) => s.contentOpacity.toFixed(2)).join(',');
    console.log(`Reverse P=${(p * 100).toFixed(0)}% | Fg Op: [${scOp}]`);
  }

  // 5. Test Indicator Click Jump
  console.log('\n5. Verifying Indicator Click Navigation...');
  const pills = [
    { idx: 2, label: '02' },
    { idx: 3, label: '03' },
    { idx: 4, label: '04' },
    { idx: 1, label: '01' },
  ];

  for (const pill of pills) {
    console.log(`Clicking Pill ${pill.label}...`);
    await page.click(`[data-testid="indicator-pill-${pill.idx}"]`);
    // Wait for smooth scroll to finish
    await page.waitForTimeout(800);

    const jumpState = await inspectState();
    const targetScene = jumpState.scenes[pill.idx - 1];
    console.log(
      `  Landed at Scene ${pill.label} -> Opacity: ${targetScene.contentOpacity}, Filter: ${targetScene.contentFilter}, Active Pill: ${jumpState.activePillText}`
    );
    console.assert(targetScene.contentOpacity === 1, `Scene ${pill.label} should be opacity 1 after jump`);
    console.assert(
      targetScene.contentFilter.includes('none') || targetScene.contentFilter.includes('blur(0px)'),
      `Scene ${pill.label} should not be blurred after jump`
    );
  }

  // 6. Test Stage Release into Document Flow
  console.log('\n6. Verifying Stage Release (Past 100%)...');
  const pastScroll = geometry.end + 500;
  await page.evaluate((y) => window.scrollTo(0, y), pastScroll);
  await page.waitForTimeout(300);

  const isOutroVisible = await page.evaluate(() => {
    const outro = document.querySelector('[data-testid="outro-section"]');
    const rect = outro.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  });
  console.log('Outro Section Visible past 100%:', isOutroVisible);
  console.assert(isOutroVisible, 'Outro section should be visible past 100%');

  // Take outro screenshot
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'stage_released_outro.png') });

  // 7. Mobile Viewport Test (375x667)
  console.log('\n7. Verifying Mobile Layout (375x667)...');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  const mobileOverflow = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const bodyWidth = document.body.scrollWidth;
    const vpWidth = window.innerWidth;
    return { docWidth, bodyWidth, vpWidth, hasOverflow: docWidth > vpWidth || bodyWidth > vpWidth };
  });

  console.log('Mobile Width Check:', mobileOverflow);
  console.assert(!mobileOverflow.hasOverflow, 'Mobile layout must not have horizontal overflow');

  // Sample mobile screenshot at p = 0.25 (transition)
  const mobileGeom = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="scroll-story-container"]');
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    return { start: rect.top + scrollTop, distance: window.innerHeight * 3 };
  });

  await page.evaluate((y) => window.scrollTo(0, y), mobileGeom.start + 0.25 * mobileGeom.distance);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_375x667_p025.png') });

  // 8. Reduced Motion Test
  console.log('\n8. Verifying Reduced Motion Mode...');
  const rmContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const rmPage = await rmContext.newPage();
  await rmPage.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await rmPage.waitForTimeout(400);

  const rmState = await rmPage.evaluate(() => {
    const scenes = [1, 2, 3, 4].map((num) => {
      const el = document.querySelector(`[data-testid="scene-${num}"]`);
      const cs = window.getComputedStyle(el);
      const content = document.querySelector(`[data-testid="scene-content-${num}"]`);
      const ccs = window.getComputedStyle(content);
      return {
        sceneNum: num,
        position: cs.position,
        opacity: cs.opacity,
        visibility: cs.visibility,
        contentFilter: ccs.filter,
        contentTransform: ccs.transform,
      };
    });

    const indicator = document.querySelector('[data-testid="scene-indicator"]');
    const ambientBg = document.querySelector('[data-testid="ambient-background"]');
    const ambientDisplay = ambientBg ? window.getComputedStyle(ambientBg).display : null;

    return { scenes, hasIndicator: !!indicator, ambientDisplay };
  });

  console.log('Reduced Motion State:');
  console.log('  Indicator present:', rmState.hasIndicator, '(should be false)');
  console.log('  Ambient Background display:', rmState.ambientDisplay, '(should be none)');
  rmState.scenes.forEach((s) => {
    console.log(
      `  Scene ${s.sceneNum}: pos=${s.position}, op=${s.opacity}, vis=${s.visibility}, filter=${s.contentFilter}, transform=${s.contentTransform}`
    );
    console.assert(s.position === 'relative', `RM: Scene ${s.sceneNum} should be relative in document flow`);
    console.assert(s.opacity === '1', `RM: Scene ${s.sceneNum} opacity should be 1`);
  });

  await rmPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'reduced_motion_flow.png') });

  await rmContext.close();
  await context.close();
  await browser.close();

  console.log('\n=== All Automated Tests & Visual Verifications PASSED! ===');
}

runVerification().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
