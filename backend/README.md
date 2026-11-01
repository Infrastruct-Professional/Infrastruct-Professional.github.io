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
- `/webhooks/shopify` validates HMAC against the **raw request body** but does not grant access or update subscriptions.
- `/prepare`, `/execute` and `/revoke` refuse real operations. No SSH, container execution, cloud provider modification or Shopify purchase is implemented.
- Other endpoints use a development bearer token; this is **not** a production identity system. Browser UI has no mechanism to authenticate to it yet.

## Production gates

Implement authenticated sessions (and CSRF protection), persistent user/customer identity, verified Shopify subscription lifecycle and server-side entitlements, replay-safe webhook processing, operation target ownership verification, strict allowlisted executor actions, audit trails, per-operation approval, short-lived scoped tokens, idempotency, rate limits, output redaction, secret management, resource limits, cancellation and expiry, and external security review. Prefer managed runtime isolation rather than running arbitrary user-supplied shell commands.

Separate billing identity from authorization to alter a customer's infrastructure. A paid subscription alone never grants deployment permission.
