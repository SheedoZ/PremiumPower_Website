const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
test('all published logo references stay within the lightweight asset budget',()=>{
 const routes=['index.html','ar/index.html'];
 for(const prefix of ['','ar/'])for(const page of ['perkins-generators-egypt','volvo-penta-generators-egypt','doosan-generators-egypt','maintenance','privacy'])routes.push(prefix+page+'/index.html');
 const assets=new Set();
 for(const route of routes){
  const html=fs.readFileSync(path.join(root,route),'utf8');
  assert.ok(!html.includes('/images/premium-power-primary.png'),route+' must not request the original 1MB logo');
  const dom=new JSDOM(html);
  const images=[...dom.window.document.querySelectorAll('.pp-brand img')];
  assert.ok(images.length>0,route+' has a logo');
  for(const image of images){assert.ok(image.width>0&&image.height>0);assets.add(image.getAttribute('src'));}
  dom.window.close();
 }
 const bytes=[...assets].reduce((sum,src)=>sum+fs.statSync(path.join(root,src)).size,0);
 assert.ok(bytes<64*1024,'Combined logo variants must remain below 64KiB');
});
