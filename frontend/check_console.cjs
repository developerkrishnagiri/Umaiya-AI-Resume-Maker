const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));

    // Catch uncaught exceptions in the page
    page.on('error', err => console.log('PAGE_CRASH:', err.message));

    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

    await page.evaluate(() => {
        localStorage.setItem('auth-storage', JSON.stringify({
            state: {
                user: { firstName: 'Tester', lastName: 'User', role: 'SEEKER', planType: 'FREE' },
                isAuthenticated: true
            },
            version: 0
        }));
    });

    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });

    const rootHtml = await page.evaluate(() => document.getElementById('root').innerHTML);
    console.log("ROOT_HTML_LENGTH:", rootHtml.length);
    if (rootHtml.length < 500) {
        console.log("ROOT_HTML_DUMP:", rootHtml);
    }

    await browser.close();
})();
