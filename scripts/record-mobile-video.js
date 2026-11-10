/* eslint-disable */
const path = require('path');
const fs = require('fs');
const { chromium } = require('C:/Users/HP/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');

const VIDEO_DIR = path.resolve(__dirname, '../test-results/videos');

async function recordMobile() {
  console.log('=== Recording Phase 3 Mobile (375x667) Scrubbing Video ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 375, height: 667 },
    },
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

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

  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const y = (i / steps) * (geometry.end + 300);
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(30);
  }

  await page.waitForTimeout(400);

  for (let i = steps; i >= 0; i--) {
    const y = (i / steps) * (geometry.end + 300);
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(30);
  }

  const video = page.video();

  await page.close();
  await context.close();
  await browser.close();

  if (video) {
    const videoPath = await video.path();
    const targetPath = path.join(VIDEO_DIR, 'phase3_p0_mobile_forward_reverse.webm');
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    fs.renameSync(videoPath, targetPath);
    console.log(`Mobile video recorded: ${targetPath}`);
  }
}

recordMobile().catch((err) => {
  console.error(err);
  process.exit(1);
});
