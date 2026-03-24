#!/usr/bin/env node
import "dotenv/config";
import { runX402Race } from "../lib/x402-race-lib.mjs";

if (!process.env.FIRECRAWL_BEARER) {
  throw new Error(
    "Set FIRECRAWL_BEARER in .env. Current Firecrawl API requires Authorization: Bearer <token> before any x402 flow is exposed."
  );
}

const body = process.env.FIRECRAWL_BODY_JSON
  ? JSON.parse(process.env.FIRECRAWL_BODY_JSON)
  : {
      query: process.env.FIRECRAWL_QUERY ?? "Solana Turbine protocol DoS attack",
      limit: Number(process.env.FIRECRAWL_LIMIT ?? "3"),
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
      },
    };

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
if (process.env.FIRECRAWL_BEARER) {
  headers.Authorization = `Bearer ${process.env.FIRECRAWL_BEARER}`;
}

await runX402Race({
  name: "firecrawl-x402-search",
  rpcUrl: process.env.RPC_URL ?? "https://mainnet.base.org",
  authorizerKey: process.env.AUTHORIZER_KEY,
  targetUrl: process.env.FIRECRAWL_URL ?? "https://api.firecrawl.dev/v1/x402/search",
  method: "POST",
  headers,
  body: JSON.stringify(body),
  nReplicas: Number(process.env.N_REPLICAS ?? "10"),
  validWindowSec: Number(process.env.VALID_WINDOW_SEC ?? "10"),
  forceBase64Url: String(process.env.FORCE_BASE64URL ?? "0") === "1",
  logProbeBodyOnFail: String(process.env.LOG_PROBE_BODY_ON_FAIL ?? "1") !== "0",
  summaryFile: process.env.SUMMARY_FILE,
});
