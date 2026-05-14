Shopping List (React + Supabase)

React + Vite shopping list with local persistence, Supabase Auth, per-user bucket persistence, and one saved shopping list per user on Supabase Postgres.

## Features
- Essentials buckets with checkbox add/remove flow
- Effective list (custom add/remove), saved per authenticated user, and `.txt` export
- Initial auth prompt with login, sign up, or offline mode
- Bucket structural operations (create/delete) persisted to Supabase when authenticated
- LocalStorage fallback when the user continues offline or Supabase is not configured

## Architecture
This app does not need an Express server for the current scope.

- Supabase Auth handles user sessions directly from the browser.
- Supabase Postgres stores user-owned buckets and one shopping list row per user.
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
VITE_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
```

Only use the public publishable key in `VITE_*` variables. Never expose the Supabase service role key in this React app.

## Supabase setup
Create the bucket and shopping list tables in the Supabase SQL editor:

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

create table public.shopping_lists (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shopping_lists enable row level security;

create policy "Users can read own shopping list"
  on public.shopping_lists
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create own shopping list"
  on public.shopping_lists
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own shopping list"
  on public.shopping_lists
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
```

`shopping_lists.user_id` is the primary key, so each authenticated user can have only one saved shopping list. The `items` JSONB field stores the effective list objects used by the client (`id`, `name`, `source`, `group`, `createdAt`).

On first authenticated login, the app seeds the default buckets into that user's `shopping_buckets` rows if none exist yet. It also creates the user's single `shopping_lists` row if missing, starting from the current local list.

## Build
- `npm run build`
- `npm run preview`
