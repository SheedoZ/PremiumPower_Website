'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const site = 'https://www.premiumpower-eg.com';
const brands = [
  ['perkins-generators-egypt', 18],
  ['volvo-penta-generators-egypt', 13],
  ['doosan-generators-egypt', 9],
];
const pages = ['en', 'ar'].flatMap(lang => [
  { lang, slug: '', count: 0 },
  ...brands.map(([slug, count]) => ({ lang, slug, count })),
  {lang, slug: 'maintenance', count: 0},
  {lang, slug: 'privacy', count: 0},
]).map(page => {
  const pathname = '/' + (page.lang === 'ar' ? 'ar/' : '') + (page.slug ? page.slug + '/' : '');
  return { ...page, pathname, url: site + pathname, file: pathname.slice(1) + 'index.html' };
});
const normalize = value => String(value).normalize('NFC').replace(/\s+/g, ' ').trim();

function open(page) {
  // No scripts or remote resources are executed. This is the HTML served to crawlers.
  return new JSDOM(fs.readFileSync(path.join(root, page.file), 'utf8'), { url: page.url });
}

function one(document, selector, label) {
  const matches = document.querySelectorAll(selector);
  assert.equal(matches.length, 1, `${label}: expected one ${selector}`);
  return matches[0];
}

function alternates(page) {
  const suffix = page.slug ? page.slug + '/' : '';
  return { en: site + '/' + suffix, ar: site + '/ar/' + suffix, 'x-default': site + '/' + suffix };
}

function structuredData(document) {
  const nodes = [];
  function walk(value) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(walk); return; }
    nodes.push(value);
    for (const nested of Object.values(value)) walk(nested);
  }
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    walk(JSON.parse(script.textContent));
  }
  const type = name => nodes.filter(node => [node['@type']].flat().includes(name));
  const resolve = value => {
    if (value && value['@id'] && !value['@type']) {
      return nodes.find(node => node['@id'] === value['@id'] && node['@type']) || value;
    }
    return value;
  };
  return { nodes, type, resolve };
}

for (const page of pages) {
  test(`${page.file}: metadata and language alternatives describe this canonical page`, () => {
    const dom = open(page);
    try {
      const d = dom.window.document;
      const title = normalize(one(d, 'title', page.file).textContent);
      const description = one(d, 'meta[name="description"]', page.file).content;
      assert.ok(title, 'title is not empty');
      assert.ok(normalize(description), 'description is not empty');
      assert.equal(d.documentElement.lang, page.lang);
      assert.equal(one(d, 'link[rel="canonical"]', page.file).href, page.url);
      assert.equal(one(d, 'meta[property="og:url"]', page.file).content, page.url);
      assert.equal(one(d, 'meta[property="og:title"]', page.file).content, title);
      assert.equal(one(d, 'meta[property="og:description"]', page.file).content, description);
      assert.equal(one(d, 'meta[name="twitter:title"]', page.file).content, title);
      assert.equal(one(d, 'meta[name="twitter:description"]', page.file).content, description);
      assert.equal(d.querySelectorAll('h1').length, 1);
      assert.ok(normalize(d.querySelector('h1').textContent));
      for (const [lang, href] of Object.entries(alternates(page))) {
        assert.equal(one(d, `link[rel="alternate"][hreflang="${lang}"]`, page.file).href, href);
      }
      for (const meta of d.querySelectorAll('meta[name="robots"]')) {
        assert.doesNotMatch(meta.content, /\b(noindex|nofollow|none)\b/i);
      }
      if (page.lang === 'ar') {
        assert.match(title, /[\u0600-\u06ff]/);
        assert.match(description, /[\u0600-\u06ff]/);
      }
    } finally { dom.window.close(); }
  });

  test(`${page.file}: FAQ structured data matches the visible static FAQ`, () => {
    const dom = open(page);
    try {
      const d = dom.window.document;
      const schema = structuredData(d);
      const faqs = schema.type('FAQPage');
      if (page.slug === 'privacy') {
        assert.equal(faqs.length, 0, 'privacy does not claim an FAQ');
        return;
      }
      assert.equal(faqs.length, 1, 'exactly one FAQPage is emitted');
      const entries = d.querySelectorAll(page.slug ? '.faqs details' : '#faq-list details');
      assert.ok(entries.length > 0, 'FAQ answers are present before JavaScript runs');
      const visible = Array.from(entries, item => ({
        question: normalize(item.querySelector('summary').textContent),
        answer: normalize(item.querySelector('p').textContent),
      }));
      const marked = faqs[0].mainEntity.map(entry => ({
        question: normalize(entry.name),
        answer: normalize(schema.resolve(entry.acceptedAnswer).text),
      }));
      assert.deepEqual(marked, visible);
      if (faqs[0].inLanguage) assert.match(faqs[0].inLanguage, new RegExp('^' + page.lang + '(?:-|$)', 'i'));
      for (const entry of marked) {
        if (page.lang === 'ar') assert.match(entry.question, /[\u0600-\u06ff]/);
        else assert.doesNotMatch(entry.question, /[\u0600-\u06ff]/);
      }
    } finally { dom.window.close(); }
  });

  if (page.count) {
    test(`${page.file}: product list refers to real model rows and their published specifications`, () => {
      const dom = open(page);
      try {
        const d = dom.window.document;
        const schema = structuredData(d);
        const modelRows = [...d.querySelectorAll('#model-table tbody tr')];
        assert.equal(modelRows.length, page.count);
        const list = schema.type('ItemList').find(node => (node.itemListElement || []).some(item => {
          const entity = schema.resolve(item.item || item);
          return [entity && entity['@type']].flat().includes('Product');
        }));
        assert.ok(list, 'model catalogue has an ItemList of Product entries');
        assert.equal(list.itemListElement.length, modelRows.length);
        if (list.numberOfItems !== undefined) assert.equal(Number(list.numberOfItems), modelRows.length);
        const products = list.itemListElement.map((entry, i) => {
          if (entry.position !== undefined) assert.equal(entry.position, i + 1);
          return schema.resolve(entry.item || entry);
        });
        assert.equal(new Set(products.map(item => item.model)).size, modelRows.length);
        for (const row of modelRows) {
          const cells = row.querySelectorAll('th,td');
          const model = normalize(cells[0].textContent);
          const engine = normalize(cells[1].textContent);
          const alternator = normalize(cells[2].textContent);
          const prime = Number(normalize(cells[3].textContent));
          const standby = Number(normalize(cells[4].textContent));
          assert.equal(row.id, `model-${model}`, 'each model has a stable link target');
          const product = products.find(item => item.model === model);
          assert.ok(product, `missing structured model ${model}`);
          assert.ok(product.name.includes(model));
          assert.equal(product.url, page.url + '#' + row.id);
          assert.ok(d.getElementById(new URL(product.url).hash.slice(1)));
          for (const field of ['offers', 'aggregateRating', 'review']) {
            assert.equal(Object.hasOwn(product, field), false, `no unsupported ${field} for ${model}`);
          }
          const properties = product.additionalProperty || [];
          const propertyMatches = (pattern, value) => properties.some(property => {
            const label = `${property.propertyID || ''} ${property.name || ''}`;
            return pattern.test(label) && (typeof value === 'number' ? Number(property.value) === value : normalize(property.value) === value);
          });
          assert.ok(propertyMatches(/prime|prp|مستمر/i, prime), `${model}: Prime rating matches the table`);
          assert.ok(propertyMatches(/standby|esp|طوارئ/i, standby), `${model}: Standby rating matches the table`);
          assert.ok(propertyMatches(/engine|motor|محرك|موتور/i, engine), `${model}: engine matches the table`);
          assert.ok(propertyMatches(/alternator|ألترنيتور|المولد/i, alternator), `${model}: alternator matches the table`);
        }
      } finally { dom.window.close(); }
    });
  }
}

test('all twelve pages have distinct titles/descriptions and consistent business identity', () => {
  const titles = new Set(), descriptions = new Set(), businesses = [];
  for (const page of pages) {
    const dom = open(page);
    try {
      const d = dom.window.document;
      titles.add(normalize(d.title));
      descriptions.add(normalize(d.querySelector('meta[name="description"]').content));
      const local = structuredData(d).type('LocalBusiness');
      if (!page.slug) assert.ok(local.length > 0, 'homepage identifies the business');
      for (const business of local) {
        assert.equal(business.name, 'Premium Power LLC');
        assert.equal(business.telephone.replace(/[\s()-]/g, ''), '+201229688688');
        assert.equal(new URL(business.url).origin, site);
        assert.ok(d.querySelector('a[href="tel:+201229688688"]'), 'published contact agrees with schema');
        assert.ok(business['@id'], 'business has a stable entity ID');
        assert.equal(new URL(business['@id']).origin, site);
        businesses.push(business['@id']);
      }
    } finally { dom.window.close(); }
  }
  assert.equal(titles.size, pages.length, 'each language/page has its own title');
  assert.equal(descriptions.size, pages.length, 'each language/page has its own description');
  assert.equal(new Set(businesses).size, 1, 'all business declarations use one stable entity ID');
});

test('sitemap and robots cover the same twelve canonical pages and reciprocal languages', () => {
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8'), { contentType: 'text/xml' });
  try {
    const ns = 'http://www.sitemaps.org/schemas/sitemap/0.9';
    const xhtml = 'http://www.w3.org/1999/xhtml';
    const entries = [...dom.window.document.getElementsByTagNameNS(ns, 'url')];
    const urls = entries.map(entry => entry.getElementsByTagNameNS(ns, 'loc')[0].textContent.trim());
    assert.deepEqual([...urls].sort(), pages.map(page => page.url).sort());
    for (const entry of entries) {
      const url = entry.getElementsByTagNameNS(ns, 'loc')[0].textContent.trim();
      const page = pages.find(page => page.url === url);
      const links = [...entry.getElementsByTagNameNS(xhtml, 'link')];
      assert.equal(links.length, 3);
      const alternateMap = Object.fromEntries(links.map(link => [link.getAttribute('hreflang'), link.getAttribute('href')]));
      assert.deepEqual(alternateMap, alternates(page));
      for (const link of links) assert.equal(link.getAttribute('rel'), 'alternate');
    }
    const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
    assert.match(robots, /^User-agent:\s*\*\s*$/mi);
    assert.match(robots, /^Allow:\s*\/\s*$/mi);
    assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/mi);
    assert.match(robots, /^Sitemap:\s*https:\/\/www\.premiumpower-eg\.com\/sitemap\.xml\s*$/mi);
  } finally { dom.window.close(); }
});

test('static local navigation, canonical fragments and image references resolve', () => {
  const cache = new Map();
  const documentFor = file => {
    if (!cache.has(file)) cache.set(file, new JSDOM(fs.readFileSync(file, 'utf8')));
    return cache.get(file).window.document;
  };
  try {
    for (const page of pages) {
      const d = documentFor(path.join(root, page.file));
      for (const element of d.querySelectorAll('a[href],img[src],script[src],link[href]')) {
        const raw = element.getAttribute('href') || element.getAttribute('src');
        if (!raw || raw === '#') continue;
        const url = new URL(raw, page.url);
        if (url.origin !== site) continue;
        let file = path.join(root, decodeURIComponent(url.pathname));
        if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
        assert.ok(fs.existsSync(file), `${page.file}: missing ${raw}`);
        if (url.hash && path.extname(file) === '.html') {
          assert.ok(documentFor(file).getElementById(decodeURIComponent(url.hash.slice(1))), `${page.file}: missing anchor ${raw}`);
        }
      }
    }
  } finally { for (const dom of cache.values()) dom.window.close(); }
});

test('social previews use the company logo card and no page loads third-party fonts', () => {
  const card = '/images/og-premium-power.jpg';
  assert.ok(fs.existsSync(path.join(root, card)));
  assert.equal(fs.existsSync(path.join(root, 'images/BC.jpg')), false, 'personal business card is not published');
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page.file), 'utf8');
    const dom = new JSDOM(html);
    try {
      const d = dom.window.document;
      assert.equal(one(d, 'meta[property="og:image"]', page.file).content, site + card);
      assert.equal(one(d, 'meta[name="twitter:image"]', page.file).content, site + card);
      assert.equal(one(d, 'meta[property="og:image:width"]', page.file).content, '1200');
      assert.equal(one(d, 'meta[property="og:image:height"]', page.file).content, '630');
      assert.ok(normalize(one(d, 'meta[property="og:image:alt"]', page.file).content));
      assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/, `${page.file}: fonts are self-hosted`);
      const preloads = [...d.querySelectorAll('link[rel="preload"][as="font"]')];
      assert.ok(preloads.length > 0, `${page.file}: first-screen font is preloaded`);
      for (const link of preloads) {
        assert.ok(link.hasAttribute('crossorigin'));
        assert.ok(fs.existsSync(path.join(root, link.getAttribute('href'))));
      }
    } finally { dom.window.close(); }
  }
});

test('every page footer links to the three brand catalogues in its own language', () => {
  for (const page of pages) {
    const dom = open(page);
    try {
      const prefix = page.lang === 'ar' ? '/ar/' : '/';
      const footer = one(dom.window.document, 'footer', page.file);
      for (const [slug] of brands) {
        const link = footer.querySelector(`a[href="${prefix}${slug}/"]`);
        assert.ok(link, `${page.file}: footer links to ${prefix}${slug}/`);
        if (page.lang === 'ar') assert.match(link.textContent, /^مولدات /);
      }
    } finally { dom.window.close(); }
  }
});

test('Arabic pages use Arabic search wording and Arabic image descriptions', () => {
  for (const page of pages.filter(item => item.lang === 'ar' && item.slug !== 'privacy')) {
    const dom = open(page);
    try {
      const d = dom.window.document;
      assert.match(d.title + ' ' + d.querySelector('h1').textContent, /مولد(?:ات)? (?:ال)?كهرباء/);
      for (const image of d.querySelectorAll('img[alt]')) {
        const alt = normalize(image.getAttribute('alt'));
        if (alt && !/^(Premium Power|Perkins|Volvo Penta|Doosan)$/.test(alt)) {
          assert.match(alt, /[؀-ۿ]/, `${page.file}: Arabic alt text for ${image.getAttribute('src')}`);
        }
      }
    } finally { dom.window.close(); }
  }
});

test('business structured data lists the published logo, email and both phone numbers', () => {
  const page = pages.find(item => item.lang === 'en' && !item.slug);
  const dom = open(page);
  try {
    const d = dom.window.document;
    const [business] = structuredData(d).type('LocalBusiness');
    assert.ok(fs.existsSync(path.join(root, new URL(business.logo).pathname)));
    assert.ok(d.querySelector(`a[href="mailto:${business.email}"]`), 'published email agrees with schema');
    const phones = business.contactPoint.map(point => point.telephone);
    assert.deepEqual(phones, ['+201229688688', '+201032521321']);
    for (const phone of phones) assert.ok(d.querySelector(`a[href="tel:${phone}"]`), `published phone ${phone}`);
  } finally { dom.window.close(); }
});
