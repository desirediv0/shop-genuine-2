# Server steps — put the new privacy policy live (2026-11-05)

Two things change, both on the Hostinger VPS:

- **The website** gets the new privacy policy at https://shopgenuine.online/privacy-policy
  (Arvi Consumer Private Limited, Grievance Officer, and what the website and app
  collect). This needs the website rebuilt, which takes a few minutes.
- **The API** sends https://api.shopgenuine.online/privacy-policy on to that page,
  because the app's first Play Store build links there.

No database change and no settings change.

## Steps

Open the Hostinger web terminal for the VPS, then type each line and press Enter.

1. Go to the Shop Genuine folder:

       cd /root/shop-genuine-2

2. Note where you are now, in case you ever need to go back:

       git log --oneline -1

   Write down the 7-character code at the start of the line.

3. Get the new code:

       git pull

   You should see `client/src/app/privacy-policy/page.js` and
   `server/controllers/pages.controller.js` in the list of changed files.
   If it says `error` or `conflict`, stop and send me a screenshot.

4. Restart the API:

       pm2 restart shop-genuine-server

   You should see `shop-genuine-server` with status **online**.

5. Rebuild the website and restart it (one line; it only restarts if the build worked):

       cd client && npm run build && pm2 restart shop-genuine-client; cd ..

   The build takes a few minutes and ends with a list of pages, then a table with
   `shop-genuine-client` **online**. If it ends with `Failed to compile` or `Error`,
   send me a screenshot of the last lines.

6. Check it worked. Open these in your phone or computer browser:

   - https://shopgenuine.online/privacy-policy — shows **Privacy Policy** with
     **Arvi Consumer Private Limited** in the first paragraph and **Rajat Gulia** as
     Grievance Officer at the bottom.
   - https://api.shopgenuine.online/privacy-policy — lands on the same page.
   - https://api.shopgenuine.online/delete-account — still opens.

## If something goes wrong

Go back to the code from step 2 and rebuild:

    cd /root/shop-genuine-2
    git checkout <the code you wrote down> -- server client
    pm2 restart shop-genuine-server
    cd client && npm run build && pm2 restart shop-genuine-client; cd ..

Then send me a screenshot.
