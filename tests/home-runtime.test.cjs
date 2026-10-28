'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom'),root=path.resolve(__dirname,'..');
async function home(lang) {
 const dom=new JSDOM(fs.readFileSync(path.join(root,lang==='ar'?'ar/index.html':'index.html'),'utf8'),{url:'https://www.premiumpower-eg.com/'+(lang==='ar'?'ar/':''),runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.IntersectionObserver=class{observe(){}unobserve(){}};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.fetch=async()=>{throw Error('No submission expected');};
 await new Promise(r=>setImmediate(r));
 for(const s of w.document.scripts){if(s.type==='application/ld+json')continue;if(s.src)w.eval(fs.readFileSync(path.join(root,new URL(s.src).pathname),'utf8'));else w.eval(s.textContent);}
 return {dom,w,d:w.document};
}
for(const lang of ['en','ar']) {
 test(lang+': shared homepage bundle preserves language and accessible controls',async()=>{
  const {dom,w,d}=await home(lang);
  try {
   assert.equal(d.documentElement.lang,lang);
   assert.equal(d.title,d.querySelector('meta[property="og:title"]').content);
   assert.equal([...d.scripts].filter(s=>!s.src&&s.type!=='application/ld+json').length,0);
   assert.ok([...d.scripts].filter(s=>s.src).every(s=>s.defer));
   assert.ok(d.querySelector('a[href="'+(lang==='ar'?'/ar/':'/')+'maintenance/"]'));
   if(lang==='ar'){assert.match(d.querySelector('#c-pump').getAttribute('aria-label') || d.querySelector('label[for="c-pump"]').textContent,/[\u0600-\u06ff]/);assert.match(d.querySelector('#hamburger-btn').getAttribute('aria-label'),/[\u0600-\u06ff]/);}
   assert.equal(d.querySelectorAll('input[name="sound-level"]').length,3);
   w.app.setSound('silent');assert.equal(d.getElementById('tier-silent').checked,true);
   w.app.switchLanguage(lang);assert.equal(d.getElementById('tier-silent').checked,true);
   assert.doesNotMatch(d.body.textContent,/صمامات ملاشي|أداء متطرف/);
  } finally {dom.window.close();}
 });
 test(lang+': PDF closes to its opener and does not erase a fast reopen',async()=>{
  const {dom,w,d}=await home(lang);
  try {
   const opener=d.querySelector('button[onclick*="openPdf"]');
   opener.focus();w.app.openPdf('perkins');await new Promise(r=>w.requestAnimationFrame(()=>r()));
   assert.equal(d.activeElement.id,'pdf-close-btn');assert.match(d.querySelector('#pdf-open-btn').href,/\/perkins-specs.pdf$/);
   w.app.closePdf();assert.equal(d.activeElement,opener);
   w.app.openPdf('volvo');await new Promise(r=>setTimeout(r,350));
   assert.match(d.querySelector('#pdf-iframe').src,/\/volvo-specs.pdf$/);
  } finally {dom.window.close();}
 });
}
