const puppeteer = require('puppeteer');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');

let result = [];
let inputFile = 'product-AAAAAA';
async function getData(domain) {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(domain, { timeout: 30000 });

    
    if (domain.includes("https://www.amazon.com/")) {
        console.log("==================================");
        console.log("------------- AMAZON -------------");
        const products = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('#dp-container'));
          return links.map(link => {
            const titleElement = link.querySelector('#productTitle');
            // const priceElement = link.querySelector('span.priceToPay');
            // const category = link.querySelector('#wayfinding-breadcrumbs_feature_div ul');
            // const brand = link.querySelector('div[data-testid="main-content-container"] section[data-pcss-show="true"] a');
            const aboutElement = link.querySelector('div#feature-bullets');
            const descriptionElement = link.querySelector('#productDescription p') ? `<h2 class="default"> Product Description  </h2> ${link.querySelector('#productDescription p').textContent}` : (link.querySelector('.aplus-v2.desktop.celwidget') ? link.querySelector('.aplus-v2.desktop.celwidget').outerHTML : '');

            const aboutElement2 = link.querySelector('#feature-bullets ul') ? `<h1 class="a-size-base-plus a-text-bold"> About this item </h1> ${link.querySelector('#feature-bullets ul').outerHTML}` : '';

            return {
              url: domain,
              title: titleElement ? titleElement.textContent.trim() : '',
            //   price: priceElement ? priceElement.textContent : '',
            //   productInformation: aboutElement ? aboutElement.outerHTML : "",
              productInformation: descriptionElement,
            //   brand: brand ? brand.textContent.trim() : '',
            //   category: category ? category.textContent.trim() : '',
            };
            
          }).slice(0, 3);
          
        });
    
        console.log(products);
        console.log(products.productInformation);
        
        result.push(...products);
        await browser.close();
    } else if(domain.includes("https://www.walmart.com/")) {
        console.log("==================================");
        console.log("------------- WALMART ------------");
        const products = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('#maincontent'));
          return links.map(link => {
            const titleElement = link.querySelector('h1[itemprop="name"]') != null ? link.querySelector('h1[id="main-title"]') : link.querySelector('h1[itemprop="name"]');
            // const priceElement = link.querySelector('span[itemprop="price"]');
            // const category = link.querySelector('nav[aria-label="breadcrumb"]');
            // const brand = link.querySelector('div[data-testid="main-content-container"] section[data-pcss-show="true"] a');
            const aboutElement = link.querySelector('div[data-testid="product-description"] div[data-testid="product-description"]');
            //let regexPattern = /<div class="w_LDl2 w_ISLy bn bg-transparent dark-gray pa0 sans-serif mb3 lh-copy">[\s\S]*?<\/div>/;
            return {
              url: domain,
              title: titleElement ? titleElement.textContent.trim() : '',
            //   price: priceElement ? priceElement.textContent : '',
            // productInformation: aboutElement ? aboutElement.innerHTML : "",
              productInformation: aboutElement ? aboutElement.innerHTML.replace(regexPattern,"") : "",
            //   brand: brand ? brand.textContent.trim() : '',
            //   category: category ? category.textContent.trim() : '',
            };
            
          }).slice(0, 3);
          
        });
    
        console.log(products);
        
        result.push(...products);
        await browser.close();
    } else {
        console.log("cái qq gì đây!???");
        await browser.close();
    }
  } catch (error) {
    console.log(error);
  }
}

function domainHandover(domains) {
  return new Promise(async (resolve, reject) => {
    for (let domain of domains) {
      if (domain !== '') {
        await getData(domain);
      }
    }
    resolve();
  });
}


async function saveToCSV(data) {
    
  const csvWriter = createObjectCsvWriter({
    path: 'output-'+inputFile+'.csv',
    header: [
      { id: 'url', title: 'Url' },
      { id: 'title', title: 'Title' },
      //{ id: 'price', title: 'Price' },
      { id: 'productInformation', title: 'About Content' },
      //{ id: 'detail', title: 'Product Detail' },
      //{ id: 'brand', title: 'Brand' },
      //{ id: 'category', title: 'Category' },
    ],
  });

  await csvWriter.writeRecords(data);
  console.log('CSV file saved successfully.');
}

fs.readFile('./'+inputFile+'.txt', 'utf-8', async (err, data) => {
  if (err) {
    console.log(err);
  } else {
    const listUrls = data.split('\n');
    await domainHandover(listUrls);
    await saveToCSV(result);
  }
});
