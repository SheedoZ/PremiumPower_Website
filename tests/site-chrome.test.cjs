'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom'),root=path.resolve(__dirname,'..');
for(const lang of ['en','ar']){
 const prefix=lang==='ar'?'ar/':'';
 test(lang+': shared inner-page menu keeps keyboard focus and restores scrolling',()=>{
  const dom=new JSDOM(fs.readFileSync(path.join(root,prefix+'privacy/index.html'),'utf8'),{url:'https://www.premiumpower-eg.com/'+prefix+'privacy/',runScripts:'outside-only',pretendToBeVisual:true});
  try{
   const w=dom.window,d=w.document;
   Object.defineProperty(w,'innerWidth',{value:390,writable:true});
   w.eval(fs.readFileSync(path.join(root,'assets/site-chrome.js'),'utf8'));
   const trigger=d.querySelector('#hamburger-btn'),menu=d.querySelector('#mobile-menu'),items=[...menu.querySelectorAll('button,a[href]')];
   items.forEach(e=>e.getClientRects=()=>[{width:44,height:44}]);
   d.body.style.overflow='auto';trigger.click();
   assert.equal(trigger.getAttribute('aria-expanded'),'true');
   assert.equal(d.body.style.overflow,'hidden');
   assert.ok(menu.contains(d.activeElement));
   items[0].focus();d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));
   assert.equal(d.activeElement,items.at(-1));
   d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));
   assert.equal(d.activeElement,items[0]);
   d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
   assert.equal(trigger.getAttribute('aria-expanded'),'false');assert.equal(d.activeElement,trigger);assert.equal(d.body.style.overflow,'auto');
   trigger.click();w.innerWidth=1440;w.dispatchEvent(new w.Event('resize'));
   assert.equal(menu.classList.contains('open'),false);assert.equal(d.body.style.overflow,'auto');
  }finally{dom.window.close();}
 });
 test(lang+': every inner page retains route-specific languages, usable quote targets and telephone contact',()=>{
  for(const slug of ['perkins-generators-egypt','volvo-penta-generators-egypt','doosan-generators-egypt','maintenance','privacy']){
   const dom=new JSDOM(fs.readFileSync(path.join(root,prefix+slug+'/index.html'),'utf8'));
   try{
    const d=dom.window.document;
    for(const choice of ['en','ar']){
     const anchor=d.querySelector('#navbar a[lang="'+choice+'"]');
     assert.equal(anchor.getAttribute('href'),(choice==='ar'?'/ar/':'/')+slug+'/');
     assert.equal(anchor.getAttribute('aria-current')==='page',choice===lang);
    }
    const quote=d.querySelector('.nav-cta').getAttribute('href');
    if(slug==='privacy')assert.equal(quote,'/'+prefix+'#contact');else assert.ok(d.querySelector(quote));
    assert.equal(d.querySelectorAll('#mobile-menu').length,1);
    assert.ok(d.querySelector('footer a[href="tel:+201229688688"]'));
    assert.ok(d.querySelector('footer a[href="tel:+201032521321"]'));
    for(const svg of d.querySelectorAll('svg.pp-icon')){assert.equal(svg.getAttribute('aria-hidden'),'true');assert.equal(svg.getAttribute('focusable'),'false');}
    for(const b of d.querySelectorAll('#navbar button,#mobile-menu button'))assert.ok((b.getAttribute('aria-label')||b.textContent).trim());
   }finally{dom.window.close();}
  }
 });
}
