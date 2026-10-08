import { HttpError } from "../errors/HttpError.js";

const buckets = new Map();

export function rateLimit({ windowMs, max }) {
  return (req, res, next) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const recent = (buckets.get(key) || []).filter((timestamp) => now - timestamp < windowMs);
    if (recent.length >= max) {
      next(new HttpError(429, "RATE_LIMITED", "Too many requests. Try again shortly."));
      return;
    }
    recent.push(now);
    buckets.set(key, recent);
    next();
  };
}
