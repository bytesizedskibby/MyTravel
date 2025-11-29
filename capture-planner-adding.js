const { chromium } = require('playwright');

const TEST_USER = { email: 'john.doe@example.com', password: 'Test123!' };

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    
    // Login first (planner requires authentication)
    await page.goto('http://localhost:49764/login');
    await page.waitForLoadState('networkidle');
    await new Promise(r => setTimeout(r, 500));
    
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await new Promise(r => setTimeout(r, 1000));
    
    // Navigate to planner
    await page.goto('http://localhost:49764/planner');
    await page.waitForLoadState('networkidle');
    await new Promise(r => setTimeout(r, 1000));
    
    // Click the "Add Activity" button to open the dialog
    const addButton = page.locator('button:has-text("Add Activity")').first();
    await addButton.click();
    await new Promise(r => setTimeout(r, 500));
    
    // Take screenshot with dialog open
    await page.screenshot({ path: 'c:/Users/sakib/source/repos/MyTravel/docs/screenshots/planner-adding.png' });
    console.log('Captured: planner-adding.png');
    
    await browser.close();
    console.log('Done!');
})();
