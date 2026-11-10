/* eslint-disable */
const path = require('path');
const fs = require('fs');
const { chromium } = require('C:/Users/HP/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');

const VIDEO_DIR = path.resolve(__dirname, '../test-results/videos');
if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

async function recordScrubbing() {
  console.log('=== Recording Phase 3 Desktop Forward & Reverse Scrubbing Video ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const geometry = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="scroll-story-container"]');
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    return {
      start: rect.top + scrollTop,
      distance: window.innerHeight * 3,
      end: rect.top + scrollTop + window.innerHeight * 3,
      totalHeight: document.documentElement.scrollHeight,
    };
  });

  // 1. Initial pause at top
  await page.waitForTimeout(500);

  // 2. Smoothly scroll from top through Intro and enter Pinned Stage
  console.log('Scrolling forward through Intro and all 4 scenes...');
  const steps = 120;
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    // Scroll past end to outro as well
    const y = progress * (geometry.end + 500);
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(30);
  }

  // Pause at outro
  await page.waitForTimeout(600);

  // 3. Smoothly reverse scroll back to top
  console.log('Scrolling reverse through all 4 scenes back to top...');
  for (let i = steps; i >= 0; i--) {
    const progress = i / steps;
    const y = progress * (geometry.end + 500);
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(30);
  }

  // Pause at top
  await page.waitForTimeout(500);

  const video = page.video();

  await page.close();
  await context.close();
  await browser.close();

  if (video) {
    const videoPath = await video.path();
    const targetPath = path.join(VIDEO_DIR, 'phase3_p0_desktop_forward_reverse.webm');
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    fs.renameSync(videoPath, targetPath);
    console.log(`Video recording saved: ${targetPath}`);
  }
}

recordScrubbing().catch((err) => {
  console.error(err);
  process.exit(1);
});
