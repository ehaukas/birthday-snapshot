
const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/snapshot', async (req, res) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1548, height: 1030 });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.__birthdayWidgetReady === true', { timeout: 10000 });
  await page.screenshot({ path: path.join(__dirname, 'public', 'latest.png') });
  await browser.close();
  res.send('✅ Snapshot complete');
});

app.listen(PORT, () => console.log(`🌍 Server running at http://localhost:${PORT}`));
