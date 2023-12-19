const puppeteer = require('puppeteer');
const fs = require('fs');
const timers = require('node:timers/promises');

const proxyUrls = [
  "3.71.110.183:8888",
  "origin"
];

async function browserWithProxy50Lines(lines, proxyUrl = proxyUrls[0]) {
  const browser = await puppeteer.launch({
    headless: false,
    ...(proxyUrl === 'origin' ? {} : {
      args: [`--proxy-server=${proxyUrl}`]
    })
  });

  for (let i = 0; i < lines.length; i++) {
    const endChar = lines[i].trim().slice(-1);
    const startText = lines[i].trim().replace(/\./g, ',');
    const text = startText.slice(0, -1) + endChar;
    await run(browser, text);
  }

  await browser.close();
}

async function run(browser, text) {
  const page = await browser.newPage();

  try {
    // define source and target language code
    let sourceLang = 'en', targetLang = 'mn';

    await page.goto(`https://translate.google.com/#view=home&op=translate&sl=${sourceLang}&tl=${targetLang}&text=${text}&op=translate`, {
      waitUntil: 'domcontentloaded'
    });

    const isButton = await page.evaluate(() => {
      const button = document.querySelector('button[aria-label="Accept all"]');
      if (button) {
        return true;
      }
      return false;
    });

    isButton && await page.click('button[aria-label="Accept all"]')

    isButton && await page.goto(`https://translate.google.com/#view=home&op=translate&sl=${sourceLang}&tl=${targetLang}&text=${text}&op=translate`, {
      waitUntil: 'domcontentloaded'
    });

    await timers.setTimeout(5000);
    const transResult = await page.$$('span[lang="mn"]');
    const fullTitle = await transResult[0]?.$$eval('span[lang="mn"]', spans => spans.map(span => span.textContent)) || [];
    const title = fullTitle[0] || "Not found";

    fs.appendFileSync('4000mn.txt', title + '\n');
    await page.close();
    await timers.setTimeout(1000);
  } catch (error) {
    fs.appendFileSync('4000mn.txt', "Not Found" + '\n');
    await page.close();
    await timers.setTimeout(1000);
  }

  // remove the first line from the file
  const data = fs.readFileSync('4000en.txt').toString().split('\n');
  data.shift();
  const newText = data.join('\n');
  fs.writeFileSync('4000en.txt', newText);
}

async function main() {
  const file = fs.readFileSync('4000en.txt');
  const lines = file.toString().split('\n');

  // loop 50 lines at a time
  let proxyUrl = proxyUrls[1];
  for (let i = 0; i < lines.length; i += 50) {
    let newProxyUrl = proxyUrls.filter(p => p !== proxyUrl)[Math.floor(Math.random() * proxyUrls.length)];
    proxyUrl = newProxyUrl;
    await browserWithProxy50Lines(lines.slice(i, i + 50), newProxyUrl);
  }
}

main();
