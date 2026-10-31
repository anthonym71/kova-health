# Kova Health demo - static deployment handover

The patient + provider web demo ships as plain static files (no Node.js, no
database, no secrets required). Everything on every page is synthetic.

## Build

```
npm install                 # repo root; Node 20+
cd apps/web
npm run build:static        # = KOVA_STATIC_EXPORT=1 next build
```

The deployable site is `apps/web/out/` - upload its **contents** to the web
root of `kova.amoscode.com` (subdomain document root, e.g. `public_html/` or
the equivalent in the My20i/20i panel). No server config is needed; entry
point is `index.html`. Pages live at `/today/`, `/track/`, `/medications/`,
`/care-team/`, `/records/`, `/guidance/`, `/summary/`, `/more/`,
`/connections/`, `/signin/`, `/provider/`, `/provider/patients/demo-patient-1/`.

## Requirements

- Any static file hosting over HTTPS works (20i shared hosting is fine).
- No Node.js runtime, database, environment variables, or write access needed.
- Optional but recommended: serve `404.html` as the 404 page.
- If hosting under a path prefix instead of a subdomain, rebuild with
  `KOVA_BASE_PATH=/prefix` so asset URLs include the prefix.

## Notes

- The site is a UI demo: no login, no backend calls, all data fabricated and
  labelled "synthetic demo" on every page.
- A pre-built bundle (kova-static-site.zip) accompanies this handover; unzip
  it into the document root and the site is live immediately.
