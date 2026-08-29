const request = require('supertest');
const app = require('../server');

async function assertCheck(name, condition, details) {
  if (!condition) {
    throw new Error(`${name} failed: ${details}`);
  }
}

(async () => {
  const home = await request(app).get('/');
  await assertCheck('home status', home.status === 200, `status=${home.status}`);
  await assertCheck('meta description', /<meta name="description"/.test(home.text), 'missing meta description');
  await assertCheck('canonical link', /<link rel="canonical"/.test(home.text), 'missing canonical');
  await assertCheck('og tags', /og:title/.test(home.text), 'missing OG tags');
  await assertCheck('json-ld', /application\/ld\+json/.test(home.text), 'missing JSON-LD');
  await assertCheck('faq', /FAQ/.test(home.text), 'missing FAQ section');

  const about = await request(app).get('/about');
  await assertCheck('about status', about.status === 200, `status=${about.status}`);

  const help = await request(app).get('/help');
  await assertCheck('help status', help.status === 200, `status=${help.status}`);
  await assertCheck('help faq', /FAQ/.test(help.text), 'missing FAQ on help page');

  const robots = await request(app).get('/robots.txt');
  await assertCheck('robots status', robots.status === 200, `status=${robots.status}`);
  await assertCheck('robots sitemap', /Sitemap:/.test(robots.text), 'robots missing Sitemap');

  const sitemap = await request(app).get('/sitemap.xml');
  await assertCheck('sitemap status', sitemap.status === 200, `status=${sitemap.status}`);
  await assertCheck('sitemap loc', /<loc>.*retroova\.com/.test(sitemap.text), 'missing absolute XML loc');

  const enHome = await request(app).get('/en');
  await assertCheck('en home status', enHome.status === 200, `status=${enHome.status}`);
  await assertCheck('en html lang', /<html lang="en"/.test(enHome.text), 'missing lang="en"');
  await assertCheck('en canonical', /<link rel="canonical"/.test(enHome.text), 'missing canonical in english page');

  console.log('SEO public validation: PASS');
  console.log('Routes checked: /, /about, /help, /robots.txt, /sitemap.xml, /en');
  process.exit(0);
})().catch((error) => {
  console.error('SEO public validation: FAIL');
  console.error(error.stack || error.message || error);
  process.exit(1);
});
