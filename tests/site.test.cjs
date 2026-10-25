'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
async function load(file){
  const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:'https://www.premiumpower-eg.com/'+file.replace(/index.html$/,''),runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;
  w.IntersectionObserver=class{observe(){}unobserve(){}};
  w.HTMLElement.prototype.scrollIntoView=function(){};
  const requests=[];
  w.fetch=async(url,options)=>{requests.push(JSON.parse(options.body));return {ok:true,json:async()=>({next:'/thanks'})};};
  await new Promise(resolve=>setImmediate(resolve));
  for(const script of w.document.scripts){
    if(script.type==='application/ld+json')continue;
    if(script.src){const url=new URL(script.src);if(url.origin!==w.location.origin)continue;w.eval(fs.readFileSync(path.join(root,url.pathname),'utf8'));}
    else w.eval(script.textContent);
  }
  return {dom,w,d:w.document,requests};
}
for(const lang of ['en','ar']){
 test(`${lang}: latest calculator inputs and brand are reflected in quote; customer notes are preserved`,async()=>{
  const {dom,w,d,requests}=await load(lang==='ar'?'ar/index.html':'index.html');
  try{
   d.getElementById('c-ac1').value='1';w.app.calcKVA();
   d.getElementById('c-ac1').value='10';w.app.requestQuote('Perkins');
   assert.equal(d.getElementById('contact-form').dataset.capacity,'19');
   assert.equal(d.getElementById('f-msg').value,'');
   d.getElementById('f-msg').value='Please include an ATS';w.app.requestQuote('Doosan');
   assert.match(d.getElementById('product-context').textContent,/Doosan/);
   assert.doesNotMatch(d.getElementById('product-context').textContent,/Perkins/);
   assert.equal(d.getElementById('f-msg').value,'Please include an ATS');
   for(const [id,value] of Object.entries({'f-name':'Test','f-phone':'01229688688','f-location':'Cairo'}))d.getElementById(id).value=value;
   assert.equal(await w.PremiumPowerEnquiry.submit(d.getElementById('contact-form')),true);
   assert.equal(requests[0].brand,'Doosan');assert.equal(requests[0].capacity,19);assert.equal(requests[0].language,lang);
   assert.equal(d.getElementById('product-context').hidden,true);
  }finally{dom.window.close();}
 });
 test(`${lang}: calculator bounds, reset and editable fuel price`,async()=>{
  const {dom,w,d}=await load(lang==='ar'?'ar/index.html':'index.html');
  try{
   const ac=d.getElementById('c-ac1');ac.value='51';w.app.calcKVA();assert.equal(ac.value,'50');assert.equal(d.getElementById('r-kva').textContent,'94');
   ac.value='1.9';w.app.calcKVA();assert.equal(ac.value,'1');
   d.getElementById('c-hours').value='8';d.getElementById('c-price').value='10';w.app.calcKVA();assert.equal(d.getElementById('r-fuel').textContent,'0.3');
   const first=d.getElementById('r-cost').textContent;d.getElementById('c-price').value='20';w.app.calcKVA();assert.notEqual(d.getElementById('r-cost').textContent,first);
   ac.value='0';w.app.calcKVA();assert.equal(d.getElementById('calc-result').style.display,'none');assert.equal(d.getElementById('calc-placeholder').style.display,'block');
  }finally{dom.window.close();}
 });
 for(const [slug,brand,count] of [['perkins-generators-egypt','Perkins',18],['volvo-penta-generators-egypt','Volvo Penta',13],['doosan-generators-egypt','Doosan',9]]){
 test(`${lang} ${brand}: filter, sort, compare limit, inline model quote and maintenance reset`,async()=>{
  const {dom,w,d,requests}=await load((lang==='ar'?'ar/':'')+slug+'/index.html');
  const input=(id,value)=>{d.getElementById(id).value=value;d.getElementById(id).dispatchEvent(new w.Event('input',{bubbles:true}));};
  try{
   const rows=[...d.querySelectorAll('#model-table tbody tr')];assert.equal(rows.length,count);
   const first=rows[0].dataset;
   input('model-search',first.model);assert.equal(rows.filter(r=>!r.hidden).length,1);
   input('model-search','not-a-model');assert.equal(d.getElementById('no-results').hidden,false);
   d.getElementById('reset-filters').click();assert.equal(rows.filter(r=>!r.hidden).length,count);
   input('min-kva','500');input('max-kva','100');assert.match(d.getElementById('max-kva').getAttribute('aria-invalid'),/true/);
   d.getElementById('reset-filters').click();input('model-sort','desc');
   assert.equal(Number(d.querySelector('#model-table tbody tr').dataset.prime),Math.max(...rows.map(r=>Number(r.dataset.prime))));
   const boxes=[...d.querySelectorAll('.compare-check')];boxes[0].click();boxes[1].click();boxes[2].click();assert.equal(d.querySelectorAll('#compare-cards article').length,3);assert.equal(boxes[3].disabled,true);
   d.getElementById('clear-compare').click();assert.equal(boxes[3].disabled,false);
   input('rating','standby');d.querySelector(`[data-quote="${first.model}"]`).click();
   const form=d.getElementById('contact-form');assert.equal(form.dataset.model,first.model);assert.equal(Number(form.dataset.capacity),Number(first.standby));assert.equal(form.dataset.rating,'Standby');
   assert.match(d.getElementById('product-context').textContent,new RegExp(first.model));
   for(const [id,value] of Object.entries({'f-name':'Test','f-phone':'٠١٢٢٩٦٨٨٦٨٨','f-location':'Cairo','f-msg':'Check installation access'}))d.getElementById(id).value=value;
   await w.PremiumPowerEnquiry.submit(form);assert.equal(requests[0].brand,brand);assert.equal(requests[0].model,first.model);assert.equal(requests[0].capacity,Number(first.standby));assert.equal(requests[0].rating,'Standby');assert.equal(requests[0].language,lang);
   d.querySelector(`[data-quote="${first.model}"]`).click();d.getElementById('f-type').value='maintenance';d.getElementById('f-type').dispatchEvent(new w.Event('change'));
   assert.equal(form.dataset.model,undefined);assert.equal(d.getElementById('product-context').hidden,true);
  }finally{dom.window.close();}
 });
 }
}
test('Arabic links and static translated forms stay Arabic before scripts run',()=>{
 const home=new JSDOM(fs.readFileSync(path.join(root,'ar/index.html'),'utf8'));
 try{for(const a of home.window.document.querySelectorAll('[data-i18n="btnAllModels"]'))assert.match(a.getAttribute('href'),/^\/ar\//);
 assert.equal(home.window.document.querySelector('[data-i18n="fuelPrice"]').textContent,'سعر السولار (جنيه/لتر)');
 assert.match(home.window.document.querySelector('[data-i18n="heroSub"]').textContent,/حلول/);
 }finally{home.window.close();}
});

test('model selection cannot change an enquiry while its receipt is pending',async()=>{
 const {dom,w,d}=await load('perkins-generators-egypt/index.html');
 try{
  d.querySelector('[data-quote="G60PL"]').click();
  for(const [id,value] of Object.entries({'f-name':'Test','f-phone':'01229688688','f-location':'Cairo'}))d.getElementById(id).value=value;
  let release;w.fetch=()=>new Promise(resolve=>{release=resolve;});
  const pending=w.PremiumPowerEnquiry.submit(d.getElementById('contact-form'));
  d.querySelector('[data-quote="G100PL"]').click();
  assert.equal(d.getElementById('contact-form').dataset.model,'G60PL');
  release({ok:true,json:async()=>({next:'/thanks'})});await pending;
  assert.equal(d.getElementById('contact-form').dataset.brand,'Perkins');
  assert.equal(d.getElementById('contact-form').dataset.model,undefined);
 }finally{dom.window.close();}
});
