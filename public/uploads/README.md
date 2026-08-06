# public/uploads

Images uploaded through the CMS (`/admin`) land here and get committed to the
repo like any other file — this is Decap CMS's `media_folder`, configured in
`app/admin/config.yml/route.ts`.

This file exists only so the folder isn't empty. Git doesn't track empty
directories, and an empty `media_folder` breaks image uploads the same way an
empty product-category folder breaks the CMS itself (see the "Gotchas"
section in `docs/cms-setup.md`) — Decap's GitHub backend 404s trying to list
a folder with nothing in it, instead of treating that as "no images yet."

If this folder grows large enough that committing images to the repo stops
making sense, that's the point to move to a real asset host and update
`media_folder` / `public_folder` in the config.
