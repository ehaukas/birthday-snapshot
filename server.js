import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Snapshot route
app.get('/snapshot', async (req, res) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1548, height: 1030 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });

  // Wait until birthday rendering is confirmed
  await page.waitForFunction('window.__birthdayWidgetReady === true', { timeout: 8000 });

  await page.screenshot({ path: path.join(__dirname, 'public', 'latest.png') });
  await browser.close();
  res.send('✅ Snapshot complete');
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});