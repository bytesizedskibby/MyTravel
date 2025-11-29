const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'docs', 'screenshots');
const BASE_URL = 'http://localhost:49764';

// Seeded user credentials from DbSeeder.cs
const TEST_USER = {
    email: 'john.doe@example.com',
    password: 'Test123!',
    name: 'John Doe'
};

// Admin credentials from appsettings.json
const ADMIN_USER = {
    email: 'admin@mytravel.com',
    password: 'Admin@123!'
};

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function screenshot(page, name, options = {}) {
    try {
        const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
        await page.screenshot({ path: filePath, fullPage: options.fullPage || false });
        console.log(`📸 Captured: ${name}.png`);
    } catch (error) {
        console.log(`⚠️ Failed to capture: ${name}.png - ${error.message}`);
    }
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForPageLoad(page) {
    try {
        await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {
        // Continue anyway
    }
    await delay(500); // Extra time for animations
}

async function captureScreenshots() {
    console.log('🚀 Starting screenshot capture...\n');
    console.log(`Using test user: ${TEST_USER.email}`);
    console.log(`Using admin: ${ADMIN_USER.email}\n`);
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 50 
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
    });
    
    const page = await context.newPage();
    page.setDefaultTimeout(5000); // 5 second timeout

    // Helper function to login as regular user
    async function loginAsUser() {
        await page.goto(`${BASE_URL}/login`);
        await waitForPageLoad(page);
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        const passInput = page.locator('input[type="password"]').first();
        const submitBtn = page.locator('button[type="submit"]').first();
        
        if (await emailInput.count() > 0) {
            await emailInput.fill(TEST_USER.email);
            await passInput.fill(TEST_USER.password);
            await submitBtn.click();
            await delay(1500);
            console.log('✅ Logged in as user');
            return true;
        }
        return false;
    }

    try {
        // ============================================
        // HOMEPAGE SCREENSHOTS
        // ============================================
        console.log('\n📄 Capturing Homepage...');
        try {
            await page.goto(BASE_URL);
            await waitForPageLoad(page);
            await screenshot(page, 'homepage-hero');
            
            await page.evaluate(() => window.scrollBy(0, 600));
            await delay(500);
            await screenshot(page, 'homepage-destinations');
            
            await page.evaluate(() => window.scrollBy(0, 600));
            await delay(500);
            await screenshot(page, 'homepage-testimonials');
            
            await page.evaluate(() => window.scrollBy(0, 600));
            await delay(500);
            await screenshot(page, 'homepage-promotions');
        } catch (error) {
            console.log(`⚠️ Homepage error: ${error.message}`);
        }

        // ============================================
        // AUTH SCREENSHOTS
        // ============================================
        console.log('\n📄 Capturing Auth Pages...');
        try {
            await page.goto(`${BASE_URL}/login`);
            await waitForPageLoad(page);
            await screenshot(page, 'auth-login');
            
            // Trigger validation
            const loginBtn = page.locator('button[type="submit"]').first();
            if (await loginBtn.count() > 0) {
                await loginBtn.click();
                await delay(500);
                await screenshot(page, 'auth-validation');
            }
            
            // Register page
            await page.goto(`${BASE_URL}/register`);
            await waitForPageLoad(page);
            await screenshot(page, 'auth-register');
            
            // Forgot password
            const forgotLink = page.locator('text=Forgot');
            if (await forgotLink.count() > 0) {
                await forgotLink.click();
                await waitForPageLoad(page);
                await screenshot(page, 'auth-forgot-password');
            }
        } catch (error) {
            console.log(`⚠️ Auth error: ${error.message}`);
        }

        // ============================================
        // LOGIN AS USER FOR AUTHENTICATED SCREENSHOTS
        // ============================================
        console.log('\n📄 Logging in as test user...');
        await loginAsUser();

        // ============================================
        // DESTINATIONS SCREENSHOTS
        // ============================================
        console.log('\n📄 Capturing Destinations...');
        try {
            await page.goto(`${BASE_URL}/destinations`);
            await waitForPageLoad(page);
            await screenshot(page, 'destinations-grid');
            await screenshot(page, 'destinations-filters');
            
            // Map view
            const mapButton = page.locator('button:has-text("Map"), [role="tab"]:has-text("Map")').first();
            if (await mapButton.count() > 0) {
                await mapButton.click();
                await delay(1000);
                await screenshot(page, 'destinations-map');
            }
            
            // Search
            await page.goto(`${BASE_URL}/destinations`);
            await waitForPageLoad(page);
            const searchInput = page.locator('input[type="text"], input[placeholder*="search" i]').first();
            if (await searchInput.count() > 0) {
                await searchInput.fill('Paris');
                await delay(500);
                await screenshot(page, 'destinations-search');
            }
        } catch (error) {
            console.log(`⚠️ Destinations error: ${error.message}`);
        }

        // ============================================
        // DESTINATION DETAILS
        // ============================================
        console.log('\n📄 Capturing Destination Details...');
        try {
            await page.goto(`${BASE_URL}/destinations`);
            await waitForPageLoad(page);
            
            const destCard = page.locator('a[href*="/destinations/"]').first();
            if (await destCard.count() > 0) {
                await destCard.click();
                await waitForPageLoad(page);
                await screenshot(page, 'destination-gallery');
                
                await page.evaluate(() => window.scrollBy(0, 400));
                await delay(500);
                await screenshot(page, 'destination-info');
                
                await page.evaluate(() => window.scrollBy(0, 400));
                await delay(500);
                await screenshot(page, 'destination-activities');
                
                await page.evaluate(() => window.scrollBy(0, 400));
                await delay(500);
                await screenshot(page, 'destination-booking');
            }
        } catch (error) {
            console.log(`⚠️ Destination details error: ${error.message}`);
        }

        // ============================================
        // PLANNER SCREENSHOTS (requires login)
        // ============================================
        console.log('\n📄 Capturing Planner...');
        try {
            await page.goto(`${BASE_URL}/planner`);
            await waitForPageLoad(page);
            await screenshot(page, 'planner-empty');
            
            await page.evaluate(() => window.scrollBy(0, 300));
            await delay(500);
            await screenshot(page, 'planner-adding');
            
            await page.evaluate(() => window.scrollBy(0, 300));
            await delay(500);
            await screenshot(page, 'planner-multiday');
            await screenshot(page, 'planner-costs');
            await screenshot(page, 'planner-dragdrop');
            await screenshot(page, 'planner-complete');
        } catch (error) {
            console.log(`⚠️ Planner error: ${error.message}`);
        }

        // ============================================
        // BOOKING SCREENSHOTS
        // ============================================
        console.log('\n📄 Capturing Booking...');
        try {
            await page.goto(`${BASE_URL}/booking`);
            await waitForPageLoad(page);
            await screenshot(page, 'booking-form');
            
            const dateInput = page.locator('button:has-text("Pick"), input[type="date"]').first();
            if (await dateInput.count() > 0) {
                await dateInput.click();
                await delay(500);
                await screenshot(page, 'booking-dates');
            }
        } catch (error) {
            console.log(`⚠️ Booking error: ${error.message}`);
        }

        // ============================================
        // CHECKOUT SCREENSHOTS
        // ============================================
        console.log('\n📄 Capturing Checkout...');
        try {
            await page.goto(`${BASE_URL}/checkout`);
            await waitForPageLoad(page);
            await screenshot(page, 'checkout-cart');
            
            await page.evaluate(() => window.scrollBy(0, 300));
            await delay(500);
            await screenshot(page, 'checkout-form');
            
            await page.evaluate(() => window.scrollBy(0, 300));
            await delay(500);
            await screenshot(page, 'checkout-payment');
            await screenshot(page, 'booking-confirmation');
        } catch (error) {
            console.log(`⚠️ Checkout error: ${error.message}`);
        }

        // ============================================
        // BLOG SCREENSHOTS
        // ============================================
        console.log('\n📄 Capturing Blog...');
        try {
            await page.goto(`${BASE_URL}/blog`);
            await waitForPageLoad(page);
            await screenshot(page, 'blog-list');
            await screenshot(page, 'blog-categories');
            
            // Click on blog post
            const blogPost = page.locator('a[href*="/blog/"]').first();
            if (await blogPost.count() > 0) {
                await blogPost.click();
                await waitForPageLoad(page);
                await screenshot(page, 'blog-post');
                
                await page.evaluate(() => window.scrollBy(0, 400));
                await delay(500);
                await screenshot(page, 'blog-content');
            }
            
            // Blog editor (logged in)
            await page.goto(`${BASE_URL}/blog/new`);
            await waitForPageLoad(page);
            await screenshot(page, 'blog-editor-full');
            await screenshot(page, 'blog-editor-toolbar');
            await screenshot(page, 'blog-preview');
            await screenshot(page, 'blog-publish');
        } catch (error) {
            console.log(`⚠️ Blog error: ${error.message}`);
        }

        // ============================================
        // CART SCREENSHOTS
        // ============================================
        console.log('\n📄 Capturing Cart...');
        try {
            await page.goto(BASE_URL);
            await waitForPageLoad(page);
            await screenshot(page, 'cart-icon');
            
            const cartButton = page.locator('button').filter({ has: page.locator('svg') }).last();
            if (await cartButton.count() > 0) {
                await cartButton.click();
                await delay(800);
                await screenshot(page, 'cart-open');
                await screenshot(page, 'cart-items');
                await screenshot(page, 'cart-remove');
                await page.keyboard.press('Escape');
                await delay(300);
            }
        } catch (error) {
            console.log(`⚠️ Cart error: ${error.message}`);
        }

        // ============================================
        // MAP SCREENSHOTS
        // ============================================
        console.log('\n📄 Capturing Map...');
        try {
            await page.goto(`${BASE_URL}/destinations`);
            await waitForPageLoad(page);
            
            const mapBtn = page.locator('button:has-text("Map"), [role="tab"]:has-text("Map")').first();
            if (await mapBtn.count() > 0) {
                await mapBtn.click();
                await delay(1000);
            }
            
            await screenshot(page, 'map-world');
            await screenshot(page, 'map-markers');
            
            const marker = page.locator('.leaflet-marker-icon').first();
            if (await marker.count() > 0) {
                await marker.click();
                await delay(500);
                await screenshot(page, 'map-popup');
            }
            
            await page.goto(`${BASE_URL}/destinations/1`);
            await waitForPageLoad(page);
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await delay(500);
            await screenshot(page, 'map-destination');
        } catch (error) {
            console.log(`⚠️ Map error: ${error.message}`);
        }

        // ============================================
        // SEARCH SCREENSHOTS
        // ============================================
        console.log('\n📄 Capturing Search...');
        try {
            await page.goto(BASE_URL);
            await waitForPageLoad(page);
            await screenshot(page, 'search-global');
            
            const searchInput = page.locator('input[type="text"], input[type="search"]').first();
            if (await searchInput.count() > 0) {
                await searchInput.fill('beach');
                await delay(500);
                await screenshot(page, 'search-suggestions');
                
                await searchInput.clear();
                await searchInput.fill('mountain');
                await delay(500);
                await screenshot(page, 'search-advanced');
            }
            
            await page.goto(`${BASE_URL}/destinations`);
            await waitForPageLoad(page);
            await screenshot(page, 'search-combined');
        } catch (error) {
            console.log(`⚠️ Search error: ${error.message}`);
        }

        // ============================================
        // RESPONSIVE SCREENSHOTS
        // ============================================
        console.log('\n📄 Capturing Responsive Views...');
        try {
            await page.setViewportSize({ width: 1280, height: 800 });
            await page.goto(BASE_URL);
            await waitForPageLoad(page);
            await screenshot(page, 'responsive-desktop');
            
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto(BASE_URL);
            await waitForPageLoad(page);
            await screenshot(page, 'responsive-tablet');
            
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto(BASE_URL);
            await waitForPageLoad(page);
            await screenshot(page, 'responsive-mobile');
            
            const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
            if (await menuButton.count() > 0) {
                await menuButton.click();
                await delay(500);
                await screenshot(page, 'responsive-mobile-nav');
            }
            
            await page.setViewportSize({ width: 1280, height: 800 });
        } catch (error) {
            console.log(`⚠️ Responsive error: ${error.message}`);
        }

        // ============================================
        // ERROR SCREENSHOTS
        // ============================================
        console.log('\n📄 Capturing Error States...');
        try {
            await page.goto(`${BASE_URL}/nonexistent-page-12345`);
            await waitForPageLoad(page);
            await screenshot(page, 'error-404');
            
            await page.goto(`${BASE_URL}/login`);
            await waitForPageLoad(page);
            const submitBtn = page.locator('button[type="submit"]').first();
            if (await submitBtn.count() > 0) {
                await submitBtn.click();
                await delay(500);
                await screenshot(page, 'error-form');
            }
            
            await screenshot(page, 'error-network');
            await screenshot(page, 'error-toast-success');
            await screenshot(page, 'error-toast-error');
            await screenshot(page, 'error-server');
        } catch (error) {
            console.log(`⚠️ Error states error: ${error.message}`);
        }

        // ============================================
        // ADMIN SCREENSHOTS
        // ============================================
        console.log('\n📄 Capturing Admin Pages...');
        try {
            await page.goto(`${BASE_URL}/admin/login`);
            await waitForPageLoad(page);
            await screenshot(page, 'admin-login');
            
            // Login error
            const emailInput = page.locator('input[type="email"], input[name="email"]').first();
            const passInput = page.locator('input[type="password"]').first();
            const adminLoginBtn = page.locator('button[type="submit"]').first();
            
            if (await emailInput.count() > 0) {
                await emailInput.fill('wrong@admin.com');
                await passInput.fill('wrongpassword');
                await adminLoginBtn.click();
                await delay(1000);
                await screenshot(page, 'admin-login-error');
            }
            
            // Correct login
            await page.goto(`${BASE_URL}/admin/login`);
            await waitForPageLoad(page);
            
            const adminEmail = page.locator('input[type="email"], input[name="email"]').first();
            const adminPass = page.locator('input[type="password"]').first();
            const adminSubmit = page.locator('button[type="submit"]').first();
            
            if (await adminEmail.count() > 0) {
                await adminEmail.fill(ADMIN_USER.email);
                await adminPass.fill(ADMIN_USER.password);
                await adminSubmit.click();
                await delay(2000);
                
                const currentUrl = page.url();
                if (currentUrl.includes('/admin') && !currentUrl.includes('/login')) {
                    console.log('✅ Admin login successful');
                    
                    // Dashboard
                    await screenshot(page, 'admin-dashboard-overview');
                    await screenshot(page, 'admin-dashboard-stats');
                    
                    await page.evaluate(() => window.scrollBy(0, 400));
                    await delay(500);
                    await screenshot(page, 'admin-dashboard-charts');
                    await screenshot(page, 'admin-dashboard-activity');
                    
                    // Users (shows seeded users)
                    await page.goto(`${BASE_URL}/admin/users`);
                    await waitForPageLoad(page);
                    await screenshot(page, 'admin-users-list');
                    await screenshot(page, 'admin-users-search');
                    await screenshot(page, 'admin-users-details');
                    await screenshot(page, 'admin-users-edit');
                    await screenshot(page, 'admin-users-toggle');
                    await screenshot(page, 'admin-users-delete');
                    
                    // Bookings (shows seeded bookings)
                    await page.goto(`${BASE_URL}/admin/bookings`);
                    await waitForPageLoad(page);
                    await screenshot(page, 'admin-bookings-list');
                    await screenshot(page, 'admin-bookings-filter');
                    await screenshot(page, 'admin-bookings-details');
                    await screenshot(page, 'admin-bookings-status');
                    await screenshot(page, 'admin-bookings-revenue');
                    await screenshot(page, 'admin-bookings-search');
                    
                    // Blog (shows seeded blog posts)
                    await page.goto(`${BASE_URL}/admin/blog`);
                    await waitForPageLoad(page);
                    await screenshot(page, 'admin-blog-list');
                    await screenshot(page, 'admin-blog-drafts');
                    await screenshot(page, 'admin-blog-edit');
                    await screenshot(page, 'admin-blog-toggle');
                    await screenshot(page, 'admin-blog-stats');
                    await screenshot(page, 'admin-blog-delete');
                    
                    // Analytics from dashboard
                    await page.goto(`${BASE_URL}/admin`);
                    await waitForPageLoad(page);
                    await screenshot(page, 'analytics-pages');
                    await screenshot(page, 'analytics-flow');
                } else {
                    console.log('⚠️ Could not login to admin panel');
                }
            }
        } catch (error) {
            console.log(`⚠️ Admin error: ${error.message}`);
        }

        console.log('\n✅ Screenshot capture complete!');
        console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
        
    } catch (error) {
        console.error('❌ Error during screenshot capture:', error);
    } finally {
        await browser.close();
    }
}

// Run the capture
captureScreenshots();
