import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function takeScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const outputDir = join(__dirname, 'public', 'icons');

  // 截图 1: 主界面
  console.log('Taking screenshot 1: Main game interface...');
  await page.goto('https://ruleword.com', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: join(outputDir, 'screenshot-1-desktop.png'),
    fullPage: false
  });
  console.log('Saved: screenshot-1-desktop.png');

  // 截图 2: 模拟输入几个字母
  console.log('Taking screenshot 2: Game in progress...');
  await page.keyboard.type('crane');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: join(outputDir, 'screenshot-2-playing.png'),
    fullPage: false
  });
  console.log('Saved: screenshot-2-playing.png');

  // 截图 3: 移动端视图
  console.log('Taking screenshot 3: Mobile view...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://ruleword.com', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.keyboard.type('stare');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: join(outputDir, 'screenshot-3-mobile.png'),
    fullPage: false
  });
  console.log('Saved: screenshot-3-mobile.png');

  await browser.close();
  console.log('\nAll screenshots completed!');
}

takeScreenshots().catch(console.error);
