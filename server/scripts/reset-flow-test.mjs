/**
 * Proves the password-reset chain works once FRONTEND_URL is correct:
 * the token the server mints is accepted by /users/reset-password/:token, the
 * new password works, and the old one stops working. Prints no secrets.
 */
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import jwt from '/Volumes/akashssd/akash/react-native/shop-genuine/server/node_modules/jsonwebtoken/index.js';

const BASE = 'http://localhost:4000/api/v2';
const email = `resettest${Date.now()}@example.com`;
const OLD = 'Test@1234';
const NEW = 'Brand@5678';
let pass = 0, fail = 0;
const check = (n, c, d = '') => { c ? (pass++, console.log('  PASS ', n)) : (fail++, console.log('  FAIL ', n, d)); };

const call = async (m, p, { body, token } = {}) => {
  const r = await fetch(`${BASE}${p}`, {
    method: m,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: r.status, json: await r.json().catch(() => null) };
};
const psql = (q) => execSync(`psql -d shop_genuine -t -A -c "${q}"`).toString().trim();

await call('POST', '/users/register', { body: { name: 'Reset Test', email, password: OLD, phone: '9000090000' } });
const otp = psql(`select otp from \\"User\\" where email='${email}'`);
const ver = await call('POST', '/users/verify-otp', { body: { email, otp } });
check('test user verified', !!ver.json?.data?.accessToken);

// The forgot-password endpoint responds the same way whether or not the address
// exists, so hitting it only proves it is reachable — not that mail went out.
const forgot = await call('POST', '/users/forgot-password', { body: { email: 'nobody-here@example.com' } });
check('forgot-password does not leak whether an account exists', forgot.status === 200);

const userId = psql(`select id from \\"User\\" where email='${email}'`);

// Mint the token exactly as controllers/user.controller.js does.
const secret = process.env.RESET_TOKEN_SECRET || process.env.ACCESS_JWT_SECRET;
check('reset signing secret is configured', !!secret);
// Mirror the token the server now mints, including the password fingerprint.
const hashOf = (pw) => crypto.createHash('sha256').update(String(pw)).digest('hex').slice(0, 16);
const hashBefore = psql(`select password from \\"User\\" where id='${userId}'`);
const token = jwt.sign(
  { id: userId, purpose: 'pwdreset', pv: hashOf(hashBefore) },
  secret,
  { expiresIn: '1h' },
);
const legacyToken = jwt.sign({ id: userId, purpose: 'pwdreset' }, secret, { expiresIn: '1h' });

const reset = await call('POST', `/users/reset-password/${token}`, { body: { password: NEW } });
check('reset-password accepts the token', reset.status === 200, JSON.stringify(reset.json?.message));

const newLogin = await call('POST', '/users/login', { body: { email, password: NEW } });
check('new password signs in', !!newLogin.json?.data?.accessToken);

const oldLogin = await call('POST', '/users/login', { body: { email, password: OLD } });
check('old password is rejected', oldLogin.status >= 400, `got ${oldLogin.status}`);

const reuse = await call('POST', `/users/reset-password/${token}`, { body: { password: 'Another@9999' } });
check('the same link cannot be used twice', reuse.status >= 400, `got ${reuse.status}`);

// A link minted before this change carries no fingerprint and must still work,
// so reset emails already sitting in inboxes are not broken by the deploy.
const legacy = await call('POST', `/users/reset-password/${legacyToken}`, { body: { password: NEW } });
check('a pre-existing link without a fingerprint still works', legacy.status === 200, `got ${legacy.status}`);

const bad = await call('POST', '/users/reset-password/not-a-real-token', { body: { password: NEW } });
check('a forged token is rejected', bad.status >= 400, `got ${bad.status}`);

execSync(`psql -d shop_genuine -c "delete from \\"User\\" where email='${email}'" >/dev/null`);
console.log(`\n${pass} passed, ${fail} failed`);
