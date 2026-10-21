import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const VERSION = /^\d+(\.\d+){0,2}$/;

/** A version like "1.2.0" from the environment, or null when unset or malformed. */
function readVersion(name) {
  const value = (process.env[name] || "").trim();
  if (!value) return null;
  if (!VERSION.test(value)) {
    console.warn(`[app-version] Ignoring ${name}="${value}" — expected a version like 1.2.0`);
    return null;
  }
  return value;
}

function platformPolicy(suffix) {
  return {
    // Installed versions below this are blocked with a "Please update" screen.
    minVersion: readVersion(`APP_MIN_VERSION_${suffix}`),
    // Installed versions below this see a dismissible "new version" prompt.
    latestVersion: readVersion(`APP_LATEST_VERSION_${suffix}`),
    storeUrl: (process.env[`APP_STORE_URL_${suffix}`] || "").trim() || null,
  };
}

/**
 * Which store versions of the mobile app are still supported.
 *
 * The app asks on launch and whenever it returns to the foreground. Values come
 * from server/.env so they change with a `pm2 restart`, without a deploy, and
 * every value is optional — unset means "no requirement", which is the default.
 * Android and iOS are separate because the two stores publish on different days.
 */
export const getAppVersion = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponsive(
      200,
      {
        android: platformPolicy("ANDROID"),
        ios: platformPolicy("IOS"),
        message: (process.env.APP_UPDATE_MESSAGE || "").trim() || null,
      },
      "App version policy",
    ),
  );
});
