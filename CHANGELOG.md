# @vskstudio/takt-astro

## 0.2.0

Initial release.

- Default-export `takt(options)` Astro integration that injects the Takt runtime via `astro:config:setup`.
- `<Takt />` component for manual placement in a layout `<head>`.
- View Transitions support: re-fires a pageview on `astro:page-load`, skipping the initial load to avoid double-counting.
- SSR/prerender safe; runs only in the browser.
- Re-exports core `track` / `pageview` / `optOut` / `optIn`.
