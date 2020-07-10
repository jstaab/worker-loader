import path from 'path';

import getPort from 'get-port';
import express from 'express';
import puppeteer from 'puppeteer';

export default async function getResultFromBrowser(stats) {
  const assets = Object.entries(stats.compilation.assets);
  const app = express();
  const port = await getPort();
  const server = app.listen(port);

  for (const asset of assets) {
    const [route] = asset;
    const existsAt = path.resolve(stats.compilation.outputOptions.path, route);

    if (route === 'index.html') {
      app.get('/', (req, res) => {
        res.sendFile(existsAt);
      });
    } else {
      app.get(`/${route}`, (req, res) => {
        res.sendFile(existsAt);
      });
    }
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.waitForSelector('button');
  await page.click('button');
  await page.waitForSelector('#result');

  const addedFromWorkerText = await page.$eval(
    '#result',
    (el) => el.textContent
  );

  browser.close();
  server.close();

  return addedFromWorkerText;
}
