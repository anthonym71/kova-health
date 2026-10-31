# Kova Health (synthetic MVP)

Kova Health helps patients collect health information, maintain daily habits and
medications, and work with their care team. Provider Connect is the core product:
a patient grants access, a verified provider reviews the permitted information,
and the provider publishes a care plan that becomes daily actions for the patient.

**This repository is a synthetic-data demo.** Every patient, provider,
measurement, message and appointment in the running demo is fabricated. A feature
being visible is not evidence that its underlying clinical service is live. Do not
use this build with real patient data.

## What's in the box

| Path | Contents |
| --- | --- |
| `apps/web` | Next.js + TypeScript + Tailwind web app: all six modules on synthetic data (Vercel target) |
| `apps/mobile` | Expo (React Native) patient app scaffold: dev-build config, tab shell, Today demo screen |
| `packages/domain` | Shared types and rules: 15-day retention, adherence denominators, consent, grants |
| `packages/api-client` | Adapter contracts (Records, Telehealth, Symptom, DrugInteraction, Wearables) |
| `packages/design-tokens` | Shared colors/typography/spacing |
| `supabase/migrations` | Postgres schema with row-level security and 15-day expiry constraints |
| `docs` | MVP plan, build prompt, native guide, wearable spec, setup and status notes |

## Quick start (web demo, no accounts needed)

```bash
npm install
npm run dev --workspace apps/web
# open http://localhost:3000
```

The demo runs fully on built-in fixtures. Supabase env vars are only needed when
you wire real auth/database (see `docs/SETUP.md` and `.env.example`).

## The six modules

1. **Onboarding & profile** - `/signin` (demo auth), goals and consent model in `packages/domain`
2. **Connections & records** - `/connections`, `/records`: EHR (Epic sandbox / Oracle), phone health platforms, wearable catalog - all with honest demo/unavailable/requires-mobile states
3. **Dashboard & summaries** - `/today`, `/track`, `/summary`: goals, 7/15-day charts, expiring share composer
4. **Medications** - `/medications`: schedules, adherence with stated denominator, refill tracking, interaction check shown as unavailable (no licensed database)
5. **Provider Connect** - `/care-team` + `/provider`: invite -> grant -> review -> publish plan -> log -> revoke loop on synthetic data
6. **Symptom guidance** - `/guidance`: Guidance Plus paywall state, simulated labeled intake, red-flag escalation; emergency help always outside the paywall

## Hard rules baked in

- 15-day retention for health content; only allowlisted aggregate Insights persist (`packages/domain`, DB constraints)
- Missing data is unknown, never zero
- A missing integration credential produces an explicit unavailable state, never silent fake success
- No diagnosis, treatment plans or interaction conclusions from a general language model
- No real billing, clinical assessment or patient intake in this build
- Emergency copy tells users to call their own local emergency number; the app cannot route emergencies

## Status and honest gaps

See `docs/INTEGRATION-STATUS.md` for the verified/unverified integration matrix and
`docs/SECURITY-RETENTION.md` for the retention design. The native app, real
telehealth network, real billing and real clinical vendors are NOT built; each has
a documented dependency and acceptance flow in `docs/MVP-PLAN.md`.

## Static export (shared hosting, path prefix)

The web app can ship as plain static files for hosts without Node.js:

```
cd apps/web
KOVA_STATIC_EXPORT=1 npx next build   # or: npm run build:static
```

Upload the contents of `apps/web/out/` to the web root of the (sub)domain, e.g.
`https://kova.example.com/` -> Today page at `/today/`. To host under a path
prefix instead, set `KOVA_BASE_PATH=/kova` when building; the prefix is baked
into asset and link URLs. All data remains synthetic; there is no server
component in this mode.
