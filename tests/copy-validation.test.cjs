'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {validateCopy} = require('../scripts/check-copy.cjs');
test('a repeated translated key cannot silently replace a reviewed value', () => {
  assert.throws(() => validateCopy("const T={en:{fuel:'one'},ar:{fuel:'الأول',fuel:'الثاني'}};"), /T.ar.fuel is repeated/);
  assert.throws(() => validateCopy("const T={en:{a:'one'},'en':{a:'two'}};"), /T.en is repeated/);
  assert.equal(validateCopy("const T={en:{a:'one',b:'two'},ar:{a:'واحد',b:'اثنان'}};"), true);
});
