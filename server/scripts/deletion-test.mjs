/**
 * Proves that deleting an account keeps the customer's order history whole for
 * the admin, while removing their personal data.
 *
 * Places a real Cash on Delivery order for a throwaway user, adds a second
 * address the order does not use, then deletes the account through the app's
 * endpoint and checks the database. Cleans up after itself. Needs the local
 * server on :4000 and psql access to shop_genuine.
 *
 *   npm run test:deletion
 */
import { execSync } from 'node:child_process';

const BASE = 'http://localhost:4000/api/v2';
const email = `deltest${Date.now()}@example.com`;
const PASSWORD = 'Test@1234';
let pass = 0;
let fail = 0;
const check = (n, c, d = '') => {
  if (c) {
    pass += 1;
    console.log('  PASS ', n);
  } else {
    fail += 1;
    console.log('  FAIL ', n, d);
  }
};

const call = async (m, p, { body, token } = {}) => {
  const r = await fetch(`${BASE}${p}`, {
    method: m,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: r.status, json: await r.json().catch(() => null) };
};
const psql = (q) => execSync(`psql -d shop_genuine -t -A -c "${q}"`).toString().trim();

// 1. A customer with one order and two addresses.
await call('POST', '/users/register', { body: { name: 'Deletion Test', email, password: PASSWORD, phone: '9000090000' } });
const otp = psql(`select otp from \\"User\\" where email='${email}'`);
const ver = await call('POST', '/users/verify-otp', { body: { email, otp } });
const token = ver.json?.data?.accessToken;
check('test user signed in', !!token);
const userId = psql(`select id from \\"User\\" where email='${email}'`);

const address = (name, street) => ({
  name, street, city: 'Bengaluru', state: 'Karnataka', postalCode: '560001',
  country: 'India', phone: '9000090000', isDefault: false,
});
const shipTo = (await call('POST', '/users/addresses', { token, body: address('Delivery Person', '1 Order Road') })).json?.data?.address?.id;
const unused = (await call('POST', '/users/addresses', { token, body: address('Unused', '2 Spare Lane') })).json?.data?.address?.id;
check('two addresses created', !!shipTo && !!unused);

const variantId = psql(`select id from \\"ProductVariant\\" where quantity > 2 and \\"isActive\\"=true limit 1`);
await call('POST', '/cart/add', { token, body: { productVariantId: variantId, quantity: 1 } });
const cod = await call('POST', '/payment/cash-order', { token, body: { shippingAddressId: shipTo } });
const orderId = cod.json?.data?.orderId;
check('COD order placed', !!orderId, JSON.stringify(cod.json?.message));

const itemsBefore = psql(`select count(*) from \\"OrderItem\\" where \\"orderId\\"='${orderId}'`);
const totalBefore = psql(`select total from \\"Order\\" where id='${orderId}'`);

// 2. Delete the account the way the app does.
const del = await call('POST', '/users/delete-account', { token, body: { password: PASSWORD } });
check('account deletion succeeds', del.status === 200, JSON.stringify(del.json?.message));

// 3. The order history is intact for the admin.
check('order still exists', psql(`select count(*) from \\"Order\\" where id='${orderId}'`) === '1');
check('order items intact', psql(`select count(*) from \\"OrderItem\\" where \\"orderId\\"='${orderId}'`) === itemsBefore);
check('order total unchanged', psql(`select total from \\"Order\\" where id='${orderId}'`) === totalBefore);
check(
  'order keeps its delivery address',
  psql(`select coalesce(\\"shippingAddressId\\", 'NULL') from \\"Order\\" where id='${orderId}'`) === shipTo,
);
check(
  'delivery address keeps recipient name and phone',
  psql(`select name || '|' || phone from \\"Address\\" where id='${shipTo}'`) === 'Delivery Person|9000090000',
);

// 4. Personal data is gone.
check('address no order used is deleted', psql(`select count(*) from \\"Address\\" where id='${unused}'`) === '0');
const user = psql(`select coalesce(name,'NULL') || '|' || coalesce(phone,'NULL') || '|' || email || '|' || \\"isActive\\" from \\"User\\" where id='${userId}'`).split('|');
check('customer shown to admin as "Deleted customer"', user[0] === 'Deleted customer', user[0]);
check('phone cleared', user[1] === 'NULL', user[1]);
check('email replaced by an unusable placeholder', user[2].endsWith('@deleted.invalid'), user[2]);
// Concatenated into text, a boolean prints as "false" (alone, psql shows "f").
check('account disabled', user[3] === 'false' || user[3] === 'f', user[3]);
check('cart emptied', psql(`select count(*) from \\"CartItem\\" where \\"userId\\"='${userId}'`) === '0');
const relogin = await call('POST', '/users/login', { body: { email, password: PASSWORD } });
check('cannot sign in again', relogin.status >= 400, `got ${relogin.status}`);

// 5. Clean up — this test placed a real order in the local database.
execSync(`psql -d shop_genuine -q <<'SQL'
BEGIN;
DELETE FROM "Tracking"  WHERE "orderId" = '${orderId}';
DELETE FROM "OrderItem" WHERE "orderId" = '${orderId}';
DELETE FROM "Order"     WHERE id = '${orderId}';
DELETE FROM "Address"   WHERE "userId" = '${userId}';
DELETE FROM "DeviceToken" WHERE "userId" = '${userId}';
DELETE FROM "User"      WHERE id = '${userId}';
COMMIT;
SQL`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
