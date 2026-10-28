'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
async function load(lang='en',reduced=false){
 const dom=new JSDOM(fs.readFileSync(path.join(root,lang==='ar'?'ar/index.html':'index.html'),'utf8'),{url:'https://www.premiumpower-eg.com/'+(lang==='ar'?'ar/':''),runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;let mediaChange;
 const media={matches:reduced,addEventListener:(event,callback)=>{if(event==='change')mediaChange=callback;}};
 w.matchMedia=()=>media;w.IntersectionObserver=class{observe(){}unobserve(){}};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.fetch=async()=>{throw Error('No real or mocked submission is expected for these controls');};
 await new Promise(r=>setImmediate(r));
 for(const script of w.document.scripts){if(script.type==='application/ld+json')continue;if(script.src)w.eval(fs.readFileSync(path.join(root,new URL(script.src).pathname),'utf8'));else w.eval(script.textContent);}
 return {dom,w,d:w.document,changeMedia(value){media.matches=value;mediaChange?.();}};
}
for(const lang of ['en','ar']){
 test(lang+': canopy description and selector occupy separate sibling columns',async()=>{
  const {dom,d}=await load(lang);
  try{
   const layout=d.querySelector('.sound-layout');
   assert.equal(layout.children.length,2);
   assert.ok(layout.children[0].contains(d.querySelector('.sound-tier-grid')));
   assert.ok(layout.children[0].contains(d.getElementById('sound-panel')));
   assert.ok(layout.children[1].contains(d.querySelector('.sound-desc-text')));
   assert.equal(layout.children[1].querySelectorAll('.sound-benefit').length,4);
   assert.equal(d.querySelectorAll('#main-content > section').length,20);
  }finally{dom.window.close();}
 });
 test(lang+': hero maintenance action opens the existing form directly',async()=>{
  const {dom,w,d}=await load(lang);
  try{
   const control=d.querySelector('#home [data-i18n="btnMaintenanceAssessment"]').closest('button');
   assert.ok(control,'The direct lead action must not become a navigation detour');
   assert.match(control.getAttribute('onclick'),/openEnquiry\('maintenance','assessment'\)/);
   w.app.openEnquiry('maintenance','assessment');
   assert.equal(d.getElementById('f-type').value,'maintenance');
   assert.equal(d.getElementById('f-plan').value,'assessment');
   assert.equal(d.activeElement.id,'f-name');
   assert.equal(w.location.pathname,lang==='ar'?'/ar/':'/');
  }finally{dom.window.close();}
 });
 test(lang+': client images autoplay without visible or keyboard-only motion controls',async()=>{
  const {dom,d,w,changeMedia}=await load(lang,true);
  try{
   const strip=d.getElementById('client-strip');
   assert.equal(strip.dataset.motion,'playing');
   assert.equal(d.getElementById('client-motion-button'),null);
   assert.equal(d.getElementById('client-motion-controls'),null);
   w.app.switchLanguage(lang==='ar'?'en':'ar');assert.equal(strip.dataset.motion,'playing');
   changeMedia(true);assert.equal(strip.dataset.motion,'playing');
  }finally{dom.window.close();}
 });
}
test('client autoplay remains on when the motion preference changes',async()=>{
 const {dom,d,changeMedia}=await load('en',false);
 try{
  assert.equal(d.getElementById('client-strip').dataset.motion,'playing');
  changeMedia(true);assert.equal(d.getElementById('client-strip').dataset.motion,'playing');
  changeMedia(false);assert.equal(d.getElementById('client-strip').dataset.motion,'playing');
  assert.equal(d.querySelectorAll('#client-strip > div').length,2,'Seamless duplicate groups remain available');
 }finally{dom.window.close();}
});

test('Arabic numeric contact links and sound units keep left-to-right display',async()=>{
 const {dom,d}=await load('ar');
 try{
  for(const link of d.querySelectorAll('a[href^="tel:"]')){
   if(/^[\s\d+()/-]+$/.test(link.textContent))assert.equal(link.getAttribute('dir'),'ltr');
  }
  assert.equal(d.getElementById('sound-db').getAttribute('dir'),'ltr');
  assert.ok(d.querySelector('#contact a[href="tel:+201229688688"]'));
 }finally{dom.window.close();}
});
