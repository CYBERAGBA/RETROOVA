const escapeXml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const buildAbsoluteUrl = (siteUrl, pathName = '/') => {
  const base = String(siteUrl || 'https://retroova.com').replace(/\/$/, '');
  const normalizedPath = String(pathName || '/').startsWith('/') ? String(pathName) : `/${pathName}`;
  return `${base}${normalizedPath}`;
};

const buildLanguageAlternates = (siteUrl, pathName = '/', locales = ['fr', 'en']) => {
  const normalizedPath = String(pathName || '/').split('?')[0] || '/';
  const currentPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;

  return locales.reduce((acc, locale) => {
    const localePath = locale === 'fr' ? currentPath : `/en${currentPath === '/' ? '' : currentPath}`;
    acc[locale] = buildAbsoluteUrl(siteUrl, localePath);
    return acc;
  }, {});
};

const buildSitemapXml = (siteUrl, pages = [], items = []) => {
  const entries = [];

  pages.forEach((page) => {
    const url = typeof page === 'string' ? page : page.url;
    if (!url) return;
    entries.push({
      url: buildAbsoluteUrl(siteUrl, url),
      lastmod: typeof page === 'object' ? page.lastmod : null,
      changefreq: typeof page === 'object' ? page.changefreq : null,
      priority: typeof page === 'object' ? page.priority : null
    });
  });

  items.forEach((item) => {
    if (!item || !item.id) return;
    entries.push({
      url: buildAbsoluteUrl(siteUrl, `/items/${item.id}`),
      lastmod: item.updated_at || item.created_at || null,
      changefreq: 'weekly',
      priority: '0.7'
    });
  });

  const uniqueEntries = new Map();
  entries.forEach((entry) => uniqueEntries.set(entry.url, entry));

  const xmlUrls = [...uniqueEntries.values()].map((entry) => {
    const lastmod = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
    const changefreq = entry.changefreq ? `\n    <changefreq>${escapeXml(entry.changefreq)}</changefreq>` : '';
    const priority = entry.priority ? `\n    <priority>${escapeXml(String(entry.priority))}</priority>` : '';
    return `  <url>\n    <loc>${escapeXml(entry.url)}</loc>${lastmod}${changefreq}${priority}\n  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlUrls}\n</urlset>\n`;
};

const buildOrganizationSchema = (siteUrl, locale = 'fr') => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'RETROOVA',
  url: siteUrl,
  logo: buildAbsoluteUrl(siteUrl, '/images/logo_nom_slogan_paysage.png'),
  sameAs: [
    'https://www.linkedin.com',
    'https://www.facebook.com',
    'https://www.instagram.com'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'cyberagba6@gmail.com',
    availableLanguage: [locale === 'fr' ? 'French' : 'English', 'French', 'English']
  }
});

const buildWebSiteSchema = (siteUrl, locale = 'fr') => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'RETROOVA',
  url: siteUrl,
  inLanguage: locale === 'fr' ? ['fr', 'en'] : ['en', 'fr'],
  description: 'Plateforme de signalement et de recherche d’objets perdus et trouvés.',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${buildAbsoluteUrl(siteUrl, '/search')}?keyword={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
});

const buildFaqSchema = (faqItems = []) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: (faqItems || []).map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer
    }
  }))
});

module.exports = {
  escapeXml,
  buildAbsoluteUrl,
  buildLanguageAlternates,
  buildSitemapXml,
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildFaqSchema
};
