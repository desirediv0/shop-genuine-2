/**
 * Imports a catalogue export produced by `exportCatalogue.js`.
 *
 * Run this ON THE SERVER, where DATABASE_URL already points at the live
 * database — that way no production credentials are needed anywhere else.
 *
 *   node -r dotenv/config scripts/importCatalogue.js catalogue-export.json --dry-run
 *   node -r dotenv/config scripts/importCatalogue.js catalogue-export.json
 *
 * Safety properties, because this runs against live data:
 *
 * - It only ever inserts. Nothing is deleted, and an existing row is left
 *   exactly as it is — so the product and categories already in production
 *   survive untouched.
 * - It is idempotent: products are matched by slug, so running it twice adds
 *   nothing the second time.
 * - `Category` and `StoreVertical` have a unique constraint on BOTH name and
 *   slug, so each is looked up by slug AND by name before inserting. Matching on
 *   one alone hits the other constraint — "Frozen Food" and "Munchies" already
 *   exist in production under the same name and slug.
 * - `--dry-run` reports exactly what would change and writes nothing.
 */
import { prisma } from "../config/db.js";
import fs from "fs";

const file = process.argv[2] || "catalogue-export.json";
const dryRun = process.argv.includes("--dry-run");

const data = JSON.parse(fs.readFileSync(file, "utf8"));
const log = [];
const note = (s) => {
  log.push(s);
  console.log(s);
};

/** Find a row by slug, then by name, so neither unique constraint is violated. */
const findBySlugOrName = async (model, { slug, name }) =>
  (slug ? await model.findUnique({ where: { slug } }) : null) ||
  (name ? await model.findUnique({ where: { name } }) : null);

const run = async () => {
  note(`Importing ${file} (exported ${data.exportedAt})`);
  note(dryRun ? "DRY RUN — nothing will be written\n" : "Writing to the database\n");

  // ---- store verticals -------------------------------------------------
  const verticalIdBySlug = {};
  for (const v of data.storeVerticals) {
    const existing = await findBySlugOrName(prisma.storeVertical, v);
    if (existing) {
      verticalIdBySlug[v.slug] = existing.id;
      note(`  vertical kept     ${existing.name}`);
      continue;
    }
    if (dryRun) {
      note(`  vertical NEW      ${v.name}`);
      continue;
    }
    const created = await prisma.storeVertical.create({
      data: { name: v.name, slug: v.slug, image: v.image, order: v.order, isActive: v.isActive },
    });
    verticalIdBySlug[v.slug] = created.id;
    note(`  vertical created  ${v.name}`);
  }

  // ---- categories ------------------------------------------------------
  const categoryIdBySlug = {};
  for (const c of data.categories) {
    const existing = await findBySlugOrName(prisma.category, c);
    if (existing) {
      categoryIdBySlug[c.slug] = existing.id;
      note(`  category kept     ${existing.name}`);
      continue;
    }
    if (dryRun) {
      note(`  category NEW      ${c.name}`);
      continue;
    }
    const created = await prisma.category.create({
      data: { name: c.name, slug: c.slug, description: c.description, image: c.image },
    });
    categoryIdBySlug[c.slug] = created.id;
    note(`  category created  ${c.name}`);
  }

  // ---- products --------------------------------------------------------
  let added = 0;
  let skipped = 0;
  for (const p of data.products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      skipped++;
      continue;
    }

    // A duplicate SKU would abort the whole product, so check first and report
    // it rather than failing the run.
    const clashes = [];
    for (const v of p.variants) {
      const hit = await prisma.productVariant.findUnique({ where: { sku: v.sku } });
      if (hit) clashes.push(v.sku);
    }
    if (clashes.length) {
      note(`  SKIPPED ${p.slug} — SKU already in use: ${clashes.join(", ")}`);
      skipped++;
      continue;
    }

    if (dryRun) {
      added++;
      continue;
    }

    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        isActive: p.isActive,
        visibility: p.visibility,
        gender: p.gender,
        featured: p.featured,
        ourProduct: p.ourProduct,
        hasVariants: p.hasVariants,
        productType: p.productType ?? undefined,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        keywords: p.keywords,
        tags: p.tags ?? [],
        ...(p.storeVerticalSlug && verticalIdBySlug[p.storeVerticalSlug]
          ? { storeVerticalId: verticalIdBySlug[p.storeVerticalSlug] }
          : {}),
        images: {
          create: p.images.map((i) => ({
            url: i.url,
            alt: i.alt,
            isPrimary: i.isPrimary,
            order: i.order,
          })),
        },
        variants: {
          create: p.variants.map((v) => ({
            sku: v.sku,
            price: v.price,
            salePrice: v.salePrice,
            quantity: v.quantity,
            isActive: v.isActive,
            shippingLength: v.shippingLength,
            shippingBreadth: v.shippingBreadth,
            shippingHeight: v.shippingHeight,
            shippingWeight: v.shippingWeight,
            images: {
              create: v.images.map((i) => ({
                url: i.url,
                alt: i.alt,
                isPrimary: i.isPrimary,
                order: i.order,
              })),
            },
          })),
        },
        categories: {
          create: p.categorySlugs
            .filter((cs) => categoryIdBySlug[cs.slug])
            .map((cs) => ({ categoryId: categoryIdBySlug[cs.slug], isPrimary: cs.isPrimary })),
        },
      },
    });
    added++;
  }

  note("");
  note(`Products ${dryRun ? "that would be added" : "added"}: ${added}`);
  note(`Products skipped (already present or SKU clash): ${skipped}`);
  const total = await prisma.product.count({ where: { isDeleted: false } });
  note(`Products in this database now: ${total}`);
  await prisma.$disconnect();
};

run().catch(async (e) => {
  console.error("\nImport failed:", e.message);
  await prisma.$disconnect();
  process.exit(1);
});
