const puppeteer = require('puppeteer');

module.exports.generatePdf = async (req, id) => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();

  await page.setContent(`${req}`);
  const pdfOptions = {
    format: 'A4',
    printBackground: true,
  }
  await page.waitForSelector('.logo-container img')
  await page.pdf({ path: `pdf/invoice${id}.pdf` });

  console.log(`PDF saved as invoice${id}.pdf`);

  await browser.close();
};