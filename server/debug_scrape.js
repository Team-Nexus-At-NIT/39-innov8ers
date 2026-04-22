const axios = require('axios');
const cheerio = require('cheerio');

async function debugScraper() {
    try {
        console.log('Fetching from CommodityOnline...');
        const url = 'https://www.commodityonline.com/mandiprices/wheat';

        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const $ = cheerio.load(data);

        // Print first 3 rows in detail
        $('table tr').each((i, el) => {
            if (i > 3) return; // Only first 3

            console.log(`\nRow ${i}:`);
            const tds = $(el).find('td');
            tds.each((j, td) => {
                console.log(`  Col ${j}: ${$(td).text().trim()}`);
            });
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugScraper();
