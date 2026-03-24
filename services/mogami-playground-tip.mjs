#!/usr/bin/env node
import "dotenv/config";
import { runX402Race } from "../lib/x402-race-lib.mjs";

await runX402Race({
  name: "mogami-playground-tip",
  rpcUrl: process.env.RPC_URL ?? "https://mainnet.base.org",
  authorizerKey: process.env.AUTHORIZER_KEY,
  targetUrl: process.env.MOGAMI_URL ?? "https://playground.mogami.tech/tip",
  method: "GET",
  probeMethod: "HEAD",
  headers: {
    Accept: "text/plain, application/json;q=0.9, */*;q=0.8",
  },
  probeHeaders: {
    Accept: "text/plain, application/json;q=0.9, */*;q=0.8",
  },
  body: undefined,
  probeBody: undefined,
  nReplicas: Number(process.env.N_REPLICAS ?? "10"),
  validWindowSec: Number(process.env.MOGAMI_VALID_WINDOW_SEC ?? process.env.VALID_WINDOW_SEC ?? "8"),
  forceBase64Url: String(process.env.FORCE_BASE64URL ?? "0") === "1",
  headerMode: "payment-signature",
  logProbeBodyOnFail: String(process.env.LOG_PROBE_BODY_ON_FAIL ?? "1") !== "0",
  summaryFile: process.env.SUMMARY_FILE,
});
