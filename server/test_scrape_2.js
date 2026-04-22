const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeCommodityOnline() {
    try {
        console.log('Fetching from CommodityOnline...');
        const url = 'https://www.commodityonline.com/mandiprices/wheat';

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        console.log('Fetch success. Length:', data.length);
        const $ = cheerio.load(data);

        // Try to find a table or price list
        const rows = $('table tr');
        console.log('Table rows found:', rows.length);

        if (rows.length > 0) {
            console.log('First row text:', $(rows[0]).text().trim());
            console.log('Second row text:', $(rows[1]).text().trim());
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

scrapeCommodityOnline();
