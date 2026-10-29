'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
async function load(lang='en',reduced=false,configure=()=>{}){
 const dom=new JSDOM(fs.readFileSync(path.join(root,lang==='ar'?'ar/index.html':'index.html'),'utf8'),{url:'https://www.premiumpower-eg.com/'+(lang==='ar'?'ar/':''),runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;let mediaChange;
 const media={matches:reduced,addEventListener:(event,callback)=>{if(event==='change')mediaChange=callback;}};
 const observers=[];w.matchMedia=()=>media;w.IntersectionObserver=class{constructor(callback){this.callback=callback;this.targets=[];observers.push(this);}observe(el){this.targets.push(el);}unobserve(el){this.targets=this.targets.filter(x=>x!==el);}};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.fetch=async()=>{throw Error('No real or mocked submission is expected for these controls');};
 configure(w);
 await new Promise(r=>setImmediate(r));
 for(const script of w.document.scripts){if(script.type==='application/ld+json')continue;if(script.src)w.eval(fs.readFileSync(path.join(root,new URL(script.src).pathname),'utf8'));else w.eval(script.textContent);}
 return {dom,w,d:w.document,observers,changeMedia(value){media.matches=value;mediaChange?.();}};
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
 test(lang+': client motion follows preference until the visitor makes a persistent choice',async()=>{
  const {dom,d,w,changeMedia}=await load(lang,true);
  try{
   const strip=d.getElementById('client-strip'),button=d.getElementById('client-motion-button');
   assert.equal(strip.dataset.motion,'paused');assert.equal(button.hidden,false);
   button.click();assert.equal(strip.dataset.motion,'playing');
   changeMedia(true);assert.equal(strip.dataset.motion,'playing');
   button.click();assert.equal(strip.dataset.motion,'paused');
   assert.equal(w.localStorage.getItem('pp-client-motion'),'paused');
   w.app.switchLanguage(lang==='ar'?'en':'ar');assert.equal(strip.dataset.motion,'paused');
   assert.equal(d.getElementById('client-motion-label').textContent,lang==='ar'?'Play image movement':'تشغيل حركة الصور');
  }finally{dom.window.close();}
 });
}
test('automatic client motion follows preference changes when no choice is saved',async()=>{
 const {dom,d,changeMedia}=await load('en',false);
 try{
  assert.equal(d.getElementById('client-strip').dataset.motion,'playing');
  changeMedia(true);assert.equal(d.getElementById('client-strip').dataset.motion,'paused');
  changeMedia(false);assert.equal(d.getElementById('client-strip').dataset.motion,'playing');
 }finally{dom.window.close();}
});
test('a previously paused client strip remains paused after reloading',async()=>{
 const {dom,d}=await load('en',false,w=>w.localStorage.setItem('pp-client-motion','paused'));
 try{
  assert.equal(d.getElementById('client-strip').dataset.motion,'paused');
  d.getElementById('client-motion-button').click();assert.equal(d.getElementById('client-strip').dataset.motion,'playing');
 }finally{dom.window.close();}
});
test('motion controls work when preference storage is unavailable',async()=>{
 const {dom,d}=await load('en',false,w=>Object.defineProperty(w,'localStorage',{get(){throw new Error('Storage disabled');}}));
 try{d.getElementById('client-motion-button').click();assert.equal(d.getElementById('client-strip').dataset.motion,'paused');}finally{dom.window.close();}
});
test('scroll reveal never hides visible cards and reveals offscreen cards only once',async()=>{
 const {dom,d,observers}=await load('en',false,w=>{
  w.HTMLElement.prototype.getBoundingClientRect=function(){const top=this===w.document.querySelector('.svc-card')?20:1200;return {top,bottom:top+200,left:0,right:200,width:200,height:200};};
 });
 try{
  const cards=d.querySelectorAll('.svc-card');
  assert.equal(cards[0].classList.contains('reveal-pending'),false);
  assert.equal(cards[1].classList.contains('reveal-pending'),true);
  const observer=observers.find(o=>o.targets.includes(cards[1]));
  observer.callback([{target:cards[1],isIntersecting:true}]);
  assert.equal(cards[1].classList.contains('reveal-pending'),false);
  assert.equal(observer.targets.includes(cards[1]),false);
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
