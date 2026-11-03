# The Oaks (TSL) – custom code

Custom JS and CSS for https://theoaks.tidyspacelite.co.uk (Webflow site `6a7ded1ff312445bf969f0b7`).

Forked from `pixelsilo/tsl-3` at commit `a67876e` on 3 Nov 2026, so that The Oaks can change without affecting the other TSL sites that load tsl-3 unversioned.

Files are plain scripts with no build step. They are served by jsDelivr, pinned to a git tag or commit.

**Live now:** commit `d21069b` (tag `v1.0.0`). jsDelivr cached a 404 for the new repo before the tag existed, so v1.0.0 is pinned by commit hash, which is just as immutable. Use tags (`@v1.0.1`, …) from the next release once `https://cdn.jsdelivr.net/gh/pixelsilo/tsl-the-oaks@v1.0.0/js/core.js` returns 200.

## Files

| File | Loaded on | What it does |
|---|---|---|
| `css/styles.css` | All pages (site head) | Map tooltip and block pin styles |
| `js/panzoom-map.js` | All pages (site footer) | Site plan pan/zoom, map pins built from the CMS lists, tooltips |
| `js/block-pins.js` | All pages (site footer) | Renders apartment block pins as one "15–23" pill coloured by the block's `block-status` |
| `js/navbar.js` | All pages | Nav behaviour |
| `js/compare.js` | All pages | Compare plots |
| `js/core.js` | All pages | 3D Vista relopen, price formatting, form success messages |
| `js/favourite.js` | All pages | Favourites |
| `js/update-form-3.js` | All pages | Admin update form |
| `js/admin-status.js` | All pages | Admin status list |
| `js/map.js` | Area Map page (page footer) | Google area map |

`panzoom.min.js` (unpkg) and Finsweet Attributes are still loaded directly in Webflow.

## Releasing

1. Edit the files, commit and push.
2. Tag the release: `git tag -a v1.0.1 -m "what changed"` then `git push origin v1.0.1`.
3. Check that `https://cdn.jsdelivr.net/gh/pixelsilo/tsl-the-oaks@v1.0.1/js/block-pins.js` returns the new code.
4. Change the version in the Webflow site head and footer, and in the Area Map page footer, then publish.

Never move or re-push an existing tag, because jsDelivr caches tagged files permanently. To roll back, set the version back to the previous tag and republish.

## Local testing

Serve this folder on port 5500 (e.g. VS Code Live Server, or `npx serve -l 5500`). Then swap the CDN block in Webflow custom code for the commented-out Local block. Keep script order the same: the scripts rely on `DOMContentLoaded` and on loading in order, which is why they are plain `<script>` tags rather than a dynamic loader.

## Webflow side

- The block pin's `block-status` attribute is bound to the `apartmentcard-1` component prop **Availability slug**. On the Home page that prop is bound to Apartment Block → Availability → Slug.
- The current site head and footer code is in `webflow-custom-code.html`.
