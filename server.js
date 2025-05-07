import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (HTML, CSS, JS, CSV, images)
app.use(express.static(path.join(__dirname, 'public')));

// Screenshot route
app.get('/snapshot', async (req, res) => {
  console.log('📸 Snapshot route called...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1548, height: 1030 });

  const targetUrl = `http://localhost:${PORT}/`;
  console.log(`🌐 Loading page: ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'networkidle0' });

  // Force background to white
  await page.evaluate(() => {
    document.body.style.background = 'white';
    document.documentElement.style.background = 'white';
  });

  // Wait for .card element to be ready and clip it
  const card = await page.$('.card');
  if (!card) {
    console.error('❌ Could not find .card element.');
    await browser.close();
    return res.status(500).send('Card element not found.');
  }

  const boundingBox = await card.boundingBox();
  await page.screenshot({
    path: path.join(__dirname, 'public', 'latest.png'),
    clip: boundingBox
  });

  await browser.close();
  console.log('✅ Snapshot complete');
  res.send('✅ Snapshot complete');
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
