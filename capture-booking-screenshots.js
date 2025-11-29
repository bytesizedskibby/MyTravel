const { chromium } = require('playwright');

const TEST_USER = { email: 'john.doe@example.com', password: 'Test123!' };
const SCREENSHOTS_DIR = 'c:/Users/sakib/source/repos/MyTravel/docs/screenshots';

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    
    // Helper to verify and capture
    async function captureWithVerification(name, verifications) {
        console.log(`\n--- Capturing: ${name} ---`);
        for (const v of verifications) {
            const visible = await page.locator(v.selector).first().isVisible().catch(() => false);
            console.log(`  ${v.name}: ${visible ? '✓' : '✗'}`);
        }
        await page.screenshot({ path: `${SCREENSHOTS_DIR}/${name}.png` });
        console.log(`  Saved: ${name}.png`);
    }

    // Login first
    console.log('Logging in...');
    await page.goto('http://localhost:49764/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await new Promise(r => setTimeout(r, 1500));
    console.log('Logged in!');

    // 1. BOOKING FORM - Navigate to /booking
    await page.goto('http://localhost:49764/booking');
    await page.waitForLoadState('networkidle');
    await new Promise(r => setTimeout(r, 1000));
    
    await captureWithVerification('booking-form', [
        { name: 'Booking heading', selector: 'text=Ready for Adventure' },
        { name: 'Book Your Trip card', selector: 'text=Book Your Trip' },
        { name: 'Flights tab', selector: 'button[role="tab"]:has-text("Flights")' },
    ]);

    // 2. DATE SELECTION - Click on a date picker to open it
    const dateButton = page.locator('button:has-text("Pick a date")').first();
    if (await dateButton.isVisible().catch(() => false)) {
        await dateButton.click();
        await new Promise(r => setTimeout(r, 500));
    }
    
    await captureWithVerification('booking-dates', [
        { name: 'Calendar visible', selector: '[role="grid"], .rdp, [data-radix-popper-content-wrapper]' },
    ]);
    
    // Close calendar by pressing Escape
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));

    // 3. Search for flights and show results
    await page.goto('http://localhost:49764/booking?destination=Paris');
    await page.waitForLoadState('networkidle');
    await new Promise(r => setTimeout(r, 1000));
    
    // Click Flights tab
    await page.locator('button[role="tab"]:has-text("Flights")').click();
    await new Promise(r => setTimeout(r, 500));
    
    console.log('\nSearching for flights...');
    const searchFlightsBtn = page.locator('button:has-text("Search Flights")');
    await searchFlightsBtn.click();
    await new Promise(r => setTimeout(r, 1500));
    
    // Verify results appeared
    const resultsVisible = await page.locator('text=Available Flights').isVisible().catch(() => false);
    console.log('  Flight results visible:', resultsVisible);
    
    // Select a flight - use evaluate to ensure click works
    const selectButtons = await page.locator('button:has-text("Select")').all();
    console.log('  Number of Select buttons:', selectButtons.length);
    
    if (selectButtons.length > 0) {
        console.log('  Clicking first Select button...');
        await page.evaluate(() => {
            const selectBtns = document.querySelectorAll('button');
            for (const btn of selectBtns) {
                if (btn.textContent === 'Select') {
                    btn.click();
                    break;
                }
            }
        });
        await new Promise(r => setTimeout(r, 2000));
    }
    
    // Check cart badge now
    const cartBadgeAfterFlight = await page.locator('button span.bg-primary').textContent().catch(() => '0');
    console.log('  Cart items after flight selection:', cartBadgeAfterFlight);
    
    // Search hotels
    console.log('Searching for hotels...');
    const searchHotelsBtn = page.locator('button:has-text("Search Hotels")');
    if (await searchHotelsBtn.isVisible().catch(() => false)) {
        await searchHotelsBtn.click();
        await new Promise(r => setTimeout(r, 1500));
        
        // Select hotel
        await page.evaluate(() => {
            const selectBtns = document.querySelectorAll('button');
            for (const btn of selectBtns) {
                if (btn.textContent === 'Select') {
                    btn.click();
                    break;
                }
            }
        });
        await new Promise(r => setTimeout(r, 2000));
    }
    
    // Check cart badge
    const cartBadgeAfterHotel = await page.locator('button span.bg-primary').textContent().catch(() => '0');
    console.log('  Cart items after hotel selection:', cartBadgeAfterHotel);
    
    // Search tours
    console.log('Searching for tours...');
    const searchToursBtn = page.locator('button:has-text("Find Experiences")');
    if (await searchToursBtn.isVisible().catch(() => false)) {
        await searchToursBtn.click();
        await new Promise(r => setTimeout(r, 1500));
        
        // Select tour
        await page.evaluate(() => {
            const selectBtns = document.querySelectorAll('button');
            for (const btn of selectBtns) {
                if (btn.textContent === 'Select') {
                    btn.click();
                    break;
                }
            }
        });
        await new Promise(r => setTimeout(r, 2000));
    }
    
    // Final cart check
    const cartBadgeFinal = await page.locator('button span.bg-primary').textContent().catch(() => '0');
    console.log('  Final cart items:', cartBadgeFinal);

    // 4. CART SUMMARY - Open the cart sheet
    console.log('\nOpening cart...');
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 500));
    
    // Click cart button via JS
    await page.evaluate(() => {
        const cartBtn = document.querySelector('button[data-state="closed"][aria-haspopup="dialog"]');
        if (cartBtn) cartBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));
    
    const sheetOpen = await page.locator('text=Your Trip Cart').isVisible().catch(() => false);
    console.log('  Sheet opened:', sheetOpen);
    
    await captureWithVerification('checkout-cart', [
        { name: 'Cart sheet open', selector: 'text=Your Trip Cart' },
        { name: 'Cart items', selector: '.border.rounded-lg' },
    ]);
    
    // Check if we can checkout
    const checkoutEnabled = await page.locator('button:has-text("Checkout & Pay")').isEnabled().catch(() => false);
    console.log('  Checkout button enabled:', checkoutEnabled);
    
    if (checkoutEnabled) {
        await page.locator('button:has-text("Checkout & Pay")').click();
        await page.waitForLoadState('networkidle');
        await new Promise(r => setTimeout(r, 1000));
    } else {
        // Close sheet and add items manually to localStorage, then reload
        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 300));
        
        console.log('  Adding demo cart items via localStorage...');
        await page.evaluate(() => {
            const cartItems = [
                { id: '1', type: 'flight', title: 'Air France to Paris', details: 'New York - Paris | 10:00 AM', price: 650, image: '' },
                { id: '2', type: 'hotel', title: 'Le Marais Boutique Hotel', details: 'Paris, France | 4 Stars', price: 180, image: '' },
                { id: '3', type: 'tour', title: 'Eiffel Tower Skip-the-Line', details: '3 hours | Cultural', price: 85, image: '' },
            ];
            localStorage.setItem('mytravel-cart', JSON.stringify(cartItems));
        });
        
        // Reload and go to checkout
        await page.reload();
        await page.waitForLoadState('networkidle');
        await new Promise(r => setTimeout(r, 1000));
        
        // Open cart again and capture with items
        await page.evaluate(() => {
            const cartBtn = document.querySelector('button[data-state="closed"][aria-haspopup="dialog"]');
            if (cartBtn) cartBtn.click();
        });
        await new Promise(r => setTimeout(r, 800));
        
        await captureWithVerification('checkout-cart', [
            { name: 'Cart sheet open', selector: 'text=Your Trip Cart' },
            { name: 'Cart items', selector: 'text=Air France' },
        ]);
        
        // Now checkout should work
        const checkoutBtn = page.locator('button:has-text("Checkout & Pay")');
        if (await checkoutBtn.isEnabled().catch(() => false)) {
            await checkoutBtn.click();
            await page.waitForLoadState('networkidle');
            await new Promise(r => setTimeout(r, 1000));
        } else {
            await page.goto('http://localhost:49764/checkout');
            await page.waitForLoadState('networkidle');
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    // 5. CHECKOUT FORM
    await captureWithVerification('checkout-form', [
        { name: 'Checkout heading', selector: 'h1:has-text("Checkout")' },
        { name: 'Payment Details', selector: 'text=Payment Details' },
        { name: 'Order Summary', selector: 'text=Order Summary' },
    ]);

    // 6. PAYMENT - Fill in card details
    const cardInput = page.locator('#card');
    if (await cardInput.isVisible().catch(() => false)) {
        await cardInput.fill('4242 4242 4242 4242');
        await page.locator('#expiry').fill('12/25');
        await page.locator('#cvc').fill('123');
        await new Promise(r => setTimeout(r, 300));
    }
    
    await captureWithVerification('checkout-payment', [
        { name: 'Card number filled', selector: '#card' },
        { name: 'Pay button', selector: 'button:has-text("Pay $")' },
    ]);

    // 7. BOOKING CONFIRMATION - Submit payment
    const payButton = page.locator('button:has-text("Pay $")').first();
    if (await payButton.isVisible().catch(() => false) && await payButton.isEnabled().catch(() => false)) {
        await payButton.click();
        await new Promise(r => setTimeout(r, 2500));
    }
    
    await captureWithVerification('booking-confirmation', [
        { name: 'Booking Confirmed text', selector: 'text=Booking Confirmed' },
        { name: 'Success icon', selector: '.bg-green-50' },
        { name: 'Booking Reference', selector: 'text=Booking Reference' },
    ]);

    await browser.close();
    console.log('\n=== All booking screenshots captured! ===');
})();
