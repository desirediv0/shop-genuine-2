/**
 * Seeds the four Genuine sub-brands as Store Verticals.
 *
 * Idempotent: re-running updates names/order rather than creating duplicates,
 * and never reassigns products that already belong to a vertical.
 *
 *   node -r dotenv/config scripts/seedStoreVerticals.js
 *   node -r dotenv/config scripts/seedStoreVerticals.js --assign-unassigned=grocery
 */
import { prisma } from "../config/db.js";

const VERTICALS = [
  { name: "Genuine Nutrition", slug: "nutrition", order: 1 },
  { name: "Genuine Grocery", slug: "grocery", order: 2 },
  { name: "Genuine Pharmacy", slug: "pharmacy", order: 3 },
  { name: "Genuine Cosmetics", slug: "cosmetics", order: 4 },
];

async function main() {
  const assignArg = process.argv.find((a) => a.startsWith("--assign-unassigned="));
  const assignSlug = assignArg ? assignArg.split("=")[1] : null;

  for (const v of VERTICALS) {
    const existing = await prisma.storeVertical.findUnique({ where: { slug: v.slug } });

    if (existing) {
      await prisma.storeVertical.update({
        where: { slug: v.slug },
        data: { name: v.name, order: v.order, isActive: true },
      });
      console.log(`updated  ${v.name}`);
    } else {
      await prisma.storeVertical.create({
        // `image` is required by the schema; the admin dashboard replaces it
        // with a real upload. Empty string keeps the seed runnable.
        data: { ...v, image: "", isActive: true },
      });
      console.log(`created  ${v.name}`);
    }
  }

  if (assignSlug) {
    const target = await prisma.storeVertical.findUnique({ where: { slug: assignSlug } });
    if (!target) {
      console.error(`\nNo vertical with slug "${assignSlug}" — nothing assigned.`);
      process.exit(1);
    }

    // Only touches products with no vertical yet, so re-running is safe.
    const { count } = await prisma.product.updateMany({
      where: { storeVerticalId: null },
      data: { storeVerticalId: target.id },
    });
    console.log(`\nassigned ${count} previously-unassigned product(s) to ${target.name}`);
  }

  const summary = await prisma.storeVertical.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });

  console.log("\nStore verticals:");
  for (const v of summary) {
    console.log(`  ${String(v.order).padEnd(2)} ${v.name.padEnd(20)} ${v._count.products} product(s)`);
  }

  const orphans = await prisma.product.count({ where: { storeVerticalId: null } });
  if (orphans > 0) {
    console.log(`\n${orphans} product(s) still have no vertical — they appear only under "All".`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
