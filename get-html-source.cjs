const { chromium } = require('playwright');

(async () => {
  console.log('📄 Getting HTML source from live site...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://usmle-trivia.netlify.app/', { waitUntil: 'domcontentloaded' });
    
    const htmlContent = await page.content();
    console.log('\n=== HTML SOURCE ===');
    console.log(htmlContent);
    console.log('\n=== END HTML SOURCE ===');
    
    // Also save to file
    require('fs').writeFileSync('live-site-source.html', htmlContent);
    console.log('\n📁 HTML source saved to live-site-source.html');
    
  } catch (error) {
    console.error('❌ Failed to get HTML source:', error.message);
  } finally {
    await browser.close();
  }
})();