# S.H.E. Studio V4 — Phase 2 Agency Dashboard

This build adds the visible multi-site dashboard.

## Included
- My Websites dashboard after login
- Add and manage website records
- Website cards and site switcher
- Dynamic page lists per website
- Load HTML from each website GitHub repository
- Publish edits back to the selected repository
- Site-isolated drafts and media
- Back-to-dashboard navigation

## Install
1. Run `SUPABASE-MULTISITE-PHASE1.sql` in Supabase if not already completed.
2. Copy the contents of this folder into the root of the GitHub repository that deploys S.H.E. Studio.
3. Commit and push.
4. In Netlify, use **Clear cache and deploy site**.
5. Open `/admin/`, sign in, and click **Add Website**.

## Add a website
- Name: client/site name
- GitHub repository: `username/repository`
- Branch: normally `main`
- Live URL: needed so relative images, fonts, CSS, and JavaScript preview correctly
- Pages: one per line, for example `Home | index.html`

The existing `GITHUB_TOKEN` must have access to every repository added to Studio.
