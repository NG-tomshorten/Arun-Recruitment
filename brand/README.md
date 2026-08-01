# Brand assets — source files

Media pack supplied by Barry Shorten, August 2026 (artwork created 2016,
Photoshop CS6). These are the **originals** — nothing in this folder is served
by the site. Web-ready derivatives live in `public/images/` and `app/icon.png`.

## Contents

| File | What it is |
|---|---|
| `Logo.{png,jpg,psd}` | The mark: three gulls (teal + two charcoal), 1440×732, PNG has transparency |
| `Facebook Profile Picture 1440x1440.{png,jpg,psd}` | Square lockup: mark + company name set in Futura Light |
| `Facebook Profile Picture.{png,jpg,psd}` | Same square lockup at 180×180 |
| `Futura (Light).ttf` | Desktop font used in the lockup text |

## Derivatives (regenerate with `sips` if the originals ever change)

| Served file | Source | Notes |
|---|---|---|
| `public/images/logo.png` | `Logo.png` | 720×366, header mark |
| `public/images/logo-square.png` | `…1440x1440.png` | 512×512, for Organization/JobPosting JSON-LD logo and social use |
| `app/icon.png` | `Logo.png` | 512×512 favicon — gulls padded to square on chalk `#FAF7F2` |

## ⚠️ Futura licensing

`Futura (Light).ttf` is a commercial typeface (© 1987 Adobe Systems). The TTF
is a **desktop** font — it is almost certainly not licensed for web embedding.
**Do not add it via `@font-face` or `next/font/local`.** Site typography stays
Fraunces + Inter (PLAN §11.2). The logo rasters have Futura baked into the
artwork, which is fine — that's normal logo usage, not font redistribution.
