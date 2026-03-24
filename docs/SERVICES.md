# Services

## Daydreams Images
- Script: `services/daydreams-images-jobs.mjs`
- Endpoint: `https://api-beta.daydreams.systems/v1/images/generations`
- Method: `POST`
- Main env: `DAYDREAMS_URL`, `DAYDREAMS_BODY_JSON`, `DAYDREAMS_MODEL`, `DAYDREAMS_PROMPT`, `DAYDREAMS_IMAGE_COUNT`, `DAYDREAMS_SIZE`, `DAYDREAMS_QUALITY`, `DAYDREAMS_RESPONSE_FORMAT`, `DAYDREAMS_BEARER`, `DAYDREAMS_INSECURE_TLS`

## Elsa Search Token
- Script: `services/elsa-search-token.mjs`
- Endpoint: `https://x402-api.heyelsa.ai/api/search_token`
- Method: `POST`
- Main env: `ELSA_URL`, `ELSA_BODY_JSON`, `ELSA_SYMBOL_OR_ADDRESS`, `ELSA_LIMIT`

## Firecrawl Search
- Script: `services/firecrawl-x402-search.mjs`
- Endpoint: `https://api.firecrawl.dev/v1/x402/search`
- Method: `POST`
- Main env: `FIRECRAWL_URL`, `FIRECRAWL_BODY_JSON`, `FIRECRAWL_QUERY`, `FIRECRAWL_LIMIT`, `FIRECRAWL_BEARER`

## Heurist AskHeurist
- Script: `services/heurist-deep-research.mjs`
- Endpoint: `https://mesh.heurist.xyz/x402/agents/AskHeuristAgent/ask_heurist`
- Method: `POST`
- Main env: `HEURIST_URL`, `HEURIST_BODY_JSON`, `HEURIST_QUERY`

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
