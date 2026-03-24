#!/usr/bin/env node
import "dotenv/config";
import { runX402Race } from "../lib/x402-race-lib.mjs";

const body = process.env.SNACK_BODY_JSON
  ? JSON.parse(process.env.SNACK_BODY_JSON)
  : {
      receiver: process.env.SNACK_RECEIVER ?? "dwr",
      amount: process.env.SNACK_AMOUNT ?? "0.01",
      currency: process.env.SNACK_CURRENCY ?? "USDC",
    };

console.log("[snack-farcaster-pay] WARNING: this target can spend real funds if payment succeeds.");

await runX402Race({
  name: "snack-farcaster-pay",
  rpcUrl: process.env.RPC_URL ?? "https://mainnet.base.org",
  authorizerKey: process.env.AUTHORIZER_KEY,
  targetUrl: process.env.SNACK_URL ?? "https://api.snack.money/payments/farcaster/pay",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify(body),
  nReplicas: Number(process.env.N_REPLICAS ?? "10"),
  validWindowSec: Number(process.env.VALID_WINDOW_SEC ?? "10"),
  forceBase64Url: String(process.env.FORCE_BASE64URL ?? "0") === "1",
  logProbeBodyOnFail: String(process.env.LOG_PROBE_BODY_ON_FAIL ?? "1") !== "0",
  summaryFile: process.env.SUMMARY_FILE,
});
