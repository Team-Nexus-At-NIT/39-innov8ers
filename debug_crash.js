const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('PAGE ERROR:', msg.text());
        }
    });

    page.on('pageerror', err => {
        console.log('UNCAUGHT PAGE ERROR:', err.message);
    });

    try {
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
        console.log("Page loaded. If there's a React crash, it should be logged above.");
    } catch (e) {
        console.error("Puppeteer navigation error:", e);
    }
    await browser.close();
})();
