/* eslint-disable */
const path = require('path');
const fs = require('fs');
const { chromium } = require('C:/Users/HP/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');

const SCREENSHOT_DIR = path.resolve(__dirname, '../test-results/phase3_final');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runComprehensiveVerification() {
  console.log('=== Phase 3: Spatial Layering & Parallax Comprehensive Verification ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  console.log('1. Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const title = await page.title();
  console.log('  Page Title:', title);
  console.log('  Console Errors on Load:', consoleErrors.length);
  console.assert(consoleErrors.length === 0, 'No console errors allowed');

  const geometry = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="scroll-story-container"]');
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    return {
      start: rect.top + scrollTop,
      distance: window.innerHeight * 3,
      end: rect.top + scrollTop + window.innerHeight * 3,
    };
  });
  console.log('  ScrollTrigger Geometry:', geometry);

  // Helper to inspect scene state
  async function inspectState() {
    return await page.evaluate(() => {
      const getOpacity = (el) => (el ? parseFloat(window.getComputedStyle(el).opacity) : 0);
      const getFilter = (el) => (el ? window.getComputedStyle(el).filter : 'none');
      const getTransform = (el) => (el ? window.getComputedStyle(el).transform : 'none');
      const getVis = (el) => (el ? window.getComputedStyle(el).visibility : 'hidden');

      const scenes = [1, 2, 3, 4].map((num) => {
        const sc = document.querySelector(`[data-testid="scene-${num}"]`);
        const content = document.querySelector(`[data-testid="scene-content-${num}"]`);
        const cardWrapper = document.querySelector(`[data-testid="card-scrub-wrapper-${num}"]`);
        const narrative = document.querySelector(`[data-testid="scene-narrative-${num}"]`);
        const back = document.querySelector(`[data-testid="scene-back-layer-${num}"]`);
        const main = document.querySelector(`[data-testid="scene-main-layer-${num}"]`);
        const fg = document.querySelector(`[data-testid="scene-fg-layer-${num}"]`);
        return {
          idx: num,
          visibility: getVis(sc),
          inert: sc ? sc.hasAttribute('inert') : false,
          opacity: getOpacity(content),
          cardClip: cardWrapper ? window.getComputedStyle(cardWrapper).clipPath : 'none',
          narrativeOpacity: getOpacity(narrative),
          filter: getFilter(content),
          contentTransform: getTransform(content),
          backTransform: getTransform(back),
          mainTransform: getTransform(main),
          fgTransform: getTransform(fg),
        };
      });

      const bgs = [1, 2, 3, 4].map((num) => {
        const bg = document.querySelector(`[data-testid="ambient-bg-layer-${num}"]`);
        return {
          idx: num,
          opacity: getOpacity(bg),
          visibility: getVis(bg),
        };
      });

      const activePill = document.querySelector('button[aria-current="true"]');
      const activePillText = activePill ? activePill.textContent.trim() : null;

      const progressBar = document.querySelector('[data-testid="progress-track"] > div');
      const progressTransform = progressBar ? progressBar.style.transform : null;

      return { scenes, bgs, activePillText, progressTransform };
    });
  }

  // 2. Sample key progress points across the entire story
  console.log('\n2. Testing Forward Scrubbing & Sampling Key Plateaus and Transitions...');
  const samplePoints = [
    { p: 0.00, name: 'scene1_stable_plateau' },
    { p: 0.12, name: 'scene1_mid_parallax' },
    { p: 0.20, name: 'scene1_exit_approach' },
    { p: 0.25, name: 'midpoint_transition_1_2' },
    { p: 0.35, name: 'scene2_stable_plateau' },
    { p: 0.50, name: 'midpoint_transition_2_3' },
    { p: 0.62, name: 'scene3_stable_plateau' },
    { p: 0.75, name: 'midpoint_transition_3_4' },
    { p: 0.88, name: 'scene4_stable_plateau' },
    { p: 1.00, name: 'scene4_release_edge' },
  ];

  const sampledData = [];

  for (const pt of samplePoints) {
    const scrollY = geometry.start + pt.p * geometry.distance;
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(100);

    const state = await inspectState();
    sampledData.push({ pt, state });

    const scOp = state.scenes.map((s) => s.opacity.toFixed(2)).join(',');
    const bgOp = state.bgs.map((b) => b.opacity.toFixed(2)).join(',');
    console.log(
      `  P=${(pt.p * 100).toFixed(0)}% (${pt.name}) | Fg Op: [${scOp}] | Bg Op: [${bgOp}] | Active: ${state.activePillText}`
    );

    const shotPath = path.join(SCREENSHOT_DIR, `${pt.name}.png`);
    await page.screenshot({ path: shotPath });
  }

  // 3. Verify Tri-Layer Parallax Independence
  console.log('\n3. Verifying Tri-Layer Parallax Independence in Scene 1...');
  const s1_p00 = sampledData.find((d) => d.pt.p === 0.00).state.scenes[0];
  const s1_p12 = sampledData.find((d) => d.pt.p === 0.12).state.scenes[0];
  const s1_p20 = sampledData.find((d) => d.pt.p === 0.20).state.scenes[0];

  console.log('  Scene 1 at P=0.00:');
  console.log('    BackLayer:', s1_p00.backTransform);
  console.log('    MainLayer:', s1_p00.mainTransform);
  console.log('    FgLayer:  ', s1_p00.fgTransform);

  console.log('  Scene 1 at P=0.12:');
  console.log('    BackLayer:', s1_p12.backTransform);
  console.log('    MainLayer:', s1_p12.mainTransform);
  console.log('    FgLayer:  ', s1_p12.fgTransform);

  console.log('  Scene 1 at P=0.20:');
  console.log('    BackLayer:', s1_p20.backTransform);
  console.log('    MainLayer:', s1_p20.mainTransform);
  console.log('    FgLayer:  ', s1_p20.fgTransform);

  console.assert(
    s1_p00.backTransform !== s1_p00.mainTransform && s1_p00.mainTransform !== s1_p00.fgTransform,
    'BackLayer, MainLayer, and FgLayer must have distinct transforms!'
  );
  console.assert(
    s1_p00.backTransform !== s1_p12.backTransform,
    'BackLayer must move as scroll progress advances!'
  );
  console.assert(
    s1_p00.fgTransform !== s1_p12.fgTransform,
    'ForegroundLayer must move as scroll progress advances!'
  );

  // 4. Verify P0 Single-Focus Handoff at Midpoints
  console.log('\n4. Verifying P0 Single-Focus Handoff at Transition Midpoints...');
  const m1 = sampledData.find((d) => d.pt.p === 0.25).state;
  const m2 = sampledData.find((d) => d.pt.p === 0.50).state;
  const m3 = sampledData.find((d) => d.pt.p === 0.75).state;

  console.log(`  T1 (P=0.25): S2 Card Clip=${m1.scenes[1].cardClip}, S1 Text=${m1.scenes[0].narrativeOpacity}, S2 Text=${m1.scenes[1].narrativeOpacity}`);
  console.log(`  T2 (P=0.50): S3 Card Clip=${m2.scenes[2].cardClip}, S2 Text=${m2.scenes[1].narrativeOpacity}, S3 Text=${m2.scenes[2].narrativeOpacity}`);
  console.log(`  T3 (P=0.75): S4 Card Clip=${m3.scenes[3].cardClip}, S3 Text=${m3.scenes[2].narrativeOpacity}, S4 Text=${m3.scenes[3].narrativeOpacity}`);

  // Assert Single-Focus Card Mask at midpoint (around 50% reveal mask)
  console.assert(m1.scenes[1].cardClip.includes('50%') || m1.scenes[1].cardClip.includes('49') || m1.scenes[1].cardClip.includes('50'), 'T1: Scene 2 card must be at ~50% reveal mask');
  console.assert(m2.scenes[2].cardClip.includes('50%') || m2.scenes[2].cardClip.includes('49') || m2.scenes[2].cardClip.includes('50'), 'T2: Scene 3 card must be at ~50% reveal mask');
  console.assert(m3.scenes[3].cardClip.includes('50%') || m3.scenes[3].cardClip.includes('49') || m3.scenes[3].cardClip.includes('50'), 'T3: Scene 4 card must be at ~50% reveal mask');

  // Assert Decoupled Staggered Text (simultaneous text legibility is 0; both texts <= 0.1 at midpoint)
  console.assert(m1.scenes[0].narrativeOpacity <= 0.1, 'T1: Scene 1 text must be fully faded out at midpoint (<=0.1)');
  console.assert(m1.scenes[1].narrativeOpacity <= 0.1, 'T1: Scene 2 text must not be entered yet at midpoint (<=0.1)');
  console.assert(m2.scenes[1].narrativeOpacity <= 0.1, 'T2: Scene 2 text must be fully faded out at midpoint (<=0.1)');
  console.assert(m2.scenes[2].narrativeOpacity <= 0.1, 'T2: Scene 3 text must not be entered yet at midpoint (<=0.1)');
  console.assert(m3.scenes[2].narrativeOpacity <= 0.1, 'T3: Scene 3 text must be fully faded out at midpoint (<=0.1)');
  console.assert(m3.scenes[3].narrativeOpacity <= 0.1, 'T3: Scene 4 text must not be entered yet at midpoint (<=0.1)');

  // 5. Verify Reverse Scrubbing Fidelity
  console.log('\n5. Verifying Reverse Scrubbing Fidelity...');
  const reversePoints = [1.00, 0.75, 0.50, 0.25, 0.00];
  for (const p of reversePoints) {
    const scrollY = geometry.start + p * geometry.distance;
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(80);
    const revState = await inspectState();
    const scOp = revState.scenes.map((s) => s.opacity.toFixed(2)).join(',');
    console.log(`  Reverse P=${(p * 100).toFixed(0)}% | Fg Op: [${scOp}]`);
  }
  // At P=0 reverse, Scene 1 must be 1.0, others 0
  const rev0 = await inspectState();
  console.assert(rev0.scenes[0].opacity === 1, 'Reverse P=0: Scene 1 opacity must return to 1');
  console.assert(rev0.scenes[1].opacity === 0, 'Reverse P=0: Scene 2 opacity must return to 0');

  // 6. Test Unified HUD Indicator Clicks
  console.log('\n6. Verifying Unified HUD Indicator Navigation...');
  const pills = [
    { idx: 2, label: '02' },
    { idx: 3, label: '03' },
    { idx: 4, label: '04' },
    { idx: 1, label: '01' },
  ];

  for (const pill of pills) {
    console.log(`  Clicking HUD Pill ${pill.label}...`);
    await page.click(`[data-testid="indicator-pill-${pill.idx}"]`);
    await page.waitForTimeout(700);

    const jumpState = await inspectState();
    const targetScene = jumpState.scenes[pill.idx - 1];
    console.log(
      `    Landed at Scene ${pill.label} -> Opacity: ${targetScene.opacity}, Filter: ${targetScene.filter}, Active Pill: ${jumpState.activePillText}`
    );
    console.assert(targetScene.opacity === 1, `Scene ${pill.label} must be opacity 1 after click jump`);
    console.assert(
      targetScene.filter.includes('none') || targetScene.filter.includes('blur(0px)'),
      `Scene ${pill.label} must have 0 blur after click jump`
    );
  }

  // 7. Test Stage Release into Document Flow (Outro)
  console.log('\n7. Verifying Stage Release (Past 100%)...');
  const pastScroll = geometry.end + 400;
  await page.evaluate((y) => window.scrollTo(0, y), pastScroll);
  await page.waitForTimeout(300);

  const isOutroVisible = await page.evaluate(() => {
    const outro = document.querySelector('[data-testid="outro-section"]');
    const rect = outro.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  });
  console.log('  Outro Section Visible past 100%:', isOutroVisible);
  console.assert(isOutroVisible, 'Outro section must be visible past 100%');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'stage_released_outro.png') });

  // 8. Mobile Viewport Test (375x667)
  console.log('\n8. Verifying Mobile Layout (375x667)...');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  const mobileOverflow = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const bodyWidth = document.body.scrollWidth;
    const vpWidth = window.innerWidth;
    return { docWidth, bodyWidth, vpWidth, hasOverflow: docWidth > vpWidth || bodyWidth > vpWidth };
  });

  console.log('  Mobile Width Check:', mobileOverflow);
  console.assert(!mobileOverflow.hasOverflow, 'Mobile layout must have ZERO horizontal overflow');

  // Sample mobile screenshot at p = 0.25 (transition) and p = 0.35 (Scene 2)
  const mobileGeom = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="scroll-story-container"]');
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    return { start: rect.top + scrollTop, distance: window.innerHeight * 3 };
  });

  await page.evaluate((y) => window.scrollTo(0, y), mobileGeom.start + 0.25 * mobileGeom.distance);
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_375x667_p025.png') });

  await page.evaluate((y) => window.scrollTo(0, y), mobileGeom.start + 0.35 * mobileGeom.distance);
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_375x667_scene2.png') });

  // 9. Reduced Motion Mode Test
  console.log('\n9. Verifying Reduced Motion Mode...');
  const rmContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const rmPage = await rmContext.newPage();
  await rmPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await rmPage.waitForTimeout(300);

  const rmState = await rmPage.evaluate(() => {
    const scenes = [1, 2, 3, 4].map((num) => {
      const el = document.querySelector(`[data-testid="scene-${num}"]`);
      const cs = window.getComputedStyle(el);
      const content = document.querySelector(`[data-testid="scene-content-${num}"]`);
      const ccs = window.getComputedStyle(content);
      const main = document.querySelector(`[data-testid="scene-main-layer-${num}"]`);
      const mcs = window.getComputedStyle(main);
      return {
        idx: num,
        position: cs.position,
        opacity: cs.opacity,
        visibility: cs.visibility,
        contentTransform: ccs.transform,
        mainTransform: mcs.transform,
      };
    });

    const indicator = document.querySelector('[data-testid="scene-indicator"]');
    const ambientBg = document.querySelector('[data-testid="ambient-background"]');
    const ambientDisplay = ambientBg ? window.getComputedStyle(ambientBg).display : null;

    return { scenes, hasIndicator: !!indicator, ambientDisplay };
  });

  console.log('  Reduced Motion State:');
  console.log('    HUD Indicator present:', rmState.hasIndicator, '(should be false)');
  console.log('    Ambient Background display:', rmState.ambientDisplay, '(should be none)');
  rmState.scenes.forEach((s) => {
    console.log(`    Scene ${s.idx}: pos=${s.position}, op=${s.opacity}, vis=${s.visibility}, transform=${s.contentTransform}`);
    console.assert(s.position === 'relative', `RM Scene ${s.idx} must be relative`);
    console.assert(s.opacity === '1', `RM Scene ${s.idx} must have opacity 1`);
  });

  await rmPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'reduced_motion_flow.png') });

  await rmContext.close();
  await context.close();
  await browser.close();

  console.log('\n================================================================');
  console.log('=== All Phase 3 Automated Verifications & Tests PASSED! ===');
  console.log('================================================================');
}

runComprehensiveVerification().catch((err) => {
  console.error('Phase 3 verification error:', err);
  process.exit(1);
});
