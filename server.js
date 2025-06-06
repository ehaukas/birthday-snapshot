import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/snapshot', async (req, res) => {
  console.log('📸 Snapshot route called...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2400, height: 1220 });

  const targetUrl = `http://localhost:${PORT}/`;
  console.log(`🌐 Loading page: ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'networkidle0' });

  await page.waitForSelector('.card');
  await new Promise(resolve => setTimeout(resolve, 1000));

  await page.evaluate(() => {
    const card = document.querySelector('.card');
    if (card) {
      card.style.backgroundColor = '#ffffff';
    }
    document.body.style.backgroundColor = '#ffffff';
    document.documentElement.style.backgroundColor = '#ffffff';
  });

  const cardElement = await page.$('.card');
  if (cardElement) {
    const tempPath = path.join(__dirname, 'public', 'temp-snapshot.png');
    const finalPath = path.join(__dirname, 'public', 'latest.png');

    await cardElement.screenshot({
      path: tempPath,
      omitBackground: false,
    });

    await sharp(tempPath)
      .resize({
        width: 2400,
        height: 1220,
        fit: 'contain',
        position: 'left', // 👈 Align left
        background: '#ffffff',
      })
      .toFile(finalPath);

    console.log('✅ Snapshot created and padded as latest.png');
    res.send('✅ Snapshot complete');
  } else {
    console.error('❌ .card element not found');
    res.status(500).send('❌ Failed to find .card element for snapshot');
  }

  await browser.close();
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
