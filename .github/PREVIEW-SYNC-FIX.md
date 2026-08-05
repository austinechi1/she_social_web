# S.H.E. Studio preview sync fix

This build fixes the Studio preview showing missing logos, images and backgrounds.

The previous iframe used `srcdoc`, which caused relative asset URLs to resolve from `/admin/` instead of from the page being edited. This version inserts a temporary editor-only `<base>` URL while previewing, then removes it before saving or publishing.

## After uploading this build
1. Commit and push all files.
2. Wait for Netlify to publish.
3. Run `SUPABASE-PERMISSIONS-FIX.sql` once in Supabase SQL Editor.
4. Hard-refresh `/admin/`.

The Studio preview should now match the live page assets and styling.
