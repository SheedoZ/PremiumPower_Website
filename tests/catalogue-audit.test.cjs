'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const generator = String.raw`
import importlib.util, json, pathlib, sys
root = pathlib.Path.cwd()
sys.path.insert(0, str(root))
spec = importlib.util.spec_from_file_location('build_brands', root / 'build-brands.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
source = module.read('_src/home.html')
brand = sys.argv[1]
lang = sys.argv[2]
models = [
  {'model':'G60PL','engine':'1106A-70TG1','alt':'UCI274C','prime':'50','standby':'55'},
  {'model':'G100PL','engine':'1106A-70TG2','alt':'UCI274D','prime':'80','standby':'88'},
  {'model':'G200PL','engine':'1206A-E70TTAG2','alt':'UCI274G','prime':'150','standby':'165'},
]
translations = module.translations(source)
copy = module.brand_copy(source, brand)
specs = module.spec_rows(source, brand, translations)
html = module.page(brand, lang, module.BRANDS[brand], copy, models, specs, module.read('assets/brand-page.css'))
sys.stdout.write(html)
`;

function generatedPage(brand = 'perkins', lang = 'ar') {
  const result = spawnSync('python', ['-X', 'utf8', '-c', generator, brand, lang], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || 'brand page generator subprocess failed');
  return result.stdout;
}

async function runtimePage(url) {
  const dom = new JSDOM(generatedPage(), { url, runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom;
  window.HTMLElement.prototype.scrollIntoView = function () {};
  window.PREMIUM_POWER_FORM_ENDPOINT = 'https://formspree.io/f/testform';
  window.fetch = async () => ({ ok: true, status: 200, json: async () => ({ next: '/thanks' }) });
  await new Promise(resolve => {
    if (window.document.readyState === 'loading') window.document.addEventListener('DOMContentLoaded', resolve, { once: true });
    else resolve();
  });
  window.eval(fs.readFileSync(path.join(root, 'enquiry.js'), 'utf8'));
  window.eval(fs.readFileSync(path.join(root, 'assets/brand-page.js'), 'utf8'));
  return { dom, window, document: window.document };
}

test('Arabic generator output classifies listed Prime and Standby ranges and keeps broader supply separate', () => {
  const html = generatedPage();
  const dom = new JSDOM(html);
  try {
    const d = dom.window.document;
    const range = d.querySelector('.avail').textContent;
    assert.match(range, /Prime \(PRP\).*50.*150/s);
    assert.match(range, /Standby \(ESP\).*55.*165/s);
    assert.match(range, /9.*2500.*حسب الطلب/s);
    assert.match(d.getElementById('rating-help').textContent, /تشغيل مستمر/);
    assert.match(d.getElementById('rating-help').textContent, /انقطاع الكهرباء/);
    assert.equal(d.querySelector('#rating').parentElement.getAttribute('for'), 'rating');
    assert.ok(d.querySelector('link[href="/assets/enquiry.css?v=20261028"]'));
    assert.ok(d.querySelector('a[href="/ar/maintenance/"]'));
    assert.ok(d.querySelector('a[href="/ar/privacy/"]'));
    assert.match(d.querySelector('.specs').textContent, /التبريد/);
    assert.match(d.querySelector('.specs').textContent, /(?:مبرد|تبريد) بالماء/);
    assert.match(d.querySelector('.specs').textContent, /شاحن توربيني/);
    assert.doesNotMatch(d.querySelector('.specs').textContent, /Cooling|Water Cooled|Turbocharged/);
    assert.match(d.querySelector('.specs').textContent, /II \/ IIIA/);
  } finally {
    dom.window.close();
  }
});

test('all three Arabic brand pages localize descriptive specifications and include the localized privacy route', () => {
  for (const brand of ['perkins', 'volvo', 'doosan']) {
    const dom = new JSDOM(generatedPage(brand, 'ar'));
    try {
      const d = dom.window.document;
      const specs = d.querySelector('.specs').textContent;
      const description = d.querySelector('.lede').textContent;
      assert.match(specs, /عدد الأسطوانات/);
      assert.match(specs, /التبريد/);
      assert.match(specs, /(?:مبرد|تبريد) بالماء/);
      assert.match(specs, /نظام الشحن الهوائي/);
      assert.doesNotMatch(specs, /Cylinders|Cooling|Water Cooled|Turbocharged/);
      assert.doesNotMatch(description, /أداء متطرف|الطاقة الأولية المستمرة/);
      assert.ok(d.querySelector('a[href="/ar/maintenance/"]'));
      assert.ok(d.querySelector('a[href="/ar/privacy/"]'));
    } finally {
      dom.window.close();
    }
  }
});

test('English catalogue pages link to the English maintenance and privacy routes', () => {
  const dom = new JSDOM(generatedPage('volvo', 'en'));
  try {
    const d = dom.window.document;
    assert.ok(d.querySelector('a[href="/maintenance/"]'));
    assert.ok(d.querySelector('a[href="/privacy/"]'));
  } finally {
    dom.window.close();
  }
});

test('compare and rating query state accepts only known models, caps at three, and never injects URL content', async () => {
  const f = await runtimePage('https://www.premiumpower-eg.com/perkins-generators-egypt/?rating=standby&compare=%3Cscript%3Ealert(1)%3C%2Fscript%3E%2CG60PL%2CG100PL%2CG200PL%2CUNKNOWN&campaign=keep');
  try {
    const d = f.document;
    assert.equal(d.getElementById('rating').value, 'standby');
    assert.deepEqual([...d.querySelectorAll('#compare-cards article h3')].map(node => node.textContent), ['G60PL', 'G100PL', 'G200PL']);
    assert.equal(d.querySelectorAll('#compare-cards script, #compare-cards img').length, 0);
    const url = new URL(f.window.location.href);
    assert.equal(url.searchParams.get('rating'), 'standby');
    assert.equal(url.searchParams.get('compare'), 'G60PL,G100PL,G200PL');
    assert.equal(url.searchParams.get('campaign'), 'keep');

    d.querySelector('button[aria-label="إزالة G60PL"]').click();
    assert.equal(new URL(f.window.location.href).searchParams.get('compare'), 'G100PL,G200PL');
    assert.equal(d.querySelectorAll('#compare-cards article').length, 2);
    d.getElementById('reset-filters').click();
    assert.equal(d.getElementById('rating').value, 'prime');
    assert.equal(new URL(f.window.location.href).searchParams.get('rating'), 'prime');
    assert.equal(new URL(f.window.location.href).searchParams.get('compare'), 'G100PL,G200PL');
  } finally {
    f.dom.window.close();
  }
});

test('rating and comparison back-navigation does not replace form notes or selected model data', async () => {
  const f = await runtimePage('https://www.premiumpower-eg.com/perkins-generators-egypt/?rating=standby&compare=G60PL');
  try {
    const d = f.document;
    d.querySelector('[data-quote="G60PL"]').click();
    const form = d.getElementById('contact-form');
    d.getElementById('f-msg').value = 'Keep these notes during history navigation.';
    const before = { ...form.dataset };

    f.window.history.pushState({}, '', '/perkins-generators-egypt/?rating=prime&compare=G200PL&campaign=preserved');
    f.window.dispatchEvent(new f.window.PopStateEvent('popstate'));
    assert.equal(d.getElementById('rating').value, 'prime');
    assert.equal(d.getElementById('f-msg').value, 'Keep these notes during history navigation.');
    assert.deepEqual({ ...form.dataset }, before);
    assert.equal(new URL(f.window.location.href).searchParams.get('campaign'), 'preserved');
    assert.deepEqual([...d.querySelectorAll('#compare-cards article h3')].map(node => node.textContent), ['G200PL']);
  } finally {
    f.dom.window.close();
  }
});
