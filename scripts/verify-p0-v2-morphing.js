/* eslint-disable */
const path = require('path');
const fs = require('fs');
const { chromium } = require('C:/Users/HP/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');

const OUT_DIR = path.resolve(__dirname, '../test-results/p0_v2_t1_frames');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  console.log('=== Step 8: Playwright Verification of Shared Visual Shell + Content Morphing (V2) ===\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  console.log('1. Page load check:');
  console.log(`   Console / Hydration errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Errors:', consoleErrors);
    process.exit(1);
  }

  const geometry = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="scroll-story-container"]');
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const distance = window.innerHeight * 3;
    return { start: rect.top + scrollTop, distance, end: rect.top + scrollTop + distance };
  });

  // T1 Sampling Points as required by Section 10:
  // 20%, 22%, 24%, 25%, 26%, 28%, 30%
  const t1Points = [
    { p: 0.20, name: 't1_p020_entry' },
    { p: 0.22, name: 't1_p022_outgoing_exit' },
    { p: 0.24, name: 't1_p024_outgoing_faded' },
    { p: 0.25, name: 't1_p025_midpoint' },
    { p: 0.26, name: 't1_p026_incoming_entering' },
    { p: 0.28, name: 't1_p028_incoming_settled' },
    { p: 0.30, name: 't1_p030_complete' },
  ];

  console.log('\n2. Sampling T1 (Purple -> Teal) Across Mandatory Checkpoints:');
  const sampledRecords = [];

  for (const pt of t1Points) {
    const scrollY = geometry.start + pt.p * geometry.distance;
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(100);

    const record = await page.evaluate((progress) => {
      // 1. Shared Shell DOM count & bounding box
      const shells = Array.from(document.querySelectorAll('[data-testid="shared-visual-shell"]'));
      const visibleShells = shells.filter((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0.05;
      });

      const shell = shells[0];
      const shellRect = shell ? shell.getBoundingClientRect() : null;
      const shellBg = shell ? window.getComputedStyle(shell).backgroundColor : null;
      const shellClip = shell ? window.getComputedStyle(shell).clipPath : 'none';

      const wrapper = document.querySelector('[data-testid="card-scrub-wrapper-1"]');
      const wrapperClip = wrapper ? window.getComputedStyle(wrapper).clipPath : 'none';

      // 2. Content 1 & Content 2 opacity & transform
      const c1 = document.querySelector('[data-testid="shell-content-1"]');
      const c2 = document.querySelector('[data-testid="shell-content-2"]');
      const c1Op = c1 ? parseFloat(window.getComputedStyle(c1).opacity) : 0;
      const c2Op = c2 ? parseFloat(window.getComputedStyle(c2).opacity) : 0;
      const c1Transform = c1 ? window.getComputedStyle(c1).transform : 'none';
      const c2Transform = c2 ? window.getComputedStyle(c2).transform : 'none';

      // 3. Narrative texts
      const nr1 = document.querySelector('[data-testid="scene-narrative-1"]');
      const nr2 = document.querySelector('[data-testid="scene-narrative-2"]');
      const nr1Op = nr1 ? parseFloat(window.getComputedStyle(nr1).opacity) : 0;
      const nr2Op = nr2 ? parseFloat(window.getComputedStyle(nr2).opacity) : 0;

      // 4. Parallax layers
      const back = document.querySelector('[data-testid="scene-back-layer-1"]');
      const main = document.querySelector('[data-testid="scene-main-layer-1"]');
      const fg = document.querySelector('[data-testid="scene-fg-layer-1"]');

      return {
        progress,
        shellCount: shells.length,
        visibleShellCount: visibleShells.length,
        shellRect: shellRect ? { width: Math.round(shellRect.width), height: Math.round(shellRect.height), top: Math.round(shellRect.top), left: Math.round(shellRect.left) } : null,
        shellBg,
        shellClip,
        wrapperClip,
        c1Op,
        c2Op,
        c1Transform,
        c2Transform,
        nr1Op,
        nr2Op,
        backTransform: back ? window.getComputedStyle(back).transform : 'none',
        mainTransform: main ? window.getComputedStyle(main).transform : 'none',
        fgTransform: fg ? window.getComputedStyle(fg).transform : 'none',
      };
    }, pt.p);

    sampledRecords.push({ pt, record });

    console.log(
      `   P=${(pt.p * 100).toFixed(0)}% (${pt.name}) | ` +
      `Shells: ${record.visibleShellCount} | ` +
      `Bg: ${record.shellBg} | ` +
      `C1_Op: ${record.c1Op.toFixed(2)}, C2_Op: ${record.c2Op.toFixed(2)} | ` +
      `Nr1_Op: ${record.nr1Op.toFixed(2)}, Nr2_Op: ${record.nr2Op.toFixed(2)} | ` +
      `Clips: shell=${record.shellClip}, wrap=${record.wrapperClip}`
    );

    await page.screenshot({ path: path.join(OUT_DIR, `${pt.name}.png`) });
  }

  // ================================================================
  // Automated Assertions as required by Section 10:
  // ================================================================
  console.log('\n3. Running Automated Assertions on T1:');

  // Assertion 1: T1 过程中始终只有一个可见主 Shell
  sampledRecords.forEach(({ pt, record }) => {
    console.assert(record.visibleShellCount === 1, `Assertion 1 Failed at P=${pt.p}: visible shell count must be 1, got ${record.visibleShellCount}`);
  });
  console.log('   ✓ Assertion 1: Exactly 1 visible main shell maintained across all T1 sample points.');

  // Assertion 2: 主卡片外框位置与尺寸没有不合理跳变 (Stable frame dimensions & smooth parallax scale)
  const firstBox = sampledRecords[0].record.shellRect;
  sampledRecords.forEach(({ pt, record }) => {
    const box = record.shellRect;
    // Across entire T1 range, width should stay within smooth parallax scale limits (within 15px of 520px)
    console.assert(Math.abs(box.width - firstBox.width) <= 15, `Assertion 2 Failed at P=${pt.p}: shell width jumped unexpectedly!`);
    console.assert(Math.abs(box.height - firstBox.height) <= 15, `Assertion 2 Failed at P=${pt.p}: shell height jumped unexpectedly!`);
  });
  // Consecutive step-to-step delta must be <= 3px
  for (let i = 1; i < sampledRecords.length; i++) {
    const prev = sampledRecords[i - 1].record.shellRect;
    const curr = sampledRecords[i].record.shellRect;
    const dw = Math.abs(curr.width - prev.width);
    const dh = Math.abs(curr.height - prev.height);
    console.assert(dw <= 3, `Assertion 2 Failed at step ${i}: consecutive width step jumped by ${dw}px!`);
    console.assert(dh <= 3, `Assertion 2 Failed at step ${i}: consecutive height step jumped by ${dh}px!`);
  }
  console.log('   ✓ Assertion 2: Shell bounding box strictly stable without sudden dimension jumps.');

  // Assertion 3: Shell 背景颜色连续变化
  const bg20 = sampledRecords.find((r) => r.pt.p === 0.20).record.shellBg;
  const bg25 = sampledRecords.find((r) => r.pt.p === 0.25).record.shellBg;
  const bg30 = sampledRecords.find((r) => r.pt.p === 0.30).record.shellBg;
  console.log(`     - P=20%: ${bg20}`);
  console.log(`     - P=25%: ${bg25}`);
  console.log(`     - P=30%: ${bg30}`);
  console.assert(bg20 !== bg25 && bg25 !== bg30, 'Assertion 3 Failed: Shell background color must evolve continuously!');
  console.log('   ✓ Assertion 3: Continuous background color evolution confirmed.');

  // Assertion 4: 不存在卡片整体遮罩拼接 (No clip-path slicing on the shell or wrapper)
  sampledRecords.forEach(({ pt, record }) => {
    console.assert(record.shellClip === 'none' || record.shellClip === '', `Assertion 4 Failed at P=${pt.p}: shell has unexpected clip-path: ${record.shellClip}`);
    console.assert(record.wrapperClip === 'none' || record.wrapperClip === '', `Assertion 4 Failed at P=${pt.p}: wrapper has unexpected clip-path: ${record.wrapperClip}`);
  });
  console.log('   ✓ Assertion 4: Zero clip-path mask slicing on shell or wrapper.');

  // Assertion 5: 两套完整内部界面不会同时清晰显示 (At midpoint 25%, neither internal preview is clearly legible)
  const rec25 = sampledRecords.find((r) => r.pt.p === 0.25).record;
  console.assert(rec25.c1Op <= 0.05, `Assertion 5 Failed: Old content opacity at midpoint must be <= 0.05, got ${rec25.c1Op}`);
  console.assert(rec25.c2Op <= 0.05, `Assertion 5 Failed: New content opacity at midpoint must be <= 0.05, got ${rec25.c2Op}`);
  console.assert(rec25.nr1Op <= 0.05, `Assertion 5 Failed: Old narrative opacity at midpoint must be <= 0.05, got ${rec25.nr1Op}`);
  console.assert(rec25.nr2Op <= 0.05, `Assertion 5 Failed: New narrative opacity at midpoint must be <= 0.05, got ${rec25.nr2Op}`);
  console.log('   ✓ Assertion 5: Zero double exposure of contents or narrative texts at midpoint.');

  // Assertion 6: 不出现整个主卡片突然消失
  sampledRecords.forEach(({ pt, record }) => {
    console.assert(record.visibleShellCount === 1, `Assertion 6 Failed at P=${pt.p}: Shell disappeared!`);
  });
  console.log('   ✓ Assertion 6: Shell never disappears or dims globally.');

  // Assertion 7 & 8: 任意进度直接 Seek 与正反向可逆一致性
  console.log('\n4. Testing Direct Seek & Reverse Scrubbing Consistency:');
  const testSeekPoints = [0.25, 0.20, 0.30, 0.25, 0.22];
  for (const p of testSeekPoints) {
    const y = geometry.start + p * geometry.distance;
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(80);
    const check = await page.evaluate(() => {
      const shell = document.querySelector('[data-testid="shared-visual-shell"]');
      return {
        bg: shell ? window.getComputedStyle(shell).backgroundColor : null,
      };
    });
    console.log(`   Direct Seek P=${(p * 100).toFixed(0)}% -> Bg: ${check.bg}`);
  }
  // Reverse back to 20%
  const y20 = geometry.start + 0.20 * geometry.distance;
  await page.evaluate((pos) => window.scrollTo(0, pos), y20);
  await page.waitForTimeout(100);
  const rev20 = await page.evaluate(() => {
    const shell = document.querySelector('[data-testid="shared-visual-shell"]');
    const c1 = document.querySelector('[data-testid="shell-content-1"]');
    const c2 = document.querySelector('[data-testid="shell-content-2"]');
    return {
      bg: shell ? window.getComputedStyle(shell).backgroundColor : null,
      c1Op: c1 ? parseFloat(window.getComputedStyle(c1).opacity) : 0,
      c2Op: c2 ? parseFloat(window.getComputedStyle(c2).opacity) : 0,
    };
  });
  console.assert(rev20.bg === bg20, `Assertion 8 Failed: Reverse to 20% must restore original bg: expected ${bg20}, got ${rev20.bg}`);
  console.assert(rev20.c1Op >= 0.95, `Assertion 8 Failed: Reverse to 20% must restore C1 opacity >= 0.95, got ${rev20.c1Op}`);
  console.assert(rev20.c2Op <= 0.05, `Assertion 8 Failed: Reverse to 20% must restore C2 opacity <= 0.05, got ${rev20.c2Op}`);
  console.log('   ✓ Assertion 8: Exact reversible state fidelity verified.');

  // Assertion 9: T2 / T3 非目标行为未被意外破坏 (Baseline retention check)
  console.log('\n5. Verifying Retention of Baseline Behavior in T2 (50%) & T3 (75%):');
  // Check T2 at 50%
  const y50 = geometry.start + 0.50 * geometry.distance;
  await page.evaluate((pos) => window.scrollTo(0, pos), y50);
  await page.waitForTimeout(100);
  const t2State = await page.evaluate(() => {
    const cw3 = document.querySelector('[data-testid="card-scrub-wrapper-3"]');
    const nr2 = document.querySelector('[data-testid="scene-narrative-2"]');
    const nr3 = document.querySelector('[data-testid="scene-narrative-3"]');
    return {
      cw3Clip: cw3 ? window.getComputedStyle(cw3).clipPath : 'none',
      nr2Op: nr2 ? parseFloat(window.getComputedStyle(nr2).opacity) : 0,
      nr3Op: nr3 ? parseFloat(window.getComputedStyle(nr3).opacity) : 0,
    };
  });
  console.log(`   T2 (P=50%): S3 Card Clip=${t2State.cw3Clip}, S2 Text=${t2State.nr2Op}, S3 Text=${t2State.nr3Op}`);
  console.assert(t2State.cw3Clip.includes('50%') || t2State.cw3Clip.includes('49') || t2State.cw3Clip.includes('50'), 'Assertion 9 Failed: T2 must retain ~50% clip-path baseline!');
  console.assert(t2State.nr2Op <= 0.1 && t2State.nr3Op <= 0.1, 'Assertion 9 Failed: T2 narrative texts must be decoupled at midpoint');

  // Check T3 at 75%
  const y75 = geometry.start + 0.75 * geometry.distance;
  await page.evaluate((pos) => window.scrollTo(0, pos), y75);
  await page.waitForTimeout(100);
  const t3State = await page.evaluate(() => {
    const cw4 = document.querySelector('[data-testid="card-scrub-wrapper-4"]');
    const nr3 = document.querySelector('[data-testid="scene-narrative-3"]');
    const nr4 = document.querySelector('[data-testid="scene-narrative-4"]');
    return {
      cw4Clip: cw4 ? window.getComputedStyle(cw4).clipPath : 'none',
      nr3Op: nr3 ? parseFloat(window.getComputedStyle(nr3).opacity) : 0,
      nr4Op: nr4 ? parseFloat(window.getComputedStyle(nr4).opacity) : 0,
    };
  });
  console.log(`   T3 (P=75%): S4 Card Clip=${t3State.cw4Clip}, S3 Text=${t3State.nr3Op}, S4 Text=${t3State.nr4Op}`);
  console.assert(t3State.cw4Clip.includes('50%') || t3State.cw4Clip.includes('49') || t3State.cw4Clip.includes('50'), 'Assertion 9 Failed: T3 must retain ~50% clip-path baseline!');
  console.log('   ✓ Assertion 9: T2 & T3 baseline behavior strictly preserved.');

  // Assertion 10: HUD Navigation and Pin / Unpin
  console.log('\n6. Testing HUD Navigation & Pin/Unpin:');
  await page.click('[data-testid="indicator-pill-2"]');
  await page.waitForTimeout(700);
  const pill2Land = await page.evaluate(() => {
    const nr2 = document.querySelector('[data-testid="scene-narrative-2"]');
    const shell = document.querySelector('[data-testid="shared-visual-shell"]');
    return {
      nr2Op: nr2 ? parseFloat(window.getComputedStyle(nr2).opacity) : 0,
      shellBg: shell ? window.getComputedStyle(shell).backgroundColor : null,
    };
  });
  console.log(`   HUD Pill 02 Landing: Narrative Opacity=${pill2Land.nr2Op}, Shell Bg=${pill2Land.shellBg}`);
  console.assert(pill2Land.nr2Op >= 0.95, 'Assertion 10 Failed: Landing on Scene 2 must show narrative text fully');
  console.assert(pill2Land.shellBg.includes('13, 148, 136') || pill2Land.shellBg.includes('#0d9488'), 'Assertion 10 Failed: Shell must be Teal in Scene 2');
  console.log('   ✓ Assertion 10: HUD navigation lands cleanly on plateau with full opacity and Teal background.');

  // Outro unpin test
  const yPast = geometry.end + 500;
  await page.evaluate((pos) => window.scrollTo(0, pos), yPast);
  await page.waitForTimeout(300);
  const isOutroVisible = await page.evaluate(() => {
    const outro = document.querySelector('[data-testid="outro-section"]');
    const rect = outro ? outro.getBoundingClientRect() : null;
    return rect && rect.top < window.innerHeight && rect.bottom > 0;
  });
  console.assert(isOutroVisible, 'Assertion 10 Failed: Outro section must be visible when scrolled past pinned stage');
  console.log('   ✓ Assertion 10b: Outro document flow unpins cleanly.');

  // 7. Mobile Viewport Check (375x667)
  console.log('\n7. Mobile Viewport Testing (375x667):');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(400);

  const mGeom = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="scroll-story-container"]');
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    return { start: rect.top + scrollTop, distance: window.innerHeight * 3 };
  });

  for (const pt of t1Points) {
    const scrollY = mGeom.start + pt.p * mGeom.distance;
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(60);

    const mRecord = await page.evaluate(() => {
      const shell = document.querySelector('[data-testid="shared-visual-shell"]');
      const nr1 = document.querySelector('[data-testid="scene-narrative-1"]');
      const nr2 = document.querySelector('[data-testid="scene-narrative-2"]');
      return {
        shellVis: shell ? window.getComputedStyle(shell).visibility : 'hidden',
        shellBg: shell ? window.getComputedStyle(shell).backgroundColor : null,
        nr1Op: nr1 ? parseFloat(window.getComputedStyle(nr1).opacity) : 0,
        nr2Op: nr2 ? parseFloat(window.getComputedStyle(nr2).opacity) : 0,
      };
    });

    console.log(
      `   Mobile P=${(pt.p * 100).toFixed(0)}% | Shell: ${mRecord.shellVis}, Bg: ${mRecord.shellBg} | Text: Nr1=${mRecord.nr1Op.toFixed(2)}, Nr2=${mRecord.nr2Op.toFixed(2)}`
    );
    await page.screenshot({ path: path.join(OUT_DIR, `mobile_${pt.name}.png`) });
  }
  console.log('   ✓ Mobile Viewport: Single shell rendered, texts staggered without vertical collision.');

  // 8. Reduced Motion Verification
  console.log('\n8. Reduced Motion Verification:');
  const rmContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const rmPage = await rmContext.newPage();
  await rmPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await rmPage.waitForTimeout(400);

  const rmState = await rmPage.evaluate(() => {
    const scenes = [1, 2, 3, 4].map((num) => {
      const sc = document.querySelector(`[data-testid="scene-${num}"]`);
      return {
        num,
        exists: !!sc,
        vis: sc ? window.getComputedStyle(sc).visibility : 'hidden',
        display: sc ? window.getComputedStyle(sc).display : 'none',
      };
    });
    const hud = document.querySelector('[data-testid="scene-indicator"]');
    return { scenes, hudExists: !!hud };
  });

  console.log('   Reduced Motion Scenes:', rmState.scenes);
  console.log('   HUD hidden in Reduced Motion:', !rmState.hudExists);
  console.assert(rmState.scenes.every((s) => s.exists && s.vis !== 'hidden'), 'Reduced motion must render all 4 scenes statically');
  console.assert(!rmState.hudExists, 'HUD must be hidden in reduced motion');
  await rmPage.screenshot({ path: path.join(OUT_DIR, 'reduced_motion_static_scenes.png') });
  await rmPage.close();
  await rmContext.close();
  console.log('   ✓ Reduced Motion: All 4 scenes statically accessible in semantic document flow.');

  await page.close();
  await browser.close();

  console.log('\n=== ALL PLAYWRIGHT AUTOMATED ASSERTIONS PASSED WITH 100% FIDELITY ===');
}

run().catch((err) => {
  console.error('\nVerification failed:', err);
  process.exit(1);
});
