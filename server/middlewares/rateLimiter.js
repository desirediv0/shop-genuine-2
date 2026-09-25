import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Rate limiter for OTP / register / resend (per email or IP — avoid blocking legitimate retries)
export const otpRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 8,
    message: {
        success: false,
        message: "Too many requests. Please try again after a minute.",
    },
    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req) => {
        // 1) If email is provided, use that
        try {
            const bodyEmail =
                req.body?.email || req.body?.data?.email;

            if (bodyEmail) return String(bodyEmail).toLowerCase();
        } catch (_) { }

        // 2) Otherwise use IPv6-safe builtin key generator
        return ipKeyGenerator(req);
    },
});


// Generic API rate limiter. Mounted on /api in app.js.
// The cap is deliberately generous: a mobile client browsing a catalog fires
// many more requests than a web page, and carriers put whole cities behind one
// CGNAT address, so a tight per-IP limit locks out real users before scrapers.
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
        success: false,
        message: "Too many requests. Please slow down and try again shortly.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/health",
});

export default otpRateLimiter;
