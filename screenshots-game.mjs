import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function takeScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const outputDir = join(__dirname, 'astro-app', 'public', 'icons');

  // 截图 1: 首页 - 初始状态
  console.log('Taking screenshot 1: Home page (initial)...');
  await page.goto('https://ruleword.com', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: join(outputDir, 'store-screenshot-1.png'),
    fullPage: false
  });
  console.log('Saved: store-screenshot-1.png (首页)');

  // 截图 2: 游戏中 - 第一次猜测
  console.log('Taking screenshot 2: First guess...');
  await page.keyboard.type('crane');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: join(outputDir, 'store-screenshot-2.png'),
    fullPage: false
  });
  console.log('Saved: store-screenshot-2.png (第一次猜测)');

  // 截图 3: 游戏中 - 第二次猜测
  console.log('Taking screenshot 3: Second guess...');
  await page.keyboard.type('stare');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: join(outputDir, 'store-screenshot-3.png'),
    fullPage: false
  });
  console.log('Saved: store-screenshot-3.png (第二次猜测)');

  // 截图 4: 游戏中 - 第三次猜测
  console.log('Taking screenshot 4: Third guess...');
  await page.keyboard.type('moldy');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: join(outputDir, 'store-screenshot-4.png'),
    fullPage: false
  });
  console.log('Saved: store-screenshot-4.png (第三次猜测)');

  // 截图 5: 游戏中 - 第四次猜测（显示更多反馈）
  console.log('Taking screenshot 5: Fourth guess...');
  await page.keyboard.type('drink');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: join(outputDir, 'store-screenshot-5.png'),
    fullPage: false
  });
  console.log('Saved: store-screenshot-5.png (第四次猜测)');

  await browser.close();
  console.log('\nAll 5 screenshots completed!');
}

takeScreenshots().catch(console.error);
