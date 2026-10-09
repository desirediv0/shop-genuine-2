# Server steps — run these on the VPS

Two jobs, in order. Together they take about ten minutes.

1. Fix the password-reset email, which currently sends people to `localhost`.
2. Load the 89 products, so the app and website stop looking empty.

Everything here is reversible, and each step tells you what you should see. If
anything looks different from what is written, **stop and send me the output**
rather than carrying on.

Open the Hostinger web terminal and work through it in order.

---

## Step 1 — Find the right folder

```bash
cd /root/shop-genuine-2/server
pwd
```

**Expect:** `/root/shop-genuine-2/server`

If it says "No such file or directory", run `ls /root/` and tell me what you
see. Do not continue.

---

## Step 2 — Check nothing is half-finished

```bash
git status --short
```

**Expect:** no output at all.

If it lists files, somebody edited code directly on the server. **Stop and send
me the list.** Pulling now could throw their work away.

---

## Step 3 — Get the new code

```bash
cd /root/shop-genuine-2
git pull
```

**Expect:** a list of changed files ending with something like
`16 files changed`.

If it says **"Your local changes would be overwritten"**, stop and send me the
message.

No `npm install` is needed — nothing new was added.

---

## Step 4 — Back up the settings file

Never skip this. It is your undo button.

```bash
cd /root/shop-genuine-2/server
cp .env .env.backup-before-fix
ls -la .env.backup-before-fix
```

**Expect:** one line showing the backup exists.

---

## Step 5 — See what the setting is now

```bash
grep -n "FRONTEND_URL\|ADMIN_URL" .env
```

**Expect:** something containing `localhost` — that is the bug.

---

## Step 6 — Fix the three addresses

Copy this whole block and paste it in one go:

```bash
cd /root/shop-genuine-2/server
for pair in 'FRONTEND_URL=https://shopgenuine.online' \
            'PARTNER_FRONTEND_URL=https://partner.shopgenuine.online' \
            'ADMIN_URL=https://admin.shopgenuine.online'; do
  key="${pair%%=*}"
  grep -q "^${key}=" .env && sed -i "s|^${key}=.*|${pair}|" .env || echo "$pair" >> .env
done
grep -E '^(FRONTEND_URL|PARTNER_FRONTEND_URL|ADMIN_URL)=' .env
```

**Expect exactly these three lines:**

```
FRONTEND_URL=https://shopgenuine.online
PARTNER_FRONTEND_URL=https://partner.shopgenuine.online
ADMIN_URL=https://admin.shopgenuine.online
```

If any still shows `localhost`, stop and send me the output.

---

## Step 7 — Restart and read the log

```bash
pm2 restart shop-genuine-server
sleep 5
pm2 logs shop-genuine-server --lines 30 --nostream
```

The site is down for two or three seconds here. That is normal.

**Expect:** `Server is running on port 4002` and **no lines containing `[WARN]`**.

**If you see a `[WARN]` about FRONTEND_URL**, the server is reading its settings
from somewhere else. Run this and send me the output:

```bash
pm2 env 14 | grep -i front
```

---

## Step 8 — Test the reset email

On your phone, use **Forgot password** in the app, then open the newest email.

**Expect:** the button goes to `https://shopgenuine.online/reset-password/...`

Ignore older emails — they still carry the old link.

---

## Step 9 — Preview the product import

This writes nothing. It only reports what it would do.

```bash
cd /root/shop-genuine-2/server
node -r dotenv/config scripts/importCatalogue.js catalogue-export.json --dry-run
```

**Expect it to end with:**

```
Products that would be added: 89
Products skipped (already present or SKU clash): 0
Products in this database now: 1
```

You will also see `vertical kept`, `category kept` and `category NEW` lines.
"kept" means it found something already there and will leave it alone — that is
correct, not a problem.

**If the last number is not 1**, stop and send me the output.

---

## Step 10 — Run the import

```bash
node -r dotenv/config scripts/importCatalogue.js catalogue-export.json
```

**Expect:**

```
Products added: 89
Products skipped (already present or SKU clash): 0
Products in this database now: 90
```

This only ever adds. It does not delete or overwrite your existing product.

Safe to run twice — the second run adds 0.

---

## Step 11 — Check it worked

```bash
curl -s "https://api.shopgenuine.online/api/v2/public/products?limit=1" | head -c 200
```

**Expect** to see `"total":90` somewhere in the output.

Then open the app on your phone and pull down to refresh. You should see the
full catalogue and all four stores in the switcher.

---

## If something goes wrong

Put the settings file back and restart:

```bash
cd /root/shop-genuine-2/server
cp .env.backup-before-fix .env
pm2 restart shop-genuine-server
```

The import cannot be undone by a command, but it never deletes anything — it
only adds products. If you want them gone, tell me and I will write a script
that removes exactly what was added.

---

## When you are done

Send me the output of Step 7, Step 10 and Step 11 and I will confirm everything
landed properly, then retake the store screenshots against your live data.
