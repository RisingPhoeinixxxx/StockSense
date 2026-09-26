# StockSense Supabase Production Setup

This build is designed around Supabase as the source of truth.

## Architecture
- Supabase Auth: real email/password accounts and secure password recovery.
- `profiles`: private per-user profile data, protected by `auth.uid()` RLS.
- `app_states`: one shared inventory workspace at `id = 'default'` for all authenticated team members.
- Realtime: authenticated clients receive shared inventory changes live.
- No fake/local authentication fallback.
- No demo OTP.

## Supabase SQL
Run the complete `supabase/schema.sql` in Supabase SQL Editor before first use.

## Local environment
Create `.env` beside `package.json`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Never use the `service_role`/secret key in the frontend.

Restart Vite after editing `.env`:

```bash
npm install
npm run dev
```

## Password reset
In Supabase Dashboard -> Authentication -> URL Configuration, add:
- `http://localhost:5173`
- your production URL

The app uses Supabase's secure `resetPasswordForEmail()` recovery flow and `updateUser()` to set the new password.

## Vercel / Netlify
Add these as build/deployment environment variables and redeploy:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Vite injects `VITE_*` variables at build time, so changing them requires a new build/redeploy.

## User and data behavior
- User A and User B have separate profile records.
- User A cannot update User B's profile because of RLS.
- Both authenticated users see the same inventory state.
- Inventory changes are pushed through Supabase Realtime.
- Operation ledger entries use the currently signed-in user's profile name.
- The browser cache is keyed by user ID; remote Supabase state is authoritative.

## Existing installations
The SQL keeps legacy `app_states` rows but the production application only uses `id = 'default'`. The SQL clears `user_id` on that shared row and replaces old user-scoped policies with shared authenticated policies.
