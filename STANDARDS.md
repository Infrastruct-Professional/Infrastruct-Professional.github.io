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
