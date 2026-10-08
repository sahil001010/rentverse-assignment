import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { getContract, listContracts, requireConfigured } from "../config/contracts.js";
import { encodeContractCall, readContractCall, readContractEvents } from "../services/contractService.js";

const router = Router();

router.get("/", (req, res) => {
  const contracts = listContracts().map(({ abi, ...contract }) => ({
    ...contract,
    functions: abi.filter((item) => item.type === "function").map((item) => item.name),
    events: abi.filter((item) => item.type === "event").map((item) => item.name),
  }));
  res.status(200).json({ success: true, data: contracts });
});

router.get("/:id", (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: getContract(req.params.id) });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const contract = requireConfigured(getContract(req.params.id));
    const data = await readContractCall(contract, {
      functionName: req.body?.functionName,
      args: req.body?.args || [],
    });
    res.status(200).json({ success: true, data });
  })
);

router.post(
  "/:id/encode",
  requireAuth,
  asyncHandler(async (req, res) => {
    const contract = getContract(req.params.id);
    const data = await encodeContractCall(contract, {
      functionName: req.body?.functionName,
      args: req.body?.args || [],
    });
    res.status(200).json({ success: true, data });
  })
);

router.get(
  "/:id/events",
  asyncHandler(async (req, res) => {
    const contract = requireConfigured(getContract(req.params.id));
    const data = await readContractEvents(contract, {
      eventName: req.query.eventName,
      fromBlock: req.query.fromBlock,
      toBlock: req.query.toBlock,
    });
    res.status(200).json({ success: true, data });
  })
);

export default router;
