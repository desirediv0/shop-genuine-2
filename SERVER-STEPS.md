# Server steps — public pages move to the main website (2026-11-05)

What changes, all on the Hostinger VPS:

- **The website** gets a new page, https://shopgenuine.online/delete-account (how to
  delete a Shop Genuine account — Google Play requires it), and the privacy policy now
  links to it.
- **The API** no longer serves any web pages: `api.shopgenuine.online/delete-account`
  and `api.shopgenuine.online/privacy-policy` are removed. The API keeps only the app's
  API (and its `/health` status check).

No database change and no settings change. About five minutes.

## Steps

Open the Hostinger web terminal for the VPS, then type each line and press Enter.

1. Go to the Shop Genuine folder:

       cd /root/shop-genuine-2

2. Note where you are now, in case you ever need to go back:

       git log --oneline -1

   Write down the 7-character code at the start of the line.

3. Get the new code:

       git pull

   You should see `client/src/app/delete-account/page.js` and `server/app.js` in the list.
   If it says `error` or `conflict`, stop and send me a screenshot.

4. Restart the API:

       pm2 restart shop-genuine-server

   You should see `shop-genuine-server` with status **online**.

5. Rebuild the website and restart it (one line; it only restarts if the build worked):

       cd client && npm run build && pm2 restart shop-genuine-client; cd ..

   The build takes a few minutes and ends with a list of pages, then a table with
   `shop-genuine-client` **online**. If it ends with `Failed to compile` or `Error`,
   send me a screenshot of the last lines.

6. Tell me it's done — I check these myself:

   - https://shopgenuine.online/delete-account shows "Delete your Shop Genuine account"
   - https://shopgenuine.online/privacy-policy still opens, and links to the page above
   - https://api.shopgenuine.online/delete-account no longer shows a page
   - the app still loads products (the API is unaffected)

## If something goes wrong

Go back to the code from step 2 and rebuild:

    cd /root/shop-genuine-2
    git checkout <the code you wrote down> -- server client
    pm2 restart shop-genuine-server
    cd client && npm run build && pm2 restart shop-genuine-client; cd ..

Then send me a screenshot.
