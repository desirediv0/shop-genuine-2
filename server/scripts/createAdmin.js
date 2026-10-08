/**
 * Creates the first SUPER_ADMIN.
 *
 * POST /api/admin/register requires an existing SUPER_ADMIN, so the very first
 * one cannot be made through the API — hence this script. Run it on the server
 * that owns the database.
 *
 *   node -r dotenv/config scripts/createAdmin.js --email=you@example.com
 *
 * The password is read from the ADMIN_PASSWORD environment variable, or
 * generated and printed once if that is unset. It is never taken from a CLI
 * flag, because arguments are visible to other users via `ps` and land in shell
 * history.
 *
 *   ADMIN_PASSWORD='...' node -r dotenv/config scripts/createAdmin.js --email=you@example.com
 *
 * Re-running for an existing email resets that admin's password instead of
 * failing, so it doubles as account recovery. Pass --promote to also lift an
 * existing admin to SUPER_ADMIN.
 *
 * SUPER_ADMIN bypasses every permission check in both the API
 * (middlewares/admin.middleware.js) and the dashboard UI (PermissionGuard.tsx),
 * so no Permission rows are needed. Run `npm run fix-super-admin` if you want
 * them populated anyway.
 */
import crypto from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";

function arg(name) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : null;
}

/** Mirrors helper/validatePassword.js so this account can log in and change its own password. */
function passwordProblem(pw) {
  if (pw.length < 8) return "at least 8 characters";
  if (!/[A-Z]/.test(pw)) return "an uppercase letter";
  if (!/[a-z]/.test(pw)) return "a lowercase letter";
  if (!/\d/.test(pw)) return "a number";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) return "a special character";
  return null;
}

/** Generates a password that satisfies the rules above. */
function generatePassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%^&*?";
  const all = upper + lower + digits + special;

  const pick = (set) => set[crypto.randomInt(set.length)];
  const chars = [pick(upper), pick(lower), pick(digits), pick(special)];
  while (chars.length < 20) chars.push(pick(all));

  // Fisher-Yates, so the guaranteed characters are not always in front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

async function main() {
  const email = (arg("email") || process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const firstName = arg("firstName") || "Shop";
  const lastName = arg("lastName") || "Genuine";
  const promote = process.argv.includes("--promote");

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    console.error("Usage: node -r dotenv/config scripts/createAdmin.js --email=you@example.com");
    process.exit(1);
  }

  let password = process.env.ADMIN_PASSWORD;
  let generated = false;

  if (!password) {
    password = generatePassword();
    generated = true;
  } else {
    const problem = passwordProblem(password);
    if (problem) {
      console.error(`ADMIN_PASSWORD needs ${problem}.`);
      process.exit(1);
    }
  }

  const hashed = await bcrypt.hash(password, 10);
  const existing = await prisma.admin.findUnique({ where: { email } });

  let admin;
  if (existing) {
    admin = await prisma.admin.update({
      where: { email },
      data: {
        password: hashed,
        isActive: true,
        ...(promote ? { role: "SUPER_ADMIN" } : {}),
      },
    });
    console.log(`\nPassword reset for existing admin ${email}`);
    if (promote) console.log("Role set to SUPER_ADMIN.");
    else if (admin.role !== "SUPER_ADMIN") {
      console.log(`Role left as ${admin.role}. Re-run with --promote to make it SUPER_ADMIN.`);
    }
  } else {
    admin = await prisma.admin.create({
      data: { email, password: hashed, firstName, lastName, role: "SUPER_ADMIN", isActive: true },
    });
    console.log(`\nCreated SUPER_ADMIN ${email}`);
  }

  if (generated) {
    console.log("\n  Password (shown once — store it in a password manager now):\n");
    console.log(`    ${password}\n`);
    console.log("  Change it after your first sign-in, from the dashboard profile page.");
  } else {
    console.log("\n  Password set from ADMIN_PASSWORD.");
  }

  const total = await prisma.admin.count();
  console.log(`\n  Sign in at https://admin.shopgenuine.online`);
  console.log(`  ${total} admin account(s) now exist.\n`);
}

main()
  .catch((e) => {
    console.error("Failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
