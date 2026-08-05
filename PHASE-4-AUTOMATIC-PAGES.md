# S.H.E. Studio V4 — Phase 4 Automatic Pages

This update scans each connected GitHub repository and automatically detects all HTML pages.

## Install
1. Copy all files into the root of the existing repository.
2. Commit and push.
3. In Netlify, clear cache and deploy.
4. Open `/admin/`, choose Manage on a website, and click Save Website or Scan Repository Now.

No SQL changes or new environment variables are required. `GITHUB_TOKEN` must be able to read the connected repository.
