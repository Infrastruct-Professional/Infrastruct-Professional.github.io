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

## Explicit remote approval interface
- After generating a plan, the workbench renders a remote-execution section. Its Prepare button remains disabled until an executor is configured.
- A trusted executor must return `target` (nonempty string), `summary`, `operationId`, and `approvalToken`; otherwise the client refuses to display approval. The user must check a separate authorization box before submitting execution.
- The approval UI reports only the executor's response, not independently verified deployment success. Revocation is a request, not a guarantee. Changing tools or finishing the local session aborts in-flight browser requests but cannot guarantee remote cancellation.
- The trusted executor must independently enforce verified Shopify subscription entitlements and authentication. No backend, webhook processor, or subscription access enforcement is deployed yet.

## Trusted backend scaffold (2026-11)
- `backend/server.mjs` is an undeployed Node.js HTTP scaffold. It binds to localhost, fails closed for all real deployment and billing operations, and can validate raw-body Shopify webhook HMAC when a secret is supplied.
- Webhook HMAC authenticity alone does not establish payment or subscription entitlement. The scaffold intentionally does not grant access on webhook reception.
- `backend/server.test.mjs` covers authentication rejection, execution refusal, checkout refusal, webhook HMAC rejection and cross-origin rejection.
- This is not a production-ready executor, Shopify integration, or identity provider. See `backend/README.md` for mandatory production gates.

## Customer subscription profile and Shopify account mapping
- Connected Shopify merchant account verified via the Shopify plugin: store domain `k0yrr9-zr.myshopify.com`, EUR, Finland. This domain is public merchant configuration only; no API credentials are embedded in the frontend.
- `subscription-profile.js` provides the customer-facing subscription profile UI. It is intentionally disconnected until identity and a trusted billing backend are configured. The backend `/profile` endpoint currently returns an unauthenticated, unavailable profile and grants no entitlements.
- Recurring subscriptions must be modeled as Shopify products/variants with supported selling plans. Checkout must carry a valid selling plan ID and create a Shopify subscription contract. Billing renewals and failures must be managed by an authorized subscriptions app, with Shopify contract status verified server-side.
- A customer profile should display verified plan, subscription state, renewal date and entitled workstation features, with authenticated customer management for upgrades, downgrades and cancellation when supported. Subscription access must never be inferred from a browser flag, product title, email alone or webhook signature alone.
- The Shopify merchant's **Basic** plan is the merchant's Shopify account tier, not an Infrastruct Professional customer subscription tier. No customer plan names, prices or billing intervals have been set or published.

## Shopify draft products (merchant-approved preparation)
- Starter: `gid://shopify/Product/11005805887821`, proposed €19/month, draft.
- Professional: `gid://shopify/Product/11005806379341`, proposed €59/month, draft.
- Enterprise: `gid://shopify/Product/11005806510413`, proposed €199/month, draft.
- These are ordinary Shopify **draft products** with one priced variant each, **not yet subscription selling plans**. They must not be represented as recurring billing until selling plans, a subscriptions app, and verified contract lifecycle are configured. Annual intervals and discount are still proposals.
- The static website shows non-purchasable proposed plans with disabled subscribe controls. The merchant must approve publication and activation of recurring charges.

## Subscription selling plan readiness
- Verified through Shopify Admin API: `eligibleForSubscriptions=true`, `sellsSubscriptions=false` for the connected merchant store as of 2026-11-01.
- Proposed annual prepayment prices with 15% discount: Starter €193.80/year, Professional €601.80/year, Enterprise €2,029.80/year. These are **proposals only**, not configured Shopify selling plans or authorized charges.
- `plan-catalog.js` centralizes the three merchant product GIDs, feature descriptions and proposed monthly/annual prices; no secrets or payment controls are included. Do not infer access entitlements from this public catalogue.
- Before billing activation: install/configure a supported subscription app, associate monthly and annual recurring selling plans with the three products, verify Shopify Payments and store eligibility, build verified checkout and contract lifecycle, and obtain final merchant approval for pricing and publication.

## Webhook safety checkpoint
- Shopify webhook HMAC, exact expected shop, event metadata and in-memory duplicate detection are now implemented and covered by tests. Duplicate detection is not persistent and must not be treated as production replay protection.
- Valid webhooks never grant subscription access. A verified authenticated customer-to-Shopify-contract mapping, paid/active state, cancellations, payment failure policy, durable event store and secure customer session are required first.

## Runtime reconciliation (2026-11-02)
- `runtime-system.js` is the browser-local coordinator for the JavaScript/webR lifecycle and R audit bridge; `index.R` is the authoritative R audit implementation. JavaScript creates the DOM and CSS; the static `index.html` only loads `index.js`.
- The coordinator reports webR as active only after module initialization and successful evaluation of `index.R`. If webR cannot load, the JavaScript site remains operational and R status is unavailable; it must not claim that R statistics are running.
- `core-systems.js` owns cooperative background scheduling, and `orchestrator.js` owns ephemeral local runtime sessions. Neither provides actual OS process priority, physical RAM reservation, global pools or trusted server execution.
- `browser/{cache,detect,login}`, `mobile`, `tablet`, and `desktop/window` are structural directories, not independently operational systems. Authentication is still simulated, not verified.
- Future reconciliation: move environment detection into `browser/detect`, establish deliberate browser cache policy, replace simulated login with trusted authentication, add real viewport/browser end-to-end tests, and evaluate webR package pinning rather than relying on `/latest/`.

## Platform system module ownership (2026-11-02)
- `web-os.js` is the mode-selecting facade and contains no platform window implementation.
- `desktop/system/runtime-base.js` defines shared browser-local application/window lifecycle. `desktop/system/desktop-system.js` owns the desktop system instance.
- `desktop/window/system/window-system.js` implements desktop window creation, titlebar, dragging, resizing, task buttons and generated Web OS CSS.
- `tablet/system/tablet-system.js` implements tablet navigation, full-screen applications and recents. `mobile/system/mobile-system.js` extends it with mobile system identity.
- Platform modules are instantiated once by the Web OS facade and mounted based on browser environment detection. This does not create privileged operating-system access.
- The separate `runtime-system.js` remains the JavaScript/webR audit coordinator; `index.R` remains the R audit implementation. The empty `.gitkeep` files may be removed once a directory has committed source files.


## Runtime, tool and service module ownership (2026-11-02)
- `runtime/` contains `runtime-system.js`, `runtime-status.js` and `orchestrator.js`; the root `index.R` is evaluated by the browser-local webR coordinator.
- `tools/` contains engineering tool catalogue, encoding and random-generation implementations.
- `services/` contains WHOIS, DNS-provider, hosting-provider and secure-shell booth implementations.
- The public entrypoint remains root `index.html` -> `index.js`; all JavaScript module imports use the updated relative paths.
- This is source organization, not proof of functional live backend services or verified browser security.

## Mobile menu and browser detection reconciliation (2026-11-02)
- The header menu control is 30×30 CSS pixels on mobile, with a 24×24 image. It must not be confused with the separate Android-style system navigation bar.
- `browser/detect/browser-detection.js` owns browser, OS and viewport-mode detection. `index.js` delegates to this system during initial construction and viewport resize.
- Mobile and tablet have one navigation bar owned by the Web OS. Visual checks on real devices remain outstanding.

- Pop-out/pop-in controls are installed exclusively by `DesktopWindowSystem.createWindow()`; the shared base creates no popup controls, so tablet/mobile application surfaces cannot display them.

- On tablet/mobile the background motto is positioned below the Android-style navigation dock, with safe-area spacing; desktop layout remains unchanged.

## Global, local, server and client runtime scopes (2026-11-02)
- `global/global-system.js`: global coordination contract, unavailable until provisioned.
- `local/local-system.js`: active browser-local execution and browser-managed storage; does not imply reserved physical memory.
- `server/server-system.js`: trusted backend boundary, unavailable on static GitHub Pages until a separately deployed service is configured and verified.
- `client/client-system.js`: browser-reported platform context, not verified device identity.
- `RuntimeOrchestrator.scopeStatus()` provides read-only snapshots for the four registered scopes. No cross-network operations, authentication or server allocation are implied.

## Protocol, connectivity and browser namespaces (2026-11-02)
- `api/`, `cookies/`, `dns/` and `ssh/` own the existing public plan API contract, consent management, DNS provider links and SSH planning respectively; no trusted backend is implied.
- `url/`, `uri/`, `session/`, `pgp/`, `https/`, `http/`, `dhcp/`, `vpn/`, `ad/`, `nfs/`, `nfc/`, `gsm/`, `gps/`, `wifi/`, `firefox/`, `chrome/`, `safari/`, `lang/` each own a capability module registered by `runtime/protocol-registry.js`.
- Browser capability detection does not request permission, perform privileged networking, connect to a VPN, access GPS coordinates, scan NFC, or execute SSH. Unsupported or unconfigured services must report unavailable.
- `RuntimeOrchestrator.protocolStatus()` exposes the combined 22-namespace status snapshot.
