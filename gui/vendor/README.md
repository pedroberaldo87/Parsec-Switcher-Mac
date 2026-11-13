# Vendored front-end assets

Third-party files shipped inside the app so it works offline and makes no CDN requests.

| Path | Upstream | Version | License |
|---|---|---|---|
| `bootstrap/bootstrap.min.css`, `bootstrap/bootstrap.bundle.min.js` (includes Popper) | https://getbootstrap.com | 5.3.3 | MIT (`bootstrap/LICENSE`) |
| `fontawesome/` (CSS + woff2 webfonts) | https://fontawesome.com (Font Awesome Free) | 6.5.1 | Icons CC BY 4.0, fonts SIL OFL 1.1, code MIT (`fontawesome/LICENSE.txt`) |
| `fonts/` (Orbitron, Outfit, latin subset) | https://fonts.google.com | v35 / v15 | SIL OFL 1.1 |

The `sourceMappingURL` comments were removed from the Bootstrap files (the maps are not shipped).
The Font Awesome stylesheet still lists `.ttf` fallbacks; only the `.woff2` files are shipped (WebKit supports woff2).
