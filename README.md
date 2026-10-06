# me.sevipsagis

Personal profile of Nuttapol Phomthon, styled after the menu screens of the Persona series
(a fan tribute built from original CSS/SVG; no game assets).

Plain static site, no build step. Deploy the repository root to Cloudflare Pages
(build command `exit 0`, output directory `/`).

Run locally:

```sh
python3 -m http.server 4173
# open http://localhost:4173/
```

- `index.html` — all content, readable without JavaScript.
- `assets/js/site.js` — menu navigation, screen wipes, ransom-note headings.
- `assets/fonts/` — Anton, Archivo Black, DM Serif Display (SIL Open Font License 1.1).
