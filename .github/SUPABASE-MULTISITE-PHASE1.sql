-- S.H.E. Studio V4 Phase 1: multi-site foundation
-- Run after SUPABASE-SETUP.sql in Supabase > SQL Editor.

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  github_repo text not null,
  github_branch text not null default 'main',
  live_url text,
  pages jsonb not null default '[{"path":"index.html","name":"Home"}]'::jsonb,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_members (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  email text not null,
  role text not null default 'editor' check (role in ('owner','designer','editor','client')),
  created_at timestamptz not null default now(),
  unique(site_id,email)
);

alter table public.editor_drafts add column if not exists site_id uuid references public.sites(id) on delete cascade;
alter table public.media_assets add column if not exists site_id uuid references public.sites(id) on delete cascade;
alter table public.publish_history add column if not exists site_id uuid references public.sites(id) on delete cascade;
alter table public.content_items add column if not exists site_id uuid references public.sites(id) on delete cascade;

-- Replace single-site uniqueness with site-aware uniqueness.
alter table public.editor_drafts drop constraint if exists editor_drafts_page_path_key;
create unique index if not exists editor_drafts_site_page_key
  on public.editor_drafts(site_id,page_path) nulls not distinct;

alter table public.content_items drop constraint if exists content_items_content_type_slug_key;
create unique index if not exists content_items_site_type_slug_key
  on public.content_items(site_id,content_type,slug) nulls not distinct;

create index if not exists media_assets_site_created_idx on public.media_assets(site_id,created_at desc);
create index if not exists publish_history_site_published_idx on public.publish_history(site_id,published_at desc);
create index if not exists site_members_email_idx on public.site_members(lower(email));

alter table public.sites enable row level security;
alter table public.site_members enable row level security;

grant select, insert, update, delete on table public.sites, public.site_members to service_role;
grant select, insert, update, delete on table public.editor_drafts, public.media_assets, public.publish_history, public.content_items to service_role;
