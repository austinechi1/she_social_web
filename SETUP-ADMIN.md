# S.H.E. Social Admin Setup

The editor is available at `https://she-social.com/admin/` after this repository is deployed.

## One-time Netlify setup

1. In Netlify, open the S.H.E. Social project.
2. Go to **Project configuration → Identity** and select **Enable Identity**.
3. Set registration to **Invite only**.
4. Invite the email address that should be allowed to edit the site.
5. In GitHub, create a fine-grained personal access token with access only to this repository and **Contents: Read and write** permission.
6. In Netlify, go to **Project configuration → Environment variables** and add:
   - `GITHUB_TOKEN` = the fine-grained token
   - `GITHUB_REPO` = `OWNER/REPOSITORY` (example: `username/she_social_web`)
   - `GITHUB_BRANCH` = the production branch, usually `main`
7. Trigger a new deploy.
8. Visit `https://she-social.com/admin/`, accept the invitation, and create the admin password.

## How publishing works

The admin commits page updates and uploaded images to GitHub. Because Netlify is already connected to GitHub, each commit triggers a new deployment automatically.

## Security

Never place GitHub tokens, Netlify passwords, or admin passwords inside repository files. The previous Basic Auth credentials were removed from `_headers`.
