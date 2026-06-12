# @vskstudio/takt-astro

## 0.2.1

### Patch Changes

- Fix the `<Takt />` component never running in production builds. It shipped an `is:inline` module whose bare `@vskstudio/takt-core` import the browser couldn't resolve, and it imported its helpers from `src/` (absent from the published tarball). The component now passes options through a JSON data island and boots from a bundled module that resolves the core import. Same single-pageview-per-navigation behaviour as the integration.
- 3676d9e: Fix client-side navigations emitting several pageviews each. Astro's ClientRouter runs multiple history operations per navigation, so relying on core's history patch over-counted. The runtime now drives pageviews from `astro:after-swap` (one per navigation) plus a single explicit initial pageview.

## 0.2.0

Initial release.

- Default-export `takt(options)` Astro integration that injects the Takt runtime via `astro:config:setup`.
- `<Takt />` component for manual placement in a layout `<head>`.
- View Transitions support: re-fires a pageview on `astro:page-load`, skipping the initial load to avoid double-counting.
- SSR/prerender safe; runs only in the browser.
- Re-exports core `track` / `pageview` / `optOut` / `optIn`.
