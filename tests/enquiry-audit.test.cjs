'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const enquirySource = fs.readFileSync(path.join(root, 'enquiry.js'), 'utf8');

const markup = `<!doctype html>
<html lang="en"><body>
  <section id="contact">
    <form id="contact-form">
      <p id="product-context" hidden></p>
      <input id="f-name" name="name" required>
      <input id="f-phone" name="phone" required>
      <input id="f-location" name="location" required>
      <select id="f-type" name="enquiry_type" required><option value="sales">Sales</option><option value="maintenance">Maintenance</option></select>
      <div id="plan-group" hidden><select id="f-plan" name="maintenance_plan" disabled><option value="assessment">Assessment</option><option value="standard">Standard</option><option value="premium">Premium</option></select></div>
      <div class="form-group"><label for="f-msg">Message</label><textarea id="f-msg" name="message"></textarea></div>
      <div class="form-submit-wrap"><button id="f-submit" type="submit">Send enquiry</button><div id="form-status" hidden></div></div>
    </form>
  </section>
</body></html>`;

async function fixture({ lang = 'en', fetchImpl } = {}) {
  const dom = new JSDOM(markup.replace('lang="en"', `lang="${lang}"`), {
    url: 'https://www.premiumpower-eg.com/perkins-generators-egypt/',
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  });
  const { window } = dom;
  await new Promise(resolve => {
    if (window.document.readyState === 'loading') window.document.addEventListener('DOMContentLoaded', resolve, { once: true });
    else resolve();
  });
  window.PREMIUM_POWER_FORM_ENDPOINT = 'https://formspree.io/f/testform';
  const requests = [];
  window.fetch = async (url, options) => {
    requests.push({ url, options });
    return fetchImpl ? fetchImpl(url, options) : { ok: true, status: 200, json: async () => ({ next: '/thanks' }) };
  };
  window.eval(enquirySource);
  const { document } = window;
  for (const [id, value] of Object.entries({
    'f-name': 'Test customer',
    'f-phone': '01229688688',
    'f-location': 'Cairo',
    'f-msg': 'Keep this note separate from the selected model.',
  })) document.getElementById(id).value = value;
  return { dom, window, document, api: window.PremiumPowerEnquiry, requests };
}

const bodyOf = f => JSON.parse(f.requests.at(-1).options.body);
const close = f => f.dom.window.close();

test('sales optional details are localized, optional, and separate from selected catalogue data', async () => {
  const f = await fixture();
  try {
    const d = f.document;
    assert.ok(d.getElementById('enquiry-details'));
    assert.ok(d.getElementById('f-msg').parentElement.nextElementSibling.matches('#enquiry-details'));
    for (const id of ['f-name', 'f-phone', 'f-location', 'f-type']) assert.equal(d.getElementById(id).required, true);
    for (const id of ['f-sales-application', 'f-sales-capacity', 'f-sales-timing', 'f-maintenance-purpose', 'f-maintenance-count', 'f-maintenance-make-model', 'f-maintenance-issue']) {
      assert.equal(d.getElementById(id).required, false);
    }
    assert.equal(d.getElementById('sales-optional-details').hidden, false);
    assert.equal(d.getElementById('maintenance-optional-details').hidden, true);

    f.api.setProduct({ brand: 'Perkins', model: 'G60PL', capacity: 55, rating: 'Standby' });
    d.getElementById('f-sales-application').value = 'Data centre backup';
    const unknown = d.getElementById('f-sales-capacity-unknown');
    const requiredCapacity = d.getElementById('f-sales-capacity');
    assert.equal(unknown.checked, false);
    assert.equal(requiredCapacity.disabled, false);
    unknown.checked = false;
    unknown.dispatchEvent(new f.window.Event('change', { bubbles: true }));
    requiredCapacity.value = '250.5';
    d.getElementById('f-sales-timing').value = 'Next quarter';

    assert.equal(await f.api.submit(d.getElementById('contact-form')), true);
    const payload = bodyOf(f);
    assert.equal(payload.application, 'Data centre backup');
    assert.equal(payload.required_capacity_kva, 250.5);
    assert.equal(payload.preferred_timing, 'Next quarter');
    assert.equal(payload.brand, 'Perkins');
    assert.equal(payload.model, 'G60PL');
    assert.equal(payload.capacity, 55);
    assert.equal(payload.rating, 'Standby');
    assert.equal(payload.message, 'Keep this note separate from the selected model.');
    assert.equal(Object.hasOwn(payload, 'maintenance_purpose'), false);
    assert.equal(d.getElementById('f-sales-application').value, '');
    assert.equal(requiredCapacity.value, '');
    assert.equal(unknown.checked, false);
    assert.equal(d.getElementById('enquiry-details').open, false);
  } finally {
    close(f);
  }
});

test('the explicit unknown-capacity choice is sent without making capacity mandatory', async () => {
  const f = await fixture();
  try {
    const d = f.document;
    d.getElementById('f-sales-application').value = 'General standby';
    d.getElementById('f-sales-capacity-unknown').checked = true;
    d.getElementById('f-sales-capacity-unknown').dispatchEvent(new f.window.Event('change', {bubbles:true}));
    assert.equal(d.getElementById('f-sales-capacity-unknown').checked, true);
    assert.equal(d.getElementById('f-sales-capacity').disabled, true);
    assert.equal(await f.api.submit(d.getElementById('contact-form')), true);
    const payload = bodyOf(f);
    assert.equal(payload.required_capacity, 'unknown');
    assert.equal(Object.hasOwn(payload, 'required_capacity_kva'), false);
  } finally {
    close(f);
  }
});

test('maintenance optional details use only contract or existing-service purpose values', async () => {
  const f = await fixture();
  try {
    const d = f.document;
    f.api.setPath('maintenance', 'standard');
    assert.equal(d.getElementById('sales-optional-details').hidden, true);
    assert.equal(d.getElementById('maintenance-optional-details').hidden, false);
    d.getElementById('f-maintenance-purpose').value = 'service';
    d.getElementById('f-maintenance-count').value = '2';
    d.getElementById('f-maintenance-make-model').value = 'Perkins 1106A / G60PL';
    d.getElementById('f-maintenance-issue').value = 'Unusual vibration during operation';
    assert.equal(await f.api.submit(d.getElementById('contact-form')), true);
    const payload = bodyOf(f);
    assert.equal(payload.maintenance_purpose, 'service');
    assert.equal(payload.generator_count, 2);
    assert.equal(payload.generator_make_model, 'Perkins 1106A / G60PL');
    assert.equal(payload.current_issue, 'Unusual vibration during operation');
    assert.equal(payload.maintenance_plan, 'standard');
    assert.equal(Object.hasOwn(payload, 'brand'), false);
    assert.equal(Object.hasOwn(payload, 'required_capacity_kva'), false);
  } finally {
    close(f);
  }
});

test('failed responses preserve optional details for a retry and successful acknowledgement clears them', async () => {
  let rejectFirst = true;
  const f = await fixture({ fetchImpl: async () => rejectFirst
    ? { ok: false, status: 422, json: async () => ({ errors: [{ field: 'message' }] }) }
    : { ok: true, status: 200, json: async () => ({ next: '/thanks' }) } });
  try {
    const d = f.document;
    d.getElementById('f-sales-application').value = 'Water treatment plant';
    d.getElementById('f-sales-timing').value = 'Before year end';
    assert.equal(await f.api.submit(d.getElementById('contact-form')), false);
    assert.equal(f.requests.length, 1);
    assert.equal(d.getElementById('f-sales-application').value, 'Water treatment plant');
    assert.equal(d.getElementById('f-sales-timing').value, 'Before year end');
    assert.equal(d.getElementById('f-msg').value, 'Keep this note separate from the selected model.');
    rejectFirst = false;
    assert.equal(await f.api.submit(d.getElementById('contact-form')), true);
    assert.equal(f.requests.length, 2);
    assert.equal(bodyOf(f).application, 'Water treatment plant');
    assert.equal(d.getElementById('f-sales-application').value, '');
    assert.equal(d.getElementById('f-msg').value, '');
  } finally {
    close(f);
  }
});

test('pending submission disables optional controls and blocks path changes', async () => {
  let release;
  const f = await fixture({ fetchImpl: () => new Promise(resolve => { release = resolve; }) });
  try {
    const d = f.document;
    d.getElementById('f-sales-timing').value = 'Next month';
    const pending = f.api.submit(d.getElementById('contact-form'));
    await Promise.resolve();
    assert.equal(d.getElementById('f-sales-timing').disabled, true);
    assert.equal(f.api.setPath('maintenance'), false);
    assert.equal(d.getElementById('f-type').value, 'sales');
    assert.equal(f.requests.length, 1);
    release({ ok: true, status: 200, json: async () => ({ next: '/thanks' }) });
    assert.equal(await pending, true);
    assert.equal(d.getElementById('f-sales-timing').disabled, false);
  } finally {
    close(f);
  }
});

test('inactive-path number fields are disabled so their invalid values cannot block the current route', async () => {
  const f = await fixture();
  try {
    const d = f.document;
    f.api.setPath('maintenance');
    const count = d.getElementById('f-maintenance-count');
    count.value = '0';
    assert.equal(count.checkValidity(), false);
    assert.equal(d.getElementById('contact-form').checkValidity(), false);

    f.api.setPath('sales');
    assert.equal(d.getElementById('maintenance-optional-details').hidden, true);
    assert.equal(count.disabled, true);
    assert.equal(d.getElementById('contact-form').checkValidity(), true);

    f.api.setPath('maintenance');
    assert.equal(count.disabled, false);
    assert.equal(count.checkValidity(), false);
  } finally {
    close(f);
  }
});

test('local enquiry events expose only generic stage, path type, and language fields', async () => {
  const f = await fixture({ lang: 'ar' });
  try {
    const d = f.document;
    const events = [];
    d.addEventListener('premium-power:enquiry', event => events.push(event.detail));
    f.api.setPath('maintenance', 'standard');
    d.getElementById('f-name').focus();
    assert.equal(await f.api.submit(d.getElementById('contact-form')), true);
    assert.deepEqual(events.map(event => event.stage), ['path_change', 'form_start', 'submit', 'receipt']);
    assert.ok(events.every(event => Object.keys(event).sort().join(',') === 'lang,stage,type'));
    assert.ok(events.every(event => event.lang === 'ar' && event.type === 'maintenance'));
    assert.doesNotMatch(JSON.stringify(events), /Test customer|01229688688|Cairo|Keep this note/);
  } finally {
    close(f);
  }

  const invalid = await fixture();
  try {
    const events = [];
    invalid.document.addEventListener('premium-power:enquiry', event => events.push(event.detail));
    invalid.document.getElementById('f-name').value = ' ';
    assert.equal(await invalid.api.submit(invalid.document.getElementById('contact-form')), false);
    assert.deepEqual(events.map(({ stage, type, lang }) => ({ stage, type, lang })), [
      { stage: 'form_start', type: 'sales', lang: 'en' },
      { stage: 'error', type: 'sales', lang: 'en' },
    ]);
  } finally {
    close(invalid);
  }
});

test('Arabic optional fields are translated while phone normalization remains available', async () => {
  const f = await fixture({ lang: 'ar' });
  try {
    const d = f.document;
    assert.equal(d.documentElement.lang, 'ar');
    assert.match(d.querySelector('#enquiry-details summary').textContent, /تفاصيل/);
    assert.match(d.querySelector('label[for="f-sales-application"]').textContent, /الاستخدام/);
    assert.match(d.querySelector('label[for="f-sales-capacity-unknown"]').textContent, /لا أعرف/);
    d.getElementById('f-phone').value = '٠١٢٢٩٦٨٨٦٨٨';
    assert.equal(await f.api.submit(d.getElementById('contact-form')), true);
    assert.match(bodyOf(f).phone, /^0[0-9]+$/);
  } finally {
    close(f);
  }
});

test('untouched optional details do not invent an unknown-capacity answer', async () => {
  const f=await fixture();
  try {
    f.api.setProduct({brand:'Perkins',model:'G60PL',capacity:64,rating:'Standby'});
    assert.equal(await f.api.submit(f.document.getElementById('contact-form')),true);
    assert.equal(Object.hasOwn(bodyOf(f),'required_capacity'),false);
    assert.equal(Object.hasOwn(bodyOf(f),'required_capacity_kva'),false);
    assert.equal(bodyOf(f).capacity,64);
  } finally {close(f);}
});
test('invalid optional numbers are explained, never silently discarded', async () => {
  const f=await fixture();
  try {
    const d=f.document;
    d.getElementById('f-sales-capacity').value='-1';
    assert.equal(await f.api.submit(d.getElementById('contact-form')),false);
    assert.equal(f.requests.length,0);
    assert.equal(d.activeElement.id,'f-sales-capacity');
    assert.equal(d.getElementById('enquiry-details').open,true);
    f.api.setPath('maintenance');
    d.getElementById('f-maintenance-count').value='2.5';
    assert.equal(await f.api.submit(d.getElementById('contact-form')),false);
    assert.equal(f.requests.length,0);
    assert.equal(d.activeElement.id,'f-maintenance-count');
    assert.equal(d.getElementById('f-maintenance-count').value,'2.5');
    d.getElementById('f-maintenance-count').value='2';
    assert.equal(await f.api.submit(d.getElementById('contact-form')),true);
    assert.equal(bodyOf(f).generator_count,2);
  } finally {close(f);}
});
