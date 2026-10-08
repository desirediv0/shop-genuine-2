/** Read-only production check. Creates nothing, orders nothing. */
const BASE = 'https://api.shopgenuine.online/api/v2';
let pass=0, fail=0, warn=0; const out=[];
const get = async (p) => { const r = await fetch(`${BASE}${p}`); return { status:r.status, json: await r.json().catch(()=>null) }; };
const ok = (n,c,d='') => c ? (pass++, out.push(`  PASS  ${n}`)) : (fail++, out.push(`  FAIL  ${n} ${d}`));
const note = (n,d) => { warn++; out.push(`  WARN  ${n} ${d}`); };

const h = await fetch('https://api.shopgenuine.online/health');
ok('API reachable over HTTPS', h.status === 200);

const p = await get('/public/products?limit=1');
ok('products endpoint responds', p.status === 200);
const total = p.json?.data?.pagination?.total ?? 0;
total === 0 ? note('catalogue is EMPTY', '(0 products — app will show nothing)')
            : ok(`catalogue has ${total} products`, true);

const c = await get('/public/categories');
ok('categories endpoint responds', c.status === 200);
const nc = c.json?.data?.categories?.length ?? 0;
nc === 0 ? note('no categories', '(home category strip will be hidden)') : ok(`${nc} categories`, true);

const v = await get('/public/store-verticals');
ok('store-verticals endpoint responds', v.status === 200);
const nv = v.json?.data?.storeVerticals?.length ?? 0;
nv === 4 ? ok('4 sub-brands seeded', true)
         : note(`${nv} sub-brands seeded`, '(switcher hides itself below 1; expected 4)');

const ps = await get('/payment/settings');
ok('payment settings respond', ps.status === 200);
const s = ps.json?.data ?? {};
s.cashEnabled ? ok('COD enabled', true) : note('COD disabled', '');
s.razorpayEnabled ? ok('Razorpay enabled', true)
                  : note('Razorpay NOT configured', '(checkout offers COD only)');

// New endpoints must exist and be protected.
const n = await fetch(`${BASE}/notifications/register-device`, {method:'POST'});
ok('push endpoints deployed + protected', n.status === 401, `got ${n.status}`);
const d = await fetch(`${BASE}/users/delete-account`, {method:'POST'});
ok('in-app deletion deployed + protected', d.status === 401, `got ${d.status}`);
const dbg = await get('/public/debug-products');
ok('debug endpoint removed', dbg.status === 404, `got ${dbg.status}`);

// Rate limiting
const r = await fetch(`${BASE}/public/categories`);
ok('rate limiting active', !!r.headers.get('ratelimit-limit'));

console.log(out.join('\n'));
console.log(`\n${pass} passed, ${fail} failed, ${warn} warnings`);
