#!/usr/bin/env node
import "dotenv/config";
import { runX402Race } from "../lib/x402-race-lib.mjs";

const body = process.env.ELSA_BODY_JSON
  ? JSON.parse(process.env.ELSA_BODY_JSON)
  : {
      symbol_or_address: process.env.ELSA_SYMBOL_OR_ADDRESS ?? "USDC",
      limit: Number(process.env.ELSA_LIMIT ?? "5"),
    };

await runX402Race({
  name: "elsa-search-token",
  rpcUrl: process.env.RPC_URL ?? "https://mainnet.base.org",
  authorizerKey: process.env.AUTHORIZER_KEY,
  targetUrl: process.env.ELSA_URL ?? "https://x402-api.heyelsa.ai/api/search_token",
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
