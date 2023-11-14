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
      await page.goto(domain, { timeout: 30000 });
  
      const products = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('#maincontent'));
        return links.map(link => {
          const titleElement = link.querySelector('h1[itemprop="name"]');
          const priceElement = link.querySelector('span[itemprop="price"]');
          const descriptionElement = link.querySelector('.nb3[data-testid="product-description-content"] > div') ? link.querySelector('.nb3[data-testid="product-description-content"] > div:first-of-type').textContent : '';
  
          const aboutElementContent = link.getElementsByClassName('expand-collapse-section')[1] ? link.getElementsByClassName('expand-collapse-section')[1].querySelector('.mb3 ul').innerHTML : '';
          const aboutElementCutTo = aboutElementContent.indexOf('<br>');
          const aboutElement = aboutElementContent.slice(0, aboutElementCutTo);
  
          const attributeElementContent3 = link.getElementsByClassName('expand-collapse-section')[2].innerHTML;
          const attributeElementContent = link.querySelector('.dangerous-html.mb3') ? link.querySelector('.dangerous-html.mb3').innerHTML : '';
          const attributeElementLength = aboutElementContent.length;
          const attributeElementCutTo = aboutElementContent.indexOf('Specification');
          const attributeElement = attributeElementContent3.slice(attributeElementCutTo+22, attributeElementLength);
          
          const regex = /(<([^>]+)>)/ig;
          const attributeElement2 = attributeElement.replace(regex, ";");
          
          //const descriptionElement = link.querySelector('#productDescription p') ? `<h2 class="default"> Product Description  </h2> ${link.querySelector('#productDescription p').textContent}` : (link.querySelector('.aplus-v2.desktop.celwidget') ? link.querySelector('.aplus-v2.desktop.celwidget').outerHTML : '');
          // const productInformationElement = link.querySelector('#prodDetails .a-column.a-span6') ? `<h2>Product information </h2> ${link.querySelector('#prodDetails .a-column.a-span6').innerHTML.replace('<h1 class="a-size-medium a-spacing-small">Technical Details</h1>', '')}` : (link.querySelector('#detailBullets_feature_div ul') ? `<h2>Product information </h2> ${link.querySelector('#detailBullets_feature_div ul').outerHTML}` : '');
          // const attributeElement = link.querySelector('div#productOverview_feature_div table');
  
          return {
            title: titleElement ? titleElement.textContent.trim() : '',
            price: priceElement ? priceElement.textContent : '',
            productInformation: aboutElement,
            //productDescription: aboutElement,
            productDescription: descriptionElement,
            attributes: attributeElement2,
            //attributes: attributeElement.split(/\s{2,}/),
          };
          
        }).slice(0, 5);
        
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
        { id: 'title', title: 'Title' },
        { id: 'price', title: 'Price' },
        { id: 'productDescription', title: 'Product Description' },
        { id: 'productInformation', title: 'Product Information' },
        ...attArrs,
        //{ id: 'attributes', title: 'Attribute' },
      ],
    });
    data.map(item => {
        if(item.attributes != ''){
        item.attributes.map(attr => console.log(attr));
      }
    });
  
    // const transformedData = data.map(item => {
    //   if (item.attributes !== undefined && item.attributes !== '' && item.attributes.length > 0) {
    //     const attributesArray = [];
    //     for (let i = 0; i < item.attributes.length; i ++) {
    //       // const key = item.attributes[i].trim();
    //       // const value = item.attributes[i + 1].trim();
    //       // attributesArray.push({ [key]: value });
    //       //item[key] = value;
    //       attributesArray.push(item.attributes[i].trim());
    //     }
    //     delete item.attributes;
    //     const attributesObj = {};
    //     const attributesArrayLength = attributesArray.length / 2;
    //     for (let i = 0; i < attributesArrayLength; i ++) {
    //       let objKey = `attributesN${i+1}`;
    //       let objKey2 = `attributesV${i+1}`;
    //       let objValue = attributesArray[i*2];
    //       let objValue2 = attributesArray[(i*2)+1];
    //       attributesObj[objKey] = objValue;
    //       attributesObj[objKey2] = objValue2;
    //     }
    //     console.log(attributesObj);
    //     return {
    //       ...item,
    //       ...attributesObj,
    //     };
    //   } else {
    //     return item;
    //   }
    // }); 
  
  
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

async function saveToCSV(data) {
  let attArrs = []
  for (let i= 1; i <= 8; i++){
    attArrs.push({ id: `attributesN${i}`, title: `Attribute ${i} name` }, { id: `attributesV${i}`, title: `Attribute ${i} value(s)` },)
  }
  const csvWriter = createObjectCsvWriter({
    path: 'productDataAmazon-A.csv',
    header: [
      { id: 'title', title: 'Title' },
      { id: 'price', title: 'Price' },
      { id: 'productDescription', title: 'Product Description' },
      { id: 'productInformation', title: 'Product Information' },
      ...attArrs,
      //{ id: 'attributes', title: 'Attribute' },
    ],
  });
  // data.map(item => {
  //     if(item.attributes != ''){
  //     item.attributes.map(attr => console.log(attr));
  //   }
  // });

  const transformedData = data.map(item => {
    if (item.attributes !== undefined && item.attributes !== '' && item.attributes.length > 0) {
      const attributesArray = [];
      for (let i = 0; i < item.attributes.length; i ++) {
        // const key = item.attributes[i].trim();
        // const value = item.attributes[i + 1].trim();
        // attributesArray.push({ [key]: value });
        //item[key] = value;
        attributesArray.push(item.attributes[i].trim());
      }
      delete item.attributes;
      const attributesObj = {};
      const attributesArrayLength = attributesArray.length / 2;
      for (let i = 0; i < attributesArrayLength; i ++) {
        let objKey = `attributesN${i+1}`;
        let objKey2 = `attributesV${i+1}`;
        let objValue = attributesArray[i*2];
        let objValue2 = attributesArray[(i*2)+1];
        attributesObj[objKey] = objValue;
        attributesObj[objKey2] = objValue2;
      }
      console.log(attributesObj);
      return {
        ...item,
        ...attributesObj,
      };
    } else {
      return item;
    }
  }); 


  await csvWriter.writeRecords(transformedData);
  console.log('CSV file saved successfully.');
}

fs.readFile('./product20231021.txt', 'utf-8', async (err, data) => {
  if (err) {
    console.log(err);
  } else {
    const listUrls = data.split('\n');
    await domainHandover(listUrls);
    await saveToCSV(result);
  }
});
