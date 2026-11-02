# Infrastruct Web OS versioning

Current baseline: **0.1.0** (development), established 2026-11-02.

This is the first formal version, not a claim that earlier commits represented specific releases. Version identity is maintained in `web-os-version.js` and displayed on the right of the website banner.

Semantic versioning policy:
- `0.x.y`: pre-1.0 development, interfaces may change.
- Patch (`0.1.1`): compatible bug fixes and refinements.
- Minor (`0.2.0`): substantial functionality or architecture milestones.
- `1.0.0`: only after reviewed stability, authentication, services and deployment readiness.

For future releases, update the version module, document the changes, run tests, and create a matching Git tag when approved. No release tag is created automatically.
