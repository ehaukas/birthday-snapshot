import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Route to generate snapshot
app.get('/snapshot', async (req, res) => {
  console.log('📸 Snapshot route triggered');

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: puppeteer.executablePath(), // ✅ For Render.com
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1548, height: 1030 });

    const htmlUrl = `http://localhost:${PORT}/`;
    console.log(`🌐 Loading page: ${htmlUrl}`);
    await page.goto(htmlUrl, { waitUntil: 'networkidle0' });

    console.log('⌛ Waiting for DOM to fully render...');
    await page.waitForFunction('document.querySelector("#greetingText").innerHTML.length > 0', { timeout: 8000 });

    const outputPath = path.join(__dirname, 'public', 'latest.png');
    await page.screenshot({ path: outputPath });
    console.log(`✅ Screenshot saved to ${outputPath}`);

    await browser.close();
    res.send('✅ Snapshot complete');
  } catch (err) {
    console.error('❌ Snapshot failed:', err);
    res.status(500).send('Snapshot failed. See server logs for details.');
  }
});

// Serve main HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
