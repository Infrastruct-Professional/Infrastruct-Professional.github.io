# Infrastruct Professional — implementation standards

## Service boundaries
- Self-service planning tools require no account and operate locally in the browser.
- Plans are exported as JSON; external deployments, domain changes and DNS changes require separate authenticated, explicitly authorized integrations.
- Never solicit passwords or API tokens in public planning forms.
- The Finish action clears the in-memory workbench output and UI. It does not claim to erase browser caches, downloaded files, server logs or legally required records.

## Web platform
- Minimal `index.html` bootstraps `index.js`; JavaScript creates DOM and styles. `index.R` is evaluated by webR for audit and statistics.
- ES modules, semantic elements, keyboard-accessible controls, visible focus and responsive layout.
- SVG vector icons scale without bitmap downloads; browser rendering/compositing may be GPU accelerated but this is not guaranteed. Avoid large blur effects and unnecessary animations; respect `prefers-reduced-motion`.
- Mobile and tablet use adaptive full-screen app surfaces and navigation; desktop retains its independent window system.
- Progressive enhancement: a missing WebGPU device must not prevent the tools from operating. GPU APIs should be introduced only where measured rendering workloads justify them.

## Future operations
- Separate read/plan/apply stages with an explicit confirmation for every external change.
- Provider-specific credentials must be managed server-side or through delegated authorization, not embedded in static GitHub Pages assets.
- Add automated accessibility, performance, security and mobile-device testing before describing this site as fully compliant with WCAG 2.2 AA or other standards.

## Shopify commerce integration (pre-programmed, disconnected)
- `commerce.js` provides a Shopify commerce UI and a backend adapter. Connection is disabled until merchant credentials, approved storefront domain, and HTTPS backend endpoint are configured.
- Backend contract: `GET {apiEndpoint}/offers` returns `{ "offers": [{ "id": "...", "title": "...", "price": "...", "currency": "EUR" }] }`; `POST {apiEndpoint}/checkout` accepts `{ "offerId": "..." }` and returns `{ "checkoutUrl": "https://..." }`.
- The backend must map offer IDs to server-controlled Shopify variants, create checkouts through supported Shopify APIs, verify Shopify webhooks and payment status, and issue short-lived entitlements. Never accept prices, paid status or checkout destinations directly from a browser without server validation.
- Public frontend configuration must contain no secret keys. Authentication, payment verification, webhook signing, refunds and entitlements are not implemented by this static frontend.
- Payment does not imply authorization for server access or DNS changes. Obtain a separate explicit confirmation for every external change.


## Subscription business model
- Infrastruct Professional charges for recurring access plans, **not** per DNS record, server configuration or deployment job. Plans grant access to workstation capabilities, not managed hosting or ongoing infrastructure operation.
- The Shopify catalogue is the source for plan identifiers, billing intervals, prices and currencies. No tiers, prices or feature limits are presumed before merchant configuration.
- Updated backend contract: `GET {apiEndpoint}/plans` returns `{ "plans": [{ "id": "...", "title": "...", "price": "...", "currency": "EUR", "interval": "month" }] }`; `POST {apiEndpoint}/checkout` accepts `{ "planId": "..." }` and returns `{ "checkoutUrl": "https://..." }`.
- Backend must use supported Shopify subscription/selling-plan capabilities, authenticate the customer, verify signed billing notifications and check subscription entitlements server-side. Support renewals, cancellation, past-due states, upgrades, downgrades and refunds with documented access rules. Never trust browser-supplied subscription status.
- Plan cancellation or expiry must never alter or shut down already-deployed customer infrastructure. Customers own their deployments and may export their configuration.
- Existing older `offers` API notes are superseded by the `plans` contract above.

## Ephemeral runtime orchestration
- `orchestrator.js` introduces a class-based, session-scoped runtime registry with create, manifest generation, and disposal. The workbench attaches a generated runtime manifest to exported plans and disposes local runtime sessions on Finish.
- The current implementation generates **local plans only**. It does not spawn a remote backend, run server commands, configure external services, or guarantee erasure of browser caches, downloaded files or external logs.
- JavaScript/webR can run browser-local calculations; server-side jobs, Shopify secrets, webhook processing and authenticated subscriptions require a separately authorized trusted executor or serverless backend.
- Future remote adapters must use least-privilege, short-lived authorization, explicit operation approval, idempotency, verifiable results, timeouts, resource quotas, revocation and audit records. Never put provider secrets in a browser-generated manifest.

## Remote execution adapter contract (inactive)
- `remote-adapter.js` defines an optional HTTPS-only remote executor interface, intentionally disabled until a trusted execution service and authenticated connection are provisioned. It does not directly SSH into a customer's server or accept passwords in the browser.
- `POST /prepare` receives `{manifest}` and must authenticate the user, validate plan entitlements, authorize the target, resolve a strict allowlisted operation, enforce quotas, and return `{operationId,summary,approvalToken}`. The token must be short-lived, bound to that authenticated user, operation, target and exact manifest, and protected against replay.
- A separate explicit approval UI must show the exact target and change summary before calling `POST /execute` with `{operationId,approvalToken,approved:true}`. A browser-provided `approved` flag is not proof of authorization; the backend must independently verify authorization, CSRF defenses, token binding, idempotency and approval state.
- `POST /revoke` accepts `{operationId}`; the executor must cancel queued work and revoke temporary credentials. Running work may need rollback or compensation. The executor must enforce server-side timeouts, least privilege, sandboxing, output redaction, audit retention policy, and cleanup.
- No remote backend or Shopify billing verification has been deployed. The personal-server tool currently exports a planning manifest only. Local Finish does not revoke a remote operation unless a trusted backend has actually implemented that lifecycle.
