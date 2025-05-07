import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files from the public folder
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
  await page.setViewport({ width: 1548, height: 1030 });

  const targetUrl = `http://localhost:${PORT}/`;
  console.log(`🌐 Loading page: ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'networkidle0' });

  // Wait for card to exist and give rendering time
  await page.waitForSelector('.card');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Force white background inline
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
    await cardElement.screenshot({
      path: path.join(__dirname, 'public', 'latest.png'),
      omitBackground: false,
    });
    console.log('✅ Snapshot complete');
    res.send('✅ Snapshot complete');
  } else {
    console.error('❌ .card element not found');
    res.status(500).send('❌ Failed to find .card element for snapshot');
  }

  await browser.close();
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
