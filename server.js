import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/snapshot', async (req, res) => {
  console.log("📸 Snapshot route called...");

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: puppeteer.executablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1548, height: 1030 });

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });

  await page.waitForFunction('window.__birthdayWidgetReady === true', { timeout: 7000 });
  await page.screenshot({ path: path.join(__dirname, 'public', 'latest.png') });

  await browser.close();
  console.log("✅ Snapshot complete.");
  res.send('✅ Snapshot complete');
});

app.listen(PORT, () => {
  console.log(`🌍 Server running at http://localhost:${PORT}`);
});
