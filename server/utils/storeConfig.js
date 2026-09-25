/**
 * Store Configuration Utility
 * Centralized configuration for store name, email, and other store-specific settings
 * All values can be overridden via environment variables
 */

export const getStoreConfig = () => {
  return {
    // Store Information
    storeName: process.env.STORE_NAME || "Shop Genuine",
    storeEmail: process.env.STORE_EMAIL || "connect.genuinenutrition@gmail.com",
    storePhone: process.env.STORE_PHONE || "+91 80532 10008",
    storeAddress: process.env.STORE_ADDRESS || "89/2 Sector 39, Gurugram, Haryana",

    // Store Description/Tagline
    storeTagline: process.env.STORE_TAGLINE || "Everything Genuine, All in One Place",
    storeDescription:
      process.env.STORE_DESCRIPTION ||
      "Shop Genuine brings you authentic nutrition, grocery, pharmacy and cosmetics — all in one trusted store.",

    // Email Configuration
    fromName: process.env.FROM_NAME || process.env.STORE_NAME || "SHOP GENUINE",
    fromEmail:
      process.env.FROM_EMAIL ||
      process.env.STORE_EMAIL ||
      process.env.SMTP_USER ||
      "connect.genuinenutrition@gmail.com",

    // Website Information
    websiteUrl: process.env.WEBSITE_URL || "https://shopgenuine.online",
    supportEmail:
      process.env.SUPPORT_EMAIL ||
      process.env.STORE_EMAIL ||
      "connect.genuinenutrition@gmail.com",

    // Social Media (optional)
    socialFacebook: process.env.SOCIAL_FACEBOOK || "",
    socialTwitter: process.env.SOCIAL_TWITTER || "",
    socialInstagram: process.env.SOCIAL_INSTAGRAM || "https://www.instagram.com",
    socialYoutube: process.env.SOCIAL_YOUTUBE || "",
    socialWhatsapp: process.env.SOCIAL_WHATSAPP || "918053210008",
  };
};

/**
 * Get store name
 */
export const getStoreName = () => {
  return getStoreConfig().storeName;
};

/**
 * Get store email
 */
export const getStoreEmail = () => {
  return getStoreConfig().storeEmail;
};

/**
 * Get from name for emails
 */
export const getFromName = () => {
  return getStoreConfig().fromName;
};

/**
 * Get from email for emails
 */
export const getFromEmail = () => {
  return getStoreConfig().fromEmail;
};

/**
 * Get full store information object
 */
export const getFullStoreInfo = () => {
  const config = getStoreConfig();
  return {
    name: config.storeName,
    email: config.storeEmail,
    phone: config.storePhone,
    address: config.storeAddress,
    tagline: config.storeTagline,
    description: config.storeDescription,
    websiteUrl: config.websiteUrl,
    supportEmail: config.supportEmail,
    fromName: config.fromName,
    fromEmail: config.fromEmail,
    social: {
      facebook: config.socialFacebook,
      twitter: config.socialTwitter,
      instagram: config.socialInstagram,
      youtube: config.socialYoutube,
    },
  };
};

export default getStoreConfig;
