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

  // Extract the slug (path without locale prefix)
  let slug = currentPath;
  if (currentPath.startsWith('/fr/') || currentPath === '/fr') {
    slug = currentPath === '/fr' ? '/' : currentPath.substring(3); // Remove '/fr'
  } else if (currentPath.startsWith('/en/') || currentPath === '/en') {
    slug = currentPath === '/en' ? '/' : currentPath.substring(3); // Remove '/en'
  }

  const result = {};
  
  locales.forEach((locale) => {
    const prefix = locale === 'fr' ? '/fr' : '/en';
    const localePath = slug === '/' ? `${prefix}/` : `${prefix}${slug}`;
    result[locale] = buildAbsoluteUrl(siteUrl, localePath);
  });

  // Add x-default pointing to French version
  const frPrefix = '/fr';
  const defaultPath = slug === '/' ? `${frPrefix}/` : `${frPrefix}${slug}`;
  result['x-default'] = buildAbsoluteUrl(siteUrl, defaultPath);

  return result;
};
const formatSitemapDate = (date) => {
  if (!date) return null;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
};

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
};
const buildSitemapXml = (siteUrl, pages = [], items = []) => {
  const entries = [];

  pages.forEach((page) => {
    const url = typeof page === 'string' ? page : page.url;
    if (!url) return;

    entries.push({
      url: buildAbsoluteUrl(siteUrl, url),
      lastmod: typeof page === 'object'
        ? formatSitemapDate(page.lastmod)
        : null,
      changefreq: typeof page === 'object' ? page.changefreq : null,
      priority: typeof page === 'object' ? page.priority : null
    });
  });

  // Generate localized URLs for items: /fr/items/:id and /en/items/:id
  items.forEach((item) => {
    if (!item || !item.id) return;

    const lastmod = formatSitemapDate(
      item.updated_at || item.created_at || null
    );

    const changefreq = 'weekly';
    const priority = '0.7';

    // French version
    entries.push({
      url: buildAbsoluteUrl(siteUrl, `/fr/items/${item.id}`),
      lastmod,
      changefreq,
      priority
    });

    // English version
    entries.push({
      url: buildAbsoluteUrl(siteUrl, `/en/items/${item.id}`),
      lastmod,
      changefreq,
      priority
    });
  });

  const uniqueEntries = new Map();
  entries.forEach((entry) => uniqueEntries.set(entry.url, entry));

  const xmlUrls = [...uniqueEntries.values()].map((entry) => {
    const lastmod = entry.lastmod
      ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`
      : '';

    const changefreq = entry.changefreq
      ? `\n    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`
      : '';

    const priority = entry.priority
      ? `\n    <priority>${escapeXml(String(entry.priority))}</priority>`
      : '';

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
    'https://www.facebook.com/profile.php?id=100094905241127',
    'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=c8xee1y',
    'https://www.linkedin.com/in/odessi-raoul-agba-716779343?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    'https://wa.me/2250500072323'
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
    target: `${buildAbsoluteUrl(siteUrl, `/${locale}/search`)}?keyword={search_term_string}`,
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
