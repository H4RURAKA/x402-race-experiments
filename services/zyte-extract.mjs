#!/usr/bin/env node
import "dotenv/config";
import { runX402Race } from "../lib/x402-race-lib.mjs";

if (!process.env.ZYTE_API_KEY) {
  throw new Error(
    "Set ZYTE_API_KEY in .env. Current Zyte extract access returns 401 without Zyte API authentication."
  );
}

const body = process.env.ZYTE_BODY_JSON
  ? JSON.parse(process.env.ZYTE_BODY_JSON)
  : {
      url: process.env.ZYTE_TARGET_URL ?? "https://example.com",
      httpResponseBody: true,
    };

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
headers.Authorization = `Basic ${Buffer.from(`${process.env.ZYTE_API_KEY}:`, "utf8").toString("base64")}`;

await runX402Race({
  name: "zyte-extract",
  rpcUrl: process.env.RPC_URL ?? "https://mainnet.base.org",
  authorizerKey: process.env.AUTHORIZER_KEY,
  targetUrl: process.env.ZYTE_URL ?? "https://api-x402.zyte.com/v1/extract",
  method: "POST",
  headers,
  body: JSON.stringify(body),
  nReplicas: Number(process.env.N_REPLICAS ?? "10"),
  validWindowSec: Number(process.env.VALID_WINDOW_SEC ?? "10"),
  forceBase64Url: String(process.env.FORCE_BASE64URL ?? "0") === "1",
  logProbeBodyOnFail: String(process.env.LOG_PROBE_BODY_ON_FAIL ?? "1") !== "0",
  summaryFile: process.env.SUMMARY_FILE,
});
