/**
 * Plain web pages the mobile app's store listings point at.
 *
 * Google Play requires a web link where people can ask for their account to be
 * deleted without the app (Play Console → Data safety → "Delete account URL"),
 * even though the app has its own Delete button. It is served here, on the API
 * domain, so it does not depend on the website.
 *
 * Keep the "deleted" and "kept" lists in step with helper/deleteUserAccount.js —
 * the page must describe what deletion actually does.
 */

const DEFAULT_SUPPORT_EMAIL = "connect.genuinenutrition@gmail.com";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getDeleteAccountPage(req, res) {
  const email = escapeHtml((process.env.SUPPORT_EMAIL || "").trim() || DEFAULT_SUPPORT_EMAIL);
  const mailto = `mailto:${email}?subject=${encodeURIComponent("Delete my account")}`;

  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Delete your Shop Genuine account</title>
<style>
  :root { --text: #1C1917; --muted: #57534E; --line: #EAE4DC; --page: #FAF8F5; --brand: #F97316; --blue: #1D4ED8; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--page); color: var(--text);
         font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif; }
  main { max-width: 680px; margin: 0 auto; padding: 32px 20px 48px; }
  .brand { font-weight: 700; color: var(--blue); letter-spacing: .2px; }
  h1 { font-size: 28px; line-height: 1.25; margin: 6px 0 12px; }
  h2 { font-size: 19px; margin: 0 0 8px; }
  p { margin: 0 0 12px; color: var(--muted); }
  .card { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 20px; margin-top: 16px; }
  ol, ul { margin: 0; padding-left: 22px; color: var(--muted); }
  li { margin: 4px 0; }
  strong { color: var(--text); }
  a { color: var(--brand); font-weight: 600; }
  .tag { display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase;
         color: #fff; background: var(--brand); border-radius: 999px; padding: 2px 10px; margin-bottom: 8px; }
</style>
</head>
<body>
<main>
  <div class="brand">Shop Genuine</div>
  <h1>Delete your Shop Genuine account</h1>
  <p>You can delete your Shop Genuine account and its personal data at any time, in the app or by email.</p>

  <section class="card">
    <span class="tag">Fastest</span>
    <h2>In the app</h2>
    <ol>
      <li>Open the <strong>Shop Genuine</strong> app and sign in.</li>
      <li>Go to <strong>Account</strong>.</li>
      <li>Tap <strong>Delete my account</strong> and confirm with your password.</li>
    </ol>
    <p style="margin-top:10px">Your account is deleted straight away and you are signed out.</p>
  </section>

  <section class="card">
    <h2>Without the app</h2>
    <p>Email <a href="${mailto}">${email}</a> from the email address you signed up with, with the subject
       <strong>“Delete my account”</strong>. We will delete the account and reply to confirm.</p>
  </section>

  <section class="card">
    <h2>What is deleted</h2>
    <ul>
      <li>Your name, email address, phone number and password</li>
      <li>Your saved delivery addresses, except those your orders were delivered to</li>
      <li>Your cart, saved items (wishlist) and reviews</li>
      <li>Your coupons and notification settings for your devices</li>
    </ul>
  </section>

  <section class="card">
    <h2>What is kept, and for how long</h2>
    <p>If you have placed orders, the order records — what was bought, the amounts, the payment status and
       the delivery address each order went to — are kept for as long as Indian tax and accounting laws
       require, and so that orders already placed can still be delivered. Your account's name, email address
       and phone number are removed, and the account can never be signed into again.</p>
    <p>If you never placed an order, nothing is kept.</p>
  </section>

  <p style="margin-top:20px">Questions? Email <a href="mailto:${email}">${email}</a>.
     See also our <a href="https://shopgenuine.online/privacy-policy">privacy policy</a>.</p>
</main>
</body>
</html>`);
}
