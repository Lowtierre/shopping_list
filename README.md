Shopping List (React + Supabase)

React + Vite shopping list with local persistence, Supabase Auth, and per-user bucket persistence on Supabase Postgres.

## Features
- Essentials buckets with checkbox add/remove flow
- Effective list (custom add/remove) and `.txt` export
- Initial auth prompt with login, sign up, or offline mode
- Bucket structural operations (create/delete) persisted to Supabase when authenticated
- LocalStorage fallback when the user continues offline or Supabase is not configured

## Architecture
This app does not need an Express server for the current scope.

- Supabase Auth handles user sessions directly from the browser.
- Supabase Postgres stores user-owned buckets.
- Row Level Security keeps each user scoped to their own rows.
- Vercel only needs to host the static Vite app for now.

Use Vercel Functions later only for privileged operations that require service-role secrets, webhooks, or server-only integrations.

## Run locally
1. Install dependencies:
   - `npm install`
2. Start development server:
   - `npm run dev`

## Environment
Create a local `.env` file and set the same variables in Vercel:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Only use the public anon key in `VITE_*` variables. Never expose the Supabase service role key in this React app.

## Supabase setup
Create the bucket table in the Supabase SQL editor:

```sql
create table public.shopping_buckets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  items text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index shopping_buckets_user_id_idx
  on public.shopping_buckets(user_id);

alter table public.shopping_buckets enable row level security;

create policy "Users can read own buckets"
  on public.shopping_buckets
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create own buckets"
  on public.shopping_buckets
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own buckets"
  on public.shopping_buckets
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own buckets"
  on public.shopping_buckets
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
```

On first authenticated login, the app seeds the default buckets into that user's `shopping_buckets` rows if none exist yet.

## Build
- `npm run build`
- `npm run preview`
