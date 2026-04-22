const axios = require('axios');

async function testOGDApi() {
    try {
        console.log('Testing OGD API...');
        // Common Resource ID for "Current Daily Price of Various Commodities"
        const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
        // User provided key
        const apiKey = '579b464db66ec23bdd000001635065555d1a40e26e0ccb5aa421b244';

        const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=5`;

        console.log(`Requesting: ${url}`);
        const { data } = await axios.get(url);

        console.log('Response Status:', data.status || 'OK');
        console.log('Records:', data.records ? data.records.length : 0);
        if (data.records && data.records.length > 0) {
            console.log('Sample Record:', data.records[0]);
        } else {
            console.log('Full Response:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('API Error:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

testOGDApi();
