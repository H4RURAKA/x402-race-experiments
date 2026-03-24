#!/usr/bin/env node
import "dotenv/config";
import process from "node:process";
import { runX402Race } from "../lib/x402-race-lib.mjs";

if (String(process.env.DAYDREAMS_INSECURE_TLS ?? "0") === "1") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.warn("[daydreams-images-jobs] WARNING: DAYDREAMS_INSECURE_TLS=1 disables TLS certificate verification for testing.");
}

if (!process.env.DAYDREAMS_BEARER) {
  console.warn(
    "[daydreams-images-jobs] WARNING: DAYDREAMS_BEARER is empty. Current Daydreams docs show Bearer auth before image generation."
  );
}

const body = process.env.DAYDREAMS_BODY_JSON
  ? JSON.parse(process.env.DAYDREAMS_BODY_JSON)
  : {
      model: process.env.DAYDREAMS_MODEL ?? "openai/gpt-image-1",
      prompt: process.env.DAYDREAMS_PROMPT ?? "A minimal icon of a lock with circuit lines",
      n: Number(process.env.DAYDREAMS_IMAGE_COUNT ?? "1"),
      size: process.env.DAYDREAMS_SIZE ?? "1024x1024",
      quality: process.env.DAYDREAMS_QUALITY ?? "medium",
      response_format: process.env.DAYDREAMS_RESPONSE_FORMAT ?? "url",
    };

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
if (process.env.DAYDREAMS_BEARER) {
  headers.Authorization = `Bearer ${process.env.DAYDREAMS_BEARER}`;
}

await runX402Race({
  name: "daydreams-images-jobs",
  rpcUrl: process.env.RPC_URL ?? "https://mainnet.base.org",
  authorizerKey: process.env.AUTHORIZER_KEY,
  targetUrl: process.env.DAYDREAMS_URL ?? "https://api-beta.daydreams.systems/v1/images/generations",
  method: "POST",
  headers,
  body: JSON.stringify(body),
  nReplicas: Number(process.env.N_REPLICAS ?? "10"),
  validWindowSec: Number(process.env.VALID_WINDOW_SEC ?? "10"),
  forceBase64Url: String(process.env.FORCE_BASE64URL ?? "0") === "1",
  logProbeBodyOnFail: String(process.env.LOG_PROBE_BODY_ON_FAIL ?? "1") !== "0",
  summaryFile: process.env.SUMMARY_FILE,
});
