/**
 * Exercises every endpoint the app calls, in app order, asserting the response
 * shape matches what src/types/index.ts declares.
 */
const BASE = 'http://localhost:4000/api/v2';
let pass = 0, fail = 0;
const results = [];

async function call(method, path, { token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

function check(name, cond, detail = '') {
  if (cond) { pass++; results.push(`  PASS  ${name}`); }
  else { fail++; results.push(`  FAIL  ${name} ${detail}`); }
}

const email = `contract${Date.now()}@example.com`;

// 1. Catalogue (unauthenticated — what a guest sees)
const products = await call('GET', '/public/products?limit=3');
check('products 200', products.status === 200);
const list = products.json?.data?.products;
check('products is array', Array.isArray(list));
check('product has variants[]', Array.isArray(list?.[0]?.variants));
check('product image not doubled',
  !String(list?.[0]?.image ?? '').match(/https?:\/\/[^/]+\/https?:\/\//),
  `got ${list?.[0]?.image}`);
check('pagination shape',
  typeof products.json?.data?.pagination?.total === 'number');

const slug = list?.[0]?.slug;
const detail = await call('GET', `/public/products/${slug}`);
check('productBySlug wraps in {product}', !!detail.json?.data?.product);
check('productBySlug returns relatedProducts', Array.isArray(detail.json?.data?.relatedProducts));

const cats = await call('GET', '/public/categories');
check('categories shape', Array.isArray(cats.json?.data?.categories));

const settings = await call('GET', '/payment/settings');
check('paymentSettings has cashEnabled', typeof settings.json?.data?.cashEnabled === 'boolean');

// 2. Auth flow
const reg = await call('POST', '/users/register', {
  body: { name: 'Contract Test', email, password: 'Test@1234', phone: '9876543210' },
});
check('register 201', reg.status === 201, `got ${reg.status}`);

// Pull OTP straight from the DB the way a real user would from email.
const { execSync } = await import('node:child_process');
const otp = execSync(
  `psql -d shop_genuine -t -A -c "select otp from \\"User\\" where email='${email}'"`
).toString().trim();
check('otp generated', /^\d{6}$/.test(otp), `got "${otp}"`);

const verify = await call('POST', '/users/verify-otp', { body: { email, otp } });
check('verify-otp returns accessToken', !!verify.json?.data?.accessToken);
check('verify-otp returns refreshToken', !!verify.json?.data?.refreshToken);
check('verify-otp auto-signs-in (returns user)', !!verify.json?.data?.user);

const token = verify.json?.data?.accessToken;
const refresh = verify.json?.data?.refreshToken;

// Token lifetimes — the bug we fixed.
function life(t) {
  const p = JSON.parse(Buffer.from(t.split('.')[1], 'base64url').toString());
  return (p.exp - p.iat) / 86400;
}
check('access token ~1 day', Math.round(life(token)) === 1, `got ${life(token)}d`);
check('refresh token ~90 days', Math.round(life(refresh)) === 90, `got ${life(refresh)}d`);
check('refresh outlives access', life(refresh) > life(token));

// 3. Body-based refresh (mobile has no cookies)
const refreshed = await call('POST', '/users/refresh-token', { body: { refreshToken: refresh } });
check('refresh via body works', !!refreshed.json?.data?.accessToken);

// 4. Authenticated surface
const me = await call('GET', '/users/me', { token });
check('/users/me via Bearer', me.json?.data?.user?.email === email);

const variantId = execSync(
  `psql -d shop_genuine -t -A -c "select id from \\"ProductVariant\\" where quantity > 2 and \\"isActive\\"=true limit 1"`
).toString().trim();

const add = await call('POST', '/cart/add', { token, body: { productVariantId: variantId, quantity: 2 } });
check('cart add 200', add.status === 200, `got ${add.status}`);

const cart = await call('GET', '/cart', { token });
check('cart has items[]', Array.isArray(cart.json?.data?.items));
check('cart item has moq', typeof cart.json?.data?.items?.[0]?.moq === 'number');
check('cart image not doubled',
  !String(cart.json?.data?.items?.[0]?.product?.image ?? '').match(/https?:\/\/[^/]+\/https?:\/\//));

const addr = await call('POST', '/users/addresses', {
  token,
  body: { name: 'Contract Test', street: '1 Test Road', city: 'Bengaluru', state: 'Karnataka',
          postalCode: '560001', country: 'India', phone: '9876543210', isDefault: true },
});
check('address create wraps in {address}', !!addr.json?.data?.address?.id);
const addressId = addr.json?.data?.address?.id;

const validate = await call('POST', '/cart/validate', { token, body: {} });
check('cart validate returns valid', validate.json?.data?.valid === true);

// 5. Checkout (COD)
const cod = await call('POST', '/payment/cash-order', { token, body: { shippingAddressId: addressId } });
check('COD order created', !!cod.json?.data?.orderId, JSON.stringify(cod.json?.message));
const orderId = cod.json?.data?.orderId;

const emptied = await call('GET', '/cart', { token });
check('cart cleared after order', emptied.json?.data?.items?.length === 0);

// 6. The COD paymentMethod bug we fixed
const hist = await call('GET', '/payment/orders', { token });
const placed = hist.json?.data?.orders?.find((o) => o.id === orderId);
check('COD order reports CASH (not ONLINE)', placed?.paymentMethod === 'CASH',
  `got "${placed?.paymentMethod}"`);

const od = await call('GET', `/users/orders/${orderId}`, { token });
check('order detail wraps in {order}', !!od.json?.data?.order);
check('order detail has shippingAddress', !!od.json?.data?.order?.shippingAddress);

// 7. Misc app surface
const wl = await call('GET', '/users/wishlist', { token });
check('wishlist shape', Array.isArray(wl.json?.data?.wishlistItems));

const ref = await call('GET', '/referrals/my-code', { token });
check('referral code present', typeof ref.json?.data?.referralCode === 'string');

// 8. Removed debug endpoint
const dbg = await call('GET', '/public/debug-products');
check('debug-products removed', dbg.status === 404, `got ${dbg.status}`);

// 9. Push notification registration
const PUSH_TOKEN = `ExponentPushToken[contract${Date.now()}]`;
const pushNoAuth = await call('POST', '/notifications/register-device', { body: { token: PUSH_TOKEN } });
check('push register requires auth', pushNoAuth.status === 401, `got ${pushNoAuth.status}`);

const pushBad = await call('POST', '/notifications/register-device', { token, body: { token: 'nope' } });
check('push rejects malformed token', pushBad.status === 400, `got ${pushBad.status}`);

const pushReg = await call('POST', '/notifications/register-device', {
  token, body: { token: PUSH_TOKEN, platform: 'android', deviceName: 'Contract' },
});
check('push device registers', pushReg.status === 200 && !!pushReg.json?.data?.device?.id);

const pushAgain = await call('POST', '/notifications/register-device', {
  token, body: { token: PUSH_TOKEN, platform: 'android' },
});
check('push register idempotent', pushAgain.status === 200);

const devs = await call('GET', '/notifications/devices', { token });
check('push devices listed', devs.json?.data?.devices?.length >= 1);

const pushOff = await call('POST', '/notifications/unregister-device', { token, body: { token: PUSH_TOKEN } });
check('push device unregisters', pushOff.status === 200);

// 10. In-app account deletion (App Store requirement)
const delNoPw = await call('POST', '/users/delete-account', { token, body: {} });
check('delete-account requires password', delNoPw.status === 400, `got ${delNoPw.status}`);

const delWrong = await call('POST', '/users/delete-account', { token, body: { password: 'Wrong@9999' } });
check('delete-account rejects wrong password', delWrong.status === 401, `got ${delWrong.status}`);

const stillThere = await call('GET', '/users/me', { token });
check('account survives failed deletion', stillThere.status === 200);

const delOk = await call('POST', '/users/delete-account', { token, body: { password: 'Test@1234' } });
check('delete-account succeeds in one call', delOk.status === 200, JSON.stringify(delOk.json?.message));

const gone = await call('GET', '/users/me', { token });
check('session invalid after deletion', gone.status === 401, `got ${gone.status}`);

execSync(`psql -d shop_genuine -c "delete from \\"DeviceToken\\" where token='${PUSH_TOKEN}'" >/dev/null 2>&1 || true`);

console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
