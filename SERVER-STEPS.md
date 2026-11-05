# Server steps — put the privacy policy page live (2026-11-05)

Adds one new page, https://api.shopgenuine.online/privacy-policy. Nothing else on
the server changes: no database change, no settings change. It takes about two
minutes.

## Steps

Open the Hostinger web terminal for the VPS, then type each line and press Enter.

1. Go to the Shop Genuine folder:

       cd /root/shop-genuine-2

2. Note where you are now (in case you ever need to go back):

       git log --oneline -1

   Write down the 7-character code at the start of the line.

3. Get the new code:

       git pull

   You should see `server/controllers/pages.controller.js` in the list of changed files.
   If it says `error` or `conflict`, stop and send me a screenshot.

4. Restart the API so it uses the new code:

       pm2 restart shop-genuine-server

   You should see a table with `shop-genuine-server` and status **online**.

5. Check it worked. Open this in your phone or computer browser:

   https://api.shopgenuine.online/privacy-policy

   You should see **"Privacy policy"** with **Arvi Consumer Private Limited** in the
   first paragraph. Also check https://api.shopgenuine.online/delete-account still
   opens.

## If something goes wrong

If step 4 shows the status as **errored**, or the shop stops working, go back to the
code from step 2:

    git checkout <the code you wrote down> -- server
    pm2 restart shop-genuine-server

Then send me a screenshot.
