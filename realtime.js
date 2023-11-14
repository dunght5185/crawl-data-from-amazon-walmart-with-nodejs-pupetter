const puppeteer = require('puppeteer');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');

let result = [];

async function getDataAmazon(domain) {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(domain, { timeout: 30000 });

    const products = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('#dp-container'));
      return links.map(link => {
        const titleElement = link.querySelector('#productTitle');
        const priceElement = link.querySelector('span[data-a-color="price"] span:nth-child(2)');
        const isInStock = priceElement ? priceElement.textContent.trim() != '' ? 'In Stock' : 'Out Stock' : 'Out Stock';

        return {
          title: titleElement ? titleElement.textContent.trim() : '',
          price: priceElement ? priceElement.textContent : '',
          isInStock: isInStock,
        };
      }).slice(0, 3);
    });
    result.push(...products);
    console.log(products);
    await browser.close();
  } catch (error) {
    console.log(error);
  }
}

async function getDataWalMart(domain) {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(domain, { timeout: 30000 });

    const products = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('#maincontent'));
      return links.map(link => {
        const titleElement = link.querySelector('h1[itemprop="name"]');
        const priceElement = link.querySelector('span[itemprop="price"]');
        const isInStock = priceElement ? priceElement.textContent.trim() != '' ? 'In Stock' : 'Out Stock' : 'Out Stock';
        // const category = link.querySelector('nav[aria-label="breadcrumb"]');

        return {
          titleElement: titleElement ? titleElement.textContent.trim() : '',
          priceElement: priceElement ? priceElement.textContent.trim() : '',
          isInStock: isInStock,
          // category: category ? category.textContent.trim() : '',
        };
        
      }).slice(0, 3);
      
    });

    console.log(products);
    result.push(...products);
    await browser.close();
  } catch (error) {
    console.log(error);
  }
}
  
async function saveToCSV(data) {
  const csvWriter = createObjectCsvWriter({
    path: 'productDataWaltmart-B.csv',
    header: [
      { id: 'titleElement', title: 'Title' },
      { id: 'priceElement', title: 'Price' },
      { id: 'isInStock', title: 'Is In Stock' },
    ],
  });

  await csvWriter.writeRecords(data);
  console.log('CSV file saved successfully.');
}

async function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function domainHandover(domains) {
  return new Promise(async (resolve, reject) => {
    for (let domain of domains) {
        let isAmazon = domain.indexOf('amazon') > -1;
        let isWalmart = domain.indexOf('walmart') > -1;
        let domainT = domain.trim();
      if (domainT !== '' && isAmazon) {
        // Continue with the rest of your code
        console.log('Go to get Amazon data process >> ');
        
        await getDataAmazon(domainT);
        // Wait for 3 seconds
        await delay(3000); // 3000 milliseconds = 3 seconds

        console.log('Finished get Amazon data process! ');
        console.log('=====================================================');
      } else if (domainT !== '' && isWalmart) {
        // Continue with the rest of your code
        console.log('Go to get Walmart data process >> ');

        await getDataWalMart(domainT);
        // Wait for 3 seconds
        await delay(3000); // 3000 milliseconds = 3 seconds

        console.log('Finished get Walmart data process! ');
        console.log('=====================================================');
      }
    }
    resolve();
  });
}

fs.readFile('./test.txt', 'utf-8', async (err, data) => {
  if (err) {
    console.log(err);
  } else {
    const listUrls = data.split('\n');
    await domainHandover(listUrls);
    await saveToCSV(result);
  }
});
