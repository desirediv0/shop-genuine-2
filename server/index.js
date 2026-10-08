import app from "./app.js";
import dotenv from "dotenv";
import { prisma } from "./config/db.js";
import { logger } from "./utils/logger.js";

dotenv.config({ path: ".env" });

const PORT = process.env.PORT || 4004;

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Application should continue running despite unhandled promises
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Give server time to handle ongoing requests before shutting down
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("Shutting down gracefully...");
  try {
    await prisma.$disconnect();
    console.log("Database disconnected successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

// Listen for termination signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Auto-seed default homepage sections if they don't exist
const seedDefaultSections = async () => {
  try {
    // Shop Genuine sells nutrition, grocery, pharmacy and cosmetics. These
    // descriptions previously described handcrafted jewellery, left over from an
    // earlier project, and reappeared on every fresh database.
    const defaults = [
      { name: "Featured Collections", slug: "featured", description: "Handpicked products our customers come back for", color: "bg-blue-500", displayOrder: 1 },
      { name: "Latest Additions", slug: "latest", description: "The newest arrivals across every Genuine store", color: "bg-green-500", displayOrder: 2 },
      { name: "Best Sellers", slug: "bestseller", description: "Our most popular products, trusted across India", color: "bg-yellow-500", displayOrder: 3 },
      { name: "Trending Now", slug: "trending", description: "What people are buying most this week", color: "bg-purple-500", displayOrder: 4 },
      { name: "New Arrivals", slug: "new", description: "Just landed on the shelves", color: "bg-pink-500", displayOrder: 5 },
    ];

    for (const s of defaults) {
      const existing = await prisma.productSection.findUnique({
        where: { slug: s.slug }
      });
      if (!existing) {
        await prisma.productSection.create({
          data: {
            name: s.name,
            slug: s.slug,
            description: s.description,
            color: s.color,
            displayOrder: s.displayOrder,
            isActive: true
          }
        });
        console.log(`Auto-seeded default section: ${s.name} 🌱`);
      }
    }
  } catch (err) {
    console.error("Error auto-seeding default sections:", err);
  }
};

/**
 * Every customer-facing link in an email is built from these variables, and
 * nothing fails when one is wrong — the mail simply goes out pointing at
 * localhost. That is how a password-reset link reached a customer's phone as
 * `http://localhost:3000/reset-password/...`: invisible on the server, broken
 * for the user. Shout about it at boot instead.
 *
 * FRONTEND_URL alone is used by 11 links: the password reset, the account
 * deletion confirmation, and the "Track your order" / "View account" buttons on
 * every order email. ADMIN_URL is optional but silently falls back to
 * FRONTEND_URL, which points admin mail at a storefront path that does not exist.
 */
const checkPublicUrls = () => {
  const isProd = process.env.NODE_ENV === "production";
  const looksLocal = (v) => /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(v);

  const required = ["FRONTEND_URL", "PARTNER_FRONTEND_URL"];
  for (const name of required) {
    const value = process.env[name];
    if (!value) {
      logger(
        "WARN",
        `${name} is not set. Email links will read "undefined/..." and every recipient will see a broken link.`
      );
    } else if (isProd && looksLocal(value)) {
      logger(
        "WARN",
        `${name} is "${value}" while NODE_ENV=production. Emails are going out with links nobody outside this machine can open. Set it to the public https:// address and restart.`
      );
    }
  }

  if (!process.env.ADMIN_URL) {
    logger(
      "WARN",
      'ADMIN_URL is not set, so admin order emails link to FRONTEND_URL + "/orders" — a storefront path that does not exist. Set it to the admin dashboard address.'
    );
  }
};

// Connect to the database and start the server
prisma
  .$connect()
  .then(async () => {
    checkPublicUrls();
    await seedDefaultSections();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} 🚀`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  });
