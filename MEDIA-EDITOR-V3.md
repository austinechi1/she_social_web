# S.H.E. Studio Media Editor V3

This release adds full-stack image and media editing on top of the synchronized live-page preview.

## New
- Click existing IMG, VIDEO, SOURCE, or CSS background images.
- Scan every image/background on the current page.
- Replace selected media from Supabase library.
- Upload and immediately replace selected media.
- Paste a direct URL or remove media.
- Correctly handles picture/srcset and video poster/source cases.
- Visible selection outlines inside the preview iframe.
- Searchable Supabase media library.
- Clear save timestamps and publish confirmations.

## Upload note
The direct Netlify Function uploader is intentionally limited to about 4.5 MB per file because function request bodies are size-limited. Use compressed web images.
