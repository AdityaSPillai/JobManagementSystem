import express from "express";
import { getExchangeRate } from "./currency.js";

const router = express.Router();

router.get("/convert", async (req, res) => {
  const { base, target, amount } = req.query;

  const rate = await getExchangeRate(base, target);
  const converted = rate * Number(amount);

  res.json({
    base,
    target,
    rate,
    original: amount,
    converted
  });
});

export default router;