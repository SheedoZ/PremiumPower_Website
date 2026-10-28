'use strict';
const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');

function validateCopy(source) {
  const tree = acorn.parse(source, {ecmaVersion: 'latest', locations: true});
  const errors = [];
  let table;
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'VariableDeclarator' && node.id.name === 'T') table = node.init;
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') visit(value);
    }
  }
  visit(tree);
  if (!table || table.type !== 'ObjectExpression') throw new Error('Translation table T is missing');
  function unique(object, scope) {
    const seen = new Set();
    for (const property of object.properties) {
      if (property.type !== 'Property' || property.computed) throw new Error('Unsupported translation property in ' + scope);
      const key = property.key.name ?? property.key.value;
      if (seen.has(key)) errors.push(scope + '.' + key + ' is repeated (line ' + property.loc.start.line + ')');
      seen.add(key);
      if (property.value.type === 'ObjectExpression') unique(property.value, scope + '.' + key);
    }
  }
  unique(table, 'T');
  if (errors.length) throw new Error(errors.join('\n'));
  return true;
}
module.exports = {validateCopy};
if (require.main === module) {
  const file = path.resolve(__dirname, '../_src/home.html');
  const source = fs.readFileSync(file, 'utf8');
  const scripts = [...source.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  if (scripts.length !== 1) throw new Error('Expected one homepage application script');
  validateCopy(scripts[0][1]);
  process.stdout.write('Translation keys are unique.\n');
}
