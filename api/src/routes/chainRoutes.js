import { Router } from "express";
import { formatEther } from "viem";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getPublicClient, listChains } from "../services/chainService.js";
import { assertAddress } from "../services/contractService.js";
import { serialize } from "../services/serialize.js";
import { HttpError } from "../errors/HttpError.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ success: true, data: listChains() });
});

router.get(
  "/balance/:address",
  asyncHandler(async (req, res) => {
    assertAddress(req.params.address);
    const chainId = Number(req.query.chainId || 1);
    const client = getPublicClient(chainId);
    try {
      const wei = await client.getBalance({ address: req.params.address });
      res.status(200).json({
        success: true,
        data: serialize({
          address: req.params.address,
          chainId,
          wei,
          formatted: formatEther(wei),
          symbol: client.chain.nativeCurrency.symbol,
        }),
      });
    } catch (error) {
      throw new HttpError(502, "RPC_READ_FAILED", error.shortMessage || "Could not read the native balance");
    }
  })
);

export default router;
