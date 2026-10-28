'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),root=path.resolve(__dirname,'..');
const reference=require('./fixtures/owner-restored-copy.json');
test('owner-selected content matches the pre-audit release, with C10-C12 exceptions',()=>{
 const source=fs.readFileSync(path.join(root,'_src/home.html'),'utf8');
 const block=source.slice(source.indexOf('const T = {'),source.indexOf('// ── PDF config'));
 const actual=JSON.parse(vm.runInNewContext(block+'\nJSON.stringify({T,FAQS})'));
 for(const lang of ['en','ar'])for(const [key,value]of Object.entries(reference.translation_keys[lang]))assert.equal(actual.T[lang][key],value,lang+'.'+key);
 assert.deepEqual(actual.FAQS,reference.faqs);
 assert.match(actual.T.ar.fuelPipingDesc,/غير ملحومة/);assert.match(actual.T.ar.fuelPipingDesc,/سولينويد/);
 assert.doesNotMatch(actual.T.ar.volvoDesc,/أداء متطرف/);assert.match(actual.T.en.missionStatement,/zero downtime/);
});
for(const prefix of ['','ar/'])test(prefix+'original metrics, imagery, promises and sound levels remain visible',()=>{
 const dom=new JSDOM(fs.readFileSync(path.join(root,prefix+'index.html'),'utf8'));
 try{const d=dom.window.document;
 assert.equal(d.querySelectorAll('#clients .client-card img').length,16);
 assert.equal(d.querySelectorAll('#projects .proj-card img').length,3);
 assert.ok(d.querySelector('#stats .counter[data-target="250"]'));assert.match(d.querySelector('#stats').textContent,/99.2%/);
 assert.match(d.querySelector('#amc').textContent,/24/);assert.match(d.querySelector('#amc').textContent,/15%/);
 assert.match(d.querySelector('#certifications').textContent,/ISO 9001/);
 assert.equal(d.querySelectorAll('input[name="sound-level"]').length,3);
 assert.ok(d.querySelector('#sound-fill'));assert.match(d.querySelector('#sound-db').textContent,/105 dB/);
 }finally{dom.window.close();}
});
