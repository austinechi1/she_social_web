# S.H.E. Studio V4 — Phase 5 Connector

This phase adds a one-click **Install Connector** action for every website.

The connector is lightweight and is committed to the selected client repository at:

- `she-studio/config.json`
- `she-studio/manifest.json`
- `she-studio/connector.js`

The central editor remains inside S.H.E. Studio. Client websites do not receive a separate admin panel.

## Install

Copy this package into the S.H.E. Studio repository, commit, push, and clear-cache deploy on Netlify. No new SQL or environment variables are required.

## Use

Open **My Websites → Manage → Install Connector**. The GitHub token must have write access to that client repository.
