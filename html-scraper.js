const axios = require('axios');
const cheerio = require('cheerio');
const ExcelJS = require('exceljs');

// Function to fetch HTML from a webpage
async function fetchHTML(url) {
  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    },
  });
  return data;
}

// Function to extract specific data from HTML
function extractData(html) {
    const $ = cheerio.load(html);
    const data = [];
  
    // Adjust the selector to match your target elements
    $('h2').each((index, element) => {
      const text = $(element).text().trim(); // Extracts text content and trims any extra whitespace
      console.log(text);
      data.push({title: text});
    });

    console.log('data***', data)
  
    return data;
  }

// Function to export data to an Excel file
async function exportToExcel(data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Scraped Data');

  // Define columns
  worksheet.columns = [
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Link', key: 'link', width: 50 },
  ];

  // Add rows
  data.forEach(item => {
    worksheet.addRow(item);
  });

  // Write to a file
  await workbook.xlsx.writeFile('ScrapedData.xlsx');
}

// Main function to orchestrate the scraping and exporting
async function scrapeAndExport(url) {
  try {
    const html = await fetchHTML(url);
    console.log(html.substring(0, 500)); // Log the first 500 characters of the HTML
    const data = extractData(html);
    await exportToExcel(data);
    console.log('Data has been exported to Excel successfully.');
  } catch (error) {
    console.error('Error during scraping and exporting:', error);
  }
}

// Replace '' with the URL you want to scrape
scrapeAndExport('');
