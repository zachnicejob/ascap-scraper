const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const fs = require('fs');

// Replace '' with the URL you want to scrape
const targetURL = '';
// If URL redirects to writer search page
const writerHref = `a[href="${targetURL.substring(31)}"]`;


(async () => {

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async function pauseExecution() {
    console.log('Starting pause...');
    await delay(1000); // Pause for 5 seconds
    console.log('1 second has passed.');
  }
  // Launch a new browser session
  // const browser = await puppeteer.launch({headless: false});
  const browser = await puppeteer.launch({headless: false});

  const page = await browser.newPage();
 
  // Set a common User-Agent to avoid being blocked by the website
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
  // Go to the webpage
  await page.goto(targetURL);
  
  // Wait for the first modal's button to be clickable
  await page.waitForSelector('iframe[title="TrustArc Cookie Consent Manager"]')
  
  // Access the iframe element.
  const elementHandle = await page.$('iframe[title="TrustArc Cookie Consent Manager"]');

  // Get the content frame of the iframe.
  const frame = await elementHandle.contentFrame();

  // Wait for the anchor element to be available in the iframe and click it.
  await frame.waitForSelector('.footer', { visisble: true});
  await pauseExecution();
  await frame.click('.call');

  // Repeat for the second and third modals
  await pauseExecution();
  await page.waitForSelector('.c-btn.c-btn--size-lg', { visible: true });
  await page.click('.c-btn.c-btn--size-lg ');

  await pauseExecution();
  await page.waitForSelector('button.c-btn.c-btn--basic', { visible: true }, {timeout: 3000});
  await page.click('.c-btn.c-btn--basic');

  await pauseExecution();
  await page.waitForSelector('a[href="#/ace/writer/673034161/LARKIN%20CHRISTOPHER%20JAMES"]', { visible: true }, {timeout: 3000});
  await page.click('a[href="#/ace/writer/673034161/LARKIN%20CHRISTOPHER%20JAMES"]');

  // Wait for the specific elements to be loaded
  await page.waitForSelector('.c-card.u-spacing-outside-bottom-lg.is-collapsed');

  // Extract data from the page
  // Adjust the selector to match the content you're interested in
  const data = await page.evaluate(() => {
    const items = [];
    // console.log(document)
    document.querySelectorAll('.c-card.u-spacing-outside-bottom-lg.is-collapsed').forEach((card) => {
      title = card.querySelector('.t-font-heading_xl.h-color-b700').innerText.trim();
      workId = card.querySelectorAll('.h-color-b600')[1].innerText.trim();
      console.log(workId)
      items.push({ title: title, workId: workId })
    });

    return items;
  });

  console.log(data); // Log extracted data

  await browser.close(); // Close the browser session
  // Now, create an Excel file with the scraped data
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Scraped Data');

  // Define columns in the worksheet
  worksheet.columns = [
  { header: 'Title', key: 'title', width: 30 },
  { header: 'Work ID', key: 'workId', width: 30}
  // Add or adjust columns as necessary
  ];

  // Add rows to the worksheet from the scraped data
  data.forEach(item => {
  worksheet.addRow(item);
  });

  // Write the workbook to a file
  await workbook.xlsx.writeFile('ScrapedData.xlsx');
  console.log('Data has been exported to Excel successfully.');

  function saveTitlesAsTxt(array, filename) {
    // Convert the array of objects into a string with titles separated by commas
    const titlesString = array.map(obj => `${obj.title} (Work ID: ${obj.workId})`).join(", ");
    // const titlesString = array.map(obj => obj.title).join(", ");

    // Write the string to a file
    fs.writeFile(filename, titlesString, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
  }

  saveTitlesAsTxt(data, 'ascapTrackInfo.txt');
})();
