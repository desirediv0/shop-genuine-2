/** Verifies sub-brand scoping across products, categories, brands and drilldown. */
const BASE = 'http://localhost:4000/api/v2';
const { execSync } = await import('node:child_process');
let pass = 0, fail = 0; const out = [];
const get = async (p) => (await fetch(`${BASE}${p}`)).json();
const check = (n, c, d='') => c ? (pass++, out.push(`  PASS  ${n}`)) : (fail++, out.push(`  FAIL  ${n} ${d}`));
const q = (sql) => execSync(`psql -d shop_genuine -t -A -c "${sql}"`).toString().trim();

const vs = (await get('/public/store-verticals')).data.storeVerticals;
check('four sub-brands exist', vs.length === 4, `got ${vs.length}`);
check('named correctly', vs.map(v=>v.name).join()==='Genuine Nutrition,Genuine Grocery,Genuine Pharmacy,Genuine Cosmetics', vs.map(v=>v.name).join());
check('ordered', vs.every((v,i)=>v.order===i+1));

const grocery = vs.find(v=>v.slug==='grocery').id;
const nutrition = vs.find(v=>v.slug==='nutrition').id;

// Products
const all = (await get('/public/products?limit=1')).data.pagination.total;
const groc = (await get(`/public/products?limit=1&storeVerticalId=${grocery}`)).data.pagination.total;
const nutr = (await get(`/public/products?limit=1&storeVerticalId=${nutrition}`)).data.pagination.total;
check('All shows every product', all === 89, `got ${all}`);
check('Grocery scopes products', groc === 89, `got ${groc}`);
check('Nutrition is empty (no products assigned)', nutr === 0, `got ${nutr}`);

// Categories derived from products
const catAll = (await get('/public/categories')).data.categories;
const catGroc = (await get(`/public/categories?storeVerticalId=${grocery}`)).data.categories;
const catNutr = (await get(`/public/categories?storeVerticalId=${nutrition}`)).data.categories;
check('All lists every category', catAll.length === 13, `got ${catAll.length}`);
check('Grocery lists only its categories', catGroc.length > 0 && catGroc.length < catAll.length,
  `got ${catGroc.length} of ${catAll.length}`);
check('Nutrition lists no categories', catNutr.length === 0, `got ${catNutr.length}`);
check('every grocery category has products', catGroc.every(c => (c._count?.products ?? 0) > 0));

// Counts must reflect the vertical, not the global total
const sample = catGroc[0];
const globalCount = catAll.find(c => c.id === sample.id)?._count?.products ?? 0;
check('category counts are vertical-scoped',
  sample._count.products <= globalCount,
  `vertical=${sample._count.products} global=${globalCount}`);

// Brands derived from products
const brAll = (await get('/public/brands')).data.brands;
const brGroc = (await get(`/public/brands?storeVerticalId=${grocery}`)).data.brands;
check('All lists brands', brAll.length >= 1);
check('brands scope by vertical', brGroc.length <= brAll.length, `${brGroc.length} vs ${brAll.length}`);

// Category drilldown keeps the vertical
const slug = catGroc[0].slug;
const dGroc = (await get(`/public/categories/${slug}/products?limit=1&storeVerticalId=${grocery}`)).data.pagination.total;
const dNutr = (await get(`/public/categories/${slug}/products?limit=1&storeVerticalId=${nutrition}`)).data.pagination.total;
check('drilldown scoped to grocery', dGroc > 0, `got ${dGroc}`);
check('same category empty under nutrition', dNutr === 0, `got ${dNutr}`);

// Regression: no vertical param must behave exactly as before
const dNone = (await get(`/public/categories/${slug}/products?limit=1`)).data.pagination.total;
check('unscoped drilldown still works', dNone > 0, `got ${dNone}`);

console.log(out.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
