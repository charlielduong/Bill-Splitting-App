# Divi Server

This directory contains the local Supabase backend configuration:

- `supabase/config.toml` — Docker-backed local service configuration
- `supabase/migrations/` — versioned PostgreSQL schema, functions, and RLS policies
- `supabase/seed.sql` — deterministic six-person Dinner at Barcelona development data

Run the backend from the repository root with `npm run supabase:start`, `npm run supabase:status`, and `npm run supabase:reset`.
