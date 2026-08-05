-- Run once in Supabase > SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.editor_drafts (
  id uuid primary key default gen_random_uuid(),
  page_path text unique not null,
  html text not null,
  updated_by text,
  updated_at timestamptz not null default now()
);
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  storage_path text unique not null,
  public_url text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by text,
  created_at timestamptz not null default now()
);
create table if not exists public.publish_history (
  id uuid primary key default gen_random_uuid(),
  page_path text not null,
  published_by text,
  published_at timestamptz not null default now()
);
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  slug text not null,
  title text,
  data jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(content_type,slug)
);
alter table public.editor_drafts enable row level security;
alter table public.media_assets enable row level security;
alter table public.publish_history enable row level security;
alter table public.content_items enable row level security;
-- No anon/authenticated browser policies are intentionally created.
-- Netlify Functions access these tables with the service-role key after verifying Netlify Identity.
insert into storage.buckets (id,name,public) values ('studio-media','studio-media',true)
on conflict (id) do update set public=true;


-- Backend permissions for Netlify Functions.
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.editor_drafts, public.media_assets, public.publish_history, public.content_items to service_role;
grant usage, select on all sequences in schema public to service_role;
