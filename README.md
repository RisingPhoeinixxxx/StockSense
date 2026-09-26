# StockSense

Production-ready Vite + React + Supabase inventory management UI.

## Architecture
- Supabase Auth for real user accounts and password recovery.
- Per-user `profiles` table protected by RLS.
- Shared inventory workspace in `app_states.id = 'default'`.
- Supabase Realtime for live shared-state updates.
- No fake/demo authentication fallback.

See `SUPABASE_SETUP.md` before running or deploying.
