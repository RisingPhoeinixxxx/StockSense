# StockSense + Supabase production setup

## 1. Create the Supabase project
Create/open your Supabase project.

## 2. Run the database schema
Open **SQL Editor**, paste the complete contents of `supabase/schema.sql`, and run it once.

This creates:
- `profiles`: private per-user profile records protected by RLS.
- `app_states`: one shared `id = 'default'` inventory workspace.
- A trigger that creates a profile automatically when a user signs up.
- Realtime publication entries for the application tables.

## 3. Configure local development
Create `.env` beside `package.json`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Never use the Supabase `service_role`/secret key in this file or in a frontend deployment.

Restart Vite after changing `.env` because Vite reads environment variables at startup/build time.

```bash
npm install
npm run dev
```

## 4. Password reset
StockSense uses Supabase's secure password-recovery link flow. In Supabase Dashboard go to **Authentication -> URL Configuration** and add your local and production origins, for example:

- `http://localhost:5173`
- `https://YOUR-PRODUCTION-DOMAIN`

The app redirects the user back to the current origin after the reset link is opened.

## 5. Vercel / Netlify
Add these two environment variables to the hosting project for the environments you deploy:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Then redeploy. Do not upload `.env` to GitHub.

## 6. Data behavior
- Profiles are private: User A cannot read or update User B's profile through Supabase RLS.
- Inventory is shared: authenticated users read/write the same `app_states.id = 'default'` row.
- Every operation stores the signed-in user's display name in the client-side ledger state.
- Realtime pushes inventory state changes to other authenticated clients.

## 7. If the app says Supabase is not configured
Check that `.env` is in the same folder as `package.json`, the variable names start with `VITE_`, and Vite was restarted after editing the file. For a deployed build, check the hosting provider's environment variables and redeploy.
