# Connect S.H.E. Studio to Supabase

## 1. Create the Supabase project
Create a new project in Supabase, then open **SQL Editor**, paste the contents of `SUPABASE-SETUP.sql`, and run it once.

## 2. Copy the server credentials
From Supabase project settings, copy:
- Project URL
- Service role key (secret; never put it in HTML or GitHub)

## 3. Add Netlify environment variables
In the new Netlify site, open **Project configuration → Environment variables** and add:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_MEDIA_BUCKET` = `studio-media`
- Existing GitHub values: `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`

The Supabase service-role key and GitHub token must be available to **Functions**. Trigger a new deploy after saving variables.

## 4. Verify
Open `/admin/`. The badge should change from **Database: checking…** to **Database: connected**.

Test in this order:
1. Open a page.
2. Change a background color or image.
3. Click **Save draft to database**.
4. Refresh and reopen the page; accept the prompt to load the draft.
5. Upload one image under Media.
6. Select an image or section and click the uploaded media card.
7. Publish to GitHub.

## Architecture
- Netlify Identity: admin login
- S.H.E. Studio: visual editor
- Netlify Functions: secure bridge and authorization
- Supabase Postgres: drafts, structured content, publish history, media records
- Supabase Storage: media files
- GitHub: published HTML source
- Netlify: deployment and hosting
