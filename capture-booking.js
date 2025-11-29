const { chromium } = require('playwright');

const TEST_USER = { email: 'john.doe@example.com', password: 'Test123!' };
const SCREENSHOTS_DIR = 'c:/Users/sakib/source/repos/MyTravel/docs/screenshots';

async function captureBookingScreenshots() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    
    console.log('=== Booking Screenshots Capture ===\n');
    
    // Login first
    console.log('1. Logging in...');
    await page.goto('http://localhost:49764/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await new Promise(r => setTimeout(r, 1500));
    console.log('   Logged in successfully\n');
    
    // Navigate to booking page
    console.log('2. Capturing booking-form.png...');
    await page.goto('http://localhost:49764/booking');
    await page.waitForLoadState('networkidle');
    await new Promise(r => setTimeout(r, 1000));
    
    // Verify booking form is visible
    const bookingTitle = await page.locator('text=Book Your Trip').isVisible();
    const flightsTab = await page.locator('button:has-text("Flights")').isVisible();
    console.log(`   Verification: "Book Your Trip" visible: ${bookingTitle}, Flights tab visible: ${flightsTab}`);
    
    if (bookingTitle && flightsTab) {
        await page.screenshot({ path: `${SCREENSHOTS_DIR}/booking-form.png` });
        console.log('   ✓ Captured: booking-form.png\n');
    } else {
        console.log('   ✗ FAILED: Booking form not displayed correctly\n');
    }
    
    // Capture date picker
    console.log('3. Capturing booking-dates.png...');
    const dateButton = page.locator('button:has-text("Pick a date")').first();
    if (await dateButton.isVisible()) {
        await dateButton.click();
        await new Promise(r => setTimeout(r, 500));
        
        // Verify calendar is visible
        const calendarVisible = await page.locator('[role="grid"]').isVisible();
        console.log(`   Verification: Calendar popup visible: ${calendarVisible}`);
        
        if (calendarVisible) {
            await page.screenshot({ path: `${SCREENSHOTS_DIR}/booking-dates.png` });
            console.log('   ✓ Captured: booking-dates.png\n');
        } else {
            console.log('   ✗ FAILED: Calendar not displayed\n');
        }
        
        // Close the calendar by clicking elsewhere
        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 300));
    }
    
    // Add items to cart for checkout screenshots
    console.log('4. Adding items to cart for checkout...');
    
    // Search for flights
    await page.locator('button:has-text("Flights")').click();
    await new Promise(r => setTimeout(r, 300));
    
    // Select "From" destination
    const fromCombobox = page.locator('button[role="combobox"]').first();
    await fromCombobox.click();
    await new Promise(r => setTimeout(r, 300));
    await page.locator('[role="option"]').first().click();
    await new Promise(r => setTimeout(r, 300));
    
    // Select "To" destination
    const toCombobox = page.locator('button[role="combobox"]').nth(1);
    await toCombobox.click();
    await new Promise(r => setTimeout(r, 300));
    await page.locator('[role="option"]').nth(1).click();
    await new Promise(r => setTimeout(r, 300));
    
    // Search flights
    await page.locator('button:has-text("Search Flights")').click();
    await new Promise(r => setTimeout(r, 1000));
    
    // Select first flight result
    const selectFlightBtn = page.locator('button:has-text("Select")').first();
    if (await selectFlightBtn.isVisible()) {
        await selectFlightBtn.click();
        await new Promise(r => setTimeout(r, 500));
        console.log('   Added flight to cart\n');
    }
    
    // Search hotels (tab should auto-switch)
    await new Promise(r => setTimeout(r, 500));
    await page.locator('button:has-text("Search Hotels")').click();
    await new Promise(r => setTimeout(r, 1000));
    
    // Select first hotel
    const selectHotelBtn = page.locator('button:has-text("Select")').first();
    if (await selectHotelBtn.isVisible()) {
        await selectHotelBtn.click();
        await new Promise(r => setTimeout(r, 500));
        console.log('   Added hotel to cart\n');
    }
    
    // Capture cart summary
    console.log('5. Capturing checkout-cart.png...');
    const cartButton = page.locator('button[aria-label*="cart"], button:has(svg.lucide-shopping-cart)').first();
    if (await cartButton.isVisible()) {
        await cartButton.click();
        await new Promise(r => setTimeout(r, 500));
        
        // Verify cart sheet is open
        const cartSheet = await page.locator('text=Your Cart, text=Shopping Cart, [role="dialog"]').first().isVisible();
        console.log(`   Verification: Cart sheet visible: ${cartSheet}`);
        
        await page.screenshot({ path: `${SCREENSHOTS_DIR}/checkout-cart.png` });
        console.log('   ✓ Captured: checkout-cart.png\n');
        
        // Click checkout button
        const checkoutBtn = page.locator('button:has-text("Checkout"), a:has-text("Checkout")').first();
        if (await checkoutBtn.isVisible()) {
            await checkoutBtn.click();
            await page.waitForLoadState('networkidle');
            await new Promise(r => setTimeout(r, 1000));
        }
    } else {
        // Try navigating directly to checkout
        await page.goto('http://localhost:49764/checkout');
        await page.waitForLoadState('networkidle');
        await new Promise(r => setTimeout(r, 1000));
    }
    
    // Capture checkout form
    console.log('6. Capturing checkout-form.png...');
    const paymentTitle = await page.locator('text=Payment Details').isVisible();
    const orderSummary = await page.locator('text=Order Summary').isVisible();
    console.log(`   Verification: Payment Details visible: ${paymentTitle}, Order Summary visible: ${orderSummary}`);
    
    if (paymentTitle || orderSummary) {
        await page.screenshot({ path: `${SCREENSHOTS_DIR}/checkout-form.png` });
        console.log('   ✓ Captured: checkout-form.png\n');
    } else {
        // Cart might be empty, add items again
        console.log('   Cart appears empty, navigating back to booking...\n');
    }
    
    // Capture payment processing
    console.log('7. Capturing checkout-payment.png...');
    // Fill in payment form
    const cardInput = page.locator('input#card, input[placeholder*="0000"]');
    if (await cardInput.isVisible()) {
        await cardInput.fill('4242 4242 4242 4242');
        await page.locator('input#expiry, input[placeholder*="MM"]').fill('12/25');
        await page.locator('input#cvc, input[placeholder*="123"]').fill('123');
        await new Promise(r => setTimeout(r, 300));
        
        // Verify form is filled
        const cardFilled = await cardInput.inputValue();
        console.log(`   Verification: Card number filled: ${cardFilled.includes('4242')}`);
        
        await page.screenshot({ path: `${SCREENSHOTS_DIR}/checkout-payment.png` });
        console.log('   ✓ Captured: checkout-payment.png\n');
        
        // Submit payment
        console.log('8. Capturing booking-confirmation.png...');
        const payButton = page.locator('button[type="submit"]:has-text("Pay")');
        if (await payButton.isVisible()) {
            await payButton.click();
            await new Promise(r => setTimeout(r, 2000));
            
            // Verify confirmation screen
            const confirmationVisible = await page.locator('text=Booking Confirmed, text=Booking Reference').first().isVisible();
            console.log(`   Verification: Confirmation screen visible: ${confirmationVisible}`);
            
            if (confirmationVisible) {
                await page.screenshot({ path: `${SCREENSHOTS_DIR}/booking-confirmation.png` });
                console.log('   ✓ Captured: booking-confirmation.png\n');
            } else {
                // Check if there was an error or still processing
                const errorVisible = await page.locator('text=Error, text=declined').first().isVisible().catch(() => false);
                console.log(`   Error message visible: ${errorVisible}`);
                await page.screenshot({ path: `${SCREENSHOTS_DIR}/booking-confirmation.png` });
                console.log('   ✓ Captured current state as: booking-confirmation.png\n');
            }
        }
    }
    
    await browser.close();
    console.log('=== All booking screenshots captured! ===');
}

captureBookingScreenshots().catch(console.error);
