/**
 * Plain web pages the mobile app's store listings point at, served on the API
 * domain so they do not depend on the website:
 *
 * - /delete-account — Google Play requires a web link where people can ask for
 *   their account to be deleted without the app (Play Console → Data safety →
 *   "Delete account URL"), even though the app has its own Delete button. Keep
 *   its "deleted" and "kept" lists in step with helper/deleteUserAccount.js.
 * - /privacy-policy — the app's privacy policy, linked from Play Console and
 *   from inside the app (Play requires both). It describes what the app and
 *   this server actually collect and who receives it; change it whenever that
 *   changes (a new SDK, a new courier, crash reporting switched on).
 */

const DEFAULT_SUPPORT_EMAIL = "connect.genuinenutrition@gmail.com";

const STYLE = `<style>
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
</style>`;

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
${STYLE}
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
     See also our <a href="/privacy-policy">privacy policy</a>.</p>
</main>
</body>
</html>`);
}

/** The business behind the app, as registered. */
const COMPANY = {
  name: "Arvi Consumer Private Limited",
  gstin: "06ABCCA6498E1ZK",
  address: "89/2 Sector 39, Gurugram, Haryana, India",
  phone: "+91 80532 10008",
  grievanceOfficer: "Rajat Gulia",
};
const POLICY_UPDATED = "5 November 2026";

export function getPrivacyPolicyPage(req, res) {
  const email = escapeHtml((process.env.SUPPORT_EMAIL || "").trim() || DEFAULT_SUPPORT_EMAIL);
  const mail = `<a href="mailto:${email}">${email}</a>`;

  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Privacy policy — Shop Genuine</title>
${STYLE}
<style>
  table { width: 100%; border-collapse: collapse; font-size: 15px; }
  th, td { text-align: left; vertical-align: top; padding: 8px 6px; border-top: 1px solid var(--line); color: var(--muted); }
  th { color: var(--text); font-weight: 600; }
  .meta { font-size: 14px; }
</style>
</head>
<body>
<main>
  <div class="brand">Shop Genuine</div>
  <h1>Privacy policy</h1>
  <p class="meta">Last updated: ${POLICY_UPDATED}</p>
  <p>The Shop Genuine app is operated by <strong>${COMPANY.name}</strong> (GSTIN ${COMPANY.gstin}),
     ${COMPANY.address} (“we”, “us”). This policy explains what we collect through the Shop Genuine
     app for Android and iOS, why we collect it, who receives it and what you can do about it.</p>

  <section class="card">
    <h2>What we collect</h2>
    <ul>
      <li><strong>Your account:</strong> your name, email address, phone number (optional) and password.
          We email you a one-time code to confirm your address. Passwords are stored hashed, never as
          plain text.</li>
      <li><strong>Your orders:</strong> the delivery addresses you save, what you ordered, the amounts,
          how you paid and the status of each order.</li>
      <li><strong>Your cart and saved items.</strong> Before you sign in, your cart is kept only on your
          phone; it is sent to us when you sign in.</li>
      <li><strong>Notifications, if you allow them:</strong> a push token that lets us send order updates
          to your phone. The app works fully without it, and you can turn notifications off in your phone's
          settings at any time.</li>
      <li><strong>App updates:</strong> when the app starts it checks for updates. That request carries the
          app version, your phone's platform (Android or iOS) and a random installation identifier that is
          not linked to your account.</li>
      <li><strong>Technical information</strong> needed to answer each request, such as your IP address.</li>
    </ul>
  </section>

  <section class="card">
    <h2>What we do not collect</h2>
    <ul>
      <li><strong>Card, UPI and netbanking details.</strong> Online payments are made inside Razorpay's own
          secure checkout. Those details go straight to Razorpay; we receive only a reference confirming
          the payment.</li>
      <li>Your location, contacts, photos, camera or microphone.</li>
    </ul>
    <p style="margin-top:10px">We show no advertising, we do not track you across other apps or websites,
       and we never sell your data.</p>
  </section>

  <section class="card">
    <h2>Why we use it</h2>
    <ul>
      <li>To create and secure your account</li>
      <li>To take, ship, deliver and invoice your orders</li>
      <li>To tell you what is happening with an order</li>
      <li>To answer you when you contact us</li>
      <li>To meet legal obligations, such as keeping tax invoices</li>
    </ul>
  </section>

  <section class="card">
    <h2>Who receives it</h2>
    <p>Only the companies we need to run the service, and only what each one needs:</p>
    <table>
      <tr><th>Who</th><th>What</th><th>Why</th></tr>
      <tr><td>Shiprocket and the courier it assigns</td><td>Name, delivery address, phone, what is in the parcel</td><td>To deliver your order</td></tr>
      <tr><td>Razorpay</td><td>Order amount, and the payment details you enter with them</td><td>To take online payments</td></tr>
      <tr><td>Brevo</td><td>Your email address and the email we send</td><td>One-time codes and order emails</td></tr>
      <tr><td>Expo and Google (Firebase Cloud Messaging)</td><td>Your push token and the notification text</td><td>To deliver notifications</td></tr>
      <tr><td>Expo</td><td>App version, platform, random installation identifier</td><td>To deliver app updates</td></tr>
      <tr><td>Hostinger</td><td>Your account and order data</td><td>Our servers run there</td></tr>
      <tr><td>DigitalOcean</td><td>Product images</td><td>Image storage</td></tr>
    </table>
    <p style="margin-top:10px">We also disclose information when the law requires it.</p>
  </section>

  <section class="card">
    <h2>Where it is stored</h2>
    <p>Your account and order data are stored on our servers in Mumbai, India, and product images in
       Bangalore, India. Expo, Google and Brevo process the limited data listed above on their own servers,
       which may be outside India, only to deliver notifications, app updates and emails.</p>
  </section>

  <section class="card">
    <h2>How long we keep it</h2>
    <p>Your account details are kept while your account exists. Order records and invoices are kept for as
       long as Indian tax and accounting laws require, even after you delete your account.</p>
  </section>

  <section class="card">
    <h2>Your choices</h2>
    <ul>
      <li><strong>Delete your account in the app:</strong> Account → Delete my account. Your name, email and
          phone are removed straight away. If you never placed an order, nothing is kept; if you did, the
          order records are kept without your personal details, as described on our
          <a href="/delete-account">account deletion page</a>.</li>
      <li>Edit or remove saved addresses, reset your password and turn notifications off, all in the app.</li>
      <li>To see, correct or delete anything else we hold about you, email ${mail}.</li>
    </ul>
  </section>

  <section class="card">
    <h2>Children</h2>
    <p>Shop Genuine is not meant for anyone under 18, and we do not knowingly collect data from children.</p>
  </section>

  <section class="card">
    <h2>Security</h2>
    <p>Everything between the app and our servers travels encrypted (HTTPS). Passwords are stored hashed and
       payment gateway keys are stored encrypted. No system is perfectly secure, but we take reasonable steps
       to protect your information.</p>
  </section>

  <section class="card">
    <h2>Grievance Officer</h2>
    <p><strong>${COMPANY.grievanceOfficer}</strong>, Grievance Officer, ${COMPANY.name}<br>
       Email: ${mail}<br>
       Phone: ${COMPANY.phone} (Mon–Sat, 10am–7pm)<br>
       Address: ${COMPANY.address}</p>
    <p>We acknowledge every complaint within 48 hours and resolve it within one month.</p>
  </section>

  <section class="card">
    <h2>Changes to this policy</h2>
    <p>If we change this policy we will update the date at the top, and tell you in the app when a change
       is significant.</p>
  </section>

  <p style="margin-top:20px">Questions? Email ${mail} — ${COMPANY.name}, ${COMPANY.address}.</p>
</main>
</body>
</html>`);
}
