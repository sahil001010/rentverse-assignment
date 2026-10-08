import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { createLoginChallenge, verifyLogin } from "../services/authService.js";

const router = Router();
const limitLogin = rateLimit({ windowMs: 60_000, max: 20 });

router.get("/nonce", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: "Open http://localhost:3000 and use Connect. This address accepts POST { address } from the app, not a normal browser visit.",
    },
  });
});

router.post(
  "/nonce",
  limitLogin,
  asyncHandler(async (req, res) => {
    const challenge = createLoginChallenge(req.body?.address);
    res.status(200).json({ success: true, data: challenge });
  })
);

router.post(
  "/verify",
  limitLogin,
  asyncHandler(async (req, res) => {
    const session = await verifyLogin({
      address: req.body?.address,
      signature: req.body?.signature,
    });
    res.status(200).json({ success: true, data: session });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: { address: req.wallet.address } });
  })
);

export default router;
