# Services

## Elsa Search Token
- Script: `services/elsa-search-token.mjs`
- Endpoint: `https://x402-api.heyelsa.ai/api/search_token`
- Method: `POST`
- Main env: `ELSA_URL`, `ELSA_BODY_JSON`, `ELSA_SYMBOL_OR_ADDRESS`, `ELSA_LIMIT`

## Heurist AskHeurist
- Script: `services/heurist-deep-research.mjs`
- Endpoint: `https://mesh.heurist.xyz/x402/agents/AskHeuristAgent/ask_heurist`
- Method: `POST`
- Main env: `HEURIST_URL`, `HEURIST_BODY_JSON`, `HEURIST_QUERY`

## Minifetch URL Metadata
- Script: `services/minifetch-url-metadata.mjs`
- Endpoint: `https://minifetch.com/api/v1/x402/extract/url-metadata`
- Method: `GET`
- Main env: `MINIFETCH_URL`, `MINIFETCH_BODY_JSON`, `MINIFETCH_TARGET_URL`, `MINIFETCH_VERBOSITY`, `MINIFETCH_INCLUDE_RESPONSE_BODY`

## Mogami Tip
- Script: `services/mogami-playground-tip.mjs`
- Endpoint: `https://playground.mogami.tech/tip`
- Probe: `HEAD`
- Burst method: `GET`
- Main env: `MOGAMI_URL`, `MOGAMI_VALID_WINDOW_SEC`

## Neynar Subscription Check
- Script: `services/neynar-subscription-check.mjs`
- Endpoint: `https://api.neynar.com/v2/stp/subscription_check/` with query parameters
- Method: `GET`
- Main env: `NEYNAR_URL`, `NEYNAR_ADDRESSES`, `NEYNAR_CONTRACT`, `NEYNAR_CHAIN_ID`, `NEYNAR_API_KEY`

## Snack Farcaster Pay
- Script: `services/snack-farcaster-pay.mjs`
- Endpoint: `https://api.snack.money/payments/farcaster/pay`
- Method: `POST`
- Main env: `SNACK_URL`, `SNACK_BODY_JSON`, `SNACK_RECEIVER`, `SNACK_AMOUNT`, `SNACK_CURRENCY`

## Zyte Extract
- Script: `services/zyte-extract.mjs`
- Endpoint: `https://api-x402.zyte.com/v1/extract`
- Method: `POST`
- Main env: `ZYTE_URL`, `ZYTE_BODY_JSON`, `ZYTE_TARGET_URL`, `ZYTE_API_KEY`
