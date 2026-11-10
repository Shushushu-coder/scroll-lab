/* eslint-disable */
const path = require('path');
const fs = require('fs');
const { chromium } = require('C:/Users/HP/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');

const VIDEO_DIR = path.resolve(__dirname, '../test-results/videos');
if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

async function recordT1Videos() {
  console.log('=== Recording Phase 3 P0 V2 T1 (Purple -> Teal) Desktop & Mobile Videos ===\n');

  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Recording (1440x900)
  console.log('1. Recording Desktop T1 (Purple -> Teal) Video (1440x900)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const dPage = await desktopContext.newPage();
  await dPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await dPage.waitForTimeout(600);

  const dGeometry = await dPage.evaluate(() => {
    const container = document.querySelector('[data-testid="scroll-story-container"]');
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    return {
      start: rect.top + scrollTop,
      distance: window.innerHeight * 3,
    };
  });

  // T1 spans ~20% to ~30%. We start at 15% (stable Purple plateau),
  // scrub smoothly through T1 to 35% (stable Teal plateau), pause,
  // then reverse scrub smoothly back to 15%.
  const pStart = 0.15;
  const pEnd = 0.35;
  const steps = 60;

  // Scroll to pStart initially and pause
  await dPage.evaluate((y) => window.scrollTo(0, y), dGeometry.start + pStart * dGeometry.distance);
  await dPage.waitForTimeout(600);

  // Forward scrub from 15% to 35%
  console.log('   Scrubbing forward: Scene 01 (Purple) -> T1 Morphing -> Scene 02 (Teal)...');
  for (let i = 0; i <= steps; i++) {
    const progress = pStart + (i / steps) * (pEnd - pStart);
    const y = dGeometry.start + progress * dGeometry.distance;
    await dPage.evaluate((pos) => window.scrollTo(0, pos), y);
    await dPage.waitForTimeout(35);
  }

  // Pause at Teal plateau
  await dPage.waitForTimeout(700);

  // Reverse scrub from 35% back to 15%
  console.log('   Scrubbing reverse: Scene 02 (Teal) -> T1 Morphing -> Scene 01 (Purple)...');
  for (let i = steps; i >= 0; i--) {
    const progress = pStart + (i / steps) * (pEnd - pStart);
    const y = dGeometry.start + progress * dGeometry.distance;
    await dPage.evaluate((pos) => window.scrollTo(0, pos), y);
    await dPage.waitForTimeout(35);
  }

  // Pause at Purple plateau
  await dPage.waitForTimeout(600);

  const dVideo = dPage.video();
  await dPage.close();
  await desktopContext.close();

  if (dVideo) {
    const videoPath = await dVideo.path();
    const targetPath = path.join(VIDEO_DIR, 'phase3_p0_v2_t1_desktop.webm');
    if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
    fs.renameSync(videoPath, targetPath);
    console.log(`   ✓ Desktop video saved: ${targetPath}`);
  }

  // 2. Mobile Recording (375x667)
  console.log('\n2. Recording Mobile T1 (Purple -> Teal) Video (375x667)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 375, height: 667 },
    },
  });

  const mPage = await mobileContext.newPage();
  await mPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await mPage.waitForTimeout(600);

  const mGeometry = await mPage.evaluate(() => {
    const container = document.querySelector('[data-testid="scroll-story-container"]');
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    return {
      start: rect.top + scrollTop,
      distance: window.innerHeight * 3,
    };
  });

  // Scroll to pStart initially and pause
  await mPage.evaluate((y) => window.scrollTo(0, y), mGeometry.start + pStart * mGeometry.distance);
  await mPage.waitForTimeout(600);

  // Forward scrub from 15% to 35%
  console.log('   Scrubbing forward mobile: Scene 01 (Purple) -> T1 Morphing -> Scene 02 (Teal)...');
  for (let i = 0; i <= steps; i++) {
    const progress = pStart + (i / steps) * (pEnd - pStart);
    const y = mGeometry.start + progress * mGeometry.distance;
    await mPage.evaluate((pos) => window.scrollTo(0, pos), y);
    await mPage.waitForTimeout(35);
  }

  // Pause at Teal plateau
  await mPage.waitForTimeout(700);

  // Reverse scrub from 35% back to 15%
  console.log('   Scrubbing reverse mobile: Scene 02 (Teal) -> T1 Morphing -> Scene 01 (Purple)...');
  for (let i = steps; i >= 0; i--) {
    const progress = pStart + (i / steps) * (pEnd - pStart);
    const y = mGeometry.start + progress * mGeometry.distance;
    await mPage.evaluate((pos) => window.scrollTo(0, pos), y);
    await mPage.waitForTimeout(35);
  }

  // Pause at Purple plateau
  await mPage.waitForTimeout(600);

  const mVideo = mPage.video();
  await mPage.close();
  await mobileContext.close();

  if (mVideo) {
    const videoPath = await mVideo.path();
    const targetPath = path.join(VIDEO_DIR, 'phase3_p0_v2_t1_mobile.webm');
    if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
    fs.renameSync(videoPath, targetPath);
    console.log(`   ✓ Mobile video saved: ${targetPath}`);
  }

  await browser.close();
  console.log('\n=== ALL PROTOTYPE VIDEOS GENERATED SUCCESSFULLY ===');
}

recordT1Videos().catch((err) => {
  console.error('\nVideo recording failed:', err);
  process.exit(1);
});
