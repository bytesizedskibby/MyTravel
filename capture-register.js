const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    
    // First capture login for reference
    await page.goto('http://localhost:49764/login');
    await page.waitForLoadState('networkidle');
    await new Promise(r => setTimeout(r, 1000));
    
    // Capture login screenshot
    await page.screenshot({ path: 'c:/Users/sakib/source/repos/MyTravel/docs/screenshots/auth-login.png' });
    console.log('Captured: auth-login.png');
    
    // Now click the Sign Up tab (same page, same position)
    const signUpTab = page.locator('button[role="tab"]:has-text("Sign Up")');
    console.log('Sign Up tab visible:', await signUpTab.isVisible());
    await signUpTab.click();
    await new Promise(r => setTimeout(r, 500));
    
    // Capture register screenshot (same page position)
    await page.screenshot({ path: 'c:/Users/sakib/source/repos/MyTravel/docs/screenshots/auth-register.png' });
    console.log('Captured: auth-register.png');
    
    await browser.close();
    console.log('Done!');
})();
