'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

function fixture({ endpoint = 'https://formspree.io/f/testform', lang = 'en', fetchImpl } = {}) {
  const elements = new Map();
  const classes = () => {
    const values = new Set();
    return { add: (...x) => x.forEach(v => values.add(v)), remove: (...x) => x.forEach(v => values.delete(v)), contains: x => values.has(x), toggle: (x, force) => { const enabled = force === undefined ? !values.has(x) : force; enabled ? values.add(x) : values.delete(x); return enabled; } };
  };
  function element(id, value = '') {
    const attributes = new Map();
    const el = { id, value, defaultValue: value, disabled: false, hidden: false, textContent: '', innerHTML: '', dataset: {}, style: {}, classList: classes(),
      setAttribute(k,v) { attributes.set(k,String(v)); }, getAttribute(k) { return attributes.get(k) ?? null; }, removeAttribute(k) { attributes.delete(k); },
      focus() { document.activeElement = this; }, scrollIntoView() {}, addEventListener() {}, removeEventListener() {},
      checkValidity() { return !this.required || !!this.value.trim(); }, reportValidity() { return this.checkValidity(); },
      querySelector(selector) { return document.querySelector(selector); }, querySelectorAll(selector) { return document.querySelectorAll(selector); }
    };
    elements.set(id, el); return el;
  }
  const fields = {
    'f-name':'Test customer', 'f-phone':'01229688688', 'f-location':'Cairo', 'f-type':'sales', 'f-plan':'assessment', 'f-msg':'Please call me about the project.'
  };
  for (const [id,value] of Object.entries(fields)) element(id,value);
  for (const id of ['form-status','phone-err','plan-group','contact','f-brand','f-capacity']) element(id);
  for (const id of ['f-name','f-phone','f-location','f-type']) elements.get(id).required = true;
  const button = element('f-submit'); button.type = 'submit'; button.textContent = 'Send enquiry';
  const form = element('contact-form');
  form.elements = Object.values(fields).map((_, i) => elements.get(Object.keys(fields)[i]));
  form.elements.namedItem = name => elements.get(name) || form.elements.find(e => e.name === name);
  form.resetCount = 0;
  form.reset = () => { form.resetCount++; for (const id of Object.keys(fields)) elements.get(id).value = ['f-type','f-plan'].includes(id) ? fields[id] : ''; };
  form.querySelector = selector => /submit/.test(selector) ? button : document.querySelector(selector);
  form.querySelectorAll = selector => /input|select|textarea|button/.test(selector) ? [...form.elements, button] : document.querySelectorAll(selector);
  const document = {
    documentElement: {lang}, body: {classList: classes()}, readyState: 'complete', activeElement: null,
    getElementById: id => elements.get(id) || null,
    querySelector: selector => selector.startsWith('#') ? elements.get(selector.slice(1)) || null : /submit/.test(selector) ? button : null,
    querySelectorAll: selector => /input|select|textarea|button/.test(selector) ? [...form.elements, button] : [],
    addEventListener() {}, createElement: tag => element('created-' + elements.size)
  };
  const requests = [];
  const fakeFetch = async (url, options) => { requests.push({url, options}); return fetchImpl ? fetchImpl(url, options) : {ok:true,status:200,json:async()=>({next:'/thanks'})}; };
  const timers = new Map(); let nextTimer = 1;
  const window = { document, PREMIUM_POWER_FORM_ENDPOINT:endpoint, fetch:fakeFetch, AbortController, URL,
    setTimeout(fn) { const id=nextTimer++; timers.set(id,fn); return id; }, clearTimeout(id) { timers.delete(id); }, addEventListener() {},
    app: {}, location: {href:'http://localhost:8080/',origin:'http://localhost:8080'} };
  const sandbox = {window,document,fetch:fakeFetch,AbortController,URL,console,setTimeout:window.setTimeout,clearTimeout:window.clearTimeout};
  vm.runInNewContext(fs.readFileSync(path.join(root,'enquiry.js'),'utf8'), sandbox, {filename:'enquiry.js'});
  return {api:window.PremiumPowerEnquiry,window,form,button,elements,requests,timers,document};
}

const submit = f => f.api.submit(f.form);

test('empty or foreign endpoint never sends and preserves enquiry', async () => {
  for (const endpoint of ['', 'https://example.com/f/test', 'http://formspree.io/f/test', 'https://formspree.io.evil.example/f/test']) {
    const f=fixture({endpoint}); const note=f.elements.get('f-msg').value;
    assert.equal(await submit(f), false);
    assert.equal(f.requests.length,0); assert.equal(f.form.resetCount,0);
    assert.equal(f.elements.get('f-msg').value,note);
  }
});

test('blank required fields and invalid phone never reach receiver', async () => {
  for (const [id,value] of [['f-name','   '],['f-location','   '],['f-phone','123'],['f-type','']]) {
    const f=fixture(); f.elements.get(id).value=value;
    assert.equal(await submit(f),false); assert.equal(f.requests.length,0); assert.equal(f.form.resetCount,0);
  }
});

test('accepted sales enquiry sends expected fields and clears only after receipt', async () => {
  const f=fixture(); assert.equal(await submit(f),true);
  assert.equal(f.requests.length,1); const {url,options}=f.requests[0];
  assert.equal(url,'https://formspree.io/f/testform'); assert.equal(options.method,'POST');
  const body=JSON.parse(options.body);
  assert.equal(body.name,'Test customer'); assert.equal(body.location,'Cairo'); assert.equal(body.enquiry_type,'sales'); assert.equal(body.language,'en');
  assert.equal(body.message,'Please call me about the project.');
  assert.equal(Object.hasOwn(body,'maintenance_plan'),false); assert.equal(Object.hasOwn(body,'capacity'),false);
  assert.equal(f.form.resetCount,1); assert.equal(f.button.disabled,false);
});

test('maintenance plan survives routing and is included in accepted enquiry', async () => {
  for (const plan of ['assessment','standard','premium']) {
    const f=fixture(); const note=f.elements.get('f-msg').value;
    f.api.setPath('maintenance',plan);
    assert.equal(f.elements.get('f-type').value,'maintenance'); assert.equal(f.elements.get('f-plan').value,plan);
    assert.equal(f.elements.get('f-plan').disabled,false); assert.equal(f.elements.get('f-msg').value,note);
    assert.equal(await submit(f),true); assert.equal(JSON.parse(f.requests[0].options.body).maintenance_plan,plan);
  }
});

test('switching from maintenance to sales preserves notes and excludes maintenance plan', async () => {
  const f=fixture(); f.api.setPath('maintenance','premium'); f.api.setPath('sales');
  assert.equal(f.elements.get('f-plan').disabled,true);
  assert.equal(f.elements.get('f-msg').value,'Please call me about the project.');
  assert.equal(await submit(f),true); assert.equal(Object.hasOwn(JSON.parse(f.requests[0].options.body),'maintenance_plan'),false);
});

test('HTTP and malformed acknowledgement failures never claim receipt or clear fields', async () => {
  for (const response of [
    {ok:false,status:422,json:async()=>({errors:[{field:'phone',message:'invalid'}]})},
    {ok:false,status:429,json:async()=>({error:'rate limit'})},
    {ok:false,status:500,json:async()=>({error:'temporary'})},
    {ok:true,status:200,json:async()=>({ok:false})},
    {ok:true,status:200,json:async()=>({ok:true})},
    {ok:true,status:200,json:async()=>({next:'/thanks',errors:[{message:'blocked'}]})},
    {ok:true,status:200,json:async()=>({})},
    {ok:true,status:200,json:async()=>{throw new SyntaxError('HTML instead of JSON');}}
  ]) {
    const f=fixture({fetchImpl:async()=>response}); const note=f.elements.get('f-msg').value;
    assert.equal(await submit(f),false); assert.equal(f.form.resetCount,0);
    assert.equal(f.elements.get('f-msg').value,note); assert.equal(f.button.disabled,false);
  }
});

test('network error leaves a retryable enquiry intact', async () => {
  const f=fixture({fetchImpl:async()=>{throw new TypeError('Failed to fetch');}});
  assert.equal(await submit(f),false); assert.equal(f.form.resetCount,0);
  assert.equal(f.elements.get('f-name').value,'Test customer'); assert.equal(f.button.disabled,false);
});

test('rapid repeated submission creates one request while pending', async () => {
  let resolve; const response=new Promise(r=>{resolve=r;});
  const f=fixture({fetchImpl:()=>response});
  const first=submit(f); await Promise.resolve();
  assert.equal(f.button.disabled,true); assert.equal(await submit(f),false); assert.equal(f.requests.length,1);
  resolve({ok:true,status:200,json:async()=>({next:'/thanks'})});
  assert.equal(await first,true); assert.equal(f.form.resetCount,1);
});

test('Arabic enquiry keeps language and accepts Arabic numerals in an Egyptian mobile', async () => {
  const f=fixture({lang:'ar'}); f.elements.get('f-phone').value='٠١٢٢٩٦٨٨٦٨٨'; f.elements.get('f-name').value='عميل تجريبي';
  assert.equal(await submit(f),true); const body=JSON.parse(f.requests[0].options.body);
  assert.equal(body.language,'ar'); assert.equal(body.name,'عميل تجريبي'); assert.match(body.phone,/^[+0-9]+$/);
});


test('timeout preserves data and reports uncertain receipt without automatic resend', async () => {
  const f=fixture({fetchImpl:(_url,options)=>new Promise((_resolve,reject)=>{
    options.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true});
  })});
  const pending=submit(f); await Promise.resolve();
  assert.equal(f.requests.length,1); assert.equal(f.form.resetCount,0);
  for (const callback of f.timers.values()) callback();
  assert.equal(await pending,false); assert.equal(f.requests.length,1);
  assert.equal(f.elements.get('f-msg').value,'Please call me about the project.');
  assert.equal(f.elements.get('form-status').classList.contains('uncertain'),true);
  assert.equal(f.button.disabled,false);
});

test('path buttons cannot change the submitted request while it is pending', async () => {
  let resolve; const response=new Promise(r=>{resolve=r;});
  const f=fixture({fetchImpl:()=>response}); f.api.setPath('maintenance','standard');
  const pending=submit(f); await Promise.resolve();
  assert.equal(f.api.setPath('sales'),false);
  assert.equal(f.elements.get('f-type').value,'maintenance'); assert.equal(f.elements.get('f-msg').disabled,true);
  resolve({ok:true,status:200,json:async()=>({next:'/thanks'})}); await pending;
  assert.equal(f.elements.get('f-type').value,'maintenance'); assert.equal(f.elements.get('f-plan').value,'standard');
  assert.equal(f.elements.get('f-msg').disabled,false);
});

test('sales context includes known brand and capacity, while generic paths clear stale context', async () => {
  const f=fixture(); f.form.dataset.brand='Perkins'; f.form.dataset.capacity='19';
  assert.equal(await submit(f),true);
  const body=JSON.parse(f.requests[0].options.body);
  assert.equal(body.brand,'Perkins'); assert.equal(body.capacity,19);
  for (const capacity of ['0','', 'NaN', '-1']) {
    const unknown=fixture(); unknown.form.dataset.capacity=capacity;
    assert.equal(await submit(unknown),true);
    assert.equal(Object.hasOwn(JSON.parse(unknown.requests[0].options.body),'capacity'),false);
  }
  for (const type of ['sales','maintenance']) {
    const routed=fixture(); routed.form.dataset.brand='Perkins'; routed.form.dataset.capacity='19';
    routed.api.open(type);
    assert.equal(Object.hasOwn(routed.form.dataset,'brand'),false);
    assert.equal(Object.hasOwn(routed.form.dataset,'capacity'),false);
  }
});
