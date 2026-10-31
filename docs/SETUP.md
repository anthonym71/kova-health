# Setup: GitHub, Supabase, Vercel

## 1. Repository

Private GitHub repo (default name `kova-health`). CI runs typecheck + production
build of `apps/web` on every push (`.github/workflows/ci.yml`).

## 2. Supabase (free project)

1. Create a project at https://supabase.com (free tier is enough for the demo).
2. In the SQL editor, run `supabase/migrations/20261031000001_init.sql`.
3. Project Settings > API gives you: Project URL, anon public key, service-role key.
4. Put them in `apps/web/.env.local` (see `.env.example`). Service-role stays
   server-only; never in the repo, never in `NEXT_PUBLIC_`, never in mobile
   `EXPO_PUBLIC_` variables.
5. Auth: enable email sign-in. Provider/operator MFA is a live-pilot requirement.

## 3. Vercel

1. Import the repo in Vercel; root directory `apps/web`.
2. Add the same env vars (separate preview vs production values).
3. Supabase has an official Vercel integration that syncs connection settings:
   https://supabase.com/docs/guides/integrations/vercel-marketplace
4. The database stays on Supabase; Vercel hosts the web app and server routes.

## 4. Local development

```bash
npm install
npm run dev --workspace apps/web
```

Everything renders without env vars (fixtures). Real auth/DB activate when the
Supabase vars are present.

## 5. Mobile (later milestone)

`apps/mobile` is a scaffold. Follow `docs/NATIVE-APP-GUIDE.md`: install Xcode /
Android Studio, `npx expo install`, `expo run:ios` / `expo run:android` in a
development build. EAS profiles are in `apps/mobile/eas.json`.
