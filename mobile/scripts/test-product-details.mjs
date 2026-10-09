/**
 * Checks the product-description reader (src/utils/productDetails.ts) against
 * the shapes of HTML the admin actually produces: spec sheets pasted from
 * quick-commerce listings, text typed into the editor, and broken markup.
 *
 *   npm run test:details
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = fs.readFileSync(new URL('../src/utils/productDetails.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const mod = { exports: {} };
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require);
const { parseProductDetails, findDetail, dietFrom, formatLabel } = mod.exports;

let pass = 0;
let fail = 0;
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `\n        expected ${JSON.stringify(expected)}\n        got      ${JSON.stringify(actual)}`}`);
};

// Spec sheet, as pasted from a listing (inline styles trimmed).
const sheet = `<style>.x{color:red}</style><h2 style="font:1px">Highlights</h2>
  <div><h3>brand</h3><span>Crax</span></div>
  <div><h3>dietary preference</h3><span>Veg</span></div>
  <div><h3>unit</h3><span>1 pc (85 g)</span></div>
  <div><h3>fssai license</h3><span>10014011002061</span></div>`;
const blocks = parseProductDetails(sheet);
check('generic "Highlights" heading is dropped', blocks[0].type, 'row');
check('label/value rows are read', blocks.map((b) => b.label), ['Brand', 'Dietary preference', 'Unit', 'FSSAI license']);
check('pack size is found', findDetail(blocks, 'unit', 'weight'), '1 pc (85 g)');
check('diet is found', dietFrom(findDetail(blocks, 'dietary preference')), 'veg');

// Typed into the editor.
check('paragraphs, entities and bullets',
  parseProductDetails('<p>Rich in <b>protein</b> &amp; fibre.</p><ul><li>No palm oil</li></ul>'),
  [{ type: 'paragraph', text: 'Rich in protein & fibre.' }, { type: 'bullet', text: 'No palm oil' }]);
check('a meaningful heading is kept',
  parseProductDetails('<h2>How to use</h2><p>Mix with milk.</p>'),
  [{ type: 'heading', text: 'How to use' }, { type: 'paragraph', text: 'Mix with milk.' }]);
check('a label with no value becomes a heading',
  parseProductDetails('<h3>Storage</h3><h3>Weight</h3><p>200 g</p>'),
  [{ type: 'heading', text: 'Storage' }, { type: 'row', label: 'Weight', value: '200 g' }]);
check('numeric and accented entities', parseProductDetails('<p>Caf&eacute; &#8377;99</p>')[0].text, 'Café ₹99');
check('unclosed tags do not lose text',
  parseProductDetails('<div>One<br>Two<p>Three</div>').map((b) => b.text), ['One', 'Two', 'Three']);
check('plain text with no markup', parseProductDetails('Just text.'), [{ type: 'paragraph', text: 'Just text.' }]);
check('empty input', parseProductDetails(null), []);

check('label formatting', ['product type', 'fssai license', 'MRP', 'Net Weight:'].map(formatLabel),
  ['Product type', 'FSSAI license', 'MRP', 'Net Weight']);
check('diet mapping', ['Veg', 'Non Veg', 'Non-Veg', 'Egg', 'Vegan', 'Gluten free'].map(dietFrom),
  ['veg', 'nonveg', 'nonveg', 'nonveg', 'veg', undefined]);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
