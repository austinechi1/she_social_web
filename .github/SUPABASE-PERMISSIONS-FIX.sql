-- Run once in Supabase > SQL Editor.
-- Grants the Netlify backend role access to every S.H.E. Studio table.

grant usage on schema public to service_role;

grant select, insert, update, delete on table
  public.editor_drafts,
  public.media_assets,
  public.publish_history,
  public.content_items
to service_role;

grant usage, select on all sequences in schema public to service_role;
