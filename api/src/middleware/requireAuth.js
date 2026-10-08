import { HttpError } from "../errors/HttpError.js";
import { readSession } from "../services/authService.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    next(new HttpError(401, "UNAUTHORIZED", "Sign in with your wallet to continue"));
    return;
  }

  try {
    req.wallet = readSession(token);
    next();
  } catch (error) {
    next(error);
  }
}
