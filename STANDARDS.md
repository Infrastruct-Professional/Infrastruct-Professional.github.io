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
