#!/usr/bin/env node
import "dotenv/config";
import { Wallet } from "ethers";
import { runX402Race } from "../lib/x402-race-lib.mjs";

const targetUrl = process.env.HEURIST_URL ?? "https://mesh.heurist.xyz/x402/agents/AskHeuristAgent/ask_heurist";
const walletAddress = process.env.AUTHORIZER_KEY
  ? new Wallet(process.env.AUTHORIZER_KEY).address
  : undefined;

const body = process.env.HEURIST_BODY_JSON
  ? JSON.parse(process.env.HEURIST_BODY_JSON)
  : targetUrl.includes("/x402/agents/AskHeuristAgent/ask_heurist")
    ? {
        prompt: process.env.HEURIST_QUERY ?? "Tell me the key risks in x402 payment verification and replay prevention.",
      }
    : {
        walletAddress,
        query: process.env.HEURIST_QUERY ?? "Tell me the key risks in x402 payment verification.",
      };

await runX402Race({
  name: "heurist-deep-research",
  rpcUrl: process.env.RPC_URL ?? "https://mainnet.base.org",
  authorizerKey: process.env.AUTHORIZER_KEY,
  targetUrl,
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
