/**
 * Checks that /public/products honours a price sort across every page.
 *
 * The endpoint used to accept sort=price and then order by createdAt, so
 * "Price: low to high" returned products in date order on both the website and
 * the app — and nothing caught it, because each page looked plausible.
 *
 *   npm run test:sort            (against the local server on :4000)
 *   API=https://api.shopgenuine.online npm run test:sort
 */
const BASE = `${process.env.API || 'http://localhost:4000'}/api/v2/public/products`;
let pass = 0;
let fail = 0;
const check = (name, ok, detail = '') => {
  ok ? pass++ : fail++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name} ${detail}`);
};
const get = async (q) => (await (await fetch(`${BASE}?${q}`)).json()).data;

// The price a card shows: cheapest in-stock option, else cheapest active one.
const priceOf = (p) => {
  const active = (p.variants || []).filter((v) => v.isActive);
  const inStock = active.filter((v) => v.quantity > 0);
  const pool = inStock.length ? inStock : active;
  return pool.length ? Math.min(...pool.map((v) => Number(v.salePrice ?? v.price))) : null;
};

for (const order of ['asc', 'desc']) {
  const prices = [];
  const ids = new Set();
  let page = 1;
  let data;
  do {
    data = await get(`sort=price&order=${order}&limit=12&page=${page}`);
    for (const p of data.products) {
      ids.add(p.id);
      prices.push(priceOf(p));
    }
    page++;
  } while (page <= data.pagination.pages);

  const known = prices.filter((x) => x !== null);
  const inOrder = known.every((x, i) => i === 0 || (order === 'asc' ? known[i - 1] <= x : known[i - 1] >= x));
  check(`price ${order} is in order across ${data.pagination.pages} page(s)`, inOrder,
    `(first ${known.slice(0, 3).join(', ')})`);
  check(`price ${order} returns every product exactly once`,
    ids.size === data.pagination.total && prices.length === data.pagination.total,
    `(${ids.size} of ${data.pagination.total})`);
}

const newest = await get('sort=createdAt&order=desc&limit=3');
check('newest sort still responds', Array.isArray(newest.products));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
