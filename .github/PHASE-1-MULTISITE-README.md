# S.H.E. Studio V4 — Phase 1 Multi-Site Foundation

This package starts the agency version of S.H.E. Studio without removing the working V3 editor.

## Included now

- Multi-site database tables (`sites`, `site_members`)
- Site-scoped drafts, media, content, and publish history
- Netlify API to create, list, update, and delete client websites
- Netlify API to read and publish a registered page in each site's own GitHub repository
- Existing V3 visual/media editor remains intact

## Install

1. Replace the deployed project with this package.
2. In Supabase SQL Editor, run `SUPABASE-MULTISITE-PHASE1.sql` once.
3. Keep the existing environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GITHUB_TOKEN`
4. The GitHub token must have access to every client repository you add.
5. Clear cache and deploy in Netlify.

## Next build

Phase 2 connects the new site registry to the visible Studio dashboard:

- website cards
- Add Website form
- site switcher
- dynamic page list
- open pages directly from each client's GitHub repository
- publish to the selected client's repository

The backend foundation in this package is designed for that dashboard.
