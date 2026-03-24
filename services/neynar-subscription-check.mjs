#!/usr/bin/env node
import "dotenv/config";
import { runX402Race } from "../lib/x402-race-lib.mjs";

function buildUrl() {
  if (process.env.NEYNAR_URL) {
    return process.env.NEYNAR_URL;
  }

  const addresses = process.env.NEYNAR_ADDRESSES;
  const contract = process.env.NEYNAR_CONTRACT;
  const chainId = process.env.NEYNAR_CHAIN_ID ?? "8453";

  if (!addresses || !contract) {
    throw new Error(
      "Set NEYNAR_URL directly or both NEYNAR_ADDRESSES and NEYNAR_CONTRACT in .env. Neynar needs a concrete subscription_check target."
    );
  }

  return (
    "https://api.neynar.com/v2/stp/subscription_check/" +
    `?addresses=${encodeURIComponent(addresses)}` +
    `&contract_address=${encodeURIComponent(contract)}` +
    `&chain_id=${encodeURIComponent(chainId)}`
  );
}

if (!process.env.NEYNAR_API_KEY) {
  throw new Error(
    "Set NEYNAR_API_KEY in .env. Current Neynar subscription_check access requires x-api-key authentication."
  );
}

const headers = {
  Accept: "application/json",
};
headers["x-api-key"] = process.env.NEYNAR_API_KEY;

await runX402Race({
  name: "neynar-subscription-check",
  rpcUrl: process.env.RPC_URL ?? "https://mainnet.base.org",
  authorizerKey: process.env.AUTHORIZER_KEY,
  targetUrl: buildUrl(),
  method: "GET",
  headers,
  body: undefined,
  nReplicas: Number(process.env.N_REPLICAS ?? "10"),
  validWindowSec: Number(process.env.VALID_WINDOW_SEC ?? "10"),
  forceBase64Url: String(process.env.FORCE_BASE64URL ?? "0") === "1",
  logProbeBodyOnFail: String(process.env.LOG_PROBE_BODY_ON_FAIL ?? "1") !== "0",
  summaryFile: process.env.SUMMARY_FILE,
});
