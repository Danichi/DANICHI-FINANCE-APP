import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: undefined });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];

page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', err => errors.push(err.message));

await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });
await page.screenshot({ path: 'ss_dashboard.png' });
const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const sidebarCount = await page.locator('aside').count();
const bodyContent = await page.locator('body').textContent();
const hasRevenue = bodyContent.includes('Revenue') || bodyContent.includes('revenue');
const hasNav = bodyContent.includes('Dashboard') || bodyContent.includes('dashboard');

await page.goto('http://localhost:5173/transactions', { waitUntil: 'networkidle', timeout: 15000 });
await page.screenshot({ path: 'ss_transactions.png' });
const rows = await page.locator('tbody tr').count();

await page.goto('http://localhost:5173/transactions/new', { waitUntil: 'networkidle', timeout: 15000 });
await page.screenshot({ path: 'ss_newtx.png' });
const h2 = await page.locator('h2').first().textContent().catch(() => '?');

console.log(JSON.stringify({ bodyBg, sidebarCount, hasRevenue, hasNav, txRows: rows, formH2: h2, errors: errors.slice(0, 3) }, null, 2));
await browser.close();
