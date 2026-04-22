const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeAgmarknet() {
    try {
        console.log('Fetching data from Agmarknet...');
        // Using a more specific URL that usually has content
        const url = 'https://agmarknet.gov.in/';

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        console.log('Page fetched. Length:', data.length);
        console.log('Body:', data); // Printing body to see what we got

    } catch (error) {
        console.error('Error scraping:', error.message);
    }
}

scrapeAgmarknet();
