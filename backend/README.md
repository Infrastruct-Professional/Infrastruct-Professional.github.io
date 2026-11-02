# Infrastruct Professional — trusted backend scaffold

This is **not a deployed or production-ready backend**. GitHub Pages serves static files and cannot run `server.mjs` as a service. Run it on a separate trusted Node.js 20+ host only after infrastructure, identity, TLS reverse proxy and secrets have been provisioned. It binds to `127.0.0.1:8787` by default.

## Local development

`node --test backend/server.test.mjs`

`PORT=8787 EXECUTOR_ACCESS_TOKEN=<local-dev-token> SHOPIFY_WEBHOOK_SECRET=<test-webhook-secret> node backend/server.mjs`

Never commit real tokens or webhook secrets. Do not expose the development server to the public internet. The example environment values are placeholders.

## Current behavior

- `/health` reports dry-run status.
- `/plans` returns an empty plan catalogue; `/checkout` returns 503.
- `/entitlements` always reports inactive.
- `/webhooks/shopify` validates HMAC against the **raw request body**, checks the configured Shopify shop domain and webhook metadata, and deduplicates event IDs in memory for local tests. It does not grant access or update subscriptions. Production requires durable replay prevention and Shopify contract verification.
- `/prepare`, `/execute` and `/revoke` refuse real operations. No SSH, container execution, cloud provider modification or Shopify purchase is implemented.
- Other endpoints use a development bearer token; this is **not** a production identity system. Browser UI has no mechanism to authenticate to it yet.

## Production gates

Implement authenticated sessions (and CSRF protection), persistent user/customer identity, verified Shopify subscription lifecycle and server-side entitlements, replay-safe webhook processing, operation target ownership verification, strict allowlisted executor actions, audit trails, per-operation approval, short-lived scoped tokens, idempotency, rate limits, output redaction, secret management, resource limits, cancellation and expiry, and external security review. Prefer managed runtime isolation rather than running arbitrary user-supplied shell commands.

Separate billing identity from authorization to alter a customer's infrastructure. A paid subscription alone never grants deployment permission.

## Shopify subscription prerequisites

Shopify reports `eligibleForSubscriptions=true`, `sellsSubscriptions=false` for `k0yrr9-zr.myshopify.com` at the time of preparation. The three products remain DRAFT and have no attached recurring selling plans.

Shopify's subscriptions API requires a supported subscriptions app with protected permissions; an ordinary merchant Admin API connector alone is not a substitute. Use the official Shopify Subscriptions app or a vetted subscription provider, configure monthly and annual selling plans, confirm payment processing and renewal lifecycle, then connect a trusted authenticated backend. Do not use a one-time product checkout as a recurring subscription.

Set `SHOPIFY_SHOP_DOMAIN` to the verified shop domain on the backend (default is the current merchant domain); set `SHOPIFY_WEBHOOK_SECRET` only through a secret manager. This server remains non-public and non-production.

## Subscription policy engine (offline tests only)

`subscription-policy.mjs` provides a fail-closed entitlement decision model with product allowlisting, matching customer identities, shop matching, verified contract and payment requirements, and expiration. **The policy engine does not perform Shopify verification itself.** Its `identityVerified`, `contractVerified`, and `paymentCurrent` inputs must be populated exclusively by a trusted server-side identity and Shopify verification workflow, never by browser or webhook payload assertions. No HTTP endpoint currently grants these entitlements.

Store inventory check (2026-11-01): only Shopify Messaging and Shopify ChatGPT MCP App are installed. No subscription app or selling plan groups were found. Installing a supported subscription app is required before creating genuine recurring offers.

## Payment and confirmation policy

`payment-policy.mjs` models payment-confirmation decisions, including amount/currency matching, customer matching, captured-payment status and independently verified subscription contracts. This is an **offline policy model**, not a payment processor or an email sender. Inputs such as `serverVerified` and `paymentCaptured` must come from a trusted provider verification workflow, never from a browser redirect. A decision to send confirmation does not mean an email has been sent.

Payment rollout: Visa/Mastercard via a configured eligible recurring-payment provider first; PayPal Express recurring support currently reports DISABLED in Shopify; Bitcoin and bank transfers require distinct verified payment and renewal workflows and must not automatically activate recurring subscription entitlements. Confirmation email must be queued idempotently only after provider verification, with no card details or secrets included. Use Shopify notifications or a transactional email provider only after configuring sender authentication and templates.

### Shopify subscription lifecycle (staged)
`shopify-subscription-adapter.mjs` maps the existing Shopify draft products to plans, records recognized webhook topics as audit-only events, and exposes an authenticated `GET /shopify/readiness` endpoint. This is **not** a Shopify billing integration. The executor is not deployed, and in-memory webhook deduplication is not production-safe.

Before launch: configure a Shopify subscription-capable app and selling plan group, confirm subscription eligibility and product publication, deploy the authenticated executor behind TLS, persist webhook replay keys and customer associations, verify Shopify subscription contracts and billing outcomes server-side, implement checkout session creation and customer entitlement reconciliation, then explicitly approve activation. No client-side payment success should grant access.

#### Verified Shopify access check — 2026-11-02
The connected **Infrastruct Professional** Shopify app installation has `write_products` but **does not have** `read_customer_payment_methods`, `read_own_subscription_contracts`, or `write_own_subscription_contracts`. Its `sellingPlanGroups(first:20)` query returned no groups. Do not attempt `sellingPlanGroupCreate` until an authorized subscription app is installed/approved and granted the necessary scopes. See [Shopify subscription app requirements](https://shopify.dev/docs/apps/build/purchase-options/subscriptions/selling-plans/build-a-selling-plan) and [Shopify access scopes](https://shopify.dev/docs/api/usage/access-scopes).
