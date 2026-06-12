---
'@vskstudio/takt-astro': patch
---

Fix client-side navigations emitting several pageviews each. Astro's ClientRouter runs multiple history operations per navigation, so relying on core's history patch over-counted. The runtime now drives pageviews from `astro:after-swap` (one per navigation) plus a single explicit initial pageview.
