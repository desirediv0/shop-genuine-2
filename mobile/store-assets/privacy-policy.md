# Privacy policy — Shop Genuine

**Live at: https://api.shopgenuine.online/privacy-policy** (once the 2026-11-05
server update is deployed — see `SERVER-STEPS.md` at the repo root).

The text lives in `server/controllers/pages.controller.js` (`getPrivacyPolicyPage`),
served by the API so it does not depend on the website. That file is the only copy:
edit it there.

- Operator: Arvi Consumer Private Limited, GSTIN 06ABCCA6498E1ZK,
  89/2 Sector 39, Gurugram, Haryana (the address from the website's contact page).
- Grievance Officer: Rajat Gulia (the owner), at the support email and phone.
- Service providers named: Shiprocket and its couriers, Razorpay, Brevo (email),
  Expo and Firebase (push, updates), Hostinger (servers, Mumbai), DigitalOcean
  (product images, Bangalore).

**Update it when the facts change**, before the change ships:
- crash reporting (Sentry) is switched on — add Sentry and the crash data it sends,
  and the Crash logs / Diagnostics rows in `data-safety.md`;
- a new delivery partner, email provider or host;
- new data collected (location, reviews, photos…).

The app links to it from Account and from the sign-up screen
(`src/components/PrivacyPolicyLink.tsx`), as Google Play requires.
