const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    
    await page.goto('http://localhost:49764/destinations');
    await page.waitForLoadState('networkidle');
    await new Promise(r => setTimeout(r, 1000));
    
    // Find the search input and type "swiss"
    const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]').first();
    await searchInput.fill('swiss');
    await new Promise(r => setTimeout(r, 1000));
    
    await page.screenshot({ path: 'c:/Users/sakib/source/repos/MyTravel/docs/screenshots/destinations-search.png' });
    console.log('Captured: destinations-search.png');
    
    await browser.close();
    console.log('Done!');
})();
