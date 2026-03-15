import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createPoster() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 720, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          width: 720px;
          height: 1080px;
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          overflow: hidden;
        }

        .logo {
          font-size: 96px;
          font-weight: 900;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 20px;
        }

        .tagline {
          font-size: 28px;
          color: #94a3b8;
          margin-bottom: 60px;
        }

        .game-preview {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 60px;
        }

        .row {
          display: flex;
          gap: 8px;
        }

        .tile {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .tile.empty { background: #1e293b; border: 2px solid #334155; }
        .tile.green { background: #22c55e; color: white; }
        .tile.yellow { background: #eab308; color: white; }
        .tile.gray { background: #6b7280; color: white; }

        .features {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 60px;
        }

        .feature {
          font-size: 24px;
          color: #e2e8f0;
        }

        .feature span {
          color: #4ade80;
        }

        .store-badge {
          background: #1e293b;
          border: 2px solid #334155;
          padding: 16px 40px;
          border-radius: 12px;
          font-size: 20px;
          color: #94a3b8;
        }

        .decorative {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(74, 222, 128, 0.1) 0%, transparent 70%);
          border-radius: 50%;
        }

        .decorative.top { top: -100px; right: -100px; }
        .decorative.bottom { bottom: -100px; left: -100px; }
      </style>
    </head>
    <body>
      <div class="decorative top"></div>
      <div class="decorative bottom"></div>

      <div class="logo">RuleWord</div>
      <div class="tagline">Guess the word in 6 tries!</div>

      <div class="game-preview">
        <div class="row">
          <div class="tile green">C</div>
          <div class="tile green">R</div>
          <div class="tile yellow">A</div>
          <div class="tile gray">N</div>
          <div class="tile gray">E</div>
        </div>
        <div class="row">
          <div class="tile green">C</div>
          <div class="tile green">R</div>
          <div class="tile green">O</div>
          <div class="tile yellow">W</div>
          <div class="tile gray">D</div>
        </div>
        <div class="row">
          <div class="tile green">C</div>
          <div class="tile green">R</div>
          <div class="tile green">O</div>
          <div class="tile green">N</div>
          <div class="tile green">E</div>
        </div>
        <div class="row">
          <div class="tile empty"></div>
          <div class="tile empty"></div>
          <div class="tile empty"></div>
          <div class="tile empty"></div>
          <div class="tile empty"></div>
        </div>
      </div>

      <div class="features">
        <div class="feature">✓ <span>Daily Challenge</span></div>
        <div class="feature">✓ <span>Challenge Friends</span></div>
        <div class="feature">✓ <span>Statistics & Streaks</span></div>
        <div class="feature">✓ <span>100% Free</span></div>
      </div>

      <div class="store-badge">Available on Microsoft Store</div>
    </body>
    </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(1000);

  const outputDir = join(__dirname, 'public', 'icons');
  await page.screenshot({
    path: join(outputDir, 'poster-720x1080.png'),
    fullPage: false
  });

  console.log('Poster saved: poster-720x1080.png');

  await browser.close();
}

createPoster().catch(console.error);
