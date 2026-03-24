#!/usr/bin/env node
import "dotenv/config";
import { runX402Race } from "../lib/x402-race-lib.mjs";

const baseUrl = process.env.MINIFETCH_URL ?? "https://minifetch.com/api/v1/x402/extract/url-metadata";
const targetUrl = new URL(baseUrl);

const query = process.env.MINIFETCH_BODY_JSON
  ? JSON.parse(process.env.MINIFETCH_BODY_JSON)
  : {
      url: process.env.MINIFETCH_TARGET_URL ?? "https://example.com",
      verbosity: process.env.MINIFETCH_VERBOSITY ?? undefined,
      includeResponseBody: process.env.MINIFETCH_INCLUDE_RESPONSE_BODY ?? undefined,
    };

for (const [key, value] of Object.entries(query)) {
  if (value === undefined || value === null || value === "") continue;
  targetUrl.searchParams.set(key, String(value));
}

await runX402Race({
  name: "minifetch-url-metadata",
  rpcUrl: process.env.RPC_URL ?? "https://mainnet.base.org",
  authorizerKey: process.env.AUTHORIZER_KEY,
  targetUrl: targetUrl.toString(),
  method: "GET",
  headers: {
    Accept: "application/json",
  },
  body: undefined,
  nReplicas: Number(process.env.N_REPLICAS ?? "10"),
  validWindowSec: Number(process.env.VALID_WINDOW_SEC ?? "10"),
  forceBase64Url: String(process.env.FORCE_BASE64URL ?? "0") === "1",
  logProbeBodyOnFail: String(process.env.LOG_PROBE_BODY_ON_FAIL ?? "1") !== "0",
  summaryFile: process.env.SUMMARY_FILE,
});
