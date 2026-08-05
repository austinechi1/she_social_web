# Phase 6 — Automatic Pages + Clean Layers

## Fixed

- Studio rescans the selected GitHub repository every time a website is opened.
- All detected `.html` files are placed in the Page selector.
- A **Refresh pages** button was added inside the editor.
- Detected pages are saved back to the website record in Supabase.
- Page options now show both the friendly page name and exact file path.
- Layers now begin with main structural sections instead of one long flat list.
- Nested semantic sections can be expanded and collapsed.
- Layer labels use cleaner, human-readable names derived from IDs/classes.
- Repeated low-level wrappers are hidden from the default layer view.

## Deploy

Copy the contents of this package into the root of the S.H.E. Studio repository, replace matching files, commit, push, and clear the Netlify deploy cache.

No new SQL or environment variables are required.
