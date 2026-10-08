/**
 * Exports the catalogue to a portable JSON file.
 *
 * Run this against the database that HAS the products (the dev machine), then
 * copy the file plus `importCatalogue.js` to the server and import there. The
 * two databases never talk to each other, so no production credentials are
 * needed here and none leave the server.
 *
 * Everything is keyed by slug rather than id, because ids differ between
 * databases. Image URLs are already absolute (DigitalOcean Spaces), so the same
 * files serve both environments and nothing has to be re-uploaded.
 *
 *   node -r dotenv/config scripts/exportCatalogue.js [outfile]
 */
import { prisma } from "../config/db.js";
import fs from "fs";

const out = process.argv[2] || "catalogue-export.json";

const dec = (v) => (v === null || v === undefined ? null : String(v));

const run = async () => {
  const verticals = await prisma.storeVertical.findMany({
    orderBy: { order: "asc" },
  });

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: { include: { images: { orderBy: { order: "asc" } } } },
      categories: { include: { category: { select: { slug: true } } } },
      storeVertical: { select: { slug: true } },
      brand: { select: { slug: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const payload = {
    exportedAt: new Date().toISOString(),
    counts: {
      storeVerticals: verticals.length,
      categories: categories.length,
      products: products.length,
      variants: products.reduce((n, p) => n + p.variants.length, 0),
      images: products.reduce((n, p) => n + p.images.length, 0),
    },
    storeVerticals: verticals.map((v) => ({
      name: v.name,
      slug: v.slug,
      image: v.image,
      order: v.order,
      isActive: v.isActive,
    })),
    categories: categories.map((c) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
    })),
    products: products.map((p) => ({
      slug: p.slug,
      name: p.name,
      description: p.description,
      isActive: p.isActive,
      visibility: p.visibility,
      gender: p.gender,
      featured: p.featured,
      ourProduct: p.ourProduct,
      hasVariants: p.hasVariants,
      productType: p.productType,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      keywords: p.keywords,
      tags: p.tags,
      storeVerticalSlug: p.storeVertical?.slug ?? null,
      brandSlug: p.brand?.slug ?? null,
      categorySlugs: p.categories.map((pc) => ({
        slug: pc.category.slug,
        isPrimary: pc.isPrimary,
      })),
      images: p.images.map((i) => ({
        url: i.url,
        alt: i.alt,
        isPrimary: i.isPrimary,
        order: i.order,
      })),
      variants: p.variants.map((v) => ({
        sku: v.sku,
        price: dec(v.price),
        salePrice: dec(v.salePrice),
        quantity: v.quantity,
        isActive: v.isActive,
        shippingLength: v.shippingLength,
        shippingBreadth: v.shippingBreadth,
        shippingHeight: v.shippingHeight,
        shippingWeight: v.shippingWeight,
        images: v.images.map((i) => ({
          url: i.url,
          alt: i.alt,
          isPrimary: i.isPrimary,
          order: i.order,
        })),
      })),
    })),
  };

  fs.writeFileSync(out, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${out}`);
  console.table(payload.counts);
  await prisma.$disconnect();
};

run().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
