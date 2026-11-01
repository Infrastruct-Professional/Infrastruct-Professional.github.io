# Infrastruct Professional — ChatGPT Sites migration readiness

Status: preparation only. No ChatGPT Site has been created and no DNS or hosting has been switched.

## Source and architecture
- Source: `Infrastruct-Professional/Infrastruct-Professional.github.io`, `main`, GitHub Pages, `infrastruct.pro`.
- Tag and archive the source commit before cutover; keep GitHub Pages available for rollback.
- Preserve the index.html to index.js entry, index.R with webR, runtime-generated interface, JavaScript classes and registries, R audit/analysis/statistics, and responsive desktop/tablet/mobile web OS.
- Verify JavaScript module serving, webR/WebAssembly MIME types, CSP, browser permissions and API CORS on the target Site.
- Preserve the four plan tiers, in-window navigation, WHOIS/RDAP, DNS and hosting provider directories, encoders and local shell guidance.

## ChatGPT sign-in
- Preferred: use the supported ChatGPT Sites identity integration if available and configured for this Site.
- Separate website fallback: request approval and a client ID for Sign in with ChatGPT, using OpenID Connect Authorization Code + PKCE and a trusted backend.
- Discover issuer, authorization, token and JWKS endpoints from https://auth.openai.com/.well-known/openid-configuration .
- Server must validate state, nonce, issuer, audience, token signature and expiration; associate stable subject identity and issue secure HttpOnly, Secure, SameSite cookies.
- Planned backend routes: `/auth/openai/start`, `/auth/openai/callback`, `/session`, `/logout`. They are not live.
- Keep the banner at Guest until a trusted session has been verified. ChatGPT subscription status does not confer Infrastruct paid-plan entitlements.
- Never put client secrets, tokens or user credentials into static JavaScript, URLs, localStorage, the plan vault or source control.
- Official docs: https://developers.openai.com/siwc/website and https://help.openai.com/en/articles/20001410-sign-in-with-chatgpt .

## Local storage migration
- The encrypted plan vault is bound to the browser origin. A change of hostname or origin will not carry localStorage data automatically.
- Build and test encrypted export/import with user-held passphrases before removing the old origin; do not migrate plaintext without explicit consent.

## DNS cutover
- Inventory and back up existing DNS records, CNAME, TLS certificates, domain verification, TTLs and redirect behavior.
- Verify the new Site on a staging address first. Do not switch DNS until HTTPS and all core flows pass.
- Retain documented rollback records and GitHub Pages until cutover is confirmed stable.

## Acceptance checklist
- [ ] Target Site created and import validated.
- [ ] Browser/OS/IP/Guest banner and favicon render correctly.
- [ ] Desktop windows, internal navigation, Android-style mobile recents tested.
- [ ] Free plan and provider directories work; paid features remain explicitly planned.
- [ ] WHOIS, encoders, Web Crypto, webR, audit and storage-disabled cases tested.
- [ ] Encrypted vault exported/imported across origins with no plaintext leakage.
- [ ] Real ChatGPT sign-in, verified session, logout, expiry and denied consent tested.
- [ ] DNS and TLS verified; rollback rehearsed; final cutover explicitly approved.
