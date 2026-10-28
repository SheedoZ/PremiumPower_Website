'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
async function load(file) {
  const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:'https://www.premiumpower-eg.com/'+file.replace(/index.html$/,''),runScripts:'outside-only'});
  const w=dom.window;
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.fetch=async()=>{throw new Error('No form submission is expected in this navigation test');};
  await new Promise(r=>setImmediate(r));
  for(const script of w.document.scripts) {
    if(script.type==='application/ld+json') continue;
    if(script.src) w.eval(fs.readFileSync(path.join(root,new URL(script.src).pathname),'utf8'));
    else w.eval(script.textContent);
  }
  return {dom,w,d:w.document};
}
for(const lang of ['en','ar']) {
  const prefix=lang==='ar'?'ar/':'';
  test(lang+': maintenance entry selects the requested purpose without losing notes',async()=>{
    const {dom,d}=await load(prefix+'maintenance/index.html');
    try {
      assert.equal(d.getElementById('f-type').value,'maintenance');
      d.getElementById('f-msg').value='Existing customer notes';
      d.querySelector('[data-service-purpose="contract"]').click();
      assert.equal(d.getElementById('f-maintenance-purpose').value,'contract');
      assert.equal(d.getElementById('f-plan').value,'assessment');
      d.querySelector('[data-service-purpose="service"]').click();
      assert.equal(d.getElementById('f-maintenance-purpose').value,'service');
      assert.equal(d.getElementById('f-msg').value,'Existing customer notes');
      assert.equal(d.activeElement.id,'f-name');
      assert.equal(d.querySelector('a[href="/'+prefix+'privacy/"]')!==null,true);
    } finally {dom.window.close();}
  });
  test(lang+': service schema describes the visible assessment, without invented offers',()=>{
    const dom=new JSDOM(fs.readFileSync(path.join(root,prefix+'maintenance/index.html'),'utf8'));
    try {
      const graph=JSON.parse(dom.window.document.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
      const service=graph.find(x=>x['@type']==='Service');
      assert.ok(service);assert.equal(service.offers,undefined);
      assert.equal(graph.find(x=>x['@type']==='WebPage').about['@id'],service['@id']);
    } finally {dom.window.close();}
  });
  test(lang+': privacy page identifies the receiver and offers a company contact',()=>{
    const dom=new JSDOM(fs.readFileSync(path.join(root,prefix+'privacy/index.html'),'utf8'));
    try {
      const d=dom.window.document;
      assert.ok(d.querySelector('a[href="https://formspree.io/legal/privacy-policy/"]'));
      assert.ok(d.querySelector('a[href="mailto:info@premiumpower-eg.com"]'));
      assert.equal(d.querySelectorAll('form').length,0);
      assert.doesNotMatch(d.body.textContent,/GDPR compliant|ISO 27001|30 days|٣٠ يوماً/);
    } finally {dom.window.close();}
  });
}
