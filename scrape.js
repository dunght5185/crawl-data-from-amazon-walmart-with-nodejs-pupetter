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
        const aboutElement = link.querySelector('#feature-bullets ul') ? `<h1 class="a-size-base-plus a-text-bold"> About this item </h1> ${link.querySelector('#feature-bullets ul').outerHTML}` : '';
        //const descriptionElement = link.querySelector('#productDescription p') ? `<h2 class="default"> Product Description  </h2> ${link.querySelector('#productDescription p').textContent}` : (link.querySelector('.aplus-v2.desktop.celwidget') ? link.querySelector('.aplus-v2.desktop.celwidget').outerHTML : '');
        const productInformationElement = link.querySelector('#prodDetails .a-column.a-span6') ? `<h2>Product information </h2> ${link.querySelector('#prodDetails .a-column.a-span6').innerHTML.replace('<h1 class="a-size-medium a-spacing-small">Technical Details</h1>', '')}` : (link.querySelector('#detailBullets_feature_div ul') ? `<h2>Product information </h2> ${link.querySelector('#detailBullets_feature_div ul').outerHTML}` : '');
        const attributeElement = link.querySelector('div#productOverview_feature_div table');

        return {
          title: titleElement ? titleElement.textContent.trim() : '',
          price: priceElement ? priceElement.textContent : '',
          productInformation: productInformationElement,
          productDescription: aboutElement,
          attributes: attributeElement ? attributeElement.textContent.trim().split(/\s{2,}/) : '',
        };
      }).slice(0, 5);
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
      await page.goto(domain, { timeout: 60000 });
  
      const products = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('#maincontent'));
        return links.map(link => {
          const titleElement = link.querySelector('h1[itemprop="name"]');
          const priceElement = link.querySelector('span[itemprop="price"]');
          const aboutThisItem = link.querySelector('section[data-testid="product-description"] section[aria-describedby="delivery-instructions"] div[data-testid="product-description-content"]');
          const productSpecifications = link.querySelector('section.expand-collapse-section.nl3.nr3[aria-describedby="delivery-instructions"] div.nt1');
          const brand = link.querySelector('a.bg-transparent.lh-solid.underline.inline-button.mid-gray.pointer');
          const gtin = '';
          const category = link.querySelector('nav[aria-label="breadcrumb"]');
  
          return {
            titleElement: titleElement ? titleElement.textContent.trim() : '',
            priceElement: priceElement ? priceElement.textContent.trim() : '',
            aboutThisItem: aboutThisItem ? aboutThisItem.innerHTML : '',
            productSpecifications: productSpecifications ? productSpecifications.innerHTML : '',
            brand: brand ? brand.textContent.trim() : '',
            gtin: gtin,
            category: category ? category.textContent.trim() : '',
          };
          
        }).slice(0, 7);
        
      });
  
      console.log(products);
      result.push(...products);
      await browser.close();
    } catch (error) {
      console.log(error);
    }
}
  
async function saveToCSV(data) {
    let attArrs = []
    for (let i= 1; i <= 8; i++){
      attArrs.push({ id: `attributesN${i}`, title: `Attribute ${i} name` }, { id: `attributesV${i}`, title: `Attribute ${i} value(s)` },)
    }
    const csvWriter = createObjectCsvWriter({
      path: 'productDataWaltmart.csv',
      header: [
        { id: 'titleElement', title: 'Title' },
        { id: 'priceElement', title: 'Price' },
        { id: 'aboutThisItem', title: 'About This Item' },
        { id: 'productSpecifications', title: 'Product Specifications' },
        { id: 'brand', title: 'Brand' },
        { id: 'gtin', title: 'UPC' },
        { id: 'category', title: 'Category' },
      ],
    });
  
    await csvWriter.writeRecords(data);
    console.log('CSV file saved successfully.');
}

function domainHandover(domains) {
  return new Promise(async (resolve, reject) => {
    for (let domain of domains) {
        let isAmazon = domain.indexOf('amazon') > -1;
        let isWalmart = domain.indexOf('walmart') > -1;
      if (domain !== '' && isAmazon) {
        await getDataAmazon(domain);
      } else if (domain !== '' && isWalmart) {
        await getDataWalMart(domain);
      }
    }
    resolve();
  });
}

fs.readFile('./input.txt', 'utf-8', async (err, data) => {
  if (err) {
    console.log(err);
  } else {
    const listUrls = data.split('\n');
    await domainHandover(listUrls);
    await saveToCSV(result);
  }
});
